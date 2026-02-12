import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Droplets,
  Wind,
  Sun as UVIcon,
  Eye,
  Thermometer,
  ArrowUp,
  Sunrise,
  Sunset,
} from 'lucide-react';
import type { SavedLocation, DailyForecast, TemperatureUnit, HourlyForecast } from '../types';
import { getHourlyForecast } from '../api/openMeteo';
import {
  getWeatherInfo,
  countryFlag,
  getTempColor,
  formatFullDate,
} from '../utils/weather';

interface DetailSheetProps {
  location: SavedLocation;
  forecast: DailyForecast;
  temperatureUnit: TemperatureUnit;
  onClose: () => void;
}

export default function DetailSheet({
  location,
  forecast,
  temperatureUnit,
  onClose,
}: DetailSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const windUnit = temperatureUnit === 'celsius' ? 'km/h' : 'mph';

  const { data: hourlyData, isLoading } = useQuery({
    queryKey: [
      'hourly',
      location.id,
      location.latitude,
      location.longitude,
      forecast.date,
      temperatureUnit,
    ],
    queryFn: () =>
      getHourlyForecast(
        location.latitude,
        location.longitude,
        forecast.date,
        temperatureUnit
      ),
  });

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      if (sheetRef.current) sheetRef.current.style.transform = 'translateY(0)';
      if (backdropRef.current) backdropRef.current.style.opacity = '1';
    });
  }, []);

  // Close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const info = getWeatherInfo(forecast.weatherCode);
  const Icon = info.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative z-10 w-full max-w-lg transform transition-transform duration-300 ease-out"
        style={{ transform: 'translateY(100%)' }}
      >
        <div className="max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-slate-700 bg-slate-900 shadow-2xl">
          {/* Drag handle */}
          <div className="sticky top-0 z-20 flex justify-center bg-slate-900 pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-slate-700" />
          </div>

          {/* Header */}
          <div className="px-5 pt-1 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{countryFlag(location.country_code)}</span>
                  <h2 className="text-lg font-bold text-white">{location.name}</h2>
                </div>
                <p className="mt-0.5 text-sm text-slate-400">
                  {formatFullDate(forecast.date)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Day summary */}
            <div className={`mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-br ${info.gradient} border border-slate-800 p-4`}>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-5xl font-bold ${getTempColor(forecast.tempMax, temperatureUnit)}`}>
                    {forecast.tempMax}°
                  </span>
                  <span className="text-xl text-slate-400">/ {forecast.tempMin}°</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{info.label}</p>
              </div>
              <Icon className={`h-16 w-16 ${info.accentColor}`} strokeWidth={1.2} />
            </div>

            {/* Day stats grid */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              <DayStat
                icon={<Droplets className="h-4 w-4 text-blue-400" />}
                label="Rain"
                value={`${forecast.precipitationProbability}%`}
              />
              <DayStat
                icon={<Wind className="h-4 w-4 text-teal-400" />}
                label="Wind"
                value={`${forecast.windSpeedMax} ${windUnit}`}
              />
              <DayStat
                icon={<UVIcon className="h-4 w-4 text-amber-400" />}
                label="UV Index"
                value={`${forecast.uvIndexMax}`}
              />
              <DayStat
                icon={<Droplets className="h-4 w-4 text-cyan-400" />}
                label="Precip."
                value={`${forecast.precipitationSum} mm`}
              />
            </div>

            {/* Sunrise / Sunset */}
            <div className="mt-3 flex gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-800/50 px-3 py-2">
                <Sunrise className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-[10px] text-slate-500">Sunrise</p>
                  <p className="text-xs font-semibold text-slate-300">
                    {formatTime(forecast.sunrise)}
                  </p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-800/50 px-3 py-2">
                <Sunset className="h-4 w-4 text-orange-400" />
                <div>
                  <p className="text-[10px] text-slate-500">Sunset</p>
                  <p className="text-xs font-semibold text-slate-300">
                    {formatTime(forecast.sunset)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly section */}
          <div className="border-t border-slate-800 px-5 pt-4 pb-8">
            <h3 className="mb-3 text-sm font-semibold text-slate-300">
              Hourly Forecast
            </h3>

            {isLoading ? (
              <div className="flex items-center gap-2 py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-primary-400" />
                <span className="text-sm text-slate-400">Loading hourly data...</span>
              </div>
            ) : hourlyData ? (
              <>
                {/* Horizontal scrollable temperature chart */}
                <HourlyTempChart
                  hours={hourlyData}
                  temperatureUnit={temperatureUnit}
                />

                {/* Detailed hourly rows */}
                <div className="mt-4 space-y-0.5">
                  {hourlyData.map((h, i) => (
                    <HourlyRow
                      key={i}
                      hour={h}
                      temperatureUnit={temperatureUnit}
                      windUnit={windUnit}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="py-4 text-sm text-slate-500">No hourly data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function DayStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-800/50 py-2.5">
      {icon}
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-slate-300">{value}</span>
    </div>
  );
}

function HourlyTempChart({
  hours,
  temperatureUnit,
}: {
  hours: HourlyForecast[];
  temperatureUnit: TemperatureUnit;
}) {
  const temps = hours.map((h) => h.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;

  return (
    <div className="hide-scrollbar -mx-1 overflow-x-auto">
      <div className="flex min-w-max gap-0">
        {hours.map((h, i) => {
          const hr = new Date(h.time).getHours();
          const heightPct = ((h.temperature - min) / range) * 100;
          const hInfo = getWeatherInfo(h.weatherCode);
          const HourIcon = hInfo.icon;

          // Only show every 2nd hour label for density
          const showLabel = hr % 3 === 0;

          return (
            <div
              key={i}
              className={`flex w-14 flex-shrink-0 flex-col items-center gap-1 rounded-lg px-1 py-2 ${
                !h.isDay ? 'bg-slate-800/30' : ''
              }`}
            >
              {/* Time */}
              <span className={`text-[10px] font-medium ${showLabel ? 'text-slate-400' : 'text-slate-600'}`}>
                {formatHour(hr)}
              </span>

              {/* Icon */}
              <HourIcon
                className={`h-4 w-4 ${hInfo.accentColor}`}
                strokeWidth={1.5}
              />

              {/* Temp bar + value */}
              <div className="relative flex h-16 w-full items-end justify-center">
                <div
                  className="absolute bottom-0 w-5 rounded-t bg-gradient-to-t from-primary-600/40 to-primary-400/20"
                  style={{ height: `${Math.max(heightPct, 8)}%` }}
                />
                <span
                  className={`relative z-10 text-xs font-bold ${getTempColor(h.temperature, temperatureUnit)}`}
                  style={{ marginBottom: `${Math.max(heightPct, 8)}%` }}
                >
                  {h.temperature}°
                </span>
              </div>

              {/* Precipitation */}
              {h.precipitationProbability > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] text-blue-400">
                  <Droplets className="h-2.5 w-2.5" />
                  {h.precipitationProbability}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HourlyRow({
  hour,
  temperatureUnit,
  windUnit,
}: {
  hour: HourlyForecast;
  temperatureUnit: TemperatureUnit;
  windUnit: string;
}) {
  const hr = new Date(hour.time).getHours();
  const info = getWeatherInfo(hour.weatherCode);
  const RowIcon = info.icon;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
        !hour.isDay ? 'bg-slate-800/20' : 'bg-slate-800/5'
      }`}
    >
      {/* Time */}
      <span className="w-12 text-xs font-semibold text-slate-400">
        {formatHour(hr)}
      </span>

      {/* Icon */}
      <RowIcon className={`h-5 w-5 flex-shrink-0 ${info.accentColor}`} strokeWidth={1.5} />

      {/* Temperature */}
      <div className="flex flex-1 items-baseline gap-1">
        <span className={`text-sm font-bold ${getTempColor(hour.temperature, temperatureUnit)}`}>
          {hour.temperature}°
        </span>
        <span className="text-[10px] text-slate-500">
          <Thermometer className="mb-0.5 inline h-2.5 w-2.5" />
          {hour.feelsLike}°
        </span>
      </div>

      {/* Details */}
      <div className="flex items-center gap-3 text-[10px] text-slate-400">
        {hour.precipitationProbability > 0 && (
          <span className="flex items-center gap-0.5 text-blue-400">
            <Droplets className="h-3 w-3" />
            {hour.precipitationProbability}%
          </span>
        )}
        <span className="flex items-center gap-0.5">
          <Wind className="h-3 w-3 text-teal-400/70" />
          {hour.windSpeed} {windUnit}
          <ArrowUp
            className="h-2.5 w-2.5 text-slate-500"
            style={{ transform: `rotate(${hour.windDirection + 180}deg)` }}
          />
        </span>
        {hour.uvIndex > 0 && hour.isDay && (
          <span className="flex items-center gap-0.5">
            <UVIcon className="h-3 w-3 text-amber-400/70" />
            {hour.uvIndex}
          </span>
        )}
        <span className="flex items-center gap-0.5">
          <Eye className="h-3 w-3 text-slate-500" />
          {(hour.visibility / 1000).toFixed(0)}k
        </span>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function formatHour(hr: number): string {
  if (hr === 0) return '12am';
  if (hr === 12) return '12pm';
  return hr < 12 ? `${hr}am` : `${hr - 12}pm`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
