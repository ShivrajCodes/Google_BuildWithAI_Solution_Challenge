import os
import sys
from typing import List, Dict, Any

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.chroma_store import search_fingerprints


def chroma_search(fingerprint: str) -> List[Dict[str, Any]]:
    """
    Takes a perceptual fingerprint string and performs a vector similarity search
    against the fingerprint_index reference database in ChromaDB.

    Returns a list of matches: [{"match": str, "similarity": float, "metadata": dict}]
    Falls back to a no-match result if the DB is empty or unavailable.
    """
    results = search_fingerprints(fingerprint, n_results=3)

    if not results:
        results = [{"match": "No existing images matched", "similarity": 0.0, "metadata": {}}]

    return results
