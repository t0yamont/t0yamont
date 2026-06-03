import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './auth/AuthProvider';
import WizardShell from './components/WizardShell';
import ResultsShell from './components/results/ResultsShell';
import AuthModal from './components/AuthModal';
import MyPlans from './plans/MyPlans';
import HomePage from './pages/HomePage';
import { computePlan } from './data/calculations';
import type { WizardState, NutritionPlan } from './types';

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
  athlete: { weightKg: 70, age: 30, sex: 'prefer_not', bottleSizeMl: 750 },
  fuelKit: { primaryGelId: 'generic_gel', cafGelId: null, drinkId: null, solidId: null },
  brand: null,
  customProducts: [],
  highCarbAdvanced: false,
  raceDate: null,
  location: null,
  weatherAuto: false,
  // v4
  selectedRace: null,
  raceMode: 'generic',
  gelDrinkSplit: 60,
  planStyle: 'relaxed',
};

function AppInner() {
  const [wizardState, setWizardState] = useState<WizardState>(DEFAULT_STATE);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [showHome, setShowHome] = useState(true);
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
    setShowHome(true);
  };

  const handleLoadPlan = (state: WizardState) => {
    setWizardState(state);
    const computed = computePlan(state);
    setPlan(computed);
    setShowHome(false);
  };

  const handleStart = () => {
    setShowHome(false);
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {showHome ? (
          <HomePage
            key="home"
            onStart={handleStart}
            onShowAuth={() => setShowAuth(true)}
            onShowPlans={() => setShowPlans(true)}
          />
        ) : plan === null ? (
          <WizardShell
            key="wizard"
            state={wizardState}
            onChange={updateState}
            onComplete={handleComplete}
            onHome={() => setShowHome(true)}
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
