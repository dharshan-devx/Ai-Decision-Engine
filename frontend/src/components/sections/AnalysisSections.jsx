export function ProbabilisticSection({ probabilisticModel }) {
  if (!probabilisticModel) return null;
  return (
    <div className="section" style={{ animationDelay: '0.4s' }}>
      <div className="section-header">
        <span className="section-num">07</span>
        <span className="section-title">Probabilistic Outcomes</span>
      </div>
      <div className="prob-grid">
        {Object.values(probabilisticModel).map((p, i) => (
          <div key={i} className="prob-card">
            <div className="prob-horizon">{p.horizon}</div>
            <div className="prob-value">{p.probability}%</div>
            <div className="prob-desc">{p.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecommendationsSection({ recommendations }) {
  if (!recommendations) return null;
  const labels = {
    mostRational: "Most Rational",
    mostAggressive: "Most Aggressive",
    mostConservative: "Most Conservative",
    olderSelfView: "Older Self",
    highAgencyView: "High Agency",
  };
  return (
    <div className="section" style={{ animationDelay: '0.45s' }}>
      <div className="section-header">
        <span className="section-num">08</span>
        <span className="section-title">Recommendation Engine</span>
      </div>
      <div className="recommendations-grid">
        {Object.entries(recommendations).map(([k, v]) => (
          <div key={k} className="rec-card">
            <div className="rec-archetype">{labels[k] || k}</div>
            <div className="rec-choice">{v.choice}</div>
            <div className="rec-reasoning">{v.reasoning}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BiasSection({ biasDetection }) {
  if (!biasDetection?.length) return null;
  return (
    <div className="section" style={{ animationDelay: '0.5s' }}>
      <div className="section-header">
        <span className="section-num">09</span>
        <span className="section-title">Cognitive Bias Detection</span>
      </div>
      <div className="bias-list">
        {biasDetection.map((b, i) => (
          <div key={i} className="bias-item">
            <div className="bias-name">{b.biasName}</div>
            <div className="bias-desc">{b.description}</div>
            {b.mitigation && <div className="bias-mitigation">Mitigation: {b.mitigation}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AntifragilitySection({ antifragilityScore }) {
  if (!antifragilityScore) return null;
  return (
    <div className="section" style={{ animationDelay: '0.55s' }}>
      <div className="section-header">
        <span className="section-num">10</span>
        <span className="section-title">Antifragility Score</span>
      </div>
      <div className="antifragility-score">
        <div>
          <div className="af-label">Overall</div>
          <div className="af-number">{antifragilityScore.overall}</div>
        </div>
        <div className="af-info">
          <div className="af-bars">
            {antifragilityScore.dimensions && Object.entries(antifragilityScore.dimensions).map(([k, v]) => (
              <div key={k} className="af-bar-row">
                <div className="af-bar-label">{k.replace(/([A-Z])/g, " $1").trim()}</div>
                <div className="af-bar-track">
                  <div className="af-bar-fill" style={{ width: `${v}%` }} />
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", minWidth: 24 }}>{v}</span>
              </div>
            ))}
          </div>
          {antifragilityScore.interpretation && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.6 }}>
              {antifragilityScore.interpretation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
