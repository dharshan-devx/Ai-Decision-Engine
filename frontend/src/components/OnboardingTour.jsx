"use client";
import { useState, useEffect } from "react";

const TOUR_KEY = "de_onboarding_done";

const STEPS = [
    {
        target: ".dilemma-area",
        title: "Describe Your Dilemma",
        text: "Type any decision you're facing ~ career, investment, education, anything. The more context you provide, the better the analysis.",
        position: "bottom",
    },
    {
        target: ".analyze-btn",
        title: "Run the Analysis",
        text: "Hit this button and our AI agents will decompose your decision into 11 strategic dimensions with probabilistic models.",
        position: "top",
    },
    {
        target: ".header-right",
        title: "History & Compare",
        text: "All your past analyses are saved. You can revisit them or compare two decisions side-by-side.",
        position: "bottom",
    },
];

export default function OnboardingTour() {
    const [step, setStep] = useState(-1);
    const [targetRect, setTargetRect] = useState(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const done = localStorage.getItem(TOUR_KEY);
        if (!done) {
            // Small delay to let the page render
            const timer = setTimeout(() => setStep(0), 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        if (step < 0 || step >= STEPS.length) return;
        const el = document.querySelector(STEPS[step].target);
        if (!el) {
            // Element not found — skip to next step or dismiss
            if (step < STEPS.length - 1) setStep(step + 1);
            else handleDismiss();
            return;
        }
        // Scroll to the element first
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Wait for scroll to finish, then measure position
        const timer = setTimeout(() => {
            const rect = el.getBoundingClientRect();
            setTargetRect(rect);
        }, 400);
        return () => clearTimeout(timer);
    }, [step]);

    const handleNext = () => {
        if (step >= STEPS.length - 1) {
            handleDismiss();
        } else {
            setStep(step + 1);
        }
    };

    const handleDismiss = () => {
        setStep(-1);
        localStorage.setItem(TOUR_KEY, "true");
    };

    if (step < 0 || step >= STEPS.length || !targetRect) return null;

    const current = STEPS[step];
    const isBottom = current.position === "bottom";

    const tooltipStyle = {
        position: "fixed",
        left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 340)),
        top: isBottom ? targetRect.bottom + 14 : targetRect.top - 14,
        transform: isBottom ? "none" : "translateY(-100%)",
        zIndex: 10002,
    };

    return (
        <>
            {/* Overlay */}
            <div className="tour-overlay" onClick={handleDismiss} />

            {/* Spotlight */}
            <div
                className="tour-spotlight"
                style={{
                    top: targetRect.top - 6,
                    left: targetRect.left - 6,
                    width: targetRect.width + 12,
                    height: targetRect.height + 12,
                }}
            />

            {/* Tooltip */}
            <div className="tour-tooltip" style={tooltipStyle}>
                <div className="tour-step-indicator">
                    {STEPS.map((_, i) => (
                        <div key={i} className={`tour-dot ${i === step ? "active" : i < step ? "done" : ""}`} />
                    ))}
                </div>
                <div className="tour-title">{current.title}</div>
                <div className="tour-text">{current.text}</div>
                <div className="tour-actions">
                    <button className="tour-skip" onClick={handleDismiss}>Skip</button>
                    <button className="tour-next" onClick={handleNext}>
                        {step === STEPS.length - 1 ? "Get Started" : "Next"}
                    </button>
                </div>
            </div>
        </>
    );
}
