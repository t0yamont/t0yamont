import { motion } from 'framer-motion';
import type { NutritionPlan, ProductItem } from '../../types';

interface Props {
  plan: NutritionPlan;
}

function EventNode({ item, index }: { item: ProductItem; index: number }) {
  const isCaf = item.isCaffeine;
  const isFluid = item.carbs === 0 && item.fluid > 0;
  const isSodium = item.sodium > 0 && item.carbs === 0;

  const color = isCaf ? '#a78bfa' : isFluid || isSodium ? '#00d4ff' : '#f59e0b';

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex gap-4 relative"
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
        <div className="w-px flex-1 bg-white/10 mt-1" style={{ minHeight: '32px' }} />
      </div>

      <div className="pb-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <span className="text-slate-500 text-xs font-mono">{item.time}</span>
            <span className="text-slate-600 text-xs mx-1.5">·</span>
            <span className="text-slate-500 text-xs">{item.segment}</span>
          </div>
          {isCaf && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ color: '#a78bfa', background: '#a78bfa15' }}>
              ☕ Caffeine
            </span>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
          <p className="text-white text-sm font-medium">
            {item.quantity > 1 ? `${item.quantity}× ` : ''}{item.product}
            {item.fluid > 0 && <span className="text-cyan-400 ml-2 text-xs">+{item.fluid}ml water</span>}
          </p>
          <div className="flex gap-3 text-xs font-mono">
            {item.carbs > 0 && (
              <span className="text-amber-400/70">{item.carbs}g carb</span>
            )}
            {item.sodium > 0 && (
              <span className="text-purple-400/70">{item.sodium}mg Na</span>
            )}
          </div>
          {item.note && (
            <p className="text-slate-500 text-xs italic">{item.note}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function RaceTimeline({ plan }: Props) {
  if (plan.timeline.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-slate-500">
        <p>No timeline events generated.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Fuel
        </span>
        <span className="flex items-center gap-1.5 text-xs text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Hydration
        </span>
        <span className="flex items-center gap-1.5 text-xs text-purple-400">
          <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Caffeine
        </span>
      </div>

      <div>
        {plan.timeline.map((item, i) => (
          <EventNode key={i} item={item} index={i} />
        ))}

        {/* Finish node */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-4 h-4 rounded-full border-2 border-emerald-400 flex-shrink-0 mt-1" />
          </div>
          <div className="pb-4">
            <p className="text-emerald-400 font-bold text-sm mt-0.5" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              🏁 Finish Line
            </p>
            <p className="text-slate-500 text-xs">Recovery nutrition within 30 min</p>
          </div>
        </div>
      </div>
    </div>
  );
}
