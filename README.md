# Sports Media Guardian

> An AI-powered system to detect, track, and flag unauthorized use of official sports media across the internet — target : to be built in 10 days.

---

## The problem

Sports organizations generate massive volumes of high-value digital media — match footage, photos, highlight reels — that scatter across the internet within minutes of publishing. There is currently no scalable way to track where this content ends up, who is using it without permission, and when IP violations occur.

## What we're building

A near real-time pipeline that:
- Fingerprints official sports media and stores it in a vector database
- Scans for unauthorized copies or near-duplicates across the web
- Scores each detection with an AI violation confidence score (0–1)
- Alerts the rights owner when a violation is found
- Auto-drafts a DMCA takedown report

---

## Team

| Person | Role | Responsibility |
|---|---|---|
| **P1** | Backend engineer | LangGraph workflow, CrewAI agents, Groq API integration, FastAPI endpoint |
| **P2** | Data engineer | ChromaDB setup, image embeddings, similarity search logic, optional Pinecone migration |
| **P3** | Frontend developer | Vanilla JS + HTML dashboard, results UI, alerts history panel, API integration |
| **P4** | QA / Integration | Test environment, endpoint testing, end-to-end integration, bug coordination, demo prep |

---

## Tech stack (all free)

| Layer | Tool |
|---|---|
| AI brain | Groq API — Llama 3.3 70B |
| Agent orchestration | LangGraph + CrewAI |
| Vector DB (local) | ChromaDB |
| Vector DB (production) | Pinecone free tier |
| Backend framework | FastAPI |
| Frontend | Vanilla JS + HTML + CSS |
| IDE | Google Antigravity |

---

## Timeline

10 days. See task breakdown in project board.

**Critical handoffs:**
- Day 2 — P2 shares ChromaDB module with P1
- Day 6 — P1's `/check` endpoint must be live for P3 and P4 to connect
- Day 7 — P4 runs first end-to-end test
- Day 10 — Full demo with 3 test scenarios

---

## Status

> 🚧 In progress — nothing built yet. Setup begins Day 1.

---

## Getting started

> Instructions will be added once the environment is set up. For now, each person should:
> 1. Create a free Groq account at [console.groq.com](https://console.groq.com)
> 2. Download Google Antigravity at [antigravity.google](https://antigravity.google)
> 3. Install Python 3.11 from [python.org](https://python.org)

---

*Built by a team of 4. Powered by free APIs. Zero budget.*