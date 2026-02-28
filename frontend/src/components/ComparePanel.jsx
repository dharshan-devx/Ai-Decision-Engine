import { useState } from "react";
import { analyzeDecision } from "../lib/api";

export default function ComparePanel() {
    const [dilemmaA, setDilemmaA] = useState("");
    const [dilemmaB, setDilemmaB] = useState("");
    const [resultA, setResultA] = useState(null);
    const [resultB, setResultB] = useState(null);
    const [loadingA, setLoadingA] = useState(false);
    const [loadingB, setLoadingB] = useState(false);
    const [error, setError] = useState(null);

    const runAnalysis = async (side) => {
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
                    <div className="compare-side-label">Decision A</div>
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
                    <div className="compare-side-label">Decision B</div>
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

            {error && (
                <div className="error-state" style={{ marginTop: 16 }}>
                    {error}
                </div>
            )}
        </div>
    );
}
