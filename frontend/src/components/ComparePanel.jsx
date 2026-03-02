"use client";
import { useState, useEffect } from "react";
import { analyzeDecision } from "../lib/api";
import OutputPanel from "./OutputPanel";
import HelpIcon from "./HelpIcon";

export default function ComparePanel({ saveAnalysis, restoreData, age, riskProfile, timeHorizon }) {
    const [dilemmaA, setDilemmaA] = useState("");
    const [dilemmaB, setDilemmaB] = useState("");
    const [resultA, setResultA] = useState(null);
    const [resultB, setResultB] = useState(null);
    const [loadingA, setLoadingA] = useState(false);
    const [loadingB, setLoadingB] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [error, setError] = useState(null);
    const [comparisonSaved, setComparisonSaved] = useState(false);

    useEffect(() => {
        if (restoreData) {
            setDilemmaA(restoreData.sideA?.dilemma || "");
            setResultA(restoreData.sideA?.result || null);
            setDilemmaB(restoreData.sideB?.dilemma || "");
            setResultB(restoreData.sideB?.result || null);
            setComparisonSaved(true);
        }
    }, [restoreData]);

    useEffect(() => {
        if (resultA && resultB && !comparisonSaved) {
            const combinedData = {
                type: "comparison",
                comparisonData: {
                    sideA: { dilemma: dilemmaA, result: resultA },
                    sideB: { dilemma: dilemmaB, result: resultB }
                }
            };
            const unifiedDilemma = `Compare: A) ${dilemmaA.substring(0, 50)}... VS B) ${dilemmaB.substring(0, 50)}...`;

            if (saveAnalysis) {
                saveAnalysis({
                    dilemma: unifiedDilemma,
                    age: age || "",
                    riskProfile: riskProfile || "moderate",
                    timeHorizon: timeHorizon || "medium-term",
                    data: combinedData
                });
                setComparisonSaved(true);
            }
        }
    }, [resultA, resultB, comparisonSaved, dilemmaA, dilemmaB, saveAnalysis]);

    const runAnalysis = async (side) => {
        setComparisonSaved(false);
        const dilemma = side === "A" ? dilemmaA : dilemmaB;
        if (!dilemma.trim()) return;
        const setLoading = side === "A" ? setLoadingA : setLoadingB;
        const setResult = side === "A" ? setResultA : setResultB;
        setLoading(true);
        setError(null);
        try {
            const res = await analyzeDecision({
                dilemma,
                age: age || "",
                riskProfile: riskProfile || "moderate",
                timeHorizon: timeHorizon || "medium-term",
                apiKey
            });
            setResult(res);
        } catch (e) {
            setError(e?.response?.data?.detail || e.message || "Analysis failed");
        } finally {
            setLoading(false);
        }
    };

    const renderCompactResult = (result) => {
        if (!result) return null;
        return (
            <div className="compare-result">
                {/* Core Decision */}
                <div className="compare-card">
                    <div className="card-label">Core Decision</div>
                    <div className="card-value">{result.problemFraming?.coreDecision}</div>
                </div>
                <div className="compare-card">
                    <div className="card-label">Type</div>
                    <div className="card-value">{result.problemFraming?.decisionType}</div>
                </div>

                {/* Confidence */}
                <div className="compare-card">
                    <div className="card-label">Confidence</div>
                    <div className="compare-big-num" style={{ color: "var(--accent)" }}>
                        {result.confidenceScore}<span style={{ fontSize: 14, color: "var(--text-muted)" }}>/100</span>
                    </div>
                </div>

                {/* Risks */}
                {result.riskAnalysis?.length > 0 && (
                    <div className="compare-card">
                        <div className="card-label">Top Risks</div>
                        {result.riskAnalysis.slice(0, 3).map((r, i) => (
                            <div key={i} className="compare-risk-row">
                                <span>{r.name}</span>
                                <span className={`risk-badge risk-${r.level}`}>{r.score}/100</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recommended Path */}
                {result.strategicPaths?.length > 0 && (
                    <div className="compare-card">
                        <div className="card-label">Strategic Paths</div>
                        {result.strategicPaths.map((p, i) => (
                            <div key={i} className="compare-path-row">
                                <span>{p.name} {p.recommended ? "✦" : ""}</span>
                                <span className="compare-prob">{p.successProbability}%</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Most Rational */}
                {result.recommendations?.mostRational && (
                    <div className="compare-card">
                        <div className="card-label">Most Rational</div>
                        <div className="card-value">{result.recommendations.mostRational.choice}</div>
                    </div>
                )}

                {/* Antifragility */}
                {result.antifragilityScore && (
                    <div className="compare-card">
                        <div className="card-label">Antifragility</div>
                        <div className="compare-big-num">{result.antifragilityScore.overall}<span style={{ fontSize: 14, color: "var(--text-muted)" }}>/100</span></div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="compare-container">
            <div className="compare-header-row" style={{ marginBottom: 20 }}>
                <div className="form-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Custom Gemini API Key (Optional)
                            <HelpIcon tooltip="Bring your own API key to bypass shared server rate limits and route heavy analysis directly through your private quota." />
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        placeholder="AIzA..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                </div>
            </div>
            <div className="compare-grid">
                {/* Side A */}
                <div className="compare-side">
                    <div className="compare-side-label" style={{ display: 'flex', alignItems: 'center' }}>
                        Decision A
                        <HelpIcon tooltip="The exact first option you are considering. Evaluated holistically head-to-head against Decision B." />
                    </div>
                    <textarea
                        className="compare-textarea"
                        placeholder="Describe decision A..."
                        value={dilemmaA}
                        onChange={(e) => setDilemmaA(e.target.value)}
                        rows={3}
                    />

                    <button
                        className="analyze-btn"
                        onClick={() => runAnalysis("A")}
                        disabled={!dilemmaA.trim() || loadingA}
                        style={{ marginTop: 12 }}
                    >
                        {loadingA ? "Analyzing…" : "⚡ Analyze A"}
                    </button>
                    {loadingA && <div className="compare-loading"><div className="spinner" />Analyzing...</div>}
                    {renderCompactResult(resultA)}
                </div>

                {/* Divider */}
                <div className="compare-divider">
                    <div className="compare-vs">VS</div>
                </div>

                {/* Side B */}
                <div className="compare-side">
                    <div className="compare-side-label" style={{ display: 'flex', alignItems: 'center' }}>
                        Decision B
                        <HelpIcon tooltip="The primary alternative route. Systematically compared to finding the objectively superior choice." />
                    </div>
                    <textarea
                        className="compare-textarea"
                        placeholder="Describe decision B..."
                        value={dilemmaB}
                        onChange={(e) => setDilemmaB(e.target.value)}
                        rows={3}
                    />
                    <button
                        className="analyze-btn"
                        onClick={() => runAnalysis("B")}
                        disabled={!dilemmaB.trim() || loadingB}
                        style={{ marginTop: 12 }}
                    >
                        {loadingB ? "Analyzing…" : "⚡ Analyze B"}
                    </button>
                    {loadingB && <div className="compare-loading"><div className="spinner" />Analyzing...</div>}
                    {renderCompactResult(resultB)}
                </div>
            </div>

            {resultA && resultB && (
                <div className="compare-synthesis" style={{ marginTop: 24, padding: 20, background: "var(--surface-light)", borderRadius: 12, border: "1px solid var(--border)" }}>
                    <div className="panel-title" style={{ marginBottom: 16 }}>Comparison Synthesis</div>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        <strong>Decision A Confidence:</strong> {resultA.confidenceScore}/100 <br />
                        <strong>Decision B Confidence:</strong> {resultB.confidenceScore}/100 <br /><br />
                        {resultA.confidenceScore > resultB.confidenceScore
                            ? "Decision A generally models higher probabilistic certainty and alignment with constraints."
                            : resultB.confidenceScore > resultA.confidenceScore
                                ? "Decision B generally models higher probabilistic certainty and alignment with constraints."
                                : "Both paths model similar confidence scores. Consider antifragility and personal preference as tie-breakers."}
                        <br /><br />
                        Full comparison data has been stored in your analysis history.
                    </p>
                </div>
            )}

            {error && (
                <div className="error-state" style={{ marginTop: 16 }}>
                    {error}
                </div>
            )}
        </div>
    );
}

