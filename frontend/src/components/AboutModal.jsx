"use client";
import React, { useEffect, useState, useRef } from 'react';
import NeuralBrain from './NeuralBrain';

export default function AboutModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [transitioning, setTransitioning] = useState(false);
    const [displayTab, setDisplayTab] = useState('overview');
    const contentRef = useRef(null);

    const handleTabChange = (tab) => {
        if (tab === activeTab) return;
        setTransitioning(true);
        setTimeout(() => {
            setDisplayTab(tab);
            setActiveTab(tab);
            setTimeout(() => setTransitioning(false), 30);
        }, 250);
    };

    useEffect(() => {
        if (isOpen) {
            setActiveTab('overview');
            setDisplayTab('overview');
            setTransitioning(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="about-modal-overlay" onClick={onClose}>
            <div className="about-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="about-close-btn" onClick={onClose} aria-label="Close modal">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>

                <div className="about-modal-header">
                    <div className="about-logo-wrapper">
                        <NeuralBrain style={{ width: 56, height: 56, background: 'transparent' }} />
                    </div>
                    <h2 className="about-title">Decision Engine</h2>
                    <p className="about-subtitle">AI-Powered Strategic Reasoning</p>
                    <div className="about-version-badge">v2.0.0 &bull; Cognitive Model</div>
                </div>

                <div className="about-tabs">
                    {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'vs-llms', label: 'Differentiators' },
                        { key: 'capabilities', label: 'Capabilities' },
                        { key: 'architecture', label: 'Tech Stack' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            className={`about-tab ${activeTab === key ? 'active' : ''}`}
                            onClick={() => handleTabChange(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="about-scroll-area" ref={contentRef}>
                    <div className={`about-tab-content ${transitioning ? 'fade-out' : 'fade-in'}`}>

                        {displayTab === 'overview' && (
                            <div className="about-section">
                                <p className="about-text">
                                    A high-dimensional cognitive engine built for complex, high-stakes dilemmas.
                                    It systematically deconstructs problems to neutralize human biases, forecast probabilistic
                                    outcomes, and surface hidden risks ~ delivering actionable clarity.
                                </p>
                                <div className="about-creator-card">
                                    <div className="creator-label">Crafted by</div>
                                    <div className="creator-name">DHARSHAN DEVX</div>
                                    <div className="creator-desc">
                                        Built for precision, clarity, and rigorous analytical thinking.
                                    </div>
                                </div>
                            </div>
                        )}

                        {displayTab === 'vs-llms' && (
                            <div className="about-section">
                                <p className="about-text" style={{ marginBottom: '4px' }}>
                                    Unlike general-purpose assistants such as ChatGPT, this system is a specialized cognitive framework engineered for structured problem-solving.
                                </p>

                                <div className="about-grid" style={{ gridTemplateColumns: '1fr', gap: '10px' }}>
                                    <div className="about-feature">
                                        <h3 style={{ marginTop: 0 }}>🚫 Beyond Conversation</h3>
                                        <p>Standard models often engage in open-ended chat and "sycophancy" ~ agreeing just to be helpful. This engine strips away filler to deliver blunt, structured, objective outputs.</p>
                                    </div>
                                    <div className="about-feature">
                                        <h3 style={{ marginTop: 0 }}>⚙️ Multi-Agent Pipeline</h3>
                                        <p>Rather than a single prompt handling everything, dilemmas are routed through specialized analytical stages ~ Risk Assessment, Bias Detection, and Strategic Planning — ensuring no angle is missed.</p>
                                    </div>
                                    <div className="about-feature">
                                        <h3 style={{ marginTop: 0 }}>🔢 Quantitative Rigor</h3>
                                        <p>Instead of generic pros and cons, the system assigns probabilistic confidence scores and antifragility metrics, providing measurable data over vague advice.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {displayTab === 'capabilities' && (
                            <div className="about-section">
                                <div className="about-grid">
                                    <div className="about-feature">
                                        <span className="feature-icon">🧠</span>
                                        <h3>Bias Detection</h3>
                                        <p>Uncovers emotional filters and cognitive fallacies ~ such as sunk cost or confirmation bias ~ that cloud judgment.</p>
                                    </div>
                                    <div className="about-feature">
                                        <span className="feature-icon">📊</span>
                                        <h3>Probabilistic Modeling</h3>
                                        <p>Forecasts potential outcomes using historical patterns and returns a confidence score out of 100.</p>
                                    </div>
                                    <div className="about-feature">
                                        <span className="feature-icon">🛤️</span>
                                        <h3>Strategic Divergence</h3>
                                        <p>Surfaces non-obvious alternatives, breaking false "either-or" dichotomies to reveal creative solutions.</p>
                                    </div>
                                    <div className="about-feature">
                                        <span className="feature-icon">🛡️</span>
                                        <h3>Antifragility Score</h3>
                                        <p>Measures resilience against downside risk and unforeseen disruption for every option.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {displayTab === 'architecture' && (
                            <div className="about-section">
                                <ul className="about-tech-list">
                                    <li>
                                        <span className="tech-label">Intelligence Layer</span>
                                        <span className="tech-value">Google Gemini Pro API</span>
                                    </li>
                                    <li>
                                        <span className="tech-label">Server Runtime</span>
                                        <span className="tech-value">Python / FastAPI (Async)</span>
                                    </li>
                                    <li>
                                        <span className="tech-label">Interface</span>
                                        <span className="tech-value">React / Next.js</span>
                                    </li>
                                    <li>
                                        <span className="tech-label">Report Generation</span>
                                        <span className="tech-value">Playwright Headless PDF</span>
                                    </li>
                                </ul>
                                <div className="about-disclaimer">
                                    <strong>Note:</strong> AI-generated insights rely on pattern recognition and probabilistic reasoning.
                                    They should complement ~ not replace ~ professional legal, financial, or medical counsel.
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
