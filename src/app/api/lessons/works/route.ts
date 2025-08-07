// app/api/lessons/works/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

// Função auxiliar para revalidar cache de lesson works
async function revalidateLessonWorksData(
  teacherUserId: string,
  studentUserId?: string
) {
  console.log(`🔄 [CACHE] Revalidating lesson works data`);

  // Tags específicas de lessons e works
  revalidateTag('teacher-lessons-data');
  revalidateTag('teacher-lesson-details-data');
  revalidateTag('teacher-calendar');
  revalidateTag('teacher-calendar-data');

  // Tag específica do professor
  revalidateTag(`teacher-${teacherUserId}`);

  // Se tiver studentUserId, revalidar tags do aluno também
  if (studentUserId) {
    revalidateTag('student-lessons');
    revalidateTag(`student-${studentUserId}`);
  }

  console.log(
    `✅ [CACHE] Lesson works cache revalidated for teacher ${teacherUserId}${
      studentUserId ? ` and student ${studentUserId}` : ''
    }`
  );
}

interface LessonWorkData {
  workId: string;
  workTitle: string;
  composer: string;
  workScoreIds: string[]; // IDs dos WorkScores específicos
  selectedScores: Array<{
    id: string;
    title: string;
    type: string;
    downloadUrl?: string;
    pageCount?: string;
  }>;
  studyFocus: string[]; // Aspectos específicos a estudar
  difficulty: string;
  estimatedStudyTime?: number; // em minutos
  notes?: string;
  status: 'assigned' | 'studying' | 'completed' | 'on_hold';
  progress?: number; // 0-100%
  assignedAt: Date;
  completedAt?: Date;
}

interface StudentWorkProgress {
  workId: string;
  workTitle: string;
  composer: string;
  assignedInLessons: number;
  totalLessons: number;
  averageProgress: number;
  lastStudied: Date;
  currentStatus: 'studying' | 'completed' | 'paused';
  skillsWorked: string[];
  nextGoals: string[];
}

