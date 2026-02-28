# AI Decision Engine

A structured strategic thinking system powered by Claude AI.

## Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite                     |
| Backend   | FastAPI (Python 3.11)               |
| AI        | Claude API (claude-sonnet-4)        |
| Deploy FE | Vercel                              |
| Deploy BE | Railway                             |
| Container | Docker + Docker Compose (local dev) |

---

## Project Structure

```
decision-engine/
├── frontend/                  # React + Vite app → deploys to Vercel
│   ├── src/
│   │   ├── components/        # UI components (split from monolith)
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
│   │   │       ├── ProbabilisticSection.jsx
│   │   │       ├── RecommendationsSection.jsx
│   │   │       ├── BiasSection.jsx
│   │   │       └── AntifragilitySection.jsx
│   │   ├── hooks/
│   │   │   └── useDecisionEngine.js   # All API + state logic
│   │   ├── lib/
│   │   │   ├── api.js                 # Axios instance + endpoints
│   │   │   └── repairJson.js          # JSON truncation repair utility
│   │   ├── styles/
│   │   │   └── globals.css            # Design system / CSS variables
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── vite.config.js
│   ├── vercel.json
│   └── package.json
│
├── backend/                   # FastAPI app → deploys to Railway
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── core/
│   │   │   ├── config.py      # Settings (env vars via pydantic)
│   │   │   └── claude.py      # Claude API client + prompt engine
│   │   ├── api/
│   │   │   └── routes.py      # POST /analyze and GET /health
│   │   ├── models/
│   │   │   └── schemas.py     # Pydantic request/response models
│   │   └── services/
│   │       └── analyzer.py    # Business logic layer
│   ├── .env.example
│   ├── requirements.txt
│   ├── Dockerfile
│   └── railway.json
│
├── docker-compose.yml         # Local full-stack dev
└── README.md
```

---

## Quick Start (Local Dev)

### Prerequisites
- Node 18+
- Python 3.11+
- Docker (optional, for compose)

### Option A — Docker Compose (recommended)

```bash
# 1. Clone and enter
git clone <your-repo>
cd decision-engine

# 2. Set env vars
cp backend/.env.example backend/.env
# → Add your ANTHROPIC_API_KEY to backend/.env

cp frontend/.env.example frontend/.env.local
# → Set VITE_API_URL=http://localhost:8000

# 3. Start everything
docker-compose up --build

# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
# API docs: http://localhost:8000/docs
```

### Option B — Manual

```bash
# Terminal 1: Backend
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # fill in ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm install
cp .env.example .env.local     # fill in VITE_API_URL
npm run dev
```

---

## Deploy to Vercel + Railway

### Backend → Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login and init
railway login
cd backend
railway init          # create new project

# 3. Set environment variable
railway variables set ANTHROPIC_API_KEY=sk-ant-...

# 4. Deploy
railway up

# 5. Copy your Railway URL: https://your-app.railway.app
```

### Frontend → Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
cd frontend
vercel

# 3. When prompted, set environment variable:
#    VITE_API_URL = https://your-app.railway.app

# Production URL will be: https://your-app.vercel.app
```

### After Deploy — Update CORS

Edit `backend/.env` on Railway:
```
ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## Environment Variables

### Backend (`backend/.env`)
```
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_ORIGINS=http://localhost:5173
PORT=8000
```

### Frontend (`frontend/.env.local`)
```
VITE_API_URL=http://localhost:8000
```

---

## API Reference

### `POST /analyze`
Analyzes a decision dilemma.

**Request:**
```json
{
  "dilemma": "Should I quit my job to pursue a startup?",
  "age": 34,
  "risk_profile": "aggressive",
  "time_horizon": "long-term"
}
```

**Response:** Full structured JSON with 11 analysis sections.

### `GET /health`
Returns `{ "status": "ok" }`

### `GET /docs`
Interactive Swagger UI (FastAPI auto-generated).

---

## Architecture Decisions

**Why FastAPI on Railway?**
Railway auto-detects the Dockerfile and provides a free tier with generous limits. FastAPI's async support is ideal for proxying Claude API calls without blocking.

**Why Vercel for frontend?**
Zero-config React/Vite deployment. Instant CDN, preview deployments on every PR, free tier.

**Why separate frontend/backend?**
- Backend holds the `ANTHROPIC_API_KEY` securely — never exposed to the browser
- Independent scaling and deployment
- Backend can be reused by mobile apps or other clients

**Why not call Claude directly from the browser?**
Calling the Anthropic API directly from the browser exposes your API key in network requests. The backend acts as a secure proxy.
