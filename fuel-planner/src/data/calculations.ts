import type { WizardState, NutritionPlan, SegmentPlan, ProductItem, Product } from '../types';
import { PRODUCTS } from './brands';

// ─── Tunable constants ────────────────────────────────────────────────────────

const CARB_BANDS: Record<string, { low: number; high: number }> = {
  finish:   { low: 50, high: 60 },
  moderate: { low: 60, high: 75 },
  limit:    { low: 75, high: 90 },
};

// 1A — substrate-oxidation multiplier applied after band positioning
const INTENSITY_CARB_MULT: Record<string, number> = {
  finish:   0.85,
  moderate: 1.0,
  limit:    1.1,
};

// 1B — sport bias shifts within-band position fraction
const SPORT_CARB_BIAS: Record<string, number> = {
  cycling:   0.15,
  running:  -0.15,
  triathlon: 0,
};

// 1C — gut tolerance carb modifier
const GUT_CARB = {
  sensitive:    -0.18,  // applied as × (1 + modifier)
  normal:        0,
  iron_ceiling:  1.08,  // iron gut raises ceiling only; does not force an increase
} as const;

// 2A — target partial sweat replacement
const FLUID_REPLACEMENT_FRACTION = 0.70;

// 2B — weight-step fluid adjustment (thresholds 60 and 85 kg)
const WEIGHT_STEP = {
  under60: -0.08,
  mid:      0,
  over85:  +0.08,
} as const;

// 2C — humidity multiplier (applied multiplicatively with heat)
const HUMIDITY_MULT: Record<string, number> = {
  low:      1.0,
  moderate: 1.05,
  high:     1.12,
};

// 2D — intestinal absorption ceiling
const FLUID_ABSORPTION_CEILING = 1400;

// 3A — revised cramp-associated sodium preference (not a deficiency treatment)
const CRAMP_SODIUM: Record<string, number> = {
  never:     0,
  rarely:    0,
  sometimes: 0.06,
  often:     0.12,
};

// 6A — caffeine dosage guidance
const CAFFEINE_MG_PER_KG_RANGE = [3, 6] as const;
const CAFFEINE_MAX_MG = 400;

// 1D — mixed-carb threshold
const MIXED_CARB_THRESHOLD = 60;

// Sweat-rate base values (ml/h) — unchanged from v1
const SWEAT_RATE_ML: Record<string, number> = {
  light:      500,
  moderate:   750,
  heavy:     1000,
  very_heavy: 1200,
};

// ─── Heat modifier (unchanged) ────────────────────────────────────────────────

function heatModifier(temp: number): number {
  if (temp < 15) return 0.85;
  if (temp <= 20) return 1.0;
  if (temp <= 25) return 1.15;
  if (temp <= 30) return 1.30;
  return 1.45;
}

// ─── Sodium concentration by saltiness (unchanged) ────────────────────────────

function sodiumPerLitre(saltiness: string): number {
  if (saltiness === 'low')       return  300;
  if (saltiness === 'moderate')  return  700;
  if (saltiness === 'high')      return 1000;
  return 1500; // very_high
}

// ─── 1A + 1B + 1C: carb target ───────────────────────────────────────────────
// Returns g/h for the primary fuelling segment.

function computeCarbTarget(
  intens: string,
  sport: string,
  totalHours: number,
  gut: string,
): number {
  const band = CARB_BANDS[intens] ?? CARB_BANDS.moderate;

  // 1B: blend of duration (capped), sport bias, intensity component
  const durationComponent = Math.min(1, totalHours / 6) * 0.5;
  const sportBias         = SPORT_CARB_BIAS[sport] ?? 0;
  const intensComponent   = intens === 'finish' ? -0.1 : intens === 'limit' ? 0.1 : 0;
  const posFraction       = Math.min(1, Math.max(0, durationComponent + sportBias + intensComponent));

  const rawCarb = band.low + (band.high - band.low) * posFraction;

  // 1A: apply intensity multiplier
  const multiplied = rawCarb * (INTENSITY_CARB_MULT[intens] ?? 1.0);

  // 1C: gut modifier
  if (gut === 'sensitive') {
    return multiplied * (1 + GUT_CARB.sensitive);
  }
  if (gut === 'iron') {
    // ceiling raised by 8%; target not forced up, only allowed to reach it
    const ceiling = band.high * GUT_CARB.iron_ceiling;
    return Math.min(multiplied, ceiling);
  }
  return multiplied;
}

