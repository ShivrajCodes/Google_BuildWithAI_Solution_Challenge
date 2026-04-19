import os
import sys
from typing import Optional

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import chromadb

_persist_directory = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'chroma_db')

from chromadb.api.types import EmbeddingFunction, Documents, Embeddings

class PerceptualHashEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        embeddings = []
        for hash_str in input:
            try:
                # Convert hex hash to binary string matching exact length
                bin_str = bin(int(hash_str, 16))[2:].zfill(len(hash_str) * 4)
                # Map 1 to 1.0, 0 to -1.0 so cosine tracking aligns with Hamming distance
                vec = [1.0 if bit == '1' else -1.0 for bit in bin_str]
                embeddings.append(vec)
            except ValueError:
                embeddings.append([0.0] * (len(hash_str) * 4 if hash_str else 64))
        return embeddings

try:
    _client = chromadb.PersistentClient(path=_persist_directory)
    # Collection 1: Reference DB of known copyrighted image fingerprints
    _fingerprint_index = _client.get_or_create_collection(
        name="fingerprint_index",
        embedding_function=PerceptualHashEmbeddingFunction()
    )
    # Collection 2: Audit log for all intermediate pipeline outputs
    _pipeline_artifacts = _client.get_or_create_collection(name="pipeline_artifacts")
except Exception as e:
    print(f"[chroma_store] WARNING: Could not connect to ChromaDB: {e}")
    _client = None
    _fingerprint_index = None
    _pipeline_artifacts = None


def seed_fingerprint(image_name: str, fingerprint_hash: str, metadata: dict = None) -> bool:
    """
    Adds a known/reference image fingerprint to the fingerprint_index collection.
    Call this once via chroma_seed.py to pre-populate the reference database.
    """
    if _fingerprint_index is None:
        return False
    try:
        _fingerprint_index.upsert(
            ids=[image_name],
            documents=[fingerprint_hash],
            metadatas=[metadata or {"source": "seed"}]
        )
        return True
    except Exception as e:
        print(f"[chroma_store] WARNING: seed_fingerprint failed: {e}")
        return False


def search_fingerprints(fingerprint: str, n_results: int = 3) -> list:
    """
    Queries the fingerprint_index reference DB for similar images.
    Returns a list of dicts: {"match": str, "similarity": float, "metadata": dict}
    """
    if _fingerprint_index is None:
        return []
    try:
        count = _fingerprint_index.count()
        if count == 0:
            return []

        actual_n = min(n_results, count)
        results = _fingerprint_index.query(
            query_texts=[fingerprint],
            n_results=actual_n
        )

        matches = []
        if results and results.get('documents') and len(results['documents']) > 0:
            docs = results['documents'][0]
            distances = results.get('distances', [[]])
            dists = distances[0] if distances and len(distances) > 0 else [0.0] * len(docs)
            metadatas = results['metadatas'][0] if 'metadatas' in results and results['metadatas'] else [{}] * len(docs)

            for doc, dist, meta in zip(docs, dists, metadatas):
                # ChromaDB cosine distance: 0 = identical, 2 = opposite.
                # Convert to a 0–1 similarity score.
                similarity = round(max(0.0, 1.0 - (dist / 2.0)), 2)
                matches.append({
                    "match": meta.get("image_name", doc[:50] + "..." if len(doc) > 50 else doc),
                    "similarity": similarity,
                    "metadata": meta
                })

        return matches
    except Exception as e:
        print(f"[chroma_store] WARNING: search_fingerprints failed: {e}")
        return []


def save_artifact(artifact_id: str, content: str, metadata: dict) -> bool:
    """
    Saves an intermediate pipeline output (fingerprint value, search result, verdict)
    to the pipeline_artifacts audit log. Does NOT affect the reference search DB.
    """
    if _pipeline_artifacts is None:
        return False
    try:
        if 'type' not in metadata:
            metadata['type'] = 'artifact'
        _pipeline_artifacts.upsert(
            ids=[artifact_id],
            documents=[content],
            metadatas=[metadata]
        )
        return True
    except Exception as e:
        print(f"[chroma_store] WARNING: save_artifact failed: {e}")
        return False


def get_artifact(artifact_id: str) -> Optional[str]:
    """
    Retrieves a stored pipeline artifact by its ID.
    Returns None if not found.
    """
    if _pipeline_artifacts is None:
        return None
    try:
        result = _pipeline_artifacts.get(ids=[artifact_id])
        if result and result.get('documents') and len(result['documents']) > 0:
            return result['documents'][0]
        return None
    except Exception:
        return None
