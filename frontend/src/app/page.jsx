"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/Header";
import InputPanel from "../components/InputPanel";
import OutputPanel from "../components/OutputPanel";
import HistoryPanel from "../components/HistoryPanel";
import ComparePanel from "../components/ComparePanel";
import Toast from "../components/Toast";
import PrintTemplate from "../components/PrintTemplate";
import ErrorBoundary from "../components/ErrorBoundary";
import ApiKeyAlert from "../components/ApiKeyAlert";

import TextToSpeech from "../components/TextToSpeech";
import SidebarActions from "../components/SidebarActions";

import { useDecisionEngine } from "../hooks/useDecisionEngine";
import { useHistory } from "../hooks/useHistory";
import LZString from "lz-string";
import { createShareLink, getSharedAnalysis, trackVisit, getSiteStats } from "../lib/api";

export default function App() {
  const engine = useDecisionEngine();
  const { history, saveAnalysis, deleteAnalysis, clearHistory } = useHistory();
  const [showHistory, setShowHistory] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareRestoreData, setCompareRestoreData] = useState(null);
  const [toast, setToast] = useState(null);
  const [printMode, setPrintMode] = useState(false);
  const resultsRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [siteStats, setSiteStats] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("invalid"); // "invalid" or "quota"

  // Monitor engine error for API key issues
  useEffect(() => {
    if (engine.error) {
      const err = engine.error.toLowerCase();
      if (err.includes("api key") || err.includes("invalid")) {
        setAlertType("invalid");
        setShowAlert(true);
      } else if (err.includes("quota") || err.includes("limit") || err.includes("exhausted")) {
        setAlertType("quota");
        setShowAlert(true);
      }
    }
  }, [engine.error]);


  // Fix scroll position on reload
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Monitor scroll for Scroll-to-Top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Anonymous visitor tracking with Real-time updates
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getSiteStats();
        if (stats) setSiteStats(stats);
      } catch { /* silent */ }
    };

    const track = async () => {
      try {
        let vid = localStorage.getItem("de_visitor_id");
        if (!vid) {
          vid = crypto.randomUUID();
          localStorage.setItem("de_visitor_id", vid);
        }
        const result = await trackVisit(vid);
        if (result) setSiteStats(result);
      } catch {
        fetchStats();
      }
    };

    track();
    const interval = setInterval(fetchStats, 10000); // 10s for "real-time" feel
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto-save analysis results to history
  useEffect(() => {
    if (engine.result && !engine.loading) {
      saveAnalysis({
        dilemma: engine.dilemma,
        age: engine.age,
        riskProfile: engine.riskProfile,
        timeHorizon: engine.timeHorizon,
        data: engine.result,
      });

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.result]);

  // Check for shared analysis in URL on mount
  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        const isPrintMode = params.get("print_mode") === "true";
        if (isPrintMode) setPrintMode(true);

        // 1. Check for new DB-backed share ID
        const shareId = params.get("id");
        if (shareId) {
          try {
            const sharedData = await getSharedAnalysis(shareId);
            if (sharedData && typeof sharedData === 'object') {
              if (sharedData.dilemma) engine.setDilemma(String(sharedData.dilemma));
              if (sharedData.data && typeof sharedData.data === 'object') {
                engine.setResult(sharedData.data);
              }
            }
            if (!isPrintMode) {
              window.history.replaceState({}, "", window.location.pathname);
            }
            return; // Success, exit
          } catch (e) {
            console.error("Failed to load shared analysis from DB:", e);
            if (!isPrintMode) {
              setToast("Failed to load shared analysis. Link may be invalid or expired.");
            }
          }
        }

        // 2. Fallback for legacy LZString links
        const sharedDataHash = params.get("data");
        if (sharedDataHash) {
          let decodedStr;
          try {
            decodedStr = LZString.decompressFromEncodedURIComponent(sharedDataHash);
            if (!decodedStr) throw new Error("LZString decompressed to null, falling back to base64");
          } catch {
            decodedStr = atob(sharedDataHash); // fallback for old links
          }

          const decoded = JSON.parse(decodedStr);
          if (decoded.dilemma) engine.setDilemma(decoded.dilemma);
          if (decoded.data) engine.setResult(decoded.data);

          window.history.replaceState({}, "", window.location.pathname);
        }
      } catch (err) {
        // ignore corrupted share links
        console.error("Error processing shared URL:", err);
      }
    };

    fetchSharedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHistorySelect = (entry) => {
    if (entry.data?.type === "comparison") {
      setCompareMode(true);
      setCompareRestoreData(entry.data.comparisonData);
    } else {
      engine.setDilemma(entry.dilemma);
      if (entry.age) engine.setAge(entry.age);
      if (entry.riskProfile) engine.setRiskProfile(entry.riskProfile);
      if (entry.timeHorizon) engine.setTimeHorizon(entry.timeHorizon);
      engine.setResult(entry.data);
      setCompareMode(false);
    }
    setShowHistory(false);
  };

  // ─── Robust clipboard copy that works across ALL browsers ───
  const copyToClipboard = useCallback(async (text) => {
    // Method 1: Modern Clipboard API (works in most modern browsers over HTTPS)
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Clipboard API failed, trying fallback:', err);
      }
    }

    // Method 2: execCommand fallback (works in older browsers and HTTP contexts)
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) return true;
    } catch (err) {
      console.warn('execCommand fallback failed:', err);
    }

    return false;
  }, []);

  const handleShare = useCallback(async () => {
    try {
      if (!engine.result) return;

      setToast("Generating share link...");
      const response = await createShareLink(engine.dilemma, engine.result);
      const url = `${window.location.origin}${window.location.pathname}?id=${response.id}`;

      // Only use navigator.share on mobile devices where it's reliable
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile && navigator.share) {
        try {
          await navigator.share({
            title: "Decision Engine Analysis",
            text: "Check out this strategic decision analysis.",
            url: url,
          });
          setToast("Successfully shared!");
          return;
        } catch (shareError) {
          if (shareError.name === 'AbortError') {
            setToast(null); // User cancelled, just dismiss
            return;
          }
          console.log("Share API failed, falling back to clipboard");
        }
      }

      // Desktop & fallback: copy to clipboard
      const copied = await copyToClipboard(url);
      if (copied) {
        setToast("✅ Share link copied to clipboard!");
      } else {
        // Last resort: show the URL for manual copy
        setToast(`Share link: ${url}`);
      }
    } catch (e) {
      console.error("Share failed:", e);
      setToast("Failed to generate share link. Please try again.");
    }
  }, [engine.dilemma, engine.result, copyToClipboard]);

  const handleExportPDF = useCallback(async () => {
    if (!engine.result) {
      setToast("No analysis to export.");
      return;
    }
    try {
      setToast("Generating your PDF...");
      // Dynamic import — only loads jsPDF when user clicks Export
      const { default: generatePDF } = await import("../lib/generatePDF");
      generatePDF(engine.result, engine.dilemma);
      setTimeout(() => setToast("✅ PDF downloaded successfully!"), 500);
    } catch (e) {
      console.error("PDF generation failed:", e);
      setToast("PDF generation failed. Please try again.");
    }
  }, [engine.result, engine.dilemma]);

  const handleExportMarkdown = useCallback(async () => {
    if (!engine.result) {
      setToast("No analysis to export.");
      return;
    }
    try {
      const { default: generateMarkdown } = await import("../lib/generateMarkdown");
      generateMarkdown(engine.result, engine.dilemma);
      setToast("✅ Markdown downloaded!");
    } catch (e) {
      console.error("Markdown export failed:", e);
      setToast("Export failed. Please try again.");
    }
  }, [engine.result, engine.dilemma]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter = Analyze
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        engine.handleAnalyze();
      }
      // Ctrl+Shift+S = Share
      if (e.ctrlKey && e.shiftKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        handleShare();
      }
      // Ctrl+Shift+P = Export PDF (English only)
      if (e.ctrlKey && e.shiftKey && (e.key === "P" || e.key === "p") && engine.language === "english") {
        e.preventDefault();
        handleExportPDF();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [engine.handleAnalyze, handleShare, handleExportPDF]);

  if (printMode) {
    return (
      <div className="pdf-export" style={{ background: '#0a0a08', minHeight: '100vh', padding: '40px' }}>
        <OutputPanel
          loading={engine.loading}
          result={engine.result}
          error={engine.error}
          dilemma={engine.dilemma}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <Header
          siteStats={siteStats}
          loading={engine.loading}
        />
        <SidebarActions
          compareMode={compareMode} setCompareMode={setCompareMode}
          showHistory={showHistory} setShowHistory={setShowHistory}
        />

        <div className="main" style={{ display: compareMode ? "block" : "none" }}>
          <ComparePanel
            saveAnalysis={saveAnalysis}
            restoreData={compareRestoreData}
            age={engine.age}
            riskProfile={engine.riskProfile}
            timeHorizon={engine.timeHorizon}
            language={engine.language}
          />
        </div>

        <div className="main" style={{ display: !compareMode ? "block" : "none" }}>
          <InputPanel
            dilemma={engine.dilemma} setDilemma={engine.setDilemma}
            age={engine.age} setAge={engine.setAge}
            riskProfile={engine.riskProfile} setRiskProfile={engine.setRiskProfile}
            timeHorizon={engine.timeHorizon} setTimeHorizon={engine.setTimeHorizon}
            language={engine.language} setLanguage={engine.setLanguage}
            context={engine.context} setContext={engine.setContext}
            uploading={engine.uploading} onFileUpload={engine.handleFileUpload}
            apiKey={engine.apiKey} setApiKey={engine.setApiKey}
            loading={engine.loading}
            hasResult={!!engine.result}
            onAnalyze={engine.handleAnalyze}
          />

          {/* Global Action Buttons */}
          {engine.result && !engine.loading && (
            <div className="result-actions global-actions">
              {engine.language === "english" && (
                <button className="result-action-btn" onClick={handleExportPDF} title="Export as PDF (Ctrl+Shift+P)">
                  📄 Export PDF
                </button>
              )}
              <button className="result-action-btn" onClick={handleExportMarkdown} title="Export as Markdown">
                📝 Markdown
              </button>
              <button className="result-action-btn" onClick={handleShare} title="Share Analysis (Ctrl+Shift+S)">
                🔗 Share
              </button>
              {engine.language === "english" && (
                <TextToSpeech data={engine.result} dilemma={engine.dilemma} language={engine.language} />
              )}
            </div>
          )}
          <div ref={resultsRef}>
            <OutputPanel
              loading={engine.loading}
              loadingStep={engine.loadingStep}
              result={engine.result}
              error={engine.error}
              dilemma={engine.dilemma}
              apiKey={engine.apiKey}
              onShare={handleShare}
              onExportPDF={handleExportPDF}
            />
          </div>
        </div>

        {
          showHistory && (
            <HistoryPanel
              history={history}
              onSelect={handleHistorySelect}
              onDelete={deleteAnalysis}
              onClear={clearHistory}
              onClose={() => setShowHistory(false)}
            />
          )
        }

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}

        <ApiKeyAlert
          isOpen={showAlert}
          onClose={() => setShowAlert(false)}
          errorType={alertType}
        />



        <button
          className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
          onClick={scrollToTop}
          title="Scroll to top"
        >
          ↑
        </button>

        <footer className="app-footer">
          <div className="footer-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.02em', fontWeight: 600 }}>
              © 2026 Decision Engine. All Rights Reserved.
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-dim)', letterSpacing: '0.01em', textAlign: 'center', maxWidth: '900px', padding: '0 10px' }}>
              Built for precision, clarity, and rigorous strategic reasoning. Designed to minimize cognitive bias and optimize outcomes.
            </span>
            <span className="footer-credits">
              <a href="https://www.linkedin.com/in/dharshansondi/" target="_blank" rel="noopener noreferrer" className="footer-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="linkedin-icon">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                Dharshan Sondi
              </a>
            </span>
          </div>
          {/* removed footer stats as per request to move below AI layer active */}
        </footer>
      </div >
    </ErrorBoundary>
  );
}

