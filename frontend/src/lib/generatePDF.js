import { jsPDF } from "jspdf";

/**
 * Professional PDF generation for Decision Engine analysis results.
 * Programmatically writes all 11 sections into a clean, structured PDF.
 */

// ── Color palette (dark theme inspired) ──
const COLORS = {
    bg: [10, 10, 8],
    surface: [26, 26, 24],
    accent: [255, 161, 22],
    accentDim: [180, 130, 50],
    text: [240, 237, 230],
    textDim: [140, 137, 128],
    green: [44, 187, 93],
    red: [239, 71, 67],
    orange: [255, 161, 22],
    white: [255, 255, 255],
    border: [60, 58, 50],
};

function formatKey(key) {
    return key
        .replace(/([A-Z])/g, " $1")
        .trim()
        .toUpperCase();
}

export default function generatePDF(data, dilemma) {
    if (!data) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = 0;

    const {
        problemFraming, constraints, riskAnalysis, opportunityCost,
        skillDelta, strategicPaths, probabilisticModel, recommendations,
        biasDetection, antifragilityScore, regretMinimization,
        confidenceScore, confidenceNote,
    } = data;

    // ── Helpers ──
    function checkPage(needed = 30) {
        if (y + needed > pageH - 20) {
            doc.addPage();
            drawPageBg();
            y = margin;
        }
    }

    function drawPageBg() {
        doc.setFillColor(...COLORS.bg);
        doc.rect(0, 0, pageW, pageH, "F");
    }

    function drawLine() {
        checkPage(8);
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageW - margin, y);
        y += 6;
    }

    function sectionHeader(num, title) {
        checkPage(20);
        y += 6;
        // Number badge
        doc.setFillColor(...COLORS.accent);
        doc.roundedRect(margin, y - 3.5, 10, 7, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.bg);
        doc.text(String(num).padStart(2, "0"), margin + 5, y + 1, { align: "center" });

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.text);
        doc.text(title, margin + 14, y + 1.5);
        y += 12;
    }

    function label(text) {
        checkPage(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.accentDim);
        doc.text(text.toUpperCase(), margin + 2, y);
        y += 5;
    }

    function bodyText(text, indent = 0) {
        if (!text) return;
        checkPage(8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.text);
        const lines = doc.splitTextToSize(String(text), contentW - indent - 4);
        for (const line of lines) {
            checkPage(5);
            doc.text(line, margin + 2 + indent, y);
            y += 4.5;
        }
        y += 2;
    }

    function bulletList(items, indent = 0) {
        if (!items || items.length === 0) return;
        for (const item of items) {
            checkPage(6);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(...COLORS.accentDim);
            doc.text("→", margin + 2 + indent, y);
            doc.setTextColor(...COLORS.text);
            const lines = doc.splitTextToSize(String(item), contentW - indent - 12);
            for (let li = 0; li < lines.length; li++) {
                checkPage(5);
                doc.text(lines[li], margin + 8 + indent, y);
                y += 4.5;
            }
        }
        y += 2;
    }

    function cardBlock(labelText, value, indent = 0) {
        checkPage(14);
        // Card background
        doc.setFillColor(...COLORS.surface);
        const cardLines = doc.splitTextToSize(String(value || "N/A"), contentW - indent - 8);
        const cardH = 8 + cardLines.length * 4.5;
        doc.roundedRect(margin + indent, y - 2, contentW - indent, cardH + 4, 2, 2, "F");

        // Label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.accentDim);
        doc.text(labelText.toUpperCase(), margin + indent + 4, y + 2);
        y += 7;

        // Value
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.text);
        for (const line of cardLines) {
            checkPage(5);
            doc.text(line, margin + indent + 4, y);
            y += 4.5;
        }
        y += 5;
    }

    function scoreDisplay(scoreVal, maxVal, colorArr) {
        checkPage(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...colorArr);
        doc.text(String(scoreVal), margin + 4, y);
        const sw = doc.getTextWidth(String(scoreVal));
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.textDim);
        doc.text(`/${maxVal}`, margin + 4 + sw + 1, y);
        y += 8;
    }

    function riskBar(score, maxVal = 100) {
        checkPage(8);
        const barW = contentW - 8;
        const barH = 3;
        // Track
        doc.setFillColor(...COLORS.surface);
        doc.roundedRect(margin + 4, y, barW, barH, 1, 1, "F");
        // Fill
        const pct = Math.min(score / maxVal, 1);
        const fillColor = pct > 0.6 ? COLORS.red : pct > 0.3 ? COLORS.orange : COLORS.green;
        doc.setFillColor(...fillColor);
        doc.roundedRect(margin + 4, y, barW * pct, barH, 1, 1, "F");
        y += 6;
    }

    // ══════════════════════════════════════════════════════
    // PAGE 1 — Title Page
    // ══════════════════════════════════════════════════════
    drawPageBg();

    // Top accent line
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, 0, pageW, 3, "F");

    // Title
    y = 50;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...COLORS.accent);
    doc.text("DECISION ENGINE", margin, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textDim);
    doc.text("STRATEGIC REASONING SYSTEM  •  ANALYSIS REPORT", margin, y);

    // Divider
    y += 14;
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 60, y);
    y += 16;

    // Core decision
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.accentDim);
    doc.text("CORE DECISION", margin, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.text);
    const titleLines = doc.splitTextToSize(problemFraming?.coreDecision || dilemma, contentW);
    for (const line of titleLines) {
        doc.text(line, margin, y);
        y += 7;
    }
    y += 8;

    // Meta badges
    const metaItems = [];
    if (problemFraming?.decisionType) metaItems.push(`TYPE: ${problemFraming.decisionType.toUpperCase()}`);
    if (problemFraming?.decisionHorizon) metaItems.push(`HORIZON: ${problemFraming.decisionHorizon.toUpperCase()}`);
    metaItems.push(`CONFIDENCE: ${confidenceScore}/100`);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    let mx = margin;
    for (const item of metaItems) {
        const tw = doc.getTextWidth(item) + 10;
        doc.setFillColor(...COLORS.surface);
        doc.setDrawColor(...COLORS.border);
        doc.roundedRect(mx, y - 3.5, tw, 8, 2, 2, "FD");
        doc.setTextColor(...COLORS.text);
        doc.text(item, mx + 5, y + 1);
        mx += tw + 6;
    }
    y += 18;

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textDim);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);

    // Bottom accent line on title
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, pageH - 3, pageW, 3, "F");

    // ══════════════════════════════════════════════════════
    // CONTENT PAGES
    // ══════════════════════════════════════════════════════
    doc.addPage();
    drawPageBg();
    y = margin;

    // ── 01 Problem Framing ──
    if (problemFraming?.hiddenAssumptions?.length > 0) {
        sectionHeader(1, "Problem Framing");
        label("Hidden Assumptions");
        bulletList(problemFraming.hiddenAssumptions);
        drawLine();
    }

    // ── 02 Constraints ──
    if (constraints) {
        sectionHeader(2, "Constraints");
        for (const [k, v] of Object.entries(constraints)) {
            cardBlock(formatKey(k), v);
        }
        drawLine();
    }

    // ── 03 Risk Analysis ──
    if (riskAnalysis?.length > 0) {
        sectionHeader(3, "Risk Analysis");
        for (const risk of riskAnalysis) {
            checkPage(25);
            label(risk.name?.toUpperCase() || "RISK");
            riskBar(risk.score || 0);
            // Score + level
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            const levelColor = risk.level === "high" ? COLORS.red : risk.level === "medium" ? COLORS.orange : COLORS.green;
            doc.setTextColor(...levelColor);
            doc.text(`${risk.score}/100 — ${risk.level}`, margin + 4, y);
            y += 6;
            bodyText(risk.description, 2);
        }
        drawLine();
    }

    // ── 04 Opportunity Cost ──
    if (opportunityCost) {
        sectionHeader(4, "Opportunity Cost");
        for (const [k, v] of Object.entries(opportunityCost)) {
            cardBlock(formatKey(k), v);
        }
        drawLine();
    }

    // ── 05 Skill Delta Analysis ──
    if (skillDelta) {
        sectionHeader(5, "Skill Delta Analysis");
        if (skillDelta.requiredSkills?.length > 0) {
            label("Required Skills");
            bodyText(skillDelta.requiredSkills.join("  •  "), 2);
        }
        if (skillDelta.currentSkills?.length > 0) {
            label("Current Skills");
            bodyText(skillDelta.currentSkills.join("  •  "), 2);
        }
        if (skillDelta.criticalGaps?.length > 0) {
            label("Critical Gaps");
            bulletList(skillDelta.criticalGaps);
        }
        label("Gap Score");
        const gapColor = skillDelta.gapScore > 60 ? COLORS.red : skillDelta.gapScore > 30 ? COLORS.orange : COLORS.green;
        scoreDisplay(skillDelta.gapScore, 100, gapColor);
        bodyText(`Est. learning timeline: ${skillDelta.learningTimeline}`, 2);
        drawLine();
    }

    // ── 06 Strategic Paths ──
    if (strategicPaths?.length > 0) {
        sectionHeader(6, "Strategic Paths");
        for (let i = 0; i < strategicPaths.length; i++) {
            const p = strategicPaths[i];
            checkPage(45);

            // Path header
            doc.setFillColor(...COLORS.surface);
            doc.roundedRect(margin, y - 2, contentW, 10, 2, 2, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(...COLORS.accent);
            doc.text(`PATH ${String(i + 1).padStart(2, "0")}`, margin + 4, y + 3);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(...COLORS.text);
            doc.text(p.name || `Path ${i + 1}`, margin + 24, y + 3);

            // Success probability
            if (p.successProbability) {
                const probColor = p.successProbability >= 50 ? COLORS.green : p.successProbability >= 25 ? COLORS.orange : COLORS.red;
                doc.setTextColor(...probColor);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text(`${p.successProbability}%`, pageW - margin - 4, y + 3, { align: "right" });
            }
            y += 14;

            if (p.description) { label("Description"); bodyText(p.description, 2); }
            if (p.timeline) { label("Timeline"); bodyText(p.timeline, 2); }
            if (p.resourceRequirement) { label("Resources Required"); bodyText(p.resourceRequirement, 2); }
            if (p.bestCase) { label("Best Case"); bodyText(p.bestCase, 2); }
            if (p.worstCase) { label("Worst Case"); bodyText(p.worstCase, 2); }
            if (p.reversibilityScore != null) { label("Reversibility Score"); bodyText(`${p.reversibilityScore}/100`, 2); }
            if (p.riskAdjustedValue) { label("Risk-Adjusted Value"); bodyText(p.riskAdjustedValue, 2); }

            if (p.recommended) {
                checkPage(8);
                doc.setFillColor(44, 187, 93);
                doc.roundedRect(margin + 2, y - 3, 30, 7, 2, 2, "F");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.setTextColor(...COLORS.bg);
                doc.text("RECOMMENDED", margin + 17, y + 0.5, { align: "center" });
                y += 8;
            }
            y += 4;
        }
        drawLine();
    }

    // ── 07 Probabilistic Model ──
    if (probabilisticModel) {
        sectionHeader(7, "Probabilistic Outcomes");
        if (probabilisticModel.bayesianEstimate) cardBlock("Bayesian Estimate", probabilisticModel.bayesianEstimate);
        if (probabilisticModel.expectedValue) cardBlock("Expected Value", probabilisticModel.expectedValue);
        if (probabilisticModel.confidenceInterval) cardBlock("Confidence Interval", probabilisticModel.confidenceInterval);
        if (probabilisticModel.monteCarlo) cardBlock("Monte Carlo Simulation", probabilisticModel.monteCarlo);
        drawLine();
    }

    // ── 08 Recommendations ──
    if (recommendations) {
        sectionHeader(8, "Recommendations");
        for (const [k, v] of Object.entries(recommendations)) {
            checkPage(20);
            label(formatKey(k));
            if (v.choice) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(...COLORS.accent);
                const choiceLines = doc.splitTextToSize(v.choice, contentW - 8);
                for (const cl of choiceLines) {
                    checkPage(5);
                    doc.text(cl, margin + 4, y);
                    y += 5;
                }
                y += 2;
            }
            if (v.reasoning) bodyText(`Reasoning: ${v.reasoning}`, 2);
        }
        drawLine();
    }

    // ── 09 Cognitive Bias Detection ──
    if (biasDetection?.length > 0) {
        sectionHeader(9, "Cognitive Bias Detection");
        for (const bias of biasDetection) {
            checkPage(25);
            // Bias name with severity
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...COLORS.text);
            doc.text(bias.name || "Bias", margin + 4, y);

            if (bias.severity) {
                const sevColor = bias.severity === "high" ? COLORS.red : bias.severity === "medium" ? COLORS.orange : COLORS.green;
                const sevTxt = bias.severity.toUpperCase();
                const nameW = doc.getTextWidth(bias.name || "Bias");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.setTextColor(...sevColor);
                doc.text(sevTxt, margin + 8 + nameW, y);
            }
            y += 6;
            if (bias.description) bodyText(bias.description, 4);
            if (bias.mitigation) {
                doc.setFont("helvetica", "italic");
                doc.setFontSize(8);
                doc.setTextColor(...COLORS.accentDim);
                const mitLines = doc.splitTextToSize(`Mitigation: ${bias.mitigation}`, contentW - 10);
                for (const ml of mitLines) {
                    checkPage(5);
                    doc.text(ml, margin + 6, y);
                    y += 4.5;
                }
                y += 2;
            }
        }
        drawLine();
    }

    // ── 10 Antifragility Score ──
    if (antifragilityScore != null) {
        sectionHeader(10, "Antifragility Score");
        if (typeof antifragilityScore === "object") {
            if (antifragilityScore.score != null) {
                label("Score");
                scoreDisplay(antifragilityScore.score, 100, COLORS.accent);
            }
            if (antifragilityScore.assessment) { label("Assessment"); bodyText(antifragilityScore.assessment, 2); }
            if (antifragilityScore.factors?.length > 0) { label("Factors"); bulletList(antifragilityScore.factors); }
        } else {
            scoreDisplay(antifragilityScore, 100, COLORS.accent);
        }
        drawLine();
    }

    // ── 11 Regret Minimization ──
    if (regretMinimization) {
        sectionHeader(11, "Regret Minimization");
        if (regretMinimization.at80Analysis) cardBlock("At-80 Analysis", regretMinimization.at80Analysis);
        if (regretMinimization.primaryRegretRisk) cardBlock("Primary Regret Risk", regretMinimization.primaryRegretRisk);
        if (regretMinimization.recommendation) cardBlock("Recommendation", regretMinimization.recommendation);
        drawLine();
    }

    // ── Confidence Footer ──
    checkPage(25);
    y += 6;
    doc.setFillColor(...COLORS.surface);
    doc.roundedRect(margin, y - 4, contentW, 16, 3, 3, "F");
    doc.setDrawColor(...COLORS.accent);
    doc.roundedRect(margin, y - 4, contentW, 16, 3, 3, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.accent);
    doc.text(`CONFIDENCE SCORE: ${confidenceScore}/100`, margin + 6, y + 2);

    if (confidenceNote) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.textDim);
        const noteLines = doc.splitTextToSize(confidenceNote, contentW - 14);
        doc.text(noteLines[0] || "", margin + 6, y + 8);
    }
    y += 20;

    // ── Page footer on every page ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.textDim);
        doc.text("Decision Engine — Strategic Reasoning System", margin, pageH - 8);
        doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 8, { align: "right" });

        // Bottom accent
        doc.setFillColor(...COLORS.accent);
        doc.rect(0, pageH - 2, pageW, 2, "F");
    }

    // ── Save ──
    const safeName = (problemFraming?.coreDecision || dilemma || "analysis")
        .substring(0, 40)
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "_");
    doc.save(`DecisionEngine_${safeName}.pdf`);
}
