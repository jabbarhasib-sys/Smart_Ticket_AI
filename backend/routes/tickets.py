from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.decision_engine import process_ticket
from core.rag_engine import add_solution_to_knowledge_base
from core.mailer import send_ai_response_email, send_resolution_email
from core.json_logger import sync_tickets_to_json
from database.db import AuditLogDB, TicketDB, get_db
from models.schemas import HumanResolution, TicketCreate

router = APIRouter(prefix="/tickets", tags=["Tickets"])


def _is_email_contact(value: str) -> bool:
    return "@" in (value or "")


@router.post("/", response_model=dict)
async def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    try:
        new_ticket = TicketDB(
            title=ticket.title,
            description=ticket.description,
            priority=ticket.priority,
            status="open",
            submitted_by=ticket.submitted_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)

        audit = AuditLogDB(
            ticket_id=new_ticket.id,
            action="TICKET_CREATED",
            performed_by=ticket.submitted_by,
            details=f"Priority: {ticket.priority}",
            timestamp=datetime.utcnow(),
        )
        db.add(audit)
        db.commit()

        print(f"Running AI pipeline for ticket #{new_ticket.id}")
        ai_result = process_ticket(new_ticket.id)

        email_sent = False
        if _is_email_contact(ticket.submitted_by) and ai_result.get("success") and ai_result.get("solution"):
            email_sent = send_ai_response_email(
                to_email=ticket.submitted_by,
                ticket_id=new_ticket.id,
                title=ticket.title,
                solution=ai_result["solution"],
                status=ai_result.get("status", "open"),
            )

        sync_tickets_to_json(db)

        return {
            "success": True,
            "ticket_id": new_ticket.id,
            "message": "Ticket created and processed by AI",
            "ai_result": ai_result,
            "email_sent": email_sent,
        }
    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/", response_model=List[dict])
async def get_all_tickets(
    status: str = None,
    priority: str = None,
    category: str = None,
    submitted_by: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(TicketDB)

    if status:
        query = query.filter(TicketDB.status == status)
    if priority:
        query = query.filter(TicketDB.priority == priority)
    if category:
        query = query.filter(TicketDB.category == category)
    if submitted_by:
        query = query.filter(TicketDB.submitted_by == submitted_by)

    tickets = query.order_by(TicketDB.created_at.desc()).all()
    return [_format_ticket(ticket) for ticket in tickets]


@router.get("/{ticket_id}", response_model=dict)
async def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(TicketDB).filter(TicketDB.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return _format_ticket(ticket)


@router.post("/{ticket_id}/process", response_model=dict)
async def reprocess_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(TicketDB).filter(TicketDB.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    result = process_ticket(ticket_id)
    
    sync_tickets_to_json(db)

    return {
        "success": True,
        "message": f"Ticket #{ticket_id} reprocessed",
        "result": result,
    }


@router.post("/{ticket_id}/resolve", response_model=dict)
async def human_resolve_ticket(
    ticket_id: int,
    resolution: HumanResolution,
    db: Session = Depends(get_db),
):
    ticket = db.query(TicketDB).filter(TicketDB.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = "human_resolved"
    ticket.ai_solution = resolution.solution
    ticket.assigned_to = resolution.resolved_by
    ticket.updated_at = datetime.utcnow()

    # Auto-learning pipeline: Add the human resolution to ChromaDB vector store
    learning_success = add_solution_to_knowledge_base(
        issue=f"{ticket.title} {ticket.description}",
        solution=resolution.solution,
        category=ticket.category,
        ticket_id=ticket_id
    )

    details = resolution.notes or "Resolved by human agent"
    if learning_success:
        details += " | Added to AI Knowledge Base (Auto-Learned)"

    audit = AuditLogDB(
        ticket_id=ticket_id,
        action="HUMAN_RESOLVED",
        performed_by=resolution.resolved_by,
        details=details,
        timestamp=datetime.utcnow(),
    )
    db.add(audit)
    db.commit()

    email_sent = False
    if _is_email_contact(ticket.submitted_by):
        email_sent = send_resolution_email(
            to_email=ticket.submitted_by,
            ticket_id=ticket_id,
            title=ticket.title,
            solution=resolution.solution,
        )

    sync_tickets_to_json(db)

    return {
        "success": True,
        "message": f"Ticket #{ticket_id} resolved",
        "email_sent": email_sent,
    }


@router.get("/{ticket_id}/audit", response_model=List[dict])
async def get_ticket_audit(ticket_id: int, db: Session = Depends(get_db)):
    logs = (
        db.query(AuditLogDB)
        .filter(AuditLogDB.ticket_id == ticket_id)
        .order_by(AuditLogDB.timestamp.asc())
        .all()
    )

    return [
        {
            "id": log.id,
            "action": log.action,
            "performed_by": log.performed_by,
            "details": log.details,
            "timestamp": log.timestamp.isoformat(),
        }
        for log in logs
    ]


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
        "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None,
    }
