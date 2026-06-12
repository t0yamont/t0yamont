import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Zap, Plus, Trash2, FlaskConical, Loader2, TrendingUp, AlertTriangle, Shield, SlidersHorizontal } from 'lucide-react';
import type { WizardState, FuelBrand, FuelKit, Product, ProductType } from '../../types';
import { BRAND_INFO, getAllProductsFlat, kitFromBrand, getProductById } from '../../data/brands';
import BrandLogo from '../BrandLogo';
import { useAuth } from '../../auth/AuthProvider';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  inputToProduct, loadCustomProducts, saveCustomProduct, deleteCustomProduct,
  type CustomProductInput,
} from '../../data/customProducts';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const QUICK_FILL_BRANDS: FuelBrand[] = ['precision', 'maurten', 'sis', 'high5', 'tailwind', 'veloforte'];

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
  role, value, custom, onChange,
}: {
  role: KitRole;
  value: string | null;
  custom: Product[];
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta     = ROLE_META[role];
  const allProds = getAllProductsFlat(custom).filter(meta.filter);
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
            className="text-slate-600 hover:text-slate-400 text-xs transition-colors shrink-0 ml-2 mt-0.5"
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
            <BrandLogo brand={selected.brandId} size={22} />
            <span className="text-white text-sm truncate">{selected.name}</span>
            <span className="text-slate-500 text-xs shrink-0 font-mono">
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
          className="text-slate-500 shrink-0 ml-2 transition-transform"
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
                      <BrandLogo brand={p.brandId} size={18} />
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
                  {p.id === value && <Check size={14} className="text-cyan-400 shrink-0 mt-1" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PRODUCT_TYPES: ProductType[] = ['gel', 'chew', 'drink', 'bar', 'capsule'];
const EMPTY_FORM: CustomProductInput = {
  name: '', type: 'gel', carbs: 30, sodium: 0, fluid: 0, caffeine: 0, mixedCarb: true,
};

/** Custom / "My products" library manager (Change 2). */
function CustomProductManager({
  products, onAdd, onRemove,
}: {
  products: Product[];
  onAdd: (input: CustomProductInput) => Promise<void>;
  onRemove: (id: string) => void;
}) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CustomProductInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const num = (v: string) => (v === '' ? 0 : Math.max(0, parseFloat(v) || 0));

  const submit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onAdd(form);
    setSaving(false);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  return (
    <div className="space-y-3 bg-violet-500/5 border border-violet-400/20 rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <FlaskConical size={15} className="text-violet-400" />
        <p className="text-white text-sm font-semibold flex-1">My products</p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 text-violet-300 hover:text-violet-200 text-xs font-semibold"
        >
          <Plus size={13} /> Add
        </button>
      </div>

      <p className="text-slate-500 text-xs">
        Define your own fuel (e.g. a 90 g/serving bike mix). It's used by the planner exactly like a brand product.
        {isSupabaseConfigured() && !user && ' Sign in to save your library across devices.'}
      </p>

      {products.length > 0 && (
        <div className="space-y-1.5">
          {products.map(p => (
            <div key={p.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{p.name}</p>
                <p className="text-slate-500 text-xs font-mono">
                  {p.type} · {p.carbsG}g carb
                  {p.sodiumMg > 0 && ` · ${p.sodiumMg}mg Na`}
                  {p.caffeineMg > 0 && ` · ${p.caffeineMg}mg caf`}
                  {p.mixedCarb && ' · mixed-carb'}
                </p>
              </div>
              <button onClick={() => onRemove(p.id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Name — e.g. My 90g bike mix"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 text-sm"
              />
              <div className="grid grid-cols-5 gap-1.5">
                {PRODUCT_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                      form.type === t ? 'bg-violet-500/25 border border-violet-400 text-violet-200'
                                      : 'bg-white/5 border border-white/10 text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className="text-slate-400 text-xs">Carbs (g)</span>
                  <input type="number" min={0} value={form.carbs || ''}
                    onChange={e => setForm(f => ({ ...f, carbs: num(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-violet-400" />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400 text-xs">Sodium (mg)</span>
                  <input type="number" min={0} value={form.sodium || ''}
                    onChange={e => setForm(f => ({ ...f, sodium: num(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-violet-400" />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400 text-xs">Fluid (ml)</span>
                  <input type="number" min={0} value={form.fluid || ''}
                    onChange={e => setForm(f => ({ ...f, fluid: num(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-violet-400" />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400 text-xs">Caffeine (mg)</span>
                  <input type="number" min={0} value={form.caffeine || ''}
                    onChange={e => setForm(f => ({ ...f, caffeine: num(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-violet-400" />
                </label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.mixedCarb}
                  onChange={e => setForm(f => ({ ...f, mixedCarb: e.target.checked }))}
                  className="accent-violet-500 w-4 h-4" />
                <span className="text-slate-300 text-xs">Multi-transportable carb (glucose:fructose) — needed above 60 g/h</span>
              </label>
              <button
                onClick={submit}
                disabled={saving || !form.name.trim()}
                className="w-full bg-violet-500 hover:bg-violet-400 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save product
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Step10_BrandSelector({ state, onChange, onNext, onBack }: Props) {
  const { user } = useAuth();
  const custom = state.customProducts ?? [];

  const kit: FuelKit = state.fuelKit ?? {
    primaryGelId: 'generic_gel', cafGelId: null, drinkId: null, solidId: null,
  };

  // Load the user's saved custom library on mount (if signed in and not already loaded).
  useEffect(() => {
    if (user && isSupabaseConfigured() && custom.length === 0) {
      loadCustomProducts(user.id).then(prods => {
        if (prods.length > 0) onChange({ customProducts: prods });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateKit = (partial: Partial<FuelKit>) => {
    onChange({ fuelKit: { ...kit, ...partial } });
  };

  const quickFill = (brandId: FuelBrand) => {
    const newKit = kitFromBrand(brandId, custom);
    onChange({ fuelKit: newKit, brand: brandId });
  };

  const addCustomProduct = async (input: CustomProductInput) => {
    if (user && isSupabaseConfigured()) {
      const saved = await saveCustomProduct(user.id, input);
      if (saved) { onChange({ customProducts: [...custom, saved] }); return; }
    }
    // Session-only fallback (logged out or save failed).
    onChange({ customProducts: [...custom, inputToProduct(input)] });
  };

  const removeCustomProduct = (id: string) => {
    if (user && isSupabaseConfigured()) deleteCustomProduct(id);
    onChange({ customProducts: custom.filter(p => p.id !== id) });
  };

  // ── High-carb advanced eligibility ────────────────────────────────────────
  const kitHasMixed = [kit.primaryGelId, kit.cafGelId, kit.drinkId, kit.solidId]
    .filter(Boolean)
    .some(id => getProductById(id as string, custom)?.mixedCarb);
  const gutOk = state.gutTolerance === 'normal' || state.gutTolerance === 'iron';
  const showHighCarbToggle = kitHasMixed && gutOk;
  const highCarbOn = state.highCarbAdvanced ?? false;

  // ── Gel/drink split ────────────────────────────────────────────────────────
  const hasDrink = Boolean(kit.drinkId);
  const gelSplit = state.gelDrinkSplit ?? 60;

  // ── Sponsor restriction (from selectedRace) ────────────────────────────────
  const sponsorRace = state.selectedRace?.sponsorRestricted ? state.selectedRace : null;

  const canProceed = Boolean(kit.primaryGelId);

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
            Build your fuel kit
          </h1>
          <p className="text-slate-400 text-sm">
            Mix products from any brand or your own library. Quick-fill from one brand, then swap individual items.
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    active
                      ? 'text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                  style={active ? { background: `${info.color}20`, borderColor: `${info.color}60`, color: info.color } : {}}
                >
                  <BrandLogo brand={b} size={15} />
                  {info.label}
                </button>
              );
            })}
            {custom.length > 0 && (
              <button
                onClick={() => quickFill('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  state.brand === 'custom' ? 'text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                }`}
                style={state.brand === 'custom'
                  ? { background: `${BRAND_INFO.custom.color}20`, borderColor: `${BRAND_INFO.custom.color}60`, color: BRAND_INFO.custom.color }
                  : {}}
              >
                My Products
              </button>
            )}
          </div>
        </div>

        {/* Custom product library */}
        <CustomProductManager
          products={custom}
          onAdd={addCustomProduct}
          onRemove={removeCustomProduct}
        />

        <div className="border-t border-white/5" />

        {/* Per-role selectors */}
        <div className="space-y-5">
          {ROLE_ORDER.map(role => (
            <ProductPicker
              key={role}
              role={role}
              value={kit[role]}
              custom={custom}
              onChange={id => updateKit({ [role]: id })}
            />
          ))}
        </div>

        {/* Sponsor restriction notice */}
        {sponsorRace && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 bg-amber-500/8 border border-amber-400/25 rounded-xl p-4"
          >
            <Shield size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-200 text-sm font-semibold">{sponsorRace.name}</p>
              <p className="text-amber-200/80 text-xs leading-relaxed mt-0.5">
                Only official sponsor brands ({(sponsorRace.allowedBrands ?? []).map(b => b === 'precision' ? 'PF&H' : b === 'maurten' ? 'Maurten' : b).join(' & ')}) are
                available at aid stations. You can carry any brand in your kit, but only these
                will be available on course.
              </p>
            </div>
          </motion.div>
        )}

        {/* Gel / drink split slider */}
        {hasDrink && (
          <div className="space-y-3 bg-white/3 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-cyan-400" />
              <p className="text-white text-sm font-semibold flex-1">Gel / drink split</p>
              <span className="text-cyan-400 font-mono text-sm font-bold">{gelSplit}% gels</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={gelSplit}
              onChange={e => onChange({ gelDrinkSplit: parseInt(e.target.value) })}
            />
            <div className="flex justify-between text-slate-600 text-xs">
              <span>All drink</span>
              <span>{100 - gelSplit}% from drink</span>
              <span>All gel</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Controls how the engine allocates carbs between gels and your drink mix.
              Higher = more gels; lower = lean on your drink for carbs.
            </p>
          </div>
        )}

        {/* High-carb advanced opt-in */}
        {showHighCarbToggle && (
          <div className="space-y-2 bg-amber-500/5 border border-amber-400/20 rounded-2xl p-4">
            <button
              onClick={() => onChange({ highCarbAdvanced: !highCarbOn })}
              className="w-full flex items-center gap-3 text-left"
            >
              <TrendingUp size={16} className="text-amber-400 shrink-0" />
              <span className="flex-1 text-white text-sm font-semibold">Advanced high-carb (120–150 g/h)</span>
              <span className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${highCarbOn ? 'bg-amber-500' : 'bg-white/15'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${highCarbOn ? 'left-[1.375rem]' : 'left-0.5'}`} />
              </span>
            </button>
            {highCarbOn && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2">
                <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-200 text-xs leading-relaxed">
                  120–150 g/h is an advanced, gut-trained strategy. Build up in training over weeks;
                  not recommended for your first race at this intake.
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Caffeine note */}
        {kit.cafGelId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 bg-purple-500/10 border border-purple-400/20 rounded-xl p-3"
          >
            <Zap size={13} className="text-purple-400 shrink-0 mt-0.5" />
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
