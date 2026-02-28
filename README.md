# AI Decision Engine

A structured strategic thinking system powered by **Google Gemini AI**. Input any life or career dilemma and get a comprehensive multi-dimensional analysis — risk assessment, strategic paths, probabilistic outcomes, bias detection, and more.

## Tech Stack

| Layer     | Technology                       |
|-----------|----------------------------------|
| Frontend  | React 18 + Vite                  |
| Backend   | FastAPI (Python 3.11+)           |
| AI        | Google Gemini API (gemini-2.5-flash) |
| Styling   | Vanilla CSS (glassmorphism)      |
| Charts    | Recharts                         |

---

## Project Structure

```
decision-engine/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── Header.jsx
│   │   │   ├── InputPanel.jsx
│   │   │   ├── OutputPanel.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── charts/
│   │   │   │   ├── SkillRadar.jsx
│   │   │   │   └── PathComparisonChart.jsx
│   │   │   └── sections/
│   │   │       ├── RiskSection.jsx
│   │   │       ├── PathsSection.jsx
│   │   │       └── AnalysisSections.jsx
│   │   ├── hooks/
│   │   │   └── useDecisionEngine.js
│   │   ├── lib/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── backend/                   # FastAPI app
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── core/
│   │   │   ├── config.py      # Settings (env vars via pydantic)
│   │   │   └── gemini.py      # Gemini API client + prompt engine
│   │   ├── api/
│   │   │   └── routes.py      # POST /analyze and GET /health
│   │   ├── models/
│   │   │   └── schemas.py     # Pydantic request/response models
│   │   └── services/
│   │       └── analyzer.py    # Business logic layer
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
│
└── README.md
```

---

## Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **Gemini API Key** — Get one free at [Google AI Studio](https://aistudio.google.com/apikey)

---

## Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd decision-engine
```

### 2. Set up the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
uvicorn app.main:app --reload --port 8000
# Edit .env and add your Gemini API key:
#   GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Set up the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Ensure VITE_API_URL=http://localhost:8000
```

### 4. Start the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate          # or: source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Open the App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

---

## Testing the App

### Quick Health Check

```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

### Run an Analysis

1. Open http://localhost:5173 in your browser
2. Type a dilemma, e.g.: *"Should I quit my stable tech job to join a startup?"*
3. Set Age, Risk Profile, and Time Horizon
4. Click **"Run Strategic Analysis"**
5. Wait ~30–90 seconds for Gemini to respond

### Test via API Directly

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "dilemma": "Should I quit my job to pursue a startup?",
    "age": "28",
    "risk_profile": "moderate",
    "time_horizon": "medium-term"
  }'
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable          | Description                          | Required |
|-------------------|--------------------------------------|----------|
| `GEMINI_API_KEY`  | Your Google Gemini API key           | ✅       |
| `PORT`            | Server port (default: 8000)          | ❌       |
| `ALLOWED_ORIGINS` | CORS origins (default: localhost:5173)| ❌      |

### Frontend (`frontend/.env.local`)

| Variable       | Description                  | Required |
|----------------|------------------------------|----------|
| `VITE_API_URL` | Backend URL (default: http://localhost:8000) | ✅ |

---

## API Reference

### `POST /analyze`

Analyzes a decision dilemma and returns a structured multi-dimensional analysis.

**Request Body:**
```json
{
  "dilemma": "Should I quit my job to pursue a startup?",
  "age": "28",
  "risk_profile": "moderate",
  "time_horizon": "medium-term"
}
```

**Response:** Structured JSON with 11 analysis sections:
1. Problem Framing
2. Constraints
3. Risk Analysis
4. Opportunity Cost
5. Skill Delta Analysis
6. Strategic Paths
7. Probabilistic Outcomes
8. Recommendation Engine
9. Cognitive Bias Detection
10. Antifragility Score
11. Regret Minimization

### `GET /health`

Returns `{ "status": "ok" }` — use for uptime monitoring.

### `GET /docs`

Interactive Swagger UI (auto-generated by FastAPI).

---

## Architecture

```
Browser → React Frontend (Vite) → FastAPI Backend → Google Gemini API
                                       ↓
                              Structured JSON Response
                                       ↓
                              React renders 11 sections
```

**Why a separate backend?**
- Keeps the `GEMINI_API_KEY` secure — never exposed to the browser
- Backend acts as a secure proxy for the AI API
- Independent scaling and deployment
- Can be reused by mobile apps or other clients

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: google` | Run `pip install google-genai` in your venv |
| `429 RESOURCE_EXHAUSTED` | Your API key has hit rate limits — wait or upgrade your plan |
| `CORS error in browser` | Ensure `ALLOWED_ORIGINS` in `.env` matches your frontend URL |
| Frontend shows "No decision loaded" | Backend may not be running — check Terminal 1 |
| Analysis takes too long | Gemini calls can take 30–90s — be patient |
