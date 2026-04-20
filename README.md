<div align="center">

![python](https://img.shields.io/badge/Python-181717.svg?style=for-the-badge&logo=python&logoColor=white)
![fastapi](https://img.shields.io/badge/FastAPI-181717.svg?style=for-the-badge&logo=fastapi&logoColor=white)
![nextjs](https://img.shields.io/badge/Next.js-181717.svg?style=for-the-badge&logo=nextdotjs&logoColor=white)
![chroma](https://img.shields.io/badge/ChromaDB-181717.svg?style=for-the-badge)
![gemini](https://img.shields.io/badge/Google%20Gemini-181717.svg?style=for-the-badge)

# 🛡️ MediaGuard – AI-Powered Sports Media Protection

</div>

MediaGuard is an **AI-driven agentic platform** designed to protect digital sports media by detecting **unauthorized image duplication and copyright infringement** using perceptual hashing, vector similarity search, and intelligent AI agents.

🔗 **GitHub Repository:**  
https://github.com/ShivrajCodes/Google_BuildWithAI_Solution_Challenge

---

<div align="center">
  <img src="https://via.placeholder.com/900x400.png?text=MediaGuard+Demo" width="900"/>
</div>

---

## 🚀 Features

- 🔍 **Perceptual Hashing (Fingerprinting)** for image similarity detection  
- 🤖 **Agent-based pipeline** using CrewAI + LangGraph  
- 🧠 **AI-powered verdict system** using Google Gemini  
- 📦 **Vector similarity search** via ChromaDB  
- ⚡ **FastAPI backend + Next.js frontend**  
- 🔄 **End-to-end automated workflow**  

---

## ⚙️ How It Works

1. User submits an **image URL**
2. **Fingerprint Agent** generates perceptual hash  
3. Hash is searched in **ChromaDB vector database**  
4. Matches passed to **Verdict Agent**  
5. **Gemini AI** evaluates similarity and context  
6. Final response returned with:
   - Similarity score  
   - Matching images  
   - AI-generated verdict  

---

## 📂 Project Structure

```
buildwithai/
│
├── main.py
├── requirements.txt
├── test_chroma_store.py
├── .env
│
├── agents/
│   ├── fingerprint_agent.py
│   └── verdict_agent.py
│
├── graph/
│   └── pipeline.py
│
├── utils/
│   ├── chroma_search.py
│   ├── chroma_seed.py
│   └── chroma_store.py
│
├── frontend/
│   └── src/
│
├── chroma_db/
└── node_modules/
```

---

## 🛠️ Setup & Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/ShivrajCodes/Google_BuildWithAI_Solution_Challenge.git
cd Google_BuildWithAI_Solution_Challenge
```

### 2️⃣ Create virtual environment
```bash
python -m venv .venv
source .venv/bin/activate
```

### 3️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

### 4️⃣ Configure environment variables
Create `.env` file:

```bash
GEMINI_API_KEY=your_api_key_here
```

---

## 🚀 Running the Backend

```bash
uvicorn main:app --reload
```

Server runs at:
```
http://localhost:8000
```

---

## 🌐 API Endpoint

### POST `/check`

**Request**
```json
{
  "image_url": "https://example.com/image.png"
}
```

**Response**
```json
{
  "score": 0.95,
  "matches": [
    {"match": "official_ipl_photo_2024.jpg", "similarity": 0.91},
    {"match": "getty_image.jpg", "similarity": 0.76}
  ],
  "verdict": "High similarity detected. Potential copyright infringement."
}
```

---

## 🧠 Database Integration Notes

> ⚠️ Important for Database Team

- Replace mock search with **real ChromaDB logic**
- Maintain response format:
```json
{"match": "string", "similarity": float}
```
- This integrates directly into the **LangGraph pipeline**

---

## 🎯 Use Cases

- 🏏 Sports media copyright protection  
- 📰 News/media authenticity verification  
- 🖼️ Image duplication detection platforms  
- 📊 AI-powered digital asset monitoring  

---

<div align="center">

## 👥 Team

<a href="https://github.com/ShivrajCodes">
  <img src="https://github.com/ShivrajCodes.png" width="80" style="border-radius:50%">
</a>
<a href="https://github.com/Roney9-bit">
  <img src="https://github.com/Roney9-bit.png" width="80" style="border-radius:50%">
</a>
<a href="https://github.com/TanishaDebnath">
  <img src="https://github.com/TanishaDebnath.png" width="80" style="border-radius:50%">
</a>
<a href="https://github.com/trishab004">
  <img src="https://github.com/trishab004.png" width="80" style="border-radius:50%">
</a>

<br><br>

| Member | Role |
|--------|------|
| Shivraj Bhattacharya | Integration |
| Roney Ghosh | Frontend |
| Tanisha Debnath | Database |
| Trisha Bej | Backend |

</div>

---

<p align="center">
<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge"/>
</p>
