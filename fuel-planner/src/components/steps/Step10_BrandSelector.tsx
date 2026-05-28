import { motion } from 'framer-motion';
import type { WizardState, FuelBrand } from '../../types';
import { BRAND_INFO } from '../../data/brands';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const BRAND_ORDER: FuelBrand[] = ['maurten', 'sis', 'high5', 'tailwind', 'veloforte', 'generic'];

const BRAND_COLORS: Record<FuelBrand, string> = {
  maurten: '#e8e0c0',
  sis: '#ff6600',
  high5: '#ff0066',
  tailwind: '#00bfff',
  veloforte: '#8b4513',
  generic: '#94a3b8',
};

export default function Step10_BrandSelector({ state, onChange, onNext, onBack }: Props) {
  const select = (id: FuelBrand) => {
    onChange({ brand: id });
    setTimeout(onNext, 220);
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-3rem)] px-4 max-w-md mx-auto w-full py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-5"
      >
        <div className="space-y-2">
          <button onClick={onBack} className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Preferred fuel brand
          </h1>
          <p className="text-slate-400 text-sm">
            Get product-specific recommendations. Don't have a preference? Choose Generic.
          </p>
        </div>

        <div className="grid gap-3">
          {BRAND_ORDER.map((id, i) => {
            const info = BRAND_INFO[id];
            const color = BRAND_COLORS[id];
            const isSelected = state.brand === id;

            return (
              <motion.button
                key={id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => select(id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${
                  isSelected
                    ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.08)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                style={isSelected ? { background: `${color}10`, borderColor: color } : {}}
              >
                <div
                  className="w-2 h-full min-h-[40px] rounded-full flex-shrink-0"
                  style={{ background: color, width: '3px' }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-base" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                      {info.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ color, background: `${color}20` }}>
                      {info.tagline}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{info.strategy}</p>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: color }} />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
