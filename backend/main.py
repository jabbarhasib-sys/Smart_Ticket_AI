from dotenv import load_dotenv
load_dotenv()  # ← Load env vars FIRST before anything else
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import tickets, agents, analytics
from database.db import create_tables
from database.seed_data import seed_database
import uvicorn

# ── APP SETUP ─────────────────────────────────────────────
app = FastAPI(
    title="Smart Ticket AI",
    description="""
    🎫 Intelligent Auto-Handling of Support Tickets
    with Confidence-Based Human-in-the-Loop (HITL)
    
    Built for National Hackathon 🏆
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ── CORS — allows React frontend to talk to backend ───────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTES ────────────────────────────────────────────────
app.include_router(tickets.router)
app.include_router(agents.router)
app.include_router(analytics.router)


# ── STARTUP ───────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    print("\n" + "="*50)
    print("🚀 Smart Ticket AI Server Starting...")
    print("="*50)
    create_tables()
    print("✅ Database tables created!")
    seed_database()
    print("✅ Sample data loaded!")
    print("="*50)
    print("📡 Server running at: http://54.80.7.105:8000")
    print("📚 API Docs at:       http://54.80.7.105:8000/docs")
    print("="*50 + "\n")


# ── HEALTH CHECK ──────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "🟢 Online",
        "app": "Smart Ticket AI",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "message": "All systems operational"
    }


# ── RUN ───────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )