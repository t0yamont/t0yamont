import type { WizardState, NutritionPlan, SegmentPlan, ProductItem, Product } from '../types';
import { PRODUCTS } from './brands';

const SWEAT_RATE_ML: Record<string, number> = {
  light: 500,
  moderate: 750,
  heavy: 1000,
  very_heavy: 1200,
};

function heatModifier(temp: number): number {
  if (temp < 15) return 0.85;
  if (temp <= 20) return 1.0;
  if (temp <= 25) return 1.15;
  if (temp <= 30) return 1.30;
  return 1.45;
}

function baseCarbs(intensity: string): number {
  if (intensity === 'finish') return 55;
  if (intensity === 'moderate') return 67;
  return 82;
}

function sodiumPerLitre(saltiness: string): number {
  if (saltiness === 'low') return 300;
  if (saltiness === 'moderate') return 700;
  if (saltiness === 'high') return 1000;
  return 1500;
}

function crampMultiplier(freq: string): number {
  if (freq === 'sometimes') return 1.15;
  if (freq === 'often') return 1.25;
  return 1.0;
}

export function computePlan(state: WizardState): NutritionPlan {
  const {
    sport,
    splitTimes,
    intensity,
    tempCelsius,
    humidity,
    sweatRate,
    saltiness,
    crampFrequency,
    gutTolerance,
    athlete,
    brand,
  } = state;

  const weightScale = (athlete.weightKg || 70) / 70;
  const intens = intensity ?? 'moderate';
  const gut = gutTolerance ?? 'normal';
  const salt = saltiness ?? 'moderate';
  const cramp = crampFrequency ?? 'never';
  const sweat = sweatRate ?? 'moderate';

  const baseCarb = baseCarbs(intens) * (gut === 'sensitive' ? 0.9 : 1.0) * weightScale;
  const baseFluid = SWEAT_RATE_ML[sweat] * heatModifier(tempCelsius) * weightScale + (humidity === 'high' ? 100 : 0);
  const sodiumPL = sodiumPerLitre(salt) * crampMultiplier(cramp);

  const isTri = sport === 'triathlon';
  const isCycling = sport === 'cycling';

  const legs = sport === 'triathlon' ? ['swim', 'bike', 'run'] :
               sport === 'cycling' ? ['bike'] : ['run'];

  const swimMins = isTri ? splitTimes.swimMins : 0;
  const bikeMins = (isTri || isCycling) ? splitTimes.bikeMins : 0;
  const runMins = (isTri || sport === 'running') ? splitTimes.runMins : 0;

  const segments: SegmentPlan[] = [];

  if (isTri) {
    segments.push({
      segment: 'pre_race',
      durationMins: 0,
      carbsGPerHour: 0,
      fluidMlPerHour: 0,
      sodiumMgPerHour: 0,
      notes: ['Carb-load the night before', 'Pre-race meal 2–3h before start', 'Sip 500ml electrolyte drink before swim start'],
    });

    segments.push({
      segment: 'swim',
      durationMins: swimMins,
      carbsGPerHour: 0,
      fluidMlPerHour: 0,
      sodiumMgPerHour: 0,
      notes: ['No eating or drinking in water', 'Pre-load carbs & fluid before the swim', 'Focus on pacing and breathing'],
    });

    const t1Fluid = Math.round(baseFluid * 0.1);
    segments.push({
      segment: 't1',
      durationMins: 3,
      carbsGPerHour: 0,
      fluidMlPerHour: 0,
      sodiumMgPerHour: 0,
      notes: [
        'Take 1 gel + 150ml water immediately',
        'Window of opportunity — every carb counts here',
        gut === 'sensitive' ? 'Try a chew instead of gel if gut is unsettled' : 'Caffeine gel here if race > 3h',
      ],
    });
  }

  const bikeFluid = Math.round(baseFluid);
  const bikeSodium = Math.round(sodiumPL * (bikeFluid / 1000));
  const bikeCarb = Math.round(baseCarb);
  if (bikeMins > 0) {
    segments.push({
      segment: 'bike',
      durationMins: bikeMins,
      carbsGPerHour: bikeCarb,
      fluidMlPerHour: bikeFluid,
      sodiumMgPerHour: bikeSodium,
      notes: [
        `Target ${bikeCarb}g carb/h — front-load in first 30 min`,
        `Drink ${bikeFluid}ml/h proactively, don't wait for thirst`,
        gut === 'sensitive' ? 'Prefer chews/bars over gels where possible' : 'Mix gels with electrolyte drink',
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
        'Take 1 gel + 100ml water',
        'Last chance for solid fuel before the run',
        'Check your sodium — add salt caps if cramping',
      ],
    });
  }

  const runFluidMultiplier = isTri ? 0.85 : 1.0;
  const runFluid = Math.round(baseFluid * runFluidMultiplier);
  const runSodium = Math.round(sodiumPL * (runFluid / 1000));
  const runCarb = isTri
    ? Math.round(baseCarb * (gut === 'sensitive' ? 0.85 : 0.95))
    : Math.round(baseCarb);

  if (runMins > 0) {
    segments.push({
      segment: 'run',
      durationMins: runMins,
      carbsGPerHour: runCarb,
      fluidMlPerHour: runFluid,
      sodiumMgPerHour: runSodium,
      notes: [
        isTri ? 'Aid station every ~1km — grab & go' : 'Gels every 20–25 min',
        `${runFluid}ml/h fluid target — sip at every aid station`,
        gut === 'sensitive' ? 'Liquid gels only — no bars or chews on the run' : 'Gels & chews work well here',
      ],
    });
  }

  const totalRaceMins = swimMins + (isTri ? 5 : 0) + bikeMins + (isTri ? 2 : 0) + runMins;
  const fuelMins = (isTri ? bikeMins + 2 + runMins : bikeMins + runMins);

  const totalCarbs = Math.round(
    segments.filter(s => !['swim', 't1', 't2', 'pre_race'].includes(s.segment))
      .reduce((sum, s) => sum + s.carbsGPerHour * (s.durationMins / 60), 0) +
    (isTri ? 25 * 2 : 0)
  );
  const totalFluid = Math.round(
    segments.filter(s => !['swim', 't1', 't2', 'pre_race'].includes(s.segment))
      .reduce((sum, s) => sum + s.fluidMlPerHour * (s.durationMins / 60), 0)
  );
  const totalSodium = Math.round(
    segments.filter(s => !['swim', 't1', 't2', 'pre_race'].includes(s.segment))
      .reduce((sum, s) => sum + s.sodiumMgPerHour * (s.durationMins / 60), 0)
  );

  const racingHours = fuelMins / 60;
  const avgCarbs = racingHours > 0 ? Math.round(totalCarbs / racingHours) : 0;
  const avgFluid = racingHours > 0 ? Math.round(totalFluid / racingHours) : 0;
  const avgSodium = racingHours > 0 ? Math.round(totalSodium / racingHours) : 0;

  const products = PRODUCTS[brand ?? 'generic'];
  const timeline = buildTimeline(segments, products, gut, totalRaceMins, isTri, legs as string[]);

  const raceMorningCarbs = Math.round(athlete.weightKg * 2.5);
  const preRace = {
    nightBefore: [
      'Eat a high-carb dinner: pasta, rice, or potatoes with lean protein',
      'Aim for 8–10g carb per kg body weight throughout the day',
      'Drink 500ml electrolyte drink with dinner',
      'Avoid high-fibre or fatty foods that may cause GI issues',
      'Get 8–9h sleep; lay out race kit the night before',
    ],
    raceMorning: [
      `Eat ${raceMorningCarbs}g carbs (${Math.round(athlete.weightKg * 2.5)}g) 2–3h before race start — e.g. white rice, toast with jam, banana`,
      'Drink 500ml water or electrolyte drink with breakfast',
      '60 min before start: take 1 gel (25g carb) + 250ml water',
      'Avoid high-fat, high-protein or high-fibre foods race morning',
      'Avoid caffeine unless you regularly use it in training',
    ],
    warmUp: [
      '15 min before swim start: sip another 250ml electrolyte',
      '5 min before start: 1 final gel if race is over 2 hours',
      'Have first fuel ready for T1 (gel taped to bike stem)',
      'Check you have all nutrition loaded on bike',
    ],
  };

  return {
    segments,
    timeline,
    preRace,
    totals: {
      carbsG: totalCarbs,
      fluidMl: totalFluid,
      sodiumMg: totalSodium,
      avgCarbsPerHour: avgCarbs,
      avgFluidPerHour: avgFluid,
      avgSodiumPerHour: avgSodium,
    },
  };
}

