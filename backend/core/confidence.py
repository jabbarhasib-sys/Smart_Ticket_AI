from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Confidence thresholds — this is the HITL logic!
AUTO_RESOLVE_THRESHOLD = 0.85      # Above this → Auto resolve
HUMAN_REVIEW_THRESHOLD = 0.60      # Below this → Always send to human
# Between 0.60 and 0.85 → AI suggests but human confirms

CONFIDENCE_PROMPT = """You are an AI confidence evaluator for IT support tickets.
Analyze this ticket and provide a confidence score for how well you can resolve it.

Consider these factors:
1. Is this a common/repetitive issue with known solutions?
2. How clear and specific is the description?
3. Does it require physical intervention or on-site presence?
4. Is it a critical business-impacting issue?
5. Are there security or compliance implications?

You MUST respond with ONLY a valid JSON object — no extra text.

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
    """
    Calculates AI confidence score for resolving a ticket.
    This drives the HITL decision — auto resolve or escalate.
    """
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

        # Clean markdown if present
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        result = json.loads(raw)

        # Force low confidence for critical + security tickets
        score = float(result.get("confidence_score", 0.5))
        if priority == "critical":
            score = min(score, 0.75)
        if result.get("is_security_sensitive", False):
            score = min(score, 0.70)
        if result.get("requires_physical_access", False):
            score = min(score, 0.65)

        # Clamp score between 0 and 1
        score = max(0.0, min(1.0, score))

        # HITL Decision Logic
        if score >= AUTO_RESOLVE_THRESHOLD:
            decision = "auto_resolve"
            decision_reason = "High confidence — AI can resolve automatically"
        elif score >= HUMAN_REVIEW_THRESHOLD:
            decision = "ai_suggest_human_confirm"
            decision_reason = "Medium confidence — AI suggests solution, human confirms"
        else:
            decision = "escalate_to_human"
            decision_reason = "Low confidence — requires human expertise"

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
    """Fallback confidence when AI fails"""
    score = 0.50
    if priority == "critical":
        score = 0.30
    return {
        "success": False,
        "confidence_score": score,
        "decision": "escalate_to_human",
        "decision_reason": "Unable to evaluate — escalating to human as precaution",
        "reasoning": "AI evaluation failed",
        "risk_factors": ["evaluation_failed"],
        "is_repetitive_pattern": False,
        "requires_physical_access": False,
        "is_security_sensitive": False
    }


def get_confidence_label(score: float) -> str:
    """Returns a human-readable confidence label"""
    if score >= 0.85:
        return "Very High"
    elif score >= 0.70:
        return "High"
    elif score >= 0.60:
        return "Medium"
    elif score >= 0.40:
        return "Low"
    else:
        return "Very Low"
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Confidence thresholds — this is the HITL logic!
AUTO_RESOLVE_THRESHOLD = 0.85      # Above this → Auto resolve
HUMAN_REVIEW_THRESHOLD = 0.60      # Below this → Always send to human
# Between 0.60 and 0.85 → AI suggests but human confirms

CONFIDENCE_PROMPT = """You are an AI confidence evaluator for IT support tickets.
Analyze this ticket and provide a confidence score for how well you can resolve it.

Consider these factors:
1. Is this a common/repetitive issue with known solutions?
2. How clear and specific is the description?
3. Does it require physical intervention or on-site presence?
4. Is it a critical business-impacting issue?
5. Are there security or compliance implications?

You MUST respond with ONLY a valid JSON object — no extra text.

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
    """
    Calculates AI confidence score for resolving a ticket.
    This drives the HITL decision — auto resolve or escalate.
    """
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

        # Clean markdown if present
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        result = json.loads(raw)

        # Force low confidence for critical + security tickets
        score = float(result.get("confidence_score", 0.5))
        if priority == "critical":
            score = min(score, 0.75)
        if result.get("is_security_sensitive", False):
            score = min(score, 0.70)
        if result.get("requires_physical_access", False):
            score = min(score, 0.65)

        # Clamp score between 0 and 1
        score = max(0.0, min(1.0, score))

        # HITL Decision Logic
        if score >= AUTO_RESOLVE_THRESHOLD:
            decision = "auto_resolve"
            decision_reason = "High confidence — AI can resolve automatically"
        elif score >= HUMAN_REVIEW_THRESHOLD:
            decision = "ai_suggest_human_confirm"
            decision_reason = "Medium confidence — AI suggests solution, human confirms"
        else:
            decision = "escalate_to_human"
            decision_reason = "Low confidence — requires human expertise"

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
    """Fallback confidence when AI fails"""
    score = 0.50
    if priority == "critical":
        score = 0.30
    return {
        "success": False,
        "confidence_score": score,
        "decision": "escalate_to_human",
        "decision_reason": "Unable to evaluate — escalating to human as precaution",
        "reasoning": "AI evaluation failed",
        "risk_factors": ["evaluation_failed"],
        "is_repetitive_pattern": False,
        "requires_physical_access": False,
        "is_security_sensitive": False
    }


def get_confidence_label(score: float) -> str:
    """Returns a human-readable confidence label"""
    if score >= 0.85:
        return "Very High"
    elif score >= 0.70:
        return "High"
    elif score >= 0.60:
        return "Medium"
    elif score >= 0.40:
        return "Low"
    else:
        return "Very Low"