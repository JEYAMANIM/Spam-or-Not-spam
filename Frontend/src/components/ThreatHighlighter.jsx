/* Hallmark · theme: Cobalt · component: ThreatHighlighter
 * typography: Space Grotesk (headers), Geist (ui), JetBrains Mono (email payload)
 * Performance: Memoized regex token parsing and keyword tree caching
 */
import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Tag, AlertOctagon } from 'lucide-react';

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function ThreatHighlighter({ subject, text, keywords = [], metrics }) {
  const [highlightEnabled, setHighlightEnabled] = useState(true);

  if (!text && !subject) return null;

  const fullText = useMemo(() => {
    return subject ? `Subject: ${subject}\n\n${text}` : text;
  }, [subject, text]);

  // Fast set lookup for keyword presence
  const keywordSet = useMemo(() => {
    return new Set(keywords.map(k => k.toLowerCase()));
  }, [keywords]);

  // Memoized regex construction to avoid rebuilding on every rerender
  const regex = useMemo(() => {
    if (!keywords || keywords.length === 0) return null;
    const sorted = [...keywords].sort((a, b) => b.length - a.length);
    const escaped = sorted.map(escapeRegex).join('|');
    return new RegExp(`(${escaped})`, 'gi');
  }, [keywords]);

  // Memoized token partition rendering
  const renderedContent = useMemo(() => {
    if (!highlightEnabled || !regex || keywords.length === 0) {
      return (
        <span className="whitespace-pre-wrap text-[var(--color-ink)] font-mono text-xs leading-relaxed selection:bg-[var(--color-accent)] selection:text-white">
          {fullText}
        </span>
      );
    }

    const parts = fullText.split(regex);

    return (
      <span className="whitespace-pre-wrap text-[var(--color-ink)] font-mono text-xs leading-relaxed">
        {parts.map((part, index) => {
          if (keywordSet.has(part.toLowerCase())) {
            return (
              <mark
                key={index}
                className="bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-b-2 border-[var(--color-danger)] font-semibold px-1 py-0.5 rounded-sm transition-colors cursor-help inline-block"
                title={`Spam Indicator Trigger: "${part}"`}
              >
                {part}
              </mark>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  }, [fullText, highlightEnabled, regex, keywordSet, keywords.length]);

  return (
    <section className="hallmark-panel p-6 mt-6" aria-labelledby="threat-inspector-title">
      
      {/* Header with Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--color-rule)]">
        <div className="flex items-center space-x-2">
          <AlertOctagon className="w-4 h-4 text-[var(--color-danger)]" aria-hidden="true" />
          <h3 id="threat-inspector-title" className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
            Threat &amp; Keyword Token Inspector
          </h3>
          {keywords && keywords.length > 0 && (
            <span className="data-tag px-2 py-0.5 rounded border bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-rule)]">
              {keywords.length} Triggers
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setHighlightEnabled(prev => !prev)}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors border cursor-pointer ${
            highlightEnabled
              ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-rule)]'
              : 'bg-[var(--color-paper-3)] text-[var(--color-neutral)] border-[var(--color-rule)] hover:text-[var(--color-ink)]'
          }`}
          aria-pressed={highlightEnabled}
          aria-label="Toggle keyword threat highlights"
        >
          {highlightEnabled ? <Eye className="w-3.5 h-3.5" aria-hidden="true" /> : <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />}
          <span>{highlightEnabled ? 'HIGHLIGHTS: ACTIVE' : 'HIGHLIGHTS: MUTED'}</span>
        </button>
      </div>

      {/* Trigger Pills */}
      {keywords && keywords.length > 0 && highlightEnabled && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4" aria-label="Detected trigger words">
          <span className="text-[11px] font-mono text-[var(--color-neutral)] mr-1 flex items-center">
            <Tag className="w-3 h-3 mr-1 opacity-70" aria-hidden="true" /> Flagged Tokens:
          </span>
          {keywords.map((kw, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--color-paper-3)] text-[var(--color-danger)] border border-[var(--color-danger-rule)]"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Raw Payload Monospace Terminal View */}
      <div 
        tabIndex={0}
        role="region"
        aria-label="Highlighted email payload text"
        className="max-h-80 overflow-y-auto p-4 rounded-lg bg-[var(--color-paper)] border border-[var(--color-rule)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
      >
        {renderedContent}
      </div>

    </section>
  );
}
