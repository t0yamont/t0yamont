import { Printer } from 'lucide-react';
import type { NutritionPlan, WizardState, ProductItem } from '../../types';
import { BRAND_INFO } from '../../data/brands';
import BrandLogo from '../BrandLogo';

interface Props {
  plan: NutritionPlan;
  state: WizardState;
  planStyle?: 'precise' | 'relaxed';
}

// ─── Precise mode — exact-time table ─────────────────────────────────────────

function PreciseSchedule({ timeline }: { timeline: ProductItem[] }) {
  const totalCarbs  = timeline.reduce((s, i) => s + i.carbs  * i.quantity, 0);
  const totalSodium = timeline.reduce((s, i) => s + i.sodium * i.quantity, 0);
  const totalFluid  = timeline.reduce((s, i) => s + i.fluid  * i.quantity, 0);

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm print-table">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-semibold whitespace-nowrap">Time</th>
              <th className="text-left px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-semibold whitespace-nowrap">Segment</th>
              <th className="text-left px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-semibold">Product</th>
              <th className="text-right px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-semibold">Qty</th>
              <th className="text-right px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-semibold whitespace-nowrap">Carbs</th>
              <th className="text-right px-4 py-3 text-slate-400 text-xs uppercase tracking-wide font-semibold">Na</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((item, i) => (
              <tr
                key={i}
                className={`border-b border-white/5 hover:bg-white/3 transition-colors ${
                  item.isCaffeine ? 'bg-purple-500/5' : ''
                }`}
              >
                <td className="px-4 py-3 font-mono text-cyan-400 text-xs whitespace-nowrap">{item.time}</td>
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{item.segment}</td>
                <td className="px-4 py-3 text-white text-xs">
                  {item.product}
                  {item.isCaffeine && <span className="ml-1 text-purple-400">☕</span>}
                  {item.note && <p className="text-slate-500 text-xs mt-0.5">{item.note}</p>}
                </td>
                <td className="px-4 py-3 text-right text-white font-mono text-xs">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-amber-400 font-mono text-xs whitespace-nowrap">{item.carbs * item.quantity}g</td>
                <td className="px-4 py-3 text-right text-purple-400 font-mono text-xs whitespace-nowrap">{item.sodium * item.quantity}mg</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-white/20 bg-white/5 font-semibold">
              <td colSpan={4} className="px-4 py-3 text-slate-300 text-xs uppercase tracking-wide">Totals</td>
              <td className="px-4 py-3 text-right text-amber-400 font-mono text-sm font-bold whitespace-nowrap">{totalCarbs}g</td>
              <td className="px-4 py-3 text-right text-purple-400 font-mono text-sm font-bold whitespace-nowrap">{totalSodium}mg</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {totalFluid > 0 && (
        <p className="text-slate-500 text-xs text-center">
          + {Math.round(totalFluid / 1000 * 10) / 10}L additional fluid from drinks/water
        </p>
      )}
    </>
  );
}

// ─── Relaxed mode — grouped, rule-of-thumb cards ──────────────────────────────

interface SegmentGroup {
  label: string;
  items: ProductItem[];
}

function groupBySegment(timeline: ProductItem[]): SegmentGroup[] {
  const order = ['T1', 'Bike', 'T2', 'Run'];
  const map = new Map<string, ProductItem[]>();
  for (const item of timeline) {
    const seg = item.segment;
    map.set(seg, [...(map.get(seg) ?? []), item]);
  }
  const result: SegmentGroup[] = [];
  for (const label of order) {
    if (map.has(label)) result.push({ label, items: map.get(label)! });
  }
  // Any remaining segments not in the predefined order
  for (const [label, items] of map) {
    if (!order.includes(label)) result.push({ label, items });
  }
  return result;
}

function productFrequencyLine(items: ProductItem[]): string {
  if (items.length === 0) return '';
  const counts = new Map<string, { count: number; carbs: number; isCaf: boolean }>();
  for (const item of items) {
    const existing = counts.get(item.product) ?? { count: 0, carbs: item.carbs, isCaf: item.isCaffeine ?? false };
    existing.count += item.quantity;
    counts.set(item.product, existing);
  }
  const parts: string[] = [];
  for (const [name, meta] of counts) {
    parts.push(`${meta.count}× ${name}${meta.isCaf ? ' ☕' : ''} (${meta.carbs * meta.count}g)`);
  }
  return parts.join(', ');
}

function intervalLabel(count: number, durationMins: number): string {
  if (count <= 0) return '';
  const interval = Math.round(durationMins / (count + 1));
  if (interval < 20) return 'every 15–20 min';
  if (interval < 30) return 'every 20–25 min';
  if (interval < 40) return 'every 30–35 min';
  return `every ~${interval} min`;
}

function RelaxedSchedule({ timeline, plan }: { timeline: ProductItem[]; plan: NutritionPlan }) {
  const groups = groupBySegment(timeline);

  return (
    <div className="space-y-3">
      {groups.map(({ label, items }) => {
        const seg = plan.segments.find(s =>
          (s.segment === 'bike' && label === 'Bike') ||
          (s.segment === 'run'  && label === 'Run') ||
          (s.segment === 't1'   && label === 'T1') ||
          (s.segment === 't2'   && label === 'T2'),
        );
        const durationMins = seg?.durationMins ?? 0;
        const gels = items.filter(i => i.productType !== 'drink');
        const drinks = items.filter(i => i.productType === 'drink');
        const cafItems = items.filter(i => i.isCaffeine);
        const totalCarbs = items.reduce((s, i) => s + i.carbs * i.quantity, 0);

        return (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <p className="text-white font-semibold" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.1rem' }}>
                {label}
              </p>
              {durationMins > 0 && (
                <span className="text-slate-500 text-xs font-mono">{durationMins} min</span>
              )}
            </div>

            <div className="space-y-2">
              {gels.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-amber-400 shrink-0 mt-0.5">🟡</span>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    <strong>{productFrequencyLine(gels)}</strong>
                    {durationMins > 0 && gels.length > 1 && (
                      <span className="text-slate-500"> — {intervalLabel(gels.length, durationMins)}</span>
                    )}
                  </p>
                </div>
              )}

              {drinks.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 shrink-0 mt-0.5">💧</span>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    <strong>{productFrequencyLine(drinks)}</strong>
                    {label === 'Run' && (
                      <span className="text-slate-500"> — sip at every aid station</span>
                    )}
                  </p>
                </div>
              )}

              {cafItems.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 shrink-0 mt-0.5">☕</span>
                  <p className="text-slate-300 text-sm">
                    Caffeine: {cafItems.map(i => i.product).join(', ')} at key moments
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                <span className="text-slate-500 text-xs">~{totalCarbs}g carbs total in this segment</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export default function ProductSchedule({ plan, state, planStyle = 'precise' }: Props) {
  const { timeline } = plan;

  const kitLabel = state.brand && state.brand !== 'generic'
    ? BRAND_INFO[state.brand].label
    : 'Custom Kit';

  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {state.brand && <BrandLogo brand={state.brand} size={34} />}
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-widest">Fuel Kit</p>
            <p className="text-white font-bold" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.1rem' }}>
              {kitLabel}
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm px-4 py-2 rounded-xl transition-all"
        >
          <Printer size={14} />
          Print
        </button>
      </div>

      {planStyle === 'relaxed'
        ? <RelaxedSchedule timeline={timeline} plan={plan} />
        : <PreciseSchedule timeline={timeline} />
      }

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-slate-400 text-xs leading-relaxed">
          💡 <strong className="text-slate-300">Training tip:</strong> Practice this exact plan in at least 2 long training sessions before race day.
          Never use untested nutrition in a race.
        </p>
      </div>
    </div>
  );
}
