import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronRight, Loader2, X, BookOpen } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { SavedPlan, WizardState } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoadPlan: (state: WizardState) => void;
}

export default function MyPlans({ isOpen, onClose, onLoadPlan }: Props) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user && isSupabaseConfigured()) {
      setLoading(true);
      supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setPlans((data as SavedPlan[]) ?? []);
          setLoading(false);
        });
    }
  }, [isOpen, user]);

  const deletePlan = async (id: string) => {
    await supabase.from('plans').delete().eq('id', id);
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const sportEmoji = (sport: string) => {
    if (sport === 'triathlon') return '🏊‍♂️🚴‍♂️🏃‍♂️';
    if (sport === 'cycling') return '🚴‍♂️';
    return '🏃‍♂️';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                My Plans
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-cyan-400" size={28} />
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <BookOpen className="mx-auto text-slate-600" size={40} />
                <p className="text-slate-400">No saved plans yet.</p>
                <p className="text-slate-500 text-sm">Complete the wizard and save your first plan.</p>
              </div>
            ) : (
              <div className="overflow-y-auto space-y-2">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl p-4 cursor-pointer transition-colors"
                    onClick={() => {
                      onLoadPlan(plan.wizard_state);
                      onClose();
                    }}
                  >
                    <span className="text-xl">{sportEmoji(plan.sport)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{plan.name}</p>
                      <p className="text-slate-500 text-xs">{formatDate(plan.created_at)}</p>
                    </div>
                    <ChevronRight className="text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" size={16} />
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deletePlan(plan.id);
                      }}
                      className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
