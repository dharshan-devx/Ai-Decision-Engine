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

export default function App() {
  const engine = useDecisionEngine();
  const { history, saveAnalysis, deleteAnalysis, clearHistory } = useHistory();
  const [showHistory, setShowHistory] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareRestoreData, setCompareRestoreData] = useState(null);
  const [toast, setToast] = useState(null);
  const resultsRef = useRef(null);

  // Fix scroll position on reload
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

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
    try {
      const params = new URLSearchParams(window.location.search);
      const shared = params.get("data");
      if (shared) {
        const decoded = JSON.parse(atob(shared));
        if (decoded.dilemma) engine.setDilemma(decoded.dilemma);
        if (decoded.data) engine.setResult(decoded.data);
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch {
      // ignore corrupted share links
    }
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

  const handleShare = useCallback(() => {
    try {
      const payload = {
        dilemma: engine.dilemma,
        data: engine.result,
      };
      const encoded = btoa(JSON.stringify(payload));
      const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      navigator.clipboard.writeText(url);
      setToast("Share link copied to clipboard!");
    } catch {
      setToast("Failed to generate share link");
    }
  }, [engine.dilemma, engine.result]);

  const handleExportPDF = useCallback(() => {
    setToast("Opening print dialog. Please select 'Save as PDF'.");
    setTimeout(() => window.print(), 100);
  }, []);

  return (
    <div className="app">
      <Header
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        compareMode={compareMode}
        setCompareMode={setCompareMode}
      />

      <div className="main" style={{ display: compareMode ? "block" : "none" }}>
        <ComparePanel saveAnalysis={saveAnalysis} restoreData={compareRestoreData} />
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
          onAnalyze={engine.handleAnalyze}
        />
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
        <div className="print-only">
          <PrintTemplate data={engine.result} dilemma={engine.dilemma} />
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

      <footer className="app-footer">
        <div className="footer-content">
          {/* <span>&copy; {new Date().getFullYear()} Decision Engine. All rights reserved.</span> */}
          {/* <span className="footer-separator">•</span> */}
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

