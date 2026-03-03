"use client";
import { useState, useRef } from "react";
import { analyzeDecision } from "../lib/api";

export const LOADING_STEPS = [
  "Agent A (Optimist) is exploring maximum upside...",
  "Agent B (Risk Manager) is stress-testing failure modes...",
  "Agent C (Synthesizer) is balancing perspectives...",
  "Generating multi-branch decision tree...",
  "Calibrating probabilistic confidence model...",
  "Running bias detection heuristics...",
  "Finalizing executive recommendation...",
];

export function useDecisionEngine() {
  const [dilemma, setDilemma] = useState("");
  const [age, setAge] = useState("");
  const [riskProfile, setRiskProfile] = useState("moderate");
  const [timeHorizon, setTimeHorizon] = useState("medium-term");
  const [apiKey, setApiKey] = useState("");
  const [language, setLanguage] = useState("english");
  const [context, setContext] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const stepInterval = useRef(null);

  const startLoadingAnimation = () => {
    setLoadingStep(0);
    let i = 0;
    stepInterval.current = setInterval(() => {
      i++;
      setLoadingStep(i);
      if (i >= LOADING_STEPS.length - 1) clearInterval(stepInterval.current);
    }, 900);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const host = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${host}/api/upload-context`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setContext((prevText) => prevText + "\n\n" + data.text);
    } catch (e) {
      setError(e.message || "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!dilemma.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    startLoadingAnimation();
    try {
      const res = await analyzeDecision({ dilemma, age, riskProfile, timeHorizon, context, apiKey, language });
      setResult(res);
    } catch (e) {
      const msg = e?.response?.data?.detail || e.message || "Analysis failed";
      setError(msg);
    } finally {
      clearInterval(stepInterval.current);
      setLoading(false);
    }
  };

  return {
    dilemma, setDilemma,
    age, setAge,
    riskProfile, setRiskProfile,
    timeHorizon, setTimeHorizon,
    context, setContext,
    apiKey, setApiKey,
    language, setLanguage,
    loading, loadingStep, result, error,
    uploading, handleFileUpload,
    setResult,
    handleAnalyze,
  };
}

