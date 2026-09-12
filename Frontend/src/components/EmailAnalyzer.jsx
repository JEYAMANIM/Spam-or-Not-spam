import React, { useState, useCallback, useEffect } from 'react';
import { Mail, Send, RotateCcw, ChevronDown, ChevronUp, Clipboard, Zap } from 'lucide-react';
import { analyzeEmail } from '../services/api';
import RiskGauge from './RiskGauge';
import ThreatHighlighter from './ThreatHighlighter';
import MetricsBreakdown from './MetricsBreakdown';
import SamplePresets from './SamplePresets';

const MAX_HISTORY = 20;

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

  const handleClear = () => {
    setSubject('');
    setEmailBody('');
    setResult(null);
    setShowAdvanced(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Try to auto-split subject and body
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
  };

  const handleSelectPreset = (preset) => {
    setSubject(preset.subject || '');
    setEmailBody(preset.text || '');
    setResult(null);
    setShowAdvanced(false);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleAnalyze();
    }
  };

  const canAnalyze = (subject.trim() || emailBody.trim()) && !isLoading;

  return (
    <div className="space-y-6">
      {/* Sample Presets */}
      <SamplePresets
        examples={examples}
        onSelectPreset={handleSelectPreset}
        currentSubject={subject}
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left — Input Form */}
        <div className="xl:col-span-3 space-y-4">
          <div className="glass-card rounded-2xl p-6">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25">
                  <Mail className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Email Input Scanner</h3>
                  <p className="text-xs text-slate-400">Paste any email to run live threat detection</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePasteFromClipboard}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
                {(subject || emailBody) && (
                  <button
                    onClick={handleClear}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-500/10 border border-slate-700 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Subject Field */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. URGENT: Your account has been suspended"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Body Field */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Body Content
              </label>
              <textarea
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={8}
                placeholder="Paste the complete email body text here for comprehensive threat analysis...

Tip: Use Ctrl+Enter to quickly analyze."
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-y leading-relaxed"
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[11px] text-slate-500">
                  {emailBody.trim().split(/\s+/).filter(Boolean).length} words · {emailBody.length} chars · <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">Ctrl+Enter</kbd> to analyze
                </p>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Email Threat Vectors...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Analyze Email for Spam & Threats</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right — Risk Gauge */}
        <div className="xl:col-span-2">
          <RiskGauge result={result} isLoading={isLoading} />
        </div>
      </div>

      {/* Results: Threat Highlighter + Metrics */}
      {(isLoading || result) && (
        <div className="animate-slide-up">
          {result && (
            <ThreatHighlighter
              subject={result.subject}
              text={emailBody}
              keywords={result.highlighted_keywords}
              metrics={result.metrics}
            />
          )}

          {result && (
            <div>
              {/* Collapsible Advanced Details */}
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="flex items-center space-x-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 mt-6 mb-2 transition-colors"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>{showAdvanced ? 'Hide' : 'Show'} Full Analytics & Explainability Report</span>
              </button>

              {showAdvanced && (
                <div className="animate-slide-up">
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
