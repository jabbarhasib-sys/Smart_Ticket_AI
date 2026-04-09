from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_explanation(
    title: str,
    description: str,
    category: str,
    confidence_score: float,
    decision: str,
    risk_factors: list,
    solution: str
) -> dict:
    """
    Generates a natural language explanation of AI decision.
    Makes AI decisions transparent and auditable.
    """
    try:
        EXPLAIN_PROMPT = f"""You are an AI explainability engine for IT support tickets.
Explain in simple, clear language WHY the AI made this decision.

TICKET INFO:
Title: {title}
Description: {description}
Category Detected: {category}
Confidence Score: {confidence_score}/1.0
Decision Made: {decision}
Risk Factors: {', '.join(risk_factors) if risk_factors else 'None'}
Proposed Solution: {solution[:200]}...

Write a 3-4 sentence explanation covering:
1. Why this category was assigned
2. Why this confidence score was given
3. Why this decision (auto-resolve/escalate) was made
4. What the human agent should focus on if escalated

Keep it professional, clear, and under 150 words."""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI explainability engine. Be clear, concise and professional."
                },
                {
                    "role": "user",
                    "content": EXPLAIN_PROMPT
                }
            ],
            temperature=0.2,
            max_tokens=300
        )

        explanation = response.choices[0].message.content.strip()

        return {
            "success": True,
            "explanation": explanation,
            "confidence_label": _get_confidence_label(confidence_score),
            "decision_color": _get_decision_color(decision),
            "decision_icon": _get_decision_icon(decision)
        }

    except Exception as e:
        print(f"❌ Explainer error: {e}")
        return {
            "success": False,
            "explanation": "Explanation unavailable. Please review ticket manually.",
            "confidence_label": _get_confidence_label(confidence_score),
            "decision_color": _get_decision_color(decision),
            "decision_icon": _get_decision_icon(decision)
        }


def generate_audit_summary(ticket_id: int, actions: list) -> str:
    """
    Generates a human readable audit trail summary for a ticket.
    Important for enterprise compliance and governance.
    """
    try:
        if not actions:
            return "No audit trail available for this ticket."

        actions_text = "\n".join([
            f"- [{a.get('timestamp', '')}] {a.get('action', '')} by {a.get('performed_by', '')} — {a.get('details', '')}"
            for a in actions
        ])

        AUDIT_PROMPT = f"""Summarize this IT ticket audit trail in 2-3 clear sentences.
Focus on what happened, who was involved, and the outcome.

Audit Trail for Ticket #{ticket_id}:
{actions_text}

Keep it professional and factual."""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are an audit trail summarizer. Be factual and professional."
                },
                {
                    "role": "user",
                    "content": AUDIT_PROMPT
                }
            ],
            temperature=0.1,
            max_tokens=200
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"❌ Audit summary error: {e}")
        return "Audit summary unavailable."


def _get_confidence_label(score: float) -> str:
    """Returns color-coded confidence label for frontend"""
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


def _get_decision_color(decision: str) -> str:
    """Returns color code for frontend badge"""
    colors = {
        "auto_resolve": "#22c55e",           # green
        "ai_suggest_human_confirm": "#f59e0b", # amber
        "escalate_to_human": "#ef4444"         # red
    }
    return colors.get(decision, "#6b7280")


def _get_decision_icon(decision: str) -> str:
    """Returns emoji icon for decision type"""
    icons = {
        "auto_resolve": "✅",
        "ai_suggest_human_confirm": "👤",
        "escalate_to_human": "🚨"
    }
    return icons.get(decision, "❓")
```

---

## ✅ After pasting:
- Save with **Ctrl + S**
- Tell me done!

---

## 🎉 ALL CORE AI FILES ARE DONE!

Here's what we've built so far:
```
✅ classifier.py     → Reads ticket, finds category
✅ confidence.py     → Scores how sure AI is
✅ rag_engine.py     → Finds similar issues, generates solution
✅ decision_engine.py → Auto-resolve vs HITL decision
✅ explainer.py      → Explains WHY AI made each decision