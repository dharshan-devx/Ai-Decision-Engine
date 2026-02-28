import axios from "axios";

// In production: VITE_API_URL = https://your-app.railway.app
// In dev:        VITE_API_URL = http://localhost:8000
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 120000, // 2 min — Claude calls can be slow
});

export async function analyzeDecision({ dilemma, age, riskProfile, timeHorizon }) {
  const { data } = await api.post("/analyze", {
    dilemma,
    age: age || null,
    risk_profile: riskProfile || "moderate",
    time_horizon: timeHorizon || "medium-term",
  });
  return data.data; // unwrap { success, data }
}

export default api;
