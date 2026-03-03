"use client";
import { useState, useCallback, useEffect, useRef } from "react";

function extractTextFromData(data, dilemma) {
    if (!data) return "";
    const parts = [];

    parts.push(`Decision Analysis Report.`);
    parts.push(data.problemFraming?.coreDecision || dilemma || "");

    if (data.problemFraming?.hiddenAssumptions?.length > 0) {
        parts.push("Hidden Assumptions:");
        data.problemFraming.hiddenAssumptions.forEach(a => parts.push(a));
    }

    if (data.riskAnalysis?.length > 0) {
        parts.push("Risk Analysis:");
        data.riskAnalysis.forEach(r => {
            parts.push(`${r.name}. Level: ${r.level}. Score: ${r.score} out of 100. ${r.description}`);
        });
    }

    if (data.strategicPaths?.length > 0) {
        parts.push("Strategic Paths:");
        data.strategicPaths.forEach((p, i) => {
            parts.push(`Path ${i + 1}: ${p.name}. ${p.description}. Success probability: ${p.successProbability} percent.`);
        });
    }

    if (data.recommendations) {
        parts.push("Recommendations:");
        Object.entries(data.recommendations).forEach(([k, v]) => {
            parts.push(`${k.replace(/([A-Z])/g, " $1").trim()}: ${v.choice}. ${v.reasoning}`);
        });
    }

    if (data.regretMinimization) {
        parts.push(`Regret Minimization. ${data.regretMinimization.at80Analysis}. Primary risk: ${data.regretMinimization.primaryRegretRisk}`);
    }

    parts.push(`Overall confidence score: ${data.confidenceScore} out of 100.`);

    return parts.join(". ");
}

export default function TextToSpeech({ data, dilemma, language = "english" }) {
    const [speaking, setSpeaking] = useState(false);
    const [paused, setPaused] = useState(false);
    const utteranceRef = useRef(null);

    // Check if TTS is supported
    const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

    const handleSpeak = useCallback(() => {
        if (!isSupported || !data) return;

        if (speaking && !paused) {
            window.speechSynthesis.pause();
            setPaused(true);
            return;
        }

        if (paused) {
            window.speechSynthesis.resume();
            setPaused(false);
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const text = extractTextFromData(data, dilemma);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        let targetLang = "en-US";
        if (language === "hindi") targetLang = "hi-IN";
        if (language === "telugu") targetLang = "te-IN";

        utterance.lang = targetLang;

        const voices = window.speechSynthesis.getVoices();
        let preferred = null;

        if (language === "english") {
            // Prefer confident English male voices
            preferred = voices.find(v => /Google UK English Male/i.test(v.name))
                || voices.find(v => /Microsoft David/i.test(v.name))
                || voices.find(v => /Daniel/i.test(v.name) && v.lang.startsWith("en"))
                || voices.find(v => /James/i.test(v.name) && v.lang.startsWith("en"))
                || voices.find(v => /male/i.test(v.name) && v.lang.startsWith("en"))
                || voices.find(v => v.lang.startsWith("en") && v.name.includes("Google"))
                || voices.find(v => v.lang.startsWith("en"));
        } else {
            // For Hindi/Telugu, try to find a matching voice (male preferred, but any matching lang is fallback)
            preferred = voices.find(v => v.lang.startsWith(targetLang) && /male|man/i.test(v.name))
                || voices.find(v => v.lang.startsWith(targetLang) && v.name.includes("Google"))
                || voices.find(v => v.lang.startsWith(targetLang))
                // Fallback to hindi if telugu voice is not found on device, it might read better
                || (language === "telugu" ? voices.find(v => v.lang.startsWith("hi-IN")) : null);
        }

        if (preferred) utterance.voice = preferred;

        utterance.onstart = () => { setSpeaking(true); setPaused(false); };
        utterance.onend = () => { setSpeaking(false); setPaused(false); };
        utterance.onerror = () => { setSpeaking(false); setPaused(false); };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [data, dilemma, speaking, paused, isSupported, language]);

    const handleStop = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.cancel();
        setSpeaking(false);
        setPaused(false);
    }, [isSupported]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isSupported) window.speechSynthesis.cancel();
        };
    }, [isSupported]);

    if (!isSupported) return null;

    return (
        <div className="tts-controls">
            <button
                className={`result-action-btn tts-btn ${speaking ? "active" : ""}`}
                onClick={handleSpeak}
                title={speaking ? (paused ? "Resume" : "Pause") : "Read Aloud"}
            >
                {speaking && !paused ? (
                    <>⏸ Pause</>
                ) : speaking && paused ? (
                    <>▶ Resume</>
                ) : (
                    <>🔊 Read Aloud</>
                )}
            </button>
            {speaking && (
                <button
                    className="result-action-btn tts-stop-btn"
                    onClick={handleStop}
                    title="Stop reading"
                >
                    ⏹ Stop
                </button>
            )}
        </div>
    );
}
