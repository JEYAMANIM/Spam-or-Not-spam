import React, { useState } from 'react';
import { Eye, EyeOff, Tag, AlertOctagon, Link2, DollarSign, Clock } from 'lucide-react';

export default function ThreatHighlighter({ subject, text, keywords = [], metrics }) {
  const [highlightEnabled, setHighlightEnabled] = useState(true);

  if (!text && !subject) return null;

  const fullText = subject ? `Subject: ${subject}\n\n${text}` : text;

  // Build regex for keyword matching
  const renderHighlightedContent = () => {
    if (!highlightEnabled || (!keywords || keywords.length === 0)) {
      return <span className="whitespace-pre-wrap text-slate-300 font-mono text-xs sm:text-sm leading-relaxed">{fullText}</span>;
    }

    // Sort keywords by length descending to match longer multi-word phrases first
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    const escaped = sortedKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escaped})`, 'gi');

    const parts = fullText.split(regex);

    return (
      <span className="whitespace-pre-wrap text-slate-300 font-mono text-xs sm:text-sm leading-relaxed">
        {parts.map((part, index) => {
          const isMatch = keywords.some(k => k.toLowerCase() === part.toLowerCase());
          if (isMatch) {
            return (
              <mark
                key={index}
                className="bg-rose-500/25 text-rose-200 border-b-2 border-rose-500 font-bold px-1 py-0.5 rounded shadow-sm shadow-rose-950/50 hover:bg-rose-500/40 transition-colors cursor-help inline-flex items-center space-x-1"
                title={`Spam Trigger Keyword: "${part}"`}
              >
                <span>{part}</span>
              </mark>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-6 mt-6">
      
      {/* Header with Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <AlertOctagon className="w-5 h-5 text-rose-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Email Threat & Keyword Inspector
          </h4>
          {keywords && keywords.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {keywords.length} Triggers
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setHighlightEnabled(!highlightEnabled)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            highlightEnabled
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          {highlightEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{highlightEnabled ? 'Threat Highlights: ON' : 'Threat Highlights: OFF'}</span>
        </button>
      </div>

      {/* Trigger Pills */}
      {keywords && keywords.length > 0 && highlightEnabled && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center">
            <Tag className="w-3.5 h-3.5 mr-1 text-slate-500" /> Detected Flags:
          </span>
          {keywords.map((kw, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-rose-950/60 text-rose-300 border border-rose-700/50"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Highlighted Email Body View */}
      <div className="max-h-72 overflow-y-auto p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 shadow-inner">
        {renderHighlightedContent()}
      </div>

    </div>
  );
}
