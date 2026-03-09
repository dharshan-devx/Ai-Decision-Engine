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
                        <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                <div className="about-modal-header">
                    <div className="about-logo-wrapper">
                        <NeuralBrain style={{ width: 56, height: 56, background: 'transparent' }} />
                    </div>
                    <h2 className="about-title">Decision Engine</h2>
                    <p className="about-subtitle">AI-Powered Strategic Reasoning</p>
                    <div className="about-version-badge">Strategic Intelligence Core</div>
                </div>

                <div className="about-tabs">
                    {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'vs-llms', label: 'The Methodology' },
                        { key: 'capabilities', label: 'Engine Capabilities' },
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
                                    Decision Engine is a high-dimensional cognitive framework architected for complex, high-stakes strategic reasoning.
                                    By leveraging advanced multi-agent orchestration, it systematically deconstructs problems to neutralize human biases,
                                    forecast probabilistic outcomes, and surface hidden risks with surgical precision.
                                </p>
                                <div className="about-creator-card">
                                    <div className="creator-label">Lead Architect</div>
                                    <div className="creator-name">DHARSHAN DEVX</div>
                                    <div className="creator-desc">
                                        Engineering systems that bridge the gap between artificial intelligence and rigorous human logic.
                                    </div>
                                </div>
                            </div>
                        )}

                        {displayTab === 'vs-llms' && (
                            <div className="about-section">
                                <p className="about-text" style={{ marginBottom: '12px' }}>
                                    Unlike general-purpose conversational AI, this engine is a specialized analytical pipeline designed for objective evaluation.
                                </p>

                                <div className="about-grid" style={{ gridTemplateColumns: '1fr', gap: '12px' }}>
                                    <div className="about-card-premium">
                                        <h3 className="card-premium-title">Structured Reasoning</h3>
                                        <p className="card-premium-text">
                                            Dilemmas are routed through specialized analytical stages ~ Risk Assessment, Bias Detection, and Strategic Planning ~ ensuring 360-degree coverage.
                                        </p>
                                    </div>
                                    <div className="about-card-premium">
                                        <h3 className="card-premium-title">Objective Neutrality</h3>
                                        <p className="card-premium-text">
                                            The system is engineered to resist "sycophancy" ~ the tendency of AI to agree with users. It provides blunt, data-driven analysis over pleasant conversation.
                                        </p>
                                    </div>
                                    <div className="about-card-premium">
                                        <h3 className="card-premium-title">Quantitative Metrics</h3>
                                        <p className="card-premium-text">
                                            Abstract decisions are converted into measurable data, including probabilistic confidence scores and antifragility rankings.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {displayTab === 'capabilities' && (
                            <div className="about-section">
                                <div className="about-grid">
                                    <div className="about-feature-box">
                                        <div className="feature-box-icon">⚖️</div>
                                        <h3 className="feature-box-title">Bias Neutralization</h3>
                                        <p className="feature-box-text">
                                            Algorithmically detects cognitive fallacies like Sunk Cost and Confirmation Bias that distort strategic judgment.
                                        </p>
                                    </div>
                                    <div className="about-feature-box">
                                        <div className="feature-box-icon">🔮</div>
                                        <h3 className="feature-box-title">Outcome Forecasting</h3>
                                        <p className="feature-box-text">
                                            Utilizes probabilistic modeling to simulate potential trajectories and assign rigor-backed confidence levels.
                                        </p>
                                    </div>
                                    <div className="about-feature-box">
                                        <div className="feature-box-icon">🛰️</div>
                                        <h3 className="feature-box-title">Strategic Divergence</h3>
                                        <p className="feature-box-text">
                                            Surfaces non-obvious alternatives, breaking false dichotomies to reveal high-alpha strategic paths.
                                        </p>
                                    </div>
                                    <div className="about-feature-box">
                                        <div className="feature-box-icon">🛡️</div>
                                        <h3 className="feature-box-title">Antifragility Guard</h3>
                                        <p className="feature-box-text">
                                            Measures the resilience of decision paths against extreme downside volatility and systemic shocks.
                                        </p>
                                    </div>
                                </div>
                                <div className="about-disclaimer-premium">
                                    <span className="disclaimer-icon">⚠️</span>
                                    <p>
                                        AI-generated insights complement ~ but do not replace ~ professional legal, financial, or medical counsel. Use as a strategic advisor for analytical depth.
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
