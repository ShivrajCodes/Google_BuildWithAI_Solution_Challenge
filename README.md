<div align="center">

![python](https://img.shields.io/badge/Python-181717.svg?style=for-the-badge&logo=python&logoColor=white)
![fastapi](https://img.shields.io/badge/FastAPI-181717.svg?style=for-the-badge&logo=fastapi&logoColor=white)
![nextjs](https://img.shields.io/badge/Next.js-181717.svg?style=for-the-badge&logo=nextdotjs&logoColor=white)
![chroma](https://img.shields.io/badge/ChromaDB-181717.svg?style=for-the-badge)
![gemini](https://img.shields.io/badge/Google%20Gemini-181717.svg?style=for-the-badge)

# 🛡️ MediaGuard – Digital Sports Media Protection System

</div>

BuildWithAI is an **AI-powered agentic system** designed to protect digital sports media by detecting **unauthorized image duplication and copyright infringement** using perceptual hashing and vector similarity search.

---

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=Demo+Preview" height=400 width=800/>
</div>

---

## 🚀 Features

- Perceptual Hashing for image similarity detection  
- Agent-based architecture (CrewAI + LangGraph)  
- Vector similarity search using ChromaDB  
- AI verdict generation with Google Gemini  
- End-to-end automated pipeline  
- FastAPI backend + Next.js frontend  

---

## ⚙️ How It Works

1. User submits an image URL  
2. Fingerprint Agent generates perceptual hash  
3. ChromaDB searches for similar images  
4. Verdict Agent analyzes matches  
5. Gemini generates final verdict  
6. Response returned with score + matches  

---

## 📂 Project Structure

```
buildwithai/
├── main.py
├── requirements.txt
├── agents/
├── graph/
├── utils/
├── frontend/
├── chroma_db/
```

---

## 🛠️ Setup

```bash
git clone https://github.com/your-repo/buildwithai.git
cd buildwithai
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

---

## 🚀 Run

```bash
uvicorn main:app --reload
```

---

## 🌐 API

POST `/check`

Request:
```
{
  "image_url": "https://example.com/image.png"
}
```

Response:
```
{
  "score": 0.95,
  "matches": [...],
  "verdict": "High similarity detected"
}
```

---

## 👥 Team

- Shivraj Bhattacharya – Integration  
- Roney – Frontend  
- Tanisha Debnath – Database  
- Trisha Bej – Backend  
