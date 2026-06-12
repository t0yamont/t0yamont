import { useState } from 'react';
import { motion } from 'framer-motion';
import type { WizardState, SweatRate } from '../../types';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const OPTIONS: Array<{ id: SweatRate; label: string; mlh: string; desc: string; emoji: string }> = [
  { id: 'light', label: 'Light', mlh: '~500 ml/h', desc: 'Barely sweat, kit stays mostly dry', emoji: '💧' },
  { id: 'moderate', label: 'Moderate', mlh: '~750 ml/h', desc: 'Noticeable sweat, damp kit', emoji: '💧💧' },
  { id: 'heavy', label: 'Heavy', mlh: '~1000 ml/h', desc: 'Very sweaty, soaked kit', emoji: '💧💧💧' },
  { id: 'very_heavy', label: 'Very Heavy', mlh: '~1200 ml/h', desc: 'Dripping constantly, visibly salty kit', emoji: '🌊' },
];

export default function Step06_SweatRate({ state, onChange, onNext, onBack }: Props) {
  const [exactMode, setExactMode] = useState(false);
  const [exactVal, setExactVal] = useState('');

  const select = (id: SweatRate) => {
    onChange({ sweatRate: id });
    setTimeout(onNext, 180);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] px-4 max-w-md md:max-w-2xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-5 md:space-y-7"
      >
        <div className="space-y-2">
          <button onClick={onBack} className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">
            ← Back
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            How much do you sweat?
          </h1>
          <p className="text-slate-400 text-sm">This sets your base fluid target.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => select(opt.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                state.sweatRate === opt.id
                  ? 'bg-cyan-500/15 border-cyan-400'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-2xl w-10">{opt.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-bold" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>{opt.label}</span>
                  <span className="text-xs font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded">{opt.mlh}</span>
                </div>
                <p className="text-slate-400 text-xs">{opt.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-xs leading-relaxed">
            💡 <strong className="text-slate-300">Measure it:</strong> Weigh yourself before and after a 1h run without drinking.
            Each 1 kg lost = ~1L of sweat.
          </p>
        </div>

        <button
          onClick={() => setExactMode(v => !v)}
          className="text-cyan-400 hover:text-cyan-300 text-sm text-center w-full"
        >
          {exactMode ? 'Use qualitative selector ↑' : 'I know my exact ml/h →'}
        </button>

        {exactMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={exactVal}
                onChange={e => setExactVal(e.target.value)}
                placeholder="e.g. 850"
                min={200}
                max={2500}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 text-sm font-mono"
              />
              <span className="text-slate-400 text-sm">ml/h</span>
            </div>
            <button
              onClick={() => {
                const v = parseInt(exactVal);
                if (!v) return;
                const rate = v < 625 ? 'light' : v < 875 ? 'moderate' : v < 1100 ? 'heavy' : 'very_heavy';
                onChange({ sweatRate: rate });
                onNext();
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 rounded-xl"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Use this value
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
