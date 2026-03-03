"use client";
import { useState, useEffect, useRef } from "react";
import { askFollowUp } from "../lib/api";

export default function FollowUp({ dilemma, analysisData, apiKey }) {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Generate context-aware suggestions
    useEffect(() => {
        if (analysisData && messages.length === 0) {
            const defaultSuggestions = [
                "What is the absolute worst-case scenario?",
                "How can I mitigate the primary risk?",
                "Are there any hidden costs I missed?",
                "What if my timeline is cut in half?",
            ];

            // Try to make them dynamic based on the decision
            if (analysisData.recommendations?.mostRational?.choice) {
                defaultSuggestions[2] = `Why did you recommend ${analysisData.recommendations.mostRational.choice}?`;
            }
            if (analysisData.riskAnalysis && analysisData.riskAnalysis.length > 0) {
                const topRisk = [...analysisData.riskAnalysis].sort((a, b) => b.score - a.score)[0];
                if (topRisk?.name) {
                    defaultSuggestions[1] = `How specifically do I mitigate the "${topRisk.name}" risk?`;
                }
            }

            setSuggestions(defaultSuggestions);
        }
    }, [analysisData, messages.length]);

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

    const handleSend = async (customQuestion = null) => {
        const q = customQuestion || question.trim();
        if (!q || loading) return;

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

    const renderText = (text) => {
        return text.split('\n').map((line, j) => (
            <span key={j}>
                {line.split('**').map((part, k) => k % 2 === 1 ? <strong key={k}>{part}</strong> : part)}
                {j !== text.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    return (
        <div className="followup-section">
            <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="followup-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                    </div>
                    <span className="section-title">Follow-Up Questions</span>
                </div>
            </div>

            {messages.length === 0 && suggestions.length > 0 && !loading && (
                <div className="followup-suggestions">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            className="suggestion-chip"
                            onClick={() => handleSend(suggestion)}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {messages.length > 0 && (
                <div className="followup-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chat-bubble-container ${msg.role}`}>
                            <div className={`chat-bubble ${msg.role}`}>
                                {msg.role === "ai" && (
                                    <div className="chat-avatar-ai">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </div>
                                )}
                                <div className="chat-text">{renderText(msg.text)}</div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="chat-bubble-container ai">
                            <div className="chat-bubble ai typing">
                                <div className="chat-avatar-ai">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                </div>
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

            <div className="chat-input-wrapper">
                <input
                    className="chat-input"
                    placeholder="Ask a strategic follow-up..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={loading}
                />
                <button className={`chat-send-btn ${question.trim() ? 'active' : ''}`} onClick={() => handleSend()} disabled={!question.trim() || loading}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    );
}
