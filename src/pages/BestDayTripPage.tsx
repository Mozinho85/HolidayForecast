

import { Trophy, Plane } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useSavedLocations } from '../context/SavedLocationsContext';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { getWeatherForecast } from '../api/openMeteo';
import { scoreForecast, scoreColor } from '../utils/weatherScore';
import { getWeatherInfo, countryFlag, formatDay, formatDate, getTempMappedBackground } from '../utils/weather';
import { buildHolidaySearchUrl, buildExpediaPackageSearchUrl } from '../utils/holidaySearch';
import BestDayTripFilter, { type BestDayTripFilterType } from '../components/BestDayTripFilter';
import BreakSummarySheet from '../components/BreakSummarySheet';
import type { SavedLocation, DailyForecast } from '../types';


export default function BestDayTripPage() {
  // State for break summary sheet
  const [breakSheet, setBreakSheet] = useState<null | { loc: SavedLocation; dates: string[] }>(null);
  const { locations, temperatureUnit, preferredAirport } = useSavedLocations();
  const { setSelectedDates } = useSavedLocations();
  const navigate = useNavigate();

  // Filter state
  const [filter, setFilter] = useState<BestDayTripFilterType>('default');
  const [destinationId, setDestinationId] = useState<number | null>(null);
  const [breakLength, setBreakLength] = useState<number>(3);
  const todayStr = new Date().toISOString().split('T')[0];
  const [breakRange, setBreakRange] = useState<{ start: string; end: string }>({
    start: todayStr,
    end: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 15);
      return d.toISOString().split('T')[0];
    })(),
  });

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


  // Default: For each day, pick the best destination (highest weather score)
  const bestPerDay = useMemo(() => next16Days.map((date) => {
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
  }), [locations, weatherQueries, temperatureUnit, next16Days]);

  // Destination: For a selected destination, rank all days by weather score
  const destinationDays = useMemo(() => {
    if (!destinationId) return [];
    const idx = locations.findIndex((l) => l.id === destinationId);
    if (idx === -1) return [];
    const forecasts = weatherQueries[idx]?.data as DailyForecast[] | undefined;
    if (!forecasts) return [];
    return next16Days
      .map((date) => {
        const forecast = forecasts.find((f) => f.date === date);
        if (!forecast) return null;
        const score = scoreForecast(forecast, temperatureUnit);
        return { date, loc: locations[idx], forecast, score };
      })
      .filter(Boolean)
      .sort((a, b) => (b && a ? b.score - a.score : 0));
  }, [destinationId, locations, weatherQueries, temperatureUnit, next16Days]);

  // Best X day break: Find the best consecutive X days in a range for each location
  const bestBreaks = useMemo(() => {
    // Get all days in range
    const start = new Date(breakRange.start);
    const end = new Date(breakRange.end);
    const days: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toISOString().split('T')[0]);
    }
    if (breakLength < 2 || days.length < breakLength) return [];
    // For each location, slide a window of breakLength and score
    return locations.map((loc, i) => {
      const forecasts = weatherQueries[i]?.data as DailyForecast[] | undefined;
      if (!forecasts) return null;
      let bestScore = -Infinity;
      let bestWindow: { dates: string[]; score: number; forecasts: DailyForecast[] } | null = null;
      for (let j = 0; j <= days.length - breakLength; j++) {
        const windowDates = days.slice(j, j + breakLength);
        const windowForecasts = windowDates.map(date => forecasts.find(f => f.date === date)).filter(Boolean) as DailyForecast[];
        if (windowForecasts.length !== breakLength) continue;
        const score = windowForecasts.reduce((sum, f) => sum + scoreForecast(f, temperatureUnit), 0) / breakLength;
        if (score > bestScore) {
          bestScore = score;
          bestWindow = { dates: windowDates, score, forecasts: windowForecasts };
        }
      }
      if (bestWindow) {
        return { loc, ...bestWindow };
      }
      return null;
    }).filter(Boolean).sort((a, b) => (b && a ? b.score - a.score : 0));
  }, [locations, weatherQueries, temperatureUnit, breakLength, breakRange]);

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
      <p className="text-sm text-slate-400 mb-6">See the best destination to visit on each day, or use filters to find the best days for a destination or the best break.</p>

      <BestDayTripFilter
        filter={filter}
        setFilter={setFilter}
        destinationId={destinationId}
        setDestinationId={setDestinationId}
        breakLength={breakLength}
        setBreakLength={setBreakLength}
        breakRange={breakRange}
        setBreakRange={setBreakRange}
        locations={locations.map(l => ({ id: l.id, name: l.name }))}
      />

      {locations.length === 0 ? (
        <div className="text-center text-slate-400 mt-20">Add destinations to see recommendations.</div>
      ) : isLoading ? (
        <div className="flex flex-col items-center gap-3 pt-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-primary-400" />
          <p className="text-sm text-slate-400">Loading forecasts...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filter === 'default' && bestPerDay.map((entry) =>
            entry ? (
              <div
                key={entry.date}
                className={`flex items-center gap-3 rounded-xl border p-3 shadow-sm backdrop-blur-md cursor-pointer ${
                  top5.includes(entry.date)
                    ? 'border-white/40 shadow-lg'
                    : 'border-white/10'
                }`}
                style={{ backgroundColor: getTempMappedBackground((entry.forecast.tempMax + entry.forecast.tempMin) / 2, temperatureUnit) }}
                onClick={() => setBreakSheet({ loc: entry.loc, dates: [entry.date] })}
              >
                <div className="absolute inset-0 rounded-xl bg-slate-900/40 pointer-events-none" />
                <span className="relative z-10 w-16 text-xs text-slate-200 font-semibold drop-shadow-sm">
                  {formatDay(entry.date)}<br />
                  <span className="text-[11px] text-slate-300">{formatDate(entry.date)}</span>
                </span>
                <span className="relative z-10 text-xl drop-shadow-sm">{countryFlag(entry.loc.country_code)}</span>
                <span className="relative z-10 ml-2">
                  {
                    (() => {
                      const info = getWeatherInfo(
                        entry.forecast.daytimeWeatherCode ?? entry.forecast.weatherCode
                      );
                      const Icon = info.icon;
                      return <Icon className="h-6 w-6 text-white drop-shadow-sm" />;
                    })()
                  }
                </span>
                <div className="relative z-10 flex-1 min-w-0">
                  <div className="font-semibold text-white truncate drop-shadow-sm">{entry.loc.name}</div>
                  <div className="text-xs text-slate-200 truncate drop-shadow-sm">{entry.loc.country}</div>
                </div>
                <div className="relative z-10 flex flex-col items-end">
                  <span className={`rounded-full border border-white/20 bg-black/20 px-2 py-0.5 text-xs font-bold ${scoreColor(entry.score)} shadow-sm`}>{entry.score}</span>
                  <span className="text-xs text-slate-200 mt-1 drop-shadow-sm">{getWeatherInfo(entry.forecast.daytimeWeatherCode ?? entry.forecast.weatherCode).label}</span>
                  <span className="text-sm font-bold text-white mt-1 drop-shadow-sm">{entry.forecast.tempMax}°</span>
                  <button
                    className="mt-2 flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/20 shadow-sm backdrop-blur-sm"
                    onClick={e => {
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
          {filter === 'destination' && destinationDays.map((entry) =>
            entry ? (
              <div
                key={entry.date}
                className="flex items-center gap-3 rounded-xl border p-3 shadow-sm backdrop-blur-md border-white/10 cursor-pointer"
                style={{ backgroundColor: getTempMappedBackground((entry.forecast.tempMax + entry.forecast.tempMin) / 2, temperatureUnit) }}
                onClick={() => setBreakSheet({ loc: entry.loc, dates: [entry.date] })}
              >
                <span className="w-16 text-xs text-slate-200 font-semibold drop-shadow-sm">
                  {formatDay(entry.date)}<br />
                  <span className="text-[11px] text-slate-300">{formatDate(entry.date)}</span>
                </span>
                <span className="text-xl drop-shadow-sm">{countryFlag(entry.loc.country_code)}</span>
                <span className="ml-2">
                  {
                    (() => {
                      const info = getWeatherInfo(
                        entry.forecast.daytimeWeatherCode ?? entry.forecast.weatherCode
                      );
                      const Icon = info.icon;
                      return <Icon className="h-6 w-6 text-white drop-shadow-sm" />;
                    })()
                  }
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate drop-shadow-sm">{entry.loc.name}</div>
                  <div className="text-xs text-slate-200 truncate drop-shadow-sm">{entry.loc.country}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`rounded-full border border-white/20 bg-black/20 px-2 py-0.5 text-xs font-bold ${scoreColor(entry.score)} shadow-sm`}>{entry.score}</span>
                  <span className="text-xs text-slate-200 mt-1 drop-shadow-sm">{getWeatherInfo(entry.forecast.daytimeWeatherCode ?? entry.forecast.weatherCode).label}</span>
                  <span className="text-sm font-bold text-white mt-1 drop-shadow-sm">{entry.forecast.tempMax}°</span>
                  <button
                    className="mt-2 flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/20 shadow-sm backdrop-blur-sm"
                    onClick={e => {
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
          {filter === 'best-break' && bestBreaks.map((entry) =>
            entry ? (
              <div
                key={entry.loc.id}
                className="flex items-center gap-3 rounded-xl border p-3 shadow-sm backdrop-blur-md border-white/10 cursor-pointer"
                style={{ backgroundColor: getTempMappedBackground((entry.forecasts[0].tempMax + entry.forecasts[0].tempMin) / 2, temperatureUnit) }}
                onClick={() => setBreakSheet({ loc: entry.loc, dates: entry.dates })}
              >
                <span className="w-16 text-xs text-slate-200 font-semibold drop-shadow-sm">
                  {formatDay(entry.dates[0])} - {formatDay(entry.dates[entry.dates.length-1])}<br />
                  <span className="text-[11px] text-slate-300">{formatDate(entry.dates[0])} - {formatDate(entry.dates[entry.dates.length-1])}</span>
                </span>
                <span className="text-xl drop-shadow-sm">{countryFlag(entry.loc.country_code)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate drop-shadow-sm">{entry.loc.name}</div>
                  <div className="text-xs text-slate-200 truncate drop-shadow-sm">{entry.loc.country}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`rounded-full border border-white/20 bg-black/20 px-2 py-0.5 text-xs font-bold ${scoreColor(entry.score)} shadow-sm`}>{Math.round(entry.score)}</span>
                  <span className="text-xs text-slate-200 mt-1 drop-shadow-sm">Avg. Score</span>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/20 shadow-sm backdrop-blur-sm"
                      onClick={e => {
                        e.stopPropagation();
                        const url = buildHolidaySearchUrl(
                          entry.loc.name,
                          entry.dates,
                          preferredAirport
                        );
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <Plane className="h-4 w-4" />
                      Search Flights
                    </button>
                    <button
                      className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/20 shadow-sm backdrop-blur-sm"
                      onClick={e => {
                        e.stopPropagation();
                        const url = buildExpediaPackageSearchUrl(
                          entry.loc.name,
                          entry.dates,
                          preferredAirport,
                          entry.loc.admin1,
                          entry.loc.country
                        );
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <span className="h-4 w-4">🏨</span>
                      Expedia
                    </button>
                  </div>
                </div>
              </div>
            ) : null
          )}
          {/* Break summary sheet modal */}
          {breakSheet && (
            <BreakSummarySheet
              open={!!breakSheet}
              onClose={() => setBreakSheet(null)}
              location={breakSheet.loc}
              dates={breakSheet.dates}
              temperatureUnit={temperatureUnit}
            />
          )}
        </div>
      )}
    </div>
  );
}
