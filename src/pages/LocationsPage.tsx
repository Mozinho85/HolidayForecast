import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, MapPin, Plus, Trash2, PlaneTakeoff, ChevronDown } from 'lucide-react';
import { searchLocations } from '../api/openMeteo';
import { useSavedLocations } from '../context/SavedLocationsContext';
import { countryFlag } from '../utils/weather';
import type { GeoLocation } from '../types';

const UK_AIRPORTS = [
  { code: '', label: 'Any airport' },
  { code: 'LHR', label: 'London Heathrow' },
  { code: 'LGW', label: 'London Gatwick' },
  { code: 'STN', label: 'London Stansted' },
  { code: 'LTN', label: 'London Luton' },
  { code: 'MAN', label: 'Manchester' },
  { code: 'BHX', label: 'Birmingham' },
  { code: 'EDI', label: 'Edinburgh' },
  { code: 'GLA', label: 'Glasgow' },
  { code: 'BRS', label: 'Bristol' },
  { code: 'NCL', label: 'Newcastle' },
  { code: 'LPL', label: 'Liverpool' },
  { code: 'EMA', label: 'East Midlands' },
  { code: 'LBA', label: 'Leeds Bradford' },
  { code: 'ABZ', label: 'Aberdeen' },
  { code: 'BFS', label: 'Belfast International' },
  { code: 'CWL', label: 'Cardiff' },
  { code: 'SOU', label: 'Southampton' },
  { code: 'EXT', label: 'Exeter' },
  { code: 'BOH', label: 'Bournemouth' },
] as const;

export default function LocationsPage() {
  const { locations, addLocation, removeLocation, preferredAirport, setPreferredAirport } = useSavedLocations();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['location-search', debouncedQuery],
    queryFn: () => searchLocations(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  // Close results on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = useCallback(
    (geo: GeoLocation) => {
      addLocation(geo);
      setQuery('');
      setShowResults(false);
    },
    [addLocation]
  );

  const savedIds = new Set(locations.map((l) => l.id));

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Destinations</h1>
        <p className="mt-1 text-sm text-slate-400">
          Add travel destinations to track their weather
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search cities..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {showResults && debouncedQuery.length >= 2 && (
          <div
            ref={resultsRef}
            className="absolute top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-primary-400" />
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                No cities found
              </div>
            ) : (
              results.map((geo) => {
                const isSaved = savedIds.has(geo.id);
                return (
                  <button
                    key={geo.id}
                    onClick={() => !isSaved && handleSelect(geo)}
                    disabled={isSaved}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isSaved
                        ? 'bg-slate-800/50 text-slate-500'
                        : 'hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span className="text-lg">{countryFlag(geo.country_code)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {geo.name}
                        {geo.admin1 && (
                          <span className="text-slate-400">, {geo.admin1}</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{geo.country}</p>
                    </div>
                    {isSaved ? (
                      <span className="text-xs text-slate-500">Added</span>
                    ) : (
                      <Plus className="h-4 w-4 flex-shrink-0 text-primary-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Preferred airport */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Preferred Airport
        </h2>
        <div className="relative">
          <PlaneTakeoff className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <select
            value={preferredAirport}
            onChange={(e) => setPreferredAirport(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-10 text-sm text-white outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
          >
            {UK_AIRPORTS.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code ? `${a.label} (${a.code})` : a.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          Used as departure airport when searching holidays on Skyscanner
        </p>
      </div>

      {/* Saved locations list */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Saved Destinations ({locations.length})
        </h2>

        {locations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-700 py-12 text-center">
            <MapPin className="h-10 w-10 text-slate-600" />
            <div>
              <p className="text-sm font-medium text-slate-400">
                No destinations yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Search for a city above to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 stagger-children">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 transition-colors hover:border-slate-700"
              >
                <span className="text-xl">{countryFlag(loc.country_code)}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {loc.name}
                    {loc.admin1 && (
                      <span className="text-slate-400">, {loc.admin1}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{loc.country}</p>
                </div>
                <button
                  onClick={() => removeLocation(loc.id)}
                  className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  aria-label={`Remove ${loc.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
