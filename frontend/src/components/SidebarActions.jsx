"use client";
import React, { useState, useEffect } from 'react';

export default function SidebarActions({ compareMode, setCompareMode, showHistory, setShowHistory }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isAttached, setIsAttached] = useState(false);

    useEffect(() => {
        // Handle initial fade-in
        const timer = setTimeout(() => setIsAttached(true), 100);

        const handleScroll = () => {
            const currentScrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
            // Hide if scrolled down more than 20px
            if (currentScrollY > 20) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(timer);
        };
    }, []);

    return (
        <div className={`sidebar-floating-actions ${isAttached ? 'attached' : ''} ${!isVisible ? 'hidden' : ''}`}>
            <button
                className={`sidebar-btn ${compareMode ? "active" : ""}`}
                onClick={() => setCompareMode(!compareMode)}
                title={compareMode ? "Single Mode" : "Compare Mode"}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 3h5v5"></path>
                    <path d="M8 3H3v5"></path>
                    <path d="M12 22v-8.3a4 4 0 0 0-1.17-2.83V11"></path>
                    <path d="m3 3 7.53 7.53"></path>
                    <path d="m21 3-7.53 7.53"></path>
                </svg>
                <span className="sidebar-tooltip">Compare</span>
            </button>

            <button
                className={`sidebar-btn ${showHistory ? "active" : ""}`}
                onClick={() => setShowHistory(!showHistory)}
                title="History"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span className="sidebar-tooltip">History</span>
            </button>
        </div>
    );
}
