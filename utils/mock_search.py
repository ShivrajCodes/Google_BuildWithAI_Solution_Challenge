# TEMPORARY MOCK - To be replaced by ChromaDB search by DB teammate
from typing import List, Dict, Any

def mock_search(fingerprint: str) -> List[Dict[str, Any]]:
    """
    Takes a fingerprint string and returns a mock list of matches.
    """
    return [
        {"match": "official_ipl_photo_2024.jpg", "similarity": 0.91},
        {"match": "getty_sports_image_445.jpg", "similarity": 0.76},
        {"match": "fifa_worldcup_2022_press.jpg", "similarity": 0.61}
    ]
