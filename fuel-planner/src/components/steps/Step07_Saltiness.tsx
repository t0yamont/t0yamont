import { motion } from 'framer-motion';
import type { WizardState, Saltiness, CrampFrequency } from '../../types';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SALT_OPTIONS: Array<{ id: Saltiness; label: string; hint: string; desc: string }> = [
  { id: 'low', label: 'Low', hint: '~300 mg/L', desc: 'Kit barely marks, no salty taste on skin' },
  { id: 'moderate', label: 'Moderate', hint: '~700 mg/L', desc: 'Light salt marks, slight salty taste' },
  { id: 'high', label: 'High', hint: '~1000 mg/L', desc: 'Clear white marks on dark kit, very salty skin' },
  { id: 'very_high', label: 'Very High', hint: '~1500 mg/L', desc: 'Heavy white crust on kit, extremely salty — classic salty sweater' },
];

const CRAMP_OPTIONS: Array<{ id: CrampFrequency; label: string; desc: string }> = [
  { id: 'never', label: 'Never', desc: 'Never cramped in a race or hard training' },
  { id: 'rarely', label: 'Rarely', desc: 'Occasional cramps, usually when depleted' },
  { id: 'sometimes', label: 'Sometimes', desc: 'Cramps in most long/hard events' },
  { id: 'often', label: 'Often', desc: 'Regular cramping, major issue to manage' },
];

export default function Step07_Saltiness({ state, onChange, onNext, onBack }: Props) {
  const canProceed = state.saltiness && state.crampFrequency;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-3rem)] px-4 max-w-md md:max-w-2xl mx-auto w-full py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6"
      >
        <div className="space-y-2">
          <button onClick={onBack} className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Sodium & Cramps
          </h1>
          <p className="text-slate-400 text-sm">Two questions to set your sodium target.</p>
        </div>

        {/* Saltiness */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-sm uppercase tracking-widest">
            How salty is your sweat?
          </h3>
          <div className="grid gap-2 md:grid-cols-2">
            {SALT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => onChange({ saltiness: opt.id })}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${
                  state.saltiness === opt.id
                    ? 'bg-cyan-500/15 border-cyan-400'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{opt.label}</span>
                    <span className="text-xs font-mono text-slate-500 bg-white/10 px-2 py-0.5 rounded">
                      {opt.hint}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-slate-500 text-xs">
            💡 White kit is the best indicator — look for white crust marks after training.
          </p>
        </div>

        {/* Cramp frequency */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-sm uppercase tracking-widest">
            How often do you cramp?
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {CRAMP_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => onChange({ crampFrequency: opt.id })}
                className={`p-4 rounded-xl border transition-all text-left ${
                  state.crampFrequency === opt.id
                    ? 'bg-amber-500/15 border-amber-400'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-white font-semibold text-sm">{opt.label}</div>
                <div className="text-slate-400 text-xs mt-0.5 leading-relaxed">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-white font-bold py-4 rounded-xl transition-colors text-lg"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
        >
          Continue →
        </button>
      </motion.div>
    </div>
  );
}
