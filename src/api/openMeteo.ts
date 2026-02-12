import type { GeoLocation, DailyForecast, HourlyForecast, TemperatureUnit } from '../types';

const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1';
const WEATHER_BASE = 'https://api.open-meteo.com/v1';

export async function searchLocations(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];

  const params = new URLSearchParams({
    name: query.trim(),
    count: '8',
    language: 'en',
    format: 'json',
  });

  const res = await fetch(`${GEO_BASE}/search?${params}`);
  if (!res.ok) throw new Error('Failed to search locations');

  const data = await res.json();
  if (!data.results) return [];

  return data.results.map((r: Record<string, unknown>) => ({
    id: r.id as number,
    name: r.name as string,
    country: r.country as string,
    country_code: r.country_code as string,
    latitude: r.latitude as number,
    longitude: r.longitude as number,
    admin1: r.admin1 as string | undefined,
    timezone: r.timezone as string | undefined,
  }));
}

export async function getWeatherForecast(
  latitude: number,
  longitude: number,
  unit: TemperatureUnit = 'celsius'
): Promise<DailyForecast[]> {
  const tempUnit = unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  const windUnit = unit === 'fahrenheit' ? 'mph' : 'kmh';

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'uv_index_max',
      'sunrise',
      'sunset',
    ].join(','),
    hourly: 'weather_code',
    temperature_unit: tempUnit,
    wind_speed_unit: windUnit,
    timezone: 'auto',
    forecast_days: '16',
  });

  const res = await fetch(`${WEATHER_BASE}/forecast?${params}`);
  if (!res.ok) throw new Error('Failed to fetch weather data');

  const data = await res.json();
  const d = data.daily;
  const h = data.hourly as { time?: string[]; weather_code?: number[] } | undefined;

  const getDaytimeProminentCode = (
    day: string,
    sunrise: string,
    sunset: string,
    fallbackCode: number
  ): number => {
    const times = h?.time;
    const codes = h?.weather_code;
    if (!times || !codes || times.length !== codes.length) return fallbackCode;

    const counts = new Map<number, number>();
    const firstSeenAt = new Map<number, number>();

    for (let i = 0; i < times.length; i++) {
      const ts = times[i];
      if (!ts.startsWith(`${day}T`)) continue;
      if (ts < sunrise || ts > sunset) continue;

      const code = codes[i];
      counts.set(code, (counts.get(code) ?? 0) + 1);
      if (!firstSeenAt.has(code)) firstSeenAt.set(code, i);
    }

    if (counts.size === 0) return fallbackCode;

    let bestCode = fallbackCode;
    let bestCount = -1;
    let bestFirstIndex = Number.MAX_SAFE_INTEGER;
    for (const [code, count] of counts.entries()) {
      const firstIndex = firstSeenAt.get(code) ?? Number.MAX_SAFE_INTEGER;
      if (count > bestCount || (count === bestCount && firstIndex < bestFirstIndex)) {
        bestCode = code;
        bestCount = count;
        bestFirstIndex = firstIndex;
      }
    }

    return bestCode;
  };

  const forecasts: DailyForecast[] = [];
  for (let i = 0; i < d.time.length; i++) {
    const daytimeWeatherCode = getDaytimeProminentCode(
      d.time[i],
      d.sunrise[i],
      d.sunset[i],
      d.weather_code[i]
    );

    forecasts.push({
      date: d.time[i],
      weatherCode: d.weather_code[i],
      daytimeWeatherCode,
      tempMax: Math.round(d.temperature_2m_max[i]),
      tempMin: Math.round(d.temperature_2m_min[i]),
      precipitationSum: d.precipitation_sum[i],
      precipitationProbability: d.precipitation_probability_max[i] ?? 0,
      windSpeedMax: Math.round(d.wind_speed_10m_max[i]),
      uvIndexMax: Math.round(d.uv_index_max[i]),
      sunrise: d.sunrise[i],
      sunset: d.sunset[i],
    });
  }

  return forecasts;
}

export async function getHourlyForecast(
  latitude: number,
  longitude: number,
  date: string, // YYYY-MM-DD
  unit: TemperatureUnit = 'celsius'
): Promise<HourlyForecast[]> {
  const tempUnit = unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  const windUnit = unit === 'fahrenheit' ? 'mph' : 'kmh';

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: [
      'temperature_2m',
      'weather_code',
      'relative_humidity_2m',
      'precipitation_probability',
      'precipitation',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
      'is_day',
      'visibility',
      'apparent_temperature',
    ].join(','),
    temperature_unit: tempUnit,
    wind_speed_unit: windUnit,
    timezone: 'auto',
    start_date: date,
    end_date: date,
  });

  const res = await fetch(`${WEATHER_BASE}/forecast?${params}`);
  if (!res.ok) throw new Error('Failed to fetch hourly data');

  const data = await res.json();
  const h = data.hourly;

  const hourly: HourlyForecast[] = [];
  for (let i = 0; i < h.time.length; i++) {
    hourly.push({
      time: h.time[i],
      temperature: Math.round(h.temperature_2m[i]),
      weatherCode: h.weather_code[i],
      humidity: h.relative_humidity_2m[i],
      precipitationProbability: h.precipitation_probability[i] ?? 0,
      precipitation: h.precipitation[i],
      windSpeed: Math.round(h.wind_speed_10m[i]),
      windDirection: h.wind_direction_10m[i],
      uvIndex: Math.round(h.uv_index[i]),
      isDay: h.is_day[i] === 1,
      visibility: h.visibility[i],
      feelsLike: Math.round(h.apparent_temperature[i]),
    });
  }

  return hourly;
}
