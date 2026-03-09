"use client";
import React, { useState, useEffect } from "react";
import api from "../lib/api";
import NeuralBrain from "./NeuralBrain";
import AboutModal from "./AboutModal";

const ONBOARDING_KEY = "de_onboarding_done";

// Helper for real-time count animation
function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = parseInt(value);
    if (start === end) return;

    const duration = 500; // Snappier 0.5s animation
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span className="stats-value">{displayValue.toLocaleString()}</span>;
}

export default function Header({ siteStats, loading }) {
  const [apiActive, setApiActive] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("de-theme", "dark");
    }
  }, []);

  // Auto-open AboutModal for first-time users
  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      const timer = setTimeout(() => setAboutOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get("/health");
        setApiActive(res.data.ai_layer ?? "unknown");
      } catch (e) {
        setApiActive("offline");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-group">
          <span className="logo">Decision Engine</span>
          <span className="logo-sub">Strategic Reasoning System</span>
        </div>
      </div>
      <div
        className="header-center"
        onClick={() => setAboutOpen(true)}
        style={{ cursor: "pointer" }}
        title="About Decision Engine"
      >
        <NeuralBrain isLoading={loading} style={{ width: '40px', height: '40px', background: 'transparent' }} />
      </div>
      <div className="header-right">
        <div className="gemini-badge">
          <svg className="gemini-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="currentColor" />
          </svg>
          <span className="gemini-text">AI REASONING CORE</span>
        </div>
        <div className="header-status-group">
          <div className="header-status">
            <div className={apiActive === "active" ? "status-dot status-pulse" : apiActive === "quota_exceeded" ? "status-dot-quota" : apiActive === "unknown" ? "status-dot-unknown" : "status-dot-offline"} />
            {apiActive === "active" ? "AI Layer Active" : apiActive === "quota_exceeded" ? "API Quota Exceeded" : apiActive === "unknown" ? "AI Layer Standby" : "AI Layer Offline"}
          </div>
          {siteStats && (
            <div className="stats-pill">
              <svg className="stats-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <div className="stats-text">
                <AnimatedNumber value={siteStats.total_visits} /> <span className="stats-label">VISITS</span>
                <span className="stats-divider">·</span>
                <AnimatedNumber value={siteStats.unique_users} /> <span className="stats-label">USERS</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <AboutModal isOpen={aboutOpen} onClose={() => { setAboutOpen(false); localStorage.setItem(ONBOARDING_KEY, "true"); }} />
    </header>
  );
}

