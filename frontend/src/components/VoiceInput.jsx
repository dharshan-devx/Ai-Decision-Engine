"use client";
import { useState, useCallback, useEffect, useRef } from "react";

export default function VoiceInput({ onTranscript, language = "english" }) {
    const [isListening, setIsListening] = useState(false);
    const [interimText, setInterimText] = useState("");
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const isManuallyStopped = useRef(true);
    
    // Stable reference to onTranscript to avoid effect re-runs
    const onTranscriptRef = useRef(onTranscript);
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    // Initialize Speech Recognition
    const startRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech recognition not supported in this browser.");
            return;
        }

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {}
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        let targetLang = "en-US";
        if (language === "hindi") targetLang = "hi-IN";
        if (language === "telugu") targetLang = "te-IN";
        recognition.lang = targetLang;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            console.log("Recognition started for lang:", recognition.lang);
        };

        recognition.onresult = (event) => {
            let finalTranscript = "";
            let currentInterim = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    currentInterim += transcript;
                }
            }

            if (finalTranscript) {
                onTranscriptRef.current(finalTranscript.trim());
                setInterimText("");
            } else {
                setInterimText(currentInterim);
            }
        };

        recognition.onerror = (event) => {
            console.warn("Recognition error:", event.error);
            if (event.error === "not-allowed") {
                setError("Microphone access denied.");
                setIsListening(false);
                isManuallyStopped.current = true;
            } else if (event.error === "network") {
                setError("Network connection lost.");
            }
        };

        recognition.onend = () => {
            console.log("Recognition ended. manualStop:", isManuallyStopped.current);
            if (!isManuallyStopped.current) {
                // Short delay before restart to avoid browser throttling
                setTimeout(() => {
                    if (!isManuallyStopped.current) {
                        try {
                            recognition.start();
                        } catch (err) {
                            console.error("Restart failed:", err);
                        }
                    }
                }, 300);
            } else {
                setIsListening(false);
                setInterimText("");
            }
        };

        recognitionRef.current = recognition;
        
        try {
            recognition.start();
        } catch (e) {
            console.error("Initial start failed:", e);
        }
    }, [language]); // Only restart if language changes

    useEffect(() => {
        // If language changes and we are listening, restart with new language
        if (isListening && !isManuallyStopped.current) {
            startRecognition();
        }
    }, [language, startRecognition]);

    useEffect(() => {
        return () => {
            isManuallyStopped.current = true;
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            isManuallyStopped.current = true;
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            setInterimText("");
        } else {
            isManuallyStopped.current = false;
            setError(null);
            startRecognition();
        }
    }, [isListening, startRecognition]);

    if (error && error.includes("not supported")) {
        return null;
    }

    return (
        <div className="voice-input-container">
            <div className="voice-input-controls">
                <button
                    type="button"
                    className={`voice-input-btn ${isListening ? "listening" : ""}`}
                    onClick={toggleListening}
                    title={isListening ? "Stop listening" : "Start voice input"}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="22"></line>
                        <line x1="8" y1="22" x2="16" y2="22"></line>
                    </svg>
                    {isListening && <div className="voice-pulse"></div>}
                </button>
                {isListening && (
                    <div className="listening-indicator">
                        <span className="listening-dot"></span>
                        <span className="listening-text">
                            {interimText || "Listening..."}
                        </span>
                    </div>
                )}
            </div>
            {error && <div className="voice-error">{error}</div>}
        </div>
    );
}
