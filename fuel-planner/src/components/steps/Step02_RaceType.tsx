import { motion } from 'framer-motion';
import type { WizardState, RaceDistance } from '../../types';
import { SPORTS } from '../../data/sports';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step02_RaceType({ state, onChange, onNext, onBack }: Props) {
  const sport = state.sport ?? 'triathlon';
  const sportConfig = SPORTS[sport];

  const select = (dist: RaceDistance) => {
    const preset = sportConfig.distances.find(d => d.id === dist);
    onChange({
      raceDistance: dist,
      splitTimes: preset?.defaultSplits ?? { swimMins: 0, bikeMins: 0, runMins: 0 },
    });
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
            Which distance?
          </h1>
          <p className="text-slate-400 text-sm capitalize">{sport}</p>
        </div>

        <div className="grid gap-3">
          {sportConfig.distances.map((dist, i) => (
            <motion.button
              key={dist.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => select(dist.id)}
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all text-left ${
                state.raceDistance === dist.id
                  ? 'bg-cyan-500/15 border-cyan-400'
                  : 'bg-white/5 border-white/10 hover:border-cyan-400/40'
              }`}
            >
              <div>
                <div className="text-white font-bold text-lg" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {dist.label}
                </div>
                <div className="text-slate-400 text-sm">{dist.subtitle}</div>
              </div>
              {state.raceDistance === dist.id && (
                <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
