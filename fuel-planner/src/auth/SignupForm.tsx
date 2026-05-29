import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface Props {
  onSwitch: () => void;
  onSuccess: () => void;
}

export default function SignupForm({ onSwitch, onSuccess }: Props) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setDone(true);
      setTimeout(onSuccess, 1500);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 space-y-3"
      >
        <CheckCircle className="mx-auto text-emerald-400" size={48} />
        <p className="text-white font-semibold">Account created!</p>
        <p className="text-slate-400 text-sm">Check your email to confirm your account.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
        Create Account
      </h2>
      <p className="text-slate-400 text-sm">Save and load your race nutrition plans</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Create Account
        </button>
      </form>

      <p className="text-center text-slate-400 text-sm">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-cyan-400 hover:text-cyan-300">
          Sign in
        </button>
      </p>
    </motion.div>
  );
}
