/* Hallmark · theme: Cobalt · component: BatchScanner
 * typography: Space Grotesk (headers), Geist (ui), JetBrains Mono (tables & code)
 */
import React, { useState } from 'react';
import { FileStack, Upload, Download, CheckCircle2, AlertTriangle, AlertOctagon, RotateCw, Filter, ArrowUpRight } from 'lucide-react';
import { analyzeBatchEmails } from '../services/api';

export default function BatchScanner({ onSelectEmailForInspection }) {
  const [inputText, setInputText] = useState(`Subject: URGENT Account Alert: Verify your payment info now
Dear customer, your card is blocked. Click here to verify http://fakebank-verify.net immediately.

---
Subject: Weekly Sprint Retro Notes
Hi everyone, here are the action items from our retrospective: Alex will finalize the PRs, and Sarah will update Jira. Thanks!

---
Subject: YOU WON $500,000 CASH PRIZE
Congratulations! You have been selected as our lottery grand prize winner. Send your bank account info to claim!

---
Subject: Cloudflare Team Meeting Invitation
Hi team, please join our architecture sync meeting on Thursday at 2 PM PST.`);

  const [isLoading, setIsLoading] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [filter, setFilter] = useState('all');

  const handleScanBatch = async () => {
    if (!inputText.trim()) return;

    const chunks = inputText.split(/\n\s*---\s*\n|\n\s*={3,}\s*\n/g);
    const parsedList = chunks
      .map(chunk => chunk.trim())
      .filter(chunk => chunk.length > 0)
      .map(chunk => {
        const subjectMatch = chunk.match(/^Subject:\s*(.*)$/im);
        let subject = '';
        let body = chunk;
        if (subjectMatch) {
          subject = subjectMatch[1].trim();
          body = chunk.replace(/^Subject:\s*.*$/im, '').trim();
        }
        return { subject, text: body || subject };
      });

    if (parsedList.length === 0) return;

    setIsLoading(true);
    try {
      const data = await analyzeBatchEmails(parsedList);
      setBatchResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setInputText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleExportCsv = () => {
    if (!batchResult || !batchResult.results) return;

    const headers = ["Index", "Verdict", "Spam_Probability_%", "Risk_Level", "Subject", "Keywords_Detected", "Text_Preview"];
    const rows = batchResult.results.map((r, i) => [
      i + 1,
      r.verdict,
      r.spam_probability,
      r.risk_level,
      `"${(r.subject || '').replace(/"/g, '""')}"`,
      `"${(r.highlighted_keywords || []).join(', ')}"`,
      `"${(r.text_preview || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `spamguard_batch_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = batchResult?.results?.filter(r => {
    if (filter === 'spam') return r.is_spam;
    if (filter === 'ham') return !r.is_spam;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="hallmark-panel p-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-[var(--color-rule)]">
          <div className="flex items-center space-x-2">
            <FileStack className="w-4 h-4 text-[var(--color-accent)]" />
            <div>
              <h2 className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                Batch Vector Pipeline
              </h2>
              <p className="text-[12px] text-[var(--color-neutral)]">
                Parse and evaluate multiple email payloads concurrently (separate by <code className="text-xs">---</code>)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono text-[var(--color-neutral)] hover:text-[var(--color-ink)] bg-[var(--color-paper-3)] border border-[var(--color-rule)] hover:border-[var(--color-rule-active)] transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import File</span>
              <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" />
            </label>
            {batchResult && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono text-[var(--color-neutral)] hover:text-[var(--color-ink)] bg-[var(--color-paper-3)] border border-[var(--color-rule)] hover:border-[var(--color-rule-active)] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="mb-4">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={8}
            placeholder="Paste multiple emails separated by '---'..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)] placeholder-[var(--color-neutral)] text-xs font-mono focus:border-[var(--color-accent)] transition-colors resize-y leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleScanBatch}
          disabled={isLoading || !inputText.trim()}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-[var(--color-ink)] hover:bg-white text-[var(--color-paper)] font-semibold text-xs tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {isLoading ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Batch Payloads...</span>
            </>
          ) : (
            <>
              <span>Execute Batch Pipeline Scan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>

      </div>

      {/* Batch Results Ledger */}
      {batchResult && (
        <div className="hallmark-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--color-rule)]">
            <div>
              <h3 className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                Batch Analysis Ledger ({batchResult.total_emails} records)
              </h3>
              <p className="text-[12px] font-mono text-[var(--color-neutral)] mt-0.5">
                Malicious: {batchResult.spam_count} · Clean: {batchResult.ham_count} · Overall Threat Rate: {batchResult.spam_rate_percent}%
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center space-x-1 p-1 rounded-md bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-xs font-mono">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors ${filter === 'all' ? 'bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)]' : 'text-[var(--color-neutral)]'}`}
              >
                ALL ({batchResult.total_emails})
              </button>
              <button
                type="button"
                onClick={() => setFilter('spam')}
                className={`px-2.5 py-1 rounded transition-colors ${filter === 'spam' ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger-rule)]' : 'text-[var(--color-neutral)]'}`}
              >
                SPAM ({batchResult.spam_count})
              </button>
              <button
                type="button"
                onClick={() => setFilter('ham')}
                className={`px-2.5 py-1 rounded transition-colors ${filter === 'ham' ? 'bg-[var(--color-safe-bg)] text-[var(--color-safe)] border border-[var(--color-safe-rule)]' : 'text-[var(--color-neutral)]'}`}
              >
                HAM ({batchResult.ham_count})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--color-rule)] text-[var(--color-neutral)] uppercase text-[11px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Verdict</th>
                  <th className="py-2.5 px-3">Prob.</th>
                  <th className="py-2.5 px-3">Subject / Preview</th>
                  <th className="py-2.5 px-3">Flagged Indicators</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-rule)]">
                {filteredResults.map((r, i) => {
                  const isSpam = r.is_spam;
                  return (
                    <tr key={i} className="hover:bg-[var(--color-paper-3)]/40 transition-colors">
                      <td className="py-3 px-3 text-[var(--color-neutral)]">{i + 1}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          isSpam
                            ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-rule)]'
                            : 'bg-[var(--color-safe-bg)] text-[var(--color-safe)] border-[var(--color-safe-rule)]'
                        }`}>
                          {r.verdict}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[var(--color-ink)]">
                        {r.spam_probability}%
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate text-[var(--color-ink)]">
                        <span className="font-semibold">{r.subject || '(No Subject)'}</span>
                        <p className="text-[11px] text-[var(--color-neutral)] truncate">{r.text_preview}</p>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(r.highlighted_keywords || []).slice(0, 3).map((kw, ki) => (
                            <span key={ki} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-neutral)]">
                              {kw}
                            </span>
                          ))}
                          {(r.highlighted_keywords || []).length > 3 && (
                            <span className="text-[10px] text-[var(--color-neutral)]">
                              +{(r.highlighted_keywords || []).length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectEmailForInspection(r)}
                          className="px-2 py-1 rounded text-[11px] text-[var(--color-accent)] hover:underline font-medium"
                        >
                          Inspect ›
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
