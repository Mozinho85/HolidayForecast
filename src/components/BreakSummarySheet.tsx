import { useEffect, useState } from 'react';
import type { SavedLocation, HourlyForecast, TemperatureUnit } from '../types';
import { getHourlyForecast } from '../api/openMeteo';
import { getWeatherInfo } from '../utils/weather';

interface BreakSummarySheetProps {
  open: boolean;
  onClose: () => void;
  location: SavedLocation;
  dates: string[];
  temperatureUnit: TemperatureUnit;
}

export default function BreakSummarySheet({ open, onClose, location, dates, temperatureUnit }: BreakSummarySheetProps) {
  const [hourlyData, setHourlyData] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function fetchAll() {
      setLoading(true);
      const all: HourlyForecast[] = [];
      for (const date of dates) {
        try {
          const data = await getHourlyForecast(location.latitude, location.longitude, date, temperatureUnit);
          all.push(...data);
        } catch {}
      }
      if (!cancelled) setHourlyData(all);
      setLoading(false);
    }
    fetchAll();
    return () => { cancelled = true; };
  }, [open, location, dates, temperatureUnit]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-white mb-2">Weather Summary for {location.name}</h2>
        <div className="text-slate-300 text-sm mb-4">{dates[0]} to {dates[dates.length-1]}</div>
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading hourly data...</div>
        ) : (
          <>
            <div className="mb-4">
              {/* TODO: Insert chart here */}
              <div className="text-slate-400 text-xs">[Chart placeholder: temperature, rain, wind]</div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-xs text-slate-200">
                <thead>
                  <tr>
                    <th className="text-left">Time</th>
                    <th>Temp</th>
                    <th>Rain</th>
                    <th>Wind</th>
                    <th>Weather</th>
                  </tr>
                </thead>
                <tbody>
                  {hourlyData.map((h, i) => (
                    <tr key={i} className={h.isDay ? '' : 'bg-slate-800/40'}>
                      <td>{new Date(h.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td>{h.temperature}°</td>
                      <td>{h.precipitation ?? 0}mm</td>
                      <td>{h.windSpeed} {temperatureUnit === 'celsius' ? 'km/h' : 'mph'}</td>
                      <td>{getWeatherInfo(h.weatherCode).label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
