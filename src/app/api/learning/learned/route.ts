// app/api/learning/learned/route.ts - COM ACTIVITY TRACKING
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
import {
  trackActivity,
  getRequestInfo,
  ActivityActions,
} from '@/app/libs/activityTracker';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 🆕 EXTRAIR INFO DO REQUEST
    const requestInfo = getRequestInfo(request);

    const contentType = request.headers.get('content-type');
    let body: any;
    let videoFile: File | null = null;

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const jsonData = formData.get('data') as string;
      body = JSON.parse(jsonData);
      videoFile = formData.get('videoFile') as File | null;
    } else {
      body = await request.json();
    }

    const {
      workId,
      action,
      mastery = 0,
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

    // Buscar obra para tracking
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        title: true,
        composer: { select: { name: true } },
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

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
      await prisma.wantToLearn.deleteMany({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

      const dataToSave: any = {
        userId: session.user.id,
        workId: workId,
        mastery: mastery,
      };

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

      let videoUploadResult = null;
      let videoData = null;

      if (videoFile) {
        videoUploadResult = await uploadLearnedVideo(
          workId,
          learnedItem.id,
          videoFile
        );

        if (!videoUploadResult.success) {
          await prisma.learned.delete({
            where: { id: learnedItem.id },
          });

          return NextResponse.json(
            { error: `Erro no upload do vídeo: ${videoUploadResult.error}` },
            { status: 400 }
          );
        }

        videoData = createLearnedVideoData(videoUploadResult, isVideoPublic);

        await prisma.learned.update({
          where: { id: learnedItem.id },
          data: videoData,
        });

        // 🆕 TRACKING DE UPLOAD DE VÍDEO
        trackActivity({
          userId: session.user.id,
          type: 'UPLOAD_VIDEO',
          action: ActivityActions.UPLOAD_VIDEO,
          entityType: 'work',
          entityId: workId,
          entityName: work.title,
          metadata: {
            composerName: work.composer.name,
            fileName: videoUploadResult.filename,
            isPublic: isVideoPublic,
            learnedItemId: learnedItem.id,
          },
          ...requestInfo,
        });
      }

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

      // 🆕 TRACKING DE ADD LEARNED
      trackActivity({
        userId: session.user.id,
        type: 'ADD_LEARNED',
        action: ActivityActions.ADD_LEARNED,
        entityType: 'work',
        entityId: workId,
        entityName: work.title,
        metadata: {
          composerName: work.composer.name,
          mastery,
          difficulty,
          hasVideo: !!videoFile,
          hasScore: !!selectedWorkScoreId,
        },
        ...requestInfo,
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
      const existingItem = await prisma.learned.findFirst({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

      if (existingItem) {
        const videoData = extractLearnedVideoData(existingItem);
        if (videoData) {
          await deleteAllLearnedVideos(workId, existingItem.id);

          // 🆕 TRACKING DE DELETE VÍDEO
          trackActivity({
            userId: session.user.id,
            type: 'DELETE_VIDEO',
            action: ActivityActions.DELETE_VIDEO,
            entityType: 'work',
            entityId: workId,
            entityName: work.title,
            metadata: {
              composerName: work.composer.name,
              fileName: videoData.filename,
              learnedItemId: existingItem.id,
            },
            ...requestInfo,
          });
        }
      }

      await prisma.learned.deleteMany({
        where: {
          userId: session.user.id,
          workId: workId,
        },
      });

      // 🆕 TRACKING DE REMOVE LEARNED
      trackActivity({
        userId: session.user.id,
        type: 'REMOVE_LEARNED',
        action: ActivityActions.REMOVE_LEARNED,
        entityType: 'work',
        entityId: workId,
        entityName: work.title,
        metadata: {
          composerName: work.composer.name,
        },
        ...requestInfo,
      });

      revalidateTag(`user-learning-${session.user.id}`);
      revalidateTag(`work-learning-${workId}`);
      revalidateTag('user-learning');
      revalidateTag('learning-stats');
      revalidateTag('student-profile-data');
      revalidateTag(`student-profile-${session.user.id}`);
      revalidateTag('student-dashboard-data');
      revalidateTag(`student-dashboard-${session.user.id}`);

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

    // 🆕 EXTRAIR INFO DO REQUEST
    const requestInfo = getRequestInfo(request);

    const contentType = request.headers.get('content-type');
    let body: any;
    let videoFile: File | null = null;

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const jsonData = formData.get('data') as string;
      body = JSON.parse(jsonData);
      videoFile = formData.get('videoFile') as File | null;
    } else {
      body = await request.json();
    }

    const {
      workId,
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
      isVideoPublic,
      deleteVideo = false,
    } = body;

    if (!workId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Buscar obra para tracking
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        title: true,
        composer: { select: { name: true } },
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

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

    if (deleteVideo) {
      const videoData = extractLearnedVideoData(existingItem);
      if (videoData && videoData.filePath) {
        await deleteLearnedVideo(videoData.filePath);

        // 🆕 TRACKING DE DELETE VÍDEO
        trackActivity({
          userId: session.user.id,
          type: 'DELETE_VIDEO',
          action: ActivityActions.DELETE_VIDEO,
          entityType: 'work',
          entityId: workId,
          entityName: work.title,
          metadata: {
            composerName: work.composer.name,
            fileName: videoData.filename,
          },
          ...requestInfo,
        });
      }

      dataToUpdate.videoUrl = null;
      dataToUpdate.videoFileName = null;
      dataToUpdate.videoFilePath = null;
      dataToUpdate.videoFileSize = null;
      dataToUpdate.isVideoPublic = false;
      dataToUpdate.videoUploadedAt = null;
    }

    if (videoFile) {
      const videoData = extractLearnedVideoData(existingItem);
      if (videoData && videoData.filePath) {
        await deleteLearnedVideo(videoData.filePath);
      }

      const videoUploadResult = await uploadLearnedVideo(
        workId,
        existingItem.id,
        videoFile
      );

      if (!videoUploadResult.success) {
        return NextResponse.json(
          { error: `Erro no upload do vídeo: ${videoUploadResult.error}` },
          { status: 400 }
        );
      }

      const newVideoData = createLearnedVideoData(
        videoUploadResult,
        isVideoPublic ?? false
      );
      Object.assign(dataToUpdate, newVideoData);

      // 🆕 TRACKING DE UPLOAD VÍDEO
      trackActivity({
        userId: session.user.id,
        type: 'UPLOAD_VIDEO',
        action: ActivityActions.UPLOAD_VIDEO,
        entityType: 'work',
        entityId: workId,
        entityName: work.title,
        metadata: {
          composerName: work.composer.name,
          fileName: videoUploadResult.filename,
          fileSize: videoUploadResult.fileSize,
          isPublic: isVideoPublic ?? false,
          action: 'replace',
        },
        ...requestInfo,
      });
    }

    if (isVideoPublic !== undefined && !videoFile && !deleteVideo) {
      dataToUpdate.isVideoPublic = isVideoPublic;
    }

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

    // 🆕 TRACKING DE UPDATE LEARNED
    trackActivity({
      userId: session.user.id,
      type: 'UPDATE_LEARNED',
      action: ActivityActions.UPDATE_LEARNED,
      entityType: 'work',
      entityId: workId,
      entityName: work.title,
      metadata: {
        composerName: work.composer.name,
        fieldsUpdated: Object.keys(dataToUpdate),
        hasNewVideo: !!videoFile,
        videoDeleted: deleteVideo,
      },
      ...requestInfo,
    });

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

// GET permanece igual (sem tracking necessário em leituras)
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
