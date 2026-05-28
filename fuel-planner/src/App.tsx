import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BookOpen, User, LogOut, Zap } from 'lucide-react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import WizardShell from './components/WizardShell';
import ResultsShell from './components/results/ResultsShell';
import AuthModal from './components/AuthModal';
import MyPlans from './plans/MyPlans';
import { computePlan } from './data/calculations';
import type { WizardState, NutritionPlan } from './types';
import { isSupabaseConfigured } from './lib/supabase';

const DEFAULT_STATE: WizardState = {
  sport: null,
  raceDistance: null,
  splitTimes: { swimMins: 0, bikeMins: 0, runMins: 0 },
  intensity: null,
  tempCelsius: 18,
  humidity: 'moderate',
  sweatRate: null,
  saltiness: null,
  crampFrequency: null,
  gutTolerance: null,
  athlete: { weightKg: 70, age: 30, sex: 'prefer_not' },
  brand: null,
  raceDate: null,
  location: null,
  weatherAuto: false,
};

function AppInner() {
  const { user, signOut } = useAuth();
  const [wizardState, setWizardState] = useState<WizardState>(DEFAULT_STATE);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  const updateState = (partial: Partial<WizardState>) => {
    setWizardState(prev => ({ ...prev, ...partial }));
  };

  const handleComplete = () => {
    const computed = computePlan(wizardState);
    setPlan(computed);
  };

  const handleReset = () => {
    setPlan(null);
    setWizardState(DEFAULT_STATE);
  };

  const handleLoadPlan = (state: WizardState) => {
    setWizardState(state);
    const computed = computePlan(state);
    setPlan(computed);
  };

  const showNav = plan !== null || wizardState.sport !== null;

  return (
    <div className="min-h-screen">
      {showNav && (
        <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0a0f1a]/80 backdrop-blur border-b border-white/5 no-print">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-cyan-400" />
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              FUEL PLANNER
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isSupabaseConfigured() && (
              <>
                {user ? (
                  <>
                    <button
                      onClick={() => setShowPlans(true)}
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
                      <LogOut size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <User size={13} />
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </nav>
      )}

      <div className={showNav ? 'pt-12' : ''}>
        <AnimatePresence mode="wait">
          {plan === null ? (
            <WizardShell
              key="wizard"
              state={wizardState}
              onChange={updateState}
              onComplete={handleComplete}
            />
          ) : (
            <ResultsShell
              key="results"
              state={wizardState}
              plan={plan}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setShowAuth(false)}
      />

      <MyPlans
        isOpen={showPlans}
        onClose={() => setShowPlans(false)}
        onLoadPlan={handleLoadPlan}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
