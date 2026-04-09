from database.db import SessionLocal, TicketDB, AgentDB, AuditLogDB, create_tables
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

sample_tickets = [
    {
        "title": "Cannot connect to VPN",
        "description": "I am unable to connect to the company VPN from home. It was working yesterday but today it keeps timing out after entering credentials.",
        "priority": "high",
        "status": "open",
        "submitted_by": "john.doe@company.com"
    },
    {
        "title": "Microsoft Office not opening",
        "description": "Excel and Word are not opening on my laptop. I get an error saying 'Microsoft Office cannot verify the license for this product'.",
        "priority": "medium",
        "status": "open",
        "submitted_by": "sarah.smith@company.com"
    },
    {
        "title": "Forgot password - cannot login",
        "description": "I forgot my Windows login password and cannot access my computer. Need urgent reset as I have a meeting in an hour.",
        "priority": "critical",
        "status": "open",
        "submitted_by": "mike.jones@company.com"
    },
    {
        "title": "Laptop running very slow",
        "description": "My laptop has become extremely slow over the past week. It takes 10 minutes to boot up and applications freeze frequently.",
        "priority": "medium",
        "status": "open",
        "submitted_by": "emily.davis@company.com"
    },
    {
        "title": "No internet connection at workstation",
        "description": "My desktop computer has no internet connection since this morning. Other computers in the same room are working fine.",
        "priority": "high",
        "status": "open",
        "submitted_by": "robert.wilson@company.com"
    },
    {
        "title": "Printer not working",
        "description": "The printer on 3rd floor is not printing. Jobs are stuck in the queue and nothing comes out. Multiple people are affected.",
        "priority": "medium",
        "status": "open",
        "submitted_by": "lisa.anderson@company.com"
    },
    {
        "title": "Need access to shared drive",
        "description": "I need access to the Marketing shared drive folder. I recently joined the marketing team but cannot access the files.",
        "priority": "low",
        "status": "open",
        "submitted_by": "james.taylor@company.com"
    },
    {
        "title": "Email not syncing on mobile",
        "description": "My company emails are not syncing on my iPhone. I set it up last week and it was working but stopped 2 days ago.",
        "priority": "low",
        "status": "open",
        "submitted_by": "anna.brown@company.com"
    },
    {
        "title": "System crash during presentation",
        "description": "My laptop crashed with blue screen during an important client presentation. This is the 3rd time this month. Dump file attached.",
        "priority": "critical",
        "status": "open",
        "submitted_by": "david.miller@company.com"
    },
    {
        "title": "Software installation request",
        "description": "I need Adobe Photoshop installed on my workstation for the new design project starting next week.",
        "priority": "low",
        "status": "open",
        "submitted_by": "jessica.white@company.com"
    },
]

sample_agents = [
    {
        "name": "Admin User",
        "email": "admin@support.com",
        "password": "admin123"
    },
    {
        "name": "Support Agent 1",
        "email": "agent1@support.com",
        "password": "agent123"
    },
    {
        "name": "Support Agent 2",
        "email": "agent2@support.com",
        "password": "agent123"
    },
]

def seed_database():
    create_tables()
    db = SessionLocal()

    try:
        # Seed agents
        existing_agents = db.query(AgentDB).count()
        if existing_agents == 0:
            for agent_data in sample_agents:
                agent = AgentDB(
                    name=agent_data["name"],
                    email=agent_data["email"],
                    hashed_password=pwd_context.hash(agent_data["password"]),
                    is_active=True
                )
                db.add(agent)
            print("✅ Agents seeded successfully!")

        # Seed tickets
        existing_tickets = db.query(TicketDB).count()
        if existing_tickets == 0:
            for ticket_data in sample_tickets:
                ticket = TicketDB(**ticket_data)
                db.add(ticket)
            print("✅ Tickets seeded successfully!")

        db.commit()
        print("✅ Database seeding complete!")

    except Exception as e:
        print(f"❌ Seeding error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()