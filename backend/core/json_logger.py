import json
import os
from datetime import datetime
from sqlalchemy.orm import Session
from database.db import TicketDB

def log_admin_login(agent_id: int, name: str, email: str):
    """
    Log a successful admin login event to the JSON log.
    Appends to backend/admin_logins.json.
    """
    try:
        filepath = os.path.join(os.path.dirname(__file__), "..", "..", "data", "admin_logins.json")
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        log_entry = {
            "agent_id": agent_id,
            "name": name,
            "email": email,
            "login_time": datetime.utcnow().isoformat()
        }
        
        logins = []
        if os.path.exists(filepath):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    logins = json.load(f)
                    if not isinstance(logins, list):
                        logins = []
            except Exception:
                logins = []
                
        logins.append(log_entry)
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(logins, f, indent=4, ensure_ascii=False)
        print(f"👤 Logged admin login: {email} at {log_entry['login_time']}")
    except Exception as e:
        print(f"❌ Error logging admin login: {e}")


def sync_tickets_to_json(db: Session):
    """
    Generate a complete formatted JSON snapshot of all tickets inside database.
    Writes to backend/tickets_data.json.
    """
    try:
        tickets = db.query(TicketDB).all()
        formatted = []
        for t in tickets:
            formatted.append({
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "priority": t.priority,
                "status": t.status,
                "category": t.category,
                "confidence_score": t.confidence_score,
                "ai_solution": t.ai_solution,
                "explanation": t.explanation,
                "submitted_by": t.submitted_by,
                "assigned_to": t.assigned_to,
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "updated_at": t.updated_at.isoformat() if t.updated_at else None,
            })
            
        filepath = os.path.join(os.path.dirname(__file__), "..", "..", "data", "tickets_data.json")
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(formatted, f, indent=4, ensure_ascii=False)
        print(f"🎫 Synchronized {len(formatted)} tickets to tickets_data.json")
    except Exception as e:
        print(f"❌ Error syncing tickets to JSON: {e}")
