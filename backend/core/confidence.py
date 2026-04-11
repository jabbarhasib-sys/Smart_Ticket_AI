from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── THRESHOLDS ──────────────────────────────────
AUTO_RESOLVE_THRESHOLD = 0.75
HUMAN_REVIEW_THRESHOLD = 0.50

CONFIDENCE_PROMPT = """You are an AI confidence evaluator for IT support tickets.
Analyze this ticket and provide a confidence score.

IMPORTANT SCORING GUIDE — follow this strictly:
- VPN issues, WiFi problems, internet connectivity → score 0.82 to 0.92
- Password reset, forgotten credentials → score 0.85 to 0.95
- Printer offline, printer not working → score 0.80 to 0.90
- Software not opening, license errors → score 0.78 to 0.88
- Access requests, shared drive access → score 0.80 to 0.90
- Email not syncing, mobile email issues → score 0.75 to 0.85
- Slow laptop, performance issues → score 0.62 to 0.75
- Hardware issues needing physical check → score 0.45 to 0.65
- Security incidents, ransomware, breach → score 0.15 to 0.40
- Critical business-wide outages → score 0.10 to 0.35
- Non-IT issues (coffee machine, chair) → score 0.30 to 0.55

You MUST respond with ONLY a valid JSON object — no extra text, no markdown.

{{
    "confidence_score": 0.0 to 1.0,
    "reasoning": "brief explanation of confidence level",
    "risk_factors": ["factor1", "factor2"],
    "is_repetitive_pattern": true or false,
    "requires_physical_access": true or false,
    "is_security_sensitive": true or false
}}

Ticket Title: {title}
Ticket Description: {description}
Category: {category}
Priority: {priority}
"""

def calculate_confidence(
    title: str,
    description: str,
    category: str,
    priority: str
) -> dict:
    try:
        prompt = CONFIDENCE_PROMPT.format(
            title=title,
            description=description,
            category=category,
            priority=priority
        )

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a confidence evaluator. Always respond with valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            max_tokens=400
        )

        raw = response.choices[0].message.content.strip()

        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        result = json.loads(raw)

        score = float(result.get("confidence_score", 0.5))

        # ── RISK PENALTIES ───────────────────────────────
        if priority == "critical":
            score = min(score, 0.70)
        if result.get("is_security_sensitive", False):
            score = min(score, 0.65)
        if result.get("requires_physical_access", False):
            score = min(score, 0.60)

        # Clamp
        score = max(0.0, min(1.0, score))

        # ── HITL DECISION ────────────────────────────────
        if score >= AUTO_RESOLVE_THRESHOLD:
            decision = "auto_resolve"
            decision_reason = f"High confidence ({score}) — AI resolves automatically"
        elif score >= HUMAN_REVIEW_THRESHOLD:
            decision = "ai_suggest_human_confirm"
            decision_reason = f"Medium confidence ({score}) — human confirmation needed"
        else:
            decision = "escalate_to_human"
            decision_reason = f"Low confidence ({score}) — requires human expertise"

        return {
            "success": True,
            "confidence_score": round(score, 2),
            "decision": decision,
            "decision_reason": decision_reason,
            "reasoning": result.get("reasoning", ""),
            "risk_factors": result.get("risk_factors", []),
            "is_repetitive_pattern": result.get("is_repetitive_pattern", False),
            "requires_physical_access": result.get("requires_physical_access", False),
            "is_security_sensitive": result.get("is_security_sensitive", False)
        }

    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}")
        return _default_confidence(priority)

    except Exception as e:
        print(f"❌ Confidence error: {e}")
        return _default_confidence(priority)


def _default_confidence(priority: str) -> dict:
    score = 0.50
    if priority == "critical":
        score = 0.30
    return {
        "success": False,
        "confidence_score": score,
        "decision": "escalate_to_human",
        "decision_reason": "Unable to evaluate — escalating to human",
        "reasoning": "AI evaluation failed",
        "risk_factors": ["evaluation_failed"],
        "is_repetitive_pattern": False,
        "requires_physical_access": False,
        "is_security_sensitive": False
    }


def get_confidence_label(score: float) -> str:
    if score >= 0.75:
        return "Very High"
    elif score >= 0.65:
        return "High"
    elif score >= 0.50:
        return "Medium"
    elif score >= 0.35:
        return "Low"
    else:
        return "Very Low"