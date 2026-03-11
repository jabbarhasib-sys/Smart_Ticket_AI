import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db, TicketDB, AuditLogDB
from models.schemas import TicketCreate, TicketResponse, HumanResolution
from core.decision_engine import process_ticket
from datetime import datetime
from typing import List

router = APIRouter(prefix="/tickets", tags=["Tickets"])


# ── CREATE NEW TICKET ─────────────────────────────────────
@router.post("/", response_model=dict)
async def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    """
    Creates a new ticket and immediately runs AI pipeline on it.
    AI will classify, score confidence, generate solution and decide HITL.
    """
    try:
        # Save ticket to DB
        new_ticket = TicketDB(
            title=ticket.title,
            description=ticket.description,
            priority=ticket.priority,
            status="open",
            submitted_by=ticket.submitted_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)

        # Log ticket creation
        audit = AuditLogDB(
            ticket_id=new_ticket.id,
            action="TICKET_CREATED",
            performed_by=ticket.submitted_by,
            details=f"Priority: {ticket.priority}",
            timestamp=datetime.utcnow()
        )
        db.add(audit)
        db.commit()

        # Run AI pipeline immediately
        print(f"🚀 Running AI pipeline for ticket #{new_ticket.id}")
        ai_result = process_ticket(new_ticket.id)

        return {
            "success": True,
            "ticket_id": new_ticket.id,
            "message": "Ticket created and processed by AI",
            "ai_result": ai_result
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ── GET ALL TICKETS ───────────────────────────────────────
@router.get("/", response_model=List[dict])
async def get_all_tickets(
    status: str = None,
    priority: str = None,
    category: str = None,
    db: Session = Depends(get_db)
):
    """Get all tickets with optional filters"""
    query = db.query(TicketDB)

    if status:
        query = query.filter(TicketDB.status == status)
    if priority:
        query = query.filter(TicketDB.priority == priority)
    if category:
        query = query.filter(TicketDB.category == category)

    tickets = query.order_by(TicketDB.created_at.desc()).all()

    return [_format_ticket(t) for t in tickets]


# ── GET SINGLE TICKET ─────────────────────────────────────
@router.get("/{ticket_id}", response_model=dict)
async def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Get a single ticket with full AI analysis details"""
    ticket = db.query(TicketDB).filter(TicketDB.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return _format_ticket(ticket)


# ── REPROCESS TICKET WITH AI ──────────────────────────────
@router.post("/{ticket_id}/process", response_model=dict)
async def reprocess_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Manually trigger AI pipeline on an existing ticket"""
    ticket = db.query(TicketDB).filter(TicketDB.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    result = process_ticket(ticket_id)
    return {
        "success": True,
        "message": f"Ticket #{ticket_id} reprocessed",
        "result": result
    }


# ── HUMAN RESOLVES TICKET ─────────────────────────────────
@router.post("/{ticket_id}/resolve", response_model=dict)
async def human_resolve_ticket(
    ticket_id: int,
    resolution: HumanResolution,
    db: Session = Depends(get_db)
):
    ticket = db.query(TicketDB).filter(TicketDB.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = "human_resolved"
    ticket.ai_solution = resolution.solution
    ticket.assigned_to = resolution.resolved_by
    ticket.updated_at = datetime.utcnow()

    audit = AuditLogDB(
        ticket_id=ticket_id,
        action="HUMAN_RESOLVED",
        performed_by=resolution.resolved_by,
        details=resolution.notes or "Resolved by human agent",
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    # Send email notification
    email_sent = send_resolution_email(
        to_email=ticket.submitted_by,
        ticket_id=ticket_id,
        title=ticket.title,
        solution=resolution.solution
    )

    return {
        "success": True,
        "message": f"Ticket #{ticket_id} resolved",
        "email_sent": email_sent
    }


def send_resolution_email(to_email: str, ticket_id: int, title: str, solution: str) -> bool:
    try:
        sender = os.getenv("EMAIL_SENDER")
        password = os.getenv("EMAIL_PASSWORD")
        if not sender or not password:
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"✅ Your Support Ticket #{ticket_id} Has Been Resolved"
        msg["From"] = sender
        msg["To"] = to_email

        html = f"""
        <html><body style="font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:32px;">
        <div style="max-width:600px;margin:auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid #6366f1;">
            <div style="text-align:center;margin-bottom:24px;">
                <div style="font-size:48px;">✅</div>
                <h1 style="color:#6366f1;margin:8px 0;">Ticket Resolved!</h1>
            </div>
            <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:16px;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">TICKET #{ticket_id}</p>
                <p style="color:#f1f5f9;font-size:18px;font-weight:bold;margin:8px 0;">{title}</p>
            </div>
            <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:24px;border-left:3px solid #6366f1;">
                <p style="color:#94a3b8;font-size:12px;margin:0 0 8px 0;">RESOLUTION</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0;">{solution}</p>
            </div>
            <p style="color:#475569;font-size:12px;text-align:center;">
                Powered by Smart Ticket AI 🤖
            </p>
        </div>
        </body></html>
        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.sendmail(sender, to_email, msg.as_string())

        print(f"✅ Email sent to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Email error: {e}")
        return False

# ── GET TICKET AUDIT TRAIL ────────────────────────────────
@router.get("/{ticket_id}/audit", response_model=List[dict])
async def get_ticket_audit(ticket_id: int, db: Session = Depends(get_db)):
    """Get full audit trail for a ticket"""
    logs = db.query(AuditLogDB)\
        .filter(AuditLogDB.ticket_id == ticket_id)\
        .order_by(AuditLogDB.timestamp.asc())\
        .all()

    return [
        {
            "id": log.id,
            "action": log.action,
            "performed_by": log.performed_by,
            "details": log.details,
            "timestamp": log.timestamp.isoformat()
        }
        for log in logs
    ]


# ── HELPER ────────────────────────────────────────────────
def _format_ticket(ticket: TicketDB) -> dict:
    return {
        "id": ticket.id,
        "title": ticket.title,
        "description": ticket.description,
        "priority": ticket.priority,
        "status": ticket.status,
        "category": ticket.category,
        "confidence_score": ticket.confidence_score,
        "ai_solution": ticket.ai_solution,
        "explanation": ticket.explanation,
        "submitted_by": ticket.submitted_by,
        "assigned_to": ticket.assigned_to,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None
    }