import { motion } from 'framer-motion';
import type { WizardState, GutTolerance } from '../../types';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const OPTIONS: Array<{
  id: GutTolerance;
  icon: string;
  label: string;
  desc: string;
  strategy: string;
}> = [
  {
    id: 'iron',
    icon: '⚙️',
    label: 'Iron Stomach',
    desc: 'Can handle anything at high volume. No GI issues in training or races.',
    strategy: 'Max carb rate. Gels, bars, chews — all options available.',
  },
  {
    id: 'normal',
    icon: '✅',
    label: 'Normal Tolerance',
    desc: 'Standard tolerance. Occasional issues only at very high intake or in heat.',
    strategy: 'Standard plan. Space gels 20–25 min apart.',
  },
  {
    id: 'sensitive',
    icon: '⚠️',
    label: 'Sensitive Gut',
    desc: 'History of GI problems in races. Need to be conservative with intake rate.',
    strategy: 'Reduced carb rate. Prefer chews/bars. 30+ min gel spacing.',
  },
];

export default function Step08_GutTolerance({ state, onChange, onNext, onBack }: Props) {
  const select = (id: GutTolerance) => {
    onChange({ gutTolerance: id });
    setTimeout(onNext, 180);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] px-4 max-w-md md:max-w-2xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6 md:space-y-8"
      >
        <div className="space-y-2">
          <button onClick={onBack} className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">
            ← Back
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Gut tolerance
          </h1>
          <p className="text-slate-400 text-sm">This adjusts gel frequency, format recommendations, and carb rate.</p>
        </div>

        <div className="grid gap-3 md:gap-4">
          {OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => select(opt.id)}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${
                state.gutTolerance === opt.id
                  ? 'bg-cyan-500/15 border-cyan-400'
                  : 'bg-white/5 border-white/10 hover:border-cyan-400/40'
              }`}
            >
              <span className="text-3xl mt-0.5">{opt.icon}</span>
              <div>
                <p className="text-white font-bold mb-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {opt.label}
                </p>
                <p className="text-slate-400 text-sm mb-2">{opt.desc}</p>
                <p className="text-cyan-400/80 text-xs">{opt.strategy}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
