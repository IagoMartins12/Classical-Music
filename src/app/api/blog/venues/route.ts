// ==================== app/api/venues/route.ts ====================
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// POST - Criar nova venue
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
    console.log('🏛️ [VENUE-API] Criando nova venue:', body.name);

    if (!body.name || !body.city || !body.state) {
      return NextResponse.json(
        { error: 'Nome, cidade e estado são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar slug único
    const baseSlug = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.venue.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const venue = await prisma.venue.create({
      data: {
        name: body.name,
        slug,
        shortName: body.shortName || undefined,
        city: body.city,
        state: body.state,
        country: body.country || 'Brasil',
        address: body.address || undefined,
        zipCode: body.zipCode || undefined,
        website: body.website || undefined,
        email: body.email || undefined,
        phone: body.phone || undefined,
        capacity: body.capacity ? parseInt(body.capacity) : undefined,
        description: body.description || undefined,
        history: body.history || undefined,
        logoUrl: body.logoUrl || undefined,
        coverImageUrl: body.coverImageUrl || undefined,
        galleryImages: body.galleryImages || [],
        scrapingEnabled: body.scrapingEnabled || false,
        scrapingUrl: body.scrapingUrl || undefined,
        scrapingConfig: body.scrapingConfig || undefined,
        isVerified: body.isVerified || false,
        isActive: body.isActive !== false,
        metaTitle: body.metaTitle || undefined,
        metaDescription: body.metaDescription || undefined,
      },
    });

    revalidateTag('calendar-filters');

    console.log('✅ [VENUE-API] Venue criada:', venue.id);

    return NextResponse.json({
      success: true,
      venue,
      message: 'Venue criada com sucesso',
    });
  } catch (error) {
    console.error('❌ [VENUE-API] Erro ao criar venue:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
