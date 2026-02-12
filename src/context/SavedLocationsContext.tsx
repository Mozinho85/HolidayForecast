import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { SavedLocation, GeoLocation, TemperatureUnit } from '../types';
import * as storage from '../services/storage';

interface SavedLocationsContextType {
  locations: SavedLocation[];
  addLocation: (geo: GeoLocation) => void;
  removeLocation: (id: number) => void;
  temperatureUnit: TemperatureUnit;
  toggleUnit: () => void;
  selectedDates: string[];
  setSelectedDates: (dates: string[]) => void;
  toggleDate: (date: string) => void;
  preferredAirport: string;
  setPreferredAirport: (code: string) => void;
}

const SavedLocationsContext = createContext<SavedLocationsContextType | null>(null);

export function SavedLocationsProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<SavedLocation[]>(() =>
    storage.getSavedLocations()
  );
  const prefs = storage.getPreferences();
  const [temperatureUnit, setTempUnit] = useState<TemperatureUnit>(
    prefs.temperatureUnit
  );
  const [selectedDates, setSelectedDatesState] = useState<string[]>(() => {
    // Default: today
    const today = new Date().toISOString().split('T')[0];
    return prefs.selectedDates.length > 0 ? prefs.selectedDates : [today];
  });

  const [preferredAirport, setPreferredAirportState] = useState<string>(
    prefs.preferredAirport || ''
  );

  const addLocation = useCallback((geo: GeoLocation) => {
    const saved: SavedLocation = { ...geo, addedAt: Date.now() };
    const updated = storage.saveLocation(saved);
    setLocations(updated);
  }, []);

  const removeLocationCb = useCallback((id: number) => {
    const updated = storage.removeLocation(id);
    setLocations(updated);
  }, []);

  const toggleUnit = useCallback(() => {
    setTempUnit((prev) => {
      const next = prev === 'celsius' ? 'fahrenheit' : 'celsius';
      storage.setTemperatureUnit(next);
      return next;
    });
  }, []);

  const setSelectedDates = useCallback((dates: string[]) => {
    setSelectedDatesState(dates);
    storage.setSelectedDates(dates);
  }, []);

  const setPreferredAirportCb = useCallback((code: string) => {
    setPreferredAirportState(code);
    storage.setPreferredAirport(code);
  }, []);

  const toggleDate = useCallback(
    (date: string) => {
      setSelectedDatesState((prev) => {
        let next: string[];
        if (prev.includes(date)) {
          // remove the date (allow empty selection)
          next = prev.filter((d) => d !== date);
        } else {
          next = [...prev, date].sort();
        }
        storage.setSelectedDates(next);
        return next;
      });
    },
    []
  );

  return (
    <SavedLocationsContext.Provider
      value={{
        locations,
        addLocation,
        removeLocation: removeLocationCb,
        temperatureUnit,
        toggleUnit,
        selectedDates,
        setSelectedDates,
        toggleDate,
        preferredAirport,
        setPreferredAirport: setPreferredAirportCb,
      }}
    >
      {children}
    </SavedLocationsContext.Provider>
  );
}

export function useSavedLocations() {
  const ctx = useContext(SavedLocationsContext);
  if (!ctx) throw new Error('useSavedLocations must be inside SavedLocationsProvider');
  return ctx;
}
