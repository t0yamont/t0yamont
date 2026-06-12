import { motion } from 'framer-motion';
import type { NutritionPlan, SegmentPlan } from '../../types';

interface Props {
  plan: NutritionPlan;
}

const SEGMENT_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pre_race: { label: 'Pre-Race', icon: '⏰', color: '#94a3b8' },
  swim: { label: 'Swim', icon: '🏊‍♂️', color: '#60a5fa' },
  t1: { label: 'T1 Transition', icon: '⚡', color: '#a78bfa' },
  bike: { label: 'Bike', icon: '🚴‍♂️', color: '#00d4ff' },
  t2: { label: 'T2 Transition', icon: '⚡', color: '#a78bfa' },
  run: { label: 'Run', icon: '🏃‍♂️', color: '#10b981' },
};

function fmtMins(m: number) {
  if (m === 0) return '—';
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
}

function SegCard({ seg }: { seg: SegmentPlan }) {
  const meta = SEGMENT_META[seg.segment] ?? { label: seg.segment, icon: '•', color: '#94a3b8' };
  const isTransition = ['t1', 't2'].includes(seg.segment);
  const isPreRace = seg.segment === 'pre_race';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4"
      style={{ borderLeftColor: meta.color, borderLeftWidth: '3px' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{meta.icon}</span>
        <div className="flex-1">
          <h3 className="text-white font-bold" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.1rem' }}>
            {meta.label}
          </h3>
          {seg.durationMins > 0 && (
            <p className="text-slate-400 text-xs">{fmtMins(seg.durationMins)}</p>
          )}
        </div>
      </div>

      {!isPreRace && !isTransition && seg.carbsGPerHour === 0 && (
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl px-4 py-2">
          <p className="text-blue-300 text-xs">No fuelling — rely on pre-loading</p>
        </div>
      )}

      {(isTransition) && (
        <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl px-4 py-2">
          <p className="text-purple-300 text-xs font-semibold">Window of opportunity</p>
        </div>
      )}

      {!isPreRace && seg.carbsGPerHour > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-white/5 rounded-xl p-3">
            <p className="text-xs font-mono font-bold text-cyan-400">{seg.carbsGPerHour}g/h</p>
            <p className="text-slate-500 text-xs mt-0.5">carbs</p>
          </div>
          <div className="text-center bg-white/5 rounded-xl p-3">
            <p className="text-xs font-mono font-bold text-emerald-400">{seg.fluidMlPerHour}ml/h</p>
            <p className="text-slate-500 text-xs mt-0.5">fluid</p>
          </div>
          <div className="text-center bg-white/5 rounded-xl p-3">
            <p className="text-xs font-mono font-bold text-amber-400">{seg.sodiumMgPerHour}mg/h</p>
            <p className="text-slate-500 text-xs mt-0.5">sodium</p>
          </div>
        </div>
      )}

      <ul className="space-y-1.5">
        {seg.notes.map((note, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-400 text-xs">
            <span className="mt-0.5 shrink-0" style={{ color: meta.color }}>›</span>
            {note}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function SegmentBreakdown({ plan }: Props) {
  return (
    <div className="px-4 py-5 space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
      {plan.segments.map((seg, i) => (
        <SegCard key={`${seg.segment}-${i}`} seg={seg} />
      ))}
    </div>
  );
}
