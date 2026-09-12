import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import EmailAnalyzer from './components/EmailAnalyzer';
import BatchScanner from './components/BatchScanner';
import HistoryDrawer from './components/HistoryDrawer';
import SettingsModal from './components/SettingsModal';
import ModelInfoModal from './components/ModelInfoModal';
import { checkBackendHealth, fetchExamples } from './services/api';

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
  const [examples, setExamples] = useState([]);
  const [history, setHistory] = useState(loadHistory);
  
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showModelInfo, setShowModelInfo] = useState(false);

  // Inspect email from batch result
  const [batchInspect, setBatchInspect] = useState(null);

  // Check backend on mount
  useEffect(() => {
    checkBackendHealth().then(r => setBackendOnline(r.online));
    fetchExamples().then(setExamples);
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
    // Switch to single tab and load the item's data
    setActiveTab('single');
    setBatchInspect(item);
  }, []);

  const handleSelectBatchForInspection = useCallback((item) => {
    setActiveTab('single');
    setBatchInspect(item);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHistory={() => setShowHistory(true)}
        onOpenModelInfo={() => setShowModelInfo(true)}
        historyCount={history.length}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'single' ? (
          <EmailAnalyzer
            key={batchInspect?._timestamp}
            examples={examples}
            onSaveHistory={handleSaveHistory}
            initialSubject={batchInspect?.subject || ''}
            initialBody={batchInspect?.text_preview || ''}
          />
        ) : (
          <BatchScanner onSelectEmailForInspection={handleSelectBatchForInspection} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Built with <span className="text-indigo-400 font-semibold">React + Vite + FastAPI + Scikit-Learn</span> · Multinomial Naive Bayes · 99.55% Accuracy
          </p>
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <a href="https://github.com/JEYAMANIM" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">GitHub</a>
            <span>·</span>
            <span className={`font-semibold ${backendOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              {backendOnline ? 'ML API Online' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        backendOnline={backendOnline}
        onStatusUpdate={setBackendOnline}
      />

      <ModelInfoModal
        isOpen={showModelInfo}
        onClose={() => setShowModelInfo(false)}
      />
    </div>
  );
}
