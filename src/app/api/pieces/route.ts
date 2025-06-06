// import { NextResponse } from 'next/server';
// import { getWorks } from '../lib/openopus';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const id = searchParams.get('id');
//   if (!id) return NextResponse.json([]);
//   const data = await getWorks(Number(id));
//   return NextResponse.json(data);
// }
