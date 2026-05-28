import { motion } from 'framer-motion';
import type { WizardState, Sport } from '../../types';
import { SPORTS } from '../../data/sports';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SPORT_CARDS = [
  { id: 'triathlon' as Sport, label: 'Triathlon', icon: '🏊‍♂️', subIcon: '🚴‍♂️🏃‍♂️', desc: 'Multi-sport — swim, bike, run' },
  { id: 'cycling' as Sport, label: 'Cycling', icon: '🚴‍♂️', subIcon: '', desc: 'Road, gran fondo, criterium, ultra' },
  { id: 'running' as Sport, label: 'Running', icon: '🏃‍♂️', subIcon: '', desc: '10K, half, marathon, ultra' },
];

export default function Step01_SportType({ state, onChange, onNext }: Props) {
  const select = (sport: Sport) => {
    onChange({ sport, raceDistance: null, splitTimes: { swimMins: 0, bikeMins: 0, runMins: 0 } });
    setTimeout(onNext, 180);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] px-4 max-w-md mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6"
      >
        <div className="text-center space-y-2">
          <p className="text-cyan-400 text-xs uppercase tracking-[0.2em] font-medium">
            FUEL PLANNER
          </p>
          <h1 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            What are you training for?
          </h1>
          <p className="text-slate-400 text-sm">
            Select your sport to get a personalised race-day nutrition plan.
          </p>
        </div>

        <div className="grid gap-3">
          {SPORT_CARDS.map((card, i) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => select(card.id)}
              className={`group relative flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                state.sport === card.id
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.1)]'
                  : 'bg-white/5 border-white/10 hover:border-cyan-400/40 hover:bg-white/8'
              }`}
            >
              <div className="text-4xl leading-none">{card.icon}{card.subIcon}</div>
              <div className="flex-1">
                <div className="text-white font-bold text-lg" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {card.label}
                </div>
                <div className="text-slate-400 text-sm">{card.desc}</div>
              </div>
              {state.sport === card.id && (
                <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
              )}
            </motion.button>
          ))}
        </div>

        <p className="text-center text-slate-600 text-xs">
          Powered by evidence-based sports nutrition science
        </p>
      </motion.div>
    </div>
  );
}
