import React from 'react';
import { X, Brain, Database, Cpu, BarChart2, ShieldCheck, Layers } from 'lucide-react';

export default function ModelInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-2xl glass-card rounded-2xl p-6 animate-slide-up overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/25">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Model Architecture</h2>
              <p className="text-xs text-slate-400">Multinomial Naive Bayes · Email Threat Classification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Training Accuracy', value: '99.55%', icon: BarChart2, color: 'text-emerald-400' },
            { label: 'Dataset Emails', value: '5,728', icon: Database, color: 'text-indigo-400' },
            { label: 'Feature Vocabulary', value: '25,000', icon: Layers, color: 'text-purple-400' },
            { label: 'Spam Recall', value: '100%', icon: ShieldCheck, color: 'text-rose-400' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
              <p className="text-lg font-black text-white">{stat.value}</p>
              <p className="text-[11px] text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pipeline Explanation */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Classification Pipeline
          </h3>

          {[
            {
              step: '01',
              title: 'Text Preprocessing',
              desc: 'Raw email text (subject + body) is normalized to lowercase. Stop words (e.g., "the", "a", "is") are removed to reduce noise and focus on meaningful token signals.',
              icon: Cpu,
            },
            {
              step: '02',
              title: 'CountVectorizer Feature Extraction',
              desc: 'The preprocessed text is transformed into a sparse term-frequency matrix using CountVectorizer with a 25,000-word vocabulary built from 5,728 training emails (4,360 ham / 1,368 spam).',
              icon: Layers,
            },
            {
              step: '03',
              title: 'Multinomial Naive Bayes Classification',
              desc: 'The sparse feature vector is fed into a MultinomialNB classifier trained with Laplace smoothing (α=1.0). It applies Bayes theorem to compute posterior probability of spam vs. ham given the term frequencies.',
              icon: Brain,
            },
            {
              step: '04',
              title: 'Probability Calibration & Risk Scoring',
              desc: 'predict_proba() returns calibrated class probabilities [P(ham|x), P(spam|x)]. Results are categorized into: SPAM (≥75%), SUSPICIOUS (40-75%), HAM (<40%). Supplementary heuristics (urgency score, caps ratio, financial keywords) add explainability layers.',
              icon: BarChart2,
            },
          ].map(item => (
            <div key={item.step} className="flex items-start space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/70">
              <div className="shrink-0 flex flex-col items-center">
                <span className="text-[10px] font-extrabold text-indigo-400 mb-1">STEP {item.step}</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100 mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dataset Info */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/70">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Dataset Origin</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Training data sourced from the <strong className="text-slate-200">Kaggle Email Spam Classification Dataset</strong> (emails.csv), containing 5,728 labeled emails — 4,360 ham (76.1%) and 1,368 spam (23.9%). The class imbalance is handled naturally by MultinomialNB's prior probability estimation.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-bold transition-all hover:from-indigo-500 hover:to-indigo-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}
