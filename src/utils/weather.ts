import type { WeatherCondition } from '../types';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Snowflake,
  type LucideIcon,
} from 'lucide-react';

interface WeatherInfo {
  condition: WeatherCondition;
  label: string;
  icon: LucideIcon;
  gradient: string;       // tailwind gradient classes for card backgrounds
  accentColor: string;    // tailwind text color for temperature
}

// Map WMO weather codes to conditions
// https://open-meteo.com/en/docs
const codeMap: Record<number, WeatherInfo> = {
  // Clear sky
  0: {
    condition: 'clear',
    label: 'Clear sky',
    icon: Sun,
    gradient: 'from-amber-500/20 to-orange-500/10',
    accentColor: 'text-amber-400',
  },
  // Mainly clear
  1: {
    condition: 'clear',
    label: 'Mainly clear',
    icon: Sun,
    gradient: 'from-amber-500/20 to-orange-500/10',
    accentColor: 'text-amber-400',
  },
  // Partly cloudy
  2: {
    condition: 'partly-cloudy',
    label: 'Partly cloudy',
    icon: CloudSun,
    gradient: 'from-blue-500/15 to-slate-500/10',
    accentColor: 'text-blue-300',
  },
  // Overcast
  3: {
    condition: 'cloudy',
    label: 'Overcast',
    icon: Cloud,
    gradient: 'from-slate-500/20 to-slate-600/10',
    accentColor: 'text-slate-300',
  },
  // Fog
  45: {
    condition: 'foggy',
    label: 'Fog',
    icon: CloudFog,
    gradient: 'from-slate-400/20 to-slate-500/10',
    accentColor: 'text-slate-400',
  },
  48: {
    condition: 'foggy',
    label: 'Depositing rime fog',
    icon: CloudFog,
    gradient: 'from-slate-400/20 to-slate-500/10',
    accentColor: 'text-slate-400',
  },
  // Drizzle
  51: {
    condition: 'drizzle',
    label: 'Light drizzle',
    icon: CloudDrizzle,
    gradient: 'from-blue-400/20 to-slate-500/10',
    accentColor: 'text-blue-400',
  },
  53: {
    condition: 'drizzle',
    label: 'Moderate drizzle',
    icon: CloudDrizzle,
    gradient: 'from-blue-400/20 to-slate-500/10',
    accentColor: 'text-blue-400',
  },
  55: {
    condition: 'drizzle',
    label: 'Dense drizzle',
    icon: CloudDrizzle,
    gradient: 'from-blue-500/25 to-slate-500/10',
    accentColor: 'text-blue-400',
  },
  // Freezing drizzle
  56: {
    condition: 'freezing-rain',
    label: 'Light freezing drizzle',
    icon: CloudDrizzle,
    gradient: 'from-cyan-400/20 to-blue-500/10',
    accentColor: 'text-cyan-400',
  },
  57: {
    condition: 'freezing-rain',
    label: 'Dense freezing drizzle',
    icon: CloudDrizzle,
    gradient: 'from-cyan-400/20 to-blue-500/10',
    accentColor: 'text-cyan-400',
  },
  // Rain
  61: {
    condition: 'rain',
    label: 'Slight rain',
    icon: CloudRain,
    gradient: 'from-blue-500/20 to-indigo-500/10',
    accentColor: 'text-blue-400',
  },
  63: {
    condition: 'rain',
    label: 'Moderate rain',
    icon: CloudRain,
    gradient: 'from-blue-600/25 to-indigo-600/10',
    accentColor: 'text-blue-400',
  },
  65: {
    condition: 'rain',
    label: 'Heavy rain',
    icon: CloudRain,
    gradient: 'from-blue-700/30 to-indigo-700/15',
    accentColor: 'text-blue-300',
  },
  // Freezing rain
  66: {
    condition: 'freezing-rain',
    label: 'Light freezing rain',
    icon: CloudRain,
    gradient: 'from-cyan-500/20 to-blue-600/10',
    accentColor: 'text-cyan-400',
  },
  67: {
    condition: 'freezing-rain',
    label: 'Heavy freezing rain',
    icon: CloudRain,
    gradient: 'from-cyan-600/25 to-blue-700/15',
    accentColor: 'text-cyan-300',
  },
  // Snow
  71: {
    condition: 'snow',
    label: 'Slight snowfall',
    icon: CloudSnow,
    gradient: 'from-sky-300/20 to-blue-300/10',
    accentColor: 'text-sky-300',
  },
  73: {
    condition: 'snow',
    label: 'Moderate snowfall',
    icon: CloudSnow,
    gradient: 'from-sky-400/25 to-blue-400/10',
    accentColor: 'text-sky-300',
  },
  75: {
    condition: 'snow',
    label: 'Heavy snowfall',
    icon: CloudSnow,
    gradient: 'from-sky-400/30 to-blue-400/15',
    accentColor: 'text-sky-200',
  },
  // Snow grains
  77: {
    condition: 'snow-grains',
    label: 'Snow grains',
    icon: Snowflake,
    gradient: 'from-sky-300/20 to-blue-300/10',
    accentColor: 'text-sky-300',
  },
  // Rain showers
  80: {
    condition: 'rain-showers',
    label: 'Slight rain showers',
    icon: CloudRain,
    gradient: 'from-blue-500/20 to-indigo-500/10',
    accentColor: 'text-blue-400',
  },
  81: {
    condition: 'rain-showers',
    label: 'Moderate rain showers',
    icon: CloudRain,
    gradient: 'from-blue-600/25 to-indigo-600/10',
    accentColor: 'text-blue-400',
  },
  82: {
    condition: 'rain-showers',
    label: 'Violent rain showers',
    icon: CloudRain,
    gradient: 'from-blue-700/30 to-indigo-700/15',
    accentColor: 'text-blue-300',
  },
  // Snow showers
  85: {
    condition: 'snow-showers',
    label: 'Slight snow showers',
    icon: CloudSnow,
    gradient: 'from-sky-300/20 to-blue-300/10',
    accentColor: 'text-sky-300',
  },
  86: {
    condition: 'snow-showers',
    label: 'Heavy snow showers',
    icon: CloudSnow,
    gradient: 'from-sky-400/30 to-blue-400/15',
    accentColor: 'text-sky-200',
  },
  // Thunderstorm
  95: {
    condition: 'thunderstorm',
    label: 'Thunderstorm',
    icon: CloudLightning,
    gradient: 'from-purple-600/25 to-slate-700/15',
    accentColor: 'text-purple-400',
  },
  96: {
    condition: 'thunderstorm',
    label: 'Thunderstorm with slight hail',
    icon: CloudLightning,
    gradient: 'from-purple-700/30 to-slate-700/20',
    accentColor: 'text-purple-300',
  },
  99: {
    condition: 'thunderstorm',
    label: 'Thunderstorm with heavy hail',
    icon: CloudLightning,
    gradient: 'from-purple-800/35 to-slate-800/20',
    accentColor: 'text-purple-300',
  },
};

