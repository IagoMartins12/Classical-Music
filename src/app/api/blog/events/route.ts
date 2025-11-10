// ==================== app/api/events/route.ts ====================
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { EventSource } from '@prisma/client';

// POST - Criar novo evento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('📅 [EVENT-API] Criando novo evento:', body.title);

    // Validações básicas
    if (!body.title || !body.venueId || !body.startDate || !body.type) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Criar slug único
    const baseSlug = body.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const adminSource: EventSource = 'ADMIN';

    // Preparar dados
    const eventData = {
      title: body.title,
      slug,
      subtitle: body.subtitle || undefined,
      description: body.description || undefined,
      fullDetails: body.fullDetails || undefined,
      type: body.type,
      status: body.status || 'PENDING',
      venueId: body.venueId,
      room: body.room || undefined,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      startTime: body.startTime,
      endTime: body.endTime || undefined,
      duration: body.duration ? parseInt(body.duration) : undefined,
      doors: body.doors || undefined,
      program: body.program || undefined,
      composerIds: body.composerIds || [],
      workIds: body.workIds || [],
      instrumentIds: body.instrumentIds || [],
      epochIds: body.epochIds || [],
      performers: body.performers || undefined,
      conductor: body.conductor || undefined,
      soloists: body.soloists || [],
      ensemble: body.ensemble || undefined,
      ticketUrl: body.ticketUrl || undefined,
      ticketPrice: body.ticketPrice || undefined,
      isFree: body.isFree || false,
      imageUrl: body.imageUrl || undefined,
      coverImageUrl: body.coverImageUrl || undefined,
      galleryImages: body.galleryImages || [],
      videoUrl: body.videoUrl || undefined,
      ageRating: body.ageRating || undefined,
      isFeatured: body.isFeatured || false,
      featuredOrder: body.featuredOrder || undefined,
      isVerified: body.isVerified || false,
      verifiedBy: session.user.id,
      verifiedAt: new Date(),
      submittedBy: session.user.id,
      submittedAt: new Date(),
      publishedAt: body.status === 'PUBLISHED' ? new Date() : undefined,
      metaTitle: body.metaTitle || undefined,
      metaDescription: body.metaDescription || undefined,
      keywords: body.keywords || [],
      venueDetails: body.venueDetails || undefined,
      ticketInfo: body.ticketInfo || undefined,
      source: adminSource,
    };

    const { venueId, ...rest } = eventData;

    const event = await prisma.event.create({
      data: {
        ...rest,
        venue: {
          connect: { id: venueId },
        },
      },
      include: {
        venue: true,
      },
    });
    // Revalidar cache
    revalidateTag('calendar-events');
    revalidateTag('calendar-data');

    console.log('✅ [EVENT-API] Evento criado:', event.id);

    return NextResponse.json({
      success: true,
      event,
      message: 'Evento criado com sucesso',
    });
  } catch (error) {
    console.error('❌ [EVENT-API] Erro ao criar evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
