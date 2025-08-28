// app/api/assignments/route.ts - ATUALIZADO PARA CLOUDINARY
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { NotificationFactory } from '@/app/utils/notifications/createNotification';
import {
  createTeacherActivityLogger,
  createStudentActivityLogger,
} from '@/app/utils/schoolActivities';
// ✅ NOVA IMPORTAÇÃO: Funções do Cloudinary
import {
  uploadAssignmentVideo as uploadAssignmentVideoCloudinary,
  deleteFromCloudinary,
} from '@/app/libs/cloudinary';

// ✅ INTERFACES ATUALIZADAS
interface VideoUploadResult {
  success: boolean;
  cloudinaryUrl?: string;
  publicId?: string;
  filename?: string;
  originalName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  duration?: number;
  format?: string;
  error?: string;
}

interface VideoSubmission {
  filename: string;
  originalName: string;
  filePath: string; // ✅ Manter nome original - vai conter URL do Cloudinary
  fileSize: number;
  uploadedAt: string;
  mimeType: string;
  // ✅ Campos extras do Cloudinary
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
  thumbnailUrl?: string;
  duration?: number;
  format?: string;
}

// ✅ FUNÇÕES ATUALIZADAS PARA CLOUDINARY
async function uploadAssignmentVideo(
  assignmentId: string,
  file: File
): Promise<VideoUploadResult> {
  try {
    console.log(`🎥 [CLOUDINARY] Upload assignment video para ${assignmentId}`);

    // Usar função do Cloudinary
    const uploadResult = await uploadAssignmentVideoCloudinary(
      file,
      assignmentId
    );

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error,
      };
    }

    return {
      success: true,
      cloudinaryUrl: uploadResult.secureUrl!,
      publicId: uploadResult.publicId!,
      filename: file.name,
      originalName: file.name,
      fileSize: uploadResult.fileSize!,
      mimeType: file.type,
      duration: uploadResult.duration,
      format: uploadResult.format,
    };
  } catch (error) {
    console.error('❌ [CLOUDINARY] Erro no upload assignment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno no upload',
    };
  }
}

async function deleteAssignmentVideo(publicId: string): Promise<boolean> {
  try {
    if (!publicId) return true;

    const success = await deleteFromCloudinary(publicId, 'video');

    if (success) {
      console.log(`🗑️ [CLOUDINARY] Vídeo assignment deletado: ${publicId}`);
    } else {
      console.warn(`⚠️ [CLOUDINARY] Falha ao deletar: ${publicId}`);
    }

    return success;
  } catch (error) {
    console.error('❌ [CLOUDINARY] Erro ao deletar vídeo assignment:', error);
    return false;
  }
}

function extractVideoSubmission(submissions: any): VideoSubmission | null {
  try {
    if (!submissions || typeof submissions !== 'object') {
      return null;
    }

    const videoSubmission = submissions.videoSubmission;

    if (!videoSubmission) {
      return null;
    }

    return {
      filename: videoSubmission.filename || 'video.mp4',
      originalName: videoSubmission.originalName || 'video.mp4',
      filePath: videoSubmission.filePath || '', // URL do Cloudinary
      fileSize: videoSubmission.fileSize || 0,
      uploadedAt: videoSubmission.uploadedAt || new Date().toISOString(),
      mimeType: videoSubmission.mimeType || 'video/mp4',
      // ✅ Campos do Cloudinary
      cloudinaryUrl: videoSubmission.cloudinaryUrl,
      cloudinaryPublicId: videoSubmission.cloudinaryPublicId,
      thumbnailUrl: videoSubmission.thumbnailUrl,
      duration: videoSubmission.duration,
      format: videoSubmission.format,
    };
  } catch (error) {
    console.error('❌ [CLOUDINARY] Erro ao extrair submission:', error);
    return null;
  }
}

function createVideoSubmission(
  uploadResult: VideoUploadResult
): VideoSubmission {
  return {
    filename: uploadResult.filename!,
    originalName: uploadResult.originalName!,
    filePath: uploadResult.cloudinaryUrl!, // ✅ URL do Cloudinary no campo original
    fileSize: uploadResult.fileSize!,
    uploadedAt: new Date().toISOString(),
    mimeType: uploadResult.mimeType!,
    // ✅ Campos extras do Cloudinary
    cloudinaryUrl: uploadResult.cloudinaryUrl,
    cloudinaryPublicId: uploadResult.publicId,
    thumbnailUrl: uploadResult.thumbnailUrl,
    duration: uploadResult.duration,
    format: uploadResult.format,
  };
}

