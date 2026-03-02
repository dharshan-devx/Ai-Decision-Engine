"use client";
import HelpIcon from "../HelpIcon";
function RiskCard({ risk }) {
  const color = { high: "var(--red)", medium: "var(--orange)", low: "var(--green)" }[risk.level] || "var(--text-muted)";
  return (
    <div className="risk-card">
      <div className="risk-name">{risk.name}</div>
      <div className="risk-bar-container">
        <div className="risk-bar" style={{ width: `${risk.score}%`, background: color }} />
      </div>
      <div className="risk-score" style={{ color }}>{risk.score}/100 — {risk.level}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.6 }}>{risk.description}</div>
    </div>
  );
}

export default function RiskSection({ riskAnalysis }) {
  if (!riskAnalysis?.length) return null;
  return (
    <div className="section" style={{ animationDelay: '0.2s' }}>
      <div className="section-header">
        <span className="section-num">03</span>
        <span className="section-title">Risk Analysis</span>
        <HelpIcon small tooltip="Potential failure modes, their severity, and strategies to mitigate them." />
      </div>
      <div className="risk-grid">
        {riskAnalysis.map((r, i) => <RiskCard key={i} risk={r} />)}
      </div>
    </div>
  );
}

