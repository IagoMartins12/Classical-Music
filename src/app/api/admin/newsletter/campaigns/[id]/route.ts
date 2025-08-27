// app/api/admin/newsletter/campaigns/[id]/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
      include: {
        template: true,

        events: {
          take: 100,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Erro ao buscar campanha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const campaign = await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        ...body,
        lastEditedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        template: true,
      },
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Erro ao atualizar campanha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verificar se a campanha pode ser deletada
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    if (campaign.status === 'SENDING') {
      return NextResponse.json(
        {
          success: false,
          error: 'Não é possível deletar uma campanha que está sendo enviada',
        },
        { status: 400 }
      );
    }

    await prisma.newsletterCampaign.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Campanha deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar campanha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
