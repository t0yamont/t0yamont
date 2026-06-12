import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Layers, Clock, Sunrise, Package, PackageCheck, AlertTriangle, Info, MapPin, LayoutList, AlignLeft } from 'lucide-react';
import type { WizardState, NutritionPlan } from '../../types';
import NumbersSummary from './NumbersSummary';
import SegmentBreakdown from './SegmentBreakdown';
import RaceTimeline from './RaceTimeline';
import PreRacePlan from './PreRacePlan';
import ProductSchedule from './ProductSchedule';
import PackList from './PackList';
import SavePlanButton from '../../plans/SavePlanButton';
import { isSupabaseConfigured } from '../../lib/supabase';

interface Props {
  state: WizardState;
  plan: NutritionPlan;
  onReset: () => void;
}

const TABS = [
  { id: 'numbers', label: 'Numbers', icon: BarChart3 },
  { id: 'segments', label: 'Segments', icon: Layers },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'prerace', label: 'Pre-Race', icon: Sunrise },
  { id: 'schedule', label: 'Schedule', icon: Package },
  { id: 'packlist', label: 'Pack list', icon: PackageCheck },
];

export default function ResultsShell({ state, plan, onReset }: Props) {
  const [activeTab, setActiveTab] = useState('numbers');

  const isHot = state.tempCelsius > 28;
  const isHighCarb = plan.totals.avgCarbsPerHour > 75 && state.gutTolerance === 'sensitive';
  const planStyle   = state.planStyle ?? 'relaxed';
  const selectedRace = state.selectedRace;

  const [styleOverride, setStyleOverride] = useState<'precise' | 'relaxed' | null>(null);
  const effectiveStyle = styleOverride ?? planStyle;

  return (
    <div className="flex flex-col min-h-screen max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 space-y-3 no-print">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cyan-400 text-xs uppercase tracking-widest">Race Day Plan</p>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Your Nutrition Plan
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isSupabaseConfigured() && <SavePlanButton wizardState={state} plan={plan} />}
            <button
              onClick={onReset}
              className="text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              Redo
            </button>
          </div>
        </div>

        {/* Race badge */}
        {selectedRace && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <MapPin size={13} className="text-cyan-400 shrink-0" />
            <span className="text-slate-300 text-xs font-semibold truncate">{selectedRace.name}</span>
            <span className="text-slate-500 text-xs ml-auto shrink-0">{selectedRace.city}</span>
          </div>
        )}

        {/* Plan style toggle */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 no-print">
          {([['relaxed', 'Relaxed', AlignLeft], ['precise', 'Precise', LayoutList]] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setStyleOverride(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                effectiveStyle === id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Warnings */}
        {isHot && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 bg-amber-500/10 border border-amber-400/30 rounded-xl p-3"
          >
            <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-200 text-xs leading-relaxed">
              <strong>Hot race conditions detected.</strong> Fluid and sodium targets have been increased.
              Prioritise drinking at every aid station on the run.
            </p>
          </motion.div>
        )}

        {isHighCarb && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 bg-orange-500/10 border border-orange-400/30 rounded-xl p-3"
          >
            <Info size={15} className="text-orange-400 shrink-0 mt-0.5" />
            <p className="text-orange-200 text-xs leading-relaxed">
              <strong>GI risk:</strong> Your carb target is ambitious given your gut sensitivity.
              Gels are spaced further apart. Practice this plan in training first.
            </p>
          </motion.div>
        )}
      </div>

      {/* Sticky tabs */}
      <div className="sticky top-0 z-20 bg-[#0a0f1a]/90 backdrop-blur border-b border-white/5 no-print">
        <div className="flex overflow-x-auto px-4 scrollbar-none md:justify-center">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'numbers' && <NumbersSummary plan={plan} state={state} />}
            {activeTab === 'segments' && <SegmentBreakdown plan={plan} />}
            {activeTab === 'timeline' && <RaceTimeline plan={plan} />}
            {activeTab === 'prerace' && <PreRacePlan plan={plan} athlete={state.athlete} />}
            {activeTab === 'schedule' && <ProductSchedule plan={plan} state={state} planStyle={effectiveStyle} />}
            {activeTab === 'packlist' && <PackList plan={plan} state={state} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 text-center border-t border-white/5 no-print">
        <p className="text-slate-600 text-xs">
          Weather data by{' '}
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">
            Open-Meteo.com
          </a>
          {' '}· CC BY 4.0
        </p>
      </div>
    </div>
  );
}
