import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, BarChart2, ClipboardList, Minus, Plus, Loader2 } from 'lucide-react';
import { savePostRaceLog } from '../data/postRaceLog';
import { useAuth } from '../auth/AuthProvider';
import type { SavedPlan, PostRaceLogEntry, PostRaceLogActualItem } from '../types';

interface Props {
  plan: SavedPlan;
  existingLog: PostRaceLogEntry | null;
  onClose: () => void;
  onSaved: (entry: PostRaceLogEntry) => void;
}

function minsToHMM(total: number): string {
  if (!total) return '—';
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
}

function getPlannedItems(plan: SavedPlan): PostRaceLogActualItem[] {
  const tl = plan.computed?.timeline;
  if (!tl?.length) return [];
  const map: Record<string, PostRaceLogActualItem> = {};
  for (const item of tl) {
    if (item.quantity <= 0) continue;
    if (!map[item.product]) {
      map[item.product] = {
        product: item.product,
        planned: 0,
        actual: 0,
        carbsPerUnit: item.carbs / item.quantity,
        sodiumPerUnit: item.sodium / item.quantity,
        caffeinePerUnit: (item.caffeineMg ?? 0) / item.quantity,
      };
    }
    map[item.product].planned += item.quantity;
  }
  return Object.values(map);
}

function SplitInput({
  label, planned, value, onChange,
}: {
  label: string; planned: number; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400 text-sm w-14 shrink-0">{label}</span>
      <span className="text-slate-600 text-xs font-mono w-20 shrink-0">
        {planned ? minsToHMM(planned) : '—'}
      </span>
      <input
        type="number"
        min={0}
        value={value || ''}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        placeholder="0"
        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400 text-right font-mono"
      />
      <span className="text-slate-500 text-xs shrink-0 w-5">min</span>
    </div>
  );
}

