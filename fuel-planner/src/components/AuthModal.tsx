import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import LoginForm from '../auth/LoginForm';
import SignupForm from '../auth/SignupForm';
import { isSupabaseConfigured } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

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
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            {!isSupabaseConfigured() ? (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={22} className="text-amber-400 shrink-0" />
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                    Accounts not configured
                  </h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Account features require Supabase environment variables to be set on your deployment.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 font-mono text-xs text-slate-300">
                  <p>VITE_SUPABASE_URL=https://xxxx.supabase.co</p>
                  <p>VITE_SUPABASE_ANON_KEY=eyJ…</p>
                </div>
                <p className="text-slate-500 text-xs">
                  Add these in your Vercel project → Settings → Environment Variables, then redeploy.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-white/8 hover:bg-white/12 border border-white/10 text-slate-300 font-semibold py-3 rounded-xl transition-all text-sm"
                >
                  Close
                </button>
              </div>
            ) : mode === 'login' ? (
              <LoginForm
                onSwitch={() => setMode('signup')}
                onSuccess={onSuccess}
              />
            ) : (
              <SignupForm
                onSwitch={() => setMode('login')}
                onSuccess={onSuccess}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
