import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Loader2, Check } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { WizardState, NutritionPlan } from '../types';
import AuthModal from '../components/AuthModal';

interface Props {
  wizardState: WizardState;
  plan: NutritionPlan;
}

export default function SavePlanButton({ wizardState, plan }: Props) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowModal(true);
  };

  const confirmSave = async () => {
    if (!planName.trim() || !isSupabaseConfigured()) return;
    setSaving(true);
    setError('');
    const { error } = await supabase.from('plans').insert({
      user_id: user!.id,
      name: planName.trim(),
      sport: wizardState.sport ?? 'triathlon',
      wizard_state: wizardState,
      computed: plan,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => {
        setShowModal(false);
        setSaved(false);
        setPlanName('');
      }, 1500);
    }
  };

  if (!isSupabaseConfigured()) return null;

  return (
    <>
      <button
        onClick={handleSave}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium"
      >
        <Save size={15} />
        Save Plan
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              {saved ? (
                <div className="text-center py-4 space-y-3">
                  <Check className="mx-auto text-emerald-400" size={40} />
                  <p className="text-white font-semibold">Plan saved!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                      Name this plan
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={planName}
                    onChange={e => setPlanName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmSave()}
                    placeholder="e.g. Kona 2025, Spring 70.3"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    onClick={confirmSave}
                    disabled={saving || !planName.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Save Plan
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          setShowModal(true);
        }}
      />
    </>
  );
}
