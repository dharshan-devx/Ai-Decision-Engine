import { useState, useRef } from "react";
import { analyzeDecision } from "../lib/api";

export const LOADING_STEPS = [
  "Decomposing decision structure",
  "Mapping constraints and dependencies",
  "Running risk heuristics",
  "Generating strategic paths",
  "Calibrating probabilistic model",
  "Computing antifragility scores",
  "Detecting cognitive bias patterns",
  "Synthesizing recommendation engine",
];

export function useDecisionEngine() {
  const [dilemma, setDilemma]       = useState("");
  const [age, setAge]               = useState("");
  const [riskProfile, setRiskProfile] = useState("moderate");
  const [timeHorizon, setTimeHorizon] = useState("medium-term");
  const [loading, setLoading]       = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);
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

  const handleAnalyze = async () => {
    if (!dilemma.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    startLoadingAnimation();
    try {
      const res = await analyzeDecision({ dilemma, age, riskProfile, timeHorizon });
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
    // form state
    dilemma, setDilemma,
    age, setAge,
    riskProfile, setRiskProfile,
    timeHorizon, setTimeHorizon,
    // async state
    loading, loadingStep, result, error,
    // actions
    handleAnalyze,
  };
}
