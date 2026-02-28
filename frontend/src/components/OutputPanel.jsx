import { useEffect, useRef } from "react";
import Results from "./Results";
import { LOADING_STEPS } from "../hooks/useDecisionEngine";

export default function OutputPanel({ loading, loadingStep, result, error, dilemma }) {
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
        <div className="loading-state" ref={loadingRef}>
          <div className="spinner" />
          <div className="loading-title">Processing decision structure</div>
          <div className="loading-steps">
            {LOADING_STEPS.map((step, i) => (
              <div
                key={i}
                className={`loading-step${i === loadingStep ? " active" : i < loadingStep ? " done" : ""}`}
              >
                <span className="step-icon">
                  {i < loadingStep ? "✓" : i === loadingStep ? "›" : "·"}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="error-state">
          <div style={{ marginBottom: 8, fontFamily: "var(--font-display)", fontSize: 16 }}>Analysis Error</div>
          {error}
          <div style={{ marginTop: 12, color: "var(--text-dim)" }}>
            Check that the backend is running and GEMINI_API_KEY is set correctly.
          </div>
        </div>
      )}

      {result && !loading && <Results data={result} dilemma={dilemma} />}

    </div>
  );
}
