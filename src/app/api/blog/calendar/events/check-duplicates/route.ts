// app/api/calendar/events/check-duplicates/route.ts
import prisma from '@/app/libs/prismadb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json();

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Lista de eventos é obrigatória' },
        { status: 400 }
      );
    }

    console.log(`🔍 Verificando ${events.length} eventos...`);

    // Buscar eventos existentes por externalId
    const externalIds = events.map((e: any) => e.externalId);

    const existingEvents = await prisma.event.findMany({
      where: {
        externalId: {
          in: externalIds,
        },
      },
      select: {
        id: true,
        externalId: true,
        title: true,
      },
    });

    const existingMap = new Map(existingEvents.map((e) => [e.externalId, e]));

    // Marcar duplicatas
    const checkedEvents = events.map((event: any) => {
      const existing = existingMap.get(event.externalId);
      return {
        ...event,
        alreadyExists: !!existing,
        isDuplicate: !!existing,
        existingEventId: existing?.id,
        selected: !existing, // Desmarcar se já existe
      };
    });

    const duplicatesCount = checkedEvents.filter(
      (e: any) => e.alreadyExists
    ).length;

    console.log(`✅ ${duplicatesCount} duplicatas encontradas`);

    return NextResponse.json({
      success: true,
      events: checkedEvents,
      duplicates: duplicatesCount,
      new: events.length - duplicatesCount,
    });
  } catch (error: any) {
    console.error('❌ Erro ao verificar duplicatas:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro ao verificar duplicatas',
      },
      { status: 500 }
    );
  }
}
