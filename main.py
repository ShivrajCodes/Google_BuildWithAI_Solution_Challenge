from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Any
from dotenv import load_dotenv
import os

# Load environment variables on application startup
load_dotenv()

# Import the exposed function from our previously built LangGraph pipeline
from graph.pipeline import run_pipeline

# 1. Initialize the FastAPI application
app = FastAPI(
    title="Digital Sports Media Protection API",
    description="Backend API for protecting digital sports media using perceptual hashing and Gemini AI."
)

# 2. Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------
# Pydantic Schemas for Input / Output Validation
# ----------------------------------------
class CheckImageRequest(BaseModel):
    image_url: str

class CheckImageResponse(BaseModel):
    score: float
    matches: List[Dict[str, Any]]
    verdict: str

# ----------------------------------------
# API Endpoints
# ----------------------------------------

@app.get("/api/health")
def health_check():
    return {"status": "Sports Media Protection API is running"}


@app.post("/check", response_model=CheckImageResponse)
def check_image_endpoint(request: CheckImageRequest) -> CheckImageResponse:
    try:
        result_state = run_pipeline(request.image_url)

        score   = result_state.get("score")   or 0.0
        matches = result_state.get("matches") or []
        verdict = result_state.get("verdict") or "Unknown due to API limitations."

        return CheckImageResponse(score=score, matches=matches, verdict=verdict)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Mount frontend only if the build output exists (safe for Render cold deploys)
FRONTEND_DIR = "frontend/out"
if os.path.isdir(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {
            "message": "API is running. Frontend not built yet.",
            "docs": "/docs"
        }