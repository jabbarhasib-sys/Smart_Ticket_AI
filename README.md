# ⬡ Smart Ticket AI
### Intelligent Auto-Handling of Support Tickets with Confidence-Based Human-in-the-Loop (HITL)

<div align="center">

![Python]
![FastAPI]
![React]
![LangChain]
![Groq]
![ChromaDB]
**🏆 Built for srijan Hackathon 2026**

[Live Demo](#) · [API Docs](http://127.0.0.1:8000/docs) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📌 Problem Statement

Large enterprises receive **thousands of IT and application support tickets daily** from users and automated systems. A significant portion of these tickets follow repetitive patterns and have known resolutions, yet they continue to be **manually triaged and resolved**.

This leads to:
- ❌ Slower resolution times and SLA breaches
- ❌ Inefficient utilization of skilled support staff
- ❌ Increased operational costs
- ❌ Fully automated systems pose risks for complex issues
- ❌ Rule-based automation lacks adaptability

---

## ✅ Our Solution

**Smart Ticket AI** is a production-grade, AI-driven ticket handling system that:

- 🧠 **Intelligently classifies** incoming tickets using LLM
- 🔍 **Identifies known issues** using RAG (Retrieval-Augmented Generation) over a historical knowledge base
- ⚡ **Automatically resolves** tickets when AI confidence is high
- 👤 **Escalates complex tickets** to human agents with recommended solutions + confidence scores
- 🔐 **Ensures explainability** — every AI decision is fully auditable
- 📧 **Notifies users via email** when their ticket is resolved

---

## 🏗️ System Architecture

```
                        ┌─────────────────────────────────────┐
                        │         TICKET SUBMITTED            │
                        └──────────────┬──────────────────────┘
                                       │
                        ┌──────────────▼──────────────────────┐
                        │      STEP 1: AI CLASSIFIER          │
                        │   (LLaMA 3.1 via Groq API)          │
                        │   → Category Detection              │
                        │   → Pattern Recognition             │
                        └──────────────┬──────────────────────┘
                                       │
                        ┌──────────────▼──────────────────────┐
                        │    STEP 2: CONFIDENCE ENGINE        │
                        │   → Score: 0.0 to 1.0               │
                        │   → Risk Factor Analysis            │
                        │   → Security/Physical Check         │
                        └──────────────┬──────────────────────┘
                                       │
                        ┌──────────────▼──────────────────────┐
                        │      STEP 3: RAG PIPELINE           │
                        │   → ChromaDB Vector Search          │
                        │   → Retrieve Similar Solutions      │
                        │   → LLM Solution Generation         │
                        └──────────────┬──────────────────────┘
                                       │
                        ┌──────────────▼──────────────────────┐
                        │    STEP 4: HITL DECISION ENGINE     │
                        │                                     │
                        │  Score ≥ 0.85 → AUTO RESOLVE ✅     │
                        │  Score 0.60-0.85 → HUMAN CONFIRM 👤 │
                        │  Score < 0.60 → ESCALATE 🚨         │
                        └──────────────┬──────────────────────┘
                                       │
                  ┌────────────────────┼────────────────────┐
                  ▼                    ▼                     ▼
          AUTO RESOLVED          HITL DASHBOARD        AUDIT LOG
          + Email Sent           Agent Reviews         Stored
```

---

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Recharts | Cyberpunk Dashboard UI |
| **Backend** | FastAPI + Uvicorn | REST API Server |
| **AI Core** | Groq API (LLaMA 3.1) | LLM Classification & Generation |
| **RAG** | LangChain + ChromaDB | Vector Search & Solution Retrieval |
| **Embeddings** | Sentence Transformers | Semantic Similarity |
| **Database** | SQLite + SQLAlchemy | Tickets, Agents, Audit Logs |
| **Auth** | Passlib + bcrypt | Agent Authentication |
| **Email** | SMTP + Gmail | Resolution Notifications |
| **XAI** | Custom Explainer | Explainable AI Decisions |

---

## 📁 Project Structure

```
Smart_Ticket_AI/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── .env                       # Environment variables
│   ├── requirements.txt           # Python dependencies
│   ├── core/
│   │   ├── classifier.py          # AI ticket classifier
│   │   ├── confidence.py          # Confidence scoring engine
│   │   ├── rag_engine.py          # RAG pipeline (ChromaDB + LLM)
│   │   ├── decision_engine.py     # HITL decision orchestrator
│   │   └── explainer.py           # Explainable AI module
│   ├── routes/
│   │   ├── tickets.py             # Ticket CRUD + AI trigger
│   │   ├── agents.py              # Human agent APIs
│   │   └── analytics.py          # Dashboard metrics APIs
│   ├── models/
│   │   └── schemas.py             # Pydantic data models
│   └── database/
│       ├── db.py                  # SQLAlchemy ORM models
│       └── seed_data.py           # Sample data seeder
└── frontend/
    └── src/
        ├── App.js                 # Router + Sidebar
        ├── App.css                # Cyberpunk design system
        └── pages/
            ├── Dashboard.jsx      # Command center
            ├── TicketQueue.jsx    # HITL monitoring panel
            ├── SubmitTicket.jsx   # Ticket submission + AI result
            └── Analytics.jsx     # Performance charts
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smart-ticket-ai.git
cd smart-ticket-ai
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-dotenv groq langchain langchain-groq chromadb sentence-transformers scikit-learn pandas numpy python-jose[cryptography] passlib[bcrypt] python-multipart

# Configure environment
cp .env.example .env
# Add your GROQ_API_KEY to .env
```

### 3. Environment Variables
Create a `.env` file in `/backend`:
```env
GROQ_API_KEY=gsk_your_key_here
SECRET_KEY=supersecretkey123
DATABASE_URL=sqlite:///./tickets.db
EMAIL_SENDER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 4. Start Backend
```bash
uvicorn main:app --reload
```
✅ Server running at `http://127.0.0.1:8000`
📚 API Docs at `http://127.0.0.1:8000/docs`

### 5. Frontend Setup
```bash
cd ../frontend
npm install
npm install axios recharts react-router-dom lucide-react
npm start
```
✅ Dashboard at `http://localhost:3000`

---

## 🎯 Key Features

### 🤖 AI Pipeline (4-Step Processing)
Every ticket submitted goes through an automated 4-step AI pipeline:

1. **Classification** — LLM reads ticket, identifies category (network, software, hardware, access, performance)
2. **Confidence Scoring** — AI evaluates how confidently it can resolve the ticket (0.0–1.0)
3. **RAG Solution Generation** — Retrieves similar past solutions from ChromaDB, generates contextual fix
4. **HITL Decision** — Based on confidence thresholds, auto-resolves or escalates

### 📊 Confidence-Based HITL
```
Confidence ≥ 0.85  →  AUTO RESOLVE      (AI handles it completely)
Confidence 0.60-0.85 →  HUMAN CONFIRM   (AI suggests, human approves)
Confidence < 0.60   →  ESCALATE         (Human expertise required)
```

### 🔍 Explainable AI (XAI)
Every AI decision includes:
- Category detection reasoning
- Confidence score justification
- Risk factors identified
- Physical access requirements
- Security sensitivity flags

### 📧 Email Notifications
When a human agent resolves a ticket, the system automatically sends a formatted HTML email to the ticket submitter with the resolution details.

### 📈 Real-Time Analytics
- AI efficiency rate
- Confidence distribution charts
- Category & priority breakdowns
- HITL system accuracy metrics
- Live activity feed

---

## 🔌 API Endpoints

### Tickets
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/tickets/` | Create ticket + trigger AI pipeline |
| `GET` | `/tickets/` | Get all tickets (with filters) |
| `GET` | `/tickets/{id}` | Get single ticket with AI analysis |
| `POST` | `/tickets/{id}/process` | Re-run AI pipeline on ticket |
| `POST` | `/tickets/{id}/resolve` | Human resolve + send email |
| `GET` | `/tickets/{id}/audit` | Get full audit trail |

### Agents
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/agents/register` | Register new agent |
| `POST` | `/agents/login` | Agent login |
| `GET` | `/agents/queue/pending` | Get HITL pending queue |
| `POST` | `/agents/{id}/assign/{ticket_id}` | Assign ticket to agent |

### Analytics
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/analytics/summary` | Dashboard KPIs |
| `GET` | `/analytics/hitl-metrics` | HITL performance data |
| `GET` | `/analytics/confidence-distribution` | Confidence spread |
| `GET` | `/analytics/recent-activity` | Live audit feed |

---

## 🧠 AI/ML Components

### RAG Pipeline
```python
# 1. Embed the incoming ticket
query_embedding = embedding_model.encode([ticket_text])

# 2. Search ChromaDB for similar past tickets
results = collection.query(query_embeddings=query_embedding, n_results=3)

# 3. Use retrieved context to generate solution
solution = llm.generate(prompt=f"Context: {retrieved_docs}\nTicket: {ticket}")
```

### Confidence Scoring Logic
```python
# Critical tickets are capped at 0.75
if priority == "critical":
    score = min(score, 0.75)

# Security-sensitive issues capped at 0.70
if is_security_sensitive:
    score = min(score, 0.70)

# Physical access required → capped at 0.65
if requires_physical_access:
    score = min(score, 0.65)
```

---

## 🏆 Hackathon Highlights

This project demonstrates:

- ✅ **Real-world problem** — IT ticket management affects every enterprise
- ✅ **Novel AI application** — RAG + HITL + XAI combined
- ✅ **Production architecture** — Not a prototype, but deployable code
- ✅ **Enterprise governance** — Audit logs, confidence thresholds, explainability
- ✅ **Full-stack delivery** — Backend API + React dashboard + email system
- ✅ **Scalable design** — Can handle thousands of tickets with minimal changes

---

## 📸 Screenshots

| Dashboard | Ticket Queue | Analytics |
|-----------|-------------|-----------|
| Command Center with live stats | HITL monitoring with AI decisions | Performance charts & HITL metrics |

---

## 🔮 Future Roadmap

- [ ] Multi-tenant support for different organizations
- [ ] Slack / Teams integration for agent notifications
- [ ] Fine-tuned model on company-specific ticket data
- [ ] Auto-learning from human resolutions
- [ ] SLA breach prediction & alerting
- [ ] Mobile app for agents
- [ ] JWT-based authentication flow
- [ ] Docker + Kubernetes deployment

---

## 👥 Team

| Name | Role |
|------|------|
| Jabbar Hasib        | AI/ML Engineer               |
| Sangamesh Rajole    | Full Stack AI Developer      |
| Syed Kashif Mehdi   | Backend & System Architect   |


---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

- [Groq](https://groq.com) for blazing fast LLM inference
- [LangChain](https://langchain.com) for the RAG framework
- [ChromaDB](https://trychroma.com) for vector storage
- [FastAPI](https://fastapi.tiangolo.com) for the elegant API framework
- [Recharts](https://recharts.org) for beautiful React charts

---

<div align="center">

**⬡ Smart Ticket AI — Where Enterprise Meets Intelligence**

</dv>