// Default fallback
const defaultInfo: WeatherInfo = {
  condition: 'clear',
  label: 'Unknown',
  icon: Sun,
  gradient: 'from-slate-500/10 to-slate-600/5',
  accentColor: 'text-slate-400',
};

export function getWeatherInfo(code: number): WeatherInfo {
  return codeMap[code] ?? defaultInfo;
}

// Country code to flag emoji
export function countryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const offset = 0x1f1e6;
  const a = countryCode.toUpperCase().charCodeAt(0) - 65 + offset;
  const b = countryCode.toUpperCase().charCodeAt(1) - 65 + offset;
  return String.fromCodePoint(a, b);
}

// Temperature color utility
export function getTempColor(temp: number, unit: 'celsius' | 'fahrenheit'): string {
  const c = unit === 'fahrenheit' ? (temp - 32) * (5 / 9) : temp;
  if (c <= -10) return 'text-blue-300';
  if (c <= 0) return 'text-cyan-300';
  if (c <= 10) return 'text-sky-300';
  if (c <= 20) return 'text-emerald-400';
  if (c <= 25) return 'text-yellow-400';
  if (c <= 30) return 'text-amber-400';
  if (c <= 35) return 'text-orange-400';
  return 'text-red-400';
}

// Returns a CSS linear-gradient string based on temperature.
export function getTempGradient(temp: number, unit: 'celsius' | 'fahrenheit'): string {
  const c = unit === 'fahrenheit' ? (temp - 32) * (5 / 9) : temp;
  const min = -10;
  const max = 40;
  const t = Math.max(min, Math.min(max, c));
  const ratio = (t - min) / (max - min); // 0..1
  // Produce a lighter blue gradient across all temps: keep hue in blue range
  const baseHue = 210; // blue
  // Lightness values: colder -> slightly lighter, hotter -> slightly darker but still blue
  const light1 = 72 - ratio * 12; // 72% -> 60%
  const light2 = 64 - ratio * 8; // 64% -> 56%
  const stop1 = `hsla(${baseHue}, 70%, ${light1}%, 0.16)`;
  const stop2 = `hsla(${baseHue}, 70%, ${light2}%, 0.06)`;
  return `linear-gradient(90deg, ${stop1}, ${stop2})`;
}

