"use client";
import React, { useEffect, useState } from 'react';
import NeuralBrain from './NeuralBrain';

export default function AboutModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('overview');

    if (!isOpen) return null;

    return (
        <div className="about-modal-overlay" onClick={onClose}>
            <div className="about-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="about-close-btn" onClick={onClose}>✕</button>

                <div className="about-modal-header">
                    <div className="about-logo-wrapper">
                        <NeuralBrain style={{ width: 64, height: 64, background: 'transparent' }} />
                    </div>
                    <h2 className="about-title">Decision Engine</h2>
                    <p className="about-subtitle">AI Strategic Reasoning System</p>
                    <div className="about-version-badge">v2.0.0 &bull; Advanced Cognitive Model</div>
                </div>

                <div className="about-tabs">
                    <button className={`about-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                    <button className={`about-tab ${activeTab === 'vs-llms' ? 'active' : ''}`} onClick={() => setActiveTab('vs-llms')}>Vs General AI</button>
                    <button className={`about-tab ${activeTab === 'capabilities' ? 'active' : ''}`} onClick={() => setActiveTab('capabilities')}>Core Capabilities</button>
                    <button className={`about-tab ${activeTab === 'architecture' ? 'active' : ''}`} onClick={() => setActiveTab('architecture')}>Architecture</button>
                </div>

                <div className="about-scroll-area">
                    {activeTab === 'overview' && (
                        <div className="about-section fade-in">
                            <p className="about-text">
                                The Decision Engine is a high-dimensional cognitive engine designed to assist in complex, high-stakes dilemmas.
                                By utilizing advanced AI models, it systematically deconstructs decisions to neutralize human biases, model probabilistic
                                outcomes, and identify hidden risks.
                            </p>
                            <div className="about-creator-card">
                                <div className="creator-label">ENGINEERED BY</div>
                                <div className="creator-name">DHARSHAN DEVX</div>
                                <div className="creator-desc">
                                    Designed for precision, clarity, and rigorous strategic reasoning.
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vs-llms' && (
                        <div className="about-section fade-in">
                            <p className="about-text" style={{ marginBottom: '8px' }}>
                                While models like ChatGPT or standard Gemini are built to be conversational assistants, the <strong>Decision Engine</strong> is a specialized cognitive framework engineered specifically for rigorous problem-solving.
                            </p>

                            <div className="about-grid" style={{ gridTemplateColumns: '1fr', gap: '12px' }}>
                                <div className="about-feature">
                                    <h3 style={{ marginTop: 0 }}>🚫 Not a Chatbot</h3>
                                    <p>Standard LLMs engage in open-ended dialogue and often succumb to "sycophancy" (agreeing with you just to be helpful). The Decision Engine strips away conversational filler to deliver blunt, structured, and objective outputs.</p>
                                </div>
                                <div className="about-feature">
                                    <h3 style={{ marginTop: 0 }}>⚙️ Multi-Agent Pipeline</h3>
                                    <p>Instead of a single prompt trying to do everything, your dilemma is routed through specialized analytical stages (Risk Assessment, Bias Detection, Strategic Planning) working in concert to ensure no angle is missed.</p>
                                </div>
                                <div className="about-feature">
                                    <h3 style={{ marginTop: 0 }}>🔢 Quantitative Rigor</h3>
                                    <p>General AIs tend to give generic pros and cons. We force the AI to assign quantitative probabilistic confidence scores and Antifragility metrics against worst-case scenarios, giving you measurable data over vague advice.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'capabilities' && (
                        <div className="about-section fade-in">
                            <div className="about-grid">
                                <div className="about-feature">
                                    <span className="feature-icon">🧠</span>
                                    <h3>Bias Detection</h3>
                                    <p>Identifies emotional filters and cognitive fallacies clouding human judgment (e.g., sunk cost fallacy, confirmation bias).</p>
                                </div>
                                <div className="about-feature">
                                    <span className="feature-icon">📊</span>
                                    <h3>Probabilistic Modeling</h3>
                                    <p>Forecasts potential outcomes based on historical patterns, giving a confidence score out of 100.</p>
                                </div>
                                <div className="about-feature">
                                    <span className="feature-icon">🛤️</span>
                                    <h3>Strategic Divergence</h3>
                                    <p>Generates non-obvious alternatives to your problem, breaking the "either-or" false dichotomy.</p>
                                </div>
                                <div className="about-feature">
                                    <span className="feature-icon">🛡️</span>
                                    <h3>Antifragility Score</h3>
                                    <p>Evaluates how resilient your decision is against downside risk and unforeseen chaos.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'architecture' && (
                        <div className="about-section fade-in">
                            <ul className="about-tech-list">
                                <li>
                                    <span className="tech-label">Cognitive Engine</span>
                                    <span className="tech-value">Google Gemini Pro API</span>
                                </li>
                                <li>
                                    <span className="tech-label">Backend Processing</span>
                                    <span className="tech-value">Python / FastAPI (Async)</span>
                                </li>
                                <li>
                                    <span className="tech-label">Client Interface</span>
                                    <span className="tech-value">React / Next.js / Glassmorphism</span>
                                </li>
                                <li>
                                    <span className="tech-label">Document Synthesis</span>
                                    <span className="tech-value">Playwright Headless PDF Generation</span>
                                </li>
                            </ul>
                            <div className="about-disclaimer">
                                <strong>Important:</strong> AI-generated advice is based on pattern recognition and probabilistic reasoning.
                                It should supplement ~ not entirely replace ~ expert legal, financial, or medical advice.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
