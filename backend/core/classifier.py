from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

CATEGORIES = ["network", "software", "hardware", "access", "performance", "other"]

CLASSIFIER_PROMPT = """You are an expert IT support ticket classifier.
Analyze the given support ticket and classify it.

You MUST respond with ONLY a valid JSON object — no extra text, no markdown.

Respond in this exact format:
{{
    "category": "one of: network, software, hardware, access, performance, other",
    "priority_suggestion": "one of: low, medium, high, critical",
    "key_issues": ["issue1", "issue2"],
    "similar_pattern": "brief description of the pattern you recognized"
}}

Ticket Title: {title}
Ticket Description: {description}
Current Priority: {priority}
"""

def classify_ticket(title: str, description: str, priority: str) -> dict:
    """
    Uses Groq LLM to classify a support ticket into a category.
    Returns category, priority suggestion, key issues, and pattern.
    """
    try:
        prompt = CLASSIFIER_PROMPT.format(
            title=title,
            description=description,
            priority=priority
        )

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are an IT support classifier. Always respond with valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            max_tokens=300
        )

        raw = response.choices[0].message.content.strip()

        # Clean up if model adds markdown
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        result = json.loads(raw)

        # Validate category
        if result.get("category") not in CATEGORIES:
            result["category"] = "other"

        return {
            "success": True,
            "category": result.get("category", "other"),
            "priority_suggestion": result.get("priority_suggestion", priority),
            "key_issues": result.get("key_issues", []),
            "similar_pattern": result.get("similar_pattern", "")
        }

    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}")
        return {
            "success": False,
            "category": "other",
            "priority_suggestion": priority,
            "key_issues": [],
            "similar_pattern": ""
        }

    except Exception as e:
        print(f"❌ Classifier error: {e}")
        return {
            "success": False,
            "category": "other",
            "priority_suggestion": priority,
            "key_issues": [],
            "similar_pattern": ""
        }