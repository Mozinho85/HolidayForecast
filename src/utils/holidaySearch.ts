export function buildHolidaySearchUrl(
  destination: string,
  dates: string[],
  preferredAirportIata?: string | null
): string {
  if (!dates.length) return 'https://www.google.com/travel/flights';

  const sorted = [...dates].sort();
  const depart = sorted[0];
  const ret =
    sorted.length > 1
      ? sorted[sorted.length - 1]
      : (() => {
          const d = new Date(sorted[0] + 'T00:00:00');
          d.setDate(d.getDate() + 1);
          return d.toISOString().split('T')[0];
        })();

  const origin = preferredAirportIata?.trim() || 'UK';
  const query = `Flights from ${origin} to ${destination} departing ${depart} returning ${ret}`;

  return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}&curr=GBP`;
}
