import React from 'react';
import { BarChart3, AlertCircle, Zap, DollarSign, Type, Link, MessageSquare, CheckCircle } from 'lucide-react';

export default function MetricsBreakdown({ result }) {
  if (!result || !result.metrics) return null;

  const { metrics, reasons = [] } = result;

  const getBarColor = (value, warnThresh = 30, dangerThresh = 60) => {
    if (value >= dangerThresh) return 'bg-rose-500';
    if (value >= warnThresh) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="glass-card rounded-2xl p-6 mt-6">
      
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-800">
        <BarChart3 className="w-5 h-5 text-indigo-400" />
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Threat Analytics & Structural Breakdown
        </h4>
      </div>

      {/* Progress Bars for Risk Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Urgency Index */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="flex items-center text-slate-300">
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" /> Urgency Index
            </span>
            <span className="text-white font-bold">{metrics.urgency_score ?? 0}/100</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getBarColor(metrics.urgency_score ?? 0, 30, 60)}`}
              style={{ width: `${Math.min(100, metrics.urgency_score ?? 0)}%` }}
            ></div>
          </div>
        </div>

        {/* Financial Risk */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="flex items-center text-slate-300">
              <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Financial Solicitations
            </span>
            <span className="text-white font-bold">{metrics.financial_score ?? 0}/100</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getBarColor(metrics.financial_score ?? 0, 30, 60)}`}
              style={{ width: `${Math.min(100, metrics.financial_score ?? 0)}%` }}
            ></div>
          </div>
        </div>

        {/* Caps Ratio */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="flex items-center text-slate-300">
              <Type className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Capitalization Ratio
            </span>
            <span className="text-white font-bold">{metrics.caps_ratio_percent ?? 0}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getBarColor(metrics.caps_ratio_percent ?? 0, 15, 30)}`}
              style={{ width: `${Math.min(100, (metrics.caps_ratio_percent ?? 0) * 2.5)}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Discrete Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">Total Words</p>
          <p className="text-base font-bold text-slate-100">{metrics.total_words ?? 0}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">Exclamations (!)</p>
          <p className={`text-base font-bold ${(metrics.exclamation_count ?? 0) > 2 ? 'text-amber-400' : 'text-slate-100'}`}>
            {metrics.exclamation_count ?? 0}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">External Links</p>
          <p className={`text-base font-bold ${(metrics.url_count ?? 0) > 1 ? 'text-rose-400' : 'text-slate-100'}`}>
            {metrics.url_count ?? 0}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">Currency Symbols</p>
          <p className={`text-base font-bold ${(metrics.currency_count ?? 0) > 0 ? 'text-emerald-400' : 'text-slate-100'}`}>
            {metrics.currency_count ?? 0}
          </p>
        </div>
      </div>

      {/* Explainability / Reasons Breakdown */}
      <div>
        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center">
          <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
          Explainability & Key Risk Factors
        </h5>
        <ul className="space-y-1.5">
          {reasons.map((r, i) => (
            <li key={i} className="flex items-start text-xs text-slate-300 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 mr-2 shrink-0"></span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
