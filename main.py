from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from dotenv import load_dotenv

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
# This allows your frontend teammates to hit this API from any local or remote URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Accepts requests from ALL origins
    allow_credentials=True,
    allow_methods=["*"],  # Accepts all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Accepts all headers
)

# ----------------------------------------
# Pydantic Schemas for Input / Output Validation
# ----------------------------------------
class CheckImageRequest(BaseModel):
    """Schema for the incoming request to the /check endpoint."""
    image_url: str

class CheckImageResponse(BaseModel):
    """Schema for the outgoing response from the /check endpoint."""
    score: float
    matches: List[Dict[str, Any]]
    verdict: str

# ----------------------------------------
# API Endpoints
# ----------------------------------------

# 3. A simple GET endpoint for health checking
@app.get("/api/health")
def health_check():
    """
    Endpoint to confirm the server is responsive and healthy.
    """
    return {"status": "Sports Media Protection API is running"}


# 1. A POST endpoint at /check that runs our Agents and Graph
@app.post("/check", response_model=CheckImageResponse)
def check_image_endpoint(request: CheckImageRequest) -> CheckImageResponse:
    """
    Accepts an Image URL, runs the full analytical pipeline pipeline:
    (Fingerprinting -> Database Fake Search -> Verdict Agent analysis),
    and returns a clean JSON summary of the findings.
    """
    try:
        # Call the LangGraph workflow utilizing our Agent network
        result_state = run_pipeline(request.image_url)
        
        # Safely extract data from the final graph state, 
        # providing fallbacks just in case an agent drops a None value due to an API 429 quota error.
        score = result_state.get("score") if result_state.get("score") is not None else 0.0
        matches = result_state.get("matches") if result_state.get("matches") is not None else []
        verdict = result_state.get("verdict") if result_state.get("verdict") is not None else "Unknown due to API limitations."

        return CheckImageResponse(
            score=score,
            matches=matches,
            verdict=verdict
        )
        
    except Exception as e:
        # Prevent the server from crashing if CrewAI triggers a hard fault downstream
        raise HTTPException(status_code=500, detail=str(e))

# Mount the static site correctly
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="frontend/out", html=True), name="frontend")
