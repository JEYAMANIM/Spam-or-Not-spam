/* Hallmark · theme: Cobalt · component: RiskGauge
 * typography: Space Grotesk (numbers), Geist (body), JetBrains Mono (diagnostics)
 */
import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, AlertOctagon, Activity } from 'lucide-react';

export default function RiskGauge({ result, isLoading }) {
  if (isLoading) {
    return (
      <div className="hallmark-panel p-6 flex flex-col items-center justify-center min-h-[360px] text-center">
        <div className="relative flex items-center justify-center mb-5">
          <div className="w-20 h-20 rounded-full border-2 border-[var(--color-rule)] border-t-[var(--color-accent)] animate-spin" />
          <Activity className="w-6 h-6 text-[var(--color-accent)] absolute" />
        </div>
        <p className="text-sm font-semibold text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
          Evaluating Feature Vectors...
        </p>
        <p className="text-xs font-mono text-[var(--color-neutral)] mt-1.5">
          Extracting n-grams & calculating Naive Bayes log-likelihood
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="hallmark-panel p-6 flex flex-col items-center justify-center min-h-[360px] text-center border-dashed">
        <div className="w-12 h-12 rounded-lg bg-[var(--color-paper-3)] border border-[var(--color-rule)] flex items-center justify-center text-[var(--color-neutral)] mb-4">
          <ShieldCheck className="w-6 h-6 opacity-70" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
          Awaiting Inspection Payload
        </h3>
        <p className="text-xs text-[var(--color-neutral)] max-w-xs mt-1.5 leading-relaxed">
          Provide raw email text or load a benchmark vector on the left to evaluate risk metrics and threat indicators.
        </p>
      </div>
    );
  }

  const spamProb = result.spam_probability ?? 0;
  const isSpam = result.is_spam;
  const verdict = result.verdict || (isSpam ? "SPAM" : "HAM");
  const confidence = result.confidence || Math.max(spamProb, 100 - spamProb);

  // SVG Gauge calculations (180-deg arc)
  const radius = 75;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (spamProb / 100) * circumference;

  // Semantic diagnostic tokens
  let theme = {
    badgeBg: 'bg-[var(--color-safe-bg)] border-[var(--color-safe-rule)] text-[var(--color-safe)]',
    strokeColor: 'var(--color-safe)',
    title: 'Safe / Legitimate',
    icon: CheckCircle2,
    desc: 'Low anomaly score with high legitimacy probability.'
  };

  if (spamProb >= 75) {
    theme = {
      badgeBg: 'bg-[var(--color-danger-bg)] border-[var(--color-danger-rule)] text-[var(--color-danger)]',
      strokeColor: 'var(--color-danger)',
      title: 'High Threat / Malicious',
      icon: AlertOctagon,
      desc: 'Significant anomaly density, deceptive patterns, or phishing indicators.'
    };
  } else if (spamProb >= 35) {
    theme = {
      badgeBg: 'bg-[var(--color-warn-bg)] border-[var(--color-warn-rule)] text-[var(--color-warn)]',
      strokeColor: 'var(--color-warn)',
      title: 'Suspicious Profile',
      icon: AlertTriangle,
      desc: 'Elevated urgency phrasing, anomalous capitalisation, or promotional flags.'
    };
  }

  const IconComponent = theme.icon;

  return (
    <div className="hallmark-panel p-6 flex flex-col justify-between min-h-[360px] relative">
      
      {/* Classification Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
        <div>
          <span className="text-[11px] font-mono text-[var(--color-neutral)] uppercase tracking-wider block">
            Classification Verdict
          </span>
          <span className="text-xs font-semibold text-[var(--color-ink)]">
            Risk & Likelihood Score
          </span>
        </div>
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border text-xs font-mono font-medium ${theme.badgeBg}`}>
          <IconComponent className="w-3.5 h-3.5" />
          <span>{verdict === 'HAM' ? 'HAM (CLEAN)' : verdict}</span>
        </div>
      </div>

      {/* Speedometer Gauge Visual */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative w-48 h-28 flex items-center justify-center">
          <svg className="w-48 h-48 -rotate-180 transform overflow-visible" viewBox="0 0 180 180" aria-label={`Spam probability: ${spamProb}%`}>
            {/* Background Arc */}
            <path
              d="M 15 90 A 75 75 0 0 1 165 90"
              fill="none"
              stroke="var(--color-rule)"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Active Data Arc */}
            <path
              d="M 15 90 A 75 75 0 0 1 165 90"
              fill="none"
              stroke={theme.strokeColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </svg>

          {/* Central Digital Value */}
          <div className="absolute bottom-0 flex flex-col items-center text-center">
            <span className="text-4xl font-semibold tracking-tighter text-[var(--color-ink)] font-mono">
              {spamProb}%
            </span>
            <span className="text-[10px] font-mono text-[var(--color-neutral)] uppercase tracking-wider mt-0.5">
              Posterior Probability
            </span>
          </div>
        </div>
      </div>

      {/* Diagnostic Context Note */}
      <p className="text-[12px] text-[var(--color-neutral)] text-center px-2 mb-2 leading-relaxed">
        {theme.desc}
      </p>

      {/* Structural Telemetry Ledger */}
      <div className="pt-3 border-t border-[var(--color-rule)] grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded bg-[var(--color-paper-3)]/60 border border-[var(--color-rule)]">
          <span className="text-[10px] font-mono text-[var(--color-neutral)] uppercase block">Confidence</span>
          <span className="text-xs font-mono font-semibold text-[var(--color-ink)]">{confidence}%</span>
        </div>
        <div className="p-2 rounded bg-[var(--color-paper-3)]/60 border border-[var(--color-rule)]">
          <span className="text-[10px] font-mono text-[var(--color-neutral)] uppercase block">Risk Level</span>
          <span className={`text-xs font-mono font-semibold uppercase ${
            result.risk_level === 'HIGH' ? 'text-[var(--color-danger)]' :
            result.risk_level === 'MEDIUM' ? 'text-[var(--color-warn)]' : 'text-[var(--color-safe)]'
          }`}>
            {result.risk_level || (isSpam ? 'HIGH' : 'LOW')}
          </span>
        </div>
        <div className="p-2 rounded bg-[var(--color-paper-3)]/60 border border-[var(--color-rule)]">
          <span className="text-[10px] font-mono text-[var(--color-neutral)] uppercase block">Pipeline</span>
          <span className="text-xs font-mono font-medium text-[var(--color-neutral)]">
            {result.is_client_fallback ? 'Offline' : 'FastAPI'}
          </span>
        </div>
      </div>

    </div>
  );
}
