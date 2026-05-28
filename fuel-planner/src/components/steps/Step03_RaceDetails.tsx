import { motion } from 'framer-motion';
import type { WizardState } from '../../types';
import { SPORTS } from '../../data/sports';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

function fmtMins(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function Step03_RaceDetails({ state, onChange, onNext, onBack }: Props) {
  const sport = state.sport ?? 'triathlon';
  const sportConfig = SPORTS[sport];
  const preset = sportConfig.distances.find(d => d.id === state.raceDistance);
  const ranges = preset?.sliderRanges ?? { swimMin: 0, swimMax: 0, bikeMin: 60, bikeMax: 480, runMin: 30, runMax: 420 };

  const { swimMins, bikeMins, runMins } = state.splitTimes;
  const legs = sportConfig.legs;

  const t1t2 = legs.length === 3 ? 5 : 0;
  const totalMins = swimMins + bikeMins + runMins + t1t2;

  const updateSplits = (key: keyof typeof state.splitTimes, val: number) => {
    onChange({ splitTimes: { ...state.splitTimes, [key]: val } });
  };

  const sliders: Array<{
    key: keyof typeof state.splitTimes;
    label: string;
    min: number;
    max: number;
    value: number;
    show: boolean;
  }> = [
    { key: 'swimMins', label: 'Swim', min: ranges.swimMin, max: ranges.swimMax, value: swimMins, show: legs.includes('swim') },
    { key: 'bikeMins', label: 'Bike', min: ranges.bikeMin, max: ranges.bikeMax, value: bikeMins, show: legs.includes('bike') },
    { key: 'runMins', label: 'Run', min: ranges.runMin, max: ranges.runMax, value: runMins, show: legs.includes('run') },
  ].filter(s => s.show);

  const canProceed = sliders.every(s => s.value > 0);

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
            Target finish times
          </h1>
          <p className="text-slate-400 text-sm">Set your expected split times for each discipline.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Total finish time</p>
          <p className="text-3xl font-bold text-amber-400" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            {fmtMins(totalMins)}
          </p>
          {t1t2 > 0 && <p className="text-slate-500 text-xs mt-1">Includes {t1t2} min transitions</p>}
        </div>

        <div className="space-y-6">
          {sliders.map(s => (
            <div key={s.key} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-white font-semibold text-sm">{s.label}</label>
                <span className="font-mono text-cyan-400 text-sm bg-cyan-400/10 px-3 py-1 rounded-lg">
                  {fmtMins(s.value)}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={5}
                value={s.value}
                onChange={e => updateSplits(s.key, parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-slate-600 text-xs">
                <span>{fmtMins(s.min)}</span>
                <span>{fmtMins(s.max)}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
        >
          Continue →
        </button>
      </motion.div>
    </div>
  );
}
