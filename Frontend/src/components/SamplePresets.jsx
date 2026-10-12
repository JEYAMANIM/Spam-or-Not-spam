/* Hallmark · theme: Cobalt · component: SamplePresets
 * typography: Space Grotesk (display), Geist (body), JetBrains Mono (data-tag)
 */
import React from 'react';
import { Terminal, ArrowRight } from 'lucide-react';

export default function SamplePresets({ examples = [], onSelectPreset, currentSubject }) {
  if (!examples || examples.length === 0) return null;

  return (
    <section className="hallmark-panel p-5 mb-6" aria-labelledby="presets-heading">
      
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--color-rule)]">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[var(--color-accent)]" aria-hidden="true" />
          <h2 id="presets-heading" className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
            Curated Benchmark Payloads
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[var(--color-neutral)]">
          Select sample to populate telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {examples.map((item) => {
          const isSpam = item.type === 'spam';
          const isSelected = currentSubject === item.subject;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPreset(item)}
              className={`text-left p-3.5 rounded-lg border transition-colors relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? 'bg-[var(--color-paper-3)] border-[var(--color-accent)] shadow-sm'
                  : 'bg-[var(--color-paper-2)] border-[var(--color-rule)] hover:border-[var(--color-rule-active)] hover:bg-[var(--color-paper-3)]/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[var(--color-ink)] group-hover:text-white transition-colors">
                  {item.title}
                </span>
                <span
                  className={`data-tag font-medium px-2 py-0.5 rounded border text-[10px] ${
                    isSpam
                      ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-rule)]'
                      : 'bg-[var(--color-safe-bg)] text-[var(--color-safe)] border-[var(--color-safe-rule)]'
                  }`}
                >
                  {isSpam ? 'MALICIOUS SPAM' : 'VERIFIED HAM'}
                </span>
              </div>

              <p className="text-[12px] text-[var(--color-neutral)] line-clamp-2 leading-relaxed mb-2 font-mono">
                {item.subject}
              </p>

              <div className="flex items-center text-[11px] font-medium text-[var(--color-accent)] group-hover:underline">
                <span>Load Vector</span>
                <ArrowRight className="w-3 h-3 ml-1 transform group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
            </button>
          );
        })}
      </div>

    </section>
  );
}
