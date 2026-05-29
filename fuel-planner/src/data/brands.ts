import type { FuelBrand, Product } from '../types';

export const BRAND_INFO: Record<FuelBrand, { label: string; tagline: string; strategy: string }> = {
  maurten: {
    label: 'Maurten',
    tagline: 'Hydrogel Technology',
    strategy: 'Hydrogel technology encapsulates carbs for easy gut absorption. Minimal flavour, science-backed. Trusted by elite athletes.',
  },
  sis: {
    label: 'SiS Science in Sport',
    tagline: 'Isotonic Gels',
    strategy: 'Isotonic gels need no water to absorb. Wide product range covering all race distances with clear dosing.',
  },
  high5: {
    label: 'High5',
    tagline: 'Great value, great taste',
    strategy: 'Excellent value with high-quality formulations. Wide flavour range makes race-day nutrition more enjoyable.',
  },
  tailwind: {
    label: 'Tailwind',
    tagline: 'Everything in one bottle',
    strategy: 'All-in-one drink strategy — carbs, electrolytes, and calories in your bottle. No gels needed.',
  },
  veloforte: {
    label: 'Veloforte',
    tagline: 'Real food ingredients',
    strategy: 'Natural, real-food ingredients with no artificial additives. Bars and chews for athletes who prefer solid food.',
  },
  generic: {
    label: 'Generic / No Preference',
    tagline: 'Brand-agnostic targets',
    strategy: 'Get abstract g/h targets and use any products that meet those numbers.',
  },
};

export const PRODUCTS: Record<FuelBrand, Product[]> = {
  maurten: [
    { id: 'maurten_gel100', name: 'Maurten Gel 100', carbsG: 25, sodiumMg: 55, fluidMl: 40, type: 'gel', canUseOnSwim: false, canUseOnRun: true, caffeinated: false },
    { id: 'maurten_gel160', name: 'Maurten Gel 160', carbsG: 40, sodiumMg: 55, fluidMl: 64, type: 'gel', canUseOnSwim: false, canUseOnRun: true, caffeinated: false },
    { id: 'maurten_gel100_caf', name: 'Maurten Gel 100 CAF 100', carbsG: 25, sodiumMg: 55, fluidMl: 40, type: 'gel', canUseOnSwim: false, canUseOnRun: true, caffeinated: true },
    { id: 'maurten_drink160', name: 'Maurten Drink Mix 160', carbsG: 40, sodiumMg: 80, fluidMl: 500, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'maurten_drink320', name: 'Maurten Drink Mix 320', carbsG: 80, sodiumMg: 80, fluidMl: 500, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
  sis: [
    { id: 'sis_go_gel', name: 'SiS Go Isotonic Gel', carbsG: 22, sodiumMg: 30, fluidMl: 60, type: 'gel', canUseOnSwim: false, canUseOnRun: true, caffeinated: false },
    { id: 'sis_go_caf', name: 'SiS Go Caffeine Gel', carbsG: 22, sodiumMg: 30, fluidMl: 60, type: 'gel', canUseOnSwim: false, canUseOnRun: true, caffeinated: true },
    { id: 'sis_beta_fuel_gel', name: 'SiS Beta Fuel Gel', carbsG: 40, sodiumMg: 55, fluidMl: 60, type: 'gel', canUseOnSwim: false, canUseOnRun: true, caffeinated: false },
    { id: 'sis_go_bar', name: 'SiS Go Energy Bar', carbsG: 46, sodiumMg: 70, fluidMl: 0, type: 'bar', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'sis_go_hydro', name: 'SiS Go Hydro Tab', carbsG: 0, sodiumMg: 360, fluidMl: 500, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
  high5: [
    { id: 'high5_gel', name: 'High5 Energy Gel', carbsG: 23, sodiumMg: 20, fluidMl: 40, type: 'gel', canUseOnSwim: false, canUseOnRun: true, caffeinated: false },
    { id: 'high5_caf_gel', name: 'High5 Caffeine Gel', carbsG: 23, sodiumMg: 20, fluidMl: 40, type: 'gel', canUseOnSwim: false, canUseOnRun: true, caffeinated: true },
    { id: 'high5_isogel', name: 'High5 IsoGel', carbsG: 23, sodiumMg: 40, fluidMl: 60, type: 'gel', canUseOnSwim: false, canUseOnRun: true, caffeinated: false },
    { id: 'high5_energy_drink', name: 'High5 Energy Drink', carbsG: 47, sodiumMg: 50, fluidMl: 500, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'high5_zero', name: 'High5 Zero Tab', carbsG: 0, sodiumMg: 280, fluidMl: 500, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
  tailwind: [
    { id: 'tailwind_2scoop', name: 'Tailwind Endurance (2 scoops)', carbsG: 50, sodiumMg: 310, fluidMl: 700, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'tailwind_3scoop', name: 'Tailwind Endurance (3 scoops)', carbsG: 75, sodiumMg: 465, fluidMl: 700, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
  veloforte: [
    { id: 'veloforte_classico', name: 'Veloforte Classico Bar', carbsG: 26, sodiumMg: 30, fluidMl: 0, type: 'bar', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'veloforte_doppio', name: 'Veloforte Doppio Bar', carbsG: 26, sodiumMg: 30, fluidMl: 0, type: 'bar', canUseOnSwim: false, canUseOnRun: false, caffeinated: true },
    { id: 'veloforte_forza', name: 'Veloforte Forza Chews', carbsG: 20, sodiumMg: 45, fluidMl: 0, type: 'chew', canUseOnSwim: false, canUseOnRun: true, caffeinated: false },
    { id: 'veloforte_aqua', name: 'Veloforte Aqua Tab', carbsG: 0, sodiumMg: 320, fluidMl: 500, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
  generic: [
    { id: 'generic_gel', name: 'Energy Gel (≈25g carb)', carbsG: 25, sodiumMg: 30, fluidMl: 40, type: 'gel', canUseOnSwim: false, canUseOnRun: true, caffeinated: false },
    { id: 'generic_caf_gel', name: 'Caffeine Gel (≈25g carb)', carbsG: 25, sodiumMg: 30, fluidMl: 40, type: 'gel', canUseOnSwim: false, canUseOnRun: true, caffeinated: true },
    { id: 'generic_bar', name: 'Energy Bar (≈40g carb)', carbsG: 40, sodiumMg: 50, fluidMl: 0, type: 'bar', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'generic_drink', name: 'Sports Drink (500ml bottle)', carbsG: 30, sodiumMg: 200, fluidMl: 500, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'generic_electrolyte', name: 'Electrolyte Tab', carbsG: 0, sodiumMg: 300, fluidMl: 500, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
};
