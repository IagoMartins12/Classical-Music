// ==================== app/api/venues/[id]/route.ts ====================
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// GET - Buscar venue específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, venue });
  } catch (error) {
    console.error('❌ [VENUE-API] Erro ao buscar venue:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar venue
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    console.log('🏛️✏️ [VENUE-API] Atualizando venue:', id);

    const existingVenue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!existingVenue) {
      return NextResponse.json(
        { error: 'Venue não encontrada' },
        { status: 404 }
      );
    }

    const updateData: any = { ...body };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.slug;

    if (updateData.capacity) {
      updateData.capacity = parseInt(updateData.capacity);
    }

    const updatedVenue = await prisma.venue.update({
      where: { id },
      data: updateData,
    });

    revalidateTag('calendar-filters');
    revalidateTag('calendar-events');

    console.log('✅ [VENUE-API] Venue atualizada:', id);

    return NextResponse.json({
      success: true,
      venue: updatedVenue,
      message: 'Venue atualizada com sucesso',
    });
  } catch (error) {
    console.error('❌ [VENUE-API] Erro ao atualizar venue:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar venue
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    const { id } = await params;

    console.log('🏛️🗑️ [VENUE-API] Deletando venue:', id);

    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue não encontrada' },
        { status: 404 }
      );
    }

    if (venue._count.events > 0) {
      return NextResponse.json(
        {
          error: `Não é possível deletar venue com ${venue._count.events} eventos associados`,
        },
        { status: 400 }
      );
    }

    await prisma.venue.delete({
      where: { id },
    });

    revalidateTag('calendar-filters');

    console.log('✅ [VENUE-API] Venue deletada:', id);

    return NextResponse.json({
      success: true,
      message: 'Venue deletada com sucesso',
    });
  } catch (error) {
    console.error('❌ [VENUE-API] Erro ao deletar venue:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
