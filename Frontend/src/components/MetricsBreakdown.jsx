/* Hallmark · theme: Cobalt · component: MetricsBreakdown
 * typography: Space Grotesk (headers), Geist (body), JetBrains Mono (data-metrics)
 */
import React from 'react';
import { BarChart3, Zap, DollarSign, Type, Link, MessageSquare, CheckCircle } from 'lucide-react';

export default function MetricsBreakdown({ result }) {
  if (!result || !result.metrics) return null;

  const { metrics, reasons = [] } = result;

  const getMetricStyle = (value, warnThresh = 30, dangerThresh = 60) => {
    if (value >= dangerThresh) return 'bg-[var(--color-danger)]';
    if (value >= warnThresh) return 'bg-[var(--color-warn)]';
    return 'bg-[var(--color-safe)]';
  };

  return (
    <div className="hallmark-panel p-6 mt-6">
      
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-[var(--color-rule)]">
        <BarChart3 className="w-4 h-4 text-[var(--color-accent)]" />
        <h3 className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
          Threat Vector Telemetry & Structural Signals
        </h3>
      </div>

      {/* Primary Risk Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Urgency Index */}
        <div className="p-3.5 rounded-lg bg-[var(--color-paper-3)] border border-[var(--color-rule)]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center text-[var(--color-neutral)] font-medium">
              <Zap className="w-3.5 h-3.5 mr-1.5 text-[var(--color-warn)]" /> Urgency Index
            </span>
            <span className="font-mono font-semibold text-[var(--color-ink)]">{metrics.urgency_score ?? 0}/100</span>
          </div>
          <div className="w-full bg-[var(--color-paper)] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getMetricStyle(metrics.urgency_score ?? 0, 30, 60)}`}
              style={{ width: `${Math.min(100, metrics.urgency_score ?? 0)}%` }}
            />
          </div>
        </div>

        {/* Financial Risk */}
        <div className="p-3.5 rounded-lg bg-[var(--color-paper-3)] border border-[var(--color-rule)]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center text-[var(--color-neutral)] font-medium">
              <DollarSign className="w-3.5 h-3.5 mr-1.5 text-[var(--color-safe)]" /> Financial Solicitations
            </span>
            <span className="font-mono font-semibold text-[var(--color-ink)]">{metrics.financial_score ?? 0}/100</span>
          </div>
          <div className="w-full bg-[var(--color-paper)] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getMetricStyle(metrics.financial_score ?? 0, 30, 60)}`}
              style={{ width: `${Math.min(100, metrics.financial_score ?? 0)}%` }}
            />
          </div>
        </div>

        {/* Caps Ratio */}
        <div className="p-3.5 rounded-lg bg-[var(--color-paper-3)] border border-[var(--color-rule)]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center text-[var(--color-neutral)] font-medium">
              <Type className="w-3.5 h-3.5 mr-1.5 text-[var(--color-accent)]" /> Capitalization Ratio
            </span>
            <span className="font-mono font-semibold text-[var(--color-ink)]">{metrics.caps_ratio_percent ?? 0}%</span>
          </div>
          <div className="w-full bg-[var(--color-paper)] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getMetricStyle(metrics.caps_ratio_percent ?? 0, 15, 30)}`}
              style={{ width: `${Math.min(100, (metrics.caps_ratio_percent ?? 0) * 2.5)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Discrete Signal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-[var(--color-paper-3)]/60 border border-[var(--color-rule)] text-center">
          <p className="text-[11px] font-mono text-[var(--color-neutral)] uppercase">Token Count</p>
          <p className="text-base font-mono font-semibold text-[var(--color-ink)] mt-0.5">{metrics.total_words ?? 0}</p>
        </div>
        <div className="p-3 rounded-lg bg-[var(--color-paper-3)]/60 border border-[var(--color-rule)] text-center">
          <p className="text-[11px] font-mono text-[var(--color-neutral)] uppercase">Exclamations</p>
          <p className={`text-base font-mono font-semibold mt-0.5 ${(metrics.exclamation_count ?? 0) > 2 ? 'text-[var(--color-warn)]' : 'text-[var(--color-ink)]'}`}>
            {metrics.exclamation_count ?? 0}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-[var(--color-paper-3)]/60 border border-[var(--color-rule)] text-center">
          <p className="text-[11px] font-mono text-[var(--color-neutral)] uppercase">URL Endpoints</p>
          <p className={`text-base font-mono font-semibold mt-0.5 ${(metrics.url_count ?? 0) > 1 ? 'text-[var(--color-danger)]' : 'text-[var(--color-ink)]'}`}>
            {metrics.url_count ?? 0}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-[var(--color-paper-3)]/60 border border-[var(--color-rule)] text-center">
          <p className="text-[11px] font-mono text-[var(--color-neutral)] uppercase">Currency Glyphs</p>
          <p className={`text-base font-mono font-semibold mt-0.5 ${(metrics.currency_count ?? 0) > 0 ? 'text-[var(--color-safe)]' : 'text-[var(--color-ink)]'}`}>
            {metrics.currency_count ?? 0}
          </p>
        </div>
      </div>

      {/* Explainability Diagnostics Log */}
      {reasons && reasons.length > 0 && (
        <div className="p-4 rounded-lg bg-[var(--color-paper-3)]/40 border border-[var(--color-rule)]">
          <h4 className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <span>Model Explainability Drivers</span>
          </h4>
          <ul className="space-y-1.5">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start text-xs text-[var(--color-neutral)]">
                <span className="text-[var(--color-accent)] mr-2 font-mono">›</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
