import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Zap, ChevronDown } from 'lucide-react';
import type { NutritionPlan, AthleteProfile } from '../../types';

interface Props {
  plan: NutritionPlan;
  athlete: AthleteProfile;
}

function Section({
  icon,
  title,
  items,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  color: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-5 text-left"
      >
        <div className="shrink-0" style={{ color }}>
          {icon}
        </div>
        <span className="flex-1 text-white font-bold" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.1rem' }}>
          {title}
        </span>
        <ChevronDown
          size={16}
          className="text-slate-500 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="px-5 pb-5 space-y-3">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                    style={{ background: color }}
                  />
                  <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PreRacePlan({ plan, athlete }: Props) {
  return (
    <div className="px-4 py-5 space-y-4">
      <p className="text-slate-400 text-sm text-center">
        Personalised for a {athlete.weightKg}kg athlete.
      </p>

      <Section
        icon={<Moon size={20} />}
        title="Night Before"
        items={plan.preRace.nightBefore}
        color="#60a5fa"
      />

      <Section
        icon={<Sun size={20} />}
        title="Race Morning"
        items={plan.preRace.raceMorning}
        color="#f59e0b"
      />

      <Section
        icon={<Zap size={20} />}
        title="Warm-Up Window"
        items={plan.preRace.warmUp}
        color="#10b981"
      />
    </div>
  );
}
