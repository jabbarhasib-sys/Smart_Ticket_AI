from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db, AgentDB, TicketDB, AuditLogDB
from models.schemas import AgentCreate, AgentLogin, AgentResponse
from passlib.context import CryptContext
from datetime import datetime
from typing import List

router = APIRouter(prefix="/agents", tags=["Agents"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── REGISTER AGENT ────────────────────────────────────────
@router.post("/register", response_model=dict)
async def register_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    """Register a new human support agent"""
    try:
        # Check if email exists
        existing = db.query(AgentDB).filter(AgentDB.email == agent.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        new_agent = AgentDB(
            name=agent.name,
            email=agent.email,
            hashed_password=pwd_context.hash(agent.password),
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(new_agent)
        db.commit()
        db.refresh(new_agent)

        return {
            "success": True,
            "message": f"Agent {agent.name} registered successfully",
            "agent_id": new_agent.id
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ── LOGIN AGENT ───────────────────────────────────────────
@router.post("/login", response_model=dict)
async def login_agent(credentials: AgentLogin, db: Session = Depends(get_db)):
    """Agent login — returns agent info"""
    agent = db.query(AgentDB).filter(AgentDB.email == credentials.email).first()

    if not agent:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not pwd_context.verify(credentials.password, agent.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not agent.is_active:
        raise HTTPException(status_code=403, detail="Agent account is deactivated")

    return {
        "success": True,
        "agent_id": agent.id,
        "name": agent.name,
        "email": agent.email,
        "message": f"Welcome back, {agent.name}!"
    }


# ── GET ALL AGENTS ────────────────────────────────────────
@router.get("/", response_model=List[dict])
async def get_all_agents(db: Session = Depends(get_db)):
    """Get list of all support agents"""
    agents = db.query(AgentDB).all()
    return [
        {
            "id": a.id,
            "name": a.name,
            "email": a.email,
            "is_active": a.is_active,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in agents
    ]


# ── GET AGENT WORKLOAD ────────────────────────────────────
@router.get("/{agent_id}/workload", response_model=dict)
async def get_agent_workload(agent_id: int, db: Session = Depends(get_db)):
    """Get all tickets assigned to a specific agent"""
    agent = db.query(AgentDB).filter(AgentDB.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    assigned_tickets = db.query(TicketDB)\
        .filter(TicketDB.assigned_to == agent.name)\
        .all()

    pending = [t for t in assigned_tickets if t.status == "pending_human"]
    resolved = [t for t in assigned_tickets if t.status == "human_resolved"]

    return {
        "agent_id": agent_id,
        "agent_name": agent.name,
        "total_assigned": len(assigned_tickets),
        "pending": len(pending),
        "resolved": len(resolved),
        "tickets": [
            {
                "id": t.id,
                "title": t.title,
                "priority": t.priority,
                "status": t.status,
                "confidence_score": t.confidence_score,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in assigned_tickets
        ]
    }


# ── ASSIGN TICKET TO AGENT ────────────────────────────────
@router.post("/{agent_id}/assign/{ticket_id}", response_model=dict)
async def assign_ticket(
    agent_id: int,
    ticket_id: int,
    db: Session = Depends(get_db)
):
    """Assign a pending ticket to a specific agent"""
    agent = db.query(AgentDB).filter(AgentDB.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    ticket = db.query(TicketDB).filter(TicketDB.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Assign ticket
    ticket.assigned_to = agent.name
    ticket.updated_at = datetime.utcnow()

    # Audit log
    audit = AuditLogDB(
        ticket_id=ticket_id,
        action="TICKET_ASSIGNED",
        performed_by="SYSTEM",
        details=f"Assigned to agent: {agent.name}",
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": f"Ticket #{ticket_id} assigned to {agent.name}"
    }


# ── GET PENDING TICKETS FOR HUMAN REVIEW ─────────────────
@router.get("/queue/pending", response_model=List[dict])
async def get_pending_queue(db: Session = Depends(get_db)):
    """
    Get all tickets waiting for human review.
    This is what agents see on their HITL dashboard.
    """
    tickets = db.query(TicketDB)\
        .filter(TicketDB.status == "pending_human")\
        .order_by(TicketDB.created_at.desc())\
        .all()

    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "priority": t.priority,
            "category": t.category,
            "confidence_score": t.confidence_score,
            "ai_solution": t.ai_solution,
            "explanation": t.explanation,
            "submitted_by": t.submitted_by,
            "assigned_to": t.assigned_to,
            "created_at": t.created_at.isoformat() if t.created_at else None
        }
        for t in tickets
    ]