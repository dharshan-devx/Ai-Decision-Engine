"use client";
import { useState } from "react";
import PathComparisonChart from "../charts/PathComparisonChart";

function PathCard({ path, index }) {
  const [open, setOpen] = useState(index === 0);
  const probColor = path.successProbability >= 65 ? "var(--green)" : path.successProbability >= 40 ? "var(--orange)" : "var(--red)";

  return (
    <div className={`path-card${path.recommended ? " recommended" : ""}`}>
      <div className="path-header" onClick={() => setOpen(!open)}>
        <div className="path-header-left">
          <span className="path-num">PATH {String(index + 1).padStart(2, "0")}</span>
          <span className="path-name">{path.name}</span>
          {path.recommended && <span className="path-badge">Recommended</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="path-prob" style={{ color: probColor }}>{path.successProbability}%</span>
          <span style={{ color: "var(--text-dim)", fontSize: 12, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▼</span>
        </div>
      </div>

      {open && (
        <div className="path-body">
          <div className="path-field full">
            <div className="path-field-label">Description</div>
            <div className="path-field-value">{path.description}</div>
          </div>
          <div className="path-field">
            <div className="path-field-label">Timeline</div>
            <div className="path-field-value">{path.timeline}</div>
          </div>
          <div className="path-field">
            <div className="path-field-label">Resources Required</div>
            <div className="path-field-value">{path.resourceRequirement}</div>
          </div>
          <div className="path-field">
            <div className="path-field-label">Best Case</div>
            <div className="path-field-value" style={{ color: "var(--green)" }}>{path.bestCase}</div>
          </div>
          <div className="path-field">
            <div className="path-field-label">Worst Case</div>
            <div className="path-field-value" style={{ color: "var(--red)" }}>{path.worstCase}</div>
          </div>
          <div className="path-field full">
            <div className="path-field-label">Risk-Adjusted Value</div>
            <div className="path-field-value">{path.riskAdjustedValue}</div>
          </div>
          <div className="path-field full">
            <div className="path-field-label">Reversibility</div>
            <div className="reversibility-bar">
              <div className="rev-track">
                <div className="rev-fill" style={{ width: `${path.reversibilityScore}%` }} />
              </div>
              <span className="rev-label">{path.reversibilityScore}/100</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PathsSection({ strategicPaths }) {
  if (!strategicPaths?.length) return null;
  return (
    <div className="section" style={{ animationDelay: '0.35s' }}>
      <div className="section-header">
        <span className="section-num">06</span>
        <span className="section-title">Strategic Paths</span>
      </div>
      <div className="paths-container">
        {strategicPaths.map((p, i) => <PathCard key={i} path={p} index={i} />)}
      </div>
      <PathComparisonChart paths={strategicPaths} />
    </div>
  );
}

