import type { Sport, RaceDistance } from '../types';

export interface DistancePreset {
  id: RaceDistance;
  label: string;
  subtitle: string;
  defaultSplits: {
    swimMins: number;
    bikeMins: number;
    runMins: number;
  };
  sliderRanges: {
    swimMin: number; swimMax: number;
    bikeMin: number; bikeMax: number;
    runMin: number; runMax: number;
  };
}

export interface SportConfig {
  id: Sport;
  label: string;
  icon: string;
  legs: Array<'swim' | 'bike' | 'run'>;
  distances: DistancePreset[];
}

export const SPORTS: Record<Sport, SportConfig> = {
  triathlon: {
    id: 'triathlon',
    label: 'Triathlon',
    icon: '🏊‍♂️🚴‍♂️🏃‍♂️',
    legs: ['swim', 'bike', 'run'],
    distances: [
      {
        id: 'sprint',
        label: 'Sprint',
        subtitle: '750m / 20km / 5km',
        defaultSplits: { swimMins: 15, bikeMins: 40, runMins: 25 },
        sliderRanges: { swimMin: 8, swimMax: 30, bikeMin: 25, bikeMax: 60, runMin: 15, runMax: 40 },
      },
      {
        id: 'olympic',
        label: 'Olympic',
        subtitle: '1.5km / 40km / 10km',
        defaultSplits: { swimMins: 25, bikeMins: 70, runMins: 50 },
        sliderRanges: { swimMin: 16, swimMax: 45, bikeMin: 50, bikeMax: 100, runMin: 35, runMax: 80 },
      },
      {
        id: '70.3',
        label: 'Half Ironman',
        subtitle: '1.9km / 90km / 21.1km',
        defaultSplits: { swimMins: 35, bikeMins: 155, runMins: 110 },
        sliderRanges: { swimMin: 25, swimMax: 60, bikeMin: 120, bikeMax: 210, runMin: 80, runMax: 180 },
      },
      {
        id: 'full',
        label: 'Full Ironman',
        subtitle: '3.8km / 180km / 42.2km',
        defaultSplits: { swimMins: 70, bikeMins: 330, runMins: 270 },
        sliderRanges: { swimMin: 50, swimMax: 120, bikeMin: 240, bikeMax: 450, runMin: 180, runMax: 420 },
      },
    ],
  },
  cycling: {
    id: 'cycling',
    label: 'Cycling',
    icon: '🚴‍♂️',
    legs: ['bike'],
    distances: [
      {
        id: 'crit',
        label: 'Criterium',
        subtitle: '30–60 min race',
        defaultSplits: { swimMins: 0, bikeMins: 45, runMins: 0 },
        sliderRanges: { swimMin: 0, swimMax: 0, bikeMin: 20, bikeMax: 90, runMin: 0, runMax: 0 },
      },
      {
        id: 'gran_fondo',
        label: 'Gran Fondo',
        subtitle: '80–120km',
        defaultSplits: { swimMins: 0, bikeMins: 180, runMins: 0 },
        sliderRanges: { swimMin: 0, swimMax: 0, bikeMin: 120, bikeMax: 300, runMin: 0, runMax: 0 },
      },
      {
        id: 'century',
        label: 'Century',
        subtitle: '100 miles / 160km',
        defaultSplits: { swimMins: 0, bikeMins: 360, runMins: 0 },
        sliderRanges: { swimMin: 0, swimMax: 0, bikeMin: 240, bikeMax: 480, runMin: 0, runMax: 0 },
      },
      {
        id: 'ultra',
        label: 'Ultra',
        subtitle: '200km+',
        defaultSplits: { swimMins: 0, bikeMins: 600, runMins: 0 },
        sliderRanges: { swimMin: 0, swimMax: 0, bikeMin: 360, bikeMax: 900, runMin: 0, runMax: 0 },
      },
    ],
  },
  running: {
    id: 'running',
    label: 'Running',
    icon: '🏃‍♂️',
    legs: ['run'],
    distances: [
      {
        id: '10k',
        label: '10K',
        subtitle: '10 kilometres',
        defaultSplits: { swimMins: 0, bikeMins: 0, runMins: 50 },
        sliderRanges: { swimMin: 0, swimMax: 0, bikeMin: 0, bikeMax: 0, runMin: 28, runMax: 90 },
      },
      {
        id: 'half_marathon',
        label: 'Half Marathon',
        subtitle: '21.1 kilometres',
        defaultSplits: { swimMins: 0, bikeMins: 0, runMins: 110 },
        sliderRanges: { swimMin: 0, swimMax: 0, bikeMin: 0, bikeMax: 0, runMin: 60, runMax: 180 },
      },
      {
        id: 'marathon',
        label: 'Marathon',
        subtitle: '42.2 kilometres',
        defaultSplits: { swimMins: 0, bikeMins: 0, runMins: 240 },
        sliderRanges: { swimMin: 0, swimMax: 0, bikeMin: 0, bikeMax: 0, runMin: 120, runMax: 420 },
      },
      {
        id: 'ultra_run',
        label: 'Ultra',
        subtitle: '50km–100miles',
        defaultSplits: { swimMins: 0, bikeMins: 0, runMins: 480 },
        sliderRanges: { swimMin: 0, swimMax: 0, bikeMin: 0, bikeMax: 0, runMin: 240, runMax: 1440 },
      },
    ],
  },
};
