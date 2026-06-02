import type { FuelBrand, Product } from '../types';

export const BRAND_INFO: Record<FuelBrand, { label: string; tagline: string; strategy: string; color: string }> = {
  maurten:  { label: 'Maurten',               tagline: 'Hydrogel Technology',      color: '#e8e0c0', strategy: 'Hydrogel technology — easy on the gut, near-zero flavour, preferred by elites.' },
  sis:      { label: 'SiS Science in Sport',  tagline: 'Isotonic Gels',            color: '#ff6600', strategy: 'Isotonic gels need no water to absorb. Beta Fuel line supports high carb intakes.' },
  high5:    { label: 'High5',                 tagline: 'Great value, great taste',  color: '#ff0066', strategy: 'Excellent value, wide flavour range and a complete product lineup.' },
  tailwind: { label: 'Tailwind',              tagline: 'Everything in one bottle',  color: '#00bfff', strategy: 'All-in-one drink strategy — carbs, electrolytes and calories in the bottle.' },
  veloforte:{ label: 'Veloforte',             tagline: 'Real food ingredients',     color: '#d97706', strategy: 'Natural, real-food bars and chews. Ideal for athletes who prefer solid food.' },
  generic:  { label: 'Generic',               tagline: 'Any brand',                 color: '#94a3b8', strategy: 'Use any products that hit the g/h targets.' },
};

