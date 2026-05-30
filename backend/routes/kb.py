from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.rag_engine import _get_or_create_collection, embedding_model
import uuid

router = APIRouter(prefix="/kb", tags=["Knowledge Base"])

class KBEntryCreate(BaseModel):
    issue: str
    solution: str
    category: str

@router.get("/")
def get_all_kb_entries():
    """
    Retrieve all knowledge base entries indexed in ChromaDB.
    """
    try:
        collection = _get_or_create_collection()
        data = collection.get(include=["documents", "metadatas"])
        result = []
        for i in range(len(data["ids"])):
            doc = data["documents"][i]
            meta = data["metadatas"][i]
            
            issue = meta.get("issue", doc)
            solution = doc.replace(issue, "").strip()
            
            result.append({
                "id": data["ids"][i],
                "issue": issue,
                "solution": solution or doc,
                "category": meta.get("category", "other"),
                "source": meta.get("source", "seed")
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def add_kb_entry(entry: KBEntryCreate):
    """
    Create a new knowledge base entry, embed it, and insert it into ChromaDB.
    """
    try:
        collection = _get_or_create_collection()
        doc = f"{entry.issue} {entry.solution}"
        embedding = embedding_model.encode([doc]).tolist()
        entry_id = f"kb_admin_{uuid.uuid4().hex[:8]}"
        
        collection.add(
            documents=[doc],
            embeddings=embedding,
            ids=[entry_id],
            metadatas=[{
                "category": entry.category,
                "issue": entry.issue,
                "source": "admin_portal"
            }]
        )
        return {"success": True, "id": entry_id, "message": "Knowledge base entry added successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{entry_id}")
def delete_kb_entry(entry_id: str):
    """
    Remove an entry from the ChromaDB vector database by its ID.
    """
    try:
        collection = _get_or_create_collection()
        collection.delete(ids=[entry_id])
        return {"success": True, "message": f"Entry {entry_id} deleted successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
def search_kb(query: str, category: str = None, top_k: int = 3):
    """
    Vector search query playground endpoint for evaluating semantic similarities.
    """
    try:
        collection = _get_or_create_collection()
        query_embedding = embedding_model.encode([query]).tolist()
        
        where_clause = None
        if category and category != "all" and category != "other":
            where_clause = {"category": category}
            
        results = collection.query(
            query_embeddings=query_embedding,
            n_results=top_k,
            where=where_clause
        )
        
        similar = []
        if results and 'documents' in results and len(results['documents']) > 0:
            for i, doc in enumerate(results['documents'][0]):
                meta = results['metadatas'][0][i]
                dist = results['distances'][0][i]
                issue = meta.get("issue", doc)
                solution = doc.replace(issue, "").strip()
                similar.append({
                    "id": results['ids'][0][i],
                    "document": doc,
                    "issue": issue,
                    "solution": solution or doc,
                    "category": meta.get("category", "other"),
                    "distance": round(float(dist), 4),
                    "similarity_percentage": round((1 - min(1.0, float(dist))) * 100, 1)
                })
        return similar
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
