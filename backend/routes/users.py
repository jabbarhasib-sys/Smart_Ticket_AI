import re
from datetime import datetime, timedelta
from random import randint

from fastapi import APIRouter, HTTPException

from core.mailer import email_configured, send_otp_email, send_sms_otp, sms_configured
from models.schemas import UserOtpRequest, UserOtpVerify

router = APIRouter(prefix="/users", tags=["Users"])

OTP_EXPIRY_MINUTES = 10
OTP_STORE = {}


def _cleanup_expired_otps():
    now = datetime.utcnow()
    expired_keys = [key for key, payload in OTP_STORE.items() if payload["expires_at"] <= now]
    for key in expired_keys:
        OTP_STORE.pop(key, None)


def _generate_otp() -> str:
    return str(randint(100000, 999999))


def _normalize_email(email: str | None) -> str:
    return (email or "").strip().lower()


def _normalize_phone_number(phone_number: str | None) -> str:
    raw = (phone_number or "").strip().replace(" ", "")
    if raw.startswith("00"):
        raw = f"+{raw[2:]}"
    if raw and not raw.startswith("+"):
        raw = f"+{raw}"
    return raw


def _is_valid_email(email: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email))


def _is_valid_phone_number(phone_number: str) -> bool:
    return bool(re.match(r"^\+\d{10,15}$", phone_number))


def _build_store_key(provider: str, value: str) -> str:
    return f"{provider}:{value}"


@router.post("/request-otp", response_model=dict)
async def request_user_otp(payload: UserOtpRequest):
    provider = payload.provider.strip().lower()
    email = _normalize_email(payload.email)
    phone_number = _normalize_phone_number(payload.phone_number)

    if provider not in {"email", "gmail", "phone"}:
        raise HTTPException(status_code=400, detail="Unsupported login provider")

    if provider in {"email", "gmail"}:
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        if not _is_valid_email(email):
            raise HTTPException(status_code=400, detail="Enter a valid email address")
        if provider == "gmail" and not email.endswith("@gmail.com"):
            raise HTTPException(status_code=400, detail="Please use a Gmail address for Gmail sign in")
        if not email_configured():
            raise HTTPException(
                status_code=503,
                detail="Email OTP is not configured on the server. Set EMAIL_SENDER and a Gmail app password in backend/.env.",
            )
        target_value = email
    else:
        if not phone_number:
            raise HTTPException(status_code=400, detail="Phone number is required")
        if not _is_valid_phone_number(phone_number):
            raise HTTPException(status_code=400, detail="Enter a valid phone number with country code, for example +919876543210")
        if not sms_configured():
            raise HTTPException(
                status_code=503,
                detail="Phone OTP is not configured on the server yet. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in backend/.env.",
            )
        target_value = phone_number

    _cleanup_expired_otps()
    otp = _generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)
    store_key = _build_store_key(provider, target_value)
    OTP_STORE[store_key] = {
        "otp": otp,
        "expires_at": expires_at,
    }

    sent = send_otp_email(email, otp) if provider in {"email", "gmail"} else send_sms_otp(phone_number, otp)
    if not sent:
        OTP_STORE.pop(store_key, None)
        if provider == "phone":
            raise HTTPException(status_code=503, detail="OTP SMS could not be sent. Please check the SMS provider configuration.")
        raise HTTPException(
            status_code=503,
            detail="OTP email could not be sent. If you use Gmail, EMAIL_PASSWORD must be a Gmail app password in backend/.env.",
        )

    return {
        "success": True,
        "message": f"OTP sent to {target_value}",
        "provider": provider,
        "expires_in_minutes": OTP_EXPIRY_MINUTES,
    }


@router.post("/verify-otp", response_model=dict)
async def verify_user_otp(payload: UserOtpVerify):
    email = _normalize_email(payload.email)
    phone_number = _normalize_phone_number(payload.phone_number)
    otp = payload.otp.strip()

    provider = "email" if email else "phone"
    target_value = email or phone_number
    if not target_value:
        raise HTTPException(status_code=400, detail="Email or phone number is required")

    if provider == "email":
        keys = [
            _build_store_key("email", target_value),
            _build_store_key("gmail", target_value),
        ]
    else:
        keys = [_build_store_key("phone", target_value)]

    _cleanup_expired_otps()

    stored = None
    matched_key = None
    for key in keys:
        if key in OTP_STORE:
            stored = OTP_STORE[key]
            matched_key = key
            break

    if not stored:
        raise HTTPException(status_code=404, detail="OTP not found or expired. Please request a new code.")
    if stored["otp"] != otp:
        raise HTTPException(status_code=401, detail="Incorrect OTP")

    OTP_STORE.pop(matched_key, None)
    return {
        "success": True,
        "message": "OTP verified successfully",
        "email": email or None,
        "phone_number": phone_number or None,
    }
