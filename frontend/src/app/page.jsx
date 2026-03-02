"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/Header";
import InputPanel from "../components/InputPanel";
import OutputPanel from "../components/OutputPanel";
import HistoryPanel from "../components/HistoryPanel";
import ComparePanel from "../components/ComparePanel";
import Toast from "../components/Toast";
import PrintTemplate from "../components/PrintTemplate";
import { useDecisionEngine } from "../hooks/useDecisionEngine";
import { useHistory } from "../hooks/useHistory";
import LZString from "lz-string";
import generatePDF from "../lib/generatePDF";
import { createShareLink, getSharedAnalysis } from "../lib/api";

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
            if (sharedData.dilemma) engine.setDilemma(sharedData.dilemma);
            if (sharedData.data) engine.setResult(sharedData.data);
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

  const handleShare = useCallback(async () => {
    try {
      if (!engine.result) return;

      setToast("Generating secure share link...");
      const response = await createShareLink(engine.dilemma, engine.result);
      const url = `${window.location.origin}${window.location.pathname}?id=${response.id}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Decision Engine Analysis",
            text: "Check out this strategic decision analysis.",
            url: url,
          });
          setToast("Successfully shared!");
          return;
        } catch (shareError) {
          // If user cancels the share sheet, it throws an error. Just fall back to clipboard just in case.
          console.log("Share API closed or failed, falling back to clipboard");
        }
      }

      await navigator.clipboard.writeText(url);
      setToast("Share link copied to clipboard!");
    } catch (e) {
      console.error("Share failed:", e);
      setToast("Failed to generate share link. It might be blocked by your browser.");
    }
  }, [engine.dilemma, engine.result]);

  const handleExportPDF = useCallback(() => {
    if (!engine.result) {
      setToast("No analysis to export.");
      return;
    }
    setToast("Preparing native PDF export...");
    setTimeout(() => {
      window.print();
    }, 800);
  }, [engine.result]);



  return (
    <div className="app">
      <Header
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        compareMode={compareMode}
        setCompareMode={setCompareMode}
      />

      <div className="main" style={{ display: compareMode ? "block" : "none" }}>
        <ComparePanel
          saveAnalysis={saveAnalysis}
          restoreData={compareRestoreData}
          age={engine.age}
          riskProfile={engine.riskProfile}
          timeHorizon={engine.timeHorizon}
        />
      </div>

      <div className="main" style={{ display: !compareMode ? "block" : "none" }}>
        <InputPanel
          dilemma={engine.dilemma} setDilemma={engine.setDilemma}
          age={engine.age} setAge={engine.setAge}
          riskProfile={engine.riskProfile} setRiskProfile={engine.setRiskProfile}
          timeHorizon={engine.timeHorizon} setTimeHorizon={engine.setTimeHorizon}
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
            <button className="result-action-btn" onClick={handleExportPDF} title="Export as PDF">
              📄 Export PDF
            </button>
            <button className="result-action-btn" onClick={handleShare} title="Share Analysis">
              🔗 Share
            </button>
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
      </footer>
    </div >
  );
}

