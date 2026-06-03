import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader2, Thermometer, Droplets, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';
import type { WizardState } from '../../types';
import { geocode, climateAverage, humidityFromTemp } from '../../data/weather';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

type GeoResult = { name: string; country: string; admin1?: string; latitude: number; longitude: number };

function tempColor(t: number) {
  if (t <= 10) return '#60a5fa';
  if (t <= 18) return '#34d399';
  if (t <= 25) return '#fbbf24';
  if (t <= 32) return '#f97316';
  return '#ef4444';
}

function sweatRisk(temp: number, hum: string) {
  const score = temp * 0.7 + (hum === 'high' ? 12 : hum === 'moderate' ? 6 : 0);
  if (score < 14) return { label: 'Low', color: '#34d399' };
  if (score < 22) return { label: 'Moderate', color: '#fbbf24' };
  if (score < 30) return { label: 'High', color: '#f97316' };
  return { label: 'Extreme', color: '#ef4444' };
}

export default function Step05_Conditions({ state, onChange, onNext, onBack }: Props) {
  const race = state.selectedRace;
  const hasRace = state.raceMode === 'event' && race !== null;

  const [query, setQuery] = useState(
    hasRace ? `${race!.city}, ${race!.country}` : '',
  );
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autoFetchedRef = useRef(false);

  // Auto-fetch weather when a race is pre-selected and we haven't done it yet.
  useEffect(() => {
    if (!hasRace || autoFetchedRef.current || state.weatherAuto) return;
    autoFetchedRef.current = true;
    const { lat, lon } = race!.location;
    const month = race!.typicalMonth;
    setFetchingWeather(true);
    climateAverage(lat, lon, month, 15).then(result => {
      if (result) {
        const hum = humidityFromTemp(result.tempCelsius);
        onChange({ tempCelsius: result.tempCelsius, humidity: hum, weatherAuto: true });
        setWeatherInfo(`Typical for ${race!.city} in ${['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month]}: ~${result.tempCelsius}°C`);
      }
    }).catch(() => {}).finally(() => setFetchingWeather(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRace]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await geocode(query);
        setResults(data);
      } catch {
        setResults([]);
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const selectLocation = async (loc: GeoResult) => {
    setResults([]);
    setQuery(`${loc.name}, ${loc.admin1 ?? ''} ${loc.country}`);
    const loc2 = { name: `${loc.name}, ${loc.country}`, lat: loc.latitude, lon: loc.longitude };
    onChange({ location: loc2 });

    if (state.raceDate) {
      setFetchingWeather(true);
      try {
        const date = new Date(state.raceDate);
        const result = await climateAverage(loc.latitude, loc.longitude, date.getMonth() + 1, date.getDate());
        if (result) {
          const hum = humidityFromTemp(result.tempCelsius);
          onChange({ tempCelsius: result.tempCelsius, humidity: hum, weatherAuto: true });
          setWeatherInfo(`Typical for ${loc.name}: ~${result.tempCelsius}°C (avg of ${result.years} years)`);
        }
      } catch {
        // fallback to manual
      }
      setFetchingWeather(false);
    }
  };

  const handleDateChange = async (date: string) => {
    onChange({ raceDate: date });
    if (state.location && date) {
      setFetchingWeather(true);
      try {
        const d = new Date(date);
        const result = await climateAverage(state.location.lat, state.location.lon, d.getMonth() + 1, d.getDate());
        if (result) {
          const hum = humidityFromTemp(result.tempCelsius);
          onChange({ tempCelsius: result.tempCelsius, humidity: hum, weatherAuto: true });
          setWeatherInfo(`Typical: ~${result.tempCelsius}°C based on historical data`);
        }
      } catch {
        // fallback
      }
      setFetchingWeather(false);
    }
  };

  const risk = sweatRisk(state.tempCelsius, state.humidity);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-3rem)] px-4 max-w-md mx-auto w-full py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-5"
      >
        <div className="space-y-2">
          <button onClick={onBack} className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Race conditions
          </h1>
          <p className="text-slate-400 text-sm">Location + date auto-fills weather. You can override below.</p>
        </div>

        {/* Race confirmation banner */}
        {hasRace && (
          <div className="flex items-center gap-3 bg-cyan-500/8 border border-cyan-400/25 rounded-xl px-4 py-3">
            <CheckCircle size={16} className="text-cyan-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-cyan-200 text-sm font-semibold truncate">{race!.name}</p>
              <p className="text-slate-400 text-xs">{race!.city}, {race!.country} · weather auto-loading…</p>
            </div>
          </div>
        )}

        {/* Location search */}
        <div className="space-y-2">
          <label className="text-slate-300 text-sm font-medium">Race location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="City or venue name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
            />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" size={14} />}
          </div>
          {results.length > 0 && (
            <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectLocation(r)}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                >
                  <span className="text-white text-sm">{r.name}</span>
                  <span className="text-slate-500 text-xs ml-2">{r.admin1 && `${r.admin1}, `}{r.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Race date */}
        <div className="space-y-2">
          <label className="text-slate-300 text-sm font-medium">Race date</label>
          <input
            type="date"
            value={state.raceDate ?? ''}
            onChange={e => handleDateChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 text-sm"
          />
        </div>

        {fetchingWeather && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 size={14} className="animate-spin text-cyan-400" />
            Fetching historical weather data…
          </div>
        )}

        {weatherInfo && (
          <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl px-4 py-3 text-cyan-300 text-sm">
            🌤 {weatherInfo}
          </div>
        )}

        {/* Override toggle */}
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">
            {state.weatherAuto ? 'Using auto weather — override?' : 'Manual conditions'}
          </span>
          <button
            onClick={() => onChange({ weatherAuto: !state.weatherAuto })}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {state.weatherAuto ? <ToggleLeft size={28} /> : <ToggleRight size={28} />}
          </button>
        </div>

        {/* Manual controls */}
        {(!state.weatherAuto || !state.location) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-5 overflow-hidden"
          >
            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-white font-semibold text-sm flex items-center gap-2">
                  <Thermometer size={15} />
                  Temperature
                </label>
                <span
                  className="font-mono font-bold text-lg px-3 py-1 rounded-lg bg-white/10"
                  style={{ color: tempColor(state.tempCelsius) }}
                >
                  {state.tempCelsius}°C
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={42}
                value={state.tempCelsius}
                onChange={e => onChange({ tempCelsius: parseInt(e.target.value) })}
              />
              <div className="flex justify-between text-slate-600 text-xs">
                <span>5°C (Cold)</span>
                <span>42°C (Extreme heat)</span>
              </div>
            </div>

            {/* Humidity */}
            <div className="space-y-2">
              <label className="text-white font-semibold text-sm flex items-center gap-2">
                <Droplets size={15} />
                Humidity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'moderate', 'high'] as const).map(h => (
                  <button
                    key={h}
                    onClick={() => onChange({ humidity: h })}
                    className={`py-3 rounded-xl text-sm font-semibold capitalize transition-all ${
                      state.humidity === h
                        ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Sweat risk indicator */}
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <span className="text-slate-400 text-sm">Sweat risk at {state.tempCelsius}°C</span>
          <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ color: risk.color, background: `${risk.color}15` }}>
            {risk.label}
          </span>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 rounded-xl transition-colors text-lg"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
        >
          Continue →
        </button>
      </motion.div>
    </div>
  );
}
