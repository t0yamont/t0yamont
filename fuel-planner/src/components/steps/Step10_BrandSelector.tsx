import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Zap } from 'lucide-react';
import type { WizardState, FuelBrand, FuelKit } from '../../types';
import { BRAND_INFO, getAllProductsFlat, kitFromBrand } from '../../data/brands';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const QUICK_FILL_BRANDS: FuelBrand[] = ['maurten', 'sis', 'high5', 'tailwind', 'veloforte'];

type KitRole = 'primaryGelId' | 'cafGelId' | 'drinkId' | 'solidId';

const ROLE_META: Record<KitRole, {
  label: string; desc: string; required: boolean;
  filter: (p: ReturnType<typeof getAllProductsFlat>[number]) => boolean;
}> = {
  primaryGelId: {
    label: 'Main Gel / Chew',
    desc: 'Your primary race fuel — used throughout',
    required: true,
    filter: p => (p.type === 'gel' || p.type === 'chew') && !p.caffeinated,
  },
  cafGelId: {
    label: 'Caffeine Hit',
    desc: 'Optional — used at key moments (T1 exit, final run third)',
    required: false,
    filter: p => p.caffeinated,
  },
  drinkId: {
    label: 'Drink Mix',
    desc: 'Optional — carb or electrolyte drink in your bottles',
    required: false,
    filter: p => p.type === 'drink',
  },
  solidId: {
    label: 'Bar / Chew',
    desc: 'Optional — solid food for longer segments',
    required: false,
    filter: p => p.type === 'bar' || p.type === 'chew',
  },
};

const ROLE_ORDER: KitRole[] = ['primaryGelId', 'cafGelId', 'drinkId', 'solidId'];

function ProductPicker({
  role, value, onChange,
}: {
  role: KitRole;
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta     = ROLE_META[role];
  const allProds = getAllProductsFlat().filter(meta.filter);
  const selected = allProds.find(p => p.id === value);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white text-sm font-semibold">
            {meta.label}
            {meta.required && <span className="text-cyan-400 ml-1">*</span>}
          </p>
          <p className="text-slate-500 text-xs">{meta.desc}</p>
        </div>
        {!meta.required && value && (
          <button
            onClick={() => onChange(null)}
            className="text-slate-600 hover:text-slate-400 text-xs transition-colors flex-shrink-0 ml-2 mt-0.5"
          >
            Remove
          </button>
        )}
      </div>

      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
          selected
            ? 'bg-white/8 border-cyan-400/40'
            : 'bg-white/5 border-white/10 hover:border-white/20'
        }`}
      >
        {selected ? (
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="text-xs px-2 py-0.5 rounded font-medium flex-shrink-0"
              style={{ color: selected.brandColor, background: `${selected.brandColor}18` }}
            >
              {selected.brandLabel}
            </span>
            <span className="text-white text-sm truncate">{selected.name}</span>
            <span className="text-slate-500 text-xs flex-shrink-0 font-mono">
              {selected.carbsG > 0 && `${selected.carbsG}g carb`}
              {selected.caffeinated && selected.caffeineMg > 0 && ` · ${selected.caffeineMg}mg caf`}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 text-sm">
            {meta.required ? 'Select a product' : 'None (optional)'}
          </span>
        )}
        <ChevronDown
          size={15}
          className="text-slate-500 flex-shrink-0 ml-2 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              {!meta.required && (
                <button
                  onClick={() => { onChange(null); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-white/5 text-left transition-colors ${
                    value === null ? 'bg-white/5 text-slate-300' : 'text-slate-500 hover:bg-white/3'
                  }`}
                >
                  <span className="text-sm">None</span>
                  {value === null && <Check size={13} className="ml-auto text-cyan-400" />}
                </button>
              )}
              {allProds.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onChange(p.id); setOpen(false); }}
                  className={`w-full flex items-start gap-3 px-4 py-3 border-b border-white/5 last:border-0 text-left transition-colors ${
                    p.id === value ? 'bg-cyan-500/10' : 'hover:bg-white/3'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                        style={{ color: p.brandColor, background: `${p.brandColor}18` }}
                      >
                        {p.brandLabel}
                      </span>
                      <span className="text-white text-sm truncate">{p.name}</span>
                    </div>
                    <div className="flex gap-3 text-xs font-mono">
                      {p.carbsG > 0 && <span className="text-amber-400/70">{p.carbsG}g carb</span>}
                      {p.sodiumMg > 0 && <span className="text-purple-400/70">{p.sodiumMg}mg Na</span>}
                      {p.caffeinated && p.caffeineMg > 0 && (
                        <span className="text-fuchsia-400/70">☕ {p.caffeineMg}mg caf</span>
                      )}
                      {p.mixedCarb && <span className="text-emerald-400/60">mixed-carb</span>}
                    </div>
                  </div>
                  {p.id === value && <Check size={14} className="text-cyan-400 flex-shrink-0 mt-1" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Step10_BrandSelector({ state, onChange, onNext, onBack }: Props) {
  const kit: FuelKit = state.fuelKit ?? {
    primaryGelId: 'generic_gel', cafGelId: null, drinkId: null, solidId: null,
  };

  const updateKit = (partial: Partial<FuelKit>) => {
    onChange({ fuelKit: { ...kit, ...partial } });
  };

  const quickFill = (brandId: FuelBrand) => {
    const newKit = kitFromBrand(brandId);
    onChange({ fuelKit: newKit, brand: brandId });
  };

  const canProceed = Boolean(kit.primaryGelId);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-3rem)] px-4 max-w-md mx-auto w-full py-8">
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
            Build your fuel kit
          </h1>
          <p className="text-slate-400 text-sm">
            Mix products from any brand. Quick-fill from one brand, then swap individual items.
          </p>
        </div>

        {/* Quick-fill chips */}
        <div className="space-y-2">
          <p className="text-slate-500 text-xs uppercase tracking-widest">Quick fill from brand</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_FILL_BRANDS.map(b => {
              const info = BRAND_INFO[b];
              const active = state.brand === b;
              return (
                <button
                  key={b}
                  onClick={() => quickFill(b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    active
                      ? 'text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                  style={active ? { background: `${info.color}20`, borderColor: `${info.color}60`, color: info.color } : {}}
                >
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Per-role selectors */}
        <div className="space-y-5">
          {ROLE_ORDER.map(role => (
            <ProductPicker
              key={role}
              role={role}
              value={kit[role]}
              onChange={id => updateKit({ [role]: id })}
            />
          ))}
        </div>

        {/* Caffeine note */}
        {kit.cafGelId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 bg-purple-500/10 border border-purple-400/20 rounded-xl p-3"
          >
            <Zap size={13} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-purple-200 text-xs leading-relaxed">
              Caffeine gel will be placed at T1 exit (race &gt; 3h) and in the final third of your last leg.
              Timings shown on the Schedule tab.
            </p>
          </motion.div>
        )}

        <button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-white font-bold py-4 rounded-xl transition-colors text-lg"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
        >
          Build My Plan →
        </button>
      </motion.div>
    </div>
  );
}
