import { motion } from 'framer-motion';
import { Zap, BarChart2, CloudRain, Layers, User, BookOpen, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import BrandLogo from '../components/BrandLogo';
import { BRAND_INFO } from '../data/brands';
import type { FuelBrand } from '../types';

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
    title: 'Race-aware weather',
    desc: 'Pick your event — we pull historical climate averages for its location and date so hydration targets reflect real conditions.',
  },
  {
    icon: Layers,
    color: '#f59e0b',
    title: 'Mix-and-match fuel kit',
    desc: 'Build a kit from PF&H, Maurten, SiS, High5, Tailwind, Veloforte, your own products — mix brands, add caffeine hits.',
  },
];

const stats = [
  { value: '45+', label: 'race products' },
  { value: '40+', label: 'real events' },
  { value: '150', label: 'g/h max carb' },
  { value: '100%', label: 'free' },
];

const HERO_BRANDS: FuelBrand[] = ['precision', 'maurten', 'sis', 'high5', 'tailwind', 'veloforte'];

export default function HomePage({ onStart, onShowAuth, onShowPlans }: Props) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-[#0a0f1a]/80 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-cyan-400" />
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            FUEL PLANNER
          </span>
        </div>
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
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-16 max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto w-full text-center space-y-8 md:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 md:space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/20 rounded-full px-4 py-1.5 mb-2">
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex"
            >
              <Zap size={12} className="text-cyan-400" />
            </motion.span>
            <span className="text-cyan-300 text-xs font-semibold tracking-wide uppercase">Endurance Racing</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Race-Day Fuel.<br />
            <span className="text-gradient-animated">Done Right.</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            A guided wizard that turns your race profile into a product-by-product
            nutrition and hydration plan — for triathlon, cycling or running.
            Pick a real event and we handle the weather, aid stations and sponsor brands.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 w-full justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="glow-pulse w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 px-10 rounded-xl transition-colors text-lg"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Build My Plan
            <ArrowRight size={18} />
          </motion.button>
          {!user && (
            <button
              onClick={onShowAuth}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 font-semibold py-4 px-8 rounded-xl transition-all text-base"
            >
              Create Account
            </button>
          )}
          {user && (
            <button
              onClick={onShowPlans}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 font-semibold py-4 px-8 rounded-xl transition-all text-base flex items-center justify-center gap-2"
            >
              <BookOpen size={15} />
              My Saved Plans
            </button>
          )}
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-4 gap-2 md:gap-6 w-full max-w-lg mx-auto"
        >
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="text-center"
            >
              <p className="text-xl md:text-2xl font-bold text-cyan-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {value}
              </p>
              <p className="text-slate-600 text-xs">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature cards — stacked on mobile, 3-up on desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="w-full grid gap-3 md:gap-5 md:grid-cols-3 pt-4"
        >
          {features.map(({ icon: Icon, color, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex md:flex-col items-start gap-4 bg-white/4 border border-white/8 hover:border-white/15 rounded-2xl p-4 md:p-6 text-left transition-colors"
            >
              <div
                className="p-2 md:p-3 rounded-xl shrink-0 mt-0.5 md:mt-0"
                style={{ background: `${color}15` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-white text-sm md:text-base font-semibold mb-0.5 md:mb-2">{title}</p>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Brand strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="space-y-3"
        >
          <p className="text-slate-600 text-xs uppercase tracking-widest">Plans built around real products</p>
          <div className="flex items-center justify-center gap-3 md:gap-5 flex-wrap">
            {HERO_BRANDS.map((b, i) => (
              <motion.div
                key={b}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.07, type: 'spring', stiffness: 260, damping: 18 }}
                whileHover={{ scale: 1.15, rotate: -3 }}
                className="flex items-center gap-2"
                title={BRAND_INFO[b].label}
              >
                <BrandLogo brand={b} size={30} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Race-aware teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex items-center gap-2 text-slate-600 text-xs"
        >
          <MapPin size={12} className="text-slate-500" />
          <span>IRONMAN · World Marathon Majors · UTMB · gran fondos — or just your distance</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-slate-600 text-xs"
        >
          Free to use · No account required · Save plans with a free account
        </motion.p>
      </div>
    </div>
  );
}
