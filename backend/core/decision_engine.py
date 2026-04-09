from core.classifier import classify_ticket
from core.confidence import calculate_confidence, get_confidence_label
from core.rag_engine import run_rag_pipeline
from database.db import SessionLocal, TicketDB, AuditLogDB
from datetime import datetime

def process_ticket(ticket_id: int) -> dict:
    """
    Master pipeline — runs every time a ticket comes in:
    1. Classify ticket
    2. Calculate confidence
    3. Generate RAG solution
    4. Make HITL decision
    5. Update database
    6. Log to audit trail
    """
    db = SessionLocal()

    try:
        # Fetch ticket from DB
        ticket = db.query(TicketDB).filter(TicketDB.id == ticket_id).first()
        if not ticket:
            return {"success": False, "error": "Ticket not found"}

        print(f"\n{'='*50}")
        print(f"🎫 Processing Ticket #{ticket_id}: {ticket.title}")
        print(f"{'='*50}")

        # ── STEP 1: CLASSIFY ──────────────────────────────
        print("📂 Step 1: Classifying ticket...")
        classification = classify_ticket(
            title=ticket.title,
            description=ticket.description,
            priority=ticket.priority
        )
        category = classification.get("category", "other")
        print(f"   Category: {category}")

        # ── STEP 2: CONFIDENCE SCORE ──────────────────────
        print("📊 Step 2: Calculating confidence...")
        confidence_result = calculate_confidence(
            title=ticket.title,
            description=ticket.description,
            category=category,
            priority=ticket.priority
        )
        score = confidence_result.get("confidence_score", 0.5)
        decision = confidence_result.get("decision", "escalate_to_human")
        print(f"   Confidence: {score} ({get_confidence_label(score)})")
        print(f"   Decision: {decision}")

        # ── STEP 3: RAG SOLUTION ──────────────────────────
        print("🧠 Step 3: Generating RAG solution...")
        rag_result = run_rag_pipeline(
            title=ticket.title,
            description=ticket.description,
            category=category,
            priority=ticket.priority
        )
        solution = rag_result.get("solution", "No solution generated")

        # ── STEP 4: HITL DECISION ─────────────────────────
        print("⚖️  Step 4: Making HITL decision...")

        if decision == "auto_resolve":
            new_status = "auto_resolved"
            escalation_reason = None
            action = "AUTO_RESOLVED"
            print(f"   ✅ AUTO RESOLVING — confidence {score} above threshold")

        elif decision == "ai_suggest_human_confirm":
            new_status = "pending_human"
            escalation_reason = f"Medium confidence ({score}) — human confirmation needed"
            action = "ESCALATED_FOR_CONFIRMATION"
            print(f"   👤 ESCALATING FOR CONFIRMATION — medium confidence")

        else:  # escalate_to_human
            new_status = "pending_human"
            escalation_reason = confidence_result.get(
                "decision_reason",
                "Low confidence — requires human expertise"
            )
            action = "ESCALATED_TO_HUMAN"
            print(f"   🚨 ESCALATING TO HUMAN — low confidence")

        # Build explanation for UI
        explanation = _build_explanation(
            classification=classification,
            confidence_result=confidence_result,
            decision=decision,
            score=score
        )

        # ── STEP 5: UPDATE DATABASE ───────────────────────
        ticket.category = category
        ticket.confidence_score = score
        ticket.ai_solution = solution
        ticket.explanation = explanation
        ticket.status = new_status
        ticket.updated_at = datetime.utcnow()

        # ── STEP 6: AUDIT LOG ─────────────────────────────
        audit = AuditLogDB(
            ticket_id=ticket_id,
            action=action,
            performed_by="AI_SYSTEM",
            details=f"Confidence: {score} | Category: {category} | Decision: {decision}",
            timestamp=datetime.utcnow()
        )
        db.add(audit)
        db.commit()

        print(f"✅ Ticket #{ticket_id} processed successfully!")
        print(f"{'='*50}\n")

        return {
            "success": True,
            "ticket_id": ticket_id,
            "category": category,
            "confidence_score": score,
            "confidence_label": get_confidence_label(score),
            "decision": decision,
            "status": new_status,
            "solution": solution,
            "explanation": explanation,
            "escalation_reason": escalation_reason,
            "risk_factors": confidence_result.get("risk_factors", []),
            "similar_solutions_found": rag_result.get("similar_solutions_found", 0)
        }

    except Exception as e:
        db.rollback()
        print(f"❌ Decision engine error: {e}")
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()


def _build_explanation(
    classification: dict,
    confidence_result: dict,
    decision: str,
    score: float
) -> str:
    """
    Builds a human-readable explanation of why AI made this decision.
    This is the Explainable AI (XAI) part of the system.
    """
    label = get_confidence_label(score)
    category = classification.get("category", "other")
    pattern = classification.get("similar_pattern", "")
    reasoning = confidence_result.get("reasoning", "")
    risk_factors = confidence_result.get("risk_factors", [])
    is_repetitive = confidence_result.get("is_repetitive_pattern", False)
    needs_physical = confidence_result.get("requires_physical_access", False)
    is_security = confidence_result.get("is_security_sensitive", False)

    explanation = f"🤖 AI Analysis Summary\n\n"
    explanation += f"📂 Category Detected: {category.upper()}\n"
    if pattern:
        explanation += f"🔍 Pattern Recognized: {pattern}\n"
    explanation += f"\n📊 Confidence Score: {score} ({label})\n"
    explanation += f"💡 Reasoning: {reasoning}\n"

    if risk_factors:
        explanation += f"\n⚠️ Risk Factors:\n"
        for rf in risk_factors:
            explanation += f"  • {rf}\n"

    if is_repetitive:
        explanation += f"\n🔁 This is a known repetitive issue with established solutions.\n"
    if needs_physical:
        explanation += f"\n🔧 Physical access may be required — human agent preferred.\n"
    if is_security:
        explanation += f"\n🔐 Security-sensitive issue — human oversight required.\n"

    if decision == "auto_resolve":
        explanation += f"\n✅ Decision: AUTO-RESOLVED — High confidence in solution accuracy."
    elif decision == "ai_suggest_human_confirm":
        explanation += f"\n👤 Decision: HUMAN CONFIRMATION — AI suggests solution but human should verify."
    else:
        explanation += f"\n🚨 Decision: ESCALATED TO HUMAN — Issue complexity exceeds auto-resolution threshold."

    return explanation