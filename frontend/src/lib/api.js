import axios from "axios";

// In production: VITE_API_URL = https://your-app.railway.app
// In dev:        VITE_API_URL = http://localhost:8000
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 120000, // 2 min — Gemini calls can be slow
});

export async function analyzeDecision({ dilemma, age, riskProfile, timeHorizon, apiKey }) {
  const { data } = await api.post("/analyze", {
    dilemma,
    age: age || null,
    risk_profile: riskProfile || "moderate",
    time_horizon: timeHorizon || "medium-term",
    api_key: apiKey || null,
  });
  return data.data; // unwrap { success, data }
}

export async function askFollowUp({ dilemma, contextSummary, question, apiKey }) {
  const { data } = await api.post("/followup", {
    dilemma,
    context_summary: contextSummary,
    question,
    api_key: apiKey || null,
  });
  return data.answer;
}

export async function getUsage() {
  const { data } = await api.get("/usage");
  return data;
}

export default api;
