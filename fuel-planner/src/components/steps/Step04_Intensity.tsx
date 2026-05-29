import { motion } from 'framer-motion';
import type { WizardState, IntensityLevel } from '../../types';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const OPTIONS: Array<{
  id: IntensityLevel;
  icon: string;
  label: string;
  desc: string;
  carbHint: string;
}> = [
  {
    id: 'finish',
    icon: '🏁',
    label: 'Just Finish',
    desc: 'Conservative pacing, gut comfort is priority. Aim to cross the line feeling good.',
    carbHint: '50–60g carb/h',
  },
  {
    id: 'moderate',
    icon: '💪',
    label: 'Work Hard',
    desc: 'Balanced performance approach. Push your limits while managing nutrition carefully.',
    carbHint: '60–75g carb/h',
  },
  {
    id: 'limit',
    icon: '🔥',
    label: 'Absolute Limit',
    desc: 'Maximum effort race. Higher carb tolerance assumed. Train this strategy first.',
    carbHint: '75–90g carb/h',
  },
];

export default function Step04_Intensity({ state, onChange, onNext, onBack }: Props) {
  const select = (id: IntensityLevel) => {
    onChange({ intensity: id });
    setTimeout(onNext, 180);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] px-4 max-w-md mx-auto w-full">
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
            Race approach
          </h1>
          <p className="text-slate-400 text-sm">This affects your carbohydrate targets and fuelling strategy.</p>
        </div>

        <div className="grid gap-3">
          {OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => select(opt.id)}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${
                state.intensity === opt.id
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.08)]'
                  : 'bg-white/5 border-white/10 hover:border-cyan-400/40'
              }`}
            >
              <span className="text-3xl mt-0.5">{opt.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-lg" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                    {opt.label}
                  </span>
                  <span className="text-xs font-mono bg-white/10 text-slate-300 px-2 py-0.5 rounded">
                    {opt.carbHint}
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{opt.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
