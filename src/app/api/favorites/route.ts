// import { getServerSession } from "next-auth";
// import { authOptions } from "@/auth/[...nextauth]/route";
// import clientPromise from "@/lib/mongodb";
// import { NextResponse } from "next/server";

// export async function GET() {
//   const session = await getServerSession(authOptions);
//   if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const client = await clientPromise;
//   const db = client.db();
//   const favoritos = await db.collection("favoritos").find({ user: session.user?.email }).toArray();
//   return NextResponse.json(favoritos);
// }

// export async function POST(request: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const body = await request.json();
//   const client = await clientPromise;
//   const db = client.db();
//   await db.collection("favoritos").insertOne({ ...body, user: session.user?.email });
//   return NextResponse.json({ ok: true });
// }
