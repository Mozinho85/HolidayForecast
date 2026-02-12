export interface GeoLocation {
  id: number;
  name: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  admin1?: string; // state/region
  timezone?: string;
}

export interface SavedLocation extends GeoLocation {
  addedAt: number;
}

export interface DailyForecast {
  date: string; // YYYY-MM-DD
  weatherCode: number;
  daytimeWeatherCode?: number; // most prominent weather code between sunrise and sunset
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface HourlyForecast {
  time: string;       // ISO datetime
  temperature: number;
  weatherCode: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  isDay: boolean;
  visibility: number; // meters
  feelsLike: number;
}

export interface LocationForecast {
  location: SavedLocation;
  daily: DailyForecast[];
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface UserPreferences {
  temperatureUnit: TemperatureUnit;
  selectedDates: string[]; // YYYY-MM-DD
  preferredAirport: string; // IATA code, e.g. 'LHR'
}

// WMO Weather interpretation codes (WW)
// https://open-meteo.com/en/docs
export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'foggy'
  | 'drizzle'
  | 'rain'
  | 'freezing-rain'
  | 'snow'
  | 'snow-grains'
  | 'rain-showers'
  | 'snow-showers'
  | 'thunderstorm';
