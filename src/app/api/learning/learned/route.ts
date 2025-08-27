// app/api/learning/learned/route.ts - ATUALIZADO COM UPLOAD DE VÍDEO
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import {
  uploadLearnedVideo,
  deleteLearnedVideo,
  deleteAllLearnedVideos,
  extractLearnedVideoData,
  createLearnedVideoData,
} from '@/app/utils/learnedVideoUpload';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 🆕 PROCESSAR FORMDATA PARA UPLOAD DE VÍDEO
    const contentType = request.headers.get('content-type');
    let body: any;
    let videoFile: File | null = null;

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const jsonData = formData.get('data') as string;
      body = JSON.parse(jsonData);
      videoFile = formData.get('videoFile') as File | null;

      console.log(`🎥 [LEARNED] FormData recebido - vídeo: ${!!videoFile}`);
    } else {
      body = await request.json();
    }

    const {
      workId,
      action,
      mastery = 0,
      // Campos existentes
      studyStartDate,
      studyDuration,
      notes,
      wouldRecommend,
      publicPerformance,
      difficulty,
      enjoyment,
      technicalChallenges,
      musicalInsights,
      selectedWorkScoreId,
      // 🆕 NOVO: Campo para vídeo público/privado
      isVideoPublic = false,
    } = body;

    if (!workId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    if (mastery < 0 || mastery > 5) {
      return NextResponse.json(
        { error: 'Maestria deve ser entre 1 e 5' },
        { status: 400 }
      );
    }

    // Verificar se a obra existe
    const workExists = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true },
    });

    if (!workExists) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Validar WorkScore se fornecido
    if (selectedWorkScoreId) {
      const workScoreExists = await prisma.workScore.findFirst({
        where: {
          id: selectedWorkScoreId,
          workId: workId,
          isActive: true,
        },
      });

      if (!workScoreExists) {
        return NextResponse.json(
          { error: 'Partitura não encontrada ou não pertence a esta obra' },
          { status: 400 }
        );
      }
    }

    if (action === 'add') {
      // Remover da lista de "quero estudar" (exclusão mútua)
      await prisma.wantToLearn.deleteMany({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

      // Preparar dados base
      const dataToSave: any = {
        userId: session.user.id,
        workId: workId,
        mastery: mastery,
      };

      // Campos opcionais
      if (studyStartDate) dataToSave.studyStartDate = new Date(studyStartDate);
      if (studyDuration) dataToSave.studyDuration = studyDuration;
      if (notes) dataToSave.notes = notes;
      if (wouldRecommend !== undefined)
        dataToSave.wouldRecommend = wouldRecommend;
      if (publicPerformance !== undefined)
        dataToSave.publicPerformance = publicPerformance;
      if (difficulty) dataToSave.difficulty = difficulty;
      if (enjoyment) dataToSave.enjoyment = enjoyment;
      if (technicalChallenges)
        dataToSave.technicalChallenges = technicalChallenges;
      if (musicalInsights) dataToSave.musicalInsights = musicalInsights;
      if (selectedWorkScoreId)
        dataToSave.selectedWorkScoreId = selectedWorkScoreId;

      // Primeiro, criar o item learned (para obter o ID)
      const learnedItem = await prisma.learned.upsert({
        where: {
          userId_workId: {
            userId: session.user.id,
            workId: workId,
          },
        },
        update: {
          ...dataToSave,
          learnedAt: new Date(),
        },
        create: dataToSave,
        select: {
          id: true,
        },
      });

      // 🆕 PROCESSAR UPLOAD DE VÍDEO SE FORNECIDO
      let videoUploadResult = null;
      let videoData = null;

      if (videoFile) {
        console.log(
          `🎥 [LEARNED] Processando upload de vídeo para learned ${learnedItem.id}`
        );

        videoUploadResult = await uploadLearnedVideo(
          workId,
          learnedItem.id,
          videoFile
        );

        if (!videoUploadResult.success) {
          // Se falhou upload, remover learned item criado
          await prisma.learned.delete({
            where: { id: learnedItem.id },
          });

          return NextResponse.json(
            { error: `Erro no upload do vídeo: ${videoUploadResult.error}` },
            { status: 400 }
          );
        }

        // Criar dados do vídeo
        videoData = createLearnedVideoData(videoUploadResult, isVideoPublic);

        // Atualizar learned item com dados do vídeo
        await prisma.learned.update({
          where: { id: learnedItem.id },
          data: videoData,
        });

        console.log(`✅ [LEARNED] Vídeo salvo: ${videoUploadResult.filename}`);
      }

      // Buscar item completo para resposta
      const completeLearnedItem = await prisma.learned.findUnique({
        where: { id: learnedItem.id },
        include: {
          work: {
            select: {
              id: true,
              title: true,
              opOrCatalog: true,
              composer: {
                select: {
                  name: true,
                  fullName: true,
                },
              },
            },
          },
          selectedWorkScore: {
            select: {
              id: true,
              sourceId: true,
              source: true,
              title: true,
              downloadUrl: true,
              thumbnailUrl: true,
              fileSize: true,
              pageCount: true,
              fileFormat: true,
              type: true,
              editor: true,
              publisher: true,
              copyright: true,
              uploadDate: true,
              uploader: true,
              notes: true,
            },
          },
        },
      });

      // Revalidação de cache
      revalidateTag(`user-learning-${session.user.id}`);
      revalidateTag(`work-learning-${workId}`);
      revalidateTag('user-learning');
      revalidateTag('learning-stats');
      revalidateTag('student-profile-data');
      revalidateTag(`student-profile-${session.user.id}`);
      revalidateTag('student-dashboard-data');
      revalidateTag(`student-dashboard-${session.user.id}`);

      console.log(
        `✅ [LEARNED] Item criado${videoFile ? ' com vídeo' : ''} - User: ${
          session.user.id
        }, Work: ${workId}`
      );

      return NextResponse.json({
        success: true,
        action: 'added',
        videoUpload: videoUploadResult,
        item: {
          id: completeLearnedItem!.id,
          userId: completeLearnedItem!.userId,
          workId: completeLearnedItem!.workId,
          mastery: completeLearnedItem!.mastery,
          learnedAt: completeLearnedItem!.learnedAt.toISOString(),
          studyStartDate: completeLearnedItem!.studyStartDate?.toISOString(),
          studyDuration: completeLearnedItem!.studyDuration,
          notes: completeLearnedItem!.notes,
          wouldRecommend: completeLearnedItem!.wouldRecommend,
          publicPerformance: completeLearnedItem!.publicPerformance,
          difficulty: completeLearnedItem!.difficulty,
          enjoyment: completeLearnedItem!.enjoyment,
          technicalChallenges: completeLearnedItem!.technicalChallenges,
          musicalInsights: completeLearnedItem!.musicalInsights,
          selectedWorkScoreId: completeLearnedItem!.selectedWorkScoreId,
          selectedWorkScore: completeLearnedItem!.selectedWorkScore,
          // 🆕 CAMPOS DE VÍDEO
          videoUrl: completeLearnedItem!.videoUrl,
          videoFileName: completeLearnedItem!.videoFileName,
          videoFilePath: completeLearnedItem!.videoFilePath,
          videoFileSize: completeLearnedItem!.videoFileSize,
          isVideoPublic: completeLearnedItem!.isVideoPublic,
          videoUploadedAt: completeLearnedItem!.videoUploadedAt?.toISOString(),
          work: completeLearnedItem!.work,
        },
      });
    } else if (action === 'remove') {
      // Buscar item para pegar dados do vídeo antes de deletar
      const existingItem = await prisma.learned.findFirst({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

      if (existingItem) {
        // 🆕 DELETAR VÍDEO SE EXISTE
        const videoData = extractLearnedVideoData(existingItem);
        if (videoData) {
          await deleteAllLearnedVideos(workId, existingItem.id);
          console.log(
            `🗑️ [LEARNED] Vídeos do learned ${existingItem.id} removidos`
          );
        }
      }

      // Remover da lista de aprendidas
      await prisma.learned.deleteMany({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

      // Revalidação de cache
      revalidateTag(`user-learning-${session.user.id}`);
      revalidateTag(`work-learning-${workId}`);
      revalidateTag('user-learning');
      revalidateTag('learning-stats');
      revalidateTag('student-profile-data');
      revalidateTag(`student-profile-${session.user.id}`);
      revalidateTag('student-dashboard-data');
      revalidateTag(`student-dashboard-${session.user.id}`);

      console.log(
        `✅ [LEARNED] Item removido com vídeos - User: ${session.user.id}, Work: ${workId}`
      );

      return NextResponse.json({
        success: true,
        action: 'removed',
      });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('❌ [LEARNED] Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 🆕 PROCESSAR FORMDATA PARA UPLOAD DE VÍDEO
    const contentType = request.headers.get('content-type');
    let body: any;
    let videoFile: File | null = null;

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const jsonData = formData.get('data') as string;
      body = JSON.parse(jsonData);
      videoFile = formData.get('videoFile') as File | null;

      console.log(
        `🎥 [LEARNED] PATCH FormData recebido - vídeo: ${!!videoFile}`
      );
    } else {
      body = await request.json();
    }

    const {
      workId, // ✅ CORREÇÃO: Removido 'action' da validação do PATCH
      mastery,
      studyStartDate,
      studyDuration,
      notes,
      wouldRecommend,
      publicPerformance,
      difficulty,
      enjoyment,
      technicalChallenges,
      musicalInsights,
      selectedWorkScoreId,
      // 🆕 NOVOS CAMPOS DE VÍDEO
      isVideoPublic,
      deleteVideo = false, // Flag para deletar vídeo existente
    } = body;

    // ✅ CORREÇÃO: Validação apenas do workId (action não é necessário no PATCH)
    if (!workId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Buscar item atual
    const existingItem = await prisma.learned.findFirst({
      where: {
        userId: session.user.id,
        workId: workId,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item não encontrado na lista de aprendidas' },
        { status: 404 }
      );
    }

    // Validar WorkScore se fornecido
    if (selectedWorkScoreId) {
      const workScoreExists = await prisma.workScore.findFirst({
        where: {
          id: selectedWorkScoreId,
          workId: workId,
          isActive: true,
        },
      });

      if (!workScoreExists) {
        return NextResponse.json(
          { error: 'Partitura não encontrada ou não pertence a esta obra' },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const dataToUpdate: any = {};

    if (mastery !== undefined) {
      if (mastery < 0 || mastery > 5) {
        return NextResponse.json(
          { error: 'Maestria deve ser entre 1 e 5' },
          { status: 400 }
        );
      }
      dataToUpdate.mastery = mastery;
      dataToUpdate.learnedAt = new Date();
    }

    // Campos opcionais
    if (studyStartDate !== undefined)
      dataToUpdate.studyStartDate = studyStartDate
        ? new Date(studyStartDate)
        : null;
    if (studyDuration !== undefined) dataToUpdate.studyDuration = studyDuration;
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (wouldRecommend !== undefined)
      dataToUpdate.wouldRecommend = wouldRecommend;
    if (publicPerformance !== undefined)
      dataToUpdate.publicPerformance = publicPerformance;
    if (difficulty !== undefined) dataToUpdate.difficulty = difficulty;
    if (enjoyment !== undefined) dataToUpdate.enjoyment = enjoyment;
    if (technicalChallenges !== undefined)
      dataToUpdate.technicalChallenges = technicalChallenges;
    if (musicalInsights !== undefined)
      dataToUpdate.musicalInsights = musicalInsights;
    if (selectedWorkScoreId !== undefined)
      dataToUpdate.selectedWorkScoreId = selectedWorkScoreId;

    // 🆕 GERENCIAMENTO DE VÍDEO

    // 1. Se solicitou deletar vídeo existente
    if (deleteVideo) {
      const videoData = extractLearnedVideoData(existingItem);
      if (videoData) {
        await deleteLearnedVideo(videoData.filePath);
        console.log(`🗑️ [LEARNED] Vídeo existente removido`);
      }

      // Limpar campos de vídeo
      dataToUpdate.videoUrl = null;
      dataToUpdate.videoFileName = null;
      dataToUpdate.videoFilePath = null;
      dataToUpdate.videoFileSize = null;
      dataToUpdate.isVideoPublic = false;
      dataToUpdate.videoUploadedAt = null;
    }

    // 2. Se tem novo vídeo para upload
    if (videoFile) {
      // Deletar vídeo anterior se existe
      const videoData = extractLearnedVideoData(existingItem);
      if (videoData) {
        await deleteLearnedVideo(videoData.filePath);
        console.log(`🗑️ [LEARNED] Vídeo anterior substituído`);
      }

      // Upload novo vídeo
      const videoUploadResult = await uploadLearnedVideo(
        workId,
        existingItem.id,
        videoFile
      );

      console.log('VIDEO UPLOADS', videoUploadResult);

      if (!videoUploadResult.success) {
        return NextResponse.json(
          { error: `Erro no upload do vídeo: ${videoUploadResult.error}` },
          { status: 400 }
        );
      }

      // Adicionar dados do novo vídeo
      const newVideoData = createLearnedVideoData(
        videoUploadResult,
        isVideoPublic ?? false
      );
      Object.assign(dataToUpdate, newVideoData);

      console.log(
        `✅ [LEARNED] Novo vídeo salvo: ${videoUploadResult.filename}`
      );
    }

    // 3. Se só mudou configuração de público/privado (sem novo vídeo)
    if (isVideoPublic !== undefined && !videoFile && !deleteVideo) {
      dataToUpdate.isVideoPublic = isVideoPublic;
    }

    // Atualizar item
    const updated = await prisma.learned.updateMany({
      where: {
        userId: session.user.id,
        workId: workId,
      },
      data: dataToUpdate,
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'Item não encontrado na lista de aprendidas' },
        { status: 404 }
      );
    }

    // Buscar item atualizado
    const updatedItem = await prisma.learned.findFirst({
      where: {
        userId: session.user.id,
        workId: workId,
      },
      include: {
        work: {
          select: {
            id: true,
            title: true,
            opOrCatalog: true,
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
        selectedWorkScore: {
          select: {
            id: true,
            sourceId: true,
            source: true,
            title: true,
            downloadUrl: true,
            thumbnailUrl: true,
            fileSize: true,
            pageCount: true,
            fileFormat: true,
            type: true,
            editor: true,
            publisher: true,
            copyright: true,
            uploadDate: true,
            uploader: true,
            notes: true,
          },
        },
      },
    });

    // Revalidar cache
    revalidateTag(`user-learning-${session.user.id}`);
    revalidateTag('user-learning');
    revalidateTag('learning-stats');
    revalidateTag('student-profile-data');
    revalidateTag(`student-profile-${session.user.id}`);
    revalidateTag('student-dashboard-data');
    revalidateTag(`student-dashboard-${session.user.id}`);

    return NextResponse.json({
      success: true,
      item: updatedItem
        ? {
            id: updatedItem.id,
            userId: updatedItem.userId,
            workId: updatedItem.workId,
            mastery: updatedItem.mastery,
            learnedAt: updatedItem.learnedAt.toISOString(),
            studyStartDate: updatedItem.studyStartDate?.toISOString(),
            studyDuration: updatedItem.studyDuration,
            notes: updatedItem.notes,
            wouldRecommend: updatedItem.wouldRecommend,
            publicPerformance: updatedItem.publicPerformance,
            difficulty: updatedItem.difficulty,
            enjoyment: updatedItem.enjoyment,
            technicalChallenges: updatedItem.technicalChallenges,
            musicalInsights: updatedItem.musicalInsights,
            selectedWorkScoreId: updatedItem.selectedWorkScoreId,
            selectedWorkScore: updatedItem.selectedWorkScore,
            // 🆕 CAMPOS DE VÍDEO
            videoUrl: updatedItem.videoUrl,
            videoFileName: updatedItem.videoFileName,
            videoFilePath: updatedItem.videoFilePath,
            videoFileSize: updatedItem.videoFileSize,
            isVideoPublic: updatedItem.isVideoPublic,
            videoUploadedAt: updatedItem.videoUploadedAt?.toISOString(),
            work: updatedItem.work,
          }
        : null,
    });
  } catch (error) {
    console.error('❌ [LEARNED] Erro ao atualizar item:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
// GET method atualizado para incluir campos de vídeo
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');

    const includeFields = {
      work: {
        select: {
          id: true,
          title: true,
          opOrCatalog: true,
          composer: {
            select: {
              name: true,
              fullName: true,
            },
          },
        },
      },
      selectedWorkScore: {
        select: {
          id: true,
          sourceId: true,
          source: true,
          title: true,
          downloadUrl: true,
          thumbnailUrl: true,
          fileSize: true,
          pageCount: true,
          fileFormat: true,
          type: true,
          editor: true,
          publisher: true,
          copyright: true,
          uploadDate: true,
          uploader: true,
          notes: true,
        },
      },
    };

    if (workId) {
      const learnedItem = await prisma.learned.findFirst({
        where: {
          userId: session.user.id,
          workId: workId,
        },
        include: includeFields,
      });

      return NextResponse.json({
        learned: !!learnedItem,
        item: learnedItem
          ? {
              id: learnedItem.id,
              userId: learnedItem.userId,
              workId: learnedItem.workId,
              mastery: learnedItem.mastery,
              learnedAt: learnedItem.learnedAt.toISOString(),
              studyStartDate: learnedItem.studyStartDate?.toISOString(),
              studyDuration: learnedItem.studyDuration,
              notes: learnedItem.notes,
              wouldRecommend: learnedItem.wouldRecommend,
              publicPerformance: learnedItem.publicPerformance,
              difficulty: learnedItem.difficulty,
              enjoyment: learnedItem.enjoyment,
              technicalChallenges: learnedItem.technicalChallenges,
              musicalInsights: learnedItem.musicalInsights,
              selectedWorkScoreId: learnedItem.selectedWorkScoreId,
              selectedWorkScore: learnedItem.selectedWorkScore,
              // 🆕 CAMPOS DE VÍDEO
              videoUrl: learnedItem.videoUrl,
              videoFileName: learnedItem.videoFileName,
              videoFilePath: learnedItem.videoFilePath,
              videoFileSize: learnedItem.videoFileSize,
              isVideoPublic: learnedItem.isVideoPublic,
              videoUploadedAt: learnedItem.videoUploadedAt?.toISOString(),
              work: learnedItem.work,
            }
          : null,
      });
    }

    // Buscar todos os itens
    const learnedItems = await prisma.learned.findMany({
      where: {
        userId: session.user.id,
      },
      include: includeFields,
      orderBy: [{ mastery: 'desc' }, { learnedAt: 'desc' }],
    });

    return NextResponse.json({
      items: learnedItems.map((item) => ({
        id: item.id,
        userId: item.userId,
        workId: item.workId,
        mastery: item.mastery,
        learnedAt: item.learnedAt.toISOString(),
        studyStartDate: item.studyStartDate?.toISOString(),
        studyDuration: item.studyDuration,
        notes: item.notes,
        wouldRecommend: item.wouldRecommend,
        publicPerformance: item.publicPerformance,
        difficulty: item.difficulty,
        enjoyment: item.enjoyment,
        technicalChallenges: item.technicalChallenges,
        musicalInsights: item.musicalInsights,
        selectedWorkScoreId: item.selectedWorkScoreId,
        selectedWorkScore: item.selectedWorkScore,
        // 🆕 CAMPOS DE VÍDEO
        videoUrl: item.videoUrl,
        videoFileName: item.videoFileName,
        videoFilePath: item.videoFilePath,
        videoFileSize: item.videoFileSize,
        isVideoPublic: item.isVideoPublic,
        videoUploadedAt: item.videoUploadedAt?.toISOString(),
        work: item.work,
      })),
      count: learnedItems.length,
    });
  } catch (error) {
    console.error('❌ [LEARNED] Erro ao buscar items:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
