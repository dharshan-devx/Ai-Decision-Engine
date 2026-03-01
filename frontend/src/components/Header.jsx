import { useState, useEffect } from "react";
import api from "../lib/api";

export default function Header({ showHistory, setShowHistory, compareMode, setCompareMode }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("de-theme") || "dark");
  const [apiActive, setApiActive] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("de-theme", theme);
  }, [theme]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get("/health");
        setApiActive(res.data.api_active ?? true);
      } catch (e) {
        setApiActive(false);
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
        <button className="header-icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === "dark" ? "☀" : "☾"}
        </button>
        <span className="header-badge">Powered by Gemini</span>
        <div className="header-status">
          <div className={apiActive ? "status-dot" : "status-dot-offline"} />
          {apiActive ? "AI Layer Active" : "AI Layer Offline"}
        </div>
      </div>
    </header>
  );
}
