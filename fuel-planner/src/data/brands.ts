import type { FuelBrand, Product, FuelKit } from '../types';

export const BRAND_INFO: Record<FuelBrand, { label: string; tagline: string; strategy: string; color: string; drinkOnly: boolean }> = {
  maurten:  { label: 'Maurten',               tagline: 'Hydrogel Technology',      color: '#e8e0c0', drinkOnly: false, strategy: 'Hydrogel technology — easy on the gut, near-zero flavour, preferred by elites.' },
  sis:      { label: 'SiS Science in Sport',  tagline: 'Isotonic Gels',            color: '#ff6600', drinkOnly: false, strategy: 'Isotonic gels need no water to absorb. Beta Fuel line supports high carb intakes.' },
  high5:    { label: 'High5',                 tagline: 'Great value, great taste',  color: '#ff0066', drinkOnly: false, strategy: 'Excellent value, wide flavour range and a complete product lineup.' },
  tailwind: { label: 'Tailwind',              tagline: 'Everything in one bottle',  color: '#00bfff', drinkOnly: true,  strategy: 'All-in-one drink strategy — carbs, electrolytes and calories in the bottle.' },
  veloforte:{ label: 'Veloforte',             tagline: 'Real food ingredients',     color: '#d97706', drinkOnly: false, strategy: 'Natural, real-food bars and chews. Ideal for athletes who prefer solid food.' },
  precision:{ label: 'Precision Fuel & Hydration', tagline: 'Official IRONMAN partner', color: '#0ea5e9', drinkOnly: false, strategy: 'Precision Fuel & Hydration — official IRONMAN partner. Splits carbs and electrolytes so you dial each independently. 2:1 glucose:fructose fuel.' },
  custom:   { label: 'My Products',           tagline: 'Your own fuel library',     color: '#a78bfa', drinkOnly: false, strategy: 'Your custom-defined products — modelled exactly like a brand catalogue.' },
  generic:  { label: 'Generic',               tagline: 'Any brand',                 color: '#94a3b8', drinkOnly: false, strategy: 'Use any products that hit the g/h targets.' },
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
  // Precision Fuel & Hydration — fuel (carbs) and hydration (sodium) are deliberately separated.
  // All fuel products are 2:1 glucose:fructose → mixedCarb true. Sodium comes from the PH range.
  // NOTE: VERIFY sodium and caffeine against current packs before relying on these numbers.
  precision: [
    // Fuel (carb) products — essentially sodium-free
    { id: 'pf_30_gel',      name: 'PF 30 Gel',                carbsG: 30, sodiumMg: 0,   fluidMl: 0,   caffeineMg: 0,   mixedCarb: true,  type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: false },
    { id: 'pf_30_chews',    name: 'PF 30 Chews',              carbsG: 30, sodiumMg: 0,   fluidMl: 0,   caffeineMg: 0,   mixedCarb: true,  type: 'chew',  canUseOnSwim: false, canUseOnRun: true,  caffeinated: false },
    { id: 'pf_30_drink',    name: 'PF 30 Drink Mix',          carbsG: 30, sodiumMg: 0,   fluidMl: 500, caffeineMg: 0,   mixedCarb: true,  type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false }, // VERIFY: low sodium
    { id: 'pf_90_gel',      name: 'PF 90 Gel',                carbsG: 90, sodiumMg: 0,   fluidMl: 0,   caffeineMg: 0,   mixedCarb: true,  type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: false }, // confirmed 90g / 0mg sodium / 153g pack
    { id: 'pf_30_caf_gel',  name: 'PF 30 Caffeine Gel',       carbsG: 30, sodiumMg: 0,   fluidMl: 0,   caffeineMg: 100, mixedCarb: true,  type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: true  }, // VERIFY caffeine mg
    // Hydration (electrolyte) products — sodium is the point
    { id: 'ph_1000',        name: 'PH 1000 (500ml)',          carbsG: 0,  sodiumMg: 500, fluidMl: 500, caffeineMg: 0,   mixedCarb: false, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false }, // VERIFY 1000 mg/L
    { id: 'ph_1500',        name: 'PH 1500 (500ml)',          carbsG: 0,  sodiumMg: 750, fluidMl: 500, caffeineMg: 0,   mixedCarb: false, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false }, // confirmed 1500 mg/L
    { id: 'pf_carb_elec',   name: 'Carb & Electrolyte Mix (500ml)', carbsG: 30, sodiumMg: 500, fluidMl: 500, caffeineMg: 0, mixedCarb: true, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false }, // 60g carb + 1000mg Na per litre
  ],
  // Custom products live in WizardState.customProducts and are injected at runtime.
  custom: [],
  generic: [
    { id: 'generic_gel',         name: 'Energy Gel (≈25g carb)',      carbsG: 25, sodiumMg: 30,  fluidMl: 40,  caffeineMg: 0,  mixedCarb: false, type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: false },
    { id: 'generic_caf_gel',     name: 'Caffeine Gel (≈25g carb)',    carbsG: 25, sodiumMg: 30,  fluidMl: 40,  caffeineMg: 75, mixedCarb: false, type: 'gel',   canUseOnSwim: false, canUseOnRun: true,  caffeinated: true  },
    { id: 'generic_bar',         name: 'Energy Bar (≈45g carb)',      carbsG: 45, sodiumMg: 50,  fluidMl: 0,   caffeineMg: 0,  mixedCarb: false, type: 'bar',   canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'generic_drink',       name: 'Sports Drink (500ml)',        carbsG: 30, sodiumMg: 200, fluidMl: 500, caffeineMg: 0,  mixedCarb: false, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
    { id: 'generic_electrolyte', name: 'Electrolyte Tab',             carbsG: 0,  sodiumMg: 300, fluidMl: 500, caffeineMg: 0,  mixedCarb: false, type: 'drink', canUseOnSwim: false, canUseOnRun: false, caffeinated: false },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// TODO: add brand — leave numbers blank / VERIFY for whoever fills them in.
// Each needs an entry in BRAND_INFO + the FuelBrand union + a PRODUCTS array.
//   • Gu            — gels, chews, drink (Roctane line is mixedCarb)        // VERIFY
//   • Naak          — bars, gels, ultra energy drink mix                    // VERIFY
//   • Never Second  — C30/C90 gels (2:1 ratio), drink mixes                 // VERIFY
//   • Mountain Fuel — Jelly/gels, Xtreme energy fuel drink                  // VERIFY
//   • Styrkr        — MIX90 / DUAL90 high-carb mixes, gels                  // VERIFY
// ─────────────────────────────────────────────────────────────────────────────

/** Look up a product by id across all brand catalogues, then an optional custom list. */
export function getProductById(id: string, custom: Product[] = []): Product | null {
  for (const products of Object.values(PRODUCTS)) {
    const found = products.find(p => p.id === id);
    if (found) return found;
  }
  return custom.find(p => p.id === id) ?? null;
}

/** Flatten all brand products (plus any custom products) with brand display metadata. */
export function getAllProductsFlat(
  custom: Product[] = [],
): Array<Product & { brandId: FuelBrand; brandLabel: string; brandColor: string }> {
  const branded = (Object.entries(PRODUCTS) as [FuelBrand, Product[]][]).flatMap(([brandId, products]) =>
    products.map(p => ({
      ...p,
      brandId,
      brandLabel: BRAND_INFO[brandId].label,
      brandColor: BRAND_INFO[brandId].color,
    }))
  );
  const customFlat = custom.map(p => ({
    ...p,
    brandId: 'custom' as FuelBrand,
    brandLabel: BRAND_INFO.custom.label,
    brandColor: BRAND_INFO.custom.color,
  }));
  return [...branded, ...customFlat];
}

/** Returns a FuelKit pre-filled from a single brand's products. */
export function kitFromBrand(brandId: FuelBrand, custom: Product[] = []): FuelKit {
  const prods = brandId === 'custom' ? custom : PRODUCTS[brandId];
  return {
    primaryGelId: prods.find(p => (p.type === 'gel' || p.type === 'chew') && !p.caffeinated)?.id ?? 'generic_gel',
    cafGelId:     prods.find(p => p.caffeinated)?.id ?? null,
    // Prefer an electrolyte/sodium drink for the drink slot when the brand splits carbs from sodium.
    drinkId:      prods.find(p => p.type === 'drink' && p.sodiumMg > 0)?.id
               ?? prods.find(p => p.type === 'drink')?.id ?? null,
    solidId:      prods.find(p => (p.type === 'bar' || p.type === 'chew') && !p.caffeinated)?.id ?? null,
  };
}
