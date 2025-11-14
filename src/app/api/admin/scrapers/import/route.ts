import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { EventType, EventStatus, EventSource } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role < 1) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // 3. Extrair dados da requisição
    const { scraperId, events } = await request.json();

    if (!scraperId || !events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    console.log(`📦 Importando ${events.length} eventos de ${scraperId}...`);

    const results = [];
    let imported = 0;
    let duplicates = 0;
    let errors = 0;

    // 4. Processar cada evento
    for (const event of events) {
      try {
        // Verificar duplicata
        const existing = await prisma.event.findFirst({
          where: {
            OR: [
              { externalId: event.externalId },
              {
                AND: [
                  { title: event.title },
                  { startDate: new Date(event.startDate) },
                ],
              },
            ],
          },
        });

        if (existing) {
          duplicates++;
          results.push({
            eventId: event.externalId,
            title: event.title,
            status: 'duplicate',
            message: 'Evento já existe',
          });
          continue;
        }

        // Buscar ou criar venue
        const venue = await getOrCreateVenue(scraperId);

        // Buscar compositores
        const composerIds = await findComposers(event.composerNames || []);

        // Gerar slug único
        const slug = await generateUniqueSlug(event.slug);

        // Mapear source
        const source = mapScraperToSource(scraperId);

        // Criar evento
        const createdEvent = await prisma.event.create({
          data: {
            title: event.title,
            slug,
            description: event.description,
            type: event.type as EventType,
            status: EventStatus.PUBLISHED,
            source,
            startDate: new Date(event.startDate),
            startTime: event.startTime,
            endDate: event.endDate ? new Date(event.endDate) : null,
            endTime: event.endTime,
            venueId: venue.id,
            venueDetails: event.venueDetails,
            ticketUrl: event.ticketUrl,
            externalUrl: event.externalUrl,
            ticketInfo: event.ticketInfo,
            externalId: event.externalId,
            imageUrl: event.imageUrl,
            program: event.program,
            composerIds,
            isFree:
              event.ticketInfo?.toLowerCase().includes('gratuito') || false,
          },
        });

        imported++;
        results.push({
          eventId: createdEvent.id,
          title: event.title,
          status: 'success',
          message: 'Evento importado com sucesso',
        });

        console.log(`✅ ${event.title}`);
      } catch (error: any) {
        errors++;
        results.push({
          eventId: event.externalId,
          title: event.title,
          status: 'error',
          message: error.message || 'Erro ao importar',
        });
        console.error(`❌ ${event.title}:`, error.message);
      }
    }

    // 5. Registrar log (se você tiver a tabela ScrapingLog)
    try {
      await prisma.scrapingLog.create({
        data: {
          source: scraperId,
          status: imported > 0 ? 'success' : 'error',
          eventsFound: events.length,
          eventsCreated: imported,
          eventsSkipped: duplicates,
          newEvents: imported,
          details: { errors },
          finishedAt: new Date(),
        },
      });
    } catch (logError) {
      // Ignorar erro de log se a tabela não existir
      console.warn('⚠️ Não foi possível registrar log:', logError);
    }

    return NextResponse.json({
      success: true,
      imported,
      duplicates,
      errors,
      details: results,
    });
  } catch (error: any) {
    console.error('❌ Erro ao importar eventos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Buscar ou criar venue baseado no scraperId
 */
async function getOrCreateVenue(scraperId: string) {
  const venueMap: Record<
    string,
    {
      name: string;
      slug: string;
      address: string;
      city: string;
      state: string;
      country: string;
      zipCode?: string;
      website?: string;
    }
  > = {
    osesp: {
      name: 'Sala São Paulo',
      slug: 'sala-sao-paulo',
      address: 'Praça Júlio Prestes, 16 - Campos Elíseos',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      zipCode: '01218-020',
      website: 'https://osesp.art.br',
    },
    'theatro-municipal': {
      name: 'Theatro Municipal de São Paulo',
      slug: 'theatro-municipal-sp',
      address: 'Praça Ramos de Azevedo, s/n - República',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      zipCode: '01037-010',
      website: 'https://theatromunicipal.org.br',
    },
  };

  const venueData = venueMap[scraperId];
  if (!venueData) {
    throw new Error(`Venue não configurado para scraper ${scraperId}`);
  }

  return prisma.venue.upsert({
    where: { slug: venueData.slug },
    update: {},
    create: venueData,
  });
}

/**
 * Buscar compositores por nome
 */
async function findComposers(composerNames: string[]): Promise<string[]> {
  if (!composerNames || composerNames.length === 0) return [];

  const composerIds: string[] = [];

  for (const name of composerNames) {
    const composer = await prisma.composer.findFirst({
      where: {
        OR: [
          { fullName: { contains: name, mode: 'insensitive' } },
          { name: { contains: name, mode: 'insensitive' } },
        ],
      },
    });

    if (composer) {
      composerIds.push(composer.id);
    }
  }

  return composerIds;
}

/**
 * Gerar slug único (evitar duplicatas)
 */
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Mapear scraperId para EventSource do Prisma
 */
function mapScraperToSource(scraperId: string): EventSource {
  const sourceMap: Record<string, EventSource> = {
    osesp: EventSource.SCRAPER, // ✅ Use o valor correto do seu schema
    'theatro-municipal': EventSource.SCRAPER,
  };

  return sourceMap[scraperId] || EventSource.ADMIN;
}
