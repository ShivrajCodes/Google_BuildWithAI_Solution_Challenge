"""
chroma_seed.py — One-time setup script to pre-populate the fingerprint_index
reference database with known sports media images.

Run this BEFORE starting the server for the first time:
    python utils/chroma_seed.py

How it works:
  1. Downloads each reference image from a public URL.
  2. Generates its perceptual hash via imagehash.
  3. Stores the hash in the ChromaDB fingerprint_index collection.

After seeding, the ChromaDB similarity search will have real reference data
to compare against when new images are submitted via the /check endpoint.
"""

import os
import sys
import io
import requests
from PIL import Image
import imagehash

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.chroma_store import seed_fingerprint

# ============================================================
# Reference image catalogue
# Add any publicly accessible sports/media image URLs here.
# Format: ("unique_image_id", "public_image_url", {metadata})
# ============================================================
REFERENCE_IMAGES = [
    (
        "wikimedia_soccer_ball",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Soccerball.svg/240px-Soccerball.svg.png",
        {"image_name": "wikimedia_soccer_ball", "source": "wikimedia", "category": "sports_equipment"}
    ),
    (
        "wikimedia_cricket_ball",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Cricket_ball_old.jpg/320px-Cricket_ball_old.jpg",
        {"image_name": "wikimedia_cricket_ball", "source": "wikimedia", "category": "sports_equipment"}
    ),
    (
        "wikimedia_basketball",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Basketball.png/200px-Basketball.png",
        {"image_name": "wikimedia_basketball", "source": "wikimedia", "category": "sports_equipment"}
    ),
    (
        "wikimedia_tennis_ball",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Tennis_ball_wikimedia_commons.jpg/320px-Tennis_ball_wikimedia_commons.jpg",
        {"image_name": "wikimedia_tennis_ball", "source": "wikimedia", "category": "sports_equipment"}
    ),
    (
        "wikimedia_rugby_ball",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Rugby_ball.jpg/320px-Rugby_ball.jpg",
        {"image_name": "wikimedia_rugby_ball", "source": "wikimedia", "category": "sports_equipment"}
    ),
    (
        "wikimedia_olympic_rings",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Olympic_rings_without_rims.svg/320px-Olympic_rings_without_rims.svg.png",
        {"image_name": "wikimedia_olympic_rings", "source": "wikimedia", "category": "sports_logo"}
    ),
    (
        "wikimedia_stadium",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Eden_Gardens_Cricket_Stadium%2C_Kolkata.jpg/320px-Eden_Gardens_Cricket_Stadium%2C_Kolkata.jpg",
        {"image_name": "wikimedia_eden_gardens_stadium", "source": "wikimedia", "category": "venue"}
    ),
    (
        "wikimedia_trophy",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/FIFA_World_Cup_Trophy.jpg/200px-FIFA_World_Cup_Trophy.jpg",
        {"image_name": "wikimedia_fifa_trophy", "source": "wikimedia", "category": "sports_trophy"}
    ),
]


def generate_hash(image_url: str) -> str | None:
    """Downloads an image from a URL and returns its average perceptual hash string."""
    try:
        headers = {'User-Agent': 'MediaGuardBot/1.0 (https://github.com/shivr/media; buildwithai)'}
        response = requests.get(image_url, headers=headers, timeout=15)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content))
        return str(imagehash.average_hash(image))
    except Exception as e:
        print(f"  [ERROR] Failed to hash {image_url}: {e}")
        return None


def run_seed():
    print("=" * 60)
    print("  ChromaDB Fingerprint Seed Script")
    print("=" * 60)
    print(f"  Seeding {len(REFERENCE_IMAGES)} reference images into fingerprint_index...\n")

    success_count = 0
    for image_id, image_url, metadata in REFERENCE_IMAGES:
        print(f"  Processing: {metadata['image_name']}")
        hash_val = generate_hash(image_url)
        if hash_val is None:
            print(f"  [WARN] Skipping {image_id} — could not generate hash.\n")
            continue

        ok = seed_fingerprint(image_id, hash_val, metadata)
        if ok:
            print(f"  [OK] Seeded  [{image_id}]  hash={hash_val}\n")
            success_count += 1
        else:
            print(f"  [ERROR] Failed to store {image_id} in ChromaDB.\n")

    print("=" * 60)
    print(f"  Done. {success_count}/{len(REFERENCE_IMAGES)} images seeded successfully.")
    print("  You can now start the server: uvicorn main:app --reload")
    print("=" * 60)


if __name__ == "__main__":
    run_seed()