// mixedCarb: true = glucose:fructose or maltodextrin:fructose blend (needed above 60 g/h)
// caffeineMg: actual caffeine per serving in mg
export const PRODUCTS: Record<FuelBrand, Product[]> = {
  maurten: [
    { id: 'maurten_gel100',     name: 'Maurten Gel 100',         carbsG: 25, sodiumMg: 55,  fluidMl: 40,  caffeineMg: 0,   mixedCarb: true,  type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: false },
    { id: 'maurten_gel160',     name: 'Maurten Gel 160',         carbsG: 40, sodiumMg: 55,  fluidMl: 64,  caffeineMg: 0,   mixedCarb: true,  type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: false },
    { id: 'maurten_gel100_caf', name: 'Maurten Gel 100 CAF 100', carbsG: 25, sodiumMg: 55,  fluidMl: 40,  caffeineMg: 100, mixedCarb: true,  type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: true  },
    { id: 'maurten_drink160',   name: 'Maurten Drink Mix 160',   carbsG: 40, sodiumMg: 80,  fluidMl: 500, caffeineMg: 0,   mixedCarb: true,  type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'maurten_drink320',   name: 'Maurten Drink Mix 320',   carbsG: 80, sodiumMg: 80,  fluidMl: 500, caffeineMg: 0,   mixedCarb: true,  type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
  sis: [
    { id: 'sis_go_gel',         name: 'SiS Go Isotonic Gel',     carbsG: 22, sodiumMg: 30,  fluidMl: 60,  caffeineMg: 0,   mixedCarb: false, type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: false },
    { id: 'sis_go_caf',         name: 'SiS Go Caffeine Gel',     carbsG: 22, sodiumMg: 30,  fluidMl: 60,  caffeineMg: 75,  mixedCarb: false, type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: true  },
    { id: 'sis_beta_fuel_gel',  name: 'SiS Beta Fuel Gel',       carbsG: 40, sodiumMg: 55,  fluidMl: 60,  caffeineMg: 0,   mixedCarb: true,  type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: false },
    { id: 'sis_beta_fuel_caf',  name: 'SiS Beta Fuel Gel CAF',   carbsG: 40, sodiumMg: 55,  fluidMl: 60,  caffeineMg: 150, mixedCarb: true,  type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: true  },
    { id: 'sis_go_bar',         name: 'SiS Go Energy Bar',       carbsG: 46, sodiumMg: 70,  fluidMl: 0,   caffeineMg: 0,   mixedCarb: false, type: 'bar',   canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'sis_go_hydro',       name: 'SiS Go Hydro Tab',        carbsG: 0,  sodiumMg: 360, fluidMl: 500, caffeineMg: 0,   mixedCarb: false, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
  high5: [
    { id: 'high5_gel',          name: 'High5 Energy Gel',        carbsG: 23, sodiumMg: 20,  fluidMl: 40,  caffeineMg: 0,   mixedCarb: false, type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: false },
    { id: 'high5_caf_gel',      name: 'High5 Caffeine Gel',      carbsG: 23, sodiumMg: 20,  fluidMl: 40,  caffeineMg: 30,  mixedCarb: false, type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: true  },
    { id: 'high5_isogel',       name: 'High5 IsoGel',            carbsG: 23, sodiumMg: 40,  fluidMl: 60,  caffeineMg: 0,   mixedCarb: false, type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: false },
    { id: 'high5_energy_drink', name: 'High5 Energy Drink',      carbsG: 47, sodiumMg: 50,  fluidMl: 500, caffeineMg: 0,   mixedCarb: true,  type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'high5_zero',         name: 'High5 Zero Tab',          carbsG: 0,  sodiumMg: 280, fluidMl: 500, caffeineMg: 0,   mixedCarb: false, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
  tailwind: [
    { id: 'tailwind_2scoop',    name: 'Tailwind Endurance (2 scoops)', carbsG: 50, sodiumMg: 310, fluidMl: 700, caffeineMg: 0, mixedCarb: true, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'tailwind_3scoop',    name: 'Tailwind Endurance (3 scoops)', carbsG: 75, sodiumMg: 465, fluidMl: 700, caffeineMg: 0, mixedCarb: true, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
  veloforte: [
    { id: 'veloforte_classico', name: 'Veloforte Classico Bar',  carbsG: 26, sodiumMg: 30,  fluidMl: 0,   caffeineMg: 0,  mixedCarb: false, type: 'bar',   canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'veloforte_doppio',   name: 'Veloforte Doppio Bar',    carbsG: 26, sodiumMg: 30,  fluidMl: 0,   caffeineMg: 40, mixedCarb: false, type: 'bar',   canUseOnSwim: false, canUseOnRun: false, caffeinated: true  },
    { id: 'veloforte_forza',    name: 'Veloforte Forza Chews',   carbsG: 20, sodiumMg: 45,  fluidMl: 0,   caffeineMg: 0,  mixedCarb: false, type: 'chew',  canUseOnSwim: false, canUseOnRun: true,  caffeinated: false },
    { id: 'veloforte_aqua',     name: 'Veloforte Aqua Tab',      carbsG: 0,  sodiumMg: 320, fluidMl: 500, caffeineMg: 0,  mixedCarb: false, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
  generic: [
    { id: 'generic_gel',         name: 'Energy Gel (≈25g carb)',      carbsG: 25, sodiumMg: 30,  fluidMl: 40,  caffeineMg: 0,  mixedCarb: false, type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: false },
    { id: 'generic_caf_gel',     name: 'Caffeine Gel (≈25g carb)',    carbsG: 25, sodiumMg: 30,  fluidMl: 40,  caffeineMg: 75, mixedCarb: false, type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: true  },
    { id: 'generic_bar',         name: 'Energy Bar (≈45g carb)',      carbsG: 45, sodiumMg: 50,  fluidMl: 0,   caffeineMg: 0,  mixedCarb: false, type: 'bar',   canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'generic_drink',       name: 'Sports Drink (500ml)',        carbsG: 30, sodiumMg: 200, fluidMl: 500, caffeineMg: 0,  mixedCarb: false, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'generic_electrolyte', name: 'Electrolyte Tab',             carbsG: 0,  sodiumMg: 300, fluidMl: 500, caffeineMg: 0,  mixedCarb: false, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
};

export function getProductById(id: string): Product | null {
  for (const products of Object.values(PRODUCTS)) {
    const found = products.find(p => p.id === id);
    if (found) return found;
  }
  return null;
}

export function getAllProductsFlat(): Array<Product & { brandId: FuelBrand; brandLabel: string; brandColor: string }> {
  return (Object.entries(PRODUCTS) as [FuelBrand, Product[]][]).flatMap(([brandId, products]) =>
    products.map(p => ({
      ...p,
      brandId,
      brandLabel: BRAND_INFO[brandId].label,
      brandColor: BRAND_INFO[brandId].color,
    }))
  );
}

/** Returns a FuelKit pre-filled from a single brand's products. */
export function kitFromBrand(brandId: FuelBrand): import('../types').FuelKit {
  const prods = PRODUCTS[brandId];
  return {
    primaryGelId: prods.find(p => (p.type === 'gel' || p.type === 'chew') && !p.caffeinated)?.id ?? 'generic_gel',
    cafGelId:     prods.find(p => p.caffeinated)?.id ?? null,
    drinkId:      prods.find(p => p.type === 'drink')?.id ?? null,
    solidId:      prods.find(p => (p.type === 'bar' || p.type === 'chew') && !p.caffeinated)?.id ?? null,
  };
}
