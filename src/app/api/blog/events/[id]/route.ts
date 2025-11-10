// ==================== app/api/events/[id]/route.ts ====================
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// GET - Buscar evento específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        venue: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('❌ [EVENT-API] Erro ao buscar evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar evento
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

    console.log('📅✏️ [EVENT-API] Atualizando evento:', id);

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    // Preparar dados de atualização
    const updateData: any = { ...body };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.slug; // Não permitir mudança de slug

    // Converter datas
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    // Se status mudou para PUBLISHED, adicionar publishedAt
    if (updateData.status === 'PUBLISHED' && !existingEvent.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        venue: true,
      },
    });

    // Revalidar cache
    revalidateTag('calendar-events');
    revalidateTag('calendar-data');

    console.log('✅ [EVENT-API] Evento atualizado:', id);

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: 'Evento atualizado com sucesso',
    });
  } catch (error) {
    console.error('❌ [EVENT-API] Erro ao atualizar evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar evento
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

    console.log('📅🗑️ [EVENT-API] Deletando evento:', id);

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    await prisma.event.delete({
      where: { id },
    });

    // Revalidar cache
    revalidateTag('calendar-events');
    revalidateTag('calendar-data');

    console.log('✅ [EVENT-API] Evento deletado:', id);

    return NextResponse.json({
      success: true,
      message: 'Evento deletado com sucesso',
    });
  } catch (error) {
    console.error('❌ [EVENT-API] Erro ao deletar evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
