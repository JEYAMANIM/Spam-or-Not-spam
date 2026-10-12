/* Hallmark · theme: Cobalt (modern-minimal/cyber-technical) · macrostructure: Workbench
 * typography: Space Grotesk (display), Geist (body), JetBrains Mono (metrics & code)
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 */
import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  Settings, 
  History, 
  FileStack, 
  Info, 
  Activity, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  backendOnline, 
  onOpenSettings, 
  onOpenHistory, 
  onOpenModelInfo,
  historyCount = 0
}) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--color-paper)]/90 backdrop-blur-md border-b border-[var(--color-rule)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Wordmark & Diagnostic Ledger */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('single')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveTab('single')}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--color-accent-subtle)] border border-[var(--color-accent)] text-[var(--color-accent)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-semibold tracking-tight text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
                  SpamGuard AI
                </span>
                <span className="data-tag font-medium px-1.5 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-neutral)] text-[11px]">
                  v2.0-prod
                </span>
              </div>
              <p className="text-[12px] text-[var(--color-neutral)] hidden sm:block">
                Multinomial NB · Threat Vector & Anomaly Engine
              </p>
            </div>
          </div>

          {/* Nav Archetype: Clean Segmented Workbench Switcher */}
          <nav className="hidden md:flex items-center p-1 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule)]" aria-label="Workbench Views">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'single'
                  ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)] border border-[var(--color-rule-active)] shadow-sm'
                  : 'text-[var(--color-neutral)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Email Inspector</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'batch'
                  ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)] border border-[var(--color-rule-active)] shadow-sm'
                  : 'text-[var(--color-neutral)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]/50'
              }`}
            >
              <FileStack className="w-3.5 h-3.5" />
              <span>Batch Analyzer</span>
            </button>
          </nav>

          {/* Control Utility Toolbar */}
          <div className="flex items-center space-x-2">
            
            {/* Status Telemetry Pill */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                backendOnline
                  ? 'bg-[var(--color-safe-bg)] text-[var(--color-safe)] border-[var(--color-safe-rule)] hover:brightness-110'
                  : 'bg-[var(--color-warn-bg)] text-[var(--color-warn)] border-[var(--color-warn-rule)] hover:brightness-110'
              }`}
              title={backendOnline ? "Connected to Python ML Backend" : "Operating on Local ML Fallback Heuristics"}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-[var(--color-safe)]' : 'bg-[var(--color-warn)]'}`} />
              <span className="hidden sm:inline">{backendOnline ? 'API: ONLINE' : 'MODE: LOCAL_ML'}</span>
            </button>

            {/* Audit History Drawer Button */}
            <button
              onClick={onOpenHistory}
              className="relative p-2 rounded-md text-[var(--color-neutral)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] border border-transparent hover:border-[var(--color-rule)] transition-colors"
              title="Audit Log & Scan History"
              aria-label="Scan History"
            >
              <History className="w-4 h-4" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-mono font-semibold text-white bg-[var(--color-accent)] rounded-full">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Model Architecture Specs */}
            <button
              onClick={onOpenModelInfo}
              className="p-2 rounded-md text-[var(--color-neutral)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] border border-transparent hover:border-[var(--color-rule)] transition-colors"
              title="Inspect Model Architecture & Metrics"
              aria-label="Model Architecture Specs"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Configuration Dialog */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-md text-[var(--color-neutral)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] border border-transparent hover:border-[var(--color-rule)] transition-colors"
              title="Endpoint Settings"
              aria-label="API Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Source Repository Link */}
            <a
              href="https://github.com/JEYAMANIM"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-md text-[var(--color-neutral)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] border border-transparent hover:border-[var(--color-rule)] transition-colors"
              title="Source Repository on GitHub"
              aria-label="GitHub Repository"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[var(--color-rule)]">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'single'
                ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)] border border-[var(--color-rule-active)]'
                : 'text-[var(--color-neutral)]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Inspector</span>
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'batch'
                ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)] border border-[var(--color-rule-active)]'
                : 'text-[var(--color-neutral)]'
            }`}
          >
            <FileStack className="w-3.5 h-3.5" />
            <span>Batch Scanner</span>
          </button>
        </div>

      </div>
    </header>
  );
}