// ─── 2A + 2B + 2C + 2D: fluid chain ─────────────────────────────────────────
// Returns both the estimated sweat rate and the recommended intake.

function computeFluid(
  sweat: string,
  temp: number,
  humidity: string,
  weightKg: number,
): { estimatedSweatRateMlH: number; recommendedFluidMlH: number } {
  const base      = SWEAT_RATE_ML[sweat] ?? SWEAT_RATE_ML.moderate;
  const heat      = heatModifier(temp);
  const hum       = HUMIDITY_MULT[humidity] ?? 1.0;
  const wAdj      = weightKg < 60 ? (1 + WEIGHT_STEP.under60)
                  : weightKg > 85 ? (1 + WEIGHT_STEP.over85)
                  : 1.0;

  // Full chain → estimatedSweatRate
  const estimated = base * heat * hum * wAdj;

  // 0.70 partial replacement → absorption ceiling
  const recommended = Math.min(estimated * FLUID_REPLACEMENT_FRACTION, FLUID_ABSORPTION_CEILING);

  return {
    estimatedSweatRateMlH:  Math.round(estimated  / 50) * 50,
    recommendedFluidMlH:    Math.round(recommended / 50) * 50,
  };
}

// ─── Main planner ─────────────────────────────────────────────────────────────

export function computePlan(state: WizardState): NutritionPlan {
  const { sport, splitTimes, intensity, tempCelsius, humidity,
          sweatRate, saltiness, crampFrequency, gutTolerance, athlete, brand } = state;

  const intens = intensity    ?? 'moderate';
  const gut    = gutTolerance ?? 'normal';
  const salt   = saltiness    ?? 'moderate';
  const cramp  = crampFrequency ?? 'never';
  const sweat  = sweatRate    ?? 'moderate';
  const sp     = sport        ?? 'triathlon';

  const isTri     = sp === 'triathlon';
  const isCycling = sp === 'cycling';

  const swimMins = isTri                          ? splitTimes.swimMins : 0;
  const bikeMins = (isTri || isCycling)           ? splitTimes.bikeMins : 0;
  const runMins  = (isTri || sp === 'running')    ? splitTimes.runMins  : 0;

  const totalRaceMins = swimMins + (isTri ? 5 : 0) + bikeMins + (isTri ? 2 : 0) + runMins;
  const totalHours    = totalRaceMins / 60;

  // ── Carb target ──────────────────────────────────────────────────────────
  const carbTarget = computeCarbTarget(intens, sp, totalHours, gut);
  const bikeCarb   = Math.round(carbTarget);
  // Run carb for triathlon: running sport bias already baked in for pure running;
  // for triathlon's run leg carry same bias implicitly but apply a minor reduction
  // from accumulated fatigue (legacy -5% for normal gut, -10% for sensitive).
  const runCarbRaw  = isTri
    ? carbTarget * (gut === 'sensitive' ? 0.90 : 0.95)
    : carbTarget;
  const runCarb = Math.round(runCarbRaw);

  // ── Fluid chain ──────────────────────────────────────────────────────────
  const { estimatedSweatRateMlH, recommendedFluidMlH } = computeFluid(
    sweat, tempCelsius, humidity, athlete.weightKg || 70,
  );

  const bikeFluid    = recommendedFluidMlH;
  const runFluidBase = isTri ? Math.round(recommendedFluidMlH * 0.85) : recommendedFluidMlH;
  // Round run fluid to nearest 50 as well
  const runFluid = Math.round(runFluidBase / 50) * 50;

  // ── Sodium ───────────────────────────────────────────────────────────────
  // 3A: cramp adjustment (preference / heavy-sweat association, not a fix)
  const crampAdj = 1 + (CRAMP_SODIUM[cramp] ?? 0);
  const sodiumPL = sodiumPerLitre(salt) * crampAdj;

  // Sodium scales with the fluid actually being replaced (3B stays correct automatically)
  const bikeSodium = Math.round(sodiumPL * (bikeFluid / 1000));
  const runSodium  = Math.round(sodiumPL * (runFluid  / 1000));

  // ── Mixed-carb flag ──────────────────────────────────────────────────────
  const needsMixedCarb = bikeCarb > MIXED_CARB_THRESHOLD || runCarb > MIXED_CARB_THRESHOLD;
  const brandProducts  = PRODUCTS[brand ?? 'generic'];
  const hasMixedProducts = brandProducts.some(
    p => p.mixedCarb && (p.type === 'gel' || p.type === 'drink' || p.type === 'chew'),
  );
  const mixedCarbNotice = needsMixedCarb && !hasMixedProducts
    ? `Your carb target (${Math.max(bikeCarb, runCarb)} g/h) exceeds 60 g/h. Single-source-glucose products plateau around 60 g/h of oxidation — choose a glucose:fructose product to absorb more.`
    : null;

  // ── Build segments ───────────────────────────────────────────────────────
  const segments: SegmentPlan[] = [];

  if (isTri) {
    segments.push({
      segment: 'pre_race',
      durationMins: 0,
      carbsGPerHour: 0,
      fluidMlPerHour: 0,
      sodiumMgPerHour: 0,
      notes: [
        'Carb-load the night before — see Pre-Race tab for details',
        'Pre-race meal 2–3h before start (1–3 g carb/kg)',
        'Sip 500ml electrolyte drink in the 60 min before swim start',
      ],
    });

    segments.push({
      segment: 'swim',
      durationMins: swimMins,
      carbsGPerHour: 0,
      fluidMlPerHour: 0,
      sodiumMgPerHour: 0,
      notes: [
        'No eating or drinking in water',
        'Pre-load carbs & fluid before the swim — not during',
        'Focus on pacing and breathing',
      ],
    });

    segments.push({
      segment: 't1',
      durationMins: 3,
      carbsGPerHour: 0,
      fluidMlPerHour: 0,
      sodiumMgPerHour: 0,
      notes: [
        'Take 1 gel + 150ml water immediately on exiting the swim',
        'Window of opportunity — every carb counts here',
        gut === 'sensitive'
          ? 'Try a chew instead of gel if gut is unsettled'
          : totalHours > 3 ? 'Caffeine gel here to prime the ride' : 'Plain gel; save caffeine for later',
      ],
    });
  }

  if (bikeMins > 0) {
    segments.push({
      segment: 'bike',
      durationMins: bikeMins,
      carbsGPerHour: bikeCarb,
      fluidMlPerHour: bikeFluid,
      sodiumMgPerHour: bikeSodium,
      notes: [
        `Target ${bikeCarb} g carb/h — front-load in the first 30 min`,
        `${bikeFluid} ml/h fluid (≈70% sweat replacement) — drink proactively`,
        needsMixedCarb
          ? 'Above 60 g/h: use glucose:fructose products only (see Schedule tab)'
          : gut === 'sensitive' ? 'Prefer chews/bars over gels where possible' : 'Mix gels with electrolyte drink',
      ],
    });
  }

  if (isTri) {
    segments.push({
      segment: 't2',
      durationMins: 2,
      carbsGPerHour: 0,
      fluidMlPerHour: 0,
      sodiumMgPerHour: 0,
      notes: [
        'Take 1 gel + 100ml water before leaving transition',
        'Last chance for solid fuel before the run',
        'Check your sodium — add a salt cap if you cramped on the bike',
      ],
    });
  }

  if (runMins > 0) {
    segments.push({
      segment: 'run',
      durationMins: runMins,
      carbsGPerHour: runCarb,
      fluidMlPerHour: runFluid,
      sodiumMgPerHour: runSodium,
      notes: [
        isTri ? 'Aid station every ~1 km — grab & go' : 'Gel every 20–25 min',
        `${runFluid} ml/h fluid — sip at every aid station`,
        gut === 'sensitive' ? 'Liquid gels only — no bars or chews on the run' : 'Gels & chews work well here',
      ],
    });
  }

  // ── Totals ───────────────────────────────────────────────────────────────
  const fuelSegs = segments.filter(
    s => !['swim', 't1', 't2', 'pre_race'].includes(s.segment),
  );
  const totalCarbs = Math.round(
    fuelSegs.reduce((sum, s) => sum + s.carbsGPerHour * (s.durationMins / 60), 0) +
    (isTri ? 25 * 2 : 0), // T1 + T2 gels
  );
  const totalFluid = Math.round(
    fuelSegs.reduce((sum, s) => sum + s.fluidMlPerHour * (s.durationMins / 60), 0),
  );
  const totalSodium = Math.round(
    fuelSegs.reduce((sum, s) => sum + s.sodiumMgPerHour * (s.durationMins / 60), 0),
  );

  const fuelMins   = isTri ? bikeMins + 2 + runMins : bikeMins + runMins;
  const racingHours = fuelMins / 60;
  const avgCarbs   = racingHours > 0 ? Math.round(totalCarbs  / racingHours) : 0;
  const avgFluid   = racingHours > 0 ? Math.round(totalFluid  / racingHours) : 0;
  const avgSodium  = racingHours > 0 ? Math.round(totalSodium / racingHours) : 0;

  // ── Timeline ─────────────────────────────────────────────────────────────
  const legs = sp === 'triathlon' ? ['swim', 'bike', 'run']
             : sp === 'cycling'   ? ['bike']
             : ['run'];
  const { items: timeline, caffeineMg: plannedCaffeineMg } = buildTimeline(
    segments, brandProducts, gut, totalRaceMins, isTri, legs,
    needsMixedCarb,
  );

  // ── Caffeine insights ─────────────────────────────────────────────────────
  const plannedCaffeineMgPerKg = athlete.weightKg > 0
    ? Math.round((plannedCaffeineMg / athlete.weightKg) * 10) / 10
    : 0;
  let caffeineFlag: 'low' | 'ok' | 'high' | null = null;
  if (plannedCaffeineMg > 0) {
    if (plannedCaffeineMg > CAFFEINE_MAX_MG || plannedCaffeineMgPerKg > CAFFEINE_MG_PER_KG_RANGE[1]) {
      caffeineFlag = 'high';
    } else if (plannedCaffeineMgPerKg < CAFFEINE_MG_PER_KG_RANGE[0]) {
      caffeineFlag = 'low';
    } else {
      caffeineFlag = 'ok';
    }
  }

  // ── Pre-race plan (5A updated) ────────────────────────────────────────────
  const carbLoadRange    = totalHours < 3 ? '6–8 g/kg' : '8–10 g/kg';
  const carbLoadLow      = Math.round(athlete.weightKg * (totalHours < 3 ? 6 : 8));
  const carbLoadHigh     = Math.round(athlete.weightKg * (totalHours < 3 ? 8 : 10));
  const raceMorningCarbs = Math.round(athlete.weightKg * 2);

  const preRace = {
    nightBefore: [
      `Carb-load throughout the day: target ${carbLoadRange} body weight (${carbLoadLow}–${carbLoadHigh} g for you)`,
      totalHours >= 3
        ? 'Eat a high-carb dinner: pasta, rice, or potatoes with lean protein'
        : 'A good carb-rich meal the evening before is sufficient — no need to force-eat',
      'Many athletes tolerate the lower end of the range better — don\'t force the top end',
      'Drink 500ml electrolyte drink with dinner',
      'Avoid high-fibre, high-fat, or unfamiliar foods',
      'Get 8–9h sleep; lay out race kit the night before',
    ],
    raceMorning: [
      `Eat ${raceMorningCarbs}g carbs (1–3 g/kg) 2–3h before start — e.g. white rice, toast with jam, banana`,
      'Drink 500ml water or electrolyte drink with breakfast',
      '60 min before start: 1 gel (25g carb) + 250ml water',
      'Avoid high-fat, high-protein, or high-fibre foods race morning',
      'Caffeine works best if used consistently in training — don\'t try it for the first time on race day',
    ],
    warmUp: [
      '15 min before start: sip another 250ml electrolyte',
      totalHours > 2 ? '5 min before start: 1 final gel' : 'No final gel needed for shorter events',
      isTri ? 'Have first fuel ready in T1 (gel taped to bike stem)' : 'First gel in pocket before the gun',
      'Check you have all nutrition loaded and accessible',
    ],
  };

  return {
    segments,
    timeline,
    preRace,
    totals: {
      carbsG:          totalCarbs,
      fluidMl:         totalFluid,
      sodiumMg:        totalSodium,
      avgCarbsPerHour: avgCarbs,
      avgFluidPerHour: avgFluid,
      avgSodiumPerHour: avgSodium,
    },
    insights: {
      estimatedSweatRateMlH: estimatedSweatRateMlH,
      recommendedFluidMlH:   recommendedFluidMlH,
      plannedCaffeineMg,
      plannedCaffeineMgPerKg,
      caffeineFlag,
      needsMixedCarb,
      mixedCarbNotice,
    },
  };
}

