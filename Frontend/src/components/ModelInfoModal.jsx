/* Hallmark · theme: Cobalt · component: ModelInfoModal
 * typography: Space Grotesk (headers & metrics), Geist (ui), JetBrains Mono (pipeline steps)
 */
import React from 'react';
import { X, Cpu, Database, Layers, BarChart2, CheckCircle2 } from 'lucide-react';

export default function ModelInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl hallmark-panel p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-spec-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-rule)]">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[var(--color-accent)]" />
            <div>
              <h2 id="model-spec-title" className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                Model Specification & Pipeline Metrics
              </h2>
              <p className="text-[12px] text-[var(--color-neutral)]">
                Multinomial Naive Bayes · Supervised Text Classification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[var(--color-neutral)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Precision Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Evaluation Accuracy', value: '99.55%', icon: BarChart2, color: 'text-[var(--color-safe)]' },
            { label: 'Corpus Payloads', value: '5,728', icon: Database, color: 'text-[var(--color-accent)]' },
            { label: 'Vocabulary Matrix', value: '25,000', icon: Layers, color: 'text-[var(--color-ink)]' },
            { label: 'Spam Recall', value: '100%', icon: CheckCircle2, color: 'text-[var(--color-safe)]' },
          ].map((stat, i) => (
            <div key={i} className="p-3.5 rounded-lg bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
              <p className="text-base font-mono font-semibold text-[var(--color-ink)]">{stat.value}</p>
              <p className="text-[10px] font-mono text-[var(--color-neutral)] uppercase mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pipeline Specification */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider border-b border-[var(--color-rule)] pb-2">
            Classification Pipeline Architecture
          </h3>

          {[
            {
              step: '01',
              title: 'Vector Normalization',
              desc: 'Raw email payload (subject + body) undergoes case-folding and stop-word filtering to eliminate grammatical noise while retaining salient threat indicators.',
            },
            {
              step: '02',
              title: 'Bag-of-Words Feature Extraction (CountVectorizer)',
              desc: 'Converts unstructured text into a sparse token frequency matrix across the 25,000 most predictive n-grams.',
            },
            {
              step: '03',
              title: 'Multinomial Naive Bayes Posterior Evaluation',
              desc: 'Calculates class likelihood P(Spam | Tokens) utilizing Laplace smoothing (alpha=1.0) for zero-frequency robustness.',
            },
            {
              step: '04',
              title: 'Threat Vector Heuristic Enrichment',
              desc: 'Extracts secondary threat markers: urgency index, financial solicitation scores, and URL endpoint densities.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[var(--color-paper-3)]/40 border border-[var(--color-rule)] flex items-start space-x-3">
              <span className="font-mono text-xs font-semibold text-[var(--color-accent)]">{item.step}</span>
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-ink)]">{item.title}</h4>
                <p className="text-[12px] text-[var(--color-neutral)] leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
