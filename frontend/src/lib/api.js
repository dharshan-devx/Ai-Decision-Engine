"use client";
import axios from "axios";

// In production: VITE_API_URL = https://your-app.railway.app
// In dev:        VITE_API_URL = http://localhost:8000
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL + "/api", // added /api prefix
  headers: { "Content-Type": "application/json" },
  timeout: 300000, // 5 min — Gemini calls can be slow
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("de_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function analyzeDecision({ dilemma, age, riskProfile, timeHorizon, context, apiKey, language }) {
  const { data } = await api.post("/analyze", {
    dilemma,
    age: age || null,
    risk_profile: riskProfile || "moderate",
    time_horizon: timeHorizon || "medium-term",
    context: context || null,
    api_key: apiKey || null,
    language: language || "english",
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

export async function loginUser(username, password) {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  const { data } = await api.post("/auth/login", params, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  return data;
}

export async function registerUser(email, password) {
  const { data } = await api.post("/auth/register", { email, password });
  return data;
}

export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function getHistory() {
  const { data } = await api.get("/history");
  return data;
}

export async function saveHistoryApi(payload) {
  const { data } = await api.post("/history", payload);
  return data;
}

export async function deleteHistoryApi(id) {
  const { data } = await api.delete(`/history/${id}`);
  return data;
}

export async function clearHistoryApi() {
  const { data } = await api.delete("/history");
  return data;
}

export async function createShareLink(dilemma, dataPayload) {
  const { data } = await api.post("/share", { dilemma, data: dataPayload });
  return data;
}

export async function getSharedAnalysis(id) {
  const { data } = await api.get(`/share/${id}`);
  return data;
}

export async function trackVisit(visitorId) {
  const { data } = await api.post("/stats/visit", { visitor_id: visitorId });
  return data;
}

export async function getSiteStats() {
  const { data } = await api.get("/stats");
  return data;
}

export default api;

