import { useRef, useEffect } from 'react';
import { useSavedLocations } from '../context/SavedLocationsContext';
import { formatDay, formatDate } from '../utils/weather';

interface DateStripProps {
  days: string[];
}

export default function DateStrip({ days }: DateStripProps) {
  const { selectedDates, toggleDate } = useSavedLocations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  // Scroll to today on mount
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      todayRef.current.scrollIntoView({
        behavior: 'instant',
        block: 'nearest',
        inline: 'start',
      });
    }
  }, []);

  return (
    <div className="relative py-3 border-y border-white/20 bg-white/10 backdrop-blur-md">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-white/10 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-white/10 to-transparent" />

      <div
        ref={scrollRef}
        className="hide-scrollbar flex gap-2 overflow-x-auto px-4"
      >
        {days.map((day, i) => {
          const isSelected = selectedDates.includes(day);
          const isToday = i === 0;

          return (
            <button
              key={day}
              ref={isToday ? todayRef : undefined}
              onClick={() => toggleDate(day)}
              className={`flex flex-shrink-0 flex-col items-center rounded-xl px-3 py-2 transition-all border border-white/10 ${
                isSelected
                  ? 'bg-white text-primary-600 shadow-lg'
                  : 'bg-blue-950/80 text-blue-100 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {formatDay(day)}
              </span>
              <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {new Date(day + 'T00:00:00').getDate()}
              </span>
              <span className="text-[10px]">
                {formatDate(day).split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
