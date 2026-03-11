from groq import Groq
from chromadb import Client
from chromadb.config import Settings
import chromadb
from sentence_transformers import SentenceTransformer
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Initialize ChromaDB — our vector knowledge base
chroma_client = chromadb.PersistentClient(path="./chroma_db")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Knowledge base of known solutions
KNOWLEDGE_BASE = [
    {
        "issue": "VPN connection timeout or failure",
        "solution": "1. Check internet connection is stable. 2. Restart VPN client. 3. Clear VPN cache and reconnect. 4. Try alternate VPN server. 5. Disable firewall temporarily and retry. 6. Reinstall VPN client if issue persists.",
        "category": "network"
    },
    {
        "issue": "Microsoft Office license verification error",
        "solution": "1. Open any Office app. 2. Go to File > Account. 3. Click 'Sign Out' then sign back in with company credentials. 4. If error persists, run Office repair tool from Control Panel > Programs. 5. Contact IT for license reactivation.",
        "category": "software"
    },
    {
        "issue": "Forgot Windows login password",
        "solution": "1. IT admin can reset via Active Directory. 2. Use password reset portal at reset.company.com. 3. Call helpdesk with employee ID for emergency reset. 4. New password will be temporary — must change on first login.",
        "category": "access"
    },
    {
        "issue": "Laptop running slow or freezing",
        "solution": "1. Restart laptop first. 2. Check Task Manager for high CPU/memory usage. 3. Run Disk Cleanup and delete temp files. 4. Disable startup programs. 5. Check for Windows updates. 6. Run antivirus scan. 7. If still slow, schedule RAM/SSD upgrade.",
        "category": "performance"
    },
    {
        "issue": "No internet connection on workstation",
        "solution": "1. Check ethernet cable connection. 2. Restart network adapter (Device Manager). 3. Run Windows Network Troubleshooter. 4. Flush DNS: run 'ipconfig /flushdns' in cmd. 5. Check if other devices on same port work. 6. Escalate to network team if hardware issue.",
        "category": "network"
    },
    {
        "issue": "Printer not printing or stuck queue",
        "solution": "1. Restart print spooler service (services.msc). 2. Clear print queue. 3. Restart printer. 4. Remove and re-add printer. 5. Update or reinstall printer drivers. 6. Check printer network connection.",
        "category": "hardware"
    },
    {
        "issue": "Need access to shared drive or folder",
        "solution": "1. Submit access request to IT with manager approval. 2. IT will add user to appropriate AD security group. 3. Access granted within 2-4 hours. 4. Map network drive using \\\\server\\share path.",
        "category": "access"
    },
    {
        "issue": "Email not syncing on mobile device",
        "solution": "1. Remove company email account from phone. 2. Re-add using Exchange settings: server mail.company.com. 3. Ensure MDM profile is installed. 4. Check account credentials. 5. Enable sync in phone settings.",
        "category": "software"
    },
    {
        "issue": "Blue screen of death BSOD crash",
        "solution": "1. Note error code from BSOD screen. 2. Check Windows Event Viewer for crash logs. 3. Run Windows Memory Diagnostic. 4. Update all drivers especially GPU and chipset. 5. Run SFC /scannow in admin cmd. 6. If recurring, schedule hardware diagnostics.",
        "category": "hardware"
    },
    {
        "issue": "Software installation request",
        "solution": "1. Submit software request form with business justification. 2. IT checks license availability. 3. Approved software pushed via SCCM or remote install. 4. User notified when installation is complete. Timeline: 1-2 business days.",
        "category": "software"
    },
]

def _get_or_create_collection():
    """Get or create ChromaDB collection with knowledge base"""
    try:
        collection = chroma_client.get_collection("knowledge_base")
        return collection
    except:
        collection = chroma_client.create_collection("knowledge_base")

        # Add knowledge base to vector store
        documents = [f"{item['issue']} {item['solution']}" for item in KNOWLEDGE_BASE]
        embeddings = embedding_model.encode(documents).tolist()
        ids = [f"kb_{i}" for i in range(len(KNOWLEDGE_BASE))]
        metadatas = [{"category": item["category"], "issue": item["issue"]} for item in KNOWLEDGE_BASE]

        collection.add(
            documents=documents,
            embeddings=embeddings,
            ids=ids,
            metadatas=metadatas
        )
        print("✅ Knowledge base loaded into ChromaDB!")
        return collection


def retrieve_similar_solutions(query: str, category: str, top_k: int = 3) -> list:
    """
    RAG Step 1: Retrieve similar past solutions from knowledge base
    """
    try:
        collection = _get_or_create_collection()
        query_embedding = embedding_model.encode([query]).tolist()

        results = collection.query(
            query_embeddings=query_embedding,
            n_results=top_k,
            where={"category": category} if category != "other" else None
        )

        similar = []
        for i, doc in enumerate(results['documents'][0]):
            similar.append({
                "document": doc,
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i]
            })

        return similar

    except Exception as e:
        print(f"❌ Retrieval error: {e}")
        return []


def generate_solution(
    title: str,
    description: str,
    category: str,
    priority: str,
    similar_solutions: list
) -> dict:
    """
    RAG Step 2: Generate solution using retrieved context + LLM
    """
    try:
        # Build context from retrieved solutions
        context = ""
        if similar_solutions:
            context = "Here are similar resolved issues from our knowledge base:\n\n"
            for i, sol in enumerate(similar_solutions[:3]):
                context += f"Similar Issue {i+1}:\n{sol['document']}\n\n"
        else:
            context = "No similar issues found in knowledge base. Use general IT knowledge."

        RAG_PROMPT = f"""You are an expert IT support engineer. 
Using the knowledge base context below, generate a clear step-by-step solution for this ticket.

KNOWLEDGE BASE CONTEXT:
{context}

CURRENT TICKET:
Title: {title}
Description: {description}
Category: {category}
Priority: {priority}

Provide a practical, actionable solution. Be specific and numbered.
Keep it under 200 words. Focus on what the user or IT agent should do RIGHT NOW."""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert IT support engineer. Provide clear, actionable solutions."
                },
                {
                    "role": "user",
                    "content": RAG_PROMPT
                }
            ],
            temperature=0.3,
            max_tokens=500
        )

        solution = response.choices[0].message.content.strip()

        return {
            "success": True,
            "solution": solution,
            "sources_used": len(similar_solutions),
            "context_used": bool(similar_solutions)
        }

    except Exception as e:
        print(f"❌ Generation error: {e}")
        return {
            "success": False,
            "solution": "Unable to generate solution. Please assign to human agent.",
            "sources_used": 0,
            "context_used": False
        }


def run_rag_pipeline(
    title: str,
    description: str,
    category: str,
    priority: str
) -> dict:
    """
    Full RAG Pipeline:
    1. Retrieve similar solutions
    2. Generate AI solution using context
    """
    print(f"🔍 Running RAG pipeline for: {title}")

    # Step 1: Retrieve
    query = f"{title} {description}"
    similar = retrieve_similar_solutions(query, category)
    print(f"📚 Found {len(similar)} similar solutions")

    # Step 2: Generate
    result = generate_solution(title, description, category, priority, similar)
    print(f"✅ Solution generated: {result['success']}")

    return {
        "solution": result["solution"],
        "similar_solutions_found": len(similar),
        "rag_success": result["success"]
    }