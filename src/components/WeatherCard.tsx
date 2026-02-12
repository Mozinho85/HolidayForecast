import { Droplets, Wind, Sun as UVIcon, AlertCircle, Plane } from 'lucide-react';
import type { SavedLocation, DailyForecast, TemperatureUnit } from '../types';
import { getWeatherInfo, countryFlag, getTempColor, formatDay, formatDate } from '../utils/weather';
import { scoreColor } from '../utils/weatherScore';

interface WeatherCardProps {
  location: SavedLocation;
  forecasts: DailyForecast[];       // only selected date(s)
  allForecasts: DailyForecast[];    // all 16 days (for mini row)
  temperatureUnit: TemperatureUnit;
  isError: boolean;
  onSelectDay: (location: SavedLocation, forecast: DailyForecast) => void;
  onSearchHolidays: (location: SavedLocation) => void;
  score?: number | null;            // weather score (shown when sorting)
}

export default function WeatherCard({
  location,
  forecasts,
  temperatureUnit,
  isError,
  onSelectDay,
  onSearchHolidays,
  score,
}: WeatherCardProps) {
  const windUnit = temperatureUnit === 'celsius' ? 'km/h' : 'mph';

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-4">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{location.name}</p>
            <p className="text-xs text-red-400/70">Failed to load forecast</p>
          </div>
        </div>
      </div>
    );
  }

  if (forecasts.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <p className="text-sm text-slate-400">
          {countryFlag(location.country_code)} {location.name} — No forecast for selected dates
        </p>
      </div>
    );
  }

  // Single date view (expanded card)
  if (forecasts.length === 1) {
    const f = forecasts[0];
    const info = getWeatherInfo(f.daytimeWeatherCode ?? f.weatherCode);
    const Icon = info.icon;

    return (
      <div
        onClick={() => onSelectDay(location, f)}
        className={`cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br ${info.gradient} bg-slate-900/80 p-4 transition-all hover:border-slate-700 active:scale-[0.98]`}
      >
        {/* Location header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{countryFlag(location.country_code)}</span>
            <div>
              <h3 className="text-sm font-semibold text-white">{location.name}</h3>
              <p className="text-[11px] text-slate-400">
                {formatDay(f.date)} · {formatDate(f.date)}
              </p>
            </div>
          </div>
          {score != null && (
            <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${scoreColor(score)}`}>
              {score}
            </span>
          )}
        </div>

        {/* Main weather display */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl font-bold ${getTempColor(f.tempMax, temperatureUnit)}`}>
              {f.tempMax}°
            </span>
            <span className="text-lg text-slate-400">
              / {f.tempMin}°
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Icon className={`h-12 w-12 ${info.accentColor}`} strokeWidth={1.5} />
            <span className="text-[10px] font-medium text-slate-400">
              {info.label}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-950/40 p-2.5">
          <Stat
            icon={<Droplets className="h-3.5 w-3.5 text-blue-400" />}
            label="Rain"
            value={`${f.precipitationProbability}%`}
          />
          <Stat
            icon={<Wind className="h-3.5 w-3.5 text-teal-400" />}
            label="Wind"
            value={`${f.windSpeedMax} ${windUnit}`}
          />
          <Stat
            icon={<UVIcon className="h-3.5 w-3.5 text-amber-400" />}
            label="UV"
            value={`${f.uvIndexMax}`}
          />
        </div>

        {/* Search Holidays */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSearchHolidays(location);
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500/15 py-2.5 text-sm font-semibold text-sky-400 transition-colors hover:bg-sky-500/25 active:scale-[0.98]"
        >
          <Plane className="h-4 w-4" />
          Search Google Flights
        </button>
      </div>
    );
  }

  // Multi-date view (compact rows)
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 transition-all hover:border-slate-700">
      {/* Location header */}
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
        <span className="text-lg">{countryFlag(location.country_code)}</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{location.name}</h3>
          <p className="text-[11px] text-slate-400">
            {forecasts.length} days selected
          </p>
        </div>
        {score != null && (
          <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${scoreColor(score)}`}>
            {score}
          </span>
        )}
      </div>

      {/* Daily rows */}
      <div className="divide-y divide-slate-800/50">
        {forecasts.map((f) => {
          const info = getWeatherInfo(f.daytimeWeatherCode ?? f.weatherCode);
          const Icon = info.icon;

          return (
            <div
              key={f.date}
              onClick={() => onSelectDay(location, f)}
              className={`flex cursor-pointer items-center gap-3 bg-gradient-to-r ${info.gradient} px-4 py-3 transition-colors hover:bg-slate-800/40 active:bg-slate-800/60`}
            >
              {/* Day */}
              <div className="w-16 flex-shrink-0">
                <p className="text-xs font-semibold text-white">{formatDay(f.date)}</p>
                <p className="text-[10px] text-slate-400">{formatDate(f.date)}</p>
              </div>

              {/* Icon */}
              <Icon className={`h-7 w-7 flex-shrink-0 ${info.accentColor}`} strokeWidth={1.5} />

              {/* Temps */}
              <div className="flex flex-1 items-baseline gap-1">
                <span className={`text-lg font-bold ${getTempColor(f.tempMax, temperatureUnit)}`}>
                  {f.tempMax}°
                </span>
                <span className="text-xs text-slate-400">
                  {f.tempMin}°
                </span>
              </div>

              {/* Mini stats */}
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-0.5">
                  <Droplets className="h-3 w-3 text-blue-400/70" />
                  {f.precipitationProbability}%
                </span>
                <span className="flex items-center gap-0.5">
                  <Wind className="h-3 w-3 text-teal-400/70" />
                  {f.windSpeedMax}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Holidays */}
      <div className="border-t border-slate-800 px-4 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSearchHolidays(location);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500/15 py-2.5 text-sm font-semibold text-sky-400 transition-colors hover:bg-sky-500/25 active:scale-[0.98]"
        >
          <Plane className="h-4 w-4" />
          Search Google Flights
        </button>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {icon}
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-slate-300">{value}</span>
    </div>
  );
}
