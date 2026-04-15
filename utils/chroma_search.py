# Actual Search implementation replacing the temporary mock.
from typing import List, Dict, Any
from utils.chroma_store import search_artifacts

def chroma_search(fingerprint: str) -> List[Dict[str, Any]]:
    """
    Takes a fingerprint string and performs a real vector similarity search on ChromaDB.
    """
    # Query ChromaDB using the perceptual hash string
    results = search_artifacts(query_string=fingerprint, n_results=3)
    
    # If DB is completely empty and no matches are found, return fallback structure
    if not results:
        results = [{"match": "No existing images matched", "similarity": 0.0}]
        
    return results
