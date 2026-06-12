export type Sport = 'triathlon' | 'cycling' | 'running';
export type AidItem = 'water' | 'carb_drink' | 'gel' | 'cola' | 'fruit' | 'bar' | 'ice';

export interface AidStation {
  km: number;           // distance from race start on that segment
  segment: 'bike' | 'run';
  has: AidItem[];
}

export interface Race {
  id: string;
  name: string;
  series?: string;              // 'IRONMAN', 'IRONMAN 70.3', 'World Marathon Majors', etc.
  sport: Sport;
  distance: RaceDistance;
  region: string;               // 'Europe', 'Americas', 'Asia-Pacific', 'Middle East', 'Africa'
  city: string;
  country: string;
  location: { lat: number; lon: number };
  typicalMonth: number;         // 1–12, used for weather default when no date set
  sponsorRestricted: boolean;   // true for IRONMAN — only official sponsor brands available on course
  allowedBrands?: FuelBrand[];
  aidStations: AidStation[];    // empty = generic / unknown
}
export type RaceDistance = 'sprint' | 'olympic' | '70.3' | 'full' | 'crit' | 'gran_fondo' | 'century' | 'ultra' | '10k' | 'half_marathon' | 'marathon' | 'ultra_run';
export type IntensityLevel = 'finish' | 'moderate' | 'limit';
export type SweatRate = 'light' | 'moderate' | 'heavy' | 'very_heavy';
export type Saltiness = 'low' | 'moderate' | 'high' | 'very_high';
export type GutTolerance = 'iron' | 'normal' | 'sensitive';
export type CrampFrequency = 'never' | 'rarely' | 'sometimes' | 'often';
export type Sex = 'male' | 'female' | 'prefer_not';
export type FuelBrand = 'maurten' | 'sis' | 'high5' | 'tailwind' | 'veloforte' | 'precision' | 'custom' | 'generic';
export type ProductType = 'gel' | 'chew' | 'drink' | 'bar' | 'capsule';

export interface FuelKit {
  primaryGelId: string;       // required — main race gel
  cafGelId: string | null;    // optional — any caffeinated product from any brand
  drinkId: string | null;     // optional — hydration/carb drink
  solidId: string | null;     // optional — bar or chew
}

export interface SplitTimes {
  swimMins: number;
  bikeMins: number;
  runMins: number;
}

// Bottle sizes offered for pack-list math (Change 1)
export type BottleSizeMl = 500 | 600 | 750;

export interface AthleteProfile {
  weightKg: number;
  age: number;
  sex: Sex;
  bottleSizeMl: BottleSizeMl;   // used only for pack-list bottle derivation
}

export interface WizardState {
  sport: Sport | null;
  raceDistance: RaceDistance | null;
  splitTimes: SplitTimes;
  intensity: IntensityLevel | null;
  tempCelsius: number;
  humidity: 'low' | 'moderate' | 'high';
  sweatRate: SweatRate | null;
  saltiness: Saltiness | null;
  crampFrequency: CrampFrequency | null;
  gutTolerance: GutTolerance | null;
  athlete: AthleteProfile;
  fuelKit: FuelKit;
  brand: FuelBrand | null;
  customProducts: Product[];
  highCarbAdvanced: boolean;
  raceDate: string | null;
  location: { name: string; lat: number; lon: number } | null;
  weatherAuto: boolean;
  // v4 additions
  selectedRace: Race | null;           // null = generic / race not listed
  raceMode: 'event' | 'generic';
  gelDrinkSplit: number;               // 0–100; default 60 (% carbs from gel/solid)
  planStyle: 'precise' | 'relaxed';   // results display preference
}

export interface SegmentPlan {
  segment: 'pre_race' | 'swim' | 't1' | 'bike' | 't2' | 'run';
  durationMins: number;
  carbsGPerHour: number;
  fluidMlPerHour: number;
  sodiumMgPerHour: number;
  notes: string[];
}

export interface ProductItem {
  time: string;
  segment: string;
  product: string;
  quantity: number;
  carbs: number;
  sodium: number;
  fluid: number;
  caffeineMg?: number;
  note?: string;
  isCaffeine?: boolean;
  // Pack-list metadata (Change 1) — lets the pack list reconcile with the timeline
  productType?: ProductType;
  servingVolumeMl?: number;   // for drinks: volume one serving is mixed into
  servingsPerContainer?: number;
}

// ─── Pack list (Change 1) ───────────────────────────────────────────────────
export interface PackItem {
  product: string;
  productType: ProductType;
  count: number;              // total servings / units across the grouping
  carbs: number;              // total carbs from this product
  sodium: number;             // total sodium from this product
  fluid: number;              // total fluid volume from this product
  caffeineMg: number;
  isCaffeine: boolean;
  bottles?: number;           // derived for drink products
  servingVolumeMl?: number;
  servingsPerContainer?: number;
}

export interface PackList {
  total: PackItem[];
  byLeg: Array<{ leg: string; items: PackItem[] }>;
  totals: { carbsG: number; sodiumMg: number; fluidMl: number; caffeineMg: number };
  spareGels: { low: number; high: number };   // +1 contingency suggestion
  bottleSizeMl: number;
}

export interface NutritionPlan {
  segments: SegmentPlan[];
  timeline: ProductItem[];
  preRace: {
    nightBefore: string[];
    raceMorning: string[];
    warmUp: string[];
  };
  totals: {
    carbsG: number;
    fluidMl: number;
    sodiumMg: number;
    avgCarbsPerHour: number;
    avgFluidPerHour: number;
    avgSodiumPerHour: number;
  };
  insights: {
    estimatedSweatRateMlH: number;
    recommendedFluidMlH: number;
    plannedCaffeineMg: number;
    plannedCaffeineMgPerKg: number;
    caffeineFlag: 'low' | 'ok' | 'high' | null;
    needsMixedCarb: boolean;
    mixedCarbNotice: string | null;
    carbCeiling: number;          // the g/h cap applied for this plan (Change 4)
    highCarbActive: boolean;      // advanced high-carb band in effect
  };
}

export interface Product {
  id: string;
  name: string;
  carbsG: number;
  sodiumMg: number;
  fluidMl: number;
  caffeineMg: number;
  mixedCarb: boolean;
  type: ProductType;
  canUseOnSwim: boolean;
  canUseOnRun: boolean;
  caffeinated: boolean;
  servingsPerContainer?: number;  // optional — for pack-list shopping math
  isCustom?: boolean;             // user-defined library product (Change 2)
}

export interface SavedPlan {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  sport: Sport;
  wizard_state: WizardState;
  computed: NutritionPlan | null;
}

export interface PostRaceLogActualItem {
  product: string;
  planned: number;
  actual: number;
  carbsPerUnit: number;
  sodiumPerUnit: number;
  caffeinePerUnit: number;
}

export interface PostRaceLogEntry {
  id: string;
  plan_id: string;
  user_id: string;
  actual_splits: {
    swimMins?: number;
    bikeMins?: number;
    runMins?: number;
  };
  actual_items: PostRaceLogActualItem[];
  notes: string;
  created_at: string;
}
