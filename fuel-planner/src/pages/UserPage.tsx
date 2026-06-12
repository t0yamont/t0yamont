import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Trash2, Play, ClipboardList, BookOpen, Loader2, Zap, CheckCircle2, User,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { getPostRaceLog } from '../data/postRaceLog';
import PostRaceLogModal from '../plans/PostRaceLogModal';
import type { SavedPlan, WizardState, PostRaceLogEntry } from '../types';

interface Props {
  onBack: () => void;
  onLoadPlan: (state: WizardState) => void;
  onShowAuth: () => void;
}

const SPORT_EMOJI: Record<string, string> = {
  triathlon: '🏊🚴🏃',
  cycling: '🚴',
  running: '🏃',
};

const DISTANCE_LABEL: Record<string, string> = {
  sprint: 'Sprint', olympic: 'Olympic', '70.3': 'IRONMAN 70.3',
  full: 'IRONMAN Full', crit: 'Criterium', gran_fondo: 'Gran Fondo',
  century: 'Century', ultra: 'Ultra', '10k': '10K',
  half_marathon: 'Half Marathon', marathon: 'Marathon', ultra_run: 'Ultra Run',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function UserPage({ onBack, onLoadPlan, onShowAuth }: Props) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [logMap, setLogMap] = useState<Record<string, PostRaceLogEntry | null>>({});
  const [logModalPlan, setLogModalPlan] = useState<SavedPlan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return;
    setLoading(true);
    supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data as SavedPlan[]) ?? [];
        setPlans(rows);
        setLoading(false);
        Promise.all(rows.map(p => getPostRaceLog(p.id).then(log => ({ id: p.id, log })))).then(
          results => {
            const map: Record<string, PostRaceLogEntry | null> = {};
            results.forEach(({ id, log }) => { map[id] = log; });
            setLogMap(map);
          },
        );
      });
  }, [user]);

  const deletePlan = async (id: string) => {
    setDeletingId(id);
    await supabase.from('plans').delete().eq('id', id);
    setPlans(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1a]">
      {/* Aurora orbs (same as home page) */}
      <div className="aurora-orb aurora-orb-1" />
      <div className="aurora-orb aurora-orb-2" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-[#0a0f1a]/80 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-cyan-400" />
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              FUEL PLANNER
            </span>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <User size={14} className="text-slate-500" />
            <span className="text-slate-500 text-xs truncate max-w-[160px]">{user.email}</span>
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="flex-1 pt-20 pb-16 px-4 max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="space-y-1">
            <h1
              className="text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              My Plans
            </h1>
            <p className="text-slate-500 text-sm">
              {user ? 'Your saved race nutrition plans' : 'Sign in to access your saved plans'}
            </p>
          </div>

          {!user ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <BookOpen size={28} className="text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Sign in to save plans</p>
                <p className="text-slate-500 text-sm mt-1">Your plans are saved to your account and available anywhere.</p>
              </div>
              <button
                onClick={onShowAuth}
                className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                Sign In / Register
              </button>
            </motion.div>
          ) : loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-cyan-400" size={32} />
            </div>
          ) : plans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <BookOpen size={28} className="text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">No saved plans yet</p>
                <p className="text-slate-500 text-sm mt-1">Complete the wizard and save your first plan.</p>
              </div>
              <button
                onClick={onBack}
                className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                Build a Plan →
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan, i) => {
                const hasLog = !!logMap[plan.id];
                const isDel = deletingId === plan.id;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/4 border border-white/10 hover:border-white/15 rounded-2xl overflow-hidden transition-colors"
                  >
                    {/* Plan header */}
                    <div className="flex items-start gap-4 px-4 pt-4 pb-3">
                      <span className="text-2xl shrink-0 mt-0.5">{SPORT_EMOJI[plan.sport] ?? '🏅'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-base leading-tight">{plan.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {plan.wizard_state.selectedRace && (
                            <span className="text-cyan-400 text-xs font-medium">
                              {plan.wizard_state.selectedRace.name}
                            </span>
                          )}
                          {plan.wizard_state.raceDistance && (
                            <span className="bg-white/8 text-slate-400 text-xs px-2 py-0.5 rounded-full">
                              {DISTANCE_LABEL[plan.wizard_state.raceDistance] ?? plan.wizard_state.raceDistance}
                            </span>
                          )}
                          <span className="text-slate-600 text-xs">{formatDate(plan.created_at)}</span>
                        </div>
                        {hasLog && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            <span className="text-emerald-400 text-xs font-medium">Race logged</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 px-4 pb-4 pt-2 border-t border-white/5">
                      <button
                        onClick={() => { onLoadPlan(plan.wizard_state); }}
                        className="flex items-center gap-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
                      >
                        <Play size={11} />
                        Load Plan
                      </button>
                      <button
                        onClick={() => setLogModalPlan(plan)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                          hasLog
                            ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300'
                            : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <ClipboardList size={11} />
                        {hasLog ? 'View Race Log' : 'Log Race Result'}
                      </button>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        disabled={isDel}
                        className="ml-auto text-slate-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                        title="Delete plan"
                      >
                        {isDel ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Post-race log modal */}
      <AnimatePresence>
        {logModalPlan && (
          <PostRaceLogModal
            plan={logModalPlan}
            existingLog={logMap[logModalPlan.id] ?? null}
            onClose={() => setLogModalPlan(null)}
            onSaved={entry => {
              setLogMap(prev => ({ ...prev, [logModalPlan.id]: entry }));
              setLogModalPlan(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
