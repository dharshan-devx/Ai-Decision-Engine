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
        <div className="empty-state" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          textAlign: 'center',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'radial-gradient(circle at center, rgba(255,161,22,0.05) 0%, transparent 60%)'
        }}>
          {/* Decorative Grid Background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.8,
            pointerEvents: 'none'
          }}></div>

          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div className="hologram-ring">
              <div className="inner-pulse"></div>
            </div>

            <div className="glitch-title" data-text="A.I. Strategic Reasoning">
              A.I. Strategic Reasoning
            </div>

            <p className="typing-text" style={{
              maxWidth: '480px',
              color: 'var(--text-dim)',
              lineHeight: '1.7',
              fontSize: '15px',
              fontFamily: 'var(--font-sans)',
              margin: '0',
            }}>
              A high-dimensional cognitive engine designed to deconstruct complex dilemmas, model probabilistic outcomes, and neutralize human bias.
            </p>

            <div className="creator-badge">
              <span className="badge-label">ENGINEERED BY</span>
              <span className="badge-name">DHARSHAN DEVX</span>
            </div>
          </div>

          <style>
            {`
              .hologram-ring {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                border: 1px dashed var(--accent);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: spin 10s linear infinite;
                position: relative;
                box-shadow: 0 0 20px rgba(255, 161, 22, 0.2);
              }
              .inner-pulse {
                width: 24px;
                height: 24px;
                background: var(--accent);
                border-radius: 50%;
                animation: pulse 2s ease-in-out infinite alternate;
                box-shadow: 0 0 15px var(--accent);
              }
              .glitch-title {
                font-family: var(--font-display);
                font-size: 28px;
                font-weight: 700;
                color: var(--text);
                letter-spacing: 2px;
                position: relative;
                text-shadow: 0 0 15px rgba(255,161,22,0.4);
              }
              .creator-badge {
                margin-top: 24px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                padding: 12px 24px;
                border: 1px solid rgba(255, 161, 22, 0.3);
                border-radius: 30px;
                background: rgba(255, 161, 22, 0.05);
                backdrop-filter: blur(10px);
                animation: floatUp 1s ease-out forwards;
                opacity: 0;
                transform: translateY(20px);
                animation-delay: 0.5s;
                position: relative;
                overflow: hidden;
              }
              .creator-badge::before {
                content: '';
                position: absolute;
                top: 0; left: -100%; width: 50%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transform: skewX(-20deg);
                animation: shine 4s infinite 2s;
              }
              .badge-label {
                font-family: var(--font-mono);
                font-size: 9px;
                color: var(--accent);
                letter-spacing: 0.25em;
              }
              .badge-name {
                font-family: var(--font-display);
                font-size: 15px;
                font-weight: 600;
                color: var(--text);
                letter-spacing: 0.15em;
                text-transform: uppercase;
                text-shadow: 0 0 10px rgba(255,255,255,0.3);
              }
              
              @keyframes spin {
                100% { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0% { transform: scale(0.6); opacity: 0.4; }
                100% { transform: scale(1.1); opacity: 1; }
              }
              @keyframes floatUp {
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes shine {
                0% { left: -100%; }
                20% { left: 200%; }
                100% { left: 200%; }
              }
            `}
          </style>
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

