import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { MapPin, RefreshCw, Thermometer, ArrowUpDown } from 'lucide-react';
import { useSavedLocations } from '../context/SavedLocationsContext';
import { getWeatherForecast } from '../api/openMeteo';
import { averageScore } from '../utils/weatherScore';
import { buildExpediaPackageSearchUrl, buildHolidaySearchUrl } from '../utils/holidaySearch';
import DateStrip from '../components/DateStrip';
import WeatherCard from '../components/WeatherCard';
import DetailSheet from '../components/DetailSheet';
import type { SavedLocation, DailyForecast } from '../types';

export default function ForecastPage() {
  const {
    locations,
    temperatureUnit,
    toggleUnit,
    selectedDates,
    preferredAirport,
  } = useSavedLocations();
  const navigate = useNavigate();
  const location = useLocation();

  // Detail sheet state
  const [detailTarget, setDetailTarget] = useState<{
    location: SavedLocation;
    forecast: DailyForecast;
  } | null>(null);

  // If navigated here with state to open a detail, open it
  useEffect(() => {
    const s: any = location.state;
    if (s && s.openDetail) {
      const { locId, date } = s.openDetail as { locId: number; date: string };
      const idx = locations.findIndex((l) => l.id === locId);
      if (idx !== -1) {
        const forecasts = weatherQueries[idx]?.data as DailyForecast[] | undefined;
        const forecast = forecasts?.find((f) => f.date === date) as DailyForecast | undefined;
        if (forecast) {
          setDetailTarget({ location: locations[idx], forecast });
        }
      }
      // clear the navigation state so it doesn't reopen
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, locations, weatherQueries]);

  const handleSelectDay = useCallback(
    (location: SavedLocation, forecast: DailyForecast) => {
      setDetailTarget({ location, forecast });
    },
    []
  );

  // Open Google Flights for a location using the currently selected dates
  const handleSearchHolidays = useCallback(
    (location: SavedLocation) => {
      if (selectedDates.length === 0) return;
      const url = buildHolidaySearchUrl(location.name, selectedDates, preferredAirport);
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [selectedDates, preferredAirport]
  );

  // Open Expedia packages for a location using the currently selected dates
  const handleSearchPackages = useCallback(
    (location: SavedLocation) => {
      if (selectedDates.length === 0) return;
      const url = buildExpediaPackageSearchUrl(
        location.name,
        selectedDates,
        preferredAirport,
        location.admin1,
        location.country
      );
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [selectedDates, preferredAirport]
  );

  // Sort state
  const [isSorted, setIsSorted] = useState(false);

  // Fetch weather for all saved locations
  const weatherQueries = useQueries({
    queries: locations.map((loc) => ({
      queryKey: ['weather', loc.id, loc.latitude, loc.longitude, temperatureUnit],
      queryFn: () => getWeatherForecast(loc.latitude, loc.longitude, temperatureUnit),
      staleTime: 1000 * 60 * 30,
    })),
  });

  const isLoading = weatherQueries.some((q) => q.isLoading);
  const isRefetching = weatherQueries.some((q) => q.isRefetching);

  // Generate 16 days starting from today
  const next16Days = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 0; i < 16; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  const handleRefresh = () => {
    weatherQueries.forEach((q) => q.refetch());
  };

  const unitLabel = temperatureUnit === 'celsius' ? '°C' : '°F';

  // Build scored + sorted list of location indices
  const scoredIndices = useMemo(() => {
    const entries = locations.map((_loc, i) => {
      const forecasts = weatherQueries[i]?.data;
      if (!forecasts) return { index: i, score: 0 };
      const selected = forecasts.filter((f) => selectedDates.includes(f.date));
      return { index: i, score: averageScore(selected, temperatureUnit) };
    });
    if (isSorted) {
      entries.sort((a, b) => b.score - a.score);
    }
    return entries;
  }, [locations, weatherQueries, selectedDates, temperatureUnit, isSorted]);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Holicast</h1>
          <p className="text-xs text-slate-400">Holiday weather forecast</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleUnit}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
            title="Toggle temperature unit"
          >
            <Thermometer className="h-3.5 w-3.5" />
            {unitLabel}
          </button>
          <button
            onClick={() => setIsSorted((s) => !s)}
            className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              isSorted
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-white'
            }`}
            title="Sort by best weather"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:opacity-50"
            title="Refresh forecasts"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Date selector strip */}
      <DateStrip days={next16Days} />

      {/* Content */}
      {locations.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-4 pt-20 text-center">
          <div className="rounded-full bg-slate-800/50 p-5">
            <MapPin className="h-10 w-10 text-slate-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-300">
              No destinations added
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add your travel destinations to see their weather forecast
            </p>
          </div>
          <button
            onClick={() => navigate('/locations')}
            className="mt-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
          >
            Add Destination
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center gap-3 px-4 pt-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-primary-400" />
          <p className="text-sm text-slate-400">Loading forecasts...</p>
        </div>
      ) : selectedDates.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-4 pt-20 text-center">
          <div className="rounded-full bg-white/60 p-5">
            <div className="h-10 w-10 rounded-full bg-sky-100" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">Select date to see the forecast</p>
            <p className="mt-1 text-sm text-slate-500">Tap a date above to view forecasts for that day.</p>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4 stagger-children">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {scoredIndices.map(({ index: i, score }) => {
              const loc = locations[i];
              const query = weatherQueries[i];
              const forecasts = query?.data;
              if (!forecasts) return null;

              // Filter to selected dates
              const selectedForecasts = forecasts.filter((f) =>
                selectedDates.includes(f.date)
              );

              return (
                <WeatherCard
                  key={loc.id}
                  location={loc}
                  forecasts={selectedForecasts}
                  allForecasts={forecasts}
                  temperatureUnit={temperatureUnit}
                  isError={query.isError}
                  onSelectDay={handleSelectDay}
                  onSearchHolidays={handleSearchHolidays}
                  onSearchPackages={handleSearchPackages}
                  score={isSorted ? score : null}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Detail sheet */}
      {detailTarget && (
        <DetailSheet
          location={detailTarget.location}
          forecast={detailTarget.forecast}
          temperatureUnit={temperatureUnit}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  );
}
