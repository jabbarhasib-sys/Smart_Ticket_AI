import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import requests


def email_configured() -> bool:
    return bool(os.getenv("EMAIL_SENDER") and os.getenv("EMAIL_PASSWORD"))


def sms_configured() -> bool:
    return bool(
        os.getenv("TWILIO_ACCOUNT_SID")
        and os.getenv("TWILIO_AUTH_TOKEN")
        and os.getenv("TWILIO_PHONE_NUMBER")
    )


def send_html_email(to_email: str, subject: str, html: str) -> bool:
    try:
        sender = os.getenv("EMAIL_SENDER")
        password = os.getenv("EMAIL_PASSWORD")
        if not sender or not password:
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = to_email
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.sendmail(sender, to_email, msg.as_string())

        print(f"Email sent to {to_email}")
        return True
    except Exception as error:
        print(f"Email error: {error}")
        return False


def send_sms_otp(phone_number: str, otp_code: str) -> bool:
    try:
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        from_number = os.getenv("TWILIO_PHONE_NUMBER")
        if not account_sid or not auth_token or not from_number:
            return False

        response = requests.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
            auth=(account_sid, auth_token),
            data={
                "From": from_number,
                "To": phone_number,
                "Body": f"Your Smart Ticket AI OTP is {otp_code}. It expires in 10 minutes.",
            },
            timeout=15,
        )
        if response.status_code >= 400:
            print(f"SMS error: {response.text}")
            return False

        print(f"SMS sent to {phone_number}")
        return True
    except Exception as error:
        print(f"SMS error: {error}")
        return False


def send_otp_email(to_email: str, otp_code: str) -> bool:
    subject = "Your Smart Ticket AI OTP"
    html = f"""
    <html><body style="font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:32px;">
    <div style="max-width:600px;margin:auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid #c96b6b;">
        <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:42px;">🔐</div>
            <h1 style="color:#f8d5d2;margin:8px 0;">Verify Your Sign In</h1>
            <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
                Use the OTP below to continue into your Smart Ticket AI user profile.
            </p>
        </div>
        <div style="background:#0f172a;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center;border:1px dashed #c96b6b;">
            <div style="color:#94a3b8;font-size:12px;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">One-time password</div>
            <div style="font-size:34px;font-weight:bold;letter-spacing:8px;color:#ffffff;">{otp_code}</div>
        </div>
        <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">
            This OTP expires in 10 minutes. If you did not request this code, you can ignore this email.
        </p>
    </div>
    </body></html>
    """
    return send_html_email(to_email, subject, html)


def send_ai_response_email(to_email: str, ticket_id: int, title: str, solution: str, status: str) -> bool:
    subject = f"AI response for your ticket #{ticket_id}"
    status_label = {
        "auto_resolved": "Auto Resolved by AI",
        "pending_human": "AI Response Generated - Human Review May Follow",
        "human_resolved": "Resolved",
        "open": "Open",
    }.get(status, status.replace("_", " ").title())

    html = f"""
    <html><body style="font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:32px;">
    <div style="max-width:640px;margin:auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid #6366f1;">
        <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:42px;">🤖</div>
            <h1 style="color:#c7d2fe;margin:8px 0;">Your AI Ticket Response Is Ready</h1>
            <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
                The AI agent has processed your ticket and generated the current response below.
            </p>
        </div>
        <div style="background:#0f172a;border-radius:10px;padding:16px;margin-bottom:16px;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">TICKET #{ticket_id}</p>
            <p style="color:#f1f5f9;font-size:18px;font-weight:bold;margin:8px 0;">{title}</p>
            <p style="color:#cbd5e1;font-size:13px;margin:0;">Current status: {status_label}</p>
        </div>
        <div style="background:#0f172a;border-radius:10px;padding:16px;margin-bottom:20px;border-left:3px solid #6366f1;">
            <p style="color:#94a3b8;font-size:12px;margin:0 0 8px 0;">AI RESPONSE</p>
            <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;white-space:pre-line;">{solution}</p>
        </div>
        <p style="color:#475569;font-size:12px;text-align:center;margin:0;">
            You can also view this response inside your Smart Ticket AI profile.
        </p>
    </div>
    </body></html>
    """
    return send_html_email(to_email, subject, html)


def send_resolution_email(to_email: str, ticket_id: int, title: str, solution: str) -> bool:
    subject = f"Your support ticket #{ticket_id} has been resolved"
    html = f"""
    <html><body style="font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:32px;">
    <div style="max-width:600px;margin:auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid #6366f1;">
        <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:48px;">✅</div>
            <h1 style="color:#6366f1;margin:8px 0;">Ticket Resolved</h1>
        </div>
        <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:16px;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">TICKET #{ticket_id}</p>
            <p style="color:#f1f5f9;font-size:18px;font-weight:bold;margin:8px 0;">{title}</p>
        </div>
        <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:24px;border-left:3px solid #6366f1;">
            <p style="color:#94a3b8;font-size:12px;margin:0 0 8px 0;">FINAL RESOLUTION</p>
            <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0;white-space:pre-line;">{solution}</p>
        </div>
        <p style="color:#475569;font-size:12px;text-align:center;">
            Powered by Smart Ticket AI
        </p>
    </div>
    </body></html>
    """
    return send_html_email(to_email, subject, html)
