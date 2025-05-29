import { NextResponse } from 'next/server';
import { getEssentialComposers } from '../lib/openopus';

export async function GET(request: Request) {
  const data = await getEssentialComposers();
  return NextResponse.json(data);
}
