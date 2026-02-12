import type { SavedLocation, UserPreferences, TemperatureUnit } from '../types';

const LOCATIONS_KEY = 'holicast_saved_locations';
const PREFS_KEY = 'holicast_preferences';

// --- Locations ---

export function getSavedLocations(): SavedLocation[] {
  try {
    const raw = localStorage.getItem(LOCATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocation(location: SavedLocation): SavedLocation[] {
  const existing = getSavedLocations();
  // Don't duplicate
  if (existing.some((l) => l.id === location.id)) return existing;
  const updated = [...existing, location];
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(updated));
  return updated;
}

export function removeLocation(id: number): SavedLocation[] {
  const existing = getSavedLocations();
  const updated = existing.filter((l) => l.id !== id);
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(updated));
  return updated;
}

export function setLocations(locations: SavedLocation[]): void {
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
}

// --- Preferences ---

const defaultPrefs: UserPreferences = {
  temperatureUnit: 'celsius',
  selectedDates: [],
  preferredAirport: '',
};

export function getPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultPrefs;
    return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {
    return defaultPrefs;
  }
}

export function setTemperatureUnit(unit: TemperatureUnit): void {
  const prefs = getPreferences();
  prefs.temperatureUnit = unit;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function setSelectedDates(dates: string[]): void {
  const prefs = getPreferences();
  prefs.selectedDates = dates;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function setPreferredAirport(code: string): void {
  const prefs = getPreferences();
  prefs.preferredAirport = code;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
