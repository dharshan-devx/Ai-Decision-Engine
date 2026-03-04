"use client";
import { useState, useCallback, useEffect, useRef } from "react";

// Helper to clean markdown and artifacts for cleaner speech
function cleanTextForSpeech(text) {
    if (!text) return "";
    return text
        .replace(/\*\*/g, "") // Remove bold
        .replace(/\*/g, "")   // Remove italics/bullets
        .replace(/#/g, "")    // Remove headers
        .replace(/`/g, "")    // Remove code ticks
        .replace(/\[/g, "")   // Remove brackets
        .replace(/\]/g, "")
        .replace(/\(/g, "")   // Remove parens
        .replace(/\)/g, "")
        .replace(/-/g, " ")   // Replace hyphens with spaces for better rhythm
        .replace(/\s+/g, " ") // Collapse spaces
        .trim();
}

function extractTextFromData(data, dilemma) {
    if (!data) return "";

    // Prioritize high-confidence AI-generated synthesized briefing
    if (data.voiceBriefing) {
        return cleanTextForSpeech(data.voiceBriefing);
    }

    const parts = [];
    parts.push(`Strategic Decision Briefing.`);
    parts.push(`Dilemma: ${data.problemFraming?.coreDecision || dilemma || "Unknown"}.`);

    // (Existing extraction logic follows...)
    // ... (rest of the sections simplified for extractTextFromData)
    // 11. Regret Minimization
    if (data.regretMinimization) {
        parts.push(`Regret Minimization Framing.`);
        parts.push(`${data.regretMinimization.at80Analysis} Target recommendation: ${data.regretMinimization.recommendation}`);
    }

    parts.push(`Strategic report finalized. End of briefing.`);

    return cleanTextForSpeech(parts.join(". "));
}

export default function TextToSpeech({ data, dilemma, language = "english" }) {
    const [speaking, setSpeaking] = useState(false);
    const [paused, setPaused] = useState(false);
    const [voices, setVoices] = useState([]);
    const utteranceRef = useRef(null);

    // Check if TTS is supported
    const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

    // Load voices properly
    useEffect(() => {
        if (!isSupported) return;

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [isSupported]);

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

        // Optimizing for confidence and clarity with high emotional energy
        utterance.rate = 1.05; // Slightly faster for excitement
        utterance.pitch = 1.2; // Higher pitch for a "happier", more energetic tone
        utterance.volume = 1.0;

        let targetLang = "en-US";
        if (language === "hindi") targetLang = "hi-IN";
        if (language === "telugu") targetLang = "te-IN";

        utterance.lang = targetLang;

        let preferred = null;

        if (language === "english") {
            // Priority: Natural/Premium/Neural Male voices
            preferred = voices.find(v => v.lang.startsWith("en") && /natural|premium|neural/i.test(v.name) && /male/i.test(v.name))
                || voices.find(v => v.lang.startsWith("en") && /natural|premium|neural/i.test(v.name))
                || voices.find(v => /Google UK English Male/i.test(v.name))
                || voices.find(v => /Microsoft David/i.test(v.name))
                || voices.find(v => /Daniel/i.test(v.name) && v.lang.startsWith("en"))
                || voices.find(v => /James/i.test(v.name) && v.lang.startsWith("en"))
                || voices.find(v => /male/i.test(v.name) && v.lang.startsWith("en"))
                || voices.find(v => v.lang.startsWith("en") && v.name.includes("Google"))
                || voices.find(v => v.lang.startsWith("en"));
        } else {
            // For Hindi/Telugu, priority: Natural/Premium/Neural Male
            preferred = voices.find(v => v.lang.startsWith(targetLang) && /natural|premium|neural/i.test(v.name) && /male/i.test(v.name))
                || voices.find(v => v.lang.startsWith(targetLang) && /natural|premium|neural/i.test(v.name))
                || voices.find(v => v.lang.startsWith(targetLang) && /male|man/i.test(v.name))
                || voices.find(v => v.lang.startsWith(targetLang) && v.name.includes("Google"))
                || voices.find(v => v.lang.startsWith(targetLang))
                // Fallback
                || (language === "telugu" ? voices.find(v => v.lang.startsWith("hi-IN")) : null);
        }

        if (preferred) utterance.voice = preferred;

        utterance.onstart = () => { setSpeaking(true); setPaused(false); };
        utterance.onend = () => { setSpeaking(false); setPaused(false); };
        utterance.onerror = () => { setSpeaking(false); setPaused(false); };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [data, dilemma, speaking, paused, isSupported, language, voices]);

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
                className={`result-action-btn tts-btn exclusive-voice-btn ${speaking ? "active" : ""}`}
                onClick={handleSpeak}
                title={speaking ? (paused ? "Resume" : "Pause") : "Exclusive Strategic Briefing"}
            >
                {speaking && !paused ? (
                    <>⏸ Pause Briefing</>
                ) : speaking && paused ? (
                    <>▶ Resume Briefing</>
                ) : (
                    <>✨ Exclusive Voice Summary</>
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
