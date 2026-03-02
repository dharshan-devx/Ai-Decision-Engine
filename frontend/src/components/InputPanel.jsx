"use client";
import HelpIcon from "./HelpIcon";

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
  context, setContext,
  uploading, onFileUpload,
  apiKey, setApiKey,
  loading, hasResult, onAnalyze,
}) {
  return (
    <div className="input-panel">
      <div className="panel-title" style={{ display: 'flex', alignItems: 'center' }}>
        Decision Input
        <HelpIcon tooltip="Your specific choice or problem. This sets the boundary for the entire analysis." />
      </div>

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
          <div className="field-label" style={{ display: 'flex', alignItems: 'center' }}>
            Age (optional)
            <HelpIcon tooltip="Your current age calibrates the AI's risk and timeline recommendations." />
          </div>
          <input
            className="field-input"
            type="number"
            placeholder="e.g. 32"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <div>
          <div className="field-label" style={{ display: 'flex', alignItems: 'center' }}>
            Risk Profile
            <HelpIcon tooltip="Your tolerance for failure filters out overly conservative or recklessly aggressive paths based on your comfort." />
          </div>
          <select className="field-select" value={riskProfile} onChange={(e) => setRiskProfile(e.target.value)}>
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
            <option value="contrarian">Contrarian</option>
          </select>
        </div>
        <div>
          <div className="field-label" style={{ display: 'flex', alignItems: 'center' }}>
            Time Horizon
            <HelpIcon tooltip="The relevancy timeframe prioritizes immediate vs delayed outcomes." />
          </div>
          <select className="field-select" value={timeHorizon} onChange={(e) => setTimeHorizon(e.target.value)}>
            <option value="short-term">Short-term (1–2 yr)</option>
            <option value="medium-term">Medium-term (3–5 yr)</option>
            <option value="long-term">Long-term (5–10+ yr)</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <div className="field-label" style={{ display: 'flex', alignItems: 'center' }}>
            Custom Gemini API Key (Optional)
            <HelpIcon tooltip="Bring your own API key to bypass shared server rate limits and route heavy analysis directly through your private quota." />
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--green)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid var(--green-dim)', padding: '2px 6px', borderRadius: '4px', background: 'var(--surface2)' }}>Bypasses Global Limits</span>
              <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontSize: '11px', textDecoration: 'none', background: 'var(--surface2)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                Get Key
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </div>
          </div>
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

      {!loading && !hasResult && (
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