function updateSubmissionsWithVideo(
  currentSubmissions: any,
  videoSubmission: VideoSubmission
): any {
  const submissions = currentSubmissions || {};

  return {
    ...submissions,
    videoSubmission,
  };
}

// Função auxiliar para revalidar cache do professor e aluno (MANTIDA)
async function revalidateTeacherAndStudentData(
  teacherUserId: string,
  studentUserId?: string
) {
  console.log(`🔄 [CACHE] Revalidating teacher and student data`);

  // Tags do professor
  revalidateTag('teacher-dashboard');
  revalidateTag('teacher-dashboard-data');
  revalidateTag('teacher-students');
  revalidateTag('teacher-students-data');
  revalidateTag('teacher-assignments');
  revalidateTag('teacher-assignments-data');
  revalidateTag('teacher-assignment-details');
  revalidateTag('teacher-assignment-details-data');
  revalidateTag('teacher-assignment-edit');
  revalidateTag('teacher-assignment-edit-data');
  revalidateTag('teacher-student-detail-data');
  revalidateTag('teacher-lessons-data');
  revalidateTag('teacher-lesson-details-data');

  // Tag específica do professor
  revalidateTag(`teacher-${teacherUserId}`);

  // Se tiver studentUserId, revalidar tags do aluno também
  if (studentUserId) {
    revalidateTag('student-dashboard');
    revalidateTag('student-assignments');
    revalidateTag('student-assignment-details');
    revalidateTag('student-assignment-details-data');
    revalidateTag('student-lessons');
    revalidateTag(`student-${studentUserId}`);
  }

  console.log(
    `✅ [CACHE] Cache revalidated for teacher ${teacherUserId}${
      studentUserId ? ` and student ${studentUserId}` : ''
    }`
  );
}

