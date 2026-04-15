import os
from typing import Optional
import chromadb

# Initialize the ChromaDB client
try:
    _persist_directory = os.path.join(os.getcwd(), 'chroma_db')
    _client = chromadb.PersistentClient(path=_persist_directory)
    _collection = _client.get_or_create_collection(name="dev_pod_memory")
except Exception:
    _client = None
    _collection = None

def save_artifact(artifact_id: str, content: str, metadata: dict) -> bool:
    """
    Saves an artifact to the ChromaDB database with its content and metadata.
    Automatically generates embeddings assuming default embedding function.
    """
    if _collection is None:
        return False
    
    try:
        # Ensure required keys exist in metadata
        if 'type' not in metadata:
            metadata['type'] = 'artifact'
        if 'requirement' not in metadata:
            metadata['requirement'] = 'unspecified'
            
        _collection.upsert(
            ids=[artifact_id],
            documents=[content],
            metadatas=[metadata]
        )
        return True
    except Exception:
        return False

def get_artifact(artifact_id: str) -> Optional[str]:
    """
    Retrieves an artifact's raw string content from the collection using its ID.
    Returns None if the ID does not exist or upon failure.
    """
    if _collection is None:
        return None
        
    try:
        result = _collection.get(ids=[artifact_id])
        if result and result.get('documents') and len(result['documents']) > 0:
            return result['documents'][0]
        return None
    except Exception:
        return None

def search_artifacts(query_string: str, n_results: int = 3) -> list:
    """
    Queries the collection using the input string and returns a list of similarity matches.
    """
    if _collection is None:
        return []
    
    try:
        results = _collection.query(
            query_texts=[query_string],
            n_results=n_results
        )
        
        matches = []
        if results and results.get('documents') and len(results['documents']) > 0:
            docs = results['documents'][0]
            distances = results.get('distances', [[]])
            dists = distances[0] if distances and len(distances) > 0 else [0.0]*len(docs)
            metadatas = results['metadatas'][0] if 'metadatas' in results and results['metadatas'] else [{}]*len(docs)
            
            for doc, dist, meta in zip(docs, dists, metadatas):
                # Convert distance to a generic similarity score (closer to 1 = more similar)
                similarity = round(1.0 - (dist / 2.0) if dist <= 2.0 else 0.0, 2)
                matches.append({
                    "match": doc[:50] + "..." if len(doc) > 50 else doc,
                    "similarity": similarity,
                    "metadata": meta
                })
                
        return matches
    except Exception:
        return []