function buildTimeline(
  segments: SegmentPlan[],
  products: Product[],
  gut: string,
  totalRaceMins: number,
  isTri: boolean,
  legs: string[],
): ProductItem[] {
  const timeline: ProductItem[] = [];
  let elapsed = 0;
  const minGelGap = gut === 'sensitive' ? 30 : 20;

  const primaryGel = products.find(p => p.type === 'gel' && !p.caffeinated) ?? products[0];
  const cafGel = products.find(p => p.caffeinated && (p.type === 'gel' || p.type === 'bar')) ?? null;
  const drink = products.find(p => p.type === 'drink') ?? null;
  const bar = products.find(p => p.type === 'bar' && !p.caffeinated) ?? null;
  const chew = products.find(p => p.type === 'chew') ?? null;

  let lastFuelTime = -minGelGap;
  let cafCount = 0;
  const maxCaf = 2;

  const formatTime = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}min` : `${m} min`;
  };

  for (const seg of segments) {
    if (seg.segment === 'pre_race') {
      elapsed = 0;
      continue;
    }

    if (seg.segment === 'swim') {
      elapsed += seg.durationMins;
      continue;
    }

    if (seg.segment === 't1') {
      const gelProduct = (cafCount < maxCaf && cafGel && totalRaceMins > 180) ? cafGel : primaryGel;
      const isCaf = gelProduct.caffeinated;
      if (isCaf) cafCount++;
      timeline.push({
        time: formatTime(elapsed),
        segment: 'T1',
        product: gelProduct.name,
        quantity: 1,
        carbs: gelProduct.carbsG,
        sodium: gelProduct.sodiumMg,
        fluid: 150,
        note: isCaf ? 'Caffeine boost for the ride' : 'Quick gel + water',
        isCaffeine: isCaf,
      });
      lastFuelTime = elapsed;
      elapsed += seg.durationMins;
      continue;
    }

    if (seg.segment === 't2') {
      const gelProduct = primaryGel;
      timeline.push({
        time: formatTime(elapsed),
        segment: 'T2',
        product: gelProduct.name,
        quantity: 1,
        carbs: gelProduct.carbsG,
        sodium: gelProduct.sodiumMg,
        fluid: 100,
        note: 'Fuel up before the run',
      });
      lastFuelTime = elapsed;
      elapsed += seg.durationMins;
      continue;
    }

    if (seg.durationMins <= 0) continue;

    const segLabel = seg.segment === 'bike' ? 'Bike' : seg.segment === 'run' ? 'Run' : seg.segment;
    const segStart = elapsed;
    const segEnd = elapsed + seg.durationMins;

    if (drink && seg.segment === 'bike') {
      const bottleInterval = Math.round(60 / (seg.fluidMlPerHour / (drink.fluidMl || 500)));
      let nextBottle = segStart + Math.min(20, bottleInterval);
      while (nextBottle < segEnd) {
        timeline.push({
          time: formatTime(nextBottle),
          segment: segLabel,
          product: drink.name,
          quantity: 1,
          carbs: drink.carbsG,
          sodium: drink.sodiumMg,
          fluid: drink.fluidMl,
          note: 'Hydration bottle',
        });
        nextBottle += bottleInterval;
      }
    }

    const targetCarbsTotal = seg.carbsGPerHour * (seg.durationMins / 60);
    const targetCarbsFromGels = drink && seg.segment === 'bike'
      ? Math.max(0, targetCarbsTotal - drink.carbsG * Math.floor(seg.durationMins / 60))
      : targetCarbsTotal;

    const fuelProduct = seg.segment === 'run'
      ? (gut === 'sensitive' && chew ? chew : primaryGel)
      : (bar && seg.segment === 'bike' && gut !== 'iron' ? null : primaryGel);

    const actualFuelProduct = fuelProduct ?? primaryGel;
    const gelsNeeded = Math.ceil(targetCarbsFromGels / actualFuelProduct.carbsG);

    if (gelsNeeded > 0 && actualFuelProduct.carbsG > 0) {
      const interval = Math.floor(seg.durationMins / (gelsNeeded + 1));
      const clampedInterval = Math.max(minGelGap, interval);

      let nextGelTime = segStart + Math.min(clampedInterval, 20);

      for (let i = 0; i < gelsNeeded; i++) {
        if (nextGelTime >= segEnd) break;
        if (nextGelTime - lastFuelTime < minGelGap) {
          nextGelTime = lastFuelTime + minGelGap;
        }
        if (nextGelTime >= segEnd) break;

        const isLastThird = nextGelTime > segStart + seg.durationMins * 0.65;
        const useCaf = cafCount < maxCaf && cafGel && isLastThird && seg.segment === 'run';
        const chosenProduct = useCaf ? cafGel! : actualFuelProduct;
        if (useCaf) cafCount++;

        timeline.push({
          time: formatTime(nextGelTime),
          segment: segLabel,
          product: chosenProduct.name,
          quantity: 1,
          carbs: chosenProduct.carbsG,
          sodium: chosenProduct.sodiumMg,
          fluid: seg.segment === 'run' ? 150 : 0,
          note: chosenProduct.caffeinated
            ? 'Caffeine boost — final push'
            : seg.segment === 'run' ? 'With water from aid station' : undefined,
          isCaffeine: chosenProduct.caffeinated,
        });
        lastFuelTime = nextGelTime;
        nextGelTime += clampedInterval;
      }
    }

    elapsed = segEnd;
  }

  timeline.sort((a, b) => {
    const parseTime = (t: string) => {
      const hMatch = t.match(/(\d+)h (\d+)min/);
      const mMatch = t.match(/^(\d+) min/);
      if (hMatch) return parseInt(hMatch[1]) * 60 + parseInt(hMatch[2]);
      if (mMatch) return parseInt(mMatch[1]);
      return 0;
    };
    return parseTime(a.time) - parseTime(b.time);
  });

  return timeline;
}
