"use client";
import React from "react";

export default function ApiKeyAlert({ isOpen, onClose, errorType }) {
    if (!isOpen) return null;

    const isQuota = errorType === "quota";
    const title = isQuota ? "API Quota Exceeded" : "Invalid API Key";
    const message = isQuota
        ? "The shared global API limit has been reached. To continue with high-precision analysis, please use your own Gemini API key."
        : "The API key you provided appears to be invalid or has expired. Please check your credentials and try again.";

    return (
        <div className="alert-overlay">
            <div className="alert-modal">
                <div className="alert-header">
                    <div className="alert-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                        </svg>
                    </div>
                    <h2 className="alert-title">{title}</h2>
                </div>

                <p className="alert-message">{message}</p>

                <div className="alert-steps">
                    <h3 className="steps-title">How to get a new API Key:</h3>
                    <ol className="steps-list">
                        <li>Visit <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
                        <li>Sign in with your Google Account</li>
                        <li>Click <strong>"Create API key"</strong></li>
                        <li>Copy and paste the key (starts with <code>AIza...</code>) into the input field</li>
                    </ol>
                </div>

                <div className="alert-actions">
                    <a
                        href="https://aistudio.google.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="alert-btn-primary"
                    >
                        Get API Key
                    </a>
                    <button className="alert-btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
