import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import StepTransition from './StepTransition';
import Step01_SportType from './steps/Step01_SportType';
import Step02_RaceType from './steps/Step02_RaceType';
import Step03_RaceSelector from './steps/Step03_RaceSelector';
import Step04_Intensity from './steps/Step04_Intensity';
import Step05_Conditions from './steps/Step05_Conditions';
import Step03_RaceDetails from './steps/Step03_RaceDetails';
import Step06_SweatRate from './steps/Step06_SweatRate';
import Step07_Saltiness from './steps/Step07_Saltiness';
import Step08_GutTolerance from './steps/Step08_GutTolerance';
import Step09_AthleteProfile from './steps/Step09_AthleteProfile';
import Step10_BrandSelector from './steps/Step10_BrandSelector';
import type { WizardState } from '../types';

// Order: sport → distance → race/generic → conditions → splits → intensity → sweat → sodium → gut → profile → fuel kit
const STEP_LABELS = [
  'Sport', 'Distance', 'Race', 'Conditions', 'Splits', 'Intensity',
  'Sweat', 'Sodium', 'Gut', 'Profile', 'Fuel Kit',
];

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onComplete: () => void;
  onHome: () => void;
}

export default function WizardShell({ state, onChange, onComplete, onHome }: Props) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const totalSteps = STEP_LABELS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const next = () => {
    if (step < totalSteps - 1) {
      setDirection('forward');
      setStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const back = () => {
    if (step > 0) {
      setDirection('back');
      setStep(s => s - 1);
    }
  };

  const stepProps = { state, onChange, onNext: next, onBack: back };

  const stepComponents = [
    <Step01_SportType {...stepProps} />,          // 0 — Sport
    <Step02_RaceType {...stepProps} />,           // 1 — Distance
    <Step03_RaceSelector {...stepProps} />,       // 2 — Race or generic (NEW)
    <Step05_Conditions {...stepProps} />,         // 3 — Conditions / weather
    <Step03_RaceDetails {...stepProps} />,        // 4 — Splits
    <Step04_Intensity {...stepProps} />,          // 5 — Intensity
    <Step06_SweatRate {...stepProps} />,          // 6 — Sweat rate
    <Step07_Saltiness {...stepProps} />,          // 7 — Sodium / saltiness
    <Step08_GutTolerance {...stepProps} />,       // 8 — Gut tolerance
    <Step09_AthleteProfile {...stepProps} />,     // 9 — Athlete profile
    <Step10_BrandSelector {...stepProps} />,      // 10 — Fuel kit (final)
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-30 h-0.5 bg-white/5">
        <div
          className="h-full bg-cyan-400 transition-all duration-500"
          style={{ width: `${progress}%`, boxShadow: '0 0 8px #00d4ff' }}
        />
      </div>

      {/* Step counter */}
      <div className="fixed top-4 right-4 z-30">
        <span className="text-slate-500 text-xs font-mono">{step + 1}/{totalSteps}</span>
      </div>

      {/* Home + step name */}
      <div className="fixed top-2 left-4 z-30 flex items-center gap-2">
        <button
          onClick={onHome}
          className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
        >
          ← Home
        </button>
        <span className="text-slate-700 text-xs">·</span>
        <span className="text-slate-500 text-xs uppercase tracking-widest">{STEP_LABELS[step]}</span>
      </div>

      <div className="flex-1 overflow-hidden pt-12">
        <AnimatePresence mode="wait" custom={direction}>
          <StepTransition key={step} direction={direction} stepKey={step}>
            {stepComponents[step]}
          </StepTransition>
        </AnimatePresence>
      </div>
    </div>
  );
}
