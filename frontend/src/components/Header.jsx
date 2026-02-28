export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <span className="logo">Decision Engine</span>
        <span className="logo-sub">Strategic Reasoning System</span>
      </div>
      <div className="header-right">
        <span className="header-badge">Powered by Gemini</span>
        <div className="header-status">
          <div className="status-dot" />
          AI Layer Active
        </div>
      </div>
    </header>
  );
}
