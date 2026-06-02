import type { WizardState, NutritionPlan, SegmentPlan, ProductItem, Product, FuelKit } from '../types';
import { getProductById, PRODUCTS } from './brands';

// ─── Tunable constants ────────────────────────────────────────────────────────

const CARB_BANDS: Record<string, { low: number; high: number }> = {
  finish:   { low: 50, high: 60 },
  moderate: { low: 60, high: 75 },
  limit:    { low: 75, high: 90 },
};

const INTENSITY_CARB_MULT: Record<string, number> = { finish: 0.85, moderate: 1.0, limit: 1.1 };
const SPORT_CARB_BIAS: Record<string, number>     = { cycling: 0.15, running: -0.15, triathlon: 0 };
const GUT_CARB = { sensitive: -0.18, normal: 0, iron_ceiling: 1.08 } as const;

const FLUID_REPLACEMENT_FRACTION = 0.70;
const WEIGHT_STEP = { under60: -0.08, mid: 0, over85: +0.08 } as const;
const HUMIDITY_MULT: Record<string, number> = { low: 1.0, moderate: 1.05, high: 1.12 };
const FLUID_ABSORPTION_CEILING = 1400;

const CRAMP_SODIUM: Record<string, number> = { never: 0, rarely: 0, sometimes: 0.06, often: 0.12 };

const CAFFEINE_MG_PER_KG_RANGE = [3, 6] as const;
const CAFFEINE_MAX_MG = 400;
const MIXED_CARB_THRESHOLD = 60;

