import React from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export default function SamplePresets({ examples = [], onSelectPreset, currentSubject }) {
  if (!examples || examples.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Quick-Test Sample Emails
          </h4>
        </div>
        <span className="text-[11px] text-slate-400">Click any preset to load</span>
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
              className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden group ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  {item.title}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    isSpam
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {isSpam ? 'Spam' : 'Safe Ham'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                {item.subject}
              </p>

              <div className="flex items-center text-[10px] font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>Load into scanner</span>
                <ArrowRight className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
