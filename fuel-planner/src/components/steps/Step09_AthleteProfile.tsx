import { useState } from 'react';
import { motion } from 'framer-motion';
import type { WizardState, Sex } from '../../types';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SEX_OPTIONS: Array<{ id: Sex; label: string }> = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'prefer_not', label: 'Prefer not to say' },
];

export default function Step09_AthleteProfile({ state, onChange, onNext, onBack }: Props) {
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  const { weightKg, age, sex } = state.athlete;

  const setWeight = (val: number) => {
    const kg = unit === 'lbs' ? Math.round(val / 2.205) : val;
    onChange({ athlete: { ...state.athlete, weightKg: kg } });
  };

  const displayWeight = unit === 'lbs' ? Math.round(weightKg * 2.205) : weightKg;
  const canProceed = weightKg > 0 && age > 0;

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
            Athlete profile
          </h1>
          <p className="text-slate-400 text-sm">Used to scale fluid and carb targets to your body size.</p>
        </div>

        {/* Weight */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-white font-semibold text-sm">Body weight</label>
            <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              {(['kg', 'lbs'] as const).map(u => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                    unit === u ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={displayWeight || ''}
              onChange={e => setWeight(parseFloat(e.target.value) || 0)}
              placeholder={unit === 'kg' ? '70' : '155'}
              min={30}
              max={unit === 'kg' ? 150 : 330}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-lg font-mono text-center"
            />
            <span className="text-slate-400 text-sm w-8">{unit}</span>
          </div>
          {weightKg > 0 && unit === 'lbs' && (
            <p className="text-slate-500 text-xs text-center">{weightKg} kg</p>
          )}
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label className="text-white font-semibold text-sm">Age</label>
          <input
            type="number"
            value={age || ''}
            onChange={e => onChange({ athlete: { ...state.athlete, age: parseInt(e.target.value) || 0 } })}
            placeholder="32"
            min={16}
            max={90}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-lg font-mono text-center"
          />
        </div>

        {/* Sex */}
        <div className="space-y-3">
          <label className="text-white font-semibold text-sm">Sex</label>
          <div className="grid grid-cols-3 gap-2">
            {SEX_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => onChange({ athlete: { ...state.athlete, sex: opt.id } })}
                className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all ${
                  sex === opt.id
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {opt.label}
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
