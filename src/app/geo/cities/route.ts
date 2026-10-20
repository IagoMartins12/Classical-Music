import City from 'country-state-city/lib/city';
import type { NextRequest } from 'next/server';

const CODE = /^[A-Za-z0-9-]{1,6}$/;

/**
 * The cities of one state, for the profile's location field. The world's
 * city list is 8 MB of JSON: it stays on the server, and the browser asks
 * only for the state it needs. The data never changes between deploys.
 */
export function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get('country') ?? '';
  const state = request.nextUrl.searchParams.get('state') ?? '';
  if (!CODE.test(country) || !CODE.test(state))
    return Response.json(
      { error: 'country and state are codes' },
      { status: 400 }
    );

  const names = [
    ...new Set(City.getCitiesOfState(country, state).map((c) => c.name)),
  ];
  return Response.json(names, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable',
    },
  });
}
