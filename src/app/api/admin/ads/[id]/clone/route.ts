// app/api/admin/ads/[id]/clone/route.ts - API com verificação detalhada de conflitos
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

    // Definir título do clone e dados
    const cloneTitle = modifications.title || `${originalAd.title} - Cópia`;

    // Preparar dados para o clone
    const cloneData = {
      title: cloneTitle,
      description: modifications.description || originalAd.description,
      content: modifications.content || originalAd.content,
      imageUrl: null,
      thumbnailUrl: null,
      videoUrl: null,
      imageVersions: null,
      videoVersions: null,
      ctaText: modifications.ctaText || originalAd.ctaText,
      targetUrl: modifications.targetUrl || originalAd.targetUrl,
      linkType: modifications.linkType || originalAd.linkType,
      isExternal: modifications.isExternal ?? originalAd.isExternal,
      type: modifications.type || originalAd.type,
      placement: modifications.placement || originalAd.placement,
      status: modifications.status || 'DRAFT',
      targetType: modifications.targetType || originalAd.targetType,
      targetUserLevel:
        modifications.targetUserLevel || originalAd.targetUserLevel,
      instrumentId:
        modifications.instrumentId !== undefined
          ? modifications.instrumentId
          : originalAd.instrumentId,
      advertiserName: modifications.advertiserName || originalAd.advertiserName,
      advertiserEmail:
        modifications.advertiserEmail || originalAd.advertiserEmail,
      advertiserPhone:
        modifications.advertiserPhone || originalAd.advertiserPhone,
      advertiserWebsite:
        modifications.advertiserWebsite || originalAd.advertiserWebsite,
      startDate: modifications.startDate
        ? new Date(modifications.startDate)
        : null,
      endDate: modifications.endDate ? new Date(modifications.endDate) : null,
      showOnMobile: modifications.showOnMobile ?? originalAd.showOnMobile,
      showOnTablet: modifications.showOnTablet ?? originalAd.showOnTablet,
      showOnDesktop: modifications.showOnDesktop ?? originalAd.showOnDesktop,
      imageQuality: originalAd.imageQuality || 'high',
      videoQuality: originalAd.videoQuality || 'high',
      mediaMetadata: {
        ...(originalAd.mediaMetadata as Record<string, any>),
        clonedFrom: originalAdId,
        clonedAt: new Date().toISOString(),
      },
      createdBy: session.user.id,
    };

    // 🆕 VERIFICAÇÃO DETALHADA DE CONFLITOS
    console.log('🔍 Executando verificação detalhada de conflitos...');

    try {
      const conflictCheckResponse = await fetch(
        `${
          process.env.NEXTAUTH_URL || 'http://localhost:3000'
        }/api/admin/ads/check-conflict`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: request.headers.get('cookie') || '', // Passar cookies para autenticação
          },
          body: JSON.stringify(cloneData),
        }
      );

      if (conflictCheckResponse.ok) {
        const conflictResult = await conflictCheckResponse.json();

        console.log('📊 Resultado da verificação:', conflictResult.summary);

        if (conflictResult.hasConflict) {
          console.log('❌ Conflitos detectados:');
          conflictResult.conflicts.forEach((conflict: any, index: number) => {
            console.log(
              `  ${index + 1}. ${conflict.type}: ${conflict.message}`
            );
          });

          // Retornar detalhes dos conflitos
          return NextResponse.json(
            {
              error: 'Conflitos detectados que impedem a clonagem',
              details: {
                summary: conflictResult.summary,
                conflicts: conflictResult.conflicts,
                checkedConstraints: conflictResult.checkedConstraints,
                cloneData: {
                  placement: cloneData.placement,
                  targetType: cloneData.targetType,
                  instrumentId: cloneData.instrumentId,
                  status: cloneData.status,
                },
                suggestions: generateConflictSuggestions(
                  conflictResult.conflicts
                ),
              },
            },
            { status: 409 }
          ); // 409 Conflict
        } else {
          console.log(
            '✅ Nenhum conflito detectado, prosseguindo com a clonagem'
          );
        }
      } else {
        console.warn(
          '⚠️ Erro na verificação de conflitos, prosseguindo sem verificação'
        );
      }
    } catch (conflictError) {
      console.warn('⚠️ Erro ao verificar conflitos:', conflictError);
      console.log('⚠️ Prosseguindo sem verificação de conflitos');
    }

    // Tentar criar o clone
    let clonedAd;
    try {
      console.log('🔨 Criando clone no banco de dados...');

      clonedAd = await prisma.advertisement.create({
        data: cloneData,
        include: {
          instrument: {
            select: { id: true, name: true },
          },
        },
      });

      console.log(`✅ Anúncio clonado criado com ID: ${clonedAd.id}`);
    } catch (dbError: any) {
      console.error('❌ Erro ao criar clone no banco:', dbError);

      // 🆕 ANÁLISE DETALHADA DO ERRO DO BANCO
      if (dbError.code === 'P2002') {
        // Unique constraint violation
        const constraintInfo = dbError.meta?.target || [];
        const constraintName = dbError.meta?.constraint || 'unknown';

        console.log(`🔍 Violação de constraint: ${constraintName}`);
        console.log(`🔍 Campos afetados:`, constraintInfo);

        let detailedError = `Erro de constraint única no banco de dados.\n`;
        detailedError += `Constraint violada: ${constraintName}\n`;
        detailedError += `Campos: ${
          Array.isArray(constraintInfo)
            ? constraintInfo.join(', ')
            : constraintInfo
        }\n`;

        // Buscar o anúncio conflitante
        let conflictingAd = null;
        try {
          if (Array.isArray(constraintInfo)) {
            const conflictWhere: any = {};

            if (constraintInfo.includes('placement'))
              conflictWhere.placement = cloneData.placement;
            if (constraintInfo.includes('targetType'))
              conflictWhere.targetType = cloneData.targetType;
            if (constraintInfo.includes('instrumentId'))
              conflictWhere.instrumentId = cloneData.instrumentId;

            conflictingAd = await prisma.advertisement.findFirst({
              where: conflictWhere,
              include: {
                instrument: { select: { name: true } },
              },
            });

            if (conflictingAd) {
              detailedError += `\nAnúncio conflitante encontrado:\n`;
              detailedError += `- ID: ${conflictingAd.id}\n`;
              detailedError += `- Título: ${conflictingAd.title}\n`;
              detailedError += `- Anunciante: ${conflictingAd.advertiserName}\n`;
              detailedError += `- Status: ${conflictingAd.status}\n`;
              detailedError += `- Placement: ${conflictingAd.placement}\n`;
              detailedError += `- Target Type: ${conflictingAd.targetType}\n`;
              if (conflictingAd.instrumentId) {
                detailedError += `- Instrumento: ${
                  conflictingAd.instrument?.name || conflictingAd.instrumentId
                }\n`;
              }
            }
          }
        } catch (searchError) {
          console.warn('⚠️ Erro ao buscar anúncio conflitante:', searchError);
        }

        return NextResponse.json(
          {
            error: 'Erro de constraint única',
            details: {
              type: 'DATABASE_CONSTRAINT_VIOLATION',
              constraintName,
              constraintFields: constraintInfo,
              message: detailedError,
              conflictingAd,
              attemptedData: {
                placement: cloneData.placement,
                targetType: cloneData.targetType,
                instrumentId: cloneData.instrumentId,
                status: cloneData.status,
              },
              suggestions: [
                'Altere o posicionamento (placement) do anúncio',
                'Altere o tipo de segmentação (targetType)',
                'Se for por instrumento, escolha outro instrumento',
                'Mantenha como DRAFT se há conflito com anúncios ativos',
              ],
            },
          },
          { status: 409 }
        );
      }

      // Outros erros do banco
      throw dbError;
    }

    // Resto do código de clonagem de mídia...
    const clonedMediaInfo = { image: false, thumbnail: false, video: false };
    const hasMedia =
      originalAd.imageUrl ||
      originalAd.videoUrl ||
      originalAd.imageVersions ||
      originalAd.videoVersions;

    if (hasMedia) {
      try {
        console.log('📁 Iniciando clonagem de mídia...');
        const clonedMedia = await cloneAdMedia(
          originalAd,
          clonedAd.title,
          clonedAd.id
        );

        if (clonedMedia.imageUrl || clonedMedia.imageVersions) {
          clonedMediaInfo.image = true;
        }
        if (clonedMedia.videoUrl || clonedMedia.videoVersions) {
          clonedMediaInfo.video = true;
        }
        if (clonedMedia.thumbnailUrl) {
          clonedMediaInfo.thumbnail = true;
        }

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

          if (updateData.imageVersions || updateData.videoVersions) {
            updateData.mediaMetadata = {
              ...(clonedAd.mediaMetadata as Record<string, any>),
              adDirectory: `${clonedAd.title}-${clonedAd.id}`,
              clonedMediaAt: new Date().toISOString(),
            };
          }

          const finalAd = await prisma.advertisement.update({
            where: { id: clonedAd.id },
            data: updateData,
            include: {
              instrument: {
                select: { id: true, name: true },
              },
            },
          });

          console.log('✅ Mídia clonada e URLs atualizadas');
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
              newDirectory: `${clonedAd.title}-${clonedAd.id}`,
              modifications: Object.keys(modifications),
            },
          });
        }
      } catch (mediaError) {
        console.warn('⚠️ Erro na clonagem de mídia:', mediaError);
        revalidateTag('public-ads');

        return NextResponse.json({
          success: true,
          ad: clonedAd,
          message: 'Anúncio clonado, mas mídia não foi copiada.',
          warning: 'Mídia não foi clonada automaticamente',
          mediaCloned: clonedMediaInfo,
        });
      }
    }

    // Sem mídia para clonar
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
        newDirectory: `${clonedAd.title}-${clonedAd.id}`,
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

