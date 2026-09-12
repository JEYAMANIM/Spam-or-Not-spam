import React from 'react';
import { X, Clock, CheckCircle2, XCircle, AlertTriangle, Trash2, RotateCcw } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, history, onSelectHistory, onClearHistory }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
      />
      <div
        className="relative w-full max-w-md h-full glass-card border-l border-slate-800 flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1) both' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Scan History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{history.length} recent scans</p>
          </div>
          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Clear all history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
              <Clock className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No recent scans</p>
              <p className="text-xs mt-1 opacity-60">Analyzed emails will appear here</p>
            </div>
          ) : (
            history.map((item, idx) => {
              const Icon = item.is_spam
                ? XCircle
                : item.verdict === 'SUSPICIOUS'
                  ? AlertTriangle
                  : CheckCircle2;

              const iconColor = item.is_spam
                ? 'text-rose-400'
                : item.verdict === 'SUSPICIOUS'
                  ? 'text-amber-400'
                  : 'text-emerald-400';

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { onSelectHistory(item); onClose(); }}
                  className="w-full text-left p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
                      <span className={`text-xs font-extrabold uppercase ${iconColor}`}>{item.verdict}</span>
                      <span className="text-xs text-slate-500 font-bold">{item.spam_probability}%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(item._timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {item.subject || 'No Subject'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.text_preview}
                  </p>
                  <div className="flex items-center text-[10px] text-indigo-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reload in analyzer
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
