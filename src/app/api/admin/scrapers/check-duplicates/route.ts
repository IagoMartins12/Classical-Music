import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json();

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Lista de eventos é obrigatória' },
        { status: 400 }
      );
    }

    const externalIds = events.map((e: any) => e.externalId);

    const existingEvents = await prisma.event.findMany({
      where: {
        externalId: {
          in: externalIds,
        },
      },
      select: {
        externalId: true,
      },
    });

    const existingSet = new Set(existingEvents.map((e) => e.externalId));

    const checkedEvents = events.map((event: any) => ({
      ...event,
      isDuplicate: existingSet.has(event.externalId),
      selected: !existingSet.has(event.externalId),
    }));

    return NextResponse.json({
      success: true,
      events: checkedEvents,
      duplicates: existingSet.size,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar duplicatas' },
      { status: 500 }
    );
  }
}
