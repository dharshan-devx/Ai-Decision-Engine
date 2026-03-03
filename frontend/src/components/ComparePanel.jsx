"use client";
import { useState, useEffect } from "react";
import { analyzeDecision } from "../lib/api";
import HelpIcon from "./HelpIcon";
import NeuralBrain from "./NeuralBrain";

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

    const getScoreColor = (score) => {
        if (score >= 70) return "var(--green)";
        if (score >= 40) return "var(--orange)";
        return "var(--red)";
    };

    const renderCompactResult = (result) => {
        if (!result) return null;
        return (
            <div className="cmp-result">
                {/* Core Decision */}
                <div className="cmp-card cmp-card-highlight">
                    <div className="cmp-card-label">Core Decision</div>
                    <div className="cmp-card-value">{result.problemFraming?.coreDecision}</div>
                    <div className="cmp-card-meta">{result.problemFraming?.decisionType}</div>
                </div>

                {/* Confidence Score */}
                <div className="cmp-card cmp-card-score">
                    <div className="cmp-card-label">Confidence Score</div>
                    <div className="cmp-score-display">
                        <div className="cmp-score-number" style={{ color: getScoreColor(result.confidenceScore) }}>
                            {result.confidenceScore}
                        </div>
                        <div className="cmp-score-bar">
                            <div
                                className="cmp-score-fill"
                                style={{
                                    width: `${result.confidenceScore}%`,
                                    background: getScoreColor(result.confidenceScore)
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Risks */}
                {result.riskAnalysis?.length > 0 && (
                    <div className="cmp-card">
                        <div className="cmp-card-label">Top Risks</div>
                        <div className="cmp-risks">
                            {[...result.riskAnalysis].sort((a, b) => b.score - a.score).slice(0, 3).map((r, i) => (
                                <div key={i} className="cmp-risk-item">
                                    <div className="cmp-risk-info">
                                        <span className="cmp-risk-name">{r.name}</span>
                                        <span className="cmp-risk-level" style={{ color: { high: "var(--red)", medium: "var(--orange)", low: "var(--green)" }[r.level] }}>{r.level}</span>
                                    </div>
                                    <div className="cmp-risk-bar-track">
                                        <div className="cmp-risk-bar-fill" style={{
                                            width: `${r.score}%`,
                                            background: { high: "var(--red)", medium: "var(--orange)", low: "var(--green)" }[r.level]
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Strategic Paths */}
                {result.strategicPaths?.length > 0 && (
                    <div className="cmp-card">
                        <div className="cmp-card-label">Strategic Paths</div>
                        <div className="cmp-paths">
                            {result.strategicPaths.map((p, i) => (
                                <div key={i} className={`cmp-path-item ${p.recommended ? "recommended" : ""}`}>
                                    <div className="cmp-path-name">
                                        {p.recommended && <span className="cmp-path-star">★</span>}
                                        {p.name}
                                    </div>
                                    <div className="cmp-path-prob" style={{ color: p.successProbability >= 60 ? "var(--green)" : "var(--orange)" }}>
                                        {p.successProbability}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Most Rational */}
                {result.recommendations?.mostRational && (
                    <div className="cmp-card cmp-card-rational">
                        <div className="cmp-card-label">Most Rational Choice</div>
                        <div className="cmp-card-value">{result.recommendations.mostRational.choice}</div>
                        <div className="cmp-card-reasoning">{result.recommendations.mostRational.reasoning}</div>
                    </div>
                )}

                {/* Antifragility */}
                {result.antifragilityScore && (
                    <div className="cmp-card cmp-card-score">
                        <div className="cmp-card-label">Antifragility</div>
                        <div className="cmp-score-display">
                            <div className="cmp-score-number">{result.antifragilityScore.overall || result.antifragilityScore}</div>
                            <div className="cmp-score-bar">
                                <div className="cmp-score-fill" style={{ width: `${result.antifragilityScore.overall || result.antifragilityScore}%` }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const winnerSide = resultA && resultB
        ? resultA.confidenceScore > resultB.confidenceScore ? "A" : resultB.confidenceScore > resultA.confidenceScore ? "B" : null
        : null;

    return (
        <div className="cmp-container">
            {/* API Key Section */}
            <div className="cmp-apikey-section">
                <div className="cmp-apikey-header">
                    <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                        Custom Gemini API Key
                        <HelpIcon tooltip="Bring your own API key to bypass shared server rate limits." />
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="cmp-badge-green">Bypasses Limits</span>
                        <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" className="cmp-getkey-link">
                            Get Key ↗
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

            {/* Compare Grid */}
            <div className="cmp-grid">
                {/* Side A */}
                <div className={`cmp-side ${winnerSide === "A" ? "cmp-winner" : ""}`}>
                    <div className="cmp-side-header">
                        <div className="cmp-side-badge cmp-side-a">A</div>
                        <span className="cmp-side-title">Decision A</span>
                        <HelpIcon tooltip="The first option you are considering." />
                    </div>
                    <textarea
                        className="cmp-textarea"
                        placeholder="Describe your first option in detail..."
                        value={dilemmaA}
                        onChange={(e) => setDilemmaA(e.target.value)}
                        rows={4}
                    />
                    <button
                        className="cmp-analyze-btn"
                        onClick={() => runAnalysis("A")}
                        disabled={!dilemmaA.trim() || loadingA}
                    >
                        {loadingA ? (
                            <><div className="spinner" style={{ width: 14, height: 14 }} /> Analyzing...</>
                        ) : (
                            <><span className="cmp-bolt">⚡</span> Analyze A</>
                        )}
                    </button>
                    {loadingA && (
                        <div className="cmp-loading">
                            <NeuralBrain />
                        </div>
                    )}
                    {renderCompactResult(resultA)}
                </div>

                {/* VS Divider */}
                <div className="cmp-divider">
                    <div className="cmp-divider-line" />
                    <div className="cmp-vs">VS</div>
                    <div className="cmp-divider-line" />
                </div>

                {/* Side B */}
                <div className={`cmp-side ${winnerSide === "B" ? "cmp-winner" : ""}`}>
                    <div className="cmp-side-header">
                        <div className="cmp-side-badge cmp-side-b">B</div>
                        <span className="cmp-side-title">Decision B</span>
                        <HelpIcon tooltip="The alternative route to compare against." />
                    </div>
                    <textarea
                        className="cmp-textarea"
                        placeholder="Describe your second option in detail..."
                        value={dilemmaB}
                        onChange={(e) => setDilemmaB(e.target.value)}
                        rows={4}
                    />
                    <button
                        className="cmp-analyze-btn"
                        onClick={() => runAnalysis("B")}
                        disabled={!dilemmaB.trim() || loadingB}
                    >
                        {loadingB ? (
                            <><div className="spinner" style={{ width: 14, height: 14 }} /> Analyzing...</>
                        ) : (
                            <><span className="cmp-bolt">⚡</span> Analyze B</>
                        )}
                    </button>
                    {loadingB && (
                        <div className="cmp-loading">
                            <NeuralBrain />
                        </div>
                    )}
                    {renderCompactResult(resultB)}
                </div>
            </div>

            {/* Comparison Synthesis */}
            {resultA && resultB && (
                <div className="cmp-synthesis">
                    <div className="cmp-synthesis-header">
                        <span className="cmp-synthesis-icon">⚖️</span>
                        <span className="cmp-synthesis-title">Comparison Verdict</span>
                    </div>
                    <div className="cmp-synthesis-scores">
                        <div className={`cmp-score-card ${winnerSide === "A" ? "winner" : ""}`}>
                            <div className="cmp-score-card-label">Decision A</div>
                            <div className="cmp-score-card-num" style={{ color: getScoreColor(resultA.confidenceScore) }}>
                                {resultA.confidenceScore}<span>/100</span>
                            </div>
                        </div>
                        <div className="cmp-score-vs">vs</div>
                        <div className={`cmp-score-card ${winnerSide === "B" ? "winner" : ""}`}>
                            <div className="cmp-score-card-label">Decision B</div>
                            <div className="cmp-score-card-num" style={{ color: getScoreColor(resultB.confidenceScore) }}>
                                {resultB.confidenceScore}<span>/100</span>
                            </div>
                        </div>
                    </div>
                    <div className="cmp-synthesis-verdict">
                        {winnerSide
                            ? `Decision ${winnerSide} models higher probabilistic certainty and strategic alignment. Review the risk analysis and antifragility scores above for nuanced differences.`
                            : "Both paths model equal confidence. Consider antifragility scores, risk profiles, and personal values as decisive factors."
                        }
                    </div>
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
