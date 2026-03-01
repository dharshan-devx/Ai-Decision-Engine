# Running the AI Decision Engine

To run the application locally on Windows, you need to start both the Python backend and the Next.js frontend in separate terminal windows.

## 1. Start the Backend (FastAPI)

Open your first terminal and run the following commands from the project root:

```powershell
cd backend
# Activate the virtual environment
.\venv\Scripts\Activate.ps1
# Start the FastAPI server on port 8000
uvicorn app.main:app --port 8000 --reload
```

*Note: The backend must be running for the frontend to successfully analyze decisions or check API health.*

---

## 2. Start the Frontend (Next.js)

Open a **new, second terminal** and run the following commands from the project root:

```powershell
cd frontend
# Start the Next.js development server
npm run dev
```

---

## 3. Access the Application

Once both servers have fully started, open your web browser:
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)
