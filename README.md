# Digital Sports Media Protection Backend

This agentic backend API protects digital sports media by utilizing AI and perceptual hashing to detect unauthorized image duplication. It intercepts incoming image URLs, generates a perceptual hash (fingerprint) using CrewAI agents, and searches the database for similarity matches. Finally, a verdict agent processes the matches using Google Gemini to provide a final determination on potential copyright infringement.

## 🛠️ Environment Setup
To run this application safely, you need to create your own configuration file for the AI APIs. 
1. Create a file named exactly `.env` in the root folder of this project.
2. Inside that file, place your Gemini API key (or Groq key if you modify the agent configuration) like this:
```txt
GEMINI_API_KEY=your_actual_key_here
```

## 📦 Installation
Make sure you have Python 3.10+ installed. Then install all required packages via pip:
```bash
pip install -r requirements.txt
```

## 🚀 Running the Server
You can spin up the full FastAPI backend using uvicorn. Run this in your terminal:
```bash
uvicorn main:app --reload
```
*Your API will now be live on `http://localhost:8000`*

## 🌐 API Endpoints

### `POST /check`
This is the primary pipeline trigger point for the LangGraph agent architecture.

**Expects (JSON payload)**:
```json
{
  "image_url": "https://example.com/some_image.png"
}
```

**Returns (JSON Payload)**:
```json
{
  "score": 0.95,
  "matches": [
    {"match": "official_ipl_photo_2024.jpg", "similarity": 0.91},
    {"match": "getty_sports_image_445.jpg", "similarity": 0.76}
  ],
  "verdict": "The image exhibits extremely high similarity to an official IPL photo..."
}
```

---

### 📝 Notice for Database Teammate (Antigravity Context)

**If you are writing the Database / Vector Search integration using Antigravity, please read this:**

> [!IMPORTANT]
> The current file `utils/mock_search.py` is a TEMPORARY placeholder. 
> 
> **Your specific task is**: 
> 1. Completely replace `utils/mock_search.py` with real ChromaDB integration logic.
> 2. Implement the actual vector similarity search using the generated perceptual `fingerprint` strings.
> 3. Ensure your new `mock_search` (or renamed function) returns a List of Dictionaries in the *exact same schema* as currently mocked: `{"match": str, "similarity": float}`.
>
> Doing this will immediately and natively wire your real Vector Database into our existing `graph/pipeline.py` LangGraph architecture, powering the `verdict_agent` with real data!