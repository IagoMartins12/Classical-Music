import { NextResponse } from 'next/server';
import { getPopularComposers } from '../lib/openopus';

export async function GET(request: Request) {
  const data = await getPopularComposers();
  return NextResponse.json(data);
}