// GET - Buscar obras vinculadas a aulas (sem mudanças)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== 1 && session.user.role !== 0)
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    const studentUserId = searchParams.get('studentUserId'); // Para professor ver progresso do aluno
    const teacherUserId = searchParams.get('teacherUserId'); // Para aluno ver de professor específico
    const includeProgress = searchParams.get('includeProgress') === 'true';
    const status = searchParams.get('status'); // assigned, studying, completed
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log(
      `🎵 [LESSON-WORKS] Buscando obras - Lesson: ${lessonId}, Student: ${studentUserId}`
    );

    // Buscar perfis
    let userTeacherProfile = null;
    let userStudentProfile = null;
    let targetStudentProfile = null;

    if (session.user.role === 1) {
      userTeacherProfile = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
    } else {
      userStudentProfile = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
    }

    // Se específico para uma aula
    if (lessonId) {
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonId,
          OR: [
            { teacherId: userTeacherProfile?.id },
            { studentId: userStudentProfile?.id },
          ],
        },
        include: {
          teacher: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          student: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });

      if (!lesson) {
        return NextResponse.json(
          { error: 'Aula não encontrada' },
          { status: 404 }
        );
      }

      // Buscar obras vinculadas à aula (através dos workScoreIds)
      if (lesson.workScoreIds.length === 0) {
        return NextResponse.json({
          success: true,
          lessonWorks: [],
          lesson: {
            id: lesson.id,
            title: lesson.title,
            scheduledAt: lesson.scheduledAt,
            teacher: `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`,
            student: `${lesson.student.user.firstName} ${lesson.student.user.lastName}`,
          },
        });
      }

      // Buscar WorkScores e suas Works associadas
      const workScores = await prisma.workScore.findMany({
        where: {
          id: { in: lesson.workScoreIds },
        },
        include: {
          work: {
            include: {
              composer: {
                select: { name: true },
              },
            },
          },
        },
      });

      // Agrupar por Work
      const worksMap = new Map<string, any>();

      workScores.forEach((workScore) => {
        const workId = workScore.work.id;

        if (!worksMap.has(workId)) {
          worksMap.set(workId, {
            workId: workId,
            workTitle: workScore.work.title,
            composer: workScore.work.composer.name,
            workScoreIds: [],
            selectedScores: [],
            studyFocus: lesson.topics, // Usar topics da aula
            difficulty: workScore.work.difficultyLevel || 'INTERMEDIATE',
            notes: lesson.publicNotes,
            status: lesson.status === 'COMPLETED' ? 'completed' : 'studying',
            assignedAt: lesson.createdAt,
            completedAt:
              lesson.status === 'COMPLETED' ? lesson.scheduledAt : undefined,
          });
        }

        const work = worksMap.get(workId);
        work.workScoreIds.push(workScore.id);
        work.selectedScores.push({
          id: workScore.id,
          title: workScore.title,
          type: workScore.type,
          downloadUrl: workScore.downloadUrl,
          pageCount: workScore.pageCount,
        });
      });

      const lessonWorks = Array.from(worksMap.values());

      return NextResponse.json({
        success: true,
        lessonWorks,
        lesson: {
          id: lesson.id,
          title: lesson.title,
          scheduledAt: lesson.scheduledAt,
          teacher: `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`,
          student: `${lesson.student.user.firstName} ${lesson.student.user.lastName}`,
        },
      });
    }

    // Se buscando progresso geral de um aluno
    if (includeProgress && studentUserId && session.user.role === 1) {
      const studentProfile = await prisma.student.findUnique({
        where: { userId: studentUserId },
        select: {
          id: true,
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      if (!studentProfile) {
        return NextResponse.json(
          { error: 'Aluno não encontrado' },
          { status: 404 }
        );
      }

      // Buscar todas as aulas do aluno com este professor que têm obras
      const lessonsWithWorks = await prisma.lesson.findMany({
        where: {
          teacherId: userTeacherProfile?.id,
          studentId: studentProfile.id,
          workScoreIds: { isEmpty: false }, // Apenas aulas com obras
        },
        include: {
          _count: {
            select: {
              childLessons: true,
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
      });

      // Coletar todos os workScoreIds únicos
      const allWorkScoreIds = [
        ...new Set(lessonsWithWorks.flatMap((l) => l.workScoreIds)),
      ];

      if (allWorkScoreIds.length === 0) {
        return NextResponse.json({
          success: true,
          studentProgress: [],
          summary: {
            studentName: `${studentProfile.user.firstName} ${studentProfile.user.lastName}`,
            totalWorks: 0,
            totalLessons: lessonsWithWorks.length,
          },
        });
      }

      // Buscar Works associadas
      const workScores = await prisma.workScore.findMany({
        where: { id: { in: allWorkScoreIds } },
        include: {
          work: {
            include: {
              composer: { select: { name: true } },
            },
          },
        },
      });

      // Analisar progresso por obra
      const workProgressMap = new Map<string, StudentWorkProgress>();

      workScores.forEach((workScore) => {
        const workId = workScore.work.id;

        if (!workProgressMap.has(workId)) {
          workProgressMap.set(workId, {
            workId,
            workTitle: workScore.work.title,
            composer: workScore.work.composer.name,
            assignedInLessons: 0,
            totalLessons: 0,
            averageProgress: 0,
            lastStudied: new Date(0),
            currentStatus: 'studying',
            skillsWorked: [],
            nextGoals: [],
          });
        }
      });

      // Contar aparições por obra e coletar dados
      lessonsWithWorks.forEach((lesson) => {
        lesson.workScoreIds.forEach((scoreId) => {
          const workScore = workScores.find((ws) => ws.id === scoreId);
          if (!workScore) return;

          const progress = workProgressMap.get(workScore.work.id);
          if (!progress) return;

          progress.assignedInLessons++;
          progress.totalLessons++;

          if (lesson.scheduledAt > progress.lastStudied) {
            progress.lastStudied = lesson.scheduledAt;
          }

          // Coletar skills e técnicas
          lesson.skillsWorked.forEach((skill) => {
            if (!progress.skillsWorked.includes(skill)) {
              progress.skillsWorked.push(skill);
            }
          });

          // Status baseado na última aula
          if (lesson.status === 'COMPLETED') {
            progress.currentStatus = 'completed';
          }
        });
      });

      const studentProgress = Array.from(workProgressMap.values()).sort(
        (a, b) => b.lastStudied.getTime() - a.lastStudied.getTime()
      );

      return NextResponse.json({
        success: true,
        studentProgress,
        summary: {
          studentName: `${studentProfile.user.firstName} ${studentProfile.user.lastName}`,
          totalWorks: studentProgress.length,
          totalLessons: lessonsWithWorks.length,
          completedWorks: studentProgress.filter(
            (p) => p.currentStatus === 'completed'
          ).length,
          studyingWorks: studentProgress.filter(
            (p) => p.currentStatus === 'studying'
          ).length,
        },
      });
    }

    // Busca geral (todas as obras das aulas do usuário)
    let whereClause: any = {};

    if (session.user.role === 1) {
      whereClause.teacherId = userTeacherProfile?.id;
    } else {
      whereClause.studentId = userStudentProfile?.id;
    }

    whereClause.workScoreIds = { isEmpty: false };

    if (status) {
      if (status === 'completed') {
        whereClause.status = 'COMPLETED';
      } else if (status === 'studying') {
        whereClause.status = { in: ['SCHEDULED', 'IN_PROGRESS'] };
      }
    }

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      orderBy: { scheduledAt: 'desc' },
      take: limit,
    });

    // Coletar todas as obras
    const allWorkScoreIds = [
      ...new Set(lessons.flatMap((l) => l.workScoreIds)),
    ];

    const workScores = await prisma.workScore.findMany({
      where: { id: { in: allWorkScoreIds } },
      include: {
        work: {
          include: {
            composer: { select: { name: true } },
          },
        },
      },
    });

    // Mapear obras únicas
    const uniqueWorks = new Map<string, any>();

    workScores.forEach((workScore) => {
      const workId = workScore.work.id;

      if (!uniqueWorks.has(workId)) {
        uniqueWorks.set(workId, {
          workId,
          workTitle: workScore.work.title,
          composer: workScore.work.composer.name,
          timesStudied: 0,
          lastStudied: null,
          scores: [],
        });
      }

      const work = uniqueWorks.get(workId);
      if (!work.scores.find((s: any) => s.id === workScore.id)) {
        work.scores.push({
          id: workScore.id,
          title: workScore.title,
          type: workScore.type,
        });
      }
    });

    // Contar quantas vezes cada obra foi estudada
    lessons.forEach((lesson) => {
      lesson.workScoreIds.forEach((scoreId) => {
        const workScore = workScores.find((ws) => ws.id === scoreId);
        if (!workScore) return;

        const work = uniqueWorks.get(workScore.work.id);
        if (work) {
          work.timesStudied++;
          if (!work.lastStudied || lesson.scheduledAt > work.lastStudied) {
            work.lastStudied = lesson.scheduledAt;
          }
        }
      });
    });

    const worksArray = Array.from(uniqueWorks.values()).sort(
      (a, b) =>
        (b.lastStudied?.getTime() || 0) - (a.lastStudied?.getTime() || 0)
    );

    console.log(`✅ [LESSON-WORKS] Retornando ${worksArray.length} obras`);

    return NextResponse.json({
      success: true,
      works: worksArray,
      summary: {
        totalWorks: worksArray.length,
        totalLessons: lessons.length,
        recentWorks: worksArray.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('❌ [LESSON-WORKS] Erro ao buscar obras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Vincular obras a uma aula COM REVALIDAÇÃO
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { lessonId, workScoreIds, studyFocus, notes } = body;

    if (
      !lessonId ||
      !workScoreIds ||
      !Array.isArray(workScoreIds) ||
      workScoreIds.length === 0
    ) {
      return NextResponse.json(
        {
          error: 'lessonId e workScoreIds são obrigatórios',
        },
        { status: 400 }
      );
    }

    console.log(
      `🎵➕ [LESSON-WORKS] Vinculando ${workScoreIds.length} obras à aula ${lessonId}`
    );

    // Verificar se professor é dono da aula
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        teacherId: teacherProfile?.id,
      },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se WorkScores existem
    const existingWorkScores = await prisma.workScore.findMany({
      where: {
        id: { in: workScoreIds },
        isActive: true,
      },
      include: {
        work: {
          include: {
            composer: { select: { name: true } },
          },
        },
      },
    });

    if (existingWorkScores.length !== workScoreIds.length) {
      const notFound = workScoreIds.filter(
        (id) => !existingWorkScores.some((ws) => ws.id === id)
      );
      return NextResponse.json(
        {
          error: `WorkScores não encontrados: ${notFound.join(', ')}`,
        },
        { status: 404 }
      );
    }

    // Combinar com WorkScores já existentes na aula (se houver)
    const currentWorkScoreIds = lesson.workScoreIds;
    const newWorkScoreIds = [
      ...new Set([...currentWorkScoreIds, ...workScoreIds]),
    ];

    // Atualizar aula com novas obras
    const updateData: any = {
      workScoreIds: newWorkScoreIds,
    };

    // Adicionar foco de estudo aos topics se fornecido
    if (studyFocus && Array.isArray(studyFocus) && studyFocus.length > 0) {
      const currentTopics = lesson.topics;
      updateData.topics = [...new Set([...currentTopics, ...studyFocus])];
    }

    // Adicionar notas se fornecidas
    if (notes) {
      updateData.publicNotes = lesson.publicNotes
        ? `${lesson.publicNotes}\n\n📚 Obras: ${notes}`
        : `📚 Obras: ${notes}`;
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
    });

    // Adicionar às listas pessoais do aluno se ainda não estiver
    const studentUserId = lesson.student.userId;

    if (studentUserId) {
      // Para cada obra, verificar se está na lista "Quero Aprender"
      for (const workScore of existingWorkScores) {
        const existingWantToLearn = await prisma.wantToLearn.findUnique({
          where: {
            userId_workId: {
              userId: studentUserId,
              workId: workScore.work.id,
            },
          },
        });

        if (!existingWantToLearn) {
          // Adicionar à lista "Quero Aprender" automaticamente
          await prisma.wantToLearn.create({
            data: {
              userId: studentUserId,
              workId: workScore.work.id,
              selectedWorkScoreId: workScore.id,
              notes: `Adicionado automaticamente pela aula: ${lesson.title}`,
              context: 'lesson_assignment',
              priority: 1,
            },
          });
        }
      }
    }

    // 🔥 REVALIDAR CACHE APÓS ADICIONAR OBRAS
    await revalidateLessonWorksData(session.user.id, studentUserId);

    // Preparar resposta com detalhes das obras
    const worksDetails = existingWorkScores.map((ws) => ({
      workId: ws.work.id,
      workTitle: ws.work.title,
      composer: ws.work.composer.name,
      scoreId: ws.id,
      scoreTitle: ws.title,
      scoreType: ws.type,
    }));

    console.log(
      `✅ [LESSON-WORKS] ${workScoreIds.length} obras vinculadas à aula ${lessonId} e cache revalidado`
    );

    return NextResponse.json({
      success: true,
      lesson: updatedLesson,
      addedWorks: worksDetails,
      message: `${workScoreIds.length} obra(s) vinculada(s) à aula com sucesso`,
    });
  } catch (error) {
    console.error('❌ [LESSON-WORKS] Erro ao vincular obras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover obras de uma aula COM REVALIDAÇÃO
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    const workScoreIds = searchParams.get('workScoreIds')?.split(',') || [];

    if (!lessonId || workScoreIds.length === 0) {
      return NextResponse.json(
        {
          error: 'lessonId e workScoreIds são obrigatórios',
        },
        { status: 400 }
      );
    }

    console.log(
      `🎵❌ [LESSON-WORKS] Removendo ${workScoreIds.length} obras da aula ${lessonId}`
    );

    // Verificar se professor é dono da aula
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        teacherId: teacherProfile?.id,
      },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // Remover WorkScores da aula
    const currentWorkScoreIds = lesson.workScoreIds;
    const newWorkScoreIds = currentWorkScoreIds.filter(
      (id) => !workScoreIds.includes(id)
    );

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        workScoreIds: newWorkScoreIds,
      },
    });

    const removedCount = currentWorkScoreIds.length - newWorkScoreIds.length;

    // 🔥 REVALIDAR CACHE APÓS REMOVER OBRAS
    await revalidateLessonWorksData(session.user.id, lesson.student.userId);

    console.log(
      `✅ [LESSON-WORKS] ${removedCount} obras removidas da aula ${lessonId} e cache revalidado`
    );

    return NextResponse.json({
      success: true,
      lesson: updatedLesson,
      removedCount,
      message: `${removedCount} obra(s) removida(s) da aula`,
    });
  } catch (error) {
    console.error('❌ [LESSON-WORKS] Erro ao remover obras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
