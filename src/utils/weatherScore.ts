import type { DailyForecast, TemperatureUnit } from '../types';

/**
 * Score a daily forecast for "good holiday weather" on a 0–100 scale.
 *
 * Weights:
 *   Temperature   35%  — ideal ~25 °C, penalised as it deviates
 *   Sunshine      30%  — derived from WMO weather code
 *   Precipitation 15%  — lower is better
 *   Wind          10%  — lower is better
 *   UV safety     10%  — moderate UV best (3–6), extremes penalised
 */

// ---------- individual scorers (each returns 0–100) ----------

function scoreTemperature(tempMax: number, unit: TemperatureUnit): number {
  // Convert to Celsius for consistent scoring
  const c = unit === 'fahrenheit' ? (tempMax - 32) * (5 / 9) : tempMax;
  const ideal = 25;
  const diff = Math.abs(c - ideal);
  // Linear falloff: 0 diff → 100, 25+ diff → 0
  return Math.max(0, Math.round(100 - diff * 4));
}

function scoreSunshine(weatherCode: number): number {
  // WMO code → sunshine factor
  if (weatherCode <= 1) return 100;       // clear / mainly clear
  if (weatherCode === 2) return 80;       // partly cloudy
  if (weatherCode === 3) return 50;       // overcast
  if (weatherCode <= 48) return 35;       // fog
  if (weatherCode <= 57) return 25;       // drizzle / freezing drizzle
  if (weatherCode <= 67) return 15;       // rain / freezing rain
  if (weatherCode <= 77) return 10;       // snow / snow grains
  if (weatherCode <= 82) return 20;       // rain showers
  if (weatherCode <= 86) return 10;       // snow showers
  return 5;                               // thunderstorm
}

function scorePrecipitation(precipMm: number): number {
  // 0 mm → 100,  20+ mm → 0
  return Math.max(0, Math.round(100 - precipMm * 5));
}

function scoreWind(windKmh: number, unit: TemperatureUnit): number {
  // Convert mph → km/h if needed
  const kmh = unit === 'fahrenheit' ? windKmh * 1.60934 : windKmh;
  // 0 km/h → 100,  60+ km/h → 0
  return Math.max(0, Math.round(100 - (kmh / 60) * 100));
}

function scoreUV(uv: number): number {
  // Sweet spot: 3–6.  Too low (winter) or too high (dangerous) penalised
  if (uv >= 3 && uv <= 6) return 100;
  if (uv < 3) return Math.round(50 + uv * (50 / 3));  // 0→50, 3→100
  // uv > 6
  return Math.max(0, Math.round(100 - (uv - 6) * 15)); // 6→100, ~12→10
}

// ---------- composite ----------

const W_TEMP = 0.35;
const W_SUN = 0.30;
const W_PRECIP = 0.15;
const W_WIND = 0.10;
const W_UV = 0.10;

export function scoreForecast(f: DailyForecast, unit: TemperatureUnit): number {
  const t = scoreTemperature(f.tempMax, unit);
  const s = scoreSunshine(f.weatherCode);
  const p = scorePrecipitation(f.precipitationSum);
  const w = scoreWind(f.windSpeedMax, unit);
  const u = scoreUV(f.uvIndexMax);
  return Math.round(t * W_TEMP + s * W_SUN + p * W_PRECIP + w * W_WIND + u * W_UV);
}

/** Average score across multiple forecasts for one location */
export function averageScore(forecasts: DailyForecast[], unit: TemperatureUnit): number {
  if (forecasts.length === 0) return 0;
  const total = forecasts.reduce((sum, f) => sum + scoreForecast(f, unit), 0);
  return Math.round(total / forecasts.length);
}

/** Tailwind color class for a score value */
export function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  if (score >= 40) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  return 'text-red-400 bg-red-400/10 border-red-400/20';
}
