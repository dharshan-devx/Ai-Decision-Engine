"use client";
import { useState } from "react";
import { askFollowUp } from "../lib/api";

export default function FollowUp({ dilemma, analysisData, apiKey }) {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const buildContextSummary = () => {
        if (!analysisData) return "";
        const parts = [];
        if (analysisData.problemFraming?.coreDecision)
            parts.push(`Core Decision: ${analysisData.problemFraming.coreDecision}`);
        if (analysisData.recommendations?.mostRational?.choice)
            parts.push(`Most Rational Choice: ${analysisData.recommendations.mostRational.choice}`);
        if (analysisData.recommendations?.mostRational?.reasoning)
            parts.push(`Reasoning: ${analysisData.recommendations.mostRational.reasoning}`);
        if (analysisData.confidenceScore)
            parts.push(`Confidence: ${analysisData.confidenceScore}/100`);
        if (analysisData.strategicPaths?.length > 0)
            parts.push(`Strategic Paths: ${analysisData.strategicPaths.map(p => p.name).join(", ")}`);
        return parts.join("\n");
    };

    const handleSend = async () => {
        if (!question.trim() || loading) return;
        const q = question.trim();
        setQuestion("");
        setMessages((prev) => [...prev, { role: "user", text: q }]);
        setLoading(true);

        try {
            const answer = await askFollowUp({
                dilemma,
                contextSummary: buildContextSummary(),
                question: q,
                apiKey,
            });
            setMessages((prev) => [...prev, { role: "ai", text: answer }]);
        } catch (e) {
            setMessages((prev) => [...prev, { role: "ai", text: `Error: ${e?.response?.data?.detail || e.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="followup-section">
            <div className="section-header">
                <span className="section-num">💬</span>
                <span className="section-title">Follow-Up Questions</span>
            </div>

            {messages.length > 0 && (
                <div className="followup-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`followup-msg ${msg.role}`}>
                            <div className="followup-msg-label">{msg.role === "user" ? "You" : "AI"}</div>
                            <div className="followup-msg-text">{msg.text}</div>
                        </div>
                    ))}
                    {loading && (
                        <div className="followup-msg ai">
                            <div className="followup-msg-label">AI</div>
                            <div className="followup-msg-text followup-thinking">Thinking...</div>
                        </div>
                    )}
                </div>
            )}

            <div className="followup-input-row">
                <input
                    className="followup-input"
                    placeholder="Ask a follow-up question... (e.g. 'What if I had more savings?')"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={loading}
                />
                <button className="followup-send" onClick={handleSend} disabled={!question.trim() || loading}>
                    {loading ? "…" : "→"}
                </button>
            </div>
        </div>
    );
}

