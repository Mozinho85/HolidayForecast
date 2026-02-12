
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { CloudSun, MapPin, Trophy } from 'lucide-react';
import ForecastPage from './pages/ForecastPage';
import LocationsPage from './pages/LocationsPage';
import BestDayTripPage from './pages/BestDayTripPage';

function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/" element={<ForecastPage />} />
          <Route path="/best-day-trip" element={<BestDayTripPage />} />
          <Route path="/locations" element={<LocationsPage />} />
        </Routes>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg safe-bottom">
        <div className="mx-auto flex max-w-lg">
          <NavLink
            to="/"
            className={() =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-primary-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <CloudSun className="h-5 w-5" />
            <span>Forecast</span>
          </NavLink>
          <NavLink
            to="/best-day-trip"
            className={() =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                location.pathname === '/best-day-trip'
                  ? 'text-primary-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <Trophy className="h-5 w-5" />
            <span>Best Day Trip</span>
          </NavLink>
          <NavLink
            to="/locations"
            className={() =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                location.pathname === '/locations'
                  ? 'text-primary-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <MapPin className="h-5 w-5" />
            <span>Locations</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

export default App;