const SWEAT_RATE_ML: Record<string, number> = {
  light: 500, moderate: 750, heavy: 1000, very_heavy: 1200,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function heatModifier(temp: number): number {
  if (temp < 15) return 0.85;
  if (temp <= 20) return 1.0;
  if (temp <= 25) return 1.15;
  if (temp <= 30) return 1.30;
  return 1.45;
}

function sodiumPerLitre(saltiness: string): number {
  if (saltiness === 'low')      return  300;
  if (saltiness === 'moderate') return  700;
  if (saltiness === 'high')     return 1000;
  return 1500;
}

function computeCarbTarget(intens: string, sport: string, totalHours: number, gut: string): number {
  const band = CARB_BANDS[intens] ?? CARB_BANDS.moderate;
  const dur  = Math.min(1, totalHours / 6) * 0.5;
  const sp   = SPORT_CARB_BIAS[sport] ?? 0;
  const ic   = intens === 'finish' ? -0.1 : intens === 'limit' ? 0.1 : 0;
  const pos  = Math.min(1, Math.max(0, dur + sp + ic));
  const raw  = band.low + (band.high - band.low) * pos;
  const mult = raw * (INTENSITY_CARB_MULT[intens] ?? 1.0);
  if (gut === 'sensitive') return mult * (1 + GUT_CARB.sensitive);
  if (gut === 'iron')      return Math.min(mult, band.high * GUT_CARB.iron_ceiling);
  return mult;
}

function computeFluid(sweat: string, temp: number, humidity: string, weightKg: number) {
  const base  = SWEAT_RATE_ML[sweat] ?? SWEAT_RATE_ML.moderate;
  const heat  = heatModifier(temp);
  const hum   = HUMIDITY_MULT[humidity] ?? 1.0;
  const wAdj  = weightKg < 60 ? (1 + WEIGHT_STEP.under60) : weightKg > 85 ? (1 + WEIGHT_STEP.over85) : 1.0;
  const est   = base * heat * hum * wAdj;
  const rec   = Math.min(est * FLUID_REPLACEMENT_FRACTION, FLUID_ABSORPTION_CEILING);
  return {
    estimatedSweatRateMlH: Math.round(est / 50) * 50,
    recommendedFluidMlH:   Math.round(rec / 50) * 50,
  };
}

/** Resolve FuelKit product IDs to actual Product objects. Falls back to generic. */
function resolveKit(kit: FuelKit): {
  primaryGel: Product;
  cafGel: Product | null;
  drink: Product | null;
  solid: Product | null;
} {
  const fallback = PRODUCTS.generic[0];
  return {
    primaryGel: getProductById(kit.primaryGelId) ?? fallback,
    cafGel:     kit.cafGelId  ? getProductById(kit.cafGelId)  : null,
    drink:      kit.drinkId   ? getProductById(kit.drinkId)   : null,
    solid:      kit.solidId   ? getProductById(kit.solidId)   : null,
  };
}

// ─── Main planner ─────────────────────────────────────────────────────────────

export function computePlan(state: WizardState): NutritionPlan {
  const { sport, splitTimes, intensity, tempCelsius, humidity,
          sweatRate, saltiness, crampFrequency, gutTolerance, athlete, fuelKit } = state;

  const intens = intensity       ?? 'moderate';
  const gut    = gutTolerance    ?? 'normal';
  const salt   = saltiness       ?? 'moderate';
  const cramp  = crampFrequency  ?? 'never';
  const sweat  = sweatRate       ?? 'moderate';
  const sp     = sport           ?? 'triathlon';

  const isTri     = sp === 'triathlon';
  const isCycling = sp === 'cycling';

  const swimMins = isTri                       ? splitTimes.swimMins : 0;
  const bikeMins = (isTri || isCycling)        ? splitTimes.bikeMins : 0;
  const runMins  = (isTri || sp === 'running') ? splitTimes.runMins  : 0;

  const totalRaceMins = swimMins + (isTri ? 5 : 0) + bikeMins + (isTri ? 2 : 0) + runMins;
  const totalHours    = totalRaceMins / 60;

  // ── Resolve kit products ──────────────────────────────────────────────────
  const kit = fuelKit ?? { primaryGelId: 'generic_gel', cafGelId: 'generic_caf_gel', drinkId: null, solidId: null };
  const resolved = resolveKit(kit);

  // ── Carb targets ──────────────────────────────────────────────────────────
  const carbTarget = computeCarbTarget(intens, sp, totalHours, gut);
  const bikeCarb   = Math.round(carbTarget);
  const runCarbRaw = isTri ? carbTarget * (gut === 'sensitive' ? 0.90 : 0.95) : carbTarget;
  const runCarb    = Math.round(runCarbRaw);

  // ── Fluid chain ───────────────────────────────────────────────────────────
  const { estimatedSweatRateMlH, recommendedFluidMlH } = computeFluid(
    sweat, tempCelsius, humidity, athlete.weightKg || 70,
  );
  const bikeFluid = recommendedFluidMlH;
  const runFluid  = Math.round((isTri ? recommendedFluidMlH * 0.85 : recommendedFluidMlH) / 50) * 50;

  // ── Sodium ────────────────────────────────────────────────────────────────
  const crampAdj  = 1 + (CRAMP_SODIUM[cramp] ?? 0);
  const sodiumPL  = sodiumPerLitre(salt) * crampAdj;
  const bikeSodium = Math.round(sodiumPL * (bikeFluid / 1000));
  const runSodium  = Math.round(sodiumPL * (runFluid  / 1000));

  // ── Mixed-carb flag ───────────────────────────────────────────────────────
  const needsMixedCarb = bikeCarb > MIXED_CARB_THRESHOLD || runCarb > MIXED_CARB_THRESHOLD;
  const hasMixedInKit  = resolved.primaryGel.mixedCarb || resolved.drink?.mixedCarb;
  const mixedCarbNotice = needsMixedCarb && !hasMixedInKit
    ? `Your carb target (${Math.max(bikeCarb, runCarb)} g/h) exceeds 60 g/h. Single-source glucose plateaus at ~60 g/h oxidation — use a glucose:fructose product to absorb more.`
    : null;

  // ── Build segments ────────────────────────────────────────────────────────
  const segments: SegmentPlan[] = [];

  if (isTri) {
    segments.push({
      segment: 'pre_race', durationMins: 0,
      carbsGPerHour: 0, fluidMlPerHour: 0, sodiumMgPerHour: 0,
      notes: [
        'Carb-load throughout the day before — see Pre-Race tab for detail',
        'Pre-race meal 2–3h before start (1–3 g carb/kg)',
        'Sip 500ml electrolyte in the 60 min before swim start',
      ],
    });

    segments.push({
      segment: 'swim', durationMins: swimMins,
      carbsGPerHour: 0, fluidMlPerHour: 0, sodiumMgPerHour: 0,
      notes: ['No eating or drinking in water', 'Pre-load carbs before the swim', 'Focus on pacing and breathing'],
    });

    segments.push({
      segment: 't1', durationMins: 3,
      carbsGPerHour: 0, fluidMlPerHour: 0, sodiumMgPerHour: 0,
      notes: [
        `Take 1 × ${resolved.primaryGel.name} (${resolved.primaryGel.carbsG}g carb) + 150ml water immediately`,
        'Window of opportunity — every carb counts here',
        gut === 'sensitive' ? 'Chew or solid gel if stomach is unsettled' : totalHours > 3 ? 'Use your caffeine gel here to prime the ride' : 'Plain gel — save caffeine for later',
      ],
    });
  }

  if (bikeMins > 0) {
    segments.push({
      segment: 'bike', durationMins: bikeMins,
      carbsGPerHour: bikeCarb, fluidMlPerHour: bikeFluid, sodiumMgPerHour: bikeSodium,
      notes: [
        `Target ${bikeCarb} g carb/h — front-load in the first 30 min`,
        `${bikeFluid} ml/h fluid (~70% sweat replacement) — drink proactively, don't wait for thirst`,
        needsMixedCarb ? 'Above 60 g/h: use glucose:fructose products only (see Schedule tab)' :
          gut === 'sensitive' ? 'Prefer bars/chews over gels where possible' : 'Mix gels with electrolyte drink',
      ],
    });
  }

  if (isTri) {
    segments.push({
      segment: 't2', durationMins: 2,
      carbsGPerHour: 0, fluidMlPerHour: 0, sodiumMgPerHour: 0,
      notes: [
        `Take 1 × ${resolved.primaryGel.name} + 100ml water before leaving T2`,
        'Last chance for solid fuel before the run',
        'Check sodium — add a salt cap if you cramped on the bike',
      ],
    });
  }

  if (runMins > 0) {
    segments.push({
      segment: 'run', durationMins: runMins,
      carbsGPerHour: runCarb, fluidMlPerHour: runFluid, sodiumMgPerHour: runSodium,
      notes: [
        isTri ? 'Aid station every ~1 km — grab & go' : `Gel every 20–25 min`,
        `${runFluid} ml/h fluid — sip at every aid station`,
        gut === 'sensitive' ? 'Liquid gels only on the run — no bars or chews' : 'Gels & chews both work well',
      ],
    });
  }

  // ── Totals ────────────────────────────────────────────────────────────────
  const fuelSegs  = segments.filter(s => !['swim', 't1', 't2', 'pre_race'].includes(s.segment));
  const totalCarbs = Math.round(
    fuelSegs.reduce((s, seg) => s + seg.carbsGPerHour * (seg.durationMins / 60), 0) +
    (isTri ? resolved.primaryGel.carbsG * 2 : 0),
  );
  const totalFluid  = Math.round(fuelSegs.reduce((s, seg) => s + seg.fluidMlPerHour * (seg.durationMins / 60), 0));
  const totalSodium = Math.round(fuelSegs.reduce((s, seg) => s + seg.sodiumMgPerHour * (seg.durationMins / 60), 0));

  const fuelMins    = isTri ? bikeMins + 2 + runMins : bikeMins + runMins;
  const racingHours = fuelMins / 60;
  const avgCarbs    = racingHours > 0 ? Math.round(totalCarbs  / racingHours) : 0;
  const avgFluid    = racingHours > 0 ? Math.round(totalFluid  / racingHours) : 0;
  const avgSodium   = racingHours > 0 ? Math.round(totalSodium / racingHours) : 0;

  // ── Timeline ──────────────────────────────────────────────────────────────
  const legs = sp === 'triathlon' ? ['swim', 'bike', 'run'] : sp === 'cycling' ? ['bike'] : ['run'];
  const { items: timeline, caffeineMg: plannedCaffeineMg } = buildTimeline(
    segments, resolved, gut, totalRaceMins, isTri, legs, needsMixedCarb,
  );

  // ── Caffeine insights ─────────────────────────────────────────────────────
  const plannedCaffeineMgPerKg = athlete.weightKg > 0
    ? Math.round((plannedCaffeineMg / athlete.weightKg) * 10) / 10
    : 0;
  let caffeineFlag: 'low' | 'ok' | 'high' | null = null;
  if (plannedCaffeineMg > 0) {
    caffeineFlag = plannedCaffeineMg > CAFFEINE_MAX_MG || plannedCaffeineMgPerKg > CAFFEINE_MG_PER_KG_RANGE[1]
      ? 'high' : plannedCaffeineMgPerKg < CAFFEINE_MG_PER_KG_RANGE[0] ? 'low' : 'ok';
  }

  // ── Pre-race plan ─────────────────────────────────────────────────────────
  const gelName      = resolved.primaryGel.name;
  const gelCarbs     = resolved.primaryGel.carbsG;
  const carbLoadRange = totalHours < 3 ? '6–8 g/kg' : '8–10 g/kg';
  const carbLoadLow   = Math.round(athlete.weightKg * (totalHours < 3 ? 6 : 8));
  const carbLoadHigh  = Math.round(athlete.weightKg * (totalHours < 3 ? 8 : 10));
  const morningCarbs  = Math.round(athlete.weightKg * 2);

  const preRace = {
    nightBefore: [
      `Carb-load all day: target ${carbLoadRange} body weight (${carbLoadLow}–${carbLoadHigh} g for you)`,
      totalHours >= 3
        ? 'Eat a high-carb dinner — pasta, rice or potatoes with lean protein'
        : 'A good carb-rich evening meal is enough — no need to force eat',
      'Many athletes tolerate the lower end of the range better — don\'t force the top',
      'Drink 500ml electrolyte with dinner',
      'Avoid high-fibre, high-fat, or unfamiliar foods',
      'Lay out race kit and get 8–9h sleep',
    ],
    raceMorning: [
      `Eat ${morningCarbs}g carbs (1–3 g/kg) 2–3h before start — white rice, toast with jam, banana`,
      'Drink 500ml water or electrolyte with breakfast',
      `60 min before start: 1 × ${gelName} (${gelCarbs}g carb) + 250ml water`,
      'Avoid high-fat, high-protein or high-fibre foods',
      'Only use caffeine if it\'s part of your usual training routine',
    ],
    warmUp: [
      '15 min before start: sip another 250ml electrolyte',
      totalHours > 2
        ? `5 min before start: 1 × ${gelName} (${gelCarbs}g carb)`
        : 'No final gel needed for shorter events',
      isTri ? 'Have first gel ready in T1 (taped to bike stem)' : 'First gel in pocket before the gun',
      'Confirm all nutrition is loaded and accessible',
    ],
  };

  return {
    segments, timeline, preRace,
    totals: { carbsG: totalCarbs, fluidMl: totalFluid, sodiumMg: totalSodium,
              avgCarbsPerHour: avgCarbs, avgFluidPerHour: avgFluid, avgSodiumPerHour: avgSodium },
    insights: {
      estimatedSweatRateMlH, recommendedFluidMlH,
      plannedCaffeineMg, plannedCaffeineMgPerKg, caffeineFlag,
      needsMixedCarb, mixedCarbNotice,
    },
  };
}

// ─── Timeline builder ─────────────────────────────────────────────────────────

interface ResolvedKit {
  primaryGel: Product;
  cafGel: Product | null;
  drink: Product | null;
  solid: Product | null;
}

function buildTimeline(
  segments: SegmentPlan[],
  kit: ResolvedKit,
  gut: string,
  totalRaceMins: number,
  isTri: boolean,
  _legs: string[],
  preferMixed: boolean,
): { items: ProductItem[]; caffeineMg: number } {
  const timeline: ProductItem[] = [];
  const minGelGap = gut === 'sensitive' ? 30 : 20;

  // Prefer mixed-carb primary gel if carb target is high and one is available
  const primaryGel = kit.primaryGel;
  const cafGel     = kit.cafGel;
  const drink      = kit.drink;
  // Use solid for bike if available, fall back to primaryGel
  const bikeBar    = kit.solid ?? primaryGel;
  // Run fuel: prefer gel/chew over bar
  const runGel     = (kit.solid?.canUseOnRun ? kit.solid : null) ?? primaryGel;

  let elapsed          = 0;
  let lastFuelTime     = -minGelGap;
  let cafCount         = 0;
  let totalCaffeineMg  = 0;
  const maxCaf         = 2;

  const fmt = (m: number) => {
    const h = Math.floor(m / 60), min = m % 60;
    return h > 0 ? `${h}h ${min}min` : `${m} min`;
  };

  for (const seg of segments) {
    if (seg.segment === 'pre_race') { elapsed = 0; continue; }
    if (seg.segment === 'swim')     { elapsed += seg.durationMins; continue; }

    if (seg.segment === 't1') {
      const useCaf = cafCount < maxCaf && cafGel != null && totalRaceMins > 180;
      const gel    = useCaf ? cafGel! : primaryGel;
      const cMg    = gel.caffeineMg ?? 0;
      if (useCaf) { cafCount++; totalCaffeineMg += cMg; }
      timeline.push({
        time: fmt(elapsed), segment: 'T1', product: gel.name,
        quantity: 1, carbs: gel.carbsG, sodium: gel.sodiumMg, fluid: 150,
        caffeineMg: cMg, isCaffeine: useCaf,
        note: useCaf ? `Caffeine hit (${cMg}mg) — primes the ride` : 'Quick gel + 150ml water',
      });
      lastFuelTime = elapsed;
      elapsed += seg.durationMins;
      continue;
    }

    if (seg.segment === 't2') {
      const cMg = primaryGel.caffeineMg ?? 0;
      timeline.push({
        time: fmt(elapsed), segment: 'T2', product: primaryGel.name,
        quantity: 1, carbs: primaryGel.carbsG, sodium: primaryGel.sodiumMg,
        fluid: 100, caffeineMg: cMg, note: 'Fuel up before the run',
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
      let next = segStart + Math.min(20, bottleInterval);
      while (next < segEnd) {
        timeline.push({
          time: fmt(next), segment: segLabel, product: drink.name,
          quantity: 1, carbs: drink.carbsG, sodium: drink.sodiumMg,
          fluid: drink.fluidMl, caffeineMg: 0, note: 'Hydration bottle',
        });
        next += bottleInterval;
      }
    }

    // Gel / solid schedule
    const totalTarget   = seg.carbsGPerHour * (seg.durationMins / 60);
    const drinkCarbs    = drink && seg.segment === 'bike' ? drink.carbsG * Math.floor(seg.durationMins / 60) : 0;
    const solidsTarget  = Math.max(0, totalTarget - drinkCarbs);
    const fuelProd      = seg.segment === 'run' ? runGel : primaryGel;
    const gelsNeeded    = fuelProd.carbsG > 0 ? Math.ceil(solidsTarget / fuelProd.carbsG) : 0;

    if (gelsNeeded > 0) {
      const interval  = Math.max(minGelGap, Math.floor(seg.durationMins / (gelsNeeded + 1)));
      let nextGel     = segStart + Math.min(interval, 20);

      for (let i = 0; i < gelsNeeded; i++) {
        if (nextGel >= segEnd) break;
        if (nextGel - lastFuelTime < minGelGap) nextGel = lastFuelTime + minGelGap;
        if (nextGel >= segEnd) break;

        const lastThird = nextGel > segStart + seg.durationMins * 0.65;
        const useCaf    = cafCount < maxCaf && cafGel != null && lastThird && seg.segment === 'run';
        const chosen    = useCaf ? cafGel! : fuelProd;
        const cMg       = chosen.caffeineMg ?? 0;
        if (useCaf) { cafCount++; totalCaffeineMg += cMg; }

        timeline.push({
          time: fmt(nextGel), segment: segLabel, product: chosen.name,
          quantity: 1, carbs: chosen.carbsG, sodium: chosen.sodiumMg,
          fluid: seg.segment === 'run' ? 150 : 0,
          caffeineMg: cMg, isCaffeine: chosen.caffeinated,
          note: chosen.caffeinated
            ? `Caffeine boost (${cMg}mg) — final push`
            : seg.segment === 'run' ? 'With water from aid station' : undefined,
        });
        lastFuelTime = nextGel;
        nextGel += interval;
      }
    }

    elapsed = segEnd;
  }

  timeline.sort((a, b) => parseTimeMins(a.time) - parseTimeMins(b.time));
  return { items: timeline, caffeineMg: totalCaffeineMg };
}

function parseTimeMins(t: string): number {
  const h = t.match(/(\d+)h (\d+)min/);
  const m = t.match(/^(\d+) min/);
  if (h) return parseInt(h[1]) * 60 + parseInt(h[2]);
  if (m) return parseInt(m[1]);
  return 0;
}
