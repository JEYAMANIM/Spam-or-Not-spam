/* Hallmark · theme: Cobalt · component: SettingsModal
 * typography: Space Grotesk (headers), Geist (ui), JetBrains Mono (config URLs)
 */
import React, { useState } from 'react';
import { X, Settings, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, checkBackendHealth } from '../services/api';

export default function SettingsModal({ isOpen, onClose, backendOnline, onStatusUpdate }) {
  const [url, setUrl] = useState(getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md hallmark-panel p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-heading"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-rule)]">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-[var(--color-accent)]" />
            <div>
              <h2 id="settings-heading" className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                Telemetry & API Configuration
              </h2>
              <p className="text-[12px] text-[var(--color-neutral)]">Configure local FastAPI backend connection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[var(--color-neutral)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current State Diagnostic Banner */}
        <div className={`flex items-center space-x-2 p-3 rounded-lg border mb-5 font-mono text-xs ${
          backendOnline
            ? 'bg-[var(--color-safe-bg)] text-[var(--color-safe)] border-[var(--color-safe-rule)]'
            : 'bg-[var(--color-warn-bg)] text-[var(--color-warn)] border-[var(--color-warn-rule)]'
        }`}>
          {backendOnline ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{backendOnline ? 'CONNECTED TO PYTHON ML BACKEND' : 'OPERATING ON LOCAL CLIENT HEURISTICS'}</span>
        </div>

        {/* URL Input */}
        <div className="mb-4">
          <label className="block text-xs font-mono text-[var(--color-neutral)] uppercase tracking-wider mb-1.5">
            Backend Endpoint Base URL
          </label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="http://127.0.0.1:8000"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)] placeholder-[var(--color-neutral)] text-xs font-mono focus:border-[var(--color-accent)] transition-colors"
          />
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`p-2.5 rounded-md text-xs font-mono mb-4 border ${
            testResult.online
              ? 'bg-[var(--color-safe-bg)] text-[var(--color-safe)] border-[var(--color-safe-rule)]'
              : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-rule)]'
          }`}>
            {testResult.online ? '✓ Connection successful (Health: 200 OK)' : '✗ Connection failed. Ensure uvicorn is running on port 8000.'}
          </div>
        )}

        {/* Button Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-rule)]">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-xs font-mono text-[var(--color-neutral)] hover:text-[var(--color-ink)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-3 py-1.5 rounded-md text-xs font-mono text-[var(--color-ink)] bg-[var(--color-paper-3)] border border-[var(--color-rule)] hover:border-[var(--color-rule-active)] transition-colors"
            >
              {testing ? 'Testing...' : 'Test Ping'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-md text-xs font-semibold text-[var(--color-paper)] bg-[var(--color-ink)] hover:bg-white transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
