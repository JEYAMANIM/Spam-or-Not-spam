import React, { useState } from 'react';
import { X, Settings, Wifi, WifiOff, Save, RotateCcw, Info } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, checkBackendHealth } from '../services/api';

export default function SettingsModal({ isOpen, onClose, backendOnline, onStatusUpdate }) {
  const [url, setUrl] = useState(getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    // Temporarily apply the url to test
    const prev = getApiBaseUrl();
    setApiBaseUrl(url);
    const result = await checkBackendHealth();
    if (!result.online) setApiBaseUrl(prev);
    setTestResult(result);
    setTesting(false);
    onStatusUpdate(result.online);
  };

  const handleSave = () => {
    setApiBaseUrl(url);
    onClose();
  };

  const handleReset = () => {
    const defaultUrl = 'http://127.0.0.1:8000';
    setUrl(defaultUrl);
    setApiBaseUrl(defaultUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-lg glass-card rounded-2xl p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">API Configuration</h2>
              <p className="text-xs text-slate-400">Configure the SpamGuard ML backend endpoint</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className={`flex items-center space-x-3 p-3 rounded-xl border mb-6 ${
          backendOnline
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          {backendOnline
            ? <Wifi className="w-4 h-4 shrink-0" />
            : <WifiOff className="w-4 h-4 shrink-0" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold">
              {backendOnline ? 'Python ML Backend Connected' : 'Using Local Heuristic ML Engine'}
            </p>
            <p className="text-[11px] opacity-70">
              {backendOnline
                ? 'Full Naive Bayes model powered by FastAPI. 99.55% accuracy on email dataset.'
                : 'Offline fallback mode. Results computed client-side via rule-based heuristics.'
              }
            </p>
          </div>
        </div>

        {/* URL Input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Backend API Base URL
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-mono"
            />
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              title="Reset to default localhost"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Default: <code className="text-slate-400">http://127.0.0.1:8000</code>. Leave as-is when running the Python backend locally.
          </p>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`p-3 rounded-xl border mb-4 text-xs ${
            testResult.online
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {testResult.online
              ? `✓ Connection successful! Model loaded: ${testResult.model_loaded ? 'Yes' : 'No'}, API v${testResult.version || '?'}`
              : `✗ Connection failed: ${testResult.error || 'Unable to reach backend'}`
            }
          </div>
        )}

        {/* Info Box */}
        <div className="flex items-start space-x-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 mb-6">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Start the local backend with: <code className="text-indigo-300 font-mono">Backend\venv\Scripts\python.exe -m uvicorn main:app --reload</code> from the project root. The site also works fully in offline mode with client-side ML.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTest}
            disabled={testing || !url.trim()}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-all disabled:opacity-50"
          >
            {testing ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>Testing...</span>
              </span>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                <span>Test Connection</span>
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
