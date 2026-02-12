

export type BestDayTripFilterType = 'default' | 'destination' | 'best-break';

interface BestDayTripFilterProps {
  filter: BestDayTripFilterType;
  setFilter: (filter: BestDayTripFilterType) => void;
  destinationId: number | null;
  setDestinationId: (id: number | null) => void;
  breakLength: number;
  setBreakLength: (len: number) => void;
  breakRange: { start: string; end: string };
  setBreakRange: (range: { start: string; end: string }) => void;
  locations: { id: number; name: string }[];
}

export default function BestDayTripFilter({
  filter,
  setFilter,
  destinationId,
  setDestinationId,
  breakLength,
  setBreakLength,
  breakRange,
  setBreakRange,
  locations,
}: BestDayTripFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        className="rounded border px-2 py-1 bg-slate-900 text-white"
        value={filter}
        onChange={e => setFilter(e.target.value as BestDayTripFilterType)}
      >
        <option value="default">Best Per Day (Default)</option>
        <option value="destination">Best Days for Destination</option>
        <option value="best-break">Best X Day Break</option>
      </select>
      {filter === 'destination' && (
        <select
          className="rounded border px-2 py-1 bg-slate-900 text-white"
          value={destinationId ?? ''}
          onChange={e => setDestinationId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Select Destination</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      )}
      {filter === 'best-break' && (
        <>
          <input
            type="number"
            min={2}
            max={16}
            className="rounded border px-2 py-1 w-16 bg-slate-900 text-white"
            value={breakLength}
            onChange={e => setBreakLength(Number(e.target.value))}
            placeholder="Days"
          />
          <input
            type="date"
            className="rounded border px-2 py-1 bg-slate-900 text-white"
            value={breakRange.start}
            onChange={e => setBreakRange({ ...breakRange, start: e.target.value })}
          />
          <input
            type="date"
            className="rounded border px-2 py-1 bg-slate-900 text-white"
            value={breakRange.end}
            onChange={e => setBreakRange({ ...breakRange, end: e.target.value })}
          />
        </>
      )}
    </div>
  );
}
