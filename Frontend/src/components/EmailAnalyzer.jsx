/* Hallmark · theme: Cobalt · component: EmailAnalyzer
 * typography: Space Grotesk (headers), Geist (inputs), JetBrains Mono (code/diagnostics)
 * Performance: Memoized character counts and token diagnostics
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Terminal, RotateCcw, ChevronDown, ChevronUp, Clipboard, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { analyzeEmail } from '../services/api';
import RiskGauge from './RiskGauge';
import ThreatHighlighter from './ThreatHighlighter';
import MetricsBreakdown from './MetricsBreakdown';
import SamplePresets from './SamplePresets';

export default function EmailAnalyzer({ examples, onSaveHistory, initialSubject = '', initialBody = '' }) {
  const [subject, setSubject] = useState(initialSubject);
  const [emailBody, setEmailBody] = useState(initialBody);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (initialSubject) setSubject(initialSubject);
    if (initialBody) setEmailBody(initialBody);
  }, [initialSubject, initialBody]);

  const handleAnalyze = useCallback(async () => {
    if (!subject.trim() && !emailBody.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await analyzeEmail(subject.trim(), emailBody.trim());
      const withTs = { ...data, subject: subject.trim(), _timestamp: Date.now() };
      setResult(withTs);
      onSaveHistory(withTs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [subject, emailBody, onSaveHistory]);

  const handleClear = useCallback(() => {
    setSubject('');
    setEmailBody('');
    setResult(null);
    setShowAdvanced(false);
  }, []);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const subjectMatch = text.match(/^Subject:\s*(.*)$/im);
      if (subjectMatch) {
        setSubject(subjectMatch[1].trim());
        const body = text.replace(/^Subject:\s*.*\n?/im, '').trim();
        setEmailBody(body);
      } else {
        setEmailBody(text);
      }
    } catch {
      console.warn('Clipboard access denied');
    }
  }, []);

  const handleSelectPreset = useCallback((preset) => {
    setSubject(preset.subject || '');
    setEmailBody(preset.text || '');
    setResult(null);
    setShowAdvanced(false);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleAnalyze();
    }
  }, [handleAnalyze]);

  const tokenStats = useMemo(() => {
    const tokens = emailBody.trim().split(/\s+/).filter(Boolean).length;
    return { tokens, bytes: emailBody.length };
  }, [emailBody]);

  const canAnalyze = (subject.trim() || emailBody.trim()) && !isLoading;

  return (
    <div className="space-y-6">
      {/* Sample Presets Strip */}
      <SamplePresets
        examples={examples}
        onSelectPreset={handleSelectPreset}
        currentSubject={subject}
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left Workbench Form */}
        <div className="xl:col-span-3 space-y-4">
          <section className="hallmark-panel p-6" aria-labelledby="analyzer-form-title">
            
            {/* Workbench Section Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-rule)]">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[var(--color-accent)]" aria-hidden="true" />
                <div>
                  <h2 id="analyzer-form-title" className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                    Email Inspection Console
                  </h2>
                  <p className="text-[12px] text-[var(--color-neutral)]">
                    Paste email payload to run vector classification
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono text-[var(--color-neutral)] hover:text-[var(--color-ink)] bg-[var(--color-paper-3)] border border-[var(--color-rule)] hover:border-[var(--color-rule-active)] transition-colors cursor-pointer"
                  title="Paste from clipboard"
                  aria-label="Paste from clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Paste</span>
                </button>
                {(subject || emailBody) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono text-[var(--color-neutral)] hover:text-[var(--color-danger)] bg-[var(--color-paper-3)] border border-[var(--color-rule)] hover:border-[var(--color-danger-rule)] transition-colors cursor-pointer"
                    aria-label="Clear form fields"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Subject Input */}
            <div className="mb-4">
              <label htmlFor="email-subject-input" className="block text-xs font-mono text-[var(--color-neutral)] uppercase tracking-wider mb-1.5">
                Subject Line
              </label>
              <input
                id="email-subject-input"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. URGENT: Action required on your security credentials"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)] placeholder-[var(--color-neutral)] text-xs font-mono focus:border-[var(--color-accent)] transition-colors"
              />
            </div>

            {/* Body Input */}
            <div className="mb-5">
              <label htmlFor="email-body-input" className="block text-xs font-mono text-[var(--color-neutral)] uppercase tracking-wider mb-1.5">
                Raw Email Body
              </label>
              <textarea
                id="email-body-input"
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={9}
                placeholder="Paste raw email body here for vector extraction and token highlighting...

Shortcut: Ctrl+Enter to evaluate."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)] placeholder-[var(--color-neutral)] text-xs font-mono focus:border-[var(--color-accent)] transition-colors resize-y leading-relaxed"
              />
              <div className="flex items-center justify-between mt-1.5 text-[11px] font-mono text-[var(--color-neutral)]">
                <span>
                  {tokenStats.tokens} tokens · {tokenStats.bytes} bytes
                </span>
                <span>
                  Press <kbd className="px-1 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-ink)]">Ctrl+Enter</kbd> to inspect
                </span>
              </div>
            </div>

            {/* Execution Action Button */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-lg bg-[var(--color-ink)] hover:bg-white text-[var(--color-paper)] font-semibold text-xs tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              style={{ fontFamily: 'var(--font-display)' }}
              aria-label="Evaluate Email Threat Vector"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[var(--color-paper)]/30 border-t-[var(--color-paper)] rounded-full animate-spin" />
                  <span>Evaluating Vectors...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                  <span>Evaluate Email Threat Vector</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </>
              )}
            </button>

          </section>
        </div>

        {/* Right Instrumentation Column */}
        <div className="xl:col-span-2">
          <RiskGauge result={result} isLoading={isLoading} />
        </div>
      </div>

      {/* Diagnostics Drawer (Inspection Report & Explainability) */}
      {(isLoading || result) && (
        <div>
          {result && (
            <ThreatHighlighter
              subject={result.subject}
              text={emailBody}
              keywords={result.highlighted_keywords}
              metrics={result.metrics}
            />
          )}

          {result && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="flex items-center space-x-1.5 text-xs font-mono font-medium text-[var(--color-accent)] hover:underline py-2 cursor-pointer"
                aria-expanded={showAdvanced}
                aria-controls="advanced-analytics-section"
              >
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
                <span>{showAdvanced ? 'COLLAPSE' : 'EXPAND'} DETAILED FEATURE METRICS &amp; LOGS</span>
              </button>

              {showAdvanced && (
                <div id="advanced-analytics-section">
                  <MetricsBreakdown result={result} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
