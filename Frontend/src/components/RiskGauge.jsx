import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Flame } from 'lucide-react';

export default function RiskGauge({ result, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-sm font-semibold text-slate-200">Analyzing Email Vector Patterns...</p>
        <p className="text-xs text-slate-400 mt-1">Extracting features & evaluating against Naive Bayes model</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[340px] text-center border-dashed border-slate-700/80">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4">
          <ShieldCheck className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="text-base font-bold text-slate-200">Awaiting Email Input</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Paste an email or select a sample preset on the left, then click <strong className="text-indigo-400 font-semibold">"Analyze Email"</strong> to view real-time threat metrics.
        </p>
      </div>
    );
  }

  const spamProb = result.spam_probability ?? 0;
  const isSpam = result.is_spam;
  const verdict = result.verdict || (isSpam ? "SPAM" : "HAM");
  const confidence = result.confidence || Math.max(spamProb, 100 - spamProb);

  // SVG Gauge calculations
  // Angle range: -90 to +90 deg (180 deg arc)
  const angle = -90 + (spamProb / 100) * 180;
  const radius = 75;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (spamProb / 100) * circumference;

  // Determine color scheme
  let theme = {
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    glow: 'rgba(16, 185, 129, 0.4)',
    strokeColor: '#10b981',
    gradientId: 'safeGradient',
    title: 'Safe / Legitimate',
    icon: CheckCircle2,
    desc: 'Low threat profile with high legitimacy confidence.'
  };

  if (spamProb >= 75) {
    theme = {
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      glow: 'rgba(244, 63, 94, 0.4)',
      strokeColor: '#f43f5e',
      gradientId: 'dangerGradient',
      title: 'Spam / Phishing Danger',
      icon: XCircle,
      desc: 'High probability of malicious intent, phishing, or unsolicited marketing.'
    };
  } else if (spamProb >= 35) {
    theme = {
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      glow: 'rgba(245, 158, 11, 0.4)',
      strokeColor: '#f59e0b',
      gradientId: 'warnGradient',
      title: 'Suspicious / Caution',
      icon: AlertTriangle,
      desc: 'Contains elevated risk indicators or aggressive marketing keywords.'
    };
  }

  const IconComponent = theme.icon;

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[340px]">
      
      {/* Top Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk Assessment</span>
        </div>
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${theme.badgeBg}`}>
          <IconComponent className="w-4 h-4" />
          <span>{verdict === 'HAM' ? 'VERIFIED HAM (SAFE)' : verdict}</span>
        </div>
      </div>

      {/* Speedometer Gauge Visual */}
      <div className="flex flex-col items-center justify-center my-2">
        <div className="relative w-48 h-28 flex items-center justify-center">
          <svg className="w-48 h-48 -rotate-180 transform overflow-visible" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="gaugeBg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="safeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id="warnGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>

            {/* Background Arc */}
            <path
              d="M 15 90 A 75 75 0 0 1 165 90"
              fill="none"
              stroke="rgba(51, 65, 85, 0.4)"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Animated Active Arc */}
            <path
              d="M 15 90 A 75 75 0 0 1 165 90"
              fill="none"
              stroke={`url(#${theme.gradientId})`}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: `drop-shadow(0 0 8px ${theme.glow})`
              }}
            />
          </svg>

          {/* Center Digital Readout */}
          <div className="absolute bottom-0 flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {spamProb}%
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Spam Probability
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-2 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-400">Confidence: </span>
          <span className="font-bold text-white">{confidence}%</span>
        </div>
        <div>
          <span className="text-slate-400">Threat Level: </span>
          <span className={`font-bold uppercase ${
            result.risk_level === 'HIGH' ? 'text-rose-400' :
            result.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {result.risk_level || (isSpam ? 'HIGH' : 'LOW')}
          </span>
        </div>
        <div>
          <span className="text-slate-400">Status: </span>
          <span className="font-semibold text-slate-300">
            {result.is_client_fallback ? 'Offline ML' : 'Live ML API'}
          </span>
        </div>
      </div>

    </div>
  );
}
