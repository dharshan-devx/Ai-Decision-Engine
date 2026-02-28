export default function PrintTemplate({ data, dilemma }) {
    if (!data) return null;

    const {
        problemFraming, constraints, riskAnalysis, opportunityCost,
        skillDelta, strategicPaths, recommendations,
        regretMinimization, confidenceScore
    } = data;

    // We enforce strict inline styles or rely on a specific CSS class to ensure NO dark UI.
    return (
        <div className="print-report" style={{
            background: "#FFFFFF",
            color: "#000000",
            fontFamily: "Times New Roman, serif",
            padding: "1in",
            maxWidth: "8.5in",
            margin: "0 auto",
            lineHeight: 1.6
        }}>
            <h1 style={{ textAlign: "center", textTransform: "uppercase", borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "30px" }}>
                Strategic Decision Analysis
            </h1>

            <div style={{ marginBottom: "30px" }}>
                <p><strong>CORE DILEMMA:</strong> {problemFraming?.coreDecision || dilemma}</p>
                {problemFraming?.decisionType && <p><strong>DECISION TYPE:</strong> {problemFraming.decisionType.toUpperCase()}</p>}
                {problemFraming?.decisionHorizon && <p><strong>TIME HORIZON:</strong> {problemFraming.decisionHorizon.toUpperCase()}</p>}
                <p><strong>CONFIDENCE LEVEL:</strong> {confidenceScore}/100</p>
            </div>

            {problemFraming?.hiddenAssumptions?.length > 0 && (
                <div style={{ marginBottom: "30px" }}>
                    <h2 style={{ textTransform: "uppercase", fontSize: "16px", borderBottom: "1px solid #000", paddingBottom: "5px" }}>Hidden Assumptions</h2>
                    <ul style={{ paddingLeft: "20px" }}>
                        {problemFraming.hiddenAssumptions.map((a, i) => (
                            <li key={i} style={{ marginBottom: "8px" }}>{a}</li>
                        ))}
                    </ul>
                </div>
            )}

            {constraints && (
                <div style={{ marginBottom: "30px" }}>
                    <h2 style={{ textTransform: "uppercase", fontSize: "16px", borderBottom: "1px solid #000", paddingBottom: "5px" }}>Primary Constraints</h2>
                    <ul style={{ paddingLeft: "20px" }}>
                        {Object.entries(constraints).map(([k, v]) => (
                            <li key={k} style={{ marginBottom: "8px" }}>
                                <strong>{k.replace(/([A-Z])/g, " $1").toUpperCase().trim()}:</strong> {v}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {riskAnalysis?.length > 0 && (
                <div style={{ marginBottom: "30px" }}>
                    <h2 style={{ textTransform: "uppercase", fontSize: "16px", borderBottom: "1px solid #000", paddingBottom: "5px" }}>Risk Analysis</h2>
                    <ul style={{ paddingLeft: "20px" }}>
                        {riskAnalysis.map((r, i) => (
                            <li key={i} style={{ marginBottom: "8px" }}>
                                <strong>{r.name.toUpperCase()} (LEVEL: {r.level.toUpperCase()} | SCORE: {r.score}/100):</strong> {r.description}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {opportunityCost && (
                <div style={{ marginBottom: "30px" }}>
                    <h2 style={{ textTransform: "uppercase", fontSize: "16px", borderBottom: "1px solid #000", paddingBottom: "5px" }}>Opportunity Cost</h2>
                    <ul style={{ paddingLeft: "20px" }}>
                        {Object.entries(opportunityCost).map(([k, v]) => (
                            <li key={k} style={{ marginBottom: "8px" }}>
                                <strong>{k.replace(/([A-Z])/g, " $1").toUpperCase().trim()}:</strong> {v}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {skillDelta && (
                <div style={{ marginBottom: "30px" }}>
                    <h2 style={{ textTransform: "uppercase", fontSize: "16px", borderBottom: "1px solid #000", paddingBottom: "5px" }}>Skill Delta Analysis</h2>
                    <p><strong>GAP SCORE:</strong> {skillDelta.gapScore}/100</p>
                    <p><strong>ESTIMATED TIMELINE:</strong> {skillDelta.learningTimeline}</p>
                    <p><strong>REQUIRED SKILLS:</strong> {skillDelta.requiredSkills?.join(", ")}</p>
                    <p><strong>CURRENT SKILLS:</strong> {skillDelta.currentSkills?.join(", ")}</p>
                    {skillDelta.criticalGaps?.length > 0 && (
                        <p><strong>CRITICAL GAPS:</strong> {skillDelta.criticalGaps.join(", ")}</p>
                    )}
                </div>
            )}

            {strategicPaths?.length > 0 && (
                <div style={{ marginBottom: "30px" }}>
                    <h2 style={{ textTransform: "uppercase", fontSize: "16px", borderBottom: "1px solid #000", paddingBottom: "5px" }}>Strategic Paths</h2>
                    {strategicPaths.map((p, i) => (
                        <div key={i} style={{ marginBottom: "20px", paddingLeft: "10px" }}>
                            <h3 style={{ fontSize: "14px", textTransform: "uppercase", marginBottom: "8px" }}>
                                PATH {i + 1}: {p.name} {p.recommended ? "(RECOMMENDED)" : ""}
                            </h3>
                            <p style={{ margin: "4px 0" }}><strong>DESCRIPTION:</strong> {p.description}</p>
                            <p style={{ margin: "4px 0" }}><strong>PROBABILITY OF SUCCESS:</strong> {p.successProbability}% | <strong>REVERSIBILITY:</strong> {p.reversibilityScore}/100</p>
                            <p style={{ margin: "4px 0" }}><strong>TIMELINE:</strong> {p.timeline} | <strong>RESOURCES:</strong> {p.resourceRequirement}</p>
                            <p style={{ margin: "4px 0" }}><strong>BEST CASE:</strong> {p.bestCase}</p>
                            <p style={{ margin: "4px 0" }}><strong>WORST CASE:</strong> {p.worstCase}</p>
                            <p style={{ margin: "4px 0" }}><strong>RISK-ADJUSTED VALUE:</strong> {p.riskAdjustedValue}</p>
                        </div>
                    ))}
                </div>
            )}

            {recommendations && (
                <div style={{ marginBottom: "30px" }}>
                    <h2 style={{ textTransform: "uppercase", fontSize: "16px", borderBottom: "1px solid #000", paddingBottom: "5px" }}>Recommendations</h2>
                    <ul style={{ paddingLeft: "20px" }}>
                        {Object.entries(recommendations).map(([k, v]) => (
                            <li key={k} style={{ marginBottom: "12px" }}>
                                <strong>{k.replace(/([A-Z])/g, " $1").toUpperCase().trim()}:</strong> {v.choice}
                                <br />
                                <em>Reasoning:</em> {v.reasoning}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {regretMinimization && (
                <div style={{ marginBottom: "30px" }}>
                    <h2 style={{ textTransform: "uppercase", fontSize: "16px", borderBottom: "1px solid #000", paddingBottom: "5px" }}>Regret Minimization</h2>
                    <p><strong>AT-80 ANALYSIS:</strong> {regretMinimization.at80Analysis}</p>
                    <p><strong>PRIMARY REGRET RISK:</strong> {regretMinimization.primaryRegretRisk}</p>
                    <p><strong>RECOMMENDATION:</strong> {regretMinimization.recommendation}</p>
                </div>
            )}

            <div style={{ marginTop: "50px", textAlign: "center", fontSize: "12px", borderTop: "1px solid #000", paddingTop: "10px" }}>
                Generated by Decision Engine Strategic Reasoning System • Strict Confidentiality
            </div>
        </div>
    );
}