// ─── Timeline builder (product schedule) ─────────────────────────────────────

function buildTimeline(
  segments: SegmentPlan[],
  products: Product[],
  gut: string,
  totalRaceMins: number,
  isTri: boolean,
  legs: string[],
  preferMixed: boolean,
): { items: ProductItem[]; caffeineMg: number } {
  const timeline: ProductItem[] = [];
  let elapsed       = 0;
  const minGelGap   = gut === 'sensitive' ? 30 : 20;

  // 1D: when target > 60 g/h, prefer mixed-carb gel as primary fuel
  const pickGel = (caffeinated: boolean): Product => {
    const candidates = products.filter(
      p => (p.type === 'gel' || p.type === 'chew') && p.caffeinated === caffeinated,
    );
    if (preferMixed) {
      const mixed = candidates.find(p => p.mixedCarb);
      if (mixed) return mixed;
    }
    return candidates[0] ?? products[0];
  };

  const primaryGel = pickGel(false);
  const cafGel     = products.find(p => p.caffeinated && (p.type === 'gel' || p.type === 'bar')) ?? null;
  const drink      = preferMixed
    ? products.find(p => p.type === 'drink' && p.mixedCarb) ?? products.find(p => p.type === 'drink')
    : products.find(p => p.type === 'drink');
  const chew = products.find(p => p.type === 'chew') ?? null;

  let lastFuelTime = -minGelGap;
  let cafCount     = 0;
  const maxCaf     = 2;
  let totalCaffeineMg = 0;

  const fmt = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}min` : `${m} min`;
  };

  for (const seg of segments) {
    if (seg.segment === 'pre_race') { elapsed = 0; continue; }
    if (seg.segment === 'swim')     { elapsed += seg.durationMins; continue; }

    if (seg.segment === 't1') {
      const useCaf = cafCount < maxCaf && cafGel && totalRaceMins > 180;
      const gel    = useCaf ? cafGel! : primaryGel;
      const cMg    = gel.caffeineMg ?? 0;
      if (useCaf) { cafCount++; totalCaffeineMg += cMg; }
      timeline.push({
        time:        fmt(elapsed),
        segment:     'T1',
        product:     gel.name,
        quantity:    1,
        carbs:       gel.carbsG,
        sodium:      gel.sodiumMg,
        fluid:       150,
        caffeineMg:  cMg,
        note:        useCaf ? 'Caffeine boost for the ride' : 'Quick gel + water',
        isCaffeine:  useCaf,
      });
      lastFuelTime = elapsed;
      elapsed += seg.durationMins;
      continue;
    }

    if (seg.segment === 't2') {
      timeline.push({
        time:       fmt(elapsed),
        segment:    'T2',
        product:    primaryGel.name,
        quantity:   1,
        carbs:      primaryGel.carbsG,
        sodium:     primaryGel.sodiumMg,
        fluid:      100,
        caffeineMg: 0,
        note:       'Fuel up before the run',
      });
      lastFuelTime = elapsed;
      elapsed += seg.durationMins;
      continue;
    }

    if (seg.durationMins <= 0) continue;

    const segLabel = seg.segment === 'bike' ? 'Bike' : seg.segment === 'run' ? 'Run' : seg.segment;
    const segStart = elapsed;
    const segEnd   = elapsed + seg.durationMins;

    // Drink bottles on bike
    if (drink && seg.segment === 'bike' && seg.fluidMlPerHour > 0) {
      const bottleInterval = Math.max(20, Math.round(60 / (seg.fluidMlPerHour / (drink.fluidMl || 500))));
      let nextBottle = segStart + Math.min(20, bottleInterval);
      while (nextBottle < segEnd) {
        timeline.push({
          time:       fmt(nextBottle),
          segment:    segLabel,
          product:    drink.name,
          quantity:   1,
          carbs:      drink.carbsG,
          sodium:     drink.sodiumMg,
          fluid:      drink.fluidMl,
          caffeineMg: 0,
          note:       'Hydration bottle',
        });
        nextBottle += bottleInterval;
      }
    }

    // Gel / chew / fuel schedule
    const targetCarbsTotal     = seg.carbsGPerHour * (seg.durationMins / 60);
    const carbFromDrinks        = drink && seg.segment === 'bike'
      ? drink.carbsG * Math.floor(seg.durationMins / 60)
      : 0;
    const targetCarbsFromSolids = Math.max(0, targetCarbsTotal - carbFromDrinks);

    const fuelProduct = seg.segment === 'run'
      ? (gut === 'sensitive' && chew ? chew : primaryGel)
      : primaryGel;

    const gelsNeeded = fuelProduct.carbsG > 0
      ? Math.ceil(targetCarbsFromSolids / fuelProduct.carbsG)
      : 0;

    if (gelsNeeded > 0) {
      const interval        = Math.floor(seg.durationMins / (gelsNeeded + 1));
      const clampedInterval = Math.max(minGelGap, interval);
      let nextGelTime       = segStart + Math.min(clampedInterval, 20);

      for (let i = 0; i < gelsNeeded; i++) {
        if (nextGelTime >= segEnd) break;
        if (nextGelTime - lastFuelTime < minGelGap) nextGelTime = lastFuelTime + minGelGap;
        if (nextGelTime >= segEnd) break;

        // Caffeine in last third of run only
        const isLastThird = nextGelTime > segStart + seg.durationMins * 0.65;
        const useCaf      = cafCount < maxCaf && cafGel && isLastThird && seg.segment === 'run';
        const chosen      = useCaf ? cafGel! : fuelProduct;
        const cMg         = chosen.caffeineMg ?? 0;
        if (useCaf) { cafCount++; totalCaffeineMg += cMg; }

        timeline.push({
          time:       fmt(nextGelTime),
          segment:    segLabel,
          product:    chosen.name,
          quantity:   1,
          carbs:      chosen.carbsG,
          sodium:     chosen.sodiumMg,
          fluid:      seg.segment === 'run' ? 150 : 0,
          caffeineMg: cMg,
          note:       chosen.caffeinated
            ? 'Caffeine boost — final push'
            : seg.segment === 'run' ? 'With water from aid station' : undefined,
          isCaffeine: chosen.caffeinated,
        });
        lastFuelTime = nextGelTime;
        nextGelTime += clampedInterval;
      }
    }

    elapsed = segEnd;
  }

  timeline.sort((a, b) => parseTimeMins(a.time) - parseTimeMins(b.time));

  return { items: timeline, caffeineMg: totalCaffeineMg };
}

function parseTimeMins(t: string): number {
  const hMatch = t.match(/(\d+)h (\d+)min/);
  const mMatch = t.match(/^(\d+) min/);
  if (hMatch) return parseInt(hMatch[1]) * 60 + parseInt(hMatch[2]);
  if (mMatch) return parseInt(mMatch[1]);
  return 0;
}
