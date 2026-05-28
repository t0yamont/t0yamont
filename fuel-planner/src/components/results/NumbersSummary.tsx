import { motion } from 'framer-motion';
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
}

function MetricCard({ label, value, unit, color, min, max, note }: MetricCardProps) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const zones = [
    { label: 'Low', end: 33 },
    { label: 'Moderate', end: 66 },
    { label: 'High', end: 100 },
  ];
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

      {/* Gauge */}
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

      {note && <p className="text-slate-500 text-xs leading-relaxed">{note}</p>}
    </motion.div>
  );
}

export default function NumbersSummary({ plan, state }: Props) {
  const { avgCarbsPerHour, avgFluidPerHour, avgSodiumPerHour } = plan.totals;

  return (
    <div className="px-4 py-5 space-y-4">
      <p className="text-slate-400 text-sm text-center">
        Race averages — see Segments tab for per-discipline targets.
      </p>

      <MetricCard
        label="Carbohydrate"
        value={avgCarbsPerHour}
        unit="g/h"
        color="#00d4ff"
        min={30}
        max={100}
        note="Carb intake rate averaged across fuelling segments."
      />

      <MetricCard
        label="Fluid"
        value={avgFluidPerHour}
        unit="ml/h"
        color="#10b981"
        min={300}
        max={1400}
        note="Includes all sources — bottles, gels, aid station drinks."
      />

      <MetricCard
        label="Sodium"
        value={avgSodiumPerHour}
        unit="mg/h"
        color="#f59e0b"
        min={200}
        max={1500}
        note="From electrolyte drinks, gels, and capsules combined."
      />

      {/* Summary totals */}
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
              {Math.round(plan.totals.fluidMl / 1000 * 10) / 10}L
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