// Returns a pale blue background color (hsla) tuned by temperature for subtle variation.
export function getTempPaleBackground(temp: number, unit: 'celsius' | 'fahrenheit'): string {
  const c = unit === 'fahrenheit' ? (temp - 32) * (5 / 9) : temp;
  const min = -10;
  const max = 40;
  const t = Math.max(min, Math.min(max, c));
  const ratio = (t - min) / (max - min); // 0..1
  const hue = 210; // blue
  // lightness: colder -> lighter (90%) ; hotter -> slightly darker (78%)
  const lightness = 90 - ratio * 12;
  const alpha = 0.12;
  return `hsla(${hue}, 70%, ${lightness}%, ${alpha})`;
}

// Map temperature to a color using defined stops and interpolate between them.
export function getTempMappedBackground(temp: number, unit: 'celsius' | 'fahrenheit'): string {
  const c = unit === 'fahrenheit' ? (temp - 32) * (5 / 9) : temp;
  // Stops defined in Celsius
  const stops = [
    { t: 0, rgba: [255, 255, 255, 1] }, // white at 0C
    { t: 5, rgba: [59, 130, 246, 1] }, // blue at 5C (#3b82f6)
    { t: 15, rgba: [59, 130, 246, 0] }, // transparent at 15C (same hue but alpha 0)
    { t: 22, rgba: [251, 146, 60, 1] }, // orange at 22C (#fb923c)
    { t: 25, rgba: [239, 68, 68, 1] }, // red at 25C (#ef4444)
  ];

  // Clamp
  if (c <= stops[0].t) {
    const s = stops[0].rgba;
    return `rgba(${s[0]}, ${s[1]}, ${s[2]}, ${0.12 * s[3]})`;
  }
  if (c >= stops[stops.length - 1].t) {
    const s = stops[stops.length - 1].rgba;
    return `rgba(${s[0]}, ${s[1]}, ${s[2]}, ${0.12 * s[3]})`;
  }

  // Find surrounding stops
  let lower = stops[0];
  let upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (c >= stops[i].t && c <= stops[i + 1].t) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const span = upper.t - lower.t;
  const ratio = span === 0 ? 0 : (c - lower.t) / span;
  const r = Math.round(lower.rgba[0] + (upper.rgba[0] - lower.rgba[0]) * ratio);
  const g = Math.round(lower.rgba[1] + (upper.rgba[1] - lower.rgba[1]) * ratio);
  const b = Math.round(lower.rgba[2] + (upper.rgba[2] - lower.rgba[2]) * ratio);
  const a = lower.rgba[3] + (upper.rgba[3] - lower.rgba[3]) * ratio;

  // Apply a mild overlay alpha so the color is subtle on dark background
  const overlayAlpha = 0.12 * a;
  return `rgba(${r}, ${g}, ${b}, ${overlayAlpha})`;
}

// Format date helpers
export function formatDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
