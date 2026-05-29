import { Printer } from 'lucide-react';
import type { NutritionPlan, FuelBrand } from '../../types';
import { BRAND_INFO } from '../../data/brands';

interface Props {
  plan: NutritionPlan;
  brand: FuelBrand;
}

export default function ProductSchedule({ plan, brand }: Props) {
  const { timeline } = plan;

  const totalCarbs = timeline.reduce((s, i) => s + i.carbs * i.quantity, 0);
  const totalSodium = timeline.reduce((s, i) => s + i.sodium * i.quantity, 0);
  const totalFluid = timeline.reduce((s, i) => s + i.fluid * i.quantity, 0);

  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-widest">Brand</p>
          <p className="text-white font-bold" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.1rem' }}>
            {BRAND_INFO[brand].label}
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

      {/* Table */}
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

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-slate-400 text-xs leading-relaxed">
          💡 <strong className="text-slate-300">Training tip:</strong> Practice this exact plan in at least 2 long training sessions before race day.
          Never use untested nutrition in a race.
        </p>
      </div>
    </div>
  );
}
