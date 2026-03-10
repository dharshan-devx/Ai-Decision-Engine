"use client";
import { useState, useCallback, useEffect, useRef } from "react";

export default function VoiceInput({ onTranscript, language = "english" }) {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;

        let targetLang = "en-US";
        if (language === "hindi") targetLang = "hi-IN";
        if (language === "telugu") targetLang = "te-IN";
        recognition.lang = targetLang;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript;
            if (event.results[current].isFinal) {
                onTranscript(transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
            if (event.error !== "no-speech") {
                setError(`Error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [language, onTranscript]);

    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            try {
                recognitionRef.current?.start();
            } catch (err) {
                console.error("Failed to start speech recognition:", err);
            }
        }
    }, [isListening]);

    if (error && error.includes("not supported")) {
        return null;
    }

    return (
        <div className="voice-input-container">
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
                    {isListening ? (
                        <>
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="22"></line>
                            <line x1="8" y1="22" x2="16" y2="22"></line>
                            <circle cx="12" cy="12" r="10" strokeWidth="1" opacity="0.3" className="pulse-ring"></circle>
                        </>
                    ) : (
                        <>
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </>
                    )}
                </svg>
            </button>
            {isListening && <span className="listening-text">Listening...</span>}
            {error && <div className="voice-error">{error}</div>}
        </div>
    );
}
