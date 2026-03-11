from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.db import get_db, TicketDB, AuditLogDB
from datetime import datetime, timedelta
from typing import List

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ── MAIN DASHBOARD SUMMARY ────────────────────────────────
@router.get("/summary", response_model=dict)
async def get_summary(db: Session = Depends(get_db)):
    """
    Main dashboard numbers —
    total tickets, auto resolved, pending, resolution rate
    """
    total = db.query(TicketDB).count()
    auto_resolved = db.query(TicketDB).filter(TicketDB.status == "auto_resolved").count()
    pending_human = db.query(TicketDB).filter(TicketDB.status == "pending_human").count()
    human_resolved = db.query(TicketDB).filter(TicketDB.status == "human_resolved").count()
    open_tickets = db.query(TicketDB).filter(TicketDB.status == "open").count()

    # Average confidence score
    avg_confidence = db.query(func.avg(TicketDB.confidence_score))\
        .filter(TicketDB.confidence_score != None).scalar()

    # Resolution rate
    total_resolved = auto_resolved + human_resolved
    resolution_rate = round((total_resolved / total * 100), 1) if total > 0 else 0

    # AI efficiency — how many did AI handle without humans
    ai_efficiency = round((auto_resolved / total * 100), 1) if total > 0 else 0

    return {
        "total_tickets": total,
        "open": open_tickets,
        "auto_resolved": auto_resolved,
        "pending_human": pending_human,
        "human_resolved": human_resolved,
        "total_resolved": total_resolved,
        "resolution_rate": resolution_rate,
        "ai_efficiency": ai_efficiency,
        "avg_confidence_score": round(float(avg_confidence), 2) if avg_confidence else 0.0
    }


# ── TICKETS BY CATEGORY ───────────────────────────────────
@router.get("/by-category", response_model=List[dict])
async def get_by_category(db: Session = Depends(get_db)):
    """Breakdown of tickets by category — for pie chart"""
    results = db.query(
        TicketDB.category,
        func.count(TicketDB.id).label("count")
    ).group_by(TicketDB.category).all()

    return [
        {
            "category": r.category or "uncategorized",
            "count": r.count
        }
        for r in results
    ]


# ── TICKETS BY PRIORITY ───────────────────────────────────
@router.get("/by-priority", response_model=List[dict])
async def get_by_priority(db: Session = Depends(get_db)):
    """Breakdown of tickets by priority — for bar chart"""
    results = db.query(
        TicketDB.priority,
        func.count(TicketDB.id).label("count")
    ).group_by(TicketDB.priority).all()

    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}

    return sorted(
        [{"priority": r.priority, "count": r.count} for r in results],
        key=lambda x: priority_order.get(x["priority"], 99)
    )


# ── TICKETS BY STATUS ─────────────────────────────────────
@router.get("/by-status", response_model=List[dict])
async def get_by_status(db: Session = Depends(get_db)):
    """Breakdown of tickets by status"""
    results = db.query(
        TicketDB.status,
        func.count(TicketDB.id).label("count")
    ).group_by(TicketDB.status).all()

    return [{"status": r.status, "count": r.count} for r in results]


# ── CONFIDENCE DISTRIBUTION ───────────────────────────────
@router.get("/confidence-distribution", response_model=List[dict])
async def get_confidence_distribution(db: Session = Depends(get_db)):
    """
    Shows how confident AI is across all tickets.
    Useful for showing HITL threshold effectiveness.
    """
    tickets = db.query(TicketDB.confidence_score)\
        .filter(TicketDB.confidence_score != None).all()

    distribution = {
        "Very High (0.85-1.0)": 0,
        "High (0.70-0.85)": 0,
        "Medium (0.60-0.70)": 0,
        "Low (0.40-0.60)": 0,
        "Very Low (0-0.40)": 0
    }

    for t in tickets:
        score = t.confidence_score
        if score >= 0.85:
            distribution["Very High (0.85-1.0)"] += 1
        elif score >= 0.70:
            distribution["High (0.70-0.85)"] += 1
        elif score >= 0.60:
            distribution["Medium (0.60-0.70)"] += 1
        elif score >= 0.40:
            distribution["Low (0.40-0.60)"] += 1
        else:
            distribution["Very Low (0-0.40)"] += 1

    return [
        {"range": k, "count": v}
        for k, v in distribution.items()
    ]


# ── RECENT ACTIVITY ───────────────────────────────────────
@router.get("/recent-activity", response_model=List[dict])
async def get_recent_activity(db: Session = Depends(get_db)):
    """Last 10 audit log entries — live activity feed"""
    logs = db.query(AuditLogDB)\
        .order_by(AuditLogDB.timestamp.desc())\
        .limit(10).all()

    return [
        {
            "ticket_id": log.ticket_id,
            "action": log.action,
            "performed_by": log.performed_by,
            "details": log.details,
            "timestamp": log.timestamp.isoformat()
        }
        for log in logs
    ]


# ── HITL METRICS ──────────────────────────────────────────
@router.get("/hitl-metrics", response_model=dict)
async def get_hitl_metrics(db: Session = Depends(get_db)):
    """
    Key HITL metrics — shows how well the
    confidence threshold system is working
    """
    total = db.query(TicketDB).count()

    # High confidence — auto resolved
    high_conf_auto = db.query(TicketDB).filter(
        TicketDB.confidence_score >= 0.85,
        TicketDB.status == "auto_resolved"
    ).count()

    # Medium confidence — pending human
    med_conf_human = db.query(TicketDB).filter(
        TicketDB.confidence_score >= 0.60,
        TicketDB.confidence_score < 0.85,
        TicketDB.status == "pending_human"
    ).count()

    # Low confidence — escalated
    low_conf_escalated = db.query(TicketDB).filter(
        TicketDB.confidence_score < 0.60,
        TicketDB.status == "pending_human"
    ).count()

    return {
        "total_tickets": total,
        "hitl_working_correctly": high_conf_auto + med_conf_human + low_conf_escalated,
        "high_confidence_auto_resolved": high_conf_auto,
        "medium_confidence_human_review": med_conf_human,
        "low_confidence_escalated": low_conf_escalated,
        "auto_resolution_threshold": 0.85,
        "human_review_threshold": 0.60,
        "system_accuracy": round(
            ((high_conf_auto + med_conf_human + low_conf_escalated) / total * 100), 1
        ) if total > 0 else 0
    }