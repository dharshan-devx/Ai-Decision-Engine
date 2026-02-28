const EXAMPLES = [
  "Should I quit my job at a stable tech company to pursue a B2B SaaS startup in the HR space?",
  "I'm considering relocating from NYC to Berlin for a senior engineering role — 40% salary cut but better quality of life.",
  "Should I pursue an MBA at a top-10 school at 32, or continue building my consulting practice independently?",
];

export default function InputPanel({
  dilemma, setDilemma,
  age, setAge,
  riskProfile, setRiskProfile,
  timeHorizon, setTimeHorizon,
  loading, onAnalyze,
}) {
  return (
    <div className="input-panel">
      <div className="panel-title">Decision Input</div>

      <div className="dilemma-area">
        <textarea
          className="dilemma-textarea"
          placeholder="Describe your decision or dilemma in plain language. Be specific about context, constraints, and what's at stake..."
          value={dilemma}
          onChange={(e) => setDilemma(e.target.value)}
          rows={6}
        />
      </div>

      <div className="context-fields">
        <div>
          <div className="field-label">Age (optional)</div>
          <input
            className="field-input"
            type="number"
            placeholder="e.g. 32"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <div>
          <div className="field-label">Risk Profile</div>
          <select className="field-select" value={riskProfile} onChange={(e) => setRiskProfile(e.target.value)}>
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
            <option value="contrarian">Contrarian</option>
          </select>
        </div>
        <div>
          <div className="field-label">Time Horizon</div>
          <select className="field-select" value={timeHorizon} onChange={(e) => setTimeHorizon(e.target.value)}>
            <option value="short-term">Short-term (1–2 yr)</option>
            <option value="medium-term">Medium-term (3–5 yr)</option>
            <option value="long-term">Long-term (5–10+ yr)</option>
          </select>
        </div>
      </div>

      <button
        className="analyze-btn"
        onClick={onAnalyze}
        disabled={!dilemma.trim() || loading}
      >
        {loading ? "Analyzing…" : "Run Strategic Analysis"}
      </button>

      <div className="divider" />

      <div>
        <div className="panel-title" style={{ marginBottom: 10 }}>Example Dilemmas</div>
        <div className="example-prompts">
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="example-chip" onClick={() => setDilemma(ex)}>
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
