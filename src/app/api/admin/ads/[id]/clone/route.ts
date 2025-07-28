// app/api/admin/ads/[id]/clone/route.ts - API para clonagem usando serverMediaProcessor
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { cloneAdMedia } from '@/app/libs/ads/serverMediaProcessor';

interface Params {
  id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { id } = await params;

    const originalAdId = id;
    const body = await request.json();
    const modifications = body || {};

    console.log(`📋 Iniciando clonagem do anúncio ${originalAdId}`);

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

    console.log(`✅ Anúncio original encontrado: ${originalAd.title}`);

    // Preparar dados para o clone
    const cloneData = {
      // Dados básicos - aplicar modificações se fornecidas
      title: modifications.title || `${originalAd.title} - Cópia`,
      description: modifications.description || originalAd.description,
      content: modifications.content || originalAd.content,

      // Mídia - inicialmente manter as URLs originais (serão atualizadas após clonagem)
      imageUrl: originalAd.imageUrl,
      thumbnailUrl: originalAd.thumbnailUrl,
      videoUrl: originalAd.videoUrl,
      imageVersions: originalAd.imageVersions,
      videoVersions: originalAd.videoVersions,

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

      // Qualidade de mídia
      imageQuality: originalAd.imageQuality || 'high',
      videoQuality: originalAd.videoQuality || 'high',
      mediaMetadata: {
        ...(originalAd.mediaMetadata as Record<string, any>),
        clonedFrom: originalAdId,
        clonedAt: new Date().toISOString(),
      },

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

    console.log('✅ Nenhum conflito encontrado, criando clone...');

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

    console.log(`✅ Anúncio clonado criado com ID: ${clonedAd.id}`);

    // Clonar mídia física (criar cópias independentes dos arquivos)
    const clonedMediaInfo = {
      image: false,
      thumbnail: false,
      video: false,
    };

    try {
      console.log('📁 Iniciando clonagem de mídia...');

      const clonedMedia = await cloneAdMedia(originalAd, clonedAd.id);

      if (clonedMedia.imageUrl || clonedMedia.imageVersions) {
        clonedMediaInfo.image = true;
      }

      if (clonedMedia.videoUrl || clonedMedia.videoVersions) {
        clonedMediaInfo.video = true;
      }

      if (clonedMedia.thumbnailUrl) {
        clonedMediaInfo.thumbnail = true;
      }

      // Atualizar o anúncio clonado com as novas URLs de mídia
      if (Object.keys(clonedMedia).length > 0) {
        const updateData: any = {};

        if (clonedMedia.imageUrl) updateData.imageUrl = clonedMedia.imageUrl;
        if (clonedMedia.imageVersions)
          updateData.imageVersions = clonedMedia.imageVersions;
        if (clonedMedia.videoUrl) updateData.videoUrl = clonedMedia.videoUrl;
        if (clonedMedia.videoVersions)
          updateData.videoVersions = clonedMedia.videoVersions;
        if (clonedMedia.thumbnailUrl)
          updateData.thumbnailUrl = clonedMedia.thumbnailUrl;

        const finalAd = await prisma.advertisement.update({
          where: { id: clonedAd.id },
          data: updateData,
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

        console.log('✅ Mídia clonada e URLs atualizadas');

        // Invalidar cache
        revalidateTag('public-ads');

        return NextResponse.json({
          success: true,
          ad: finalAd,
          message: 'Anúncio clonado com sucesso! 🎉',
          mediaCloned: clonedMediaInfo,
          details: {
            originalId: originalAdId,
            clonedId: clonedAd.id,
            hasMedia: clonedMediaInfo.image || clonedMediaInfo.video,
            modifications: Object.keys(modifications).filter(
              (key) =>
                modifications[key as keyof typeof originalAd] !==
                originalAd[key as keyof typeof originalAd]
            ),
          },
        });
      }
    } catch (mediaError) {
      console.warn(
        '⚠️ Erro na clonagem de mídia, mas anúncio foi criado:',
        mediaError
      );

      // Anúncio foi criado, mas mídia não foi clonada
      // Invalidar cache mesmo assim
      revalidateTag('public-ads');

      return NextResponse.json({
        success: true,
        ad: clonedAd,
        message:
          'Anúncio clonado, mas mídia não foi copiada. Você pode fazer upload manual.',
        warning: 'Mídia não foi clonada automaticamente',
        mediaCloned: clonedMediaInfo,
        details: {
          originalId: originalAdId,
          clonedId: clonedAd.id,
          hasMedia: false,
          mediaError:
            mediaError instanceof Error
              ? mediaError.message
              : 'Erro desconhecido',
        },
      });
    }

    // Se chegou aqui, não teve mídia para clonar
    console.log('ℹ️ Anúncio original não tinha mídia para clonar');

    // Invalidar cache
    revalidateTag('public-ads');

    return NextResponse.json({
      success: true,
      ad: clonedAd,
      message: 'Anúncio clonado com sucesso!',
      mediaCloned: clonedMediaInfo,
      details: {
        originalId: originalAdId,
        clonedId: clonedAd.id,
        hasMedia: false,
        note: 'Anúncio original não tinha mídia',
      },
    });
  } catch (error) {
    console.error('❌ Erro ao clonar anúncio:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
