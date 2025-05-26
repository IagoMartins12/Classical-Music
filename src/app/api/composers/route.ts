import { NextResponse } from "next/server";
import { getComposer } from "../lib/openopus";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q) return NextResponse.json([]);
  const data = await getComposer(q);
  return NextResponse.json(data);
}
