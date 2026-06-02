import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import type { NutritionPlan, WizardState } from '../../types';

interface Props {
  plan: NutritionPlan;
  state: WizardState;
}

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  color: string;
  min: number;
  max: number;
  note?: string;
  subNote?: React.ReactNode;
}

function MetricCard({ label, value, unit, color, min, max, note, subNote }: MetricCardProps) {
  const pct  = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const zone = pct < 33 ? 'Low' : pct < 66 ? 'Moderate' : 'High';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-end justify-between">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color }}>
              {value}
            </span>
            <span className="text-slate-400 text-sm">{unit}</span>
          </div>
        </div>
        <div
          className="text-xs px-3 py-1.5 rounded-lg font-semibold"
          style={{ color, background: `${color}15` }}
        >
          {zone}
        </div>
      </div>

      <div className="space-y-1">
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }}
          />
        </div>
        <div className="flex justify-between text-slate-600 text-xs">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>

      {note     && <p className="text-slate-500 text-xs leading-relaxed">{note}</p>}
      {subNote  && <div>{subNote}</div>}
    </motion.div>
  );
}

export default function NumbersSummary({ plan, state }: Props) {
  const { avgCarbsPerHour, avgSodiumPerHour } = plan.totals;
  const { estimatedSweatRateMlH, recommendedFluidMlH,
          plannedCaffeineMg, plannedCaffeineMgPerKg,
          caffeineFlag, needsMixedCarb, mixedCarbNotice } = plan.insights;

  return (
    <div className="px-4 py-5 space-y-4">
      <p className="text-slate-400 text-sm text-center">
        Race averages — see Segments tab for per-discipline targets.
      </p>

      {/* Mixed-carb structural notice */}
      {mixedCarbNotice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 bg-orange-500/10 border border-orange-400/30 rounded-xl p-3"
        >
          <AlertTriangle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-orange-200 text-xs leading-relaxed">{mixedCarbNotice}</p>
        </motion.div>
      )}

      {/* Carbohydrate */}
      <MetricCard
        label="Carbohydrate"
        value={avgCarbsPerHour}
        unit="g/h"
        color="#00d4ff"
        min={30}
        max={100}
        note={
          needsMixedCarb
            ? `Above 60 g/h — ${state.brand && state.brand !== 'generic' ? 'mixed-carb products preferred in your schedule' : 'choose glucose:fructose products to maximise absorption'}.`
            : 'Carb intake averaged across fuelling segments.'
        }
      />

      {/* Fluid — shows both estimated sweat and recommended intake */}
      <MetricCard
        label="Fluid (recommended)"
        value={recommendedFluidMlH}
        unit="ml/h"
        color="#10b981"
        min={300}
        max={1400}
        note="Targets replace ~70% of estimated sweat loss — modern practice tolerates mild dehydration (keep losses under 2–3% body mass) to reduce GI distress and hyponatremia risk."
        subNote={
          <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5 mt-1">
            <div className="text-center">
              <p className="text-xs font-mono font-bold text-emerald-400">{recommendedFluidMlH} ml/h</p>
              <p className="text-slate-500 text-xs mt-0.5">intake target</p>
            </div>
            <div className="text-slate-600 text-xs">÷ 0.70 →</div>
            <div className="text-center">
              <p className="text-xs font-mono font-bold text-slate-300">{estimatedSweatRateMlH} ml/h</p>
              <p className="text-slate-500 text-xs mt-0.5">estimated sweat</p>
            </div>
          </div>
        }
      />

      {/* Sodium */}
      <MetricCard
        label="Sodium"
        value={avgSodiumPerHour}
        unit="mg/h"
        color="#f59e0b"
        min={200}
        max={1500}
        note="From electrolyte drinks, gels, and capsules. Scales with your fluid intake — if you drink more, you absorb more sodium."
      />

      {/* Caffeine row — only shown if caffeine is in the plan */}
      {plannedCaffeineMg > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border rounded-2xl p-4 space-y-2 ${
            caffeineFlag === 'high'
              ? 'bg-red-500/10 border-red-400/30'
              : caffeineFlag === 'low'
              ? 'bg-slate-500/10 border-slate-400/20'
              : 'bg-purple-500/10 border-purple-400/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {caffeineFlag === 'high' ? (
              <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
            ) : caffeineFlag === 'low' ? (
              <Info size={14} className="text-slate-400 flex-shrink-0" />
            ) : (
              <CheckCircle size={14} className="text-purple-400 flex-shrink-0" />
            )}
            <p className="text-xs font-semibold" style={{
              color: caffeineFlag === 'high' ? '#f87171'
                   : caffeineFlag === 'low'  ? '#94a3b8'
                   : '#c084fc',
            }}>
              Planned caffeine: {plannedCaffeineMg} mg (≈ {plannedCaffeineMgPerKg} mg/kg)
            </p>
          </div>
          <p className="text-xs leading-relaxed" style={{
            color: caffeineFlag === 'high' ? '#fca5a5'
                 : caffeineFlag === 'low'  ? '#94a3b8'
                 : '#d8b4fe',
          }}>
            {caffeineFlag === 'high' &&
              `Exceeds the 400 mg absolute ceiling or 6 mg/kg guideline. Review the Schedule tab and remove a caffeine dose.`}
            {caffeineFlag === 'low' &&
              `Below 3 mg/kg — may be sub-optimal for a performance aim. Consider one additional caffeine dose if your gut tolerates it.`}
            {caffeineFlag === 'ok' &&
              `Within the 3–6 mg/kg evidence-based range. Well-placed for performance.`}
          </p>
        </motion.div>
      )}

      {/* Full race totals */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Full race totals</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {plan.totals.carbsG}g
            </p>
            <p className="text-slate-500 text-xs">carbs</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {Math.round(plan.totals.fluidMl / 100) / 10}L
            </p>
            <p className="text-slate-500 text-xs">fluid</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {plan.totals.sodiumMg}mg
            </p>
            <p className="text-slate-500 text-xs">sodium</p>
          </div>
        </div>
      </div>

      {state.brand && state.brand !== 'generic' && (
        <div className="bg-cyan-500/5 border border-cyan-400/20 rounded-xl p-4">
          <p className="text-cyan-300/80 text-xs text-center">
            Product recommendations tailored for{' '}
            <strong className="text-cyan-300 capitalize">{state.brand}</strong> — see Schedule tab.
          </p>
        </div>
      )}
    </div>
  );
}
