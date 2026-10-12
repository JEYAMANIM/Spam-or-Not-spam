/* Hallmark · theme: Cobalt (modern-minimal/cyber-technical) · macrostructure: Workbench
 * typography: Space Grotesk (display), Geist (body), JetBrains Mono (metrics & code)
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 * Performance: Synchronous initial state, code-split drawers, zero waterfall
 */
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import EmailAnalyzer from './components/EmailAnalyzer';
import BatchScanner from './components/BatchScanner';
import { checkBackendHealth, STATIC_EXAMPLES } from './services/api';

// Code-split modals and drawers for faster initial page load & higher Core Web Vitals
const HistoryDrawer = lazy(() => import('./components/HistoryDrawer'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const ModelInfoModal = lazy(() => import('./components/ModelInfoModal'));

const HISTORY_KEY = 'spamguard_scan_history';
const MAX_HISTORY = 20;

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {}
}

export default function App() {
  const [activeTab, setActiveTab] = useState('single');
  const [backendOnline, setBackendOnline] = useState(false);
  const [history, setHistory] = useState(loadHistory);
  
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showModelInfo, setShowModelInfo] = useState(false);

  // Inspect email from batch result
  const [batchInspect, setBatchInspect] = useState(null);

  // Check backend asynchronously without blocking initial layout
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then(r => {
      if (isMounted) setBackendOnline(r.online);
    });
    return () => { isMounted = false; };
  }, []);

  const handleSaveHistory = useCallback((result) => {
    setHistory(prev => {
      const updated = [result, ...prev].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const handleSelectHistory = useCallback((item) => {
    setActiveTab('single');
    setBatchInspect(item);
  }, []);

  const handleSelectBatchForInspection = useCallback((item) => {
    setActiveTab('single');
    setBatchInspect(item);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)]">
      {/* Semantic Accessible Screen-Reader Skip Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-accent)] focus:text-white focus:rounded focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Semantic Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHistory={() => setShowHistory(true)}
        onOpenModelInfo={() => setShowModelInfo(true)}
        historyCount={history.length}
      />

      {/* Primary Semantic Main Body with Single H1 for 100% SEO Hierarchy */}
      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-ink)] flex items-center space-x-2.5" style={{ fontFamily: 'var(--font-display)' }}>
            <span>Email Spam &amp; Phishing Detection Engine</span>
            <span className="data-tag font-semibold px-2 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-accent)] text-xs">
              ML 99.55% ACC
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-neutral)] mt-1 max-w-3xl leading-relaxed">
            Real-time supervised Multinomial Naive Bayes classifier trained on 5,728 enterprise email payloads with urgency profiling, currency solicitation checks, and token telemetry.
          </p>
        </div>

        {activeTab === 'single' ? (
          <EmailAnalyzer
            key={batchInspect?._timestamp}
            examples={STATIC_EXAMPLES}
            onSaveHistory={handleSaveHistory}
            initialSubject={batchInspect?.subject || ''}
            initialBody={batchInspect?.text_preview || ''}
          />
        ) : (
          <BatchScanner onSelectEmailForInspection={handleSelectBatchForInspection} />
        )}
      </main>

      {/* Hallmark Archetype: Ft2 Clean Single-line Colophon Footer */}
      <footer className="border-t border-[var(--color-rule)] py-5 px-4 text-xs font-mono text-[var(--color-neutral)]" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            SpamGuard Engine · Multinomial Naive Bayes · 99.55% benchmark accuracy (5,728 corpus)
          </p>
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/JEYAMANIM" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[var(--color-ink)] transition-colors underline decoration-[var(--color-rule)]"
            >
              GitHub
            </a>
            <span>·</span>
            <span className={backendOnline ? 'text-[var(--color-safe)] font-semibold' : 'text-[var(--color-warn)] font-semibold'}>
              {backendOnline ? 'TELEMETRY: LIVE_API' : 'TELEMETRY: LOCAL_ML'}
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers - Lazy loaded on user demand */}
      <Suspense fallback={null}>
        {showHistory && (
          <HistoryDrawer
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            history={history}
            onSelectHistory={handleSelectHistory}
            onClearHistory={handleClearHistory}
          />
        )}

        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            backendOnline={backendOnline}
            onStatusUpdate={setBackendOnline}
          />
        )}

        {showModelInfo && (
          <ModelInfoModal
            isOpen={showModelInfo}
            onClose={() => setShowModelInfo(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
