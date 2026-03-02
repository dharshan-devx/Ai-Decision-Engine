# ⚙️ Codebase Readme & Technical Deep Dive  

Welcome to the architectural overview of the **AI Decision Engine**. This document is written for developers and engineers who want a deep understanding of how this system works internally, the edge cases I solved, the backend architecture, and the exact steps to deploy this project to production.

---

## 🏗️ Technical Stack  

### **Frontend (Client Layer)**
- **Framework:** Next.js (React 19)  
- **Styling:** Vanilla CSS (Zero-dependency, custom Glassmorphism token-based design system)  
- **Data Visualization:** Recharts (Risk & Skill Radar Charts), React Flow / Dagre (Decision Tree Generation)  
- **Icons:** Lucide-React  

### **Backend (Server Layer)**
- **Framework:** FastAPI (Python 3.10+)  
- **AI Engine:** Google Gemini SDK (`gemini-2.5-flash`)  
- **Database:** Supabase (PostgreSQL) via SQLAlchemy  
- **PDF Generation:** Playwright (Headless Chromium)  

---

## 🔥 Backend Architecture & Resilience  

The backend is designed to be highly fault-tolerant and production-ready. During development, I encountered several complex issues related to asynchronous AI execution, JSON integrity, and headless browser concurrency — and resolved them systematically.

### Key Edge Cases I Solved  

### 1️⃣ AI JSON Truncation — Custom Stack Parser  

**Problem:**  
The LLM occasionally returned long outputs that were abruptly truncated mid-response, breaking strict JSON formatting. A direct `json.loads()` call would crash the server.

**Solution:**  
I built a custom mathematical stack-based JSON repair algorithm.  

The parser:
- Walks backward through the response
- Closes dangling quotes
- Matches unclosed `{}` and `[]`
- Replaces incomplete map keys with `null`

This guarantees that the frontend always receives valid JSON — even if the LLM output is partially cut off.

---

### 2️⃣ Windows Asyncio + Playwright Pipe Crash  

**Problem:**  
On Python 3.14 with Uvicorn (Windows), asynchronous Playwright execution triggered:

```
ValueError: I/O operation on closed pipe
```

This corrupted the event loop and crashed the application.

**Solution:**  
I isolated PDF generation inside `routers/export.py` and implemented:

- `sync_playwright()` execution
- Wrapped inside `asyncio.to_thread()` for thread-safe execution
- Fully separated from the main async event loop

This prevents event loop contamination and ensures stable PDF generation.

---

### 3️⃣ Global API Rate Limiting  

**Problem:**  
A shared global Gemini API key could quickly hit quota limits under heavy usage.

**Solution:**  
I implemented:
- An application-wide rate limiter tracker  
- A user-level override mechanism  

Users can inject their own Google AI Studio API key directly via the UI, bypassing the global rate constraints entirely.

This keeps the system scalable and prevents platform-wide lockouts.

---

### 4️⃣ Zero Layout Shift Help Icons  

**Problem:**  
Standard tooltips caused scrollbar jumps and layout shifts.

**Solution:**  
I built a custom absolute-positioned `HelpIcon.jsx` component with:
- Viewport-aware bounding logic
- Scroll-stable positioning
- Zero layout shift guarantee

---

## 🌍 Real-World Impact  

People typically make major life decisions based on emotion, bias, or social pressure.

This system forces structured reasoning through a Synthesizer Pattern:

1. Hidden assumptions are surfaced explicitly.
2. Opportunity costs are mapped as quantifiable financial metrics.
3. A Regret Minimization Framework scores each path mathematically.

The result is a rational, structured decision architecture designed for founders, engineers, executives, and anyone facing high-impact crossroads.

---

# 🚁 Production Deployment Guide  

The repository is configured for clean deployment using:

- **Vercel** → Frontend  
- **Render** → Backend  

---

## 🔹 Deploying the Backend (Render)

Render uses `render.yaml` as infrastructure-as-code.

### Steps:

1. Push the repository to GitHub.
2. Navigate to Render → Blueprints.
3. Connect the GitHub repository.
4. Render automatically reads `backend/render.yaml`.

### Environment Variables (Required)

Set the following in the Render Dashboard:

```
GEMINI_API_KEY = your_api_key
SUPABASE_URL = your_database_url
SUPABASE_KEY = your_database_anon_key
ALLOWED_ORIGINS = https://your-vercel-domain.vercel.app
```

### Playwright Note  

The `render.yaml` includes:

```
playwright install chromium --with-deps
```

This ensures Chromium installs correctly inside the Linux container for PDF generation.

---

## 🔹 Deploying the Frontend (Vercel)

1. Go to Vercel → Add New Project  
2. Import your GitHub repository  
3. Set **Root Directory** to `frontend`  
4. Framework Preset auto-detects Next.js  

### Environment Variable:

```
NEXT_PUBLIC_API_URL = https://your-render-backend.onrender.com
```

Click **Deploy**.

Vercel automatically reads `vercel.json` and `package.json` for build configuration.

---

## 🧪 End-to-End Production Test  

After deployment:

1. Open your Vercel domain.
2. Enter a dilemma.
3. Click **Analyze**.
4. Confirm:
   - Request hits Render backend
   - Gemini processes successfully
   - Response writes to Supabase
   - JSON repair logic handles edge cases
5. Export PDF to verify Playwright launches properly in production.

---

## 🎯 Final Notes  

This system is engineered to be:

- Fault-tolerant  
- AI-output resilient  
- Async-safe  
- Rate-limit aware  
- Deployment-ready  

Every architectural decision prioritizes reliability, user flexibility, and production stability.

This is not a demo-level AI wrapper — it is a structured, decision-optimization engine built for real-world usage.