/* Hallmark · theme: Cobalt · component: HistoryDrawer
 * typography: Space Grotesk (headers), Geist (ui), JetBrains Mono (data-stamps)
 */
import React from 'react';
import { X, Clock, CheckCircle2, AlertOctagon, AlertTriangle, Trash2, ArrowRight } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, history, onSelectHistory, onClearHistory }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <aside
        className="relative w-full max-w-md h-full bg-[var(--color-paper)] border-l border-[var(--color-rule)] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
        aria-label="Scan History Ledger"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-rule)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)] flex items-center space-x-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Clock className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Session Audit Log</span>
            </h2>
            <p className="text-[12px] font-mono text-[var(--color-neutral)] mt-0.5">{history.length} logged records</p>
          </div>
          <div className="flex items-center space-x-1.5">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="p-1.5 rounded-md text-[var(--color-neutral)] hover:text-[var(--color-danger)] hover:bg-[var(--color-paper-3)] transition-colors"
                title="Flush History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-[var(--color-neutral)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-[var(--color-neutral)]">
              <Clock className="w-8 h-8 mb-2.5 opacity-40" />
              <p className="text-xs font-mono font-medium">No recorded evaluations</p>
              <p className="text-[11px] mt-0.5 opacity-70">Analyzed vectors will appear here</p>
            </div>
          ) : (
            history.map((item, idx) => {
              const isSpam = item.is_spam;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectHistory(item);
                    onClose();
                  }}
                  className="p-3 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] hover:border-[var(--color-rule-active)] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`data-tag font-semibold px-1.5 py-0.5 rounded border text-[10px] ${
                      isSpam
                        ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-rule)]'
                        : 'bg-[var(--color-safe-bg)] text-[var(--color-safe)] border-[var(--color-safe-rule)]'
                    }`}>
                      {item.verdict || (isSpam ? 'SPAM' : 'HAM')} ({item.spam_probability}%)
                    </span>
                    <span className="text-[10px] font-mono text-[var(--color-neutral)]">
                      {new Date(item._timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[var(--color-ink)] truncate mb-1">
                    {item.subject || '(No Subject Line)'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-neutral)]">
                    <span className="truncate max-w-[240px]">
                      {(item.highlighted_keywords || []).slice(0, 2).join(', ') || 'No flags'}
                    </span>
                    <span className="text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                      Inspect <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
