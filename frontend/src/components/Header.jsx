"use client";
import React, { useState, useEffect } from "react";
import api from "../lib/api";
import NeuralBrain from "./NeuralBrain";
import AboutModal from "./AboutModal";

const ONBOARDING_KEY = "de_onboarding_done";

export default function Header({ showHistory, setShowHistory, compareMode, setCompareMode, siteStats, loading }) {
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
    const interval = setInterval(checkHealth, 60000); // 60s
    return () => clearInterval(interval);
  }, []);



  return (
    <header className="header">
      <div className="header-left">
        <span className="logo">Decision Engine</span>
        <span className="logo-sub">Strategic Reasoning System</span>
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

        <button
          className={`header-icon-btn ${compareMode ? "active" : ""}`}
          onClick={() => setCompareMode(!compareMode)}
          title={compareMode ? "Single Mode" : "Compare Mode"}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"></path><path d="M8 3H3v5"></path><path d="M12 22v-8.3a4 4 0 0 0-1.17-2.83V11"></path><path d="m3 3 7.53 7.53"></path><path d="m21 3-7.53 7.53"></path></svg>
        </button>
        <button
          className="header-icon-btn"
          onClick={() => setShowHistory(!showHistory)}
          title="History"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </button>
        <div className="gemini-badge">
          <svg className="gemini-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="currentColor" />
          </svg>
          <span className="gemini-text">Powered by Gemini</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div className="header-status">
            <div className={apiActive === "active" ? "status-dot" : apiActive === "quota_exceeded" ? "status-dot-quota" : apiActive === "unknown" ? "status-dot-unknown" : "status-dot-offline"} />
            {apiActive === "active" ? "AI Layer Active" : apiActive === "quota_exceeded" ? "API Quota Exceeded" : apiActive === "unknown" ? "AI Layer Standby" : "AI Layer Offline"}
          </div>
          {siteStats && (
            <div className="header-stats">
              <svg className="stats-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="stats-text">
                {siteStats.total_visits.toLocaleString()} visits <span className="stats-divider">·</span> {siteStats.unique_users.toLocaleString()} users
              </span>
            </div>
          )}
        </div>
      </div>
      <AboutModal isOpen={aboutOpen} onClose={() => { setAboutOpen(false); localStorage.setItem(ONBOARDING_KEY, "true"); }} />
    </header>
  );
}

