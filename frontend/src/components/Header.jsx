"use client";
import { useState, useEffect } from "react";
import api from "../lib/api";

export default function Header({ showHistory, setShowHistory, compareMode, setCompareMode }) {
  const [apiActive, setApiActive] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("de-theme", "dark");
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
        <span className="header-badge">Powered by Gemini</span>
        <div className="header-status">
          <div className={apiActive === "active" ? "status-dot" : apiActive === "quota_exceeded" ? "status-dot-quota" : apiActive === "unknown" ? "status-dot-unknown" : "status-dot-offline"} />
          {apiActive === "active" ? "AI Layer Active" : apiActive === "quota_exceeded" ? "API Quota Exceeded" : apiActive === "unknown" ? "AI Layer Standby" : "AI Layer Offline"}
        </div>
      </div>
    </header>
  );
}

