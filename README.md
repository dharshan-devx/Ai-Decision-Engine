# 🧠 AI Decision Engine

An advanced multi-agent AI framework engineered to structure complex life and strategic decisions using quantified risk modeling, regret minimization, and structured synthesis.

> This is not a wrapper around an LLM.  
> This is a structured cognitive architecture.

---

![Decision Engine Preview](assets/preview.png)
---

---

# 🌍 Live Architecture

Frontend (Next.js) → FastAPI Backend → Gemini AI → Supabase (PostgreSQL) → Playwright PDF Engine

---

# 🎯 Vision

Most people make major life decisions emotionally.

This system forces structured reasoning by:

- Surfacing hidden assumptions
- Mapping opportunity costs
- Quantifying ruin risk
- Applying regret minimization
- Modeling long-term antifragility

Designed for founders, engineers, and decision-makers facing high-stakes crossroads.

---

# 👨‍💻 About the Creator

Hi, I’m **Dharshan Sondi**.

I built this because I was frustrated with vague AI responses like:

> “Follow your passion.”

I wanted AI that thinks like:
- A venture capitalist
- A risk strategist
- A McKinsey consultant
- A long-term systems thinker

So I built a three-agent reasoning engine.

---

# 🧠 Three-Agent AI Architecture

| Agent | Role | Responsibility |
|-------|------|----------------|
| 🏃 Visionary | Upside Maximizer | Explores leverage, optionality, asymmetry |
| 🛡 Risk Manager | Downside Protector | Detects ruin risk, fragility, hidden traps |
| ⚖ Synthesizer | Decision Architect | Consolidates reasoning into structured 11-point framework |

---

# 🏗️ Tech Stack

## Frontend

- Next.js (React 19)
- Vanilla CSS (Custom Glassmorphism Design System)
- Recharts (Radar Risk Visualization)
- React Flow + Dagre (Decision Trees)
- Lucide React (Icons)

## Backend

- FastAPI (Python 3.10+)
- Google Gemini SDK (`gemini-2.5-flash`)
- SQLAlchemy ORM
- Supabase (PostgreSQL)
- Playwright (Headless Chromium for PDF Export)

---

# 🔥 Engineering Challenges Solved

## 1️⃣ AI JSON Truncation

### Problem
LLM responses occasionally truncated mid-output → invalid JSON → server crash.

### Solution
Built a custom stack-based JSON repair parser:

- Walks backwards
- Closes dangling quotes
- Balances `{}` and `[]`
- Replaces incomplete keys with `null`

Guarantees valid JSON payload to frontend.

---

## 2️⃣ Async + Playwright Event Loop Crash

### Problem
On Windows + Python 3.14:
```
ValueError: I/O operation on closed pipe
```

### Solution

- Isolated PDF logic
- Used `sync_playwright()`
- Wrapped inside `asyncio.to_thread()`
- Prevented event loop contamination

Stable under concurrency.

---

## 3️⃣ Global Gemini Rate Limiting

### Problem
Shared API key → quota exhaustion.

### Solution

- Global rate tracking
- User-level key override
- Frontend custom API key injection

Prevents full system lockout.

---

## 4️⃣ Zero Layout Shift Tooltips

Standard tooltips caused scroll jumps.

Built viewport-aware, absolute-positioned custom tooltip system.

Zero layout shift guaranteed.

---

# 🗄️ Database Schema

## Table: `analyses`

| Column | Type | Description |
|--------|------|------------|
| id | UUID | Primary Key |
| dilemma | TEXT | User input |
| created_at | TIMESTAMP | Auto timestamp |
| result_data | JSONB | Structured 11-point AI output |

---

# 🧩 AI Output Framework (11 Dimensions)

| # | Component |
|---|-----------|
| 1 | Hidden Assumptions |
| 2 | Opportunity Cost Analysis |
| 3 | Ruin Risk Score |
| 4 | Expected Value Modeling |
| 5 | Regret Minimization |
| 6 | Time Horizon Impact |
| 7 | Antifragility Index |
| 8 | Emotional Bias Detection |
| 9 | Strategic Leverage Points |
| 10 | Second-Order Consequences |
| 11 | Final Decision Recommendation |

---

# 📂 Project Structure

```
decision-engine/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   └── vercel.json
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── routers/
│   │   ├── database.py
│   │   ├── db_models.py
│   │   └── main.py
│   ├── requirements.txt
│   └── render.yaml
│
└── README.md
```

---

# 🚀 Local Development Setup

## Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
playwright install chromium --with-deps
```

Create `.env`:

```
GEMINI_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
ALLOWED_ORIGINS=http://localhost:3000
```

Run:

```
uvicorn app.main:app --reload
```

Backend runs on:
```
http://localhost:8000
```

---

## Frontend

```
cd frontend
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run:

```
npm run dev
```

Frontend runs on:
```
http://localhost:3000
```

---

# 🌍 Production Deployment

## Backend → Render

1. Push repo to GitHub
2. Create Web Service
3. Root directory: `backend`
4. Build command:

```
pip install -r requirements.txt && playwright install chromium
```

5. Start command:

```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

6. Add environment variables in Render dashboard:

```
GEMINI_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

---

## Frontend → Vercel

1. Import GitHub repo
2. Root directory: `frontend`
3. Add environment variable:

```
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

Deploy.

---

# 🧪 Production Test Checklist

- Analyze dilemma
- Confirm request hits Render backend
- Confirm Gemini processes successfully
- Confirm Supabase writes record
- Confirm JSON repair works on long output
- Confirm PDF export launches Chromium

---

# 🧠 Why This Is Different

Standard LLM:
> “Do what makes you happy.”

Decision Engine:
> “Path A has 45% upside probability but 8/10 ruin risk. Path B maximizes long-term antifragility.”

This is structured decision architecture.

---

# 🤝 Open for Collaboration

If you'd like to:

- Add Anthropic/OpenAI support
- Implement authentication
- Improve AI workflow
- Build mobile version
- Contribute optimizations

Open a PR or Issue.

---

# 📬 Contact

Dharshan Sondi  
Email: dharshansondi.dev@gmail.com  
LinkedIn: https://www.linkedin.com/in/dharshansondi/

---

Built with conviction.  
Engineered for clarity.  
Designed for high-stakes decisions.
