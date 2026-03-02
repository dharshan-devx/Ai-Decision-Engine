# 🧠 AI Decision Engine

An extremely powerful, multi-agent AI framework designed to maximize strategic reasoning, evaluate risk, eliminate cognitive bias, and discover hidden opportunities for tough life and professional choices.

![Decision Engine Preview](https://via.placeholder.com/800x400.png?text=AI+Decision+Engine+Screenshot) *(Imagine a beautiful glassmorphism dark-themed dashboard here)*

## 🌟 About the Project

We all face hard choices. *Should I quit my job? Should I learn this new framework? Should I launch a startup?* The **AI Decision Engine** removes the paralyzing fear of the unknown by breaking down your dilemmas using a rigorous, multi-faceted analytical model modeled after McKinsey consultants, venture capitalists, and risk strategists.

### 🤖 Why This Project? vs Standard LLMs (like ChatGPT)

Normal LLMs: 
"You should do what makes you happy! But remember to be careful!" 🤷‍♂️ (Vague, fluffy, overly safe)

**AI Decision Engine**: 
"Path A has a 45% success probability but a catastrophic 'Ruin' risk of 8/10. Path B has severe short-term opportunity costs but maximizes your 10-year Antifragility score." 🗡️ (Rigorous, quantified, strategic)

We achieve this using a proprietary **Three-Agent System**:
*   🏃‍♂️ **Agent A (The Visionary):** Argues fiercely for the maximum upside and optionality.
*   🛡️ **Agent B (The Risk Manager):** Stress-tests the idea for ruin thresholds and downside exposure.
*   ⚖️ **Agent C (The Synthesizer):** Consolidates both arguments, detects cognitive biases, and structures the final 11-point multidimensional output.

## 🚀 How to Open, Start, Run, and Test

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Gemini API Key ([Get one here](https://aistudio.google.com/))
- Supabase Project (for PostgreSQL database)

### Backend (FastAPI / Python)
1. Navigate to the `backend` folder: `cd backend`
2. Create and activate a virtual environment:
   * Windows: `python -m venv venv` and `.\venv\Scripts\activate`
   * Mac/Linux: `python3 -m venv venv` and `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Install Playwright binaries for PDF generation: `playwright install chromium --with-deps`
5. Create a `.env` file based on `.env.example`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ALLOWED_ORIGINS=http://localhost:3000
   ```
6. Start the server: `uvicorn app.main:app --reload` (Runs on port 8000)

### Frontend (Next.js / React)
1. Navigate to the `frontend` folder: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start the development server: `npm run dev` (Runs on port 3000)
5. Open your browser and go to `http://localhost:3000`!

## 📂 Folder Structure

```
decision-engine/
│
├── frontend/                # Next.js React Frontend
│   ├── src/
│   │   ├── app/             # Application routes & layout
│   │   ├── components/      # Glassmorphism UI Components (Results, Compare, Inputs)
│   │   ├── hooks/           # Custom React hooks (useDecisionEngine)
│   │   ├── lib/             # API clients & utilities
│   │   └── styles/          # Global CSS & Design System
│   ├── package.json
│   └── vercel.json          # Deployment config
│
├── backend/                 # FastAPI Python Backend
│   ├── app/
│   │   ├── core/            # AI Prompts, Models, and JSON Repair logic
│   │   ├── routers/         # API Routes (analysis, share, export)
│   │   ├── main.py          # FastAPI Entry Point
│   │   ├── database.py      # Supabase connection
│   │   └── db_models.py     # SQLAlchemy Data Models
│   ├── requirements.txt
│   └── render.yaml          # Deployment config
│
├── .gitignore
├── README.md                # You are here!
└── CodebaseReadme.md        # Technical deep-dive documentation
```

## 🗄️ Database Schema (Supabase / PostgreSQL)

**Table: `analyses`**
Stores the output of AI generations for persistent sharing and History tracking.
*   `id` (UUID, Primary Key)
*   `dilemma` (Text)
*   `created_at` (Timestamp)
*   `result_data` (JSONB - Stores the massive 11-point framework payload)

## 🤝 Open to Contribute & Collaborate!

Hi! My name is **Dharshan Sondi**. I passionately built this tool because I believe everyone should have access to elite-level cognitive reasoning when making life-altering choices.

This project is entirely **Open Source**. 

I am incredibly open to collaboration! If you want to:
*   Add a new AI Provider (Anthropic, OpenAI)
*   Build a user authentication system
*   Create a mobile app wrapped version
*   Find and fix bugs

Feel free to open an Issue or a Pull Request! 

📧 Contact me directly: [dharshansondi.dev@gmail.com](mailto:dharshansondi.dev@gmail.com)
🔗 LinkedIn: [Dharshan Sondi](https://www.linkedin.com/in/dharshansondi/)
