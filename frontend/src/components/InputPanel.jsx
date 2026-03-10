"use client";
import HelpIcon from "./HelpIcon";
import CustomSelect from "./CustomSelect";
import VoiceInput from "./VoiceInput";

const EXAMPLES = [
  "Should I prioritize building my own future in another city or country, even if it means being away from my parents when they’re slowly growing older?",
  "I feel exhausted, unmotivated, and constantly comparing myself to others ~ should I slow down and focus on my mental health, or keep pushing so I don’t fall behind?",
  "Should I study what genuinely interests me, even if the path is uncertain, or choose a safer field just to guarantee financial stability?",
];

export default function InputPanel({
  dilemma, setDilemma,
  age, setAge,
  riskProfile, setRiskProfile,
  timeHorizon, setTimeHorizon,
  language, setLanguage,
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
        <VoiceInput
          onTranscript={(text) => setDilemma(prev => prev ? `${prev} ${text}` : text)}
          language={language}
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
          <CustomSelect
            value={riskProfile}
            onChange={setRiskProfile}
            options={[
              { value: "conservative", label: "Conservative" },
              { value: "moderate", label: "Moderate" },
              { value: "aggressive", label: "Aggressive" },
              { value: "contrarian", label: "Contrarian" },
            ]}
          />
        </div>
        <div>
          <div className="field-label" style={{ display: 'flex', alignItems: 'center' }}>
            Time Horizon
            <HelpIcon tooltip="The relevancy timeframe prioritizes immediate vs delayed outcomes." />
          </div>
          <CustomSelect
            value={timeHorizon}
            onChange={setTimeHorizon}
            options={[
              { value: "short-term", label: "Short-term (1–2 yr)" },
              { value: "medium-term", label: "Medium-term (3–5 yr)" },
              { value: "long-term", label: "Long-term (5–10+ yr)" },
            ]}
          />
        </div>
        <div>
          <div className="field-label" style={{ display: 'flex', alignItems: 'center' }}>
            Response Language
            <HelpIcon tooltip="Choose the language for the analysis output. You can type your dilemma in any language." />
          </div>
          <CustomSelect
            value={language}
            onChange={setLanguage}
            options={[
              { value: "english", label: "English" },
              { value: "hindi", label: "हिन्दी (Hindi)" },
              { value: "telugu", label: "తెలుగు (Telugu)" },
            ]}
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <div className="field-label" style={{ display: 'flex', alignItems: 'center' }}>
            Gemini API Key (Required)
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
            placeholder="AIza..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
      </div>

      <button
        className="analyze-btn"
        onClick={onAnalyze}
        disabled={!dilemma.trim() || !apiKey.trim() || loading}
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

