import type { Race, Sport, RaceDistance } from '../types';
import { TRI_RACES } from './races.tri';
import { RUN_RACES } from './races.run';
import { BIKE_RACES } from './races.bike';

export const ALL_RACES: Race[] = [...TRI_RACES, ...RUN_RACES, ...BIKE_RACES];

export function getRacesForSportAndDistance(sport: Sport, distance: RaceDistance): Race[] {
  return ALL_RACES.filter(r => r.sport === sport && r.distance === distance);
}

export function getRaceById(id: string): Race | null {
  return ALL_RACES.find(r => r.id === id) ?? null;
}

/** Group races by region (preserving insertion order within each group). */
export function groupByRegion(races: Race[]): Map<string, Race[]> {
  const map = new Map<string, Race[]>();
  for (const race of races) {
    const group = map.get(race.region) ?? [];
    group.push(race);
    map.set(race.region, group);
  }
  return map;
}

/** Group races by series (e.g., IRONMAN, IRONMAN 70.3), with a fallback group 'Other'. */
export function groupBySeries(races: Race[]): Map<string, Race[]> {
  const map = new Map<string, Race[]>();
  for (const race of races) {
    const key = race.series ?? 'Other';
    const group = map.get(key) ?? [];
    group.push(race);
    map.set(key, group);
  }
  return map;
}

export function searchRaces(races: Race[], query: string): Race[] {
  const q = query.toLowerCase().trim();
  if (!q) return races;
  return races.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.city.toLowerCase().includes(q) ||
    r.country.toLowerCase().includes(q) ||
    (r.series?.toLowerCase().includes(q) ?? false) ||
    r.region.toLowerCase().includes(q),
  );
}

/** Count aid stations per segment for display. */
export function aidStationSummary(race: Race): { bikeCount: number; runCount: number; bikeHasGel: boolean; runHasGel: boolean } {
  const bike = race.aidStations.filter(a => a.segment === 'bike');
  const run  = race.aidStations.filter(a => a.segment === 'run');
  return {
    bikeCount:  bike.length,
    runCount:   run.length,
    bikeHasGel: bike.some(a => a.has.includes('gel')),
    runHasGel:  run.some(a => a.has.includes('gel')),
  };
}
