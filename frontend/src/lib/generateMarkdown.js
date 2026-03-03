/**
 * Export analysis data as a structured Markdown document.
 */
export default function generateMarkdown(data, dilemma) {
    if (!data) return;

    const {
        problemFraming, constraints, riskAnalysis, opportunityCost,
        skillDelta, strategicPaths, probabilisticModel, recommendations,
        biasDetection, antifragilityScore, regretMinimization,
        confidenceScore, confidenceNote,
    } = data;

    let md = "";

    md += `# Decision Engine — Strategic Analysis Report\n\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    md += `---\n\n`;

    // Core Decision
    md += `## Core Decision\n\n`;
    md += `> ${problemFraming?.coreDecision || dilemma}\n\n`;
    if (problemFraming?.decisionType) md += `- **Type:** ${problemFraming.decisionType}\n`;
    if (problemFraming?.decisionHorizon) md += `- **Horizon:** ${problemFraming.decisionHorizon}\n`;
    md += `- **Confidence:** ${confidenceScore}/100\n\n`;

    // 01 Problem Framing
    if (problemFraming?.hiddenAssumptions?.length > 0) {
        md += `## 01 — Problem Framing\n\n`;
        md += `### Hidden Assumptions\n\n`;
        problemFraming.hiddenAssumptions.forEach(a => { md += `- ${a}\n`; });
        md += `\n`;
    }

    // 02 Constraints
    if (constraints) {
        md += `## 02 — Constraints\n\n`;
        Object.entries(constraints).forEach(([k, v]) => {
            md += `- **${k.replace(/([A-Z])/g, " $1").trim()}:** ${v}\n`;
        });
        md += `\n`;
    }

    // 03 Risk Analysis
    if (riskAnalysis?.length > 0) {
        md += `## 03 — Risk Analysis\n\n`;
        riskAnalysis.forEach(r => {
            md += `### ${r.name} (${r.level} — ${r.score}/100)\n\n`;
            md += `${r.description}\n\n`;
        });
    }

    // 04 Opportunity Cost
    if (opportunityCost) {
        md += `## 04 — Opportunity Cost\n\n`;
        Object.entries(opportunityCost).forEach(([k, v]) => {
            md += `- **${k.replace(/([A-Z])/g, " $1").trim()}:** ${v}\n`;
        });
        md += `\n`;
    }

    // 05 Skill Delta
    if (skillDelta) {
        md += `## 05 — Skill Delta Analysis\n\n`;
        md += `- **Gap Score:** ${skillDelta.gapScore}/100\n`;
        md += `- **Learning Timeline:** ${skillDelta.learningTimeline}\n`;
        if (skillDelta.requiredSkills?.length) md += `- **Required Skills:** ${skillDelta.requiredSkills.join(", ")}\n`;
        if (skillDelta.currentSkills?.length) md += `- **Current Skills:** ${skillDelta.currentSkills.join(", ")}\n`;
        if (skillDelta.criticalGaps?.length) md += `- **Critical Gaps:** ${skillDelta.criticalGaps.join(", ")}\n`;
        md += `\n`;
    }

    // 06 Strategic Paths
    if (strategicPaths?.length > 0) {
        md += `## 06 — Strategic Paths\n\n`;
        strategicPaths.forEach((p, i) => {
            md += `### Path ${i + 1}: ${p.name}${p.recommended ? " ⭐ RECOMMENDED" : ""}\n\n`;
            if (p.description) md += `${p.description}\n\n`;
            md += `| Metric | Value |\n|--------|-------|\n`;
            md += `| Success Probability | ${p.successProbability}% |\n`;
            md += `| Timeline | ${p.timeline} |\n`;
            md += `| Resources | ${p.resourceRequirement} |\n`;
            md += `| Reversibility | ${p.reversibilityScore}/100 |\n`;
            md += `| Best Case | ${p.bestCase} |\n`;
            md += `| Worst Case | ${p.worstCase} |\n`;
            md += `| Risk-Adjusted Value | ${p.riskAdjustedValue} |\n\n`;
        });
    }

    // 07 Probabilistic Model
    if (probabilisticModel) {
        md += `## 07 — Probabilistic Outcomes\n\n`;
        Object.entries(probabilisticModel).forEach(([k, v]) => {
            if (typeof v === 'object' && v !== null) {
                md += `- **${k.replace(/([A-Z])/g, " $1").trim()}:** ${v.description || v.probability || JSON.stringify(v)}\n`;
            } else {
                md += `- **${k.replace(/([A-Z])/g, " $1").trim()}:** ${v}\n`;
            }
        });
        md += `\n`;
    }

    // 08 Recommendations
    if (recommendations) {
        md += `## 08 — Recommendations\n\n`;
        Object.entries(recommendations).forEach(([k, v]) => {
            md += `### ${k.replace(/([A-Z])/g, " $1").trim()}\n\n`;
            md += `- **Choice:** ${v.choice}\n`;
            md += `- **Reasoning:** ${v.reasoning}\n\n`;
        });
    }

    // 09 Bias Detection
    if (biasDetection?.length > 0) {
        md += `## 09 — Cognitive Bias Detection\n\n`;
        biasDetection.forEach(b => {
            md += `### ${b.biasName || b.name}\n\n`;
            md += `${b.description}\n\n`;
            if (b.mitigation) md += `> **Mitigation:** ${b.mitigation}\n\n`;
        });
    }

    // 10 Antifragility
    if (antifragilityScore) {
        md += `## 10 — Antifragility Score\n\n`;
        if (typeof antifragilityScore === 'object') {
            md += `- **Overall:** ${antifragilityScore.overall || antifragilityScore.score}\n`;
            if (antifragilityScore.interpretation) md += `- **Interpretation:** ${antifragilityScore.interpretation}\n`;
        } else {
            md += `- **Score:** ${antifragilityScore}/100\n`;
        }
        md += `\n`;
    }

    // 11 Regret Minimization
    if (regretMinimization) {
        md += `## 11 — Regret Minimization\n\n`;
        md += `- **At-80 Analysis:** ${regretMinimization.at80Analysis}\n`;
        md += `- **Primary Regret Risk:** ${regretMinimization.primaryRegretRisk}\n`;
        md += `- **Recommendation:** ${regretMinimization.recommendation}\n\n`;
    }

    // Confidence Footer
    if (confidenceNote) {
        md += `---\n\n`;
        md += `**Confidence Score:** ${confidenceScore}/100\n\n`;
        md += `*${confidenceNote}*\n\n`;
    }

    md += `---\n\n`;
    md += `*Generated by [Decision Engine](https://ai-decision-engine.vercel.app) — Strategic Reasoning System*\n`;

    // Download
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (problemFraming?.coreDecision || dilemma || "analysis")
        .substring(0, 40).replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
    a.href = url;
    a.download = `DecisionEngine_${safeName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
