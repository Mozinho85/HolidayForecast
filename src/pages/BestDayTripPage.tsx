

import { Trophy, Plane } from 'lucide-react';
import { useSavedLocations } from '../context/SavedLocationsContext';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { getWeatherForecast } from '../api/openMeteo';
import { scoreForecast, scoreColor } from '../utils/weatherScore';
import { getWeatherInfo, countryFlag, formatDay, formatDate } from '../utils/weather';
import { buildHolidaySearchUrl } from '../utils/holidaySearch';
import type { SavedLocation, DailyForecast } from '../types';

export default function BestDayTripPage() {
  const { locations, temperatureUnit, preferredAirport } = useSavedLocations();
  const { setSelectedDates } = useSavedLocations();
  const navigate = useNavigate();

  // Fetch weather for all saved locations
  const weatherQueries = useQueries({
    queries: locations.map((loc) => ({
      queryKey: ['weather', loc.id, loc.latitude, loc.longitude, temperatureUnit],
      queryFn: () => getWeatherForecast(loc.latitude, loc.longitude, temperatureUnit),
      staleTime: 1000 * 60 * 30,
    })),
  });

  // Generate 16 days starting from today
  const next16Days = (() => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 0; i < 16; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  })();

  // For each day, pick the best destination (highest weather score)
  const bestPerDay = next16Days.map((date) => {
    let best: { loc: SavedLocation; forecast: DailyForecast; score: number } | null = null;
    locations.forEach((loc, i) => {
      const forecasts = weatherQueries[i]?.data as DailyForecast[] | undefined;
      if (!forecasts) return;
      const forecast = forecasts.find((f) => f.date === date);
      if (!forecast) return;
      const score = scoreForecast(forecast, temperatureUnit);
      if (best === null || score > best.score) {
        best = { loc, forecast, score };
      }
    });
    if (best) {
      const b = best as { loc: SavedLocation; forecast: DailyForecast; score: number };
      return { date, loc: b.loc, forecast: b.forecast, score: b.score };
    }
    return null;
  });

  const isLoading = weatherQueries.some((q) => q.isLoading);

  // Find top 5 scoring days
  const top5 = bestPerDay
    .filter(Boolean)
    .sort((a, b) => (b && a ? b.score - a.score : 0))
    .slice(0, 5)
    .map((entry) => entry && entry.date);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-20">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
        <Trophy className="h-6 w-6 text-amber-400" />
        Best Day Trip
      </h1>
      <p className="text-sm text-slate-400 mb-6">See the best destination to visit on each day, based on the weather forecast and your saved locations.</p>

      {locations.length === 0 ? (
        <div className="text-center text-slate-400 mt-20">Add destinations to see recommendations.</div>
      ) : isLoading ? (
        <div className="flex flex-col items-center gap-3 pt-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-primary-400" />
          <p className="text-sm text-slate-400">Loading forecasts...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bestPerDay.map((entry) =>
            entry ? (
              <div
                key={entry.date}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDates([entry.date]);
                    navigate('/', { state: { openDetail: { locId: entry.loc.id, date: entry.date } } });
                  }
                }}
                onClick={() => {
                  setSelectedDates([entry.date]);
                  navigate('/', { state: { openDetail: { locId: entry.loc.id, date: entry.date } } });
                }}
                className={`flex items-center gap-3 rounded-xl border bg-slate-900/70 p-3 ${
                  top5.includes(entry.date)
                    ? 'border-amber-400/80 shadow-lg shadow-amber-400/10'
                    : 'border-slate-800'
                }`}
              
              >
              >
                <span className="w-16 text-xs text-slate-400 font-semibold">
                  {formatDay(entry.date)}<br />
                  <span className="text-[11px] text-slate-500">{formatDate(entry.date)}</span>
                </span>
                <span className="text-xl">{countryFlag(entry.loc.country_code)}</span>
                <span className="ml-2">
                  {
                    (() => {
                      const info = getWeatherInfo(
                        entry.forecast.daytimeWeatherCode ?? entry.forecast.weatherCode
                      );
                      const Icon = info.icon;
                      return <Icon className="h-6 w-6 text-slate-300" />;
                    })()
                  }
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{entry.loc.name}</div>
                  <div className="text-xs text-slate-400 truncate">{entry.loc.country}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${scoreColor(entry.score)}`}>{entry.score}</span>
                  <span className="text-xs text-slate-400 mt-1">{getWeatherInfo(entry.forecast.daytimeWeatherCode ?? entry.forecast.weatherCode).label}</span>
                  <span className="text-sm font-bold text-white mt-1">{entry.forecast.tempMax}°</span>
                  <button
                    className="mt-2 flex items-center gap-1 rounded-lg border border-sky-400 bg-sky-500/10 px-2 py-1 text-xs font-semibold text-sky-400 hover:bg-sky-500/20"
                    onClick={(e) => {
                      // prevent parent navigation
                      e.stopPropagation();
                      const url = buildHolidaySearchUrl(
                        entry.loc.name,
                        [entry.date],
                        preferredAirport
                      );
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <Plane className="h-4 w-4" />
                    Search Flights
                  </button>
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
