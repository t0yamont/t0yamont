import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, ShoppingCart, PackageCheck, LayoutList, Layers } from 'lucide-react';
import type { NutritionPlan, WizardState, PackItem } from '../../types';
import { buildPackList } from '../../data/packList';

interface Props {
  plan: NutritionPlan;
  state: WizardState;
}

const LEG_LABEL: Record<string, string> = {
  T1: 'T1 — into bike', Bike: 'Bike', T2: 'T2 — into run', Run: 'Run',
  swim: 'Swim', pre_race: 'Pre-race',
};

function countLabel(item: PackItem): string {
  if (item.productType === 'drink' && item.bottles != null) {
    return `${item.count} serving${item.count !== 1 ? 's' : ''} → ${item.bottles} bottle${item.bottles !== 1 ? 's' : ''}`;
  }
  if (item.productType === 'capsule') return `${item.count} cap${item.count !== 1 ? 's' : ''}`;
  return `${item.count}×`;
}

function ItemRow({
  item, checkKey, checked, onToggle,
}: {
  item: PackItem; checkKey: string; checked: boolean; onToggle: (k: string) => void;
}) {
  return (
    <label className="flex items-start gap-3 px-4 py-3 border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/3 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(checkKey)}
        className="accent-cyan-500 w-4 h-4 mt-0.5 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-cyan-400 font-mono text-sm font-bold shrink-0">{countLabel(item)}</span>
          <span className={`text-white text-sm ${checked ? 'line-through text-slate-500' : ''}`}>{item.product}</span>
          {item.isCaffeine && <span className="text-purple-400 text-xs">☕</span>}
        </div>
        <div className="flex gap-3 text-xs font-mono mt-0.5">
          {item.carbs > 0 && <span className="text-amber-400/70">{Math.round(item.carbs)}g carb</span>}
          {item.sodium > 0 && <span className="text-purple-400/70">{Math.round(item.sodium)}mg Na</span>}
          {item.caffeineMg > 0 && <span className="text-fuchsia-400/70">{Math.round(item.caffeineMg)}mg caf</span>}
        </div>
      </div>
    </label>
  );
}

export default function PackList({ plan, state }: Props) {
  const bottleSizeMl = state.athlete.bottleSizeMl ?? 750;
  const pack = useMemo(() => buildPackList(plan, bottleSizeMl), [plan, bottleSizeMl]);
  const [view, setView] = useState<'total' | 'byLeg'>('total');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (k: string) =>
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageCheck size={18} className="text-cyan-400" />
          <p className="text-white font-bold" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.2rem' }}>
            Pack list
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm px-4 py-2 rounded-xl transition-all"
        >
          <Printer size={14} />
          Print
        </button>
      </div>

      <p className="text-slate-400 text-xs">
        Everything to buy and pack — bottle counts use your {bottleSizeMl}ml bottle setting.
      </p>

      {/* View toggle */}
      <div className="no-print flex bg-white/5 border border-white/10 rounded-xl p-1">
        {([['total', 'Total for race', LayoutList], ['byLeg', 'By leg', Layers]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              view === id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Summary line */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Pack covers</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-amber-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{pack.totals.carbsG}g</p>
            <p className="text-slate-500 text-xs">carbs</p>
          </div>
          <div>
            <p className="text-xl font-bold text-purple-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{pack.totals.sodiumMg}mg</p>
            <p className="text-slate-500 text-xs">sodium</p>
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {Math.round(pack.totals.fluidMl / 100) / 10}L
            </p>
            <p className="text-slate-500 text-xs">drink mix</p>
          </div>
        </div>
        {pack.totals.caffeineMg > 0 && (
          <p className="text-center text-fuchsia-400/80 text-xs mt-3 font-mono">
            + {pack.totals.caffeineMg}mg caffeine total
          </p>
        )}
      </div>

      {/* Items */}
      {view === 'total' ? (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {pack.total.map(item => (
            <ItemRow
              key={item.product}
              item={item}
              checkKey={item.product}
              checked={checked.has(item.product)}
              onToggle={toggle}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {pack.byLeg.map(({ leg, items }) => (
            <div key={leg} className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="bg-white/5 px-4 py-2.5 border-b border-white/10">
                <p className="text-white text-sm font-semibold" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {LEG_LABEL[leg] ?? leg}
                </p>
              </div>
              {items.map(item => (
                <ItemRow
                  key={`${leg}:${item.product}`}
                  item={item}
                  checkKey={`${leg}:${item.product}`}
                  checked={checked.has(`${leg}:${item.product}`)}
                  onToggle={toggle}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* +1 contingency suggestion (not in core totals) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-start gap-2 bg-orange-500/10 border border-orange-400/25 rounded-xl p-4"
      >
        <span className="text-orange-400 shrink-0">＋</span>
        <p className="text-orange-200 text-xs leading-relaxed">
          <strong>Pack {pack.spareGels.low}–{pack.spareGels.high} spare gels</strong> (1–2 extra per hour) beyond the plan
          in case of drops or a bad patch. These are not counted in the totals above.
        </p>
      </motion.div>

      {/* FUTURE: affiliate links — "built the plan, now buy the plan" (e.g. PF&H, The Feed) */}
      <button
        disabled
        title="Coming soon"
        className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-500 font-semibold py-3 rounded-xl text-sm cursor-not-allowed no-print"
      >
        <ShoppingCart size={15} />
        Buy these products (coming soon)
      </button>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-slate-400 text-xs leading-relaxed">
          💡 <strong className="text-slate-300">Tip:</strong> Tick items as you pack each one into your transition bags and bottles.
          Print this page to take it shopping and to the race.
        </p>
      </div>
    </div>
  );
}
