const EXAMPLES = [
  "Should I quit my job at a stable tech company to pursue a B2B SaaS startup in the HR space?",
  "Should I order a large pepperoni pizza for myself at 2 AM even though I'm supposed to be on a diet, or just eat sad carrots?",
  "I'm considering relocating my family across the country for a high-paying executive role, but my kids are finally settled in their schools. Is the financial gain worth the familial disruption?",
];

export default function InputPanel({
  dilemma, setDilemma,
  age, setAge,
  riskProfile, setRiskProfile,
  timeHorizon, setTimeHorizon,
  apiKey, setApiKey,
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
        <div style={{ gridColumn: "1 / -1" }}>
          <div className="field-label">Custom Gemini API Key (Optional)</div>
          <input
            className="field-input"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
      </div>

      <button
        className="analyze-btn"
        onClick={onAnalyze}
        disabled={!dilemma.trim() || loading}
      >
        {loading ? "Analyzing…" : "Run Strategic Analysis"}
      </button>

      {!loading && (
        <>
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
        </>
      )}
    </div>
  );
}
