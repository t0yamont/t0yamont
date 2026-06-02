import { motion } from 'framer-motion';
import { Zap, BarChart2, CloudRain, Layers, User, BookOpen } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { isSupabaseConfigured } from '../lib/supabase';

interface Props {
  onStart: () => void;
  onShowAuth: () => void;
  onShowPlans: () => void;
}

const features = [
  {
    icon: BarChart2,
    color: '#00d4ff',
    title: 'Science-backed targets',
    desc: 'Carb, fluid and sodium targets built from sports-science guidelines, scaled to your weight, intensity and gut tolerance.',
  },
  {
    icon: CloudRain,
    color: '#10b981',
    title: 'Auto weather',
    desc: 'Enter a race location and date — we pull historical climate averages via Open-Meteo so your hydration targets reflect real conditions.',
  },
  {
    icon: Layers,
    color: '#f59e0b',
    title: 'Mix-and-match fuel kit',
    desc: 'Pick products from Maurten, SiS, High5, Tailwind, Veloforte or generic — mix brands, add caffeine hits, build your own kit.',
  },
];

export default function HomePage({ onStart, onShowAuth, onShowPlans }: Props) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0a0f1a]/80 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-cyan-400" />
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            FUEL PLANNER
          </span>
        </div>
        {isSupabaseConfigured() && (
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={onShowPlans}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <BookOpen size={13} />
                  My Plans
                </button>
                <button
                  onClick={signOut}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  title="Sign out"
                >
                  <User size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={onShowAuth}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <User size={13} />
                Sign In / Register
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-16 max-w-xl mx-auto w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/20 rounded-full px-4 py-1.5 mb-2">
            <Zap size={12} className="text-cyan-400" />
            <span className="text-cyan-300 text-xs font-semibold tracking-wide uppercase">Endurance Racing</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl font-bold text-white leading-tight"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Race-Day Fuel.<br />
            <span style={{ color: '#00d4ff' }}>Done Right.</span>
          </h1>

          <p className="text-slate-400 text-base leading-relaxed">
            A 10-step wizard that turns your race profile into a product-by-product
            nutrition and hydration plan — for triathlon, cycling or running.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 w-full justify-center"
        >
          <button
            onClick={onStart}
            className="w-full sm:w-auto flex-1 sm:flex-none bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Build My Plan →
          </button>
          {isSupabaseConfigured() && !user && (
            <button
              onClick={onShowAuth}
              className="w-full sm:w-auto flex-1 sm:flex-none bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 font-semibold py-4 px-8 rounded-xl transition-all text-base"
            >
              Create Account
            </button>
          )}
          {isSupabaseConfigured() && user && (
            <button
              onClick={onShowPlans}
              className="w-full sm:w-auto flex-1 sm:flex-none bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 font-semibold py-4 px-8 rounded-xl transition-all text-base flex items-center justify-center gap-2"
            >
              <BookOpen size={15} />
              My Saved Plans
            </button>
          )}
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full space-y-3 pt-4"
        >
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 bg-white/4 border border-white/8 rounded-2xl p-4 text-left"
            >
              <div
                className="p-2 rounded-xl flex-shrink-0 mt-0.5"
                style={{ background: `${color}15` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold mb-0.5">{title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="text-slate-600 text-xs"
        >
          Free to use · No account required · Save plans with a free account
        </motion.p>
      </div>
    </div>
  );
}
