// app/api/admin/ads/[id]/clone/route.ts - API para clonagem de anúncios
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { cloneAdMedia } from '@/app/libs/mediaUtils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const originalAdId = params.id;
    const body = await request.json();
    const modifications = body || {};

    // Buscar anúncio original
    const originalAd = await prisma.advertisement.findUnique({
      where: { id: originalAdId },
      include: {
        instrument: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!originalAd) {
      return NextResponse.json(
        { error: 'Anúncio original não encontrado' },
        { status: 404 }
      );
    }

    // Preparar dados para o clone
    const cloneData = {
      // Dados básicos - aplicar modificações se fornecidas
      title: modifications.title || `${originalAd.title} - Cópia`,
      description: modifications.description || originalAd.description,
      content: modifications.content || originalAd.content,

      // Mídia - manter as URLs originais
      imageUrl: originalAd.imageUrl,
      thumbnailUrl: originalAd.thumbnailUrl,
      videoUrl: originalAd.videoUrl,

      // CTA e links
      ctaText: modifications.ctaText || originalAd.ctaText,
      targetUrl: modifications.targetUrl || originalAd.targetUrl,
      linkType: modifications.linkType || originalAd.linkType,
      isExternal: modifications.isExternal ?? originalAd.isExternal,

      // Configurações de exibição - aplicar modificações
      type: modifications.type || originalAd.type,
      placement: modifications.placement || originalAd.placement,
      status: modifications.status || 'DRAFT', // Sempre começar como DRAFT

      // Targeting - aplicar modificações
      targetType: modifications.targetType || originalAd.targetType,
      targetUserLevel:
        modifications.targetUserLevel || originalAd.targetUserLevel,
      instrumentId:
        modifications.instrumentId !== undefined
          ? modifications.instrumentId
          : originalAd.instrumentId,

      // Dados do anunciante
      advertiserName: modifications.advertiserName || originalAd.advertiserName,
      advertiserEmail:
        modifications.advertiserEmail || originalAd.advertiserEmail,
      advertiserPhone:
        modifications.advertiserPhone || originalAd.advertiserPhone,
      advertiserWebsite:
        modifications.advertiserWebsite || originalAd.advertiserWebsite,

      // Agendamento - resetar datas
      startDate: modifications.startDate
        ? new Date(modifications.startDate)
        : null,
      endDate: modifications.endDate ? new Date(modifications.endDate) : null,

      // Dispositivos
      showOnMobile: modifications.showOnMobile ?? originalAd.showOnMobile,
      showOnTablet: modifications.showOnTablet ?? originalAd.showOnTablet,
      showOnDesktop: modifications.showOnDesktop ?? originalAd.showOnDesktop,

      // Controle de acesso
      createdBy: session.user.id,
    };

    // Verificar se há conflito com a nova configuração
    const conflictCheck = await prisma.advertisement.findFirst({
      where: {
        placement: cloneData.placement,
        targetType: cloneData.targetType,
        instrumentId: cloneData.instrumentId,
        status: { in: ['ACTIVE', 'SCHEDULED'] },
      },
    });

    if (conflictCheck) {
      return NextResponse.json(
        {
          error: `Já existe um anúncio ativo para esta combinação: ${
            cloneData.placement
          } + ${cloneData.targetType}${
            cloneData.instrumentId ? ` + instrumento específico` : ''
          }`,
        },
        { status: 400 }
      );
    }

    // Criar o clone
    const clonedAd = await prisma.advertisement.create({
      data: cloneData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        instrument: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 🆕 Clonar mídia (criar cópias físicas dos arquivos)
    const clonedMedia = await cloneAdMedia(originalAd, clonedAd.id);

    // Atualizar o anúncio clonado com as novas URLs de mídia
    let finalAd = clonedAd;
    if (
      clonedMedia.imageUrl ||
      clonedMedia.thumbnailUrl ||
      clonedMedia.videoUrl
    ) {
      finalAd = await prisma.advertisement.update({
        where: { id: clonedAd.id },
        data: {
          imageUrl: clonedMedia.imageUrl,
          thumbnailUrl: clonedMedia.thumbnailUrl,
          videoUrl: clonedMedia.videoUrl,
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          instrument: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    // Invalidar cache
    revalidateTag('public-ads');

    return NextResponse.json({
      success: true,
      ad: finalAd,
      message: 'Anúncio clonado com sucesso',
      mediaCloned: {
        image: !!clonedMedia.imageUrl,
        thumbnail: !!clonedMedia.thumbnailUrl,
        video: !!clonedMedia.videoUrl,
      },
    });
  } catch (error) {
    console.error('Erro ao clonar anúncio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
