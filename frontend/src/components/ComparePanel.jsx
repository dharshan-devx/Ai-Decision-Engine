import { useState, useEffect } from "react";
import { analyzeDecision } from "../lib/api";

export default function ComparePanel({ saveAnalysis, restoreData }) {
    const [dilemmaA, setDilemmaA] = useState("");
    const [dilemmaB, setDilemmaB] = useState("");
    const [resultA, setResultA] = useState(null);
    const [resultB, setResultB] = useState(null);
    const [loadingA, setLoadingA] = useState(false);
    const [loadingB, setLoadingB] = useState(false);
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
                    age: "",
                    riskProfile: "moderate",
                    timeHorizon: "medium-term",
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
            const res = await analyzeDecision({ dilemma, age: "", riskProfile: "moderate", timeHorizon: "medium-term" });
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
            <div className="compare-grid">
                {/* Side A */}
                <div className="compare-side">
                    <div className="compare-side-label">
                        Decision A
                        <span className="tooltip-icon" title="Describe the first option or path you are considering.">?</span>
                    </div>
                    <textarea
                        className="compare-textarea"
                        placeholder="Describe decision A..."
                        value={dilemmaA}
                        onChange={(e) => setDilemmaA(e.target.value)}
                        rows={3}
                    />
                    <button
                        className="compare-run-btn"
                        onClick={() => runAnalysis("A")}
                        disabled={!dilemmaA.trim() || loadingA}
                    >
                        {loadingA ? "Analyzing…" : "Analyze A"}
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
                    <div className="compare-side-label">
                        Decision B
                        <span className="tooltip-icon" title="Describe the alternative option or path you are considering.">?</span>
                    </div>
                    <textarea
                        className="compare-textarea"
                        placeholder="Describe decision B..."
                        value={dilemmaB}
                        onChange={(e) => setDilemmaB(e.target.value)}
                        rows={3}
                    />
                    <button
                        className="compare-run-btn"
                        onClick={() => runAnalysis("B")}
                        disabled={!dilemmaB.trim() || loadingB}
                    >
                        {loadingB ? "Analyzing…" : "Analyze B"}
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
