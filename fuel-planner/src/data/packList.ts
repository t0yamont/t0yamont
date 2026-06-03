import type { NutritionPlan, ProductItem, PackItem, PackList, ProductType } from '../types';

const TYPE_ORDER: Record<ProductType, number> = { gel: 0, chew: 1, drink: 2, bar: 3, capsule: 4 };

/** Aggregate a list of scheduled intake events into per-product pack counts. */
function aggregate(items: ProductItem[], bottleSizeMl: number): PackItem[] {
  const map = new Map<string, PackItem>();

  for (const it of items) {
    const q = it.quantity || 1;
    const existing = map.get(it.product);
    if (existing) {
      existing.count      += q;
      existing.carbs      += it.carbs * q;
      existing.sodium     += it.sodium * q;
      existing.fluid      += it.fluid * q;
      existing.caffeineMg += (it.caffeineMg ?? 0) * q;
    } else {
      map.set(it.product, {
        product: it.product,
        productType: it.productType ?? 'gel',
        count: q,
        carbs: it.carbs * q,
        sodium: it.sodium * q,
        fluid: it.fluid * q,
        caffeineMg: (it.caffeineMg ?? 0) * q,
        isCaffeine: Boolean(it.isCaffeine || (it.caffeineMg ?? 0) > 0),
        servingVolumeMl: it.servingVolumeMl,
        servingsPerContainer: it.servingsPerContainer,
      });
    }
  }

  const arr = [...map.values()];

  // Derive bottles for drink products: servings ÷ (bottleSize ÷ serving volume), rounded up.
  for (const pi of arr) {
    if (pi.productType === 'drink' && pi.servingVolumeMl && pi.servingVolumeMl > 0) {
      const servingsPerBottle = bottleSizeMl / pi.servingVolumeMl;
      pi.bottles = Math.ceil(pi.count / servingsPerBottle);
    }
  }

  return arr.sort(
    (a, b) => TYPE_ORDER[a.productType] - TYPE_ORDER[b.productType] || a.product.localeCompare(b.product),
  );
}

/**
 * Build a packing list from the computed plan's timeline (Change 1).
 * Counts reconcile exactly with the scheduled timeline items.
 */
export function buildPackList(plan: NutritionPlan, bottleSizeMl: number): PackList {
  const total = aggregate(plan.timeline, bottleSizeMl);

  // Group by leg in a stable, race-order sequence.
  const legOrder = ['T1', 'Bike', 'T2', 'Run', 'swim', 'pre_race'];
  const seen: string[] = [];
  for (const it of plan.timeline) if (!seen.includes(it.segment)) seen.push(it.segment);
  const orderedLegs = seen.sort((a, b) => {
    const ia = legOrder.indexOf(a), ib = legOrder.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const byLeg = orderedLegs.map(leg => ({
    leg,
    items: aggregate(plan.timeline.filter(i => i.segment === leg), bottleSizeMl),
  }));

  // Totals: carbs/sodium reconcile with the timeline; fluid counts packed drink volume only.
  const totals = {
    carbsG:    Math.round(total.reduce((s, p) => s + p.carbs, 0)),
    sodiumMg:  Math.round(total.reduce((s, p) => s + p.sodium, 0)),
    fluidMl:   Math.round(total.filter(p => p.productType === 'drink').reduce((s, p) => s + p.fluid, 0)),
    caffeineMg: Math.round(total.reduce((s, p) => s + p.caffeineMg, 0)),
  };

  // +1 contingency: 1–2 spare gels per racing hour (not added to core totals).
  const fuelMins = plan.segments
    .filter(s => s.carbsGPerHour > 0)
    .reduce((s, seg) => s + seg.durationMins, 0);
  const hours = Math.max(1, Math.ceil(fuelMins / 60));
  const spareGels = { low: hours, high: hours * 2 };

  return { total, byLeg, totals, spareGels, bottleSizeMl };
}
