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

function formatExpediaDestination(
  city: string,
  region?: string | null,
  country?: string | null
): string {
  const parts = [city, region ?? '', country ?? '']
    .map((value) => value.trim())
    .filter(Boolean);

  const deduped: string[] = [];
  for (const part of parts) {
    const exists = deduped.some((existing) => existing.toLowerCase() === part.toLowerCase());
    if (!exists) deduped.push(part);
  }

  return deduped.join(', ');
}

export function buildExpediaPackageSearchUrl(
  destinationCity: string,
  dates: string[],
  preferredAirportIata?: string | null,
  destinationRegion?: string | null,
  destinationCountry?: string | null
): string {
  if (!dates.length) return 'https://www.expedia.co.uk/Hotel-Search';

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

  const originIata = preferredAirportIata?.trim().toUpperCase();
  const origin = originIata ? `United Kingdom (${originIata})` : 'United Kingdom';
  const destination = formatExpediaDestination(
    destinationCity,
    destinationRegion,
    destinationCountry
  );

  const params = new URLSearchParams({
    destination,
    packageType: 'fh',
    searchProduct: 'hotel',
    tripType: 'ROUND_TRIP',
    cabinClass: 'COACH',
    d1: depart,
    startDate: depart,
    d2: ret,
    endDate: ret,
    origin,
    adults: '2',
    rooms: '1',
    directFlights: 'false',
    infantsInSeats: '0',
    partialStay: 'false',
    useRewards: 'false',
    sort: 'RECOMMENDED',
  });

  return `https://www.expedia.co.uk/Hotel-Search?${params.toString()}`;
}
