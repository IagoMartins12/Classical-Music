// app/api/calendar/events/bulk-insert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { createSlug } from '../../../../../../../scripts/utils/date-parser';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role < 1) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const { events, scraperId } = await request.json();

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Lista de eventos é obrigatória' },
        { status: 400 }
      );
    }

    console.log(`📦 Inserindo ${events.length} eventos...`);

    const results = [];

    for (const event of events) {
      try {
        // ==================== 1. VERIFICAR DUPLICATA POR externalId ====================
        const existingEvent = await prisma.event.findFirst({
          where: { externalId: event.externalId },
        });

        if (existingEvent) {
          console.log(
            `⚠️ Evento já existe (externalId: ${event.externalId}): ${event.title}`
          );
          results.push({
            success: false,
            error: 'Evento já existe no sistema',
            title: event.title,
            isDuplicate: true,
          });
          continue; // Pular para o próximo
        }

        // ==================== 2. BUSCAR OU CRIAR VENUE ====================
        let venue = null;

        if (scraperId === 'osesp') {
          venue = await prisma.venue.findFirst({
            where: {
              OR: [{ slug: 'sala-sao-paulo' }, { name: 'Sala São Paulo' }],
            },
          });

          if (!venue) {
            venue = await prisma.venue.create({
              data: {
                name: 'Sala São Paulo',
                slug: 'sala-sao-paulo',
                address: 'Praça Júlio Prestes, 16 - Campos Elíseos',
                city: 'São Paulo',
                state: 'SP',
                country: 'Brasil',
                zipCode: '01218-020',
                capacity: 1498,
                website: 'https://osesp.art.br',
              },
            });
          }
        } else if (scraperId === 'theatro-municipal') {
          // ✅ Buscar venue dinamicamente
          const venueName =
            event.venueDetails || 'Theatro Municipal de São Paulo';
          const venueSlug = createSlug(venueName);

          venue = await prisma.venue.findFirst({
            where: {
              OR: [{ slug: venueSlug }, { name: venueName }],
            },
          });

          if (!venue) {
            // Criar venue conforme necessário
            const venueData: any = {
              name: venueName,
              slug: venueSlug,
              city: 'São Paulo',
              state: 'SP',
              country: 'Brasil',
            };

            if (venueName.includes('Theatro Municipal')) {
              venueData.address = 'Praça Ramos de Azevedo, s/n - República';
              venueData.zipCode = '01037-010';
              venueData.capacity = 1500;
              venueData.website = 'https://theatromunicipal.org.br';
            } else if (venueName.includes('Praça das Artes')) {
              venueData.address = 'Av. São João, 281 - República';
              venueData.zipCode = '01035-000';
            }

            venue = await prisma.venue.create({ data: venueData });
          }
        }

        if (!venue) {
          return NextResponse.json(
            {
              error: 'Local nao encontrado',
            },
            { status: 500 }
          );
        }
        // ==================== 3. BUSCAR COMPOSITORES ====================
        const composerIds: string[] = [];
        if (event.composerNames && event.composerNames.length > 0) {
          for (const composerName of event.composerNames) {
            let composer = null;

            // ✅ PASSO 1: Tentar buscar por fullName primeiro (mais específico)
            composer = await prisma.composer.findFirst({
              where: {
                fullName: { contains: composerName, mode: 'insensitive' },
              },
            });

            // ✅ PASSO 2: Se não encontrar, buscar por name (fallback)
            if (!composer) {
              composer = await prisma.composer.findFirst({
                where: {
                  name: { contains: composerName, mode: 'insensitive' },
                },
              });
            }

            // ✅ PASSO 3: Se encontrou, adicionar ID
            if (composer) {
              composerIds.push(composer.id);
              console.log(
                `✅ Compositor encontrado: ${composerName} → ${composer.fullName || composer.name}`
              );
            } else {
              console.warn(`⚠️ Compositor não encontrado: ${composerName}`);
            }
          }
        }

        // ==================== 4. GERAR SLUG ÚNICO ====================
        let uniqueSlug = event.slug;
        let slugCounter = 1;

        // Verificar se slug já existe
        let slugExists = await prisma.event.findUnique({
          where: { slug: uniqueSlug },
        });

        // Se existir, adicionar sufixo numérico
        while (slugExists) {
          uniqueSlug = `${event.slug}-${slugCounter}`;
          slugCounter++;
          slugExists = await prisma.event.findUnique({
            where: { slug: uniqueSlug },
          });
        }

        // ==================== 5. CRIAR EVENTO ====================
        const createdEvent = await prisma.event.create({
          data: {
            title: event.title,
            slug: uniqueSlug, // ✅ Usar slug único
            description: event.description,
            type: event.type,
            startDate: new Date(event.startDate),
            startTime: event.startTime,
            endDate: event.endDate ? new Date(event.endDate) : null,
            endTime: event.endTime,
            venueId: venue.id,
            venueDetails: event.venueDetails,
            ticketUrl: event.ticketUrl,
            externalUrl: event.externalUrl, // ✅ NOVO
            ticketInfo: event.ticketInfo,
            externalId: event.externalId,
            imageUrl: event.imageUrl,
            program: event.program,
            isFree:
              event.ticketInfo?.toLowerCase().includes('gratuito') || false,
            status: 'PUBLISHED',
            source: scraperId === 'osesp' ? 'SCRAPER' : 'ADMIN',
            // ✅ Conectar compositores corretamente (many-to-many)
            composerIds: composerIds,
          },
        });

        results.push({
          success: true,
          eventId: createdEvent.id,
          title: event.title,
        });

        console.log(`✅ Evento criado: ${event.title} (slug: ${uniqueSlug})`);
      } catch (eventError: any) {
        console.error(`❌ Erro ao criar evento "${event.title}":`, eventError);
        results.push({
          success: false,
          error: eventError.message || 'Erro desconhecido',
          title: event.title,
        });
      }
    }

    // ==================== 6. REGISTRAR LOG DE SCRAPING ====================
    try {
      const successCount = results.filter((r) => r.success).length;
      const duplicates = results.filter((r) => r.isDuplicate).length;

      await prisma.scrapingLog.create({
        data: {
          source: scraperId,
          status: successCount > 0 ? 'success' : 'error',
          newEvents: successCount,
          eventsFound: events.length,
          eventsCreated: successCount,
          eventsSkipped: events.length - successCount,
          details: {
            duplicates,
            errors: results.filter((r) => !r.success && !r.isDuplicate).length,
          },
          finishedAt: new Date(),
        },
      });
    } catch (logError) {
      console.warn('⚠️ Erro ao registrar log de scraping:', logError);
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: events.length,
        success: successCount,
        failed: results.filter((r) => !r.success).length,
        duplicates: results.filter((r) => r.isDuplicate).length,
      },
    });
  } catch (error: any) {
    console.error('❌ Erro ao inserir eventos:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro ao inserir eventos',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