function CompareRow({
  label, planned, actual, unit, highlight,
}: {
  label: string; planned: number; actual: number; unit: 'time' | 'g' | 'mg'; highlight?: boolean;
}) {
  const diff = actual - planned;
  const pct = planned > 0 ? Math.abs(diff) / planned : 0;

  let diffColor = '#94a3b8';
  if (unit === 'time') {
    diffColor = pct <= 0.03 ? '#34d399' : diff < 0 ? '#34d399' : '#f97316';
  } else {
    diffColor = pct <= 0.1 ? '#34d399' : diff < 0 ? '#60a5fa' : '#f97316';
  }

  const fmt = (v: number) =>
    unit === 'time' ? minsToHMM(v) : `${Math.round(v)}${unit}`;

  const fmtDiff = (d: number) => {
    const abs = unit === 'time' ? minsToHMM(Math.abs(d)) : `${Math.round(Math.abs(d))}${unit}`;
    return d > 0 ? `+${abs}` : `-${abs}`;
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${highlight ? 'bg-white/4' : ''}`}>
      <span className={`text-sm w-16 shrink-0 ${highlight ? 'text-white font-semibold' : 'text-slate-400'}`}>
        {label}
      </span>
      <span className="text-slate-500 text-xs font-mono flex-1">{fmt(planned)}</span>
      <span className="text-white text-sm font-mono font-bold">{fmt(actual)}</span>
      {diff !== 0 && (
        <span className="text-xs font-mono shrink-0 w-16 text-right" style={{ color: diffColor }}>
          {fmtDiff(diff)}
        </span>
      )}
    </div>
  );
}

export default function PostRaceLogModal({ plan, existingLog, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const sport = plan.sport;
  const plannedSplits = plan.wizard_state.splitTimes;
  const plannedItems = getPlannedItems(plan);

  const [tab, setTab] = useState<'log' | 'compare'>(existingLog ? 'compare' : 'log');
  const [saving, setSaving] = useState(false);

  const [actualSplits, setActualSplits] = useState({
    swimMins: existingLog?.actual_splits?.swimMins ?? 0,
    bikeMins: existingLog?.actual_splits?.bikeMins ?? 0,
    runMins: existingLog?.actual_splits?.runMins ?? 0,
  });

  const [counts, setCounts] = useState<Record<string, number>>(() => {
    if (!existingLog) return {};
    return Object.fromEntries(existingLog.actual_items.map(i => [i.product, i.actual]));
  });

  const [notes, setNotes] = useState(existingLog?.notes ?? '');

  const updateCount = (product: string, v: number) =>
    setCounts(prev => ({ ...prev, [product]: Math.max(0, v) }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const actual_items: PostRaceLogActualItem[] = plannedItems.map(item => ({
        ...item,
        actual: counts[item.product] ?? 0,
      }));
      const saved = await savePostRaceLog({
        plan_id: plan.id,
        user_id: user.id,
        actual_splits: actualSplits,
        actual_items,
        notes,
      });
      if (saved) onSaved(saved);
    } finally {
      setSaving(false);
    }
  };

  const log = existingLog;
  const plannedTotal = plannedSplits.swimMins + plannedSplits.bikeMins + plannedSplits.runMins;
  const actualTotal =
    (log?.actual_splits?.swimMins ?? 0) +
    (log?.actual_splits?.bikeMins ?? 0) +
    (log?.actual_splits?.runMins ?? 0);

  const plannedTotals = plan.computed?.totals;
  const actualCarbs = log?.actual_items.reduce((s, i) => s + i.actual * i.carbsPerUnit, 0) ?? 0;
  const actualSodium = log?.actual_items.reduce((s, i) => s + i.actual * i.sodiumPerUnit, 0) ?? 0;

  const showSwim = sport === 'triathlon';
  const showBike = sport === 'triathlon' || sport === 'cycling';
  const showRun = sport === 'triathlon' || sport === 'running';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="bg-[#0d1424] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10 shrink-0">
          <div>
            <p
              className="text-white font-bold"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.2rem' }}
            >
              Race Log
            </p>
            <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{plan.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/3 border-b border-white/10 shrink-0">
          {(['log', 'compare'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              disabled={t === 'compare' && !log}
              className={`flex items-center gap-1.5 py-3 px-5 text-xs font-semibold border-b-2 transition-all ${
                tab === t
                  ? 'border-cyan-400 text-cyan-300'
                  : t === 'compare' && !log
                  ? 'border-transparent text-slate-600 cursor-not-allowed'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t === 'log' ? <ClipboardList size={13} /> : <BarChart2 size={13} />}
              {t === 'log' ? 'Log Result' : 'Plan vs Actual'}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {tab === 'log' ? (
            <>
              {/* Split times */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-semibold">Actual split times</p>
                  <span className="text-slate-600 text-xs">(minutes)</span>
                </div>
                <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 space-y-3">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-slate-600 text-xs w-14 shrink-0" />
                    <span className="text-slate-600 text-xs w-20 shrink-0">Planned</span>
                    <span className="text-slate-600 text-xs flex-1 text-right">Actual</span>
                  </div>
                  {showSwim && (
                    <SplitInput label="Swim" planned={plannedSplits.swimMins} value={actualSplits.swimMins} onChange={v => setActualSplits(p => ({ ...p, swimMins: v }))} />
                  )}
                  {showBike && (
                    <SplitInput label={sport === 'cycling' ? 'Ride' : 'Bike'} planned={plannedSplits.bikeMins} value={actualSplits.bikeMins} onChange={v => setActualSplits(p => ({ ...p, bikeMins: v }))} />
                  )}
                  {showRun && (
                    <SplitInput label="Run" planned={plannedSplits.runMins} value={actualSplits.runMins} onChange={v => setActualSplits(p => ({ ...p, runMins: v }))} />
                  )}
                </div>
              </div>

              {/* Products */}
              {plannedItems.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-white text-sm font-semibold">Products consumed</p>
                  <div className="space-y-2">
                    {plannedItems.map(item => (
                      <div
                        key={item.product}
                        className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{item.product}</p>
                          <p className="text-slate-500 text-xs">Planned: {Math.round(item.planned)}×</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCount(item.product, (counts[item.product] ?? 0) - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white/8 hover:bg-white/15 rounded-lg text-white transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-white font-mono font-bold text-sm">
                            {counts[item.product] ?? 0}
                          </span>
                          <button
                            onClick={() => updateCount(item.product, (counts[item.product] ?? 0) + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white/8 hover:bg-white/15 rounded-lg text-white transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-2">
                  No product timeline available — only split times will be logged.
                </p>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <p className="text-slate-300 text-sm font-medium">Notes</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="How did fueling go? Any GI issues, what worked, what didn't…"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'Saving…' : 'Save Race Log'}
              </button>
            </>
          ) : (
            log && (
              <>
                {/* Time comparison */}
                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                    <p className="text-slate-400 text-xs uppercase tracking-widest flex-1">Race times</p>
                    <span className="text-slate-600 text-xs">Planned</span>
                    <span className="text-slate-500 text-xs w-24 text-right">Actual / Diff</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {showSwim && (
                      <CompareRow label="Swim" planned={plannedSplits.swimMins} actual={log.actual_splits?.swimMins ?? 0} unit="time" />
                    )}
                    {showBike && (
                      <CompareRow label={sport === 'cycling' ? 'Ride' : 'Bike'} planned={plannedSplits.bikeMins} actual={log.actual_splits?.bikeMins ?? 0} unit="time" />
                    )}
                    {showRun && (
                      <CompareRow label="Run" planned={plannedSplits.runMins} actual={log.actual_splits?.runMins ?? 0} unit="time" />
                    )}
                    <CompareRow label="Total" planned={plannedTotal} actual={actualTotal} unit="time" highlight />
                  </div>
                </div>

                {/* Nutrition comparison */}
                {plannedTotals && (
                  <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                      <p className="text-slate-400 text-xs uppercase tracking-widest flex-1">Nutrition</p>
                      <span className="text-slate-600 text-xs">Planned</span>
                      <span className="text-slate-500 text-xs w-24 text-right">Actual / Diff</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      <CompareRow label="Carbs" planned={Math.round(plannedTotals.carbsG)} actual={Math.round(actualCarbs)} unit="g" />
                      <CompareRow label="Sodium" planned={Math.round(plannedTotals.sodiumMg)} actual={Math.round(actualSodium)} unit="mg" />
                    </div>
                  </div>
                )}

                {/* Per-product */}
                {log.actual_items.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-slate-400 text-xs uppercase tracking-widest">Per product</p>
                    <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                      {log.actual_items.map(item => {
                        const diff = item.actual - Math.round(item.planned);
                        return (
                          <div
                            key={item.product}
                            className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0"
                          >
                            <p className="text-white text-sm flex-1 truncate">{item.product}</p>
                            <span className="text-slate-500 text-xs font-mono">Plan {Math.round(item.planned)}×</span>
                            <span className="text-white text-sm font-mono font-bold">Act {item.actual}×</span>
                            {diff !== 0 && (
                              <span
                                className="text-xs font-mono w-8 text-right"
                                style={{ color: item.actual >= item.planned ? '#34d399' : '#f97316' }}
                              >
                                {diff > 0 ? `+${diff}` : diff}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {log.notes && (
                  <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Notes</p>
                    <p className="text-white text-sm leading-relaxed">{log.notes}</p>
                  </div>
                )}

                <button
                  onClick={() => setTab('log')}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-sm font-semibold py-3 rounded-xl transition-all"
                >
                  Edit log
                </button>
              </>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