// GET - Listar assignments (SEM MUDANÇAS)
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
    const studentUserId = searchParams.get('studentUserId');
    const teacherUserId = searchParams.get('teacherUserId');
    const status = searchParams.get('status');
    const lessonId = searchParams.get('lessonId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeLessonData = searchParams.get('includeLesson') === 'true';

    console.log(
      `📋 [ASSIGNMENTS] Listando assignments - User: ${session.user.id}, Role: ${session.user.role}`
    );

    // Buscar perfis do usuário
    let userTeacherProfile = null;
    let userStudentProfile = null;

    if (session.user.role === 1) {
      userTeacherProfile = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (!userTeacherProfile) {
        return NextResponse.json(
          { error: 'Perfil de professor não encontrado' },
          { status: 404 }
        );
      }
    } else {
      userStudentProfile = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (!userStudentProfile) {
        return NextResponse.json(
          { error: 'Perfil de aluno não encontrado' },
          { status: 404 }
        );
      }
    }

    // Montar where clause
    const whereClause: any = {};

    if (session.user.role === 1) {
      // Professor: buscar assignments de suas aulas
      whereClause.lesson = {
        teacherId: userTeacherProfile!.id,
      };

      // Se especificou aluno, filtrar
      if (studentUserId) {
        const studentProfile = await prisma.student.findUnique({
          where: { userId: studentUserId },
          select: { id: true },
        });
        if (studentProfile) {
          whereClause.studentId = studentProfile.id;
        }
      }
    } else {
      // Aluno: buscar seus assignments
      whereClause.studentId = userStudentProfile!.id;

      // Se especificou professor, filtrar
      if (teacherUserId) {
        const teacherProfile = await prisma.teacher.findUnique({
          where: { userId: teacherUserId },
          select: { id: true },
        });
        if (teacherProfile) {
          whereClause.lesson = {
            teacherId: teacherProfile.id,
          };
        }
      }
    }

    // Filtros adicionais
    if (status) {
      if (status === 'OVERDUE') {
        // Assignments atrasados: status PENDING ou IN_PROGRESS com dueDate no passado
        whereClause.AND = [
          {
            OR: [{ status: 'PENDING' }, { status: 'IN_PROGRESS' }],
          },
          {
            dueDate: {
              lt: new Date(),
            },
          },
        ];
      } else {
        whereClause.status = status;
      }
    }

    if (lessonId) {
      whereClause.lessonId = lessonId;
    }

    // Buscar assignments
    const [assignments, totalCount] = await Promise.all([
      prisma.assignment.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  image: true,
                },
              },
            },
          },
          lesson: includeLessonData
            ? {
                include: {
                  teacher: {
                    include: {
                      user: {
                        select: {
                          firstName: true,
                          lastName: true,
                          image: true,
                        },
                      },
                    },
                  },
                },
              }
            : {
                select: {
                  id: true,
                  title: true,
                  scheduledAt: true,
                  teacher: {
                    include: {
                      user: {
                        select: {
                          firstName: true,
                          lastName: true,
                          image: true,
                        },
                      },
                    },
                  },
                },
              },
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.assignment.count({ where: whereClause }),
    ]);

    // Formatar assignments
    const assignmentsFormatted = assignments.map((assignment) => {
      const now = new Date();
      const isOverdue =
        assignment.dueDate &&
        assignment.dueDate < now &&
        !assignment.isCompleted;

      const daysUntilDue = assignment.dueDate
        ? Math.ceil(
            (assignment.dueDate.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null;

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        priority: assignment.priority,

        // Recursos
        workScoreIds: assignment.workScoreIds,
        worksIds: assignment.worksIds,
        exercises: assignment.exercises,

        // Metas
        practiceGoals: assignment.practiceGoals,
        tempoTargets: assignment.tempoTargets,
        technicalGoals: assignment.technicalGoals,
        musicalGoals: assignment.musicalGoals,

        // Status e prazos
        status: isOverdue ? 'OVERDUE' : assignment.status,
        dueDate: assignment.dueDate,
        estimatedTime: assignment.estimatedTime,
        actualTime: assignment.actualTime,
        isOverdue,
        daysUntilDue,

        // Progresso
        isCompleted: assignment.isCompleted,
        completedAt: assignment.completedAt,
        progress: assignment.progress,

        // Feedback
        teacherFeedback: assignment.teacherFeedback,
        teacherRating: assignment.teacherRating,
        studentNotes: assignment.studentNotes,
        studentRating: assignment.studentRating,

        // Submissões
        submissions: assignment.submissions,
        submissionDate: assignment.submissionDate,

        // Relacionamentos
        student: {
          id: assignment.student.user.id,
          name: `${assignment.student.user.firstName} ${assignment.student.user.lastName}`.trim(),
          image: assignment.student.user.image,
        },
        lesson: {
          id: assignment.lesson.id,
          title: assignment.lesson.title,
          scheduledAt: assignment.lesson.scheduledAt,
          teacher: {
            name: `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim(),
            image: assignment.lesson.teacher.user.image,
          },
        },

        // Timestamps
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      };
    });

    // Calcular estatísticas
    const stats = {
      total: totalCount,
      pending: assignments.filter((a) => a.status === 'PENDING').length,
      inProgress: assignments.filter((a) => a.status === 'IN_PROGRESS').length,
      completed: assignments.filter((a) => a.isCompleted).length,
      overdue: assignmentsFormatted.filter((a) => a.isOverdue).length,
    };

    console.log(
      `✅ [ASSIGNMENTS] Retornando ${assignmentsFormatted.length} assignments`
    );

    return NextResponse.json({
      success: true,
      assignments: assignmentsFormatted,
      stats,
      pagination: {
        offset,
        limit,
        total: totalCount,
        hasMore: offset + assignmentsFormatted.length < totalCount,
      },
    });
  } catch (error) {
    console.error('❌ [ASSIGNMENTS] Erro ao listar assignments:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo assignment (SEM MUDANÇAS)
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
    const {
      lessonId,
      studentUserId,
      title,
      description,
      type = 'practice',
      priority = 'medium',
      dueDate,
      estimatedTime,
      workScoreIds = [],
      worksIds = [],
      exercises = [],
      practiceGoals = [],
      tempoTargets,
      technicalGoals = [],
      musicalGoals = [],
    } = body;

    if (!lessonId || !studentUserId || !title || !description) {
      return NextResponse.json(
        {
          error:
            'lessonId, studentUserId, title e description são obrigatórios',
        },
        { status: 400 }
      );
    }

    console.log(`📋➕ [ASSIGNMENTS] Criando assignment: ${title}`, {
      worksIds: worksIds.length,
      workScoreIds: workScoreIds.length,
    });

    // Verificar se professor existe
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: 'Perfil de professor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se aula existe e professor é dono
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        teacherId: teacherProfile.id,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se aluno existe
    const studentProfile = await prisma.student.findUnique({
      where: { userId: studentUserId },
      select: { id: true },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Aluno não encontrado' },
        { status: 404 }
      );
    }

    // Criar assignment
    const assignment = await prisma.assignment.create({
      data: {
        lessonId,
        studentId: studentProfile.id,
        title,
        description,
        type,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedTime,
        workScoreIds,
        worksIds,
        exercises,
        practiceGoals,
        tempoTargets,
        technicalGoals,
        musicalGoals,
        status: 'PENDING',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        lesson: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Criar notificação: NEW_ASSIGNMENT_CREATED
    const teacherName =
      `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim();

    try {
      await NotificationFactory.newAssignmentCreated(
        studentUserId,
        assignment.id,
        teacherName,
        assignment.title
      );
      console.log(
        `📬 [ASSIGNMENTS] Notificação NEW_ASSIGNMENT_CREATED criada para ${studentUserId}`
      );
    } catch (notificationError) {
      console.error(
        '❌ [ASSIGNMENTS] Erro ao criar notificação:',
        notificationError
      );
      // Não falhar a criação do assignment por causa da notificação
    }

    // Logging de atividade: ASSIGNMENT_CREATED
    try {
      const activityLogger = createTeacherActivityLogger(session.user.id);

      await activityLogger.assignmentCreated(assignment.id, assignment.title, {
        studentId: assignment.studentId,
        lessonId: assignment.lessonId,
        type: assignment.type,
        priority: assignment.priority,
        dueDate: assignment.dueDate,
        workScoreIds: assignment.workScoreIds,
        worksIds: assignment.worksIds,
        duration: assignment.estimatedTime,
        isRecurring: false, // assignments não são recorrentes
      });

      console.log(
        `📝 [ACTIVITY] ASSIGNMENT_CREATED registrado para assignment ${assignment.id}`
      );
    } catch (loggingError) {
      console.error(
        '❌ [ASSIGNMENTS] Erro ao registrar atividade:',
        loggingError
      );
      // Não falhar a criação do assignment por causa do logging
    }

    // Revalidar cache
    await revalidateTeacherAndStudentData(session.user.id, studentUserId);

    console.log(
      `✅ [ASSIGNMENTS] Assignment criado, notificação e atividade registradas: ${assignment.id}`
    );

    return NextResponse.json({
      success: true,
      assignment,
      message: 'Assignment criado com sucesso',
    });
  } catch (error) {
    console.error('❌ [ASSIGNMENTS] Erro ao criar assignment:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ✅ PATCH - Atualizar assignment (ATUALIZADO PARA CLOUDINARY)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== 1 && session.user.role !== 0)
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // ✅ CORREÇÃO: Detectar tipo de requisição
    const contentType = request.headers.get('content-type');
    let body: any;
    let videoFile: File | null = null;

    if (contentType?.includes('multipart/form-data')) {
      // FormData com possível arquivo de vídeo
      const formData = await request.formData();
      const jsonData = formData.get('data') as string;
      body = JSON.parse(jsonData);
      videoFile = formData.get('videoFile') as File | null;

      console.log(
        `📋🎥 [ASSIGNMENTS] FormData recebido - vídeo: ${!!videoFile}`
      );
    } else {
      // JSON tradicional
      body = await request.json();
      console.log(
        `📋 [ASSIGNMENTS] JSON recebido - campos: ${Object.keys(body).join(
          ', '
        )}`
      );
    }

    const { assignmentId, ...updateData } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'assignmentId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `📋✏️ [ASSIGNMENTS] Atualizando assignment ${assignmentId} - Role: ${session.user.role}`,
      {
        updateFields: Object.keys(updateData),
        hasVideo: !!videoFile,
        videoSize: videoFile ? `${Math.round(videoFile.size / 1024)}KB` : 'N/A',
      }
    );

    // Buscar perfis
    let userTeacherProfile = null;
    let userStudentProfile = null;

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

    // Verificar se assignment existe e usuário tem acesso
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        OR: [
          // Professor: deve ser dono da aula
          {
            lesson: {
              teacherId: userTeacherProfile?.id,
            },
          },
          // Aluno: deve ser dono do assignment
          {
            studentId: userStudentProfile?.id,
          },
        ],
      },
      include: {
        lesson: {
          include: {
            teacher: {
              select: {
                userId: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        student: {
          select: {
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment não encontrado' },
        { status: 404 }
      );
    }

    // Detectar mudanças para notificações e logging (antes da atualização)
    const oldData = {
      worksIds: assignment.worksIds,
      workScoreIds: assignment.workScoreIds,
      teacherFeedback: assignment.teacherFeedback,
      isCompleted: assignment.isCompleted,
      submissions: assignment.submissions,
    };

    // Filtrar atualizações baseadas no role
    let filteredUpdateData: any = {};

    if (session.user.role === 1) {
      // Professor pode atualizar quase tudo
      filteredUpdateData = { ...updateData };

      // Se marcar como completo, definir completedAt
      if (updateData.isCompleted && !assignment.isCompleted) {
        filteredUpdateData.completedAt = new Date();
        filteredUpdateData.status = 'COMPLETED';
      }
    } else {
      // Aluno pode atualizar campos específicos
      const allowedFields = [
        'status',
        'progress',
        'actualTime',
        'studentNotes',
        'studentRating',
        'submissions',
        'isCompleted',
        'progressMilestones',
      ];

      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key)) {
          filteredUpdateData[key] = updateData[key];
        }
      });

      // Se progressMilestones foi enviado, integrar com submissions
      if (updateData.progressMilestones) {
        const currentSubmissions = (assignment.submissions as any) || {};
        filteredUpdateData.submissions = {
          ...currentSubmissions,
          progressMilestones: updateData.progressMilestones,
        };
        delete filteredUpdateData.progressMilestones;
      }

      // Se aluno marcar como completo
      if (updateData.isCompleted && !assignment.isCompleted) {
        filteredUpdateData.completedAt = new Date();
        filteredUpdateData.status = 'COMPLETED';
        filteredUpdateData.submissionDate = new Date();
      }
    }

    // ✅ PROCESSAR UPLOAD DE VÍDEO PARA CLOUDINARY (apenas para alunos)
    let videoUploadResult = null;
    let hasNewVideo = false;

    if (videoFile && session.user.role === 0) {
      console.log(
        `🎥 [CLOUDINARY] Processando upload de vídeo para assignment ${assignmentId}`
      );

      // 1. Upload do novo vídeo para Cloudinary
      videoUploadResult = await uploadAssignmentVideo(assignmentId, videoFile);

      if (!videoUploadResult.success) {
        return NextResponse.json(
          { error: `Erro no upload: ${videoUploadResult.error}` },
          { status: 400 }
        );
      }

      // 2. Deletar vídeo anterior se existir
      const currentVideoSubmission = extractVideoSubmission(
        assignment.submissions
      );
      if (currentVideoSubmission?.cloudinaryPublicId) {
        await deleteAssignmentVideo(currentVideoSubmission.cloudinaryPublicId);
        console.log(`🗑️ [CLOUDINARY] Vídeo anterior removido do Cloudinary`);
      }

      // 3. Atualizar submissions com novo vídeo
      const newVideoSubmission = createVideoSubmission(videoUploadResult);
      const updatedSubmissions = updateSubmissionsWithVideo(
        filteredUpdateData.submissions || assignment.submissions,
        newVideoSubmission
      );

      filteredUpdateData.submissions = updatedSubmissions;
      hasNewVideo = true;

      console.log(
        `✅ [CLOUDINARY] Vídeo processado com sucesso: ${videoUploadResult.filename}`
      );
    }

    console.log(`📋 [ASSIGNMENTS] Dados filtrados para atualização:`, {
      role: session.user.role,
      fields: Object.keys(filteredUpdateData),
      hasProgressMilestones: !!updateData.progressMilestones,
      hasNewVideo,
      videoFileName: videoUploadResult?.filename || 'N/A',
    });

    // Atualizar assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: filteredUpdateData,
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        lesson: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Criar notificações baseadas nas mudanças
    const teacherUserId = assignment.lesson.teacher.userId;
    const studentUserId = assignment.student.userId;
    const teacherName =
      `${assignment.lesson.teacher.user.firstName} ${assignment.lesson.teacher.user.lastName}`.trim();
    const studentName =
      `${assignment.student.user.firstName} ${assignment.student.user.lastName}`.trim();

    try {
      if (session.user.role === 1) {
        // Notificações para estudante (ações do professor)

        // 1. Professor deu feedback
        if (filteredUpdateData.teacherFeedback && !oldData.teacherFeedback) {
          await NotificationFactory.teacherGaveFeedback(
            studentUserId,
            assignmentId,
            teacherName,
            assignment.title
          );
          console.log(
            `📬 [ASSIGNMENTS] Notificação TEACHER_GAVE_FEEDBACK criada`
          );
        }

        // 2. Professor alterou assignment (verificar campos relevantes)
        const changedFields = [];
        if (
          JSON.stringify(filteredUpdateData.worksIds) !==
          JSON.stringify(oldData.worksIds)
        ) {
          changedFields.push('obras');
        }
        if (
          JSON.stringify(filteredUpdateData.workScoreIds) !==
          JSON.stringify(oldData.workScoreIds)
        ) {
          changedFields.push('partituras');
        }

        if (changedFields.length > 0) {
          await NotificationFactory.assignmentUpdatedByTeacher(
            studentUserId,
            assignmentId,
            teacherName,
            assignment.title,
            changedFields
          );
          console.log(
            `📬 [ASSIGNMENTS] Notificação ASSIGNMENT_UPDATED_BY_TEACHER criada`
          );
        }
      } else {
        // Notificações para professor (ações do aluno)

        // 1. Aluno enviou submissão
        if (
          filteredUpdateData.submissions &&
          JSON.stringify(filteredUpdateData.submissions) !==
            JSON.stringify(oldData.submissions)
        ) {
          await NotificationFactory.studentSubmittedAssignment(
            teacherUserId,
            assignmentId,
            studentName,
            assignment.title
          );
          console.log(
            `📬 [ASSIGNMENTS] Notificação STUDENT_SUBMITTED_ASSIGNMENT criada`
          );
        }

        // 2. Aluno enviou vídeo (nova notificação específica)
        if (hasNewVideo) {
          await NotificationFactory.studentSubmittedVideo(
            teacherUserId,
            assignmentId,
            studentName,
            assignment.title
          );
          console.log(
            `📬 [ASSIGNMENTS] Notificação STUDENT_SUBMITTED_VIDEO criada`
          );
        }

        // 3. Aluno completou assignment
        if (filteredUpdateData.isCompleted && !oldData.isCompleted) {
          await NotificationFactory.studentCompletedAssignment(
            teacherUserId,
            assignmentId,
            studentName,
            assignment.title
          );
          console.log(
            `📬 [ASSIGNMENTS] Notificação STUDENT_COMPLETED_ASSIGNMENT criada`
          );
        }
      }
    } catch (notificationError) {
      console.error(
        '❌ [ASSIGNMENTS] Erro ao criar notificações:',
        notificationError
      );
      // Não falhar a atualização por causa das notificações
    }

    // Logging de atividades
    try {
      if (session.user.role === 1) {
        // Atividades do professor
        const activityLogger = createTeacherActivityLogger(session.user.id);

        // 1. Professor deu feedback
        if (filteredUpdateData.teacherFeedback && !oldData.teacherFeedback) {
          await activityLogger.assignmentFeedbackGiven(
            assignmentId,
            assignment.title,
            filteredUpdateData.teacherFeedback,
            filteredUpdateData.teacherRating
          );
          console.log(`📝 [ACTIVITY] ASSIGNMENT_FEEDBACK_GIVEN registrado`);
        }

        // 2. Professor atualizou assignment (campos gerais)
        const hasGeneralChanges = Object.keys(filteredUpdateData).some(
          (key) => key !== 'teacherFeedback' && key !== 'teacherRating'
        );

        if (hasGeneralChanges) {
          const changes: any = {};
          Object.keys(filteredUpdateData).forEach((key) => {
            if (key !== 'teacherFeedback' && key !== 'teacherRating') {
              const oldValue = (oldData as any)[key];
              const newValue = filteredUpdateData[key];

              if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changes[key] = { from: oldValue, to: newValue };
              }
            }
          });

          if (Object.keys(changes).length > 0) {
            await activityLogger.assignmentUpdated(
              assignmentId,
              assignment.title,
              changes
            );
            console.log(`📝 [ACTIVITY] ASSIGNMENT_UPDATED registrado`);
          }
        }
      } else {
        // Atividades do aluno
        const activityLogger = createStudentActivityLogger(session.user.id);

        // 1. Aluno enviou submissão (vídeo/arquivo)
        if (
          filteredUpdateData.submissions &&
          JSON.stringify(filteredUpdateData.submissions) !==
            JSON.stringify(oldData.submissions)
        ) {
          let submissionType = 'text';
          if (hasNewVideo) {
            submissionType = 'video';
          } else if (filteredUpdateData.submissions?.files?.length > 0) {
            submissionType = 'file';
          }

          await activityLogger.assignmentSubmissionSent(
            assignmentId,
            assignment.title,
            submissionType as 'video' | 'file' | 'text'
          );
          console.log(`📝 [ACTIVITY] ASSIGNMENT_SUBMISSION registrado`);
        }

        // 2. Aluno completou assignment
        if (filteredUpdateData.isCompleted && !oldData.isCompleted) {
          await activityLogger.assignmentCompleted(
            assignmentId,
            assignment.title,
            {
              actualTime: filteredUpdateData.actualTime,
              progress: filteredUpdateData.progress,
            }
          );
          console.log(`📝 [ACTIVITY] ASSIGNMENT_COMPLETED registrado`);
        }
      }
    } catch (loggingError) {
      console.error(
        '❌ [ASSIGNMENTS] Erro ao registrar atividade:',
        loggingError
      );
      // Não falhar a atualização por causa do logging
    }

    // Revalidar cache
    await revalidateTeacherAndStudentData(teacherUserId, studentUserId);

    console.log(
      `✅ [ASSIGNMENTS] Assignment ${assignmentId} atualizado com Cloudinary`,
      {
        videoUploaded: hasNewVideo,
        notificationsSent: true,
        activitiesLogged: true,
        cloudinaryUrl: videoUploadResult?.cloudinaryUrl,
      }
    );

    return NextResponse.json({
      success: true,
      assignment: updatedAssignment,
      videoUpload: videoUploadResult,
      message: hasNewVideo
        ? 'Assignment atualizado com vídeo enviado com sucesso'
        : 'Assignment atualizado com sucesso',
    });
  } catch (error) {
    console.error('❌ [ASSIGNMENTS] Erro ao atualizar assignment:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar assignment (ATUALIZADO PARA CLOUDINARY)
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
    const assignmentId = searchParams.get('id');

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'assignmentId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`📋❌ [ASSIGNMENTS] Deletando assignment ${assignmentId}`);

    // Verificar se professor é dono
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        lesson: {
          teacherId: teacherProfile?.id,
        },
      },
      include: {
        student: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment não encontrado' },
        { status: 404 }
      );
    }

    // ✅ Deletar vídeos do Cloudinary se existirem
    try {
      const videoSubmission = extractVideoSubmission(assignment.submissions);
      if (videoSubmission?.cloudinaryPublicId) {
        const deleted = await deleteAssignmentVideo(
          videoSubmission.cloudinaryPublicId
        );
        if (deleted) {
          console.log(
            `🗑️ [CLOUDINARY] Vídeo do assignment deletado do Cloudinary`
          );
        }
      }
    } catch (deleteError) {
      console.warn(
        '⚠️ [CLOUDINARY] Erro ao deletar vídeo - continuando:',
        deleteError
      );
    }

    // Guardar studentUserId antes de deletar
    const studentUserId = assignment.student.userId;

    // Deletar assignment
    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    // Revalidar cache
    await revalidateTeacherAndStudentData(session.user.id, studentUserId);

    console.log(
      `✅ [ASSIGNMENTS] Assignment ${assignmentId} deletado (incluindo Cloudinary) e cache revalidado`
    );

    return NextResponse.json({
      success: true,
      message: 'Assignment deletado com sucesso',
    });
  } catch (error) {
    console.error('❌ [ASSIGNMENTS] Erro ao deletar assignment:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
