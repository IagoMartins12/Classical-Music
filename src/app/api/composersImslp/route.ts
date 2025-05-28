import { NextResponse } from 'next/server';
import { getComposerImslp } from '../lib/openopus';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('start');
  if (!q) return NextResponse.json([]);
  const data = await getComposerImslp(q);
  return NextResponse.json(data);
}
