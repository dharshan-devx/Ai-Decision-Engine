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
        setApiActive(res.data.api_active ?? "active");
      } catch (e) {
        setApiActive("offline");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // 60s
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

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
        >
          ⟺
        </button>
        <button
          className="header-icon-btn"
          onClick={() => setShowHistory(!showHistory)}
          title="History"
        >
          📋
        </button>
        <span className="header-badge">Powered by Gemini</span>
        <div className="header-status">
          <div className={apiActive === "active" ? "status-dot" : apiActive === "quota_exceeded" ? "status-dot-quota" : "status-dot-offline"} />
          {apiActive === "active" ? "AI Layer Active" : apiActive === "quota_exceeded" ? "API Quota Exceeded" : "AI Layer Offline"}
        </div>
      </div>
    </header>
  );
}

