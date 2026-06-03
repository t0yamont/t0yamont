import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Shield, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { WizardState, Race } from '../../types';
import { getRacesForSportAndDistance, searchRaces, groupBySeries, aidStationSummary } from '../../data/races';

interface Props {
  state: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const AID_EMOJI: Record<string, string> = {
  water: '💧', carb_drink: '🟡', gel: '🔵', cola: '⚫', fruit: '🍌', bar: '🟤', ice: '🧊',
};

function AidBadge({ items }: { items: string[] }) {
  return (
    <span className="flex flex-wrap gap-0.5">
      {items.map(i => <span key={i} title={i}>{AID_EMOJI[i] ?? '•'}</span>)}
    </span>
  );
}

function RaceCard({ race, selected, onSelect }: { race: Race; selected: boolean; onSelect: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const summary = aidStationSummary(race);

  return (
    <motion.div
      layout
      className={`border rounded-xl overflow-hidden transition-colors ${
        selected
          ? 'bg-cyan-500/10 border-cyan-400/50'
          : 'bg-white/3 border-white/10 hover:border-white/20'
      }`}
    >
      <button
        onClick={onSelect}
        className="w-full flex items-start gap-3 px-4 py-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white text-sm font-semibold leading-tight">{race.name}</span>
            {race.sponsorRestricted && (
              <span className="flex items-center gap-1 bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                <Shield size={10} />
                Sponsor brand
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <MapPin size={11} className="text-slate-500 flex-shrink-0" />
            <span className="text-slate-400 text-xs">{race.city}, {race.country}</span>
            <span className="text-slate-600 text-xs">·</span>
            <Calendar size={11} className="text-slate-500 flex-shrink-0" />
            <span className="text-slate-400 text-xs">typically {MONTH_NAMES[race.typicalMonth]}</span>
          </div>
        </div>
        {selected ? (
          <CheckCircle size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
        ) : (
          <div className="w-4.5 h-4.5 rounded-full border-2 border-white/20 flex-shrink-0 mt-0.5" />
        )}
      </button>

      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-3 space-y-3 border-t border-white/5 pt-3">
            {race.sponsorRestricted && race.allowedBrands && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-400/25 rounded-lg p-3">
                <Shield size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-200 text-xs leading-relaxed">
                  <strong>Official sponsor brands only</strong> at on-course aid stations:{' '}
                  {race.allowedBrands.map(b => b === 'precision' ? 'Precision Fuel & Hydration' : 'Maurten').join(' & ')}.
                  You can carry any brand, but only these will be available to grab.
                </p>
              </div>
            )}

            {race.aidStations.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="flex items-center gap-1.5 text-slate-400 text-xs hover:text-white transition-colors"
                >
                  <span>Aid stations</span>
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {!expanded && (
                  <div className="flex gap-4 text-xs">
                    {summary.bikeCount > 0 && (
                      <span className="text-slate-400">
                        🚲 {summary.bikeCount} bike{summary.bikeHasGel && ' (gels on course)'}
                      </span>
                    )}
                    {summary.runCount > 0 && (
                      <span className="text-slate-400">
                        🏃 {summary.runCount} run{summary.runHasGel && ' (gels on course)'}
                      </span>
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1.5">
                        {race.aidStations.map((a, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs">
                            <span className="text-slate-500 font-mono w-14 flex-shrink-0">
                              {a.segment === 'bike' ? '🚲' : '🏃'} km {a.km}
                            </span>
                            <AidBadge items={a.has} />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Step03_RaceSelector({ state, onChange, onNext, onBack }: Props) {
  const [query, setQuery] = useState('');

  const sport    = state.sport ?? 'triathlon';
  const distance = state.raceDistance ?? '70.3';

  const allRaces   = useMemo(() => getRacesForSportAndDistance(sport, distance), [sport, distance]);
  const filtered   = useMemo(() => searchRaces(allRaces, query), [allRaces, query]);
  const grouped    = useMemo(() => groupBySeries(filtered), [filtered]);

  const selected   = state.selectedRace;

  const selectRace = (race: Race) => {
    onChange({
      selectedRace: race,
      raceMode: 'event',
      location: { name: `${race.city}, ${race.country}`, lat: race.location.lat, lon: race.location.lon },
      weatherAuto: false,
    });
  };

  const selectGeneric = () => {
    onChange({ selectedRace: null, raceMode: 'generic' });
  };

  const canProceed = state.raceMode === 'event' ? state.selectedRace !== null : state.raceMode === 'generic';

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
            Your race
          </h1>
          <p className="text-slate-400 text-sm">
            Select a race to auto-fill location, weather, and on-course nutrition.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search races…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
          />
        </div>

        {/* Race list grouped by series */}
        <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">
              No races found — try a different search or use "just the distance" below.
            </p>
          )}

          {[...grouped.entries()].map(([series, races]) => (
            <div key={series} className="space-y-2">
              <p className="text-slate-500 text-xs uppercase tracking-widest">{series}</p>
              <div className="space-y-2">
                {races.map(race => (
                  <RaceCard
                    key={race.id}
                    race={race}
                    selected={selected?.id === race.id}
                    onSelect={() => selectRace(race)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Generic option */}
        <button
          onClick={selectGeneric}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
            state.raceMode === 'generic'
              ? 'bg-slate-500/15 border-slate-400/40'
              : 'bg-white/3 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">Race not listed — use just the distance</p>
            <p className="text-slate-500 text-xs mt-0.5">Enter location and conditions manually on the next step</p>
          </div>
          {state.raceMode === 'generic' ? (
            <CheckCircle size={18} className="text-slate-400 flex-shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-white/20 flex-shrink-0" />
          )}
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-white font-bold py-4 rounded-xl transition-colors text-lg"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
        >
          Continue →
        </button>
      </motion.div>
    </div>
  );
}
