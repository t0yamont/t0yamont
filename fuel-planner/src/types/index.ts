export type Sport = 'triathlon' | 'cycling' | 'running';
export type RaceDistance = 'sprint' | 'olympic' | '70.3' | 'full' | 'crit' | 'gran_fondo' | 'century' | 'ultra' | '10k' | 'half_marathon' | 'marathon' | 'ultra_run';
export type IntensityLevel = 'finish' | 'moderate' | 'limit';
export type SweatRate = 'light' | 'moderate' | 'heavy' | 'very_heavy';
export type Saltiness = 'low' | 'moderate' | 'high' | 'very_high';
export type GutTolerance = 'iron' | 'normal' | 'sensitive';
export type CrampFrequency = 'never' | 'rarely' | 'sometimes' | 'often';
export type Sex = 'male' | 'female' | 'prefer_not';
export type FuelBrand = 'maurten' | 'sis' | 'high5' | 'tailwind' | 'veloforte' | 'generic';

export interface SplitTimes {
  swimMins: number;
  bikeMins: number;
  runMins: number;
}

export interface AthleteProfile {
  weightKg: number;
  age: number;
  sex: Sex;
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
  brand: FuelBrand | null;
  raceDate: string | null;
  location: { name: string; lat: number; lon: number } | null;
  weatherAuto: boolean;
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
  type: 'gel' | 'chew' | 'drink' | 'bar' | 'capsule';
  canUseOnSwim: boolean;
  canUseOnRun: boolean;
  caffeinated: boolean;
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
