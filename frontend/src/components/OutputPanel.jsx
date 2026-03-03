"use client";
import { useEffect, useRef } from "react";
import ErrorBoundary from "./ErrorBoundary";
import Results from "./Results";
import FollowUp from "./FollowUp";
import NeuralBrain from "./NeuralBrain";
import { LOADING_STEPS } from "../hooks/useDecisionEngine";

export default function OutputPanel({ loading, loadingStep, result, error, dilemma, apiKey, onShare, onExportPDF }) {
  const loadingRef = useRef(null);

  useEffect(() => {
    if (loading && loadingRef.current) {
      loadingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading]);

  return (
    <div className="output-panel">

      {!loading && !result && !error && (
        <div className="empty-state">
          <div className="empty-icon">⟳</div>
          <div className="empty-title">No decision loaded</div>
          <div className="empty-sub">
            Input your dilemma above. The engine will decompose it into structured strategic
            components, model probabilistic outcomes, and surface cognitive biases obscuring your judgment.
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-brain-state" ref={loadingRef}>
          <NeuralBrain />
          <div className="loading-brain-steps">
            <div className="loading-brain-title">Processing Decision Structure</div>
            <div className="loading-steps-list">
              {LOADING_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`loading-step-item${i === loadingStep ? " active" : i < loadingStep ? " done" : ""}`}
                >
                  <span className="step-indicator">
                    {i < loadingStep ? "✓" : i === loadingStep ? "●" : "○"}
                  </span>
                  <span className="step-label">{step}</span>
                </div>
              ))}
            </div>
            <div className="loading-progress-bar">
              <div
                className="loading-progress-fill"
                style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-state">
          <div style={{ marginBottom: 8, fontFamily: "var(--font-display)", fontSize: 16 }}>Analysis Error</div>
          {error}
          <div style={{ marginTop: 12, color: "var(--text-dim)" }}>
            Check that the backend is running, your GEMINI_API_KEY is set, and you have sufficient API Quota.
          </div>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Action buttons moved to page.jsx */}

          <ErrorBoundary>
            <Results data={result} dilemma={dilemma} />
          </ErrorBoundary>

          <FollowUp dilemma={dilemma} analysisData={result} apiKey={apiKey} />
        </>
      )}

    </div>
  );
}

