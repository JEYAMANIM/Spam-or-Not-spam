import React, { useState } from 'react';
import { Layers, Upload, Download, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Filter, FileText } from 'lucide-react';
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
  const [filter, setFilter] = useState('all'); // all, spam, ham

  const handleScanBatch = async () => {
    if (!inputText.trim()) return;

    // Split emails by `---` or double newline with `Subject:`
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
      
      {/* Top Input & Instructions Card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Batch Email Security Scanner</h3>
              <p className="text-xs text-slate-400">Scan multiple emails simultaneously separated by <code className="text-indigo-300">---</code> delimiter or upload text file</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer border border-slate-700 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .txt / .csv</span>
              <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Input Textarea */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={7}
            placeholder="Subject: First email subject...&#10;Email body content...&#10;&#10;---&#10;Subject: Second email subject...&#10;Second email body..."
            className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-y"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={handleScanBatch}
            disabled={isLoading || !inputText.trim()}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            <span>{isLoading ? 'Scanning Batch...' : 'Scan All Emails'}</span>
          </button>
        </div>
      </div>

      {/* Batch Results Section */}
      {batchResult && (
        <div className="glass-card rounded-2xl p-6">
          
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Batch Scan Summary</h4>
              <p className="text-xs text-slate-400">Total Analyzed: <span className="font-bold text-white">{batchResult.total_analyzed}</span> emails</p>
            </div>

            {/* Metrics Pills */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
                <XCircle className="w-4 h-4" />
                <span>{batchResult.spam_count} Spam ({batchResult.spam_rate_percent}%)</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{batchResult.ham_count} Safe Ham</span>
              </div>
              <button
                onClick={handleExportCsv}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                title="Download CSV report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Filter view:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All ({batchResult.total_analyzed})
            </button>
            <button
              onClick={() => setFilter('spam')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                filter === 'spam' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Spam Only ({batchResult.spam_count})
            </button>
            <button
              onClick={() => setFilter('ham')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                filter === 'ham' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Safe Ham ({batchResult.ham_count})
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4">Risk %</th>
                  <th className="py-3 px-4">Subject & Preview</th>
                  <th className="py-3 px-4">Threat Flags</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredResults.map((item, idx) => {
                  const isSpam = item.is_spam;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            isSpam
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {item.verdict}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {item.spam_probability}%
                      </td>
                      <td className="py-3 px-4 max-w-xs font-sans">
                        <p className="font-semibold text-slate-200 truncate">{item.subject || 'No Subject'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{item.text_preview}</p>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        {item.highlighted_keywords && item.highlighted_keywords.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.highlighted_keywords.slice(0, 2).map((k, ki) => (
                              <span key={ki} className="px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-300 text-[10px] border border-rose-800/40">
                                {k}
                              </span>
                            ))}
                            {item.highlighted_keywords.length > 2 && (
                              <span className="text-[10px] text-slate-400">+{item.highlighted_keywords.length - 2} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">None detected</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectEmailForInspection(item)}
                          className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30 transition-all font-sans"
                        >
                          Inspect
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