// 🆕 Função para gerar sugestões baseadas nos conflitos
function generateConflictSuggestions(conflicts: any[]): string[] {
  const suggestions = new Set<string>();

  conflicts.forEach((conflict) => {
    switch (conflict.type) {
      case 'CONSTRAINT_UNIQUE_PLACEMENT_TARGET_INSTRUMENT':
        suggestions.add('💡 Altere o posicionamento (placement) do anúncio');
        suggestions.add('💡 Escolha um tipo de segmentação diferente');
        if (conflict.conflictingAd?.instrumentId) {
          suggestions.add(
            '💡 Selecione outro instrumento ou remova a segmentação por instrumento'
          );
        }
        break;

      case 'CONSTRAINT_UNIQUE_TARGET_INSTRUMENT':
        suggestions.add('💡 Escolha outro instrumento para segmentação');
        suggestions.add(
          '💡 Altere o tipo de segmentação para GENERAL ou USER_LEVEL'
        );
        break;

      case 'BUSINESS_RULE_ACTIVE_PLACEMENT':
        suggestions.add('💡 Pause o anúncio conflitante antes de ativar este');
        suggestions.add('💡 Mantenha este anúncio como DRAFT');
        suggestions.add(
          '💡 Agende este anúncio para após o término do conflitante'
        );
        break;

      case 'BUSINESS_LOGIC_MISSING_INSTRUMENT':
        suggestions.add(
          '💡 Selecione um instrumento para segmentação por INSTRUMENT'
        );
        suggestions.add(
          '💡 Altere o tipo de segmentação para GENERAL ou USER_LEVEL'
        );
        break;

      case 'BUSINESS_LOGIC_UNEXPECTED_INSTRUMENT':
        suggestions.add('💡 Remova a seleção de instrumento');
        suggestions.add('💡 Altere o tipo de segmentação para INSTRUMENT');
        break;
    }
  });

  return Array.from(suggestions);
}
