from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class TicketStatus(str, Enum):
    OPEN = "open"
    AUTO_RESOLVED = "auto_resolved"
    PENDING_HUMAN = "pending_human"
    HUMAN_RESOLVED = "human_resolved"
    CLOSED = "closed"

class TicketCategory(str, Enum):
    NETWORK = "network"
    SOFTWARE = "software"
    HARDWARE = "hardware"
    ACCESS = "access"
    PERFORMANCE = "performance"
    OTHER = "other"

# --- Ticket Schemas ---
class TicketCreate(BaseModel):
    title: str
    description: str
    priority: TicketPriority = TicketPriority.MEDIUM
    submitted_by: str

class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: TicketPriority
    status: TicketStatus
    category: Optional[TicketCategory]
    confidence_score: Optional[float]
    ai_solution: Optional[str]
    explanation: Optional[str]
    submitted_by: str
    assigned_to: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Agent Schemas ---
class AgentCreate(BaseModel):
    name: str
    email: str
    password: str

class AgentLogin(BaseModel):
    email: str
    password: str

class AgentResponse(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True

# --- Resolution Schemas ---
class AIDecision(BaseModel):
    ticket_id: int
    category: TicketCategory
    confidence_score: float
    ai_solution: str
    explanation: str
    should_auto_resolve: bool
    escalation_reason: Optional[str]

class HumanResolution(BaseModel):
    ticket_id: int
    solution: str
    resolved_by: str
    notes: Optional[str]

# --- Analytics Schemas ---
class AnalyticsSummary(BaseModel):
    total_tickets: int
    auto_resolved: int
    pending_human: int
    human_resolved: int
    avg_confidence_score: float
    resolution_rate: float