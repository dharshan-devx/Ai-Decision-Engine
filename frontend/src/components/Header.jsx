import { useState, useEffect } from "react";

export default function Header({ showHistory, setShowHistory, compareMode, setCompareMode }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("de-theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("de-theme", theme);
  }, [theme]);

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
          <div className="status-dot" />
          AI Layer Active
        </div>
      </div>
    </header>
  );
}
