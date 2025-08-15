// app/utils/schoolActivities.ts - Sistema de registro de atividades escolares

import prisma from '@/app/libs/prismadb';

// Tipos para as atividades
export interface ActivityData {
  userId: string;
  userType: 'teacher' | 'student';
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  title: string;
  description?: string;
  changes?: any;
  metadata?: any;
}

// Função principal para criar atividade
export async function createSchoolActivity(data: ActivityData): Promise<void> {
  try {
    await prisma.schoolActivity.create({
      data: {
        userId: data.userId,
        userType: data.userType,
        action: data.action as any, // Enum será validado pelo Prisma
        entityType: data.entityType,
        entityId: data.entityId,
        entityName: data.entityName,
        title: data.title,
        description: data.description,
        changes: data.changes,
        metadata: data.metadata,
      },
    });

    console.log(
      `✅ [SCHOOL-ACTIVITY] Atividade registrada: ${data.action} - ${data.title}`
    );
  } catch (error) {
    console.error('❌ [SCHOOL-ACTIVITY] Erro ao registrar atividade:', error);
    // Não falhar a operação principal por causa do log
  }
}

// =============================================================================
// ATIVIDADES DO PROFESSOR
// =============================================================================

export class TeacherActivityLogger {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Professor cadastrou novo aluno
  async studentAdded(
    studentId: string,
    studentName: string,
    relationshipData?: any
  ) {
    await createSchoolActivity({
      userId: this.userId,
      userType: 'teacher',
      action: 'STUDENT_ADDED',
      entityType: 'student',
      entityId: studentId,
      entityName: studentName,
      title: `Adicionou novo aluno: ${studentName}`,
      description: `Vinculou ${studentName} como novo aluno`,
      metadata: {
        maxLessonsPerWeek: relationshipData?.maxLessonsPerWeek,
        lessonDuration: relationshipData?.lessonDuration,
        hasStudyPlan: !!relationshipData?.learningPlan,
      },
    });
  }

  // Professor criou nova aula
  async lessonCreated(lessonId: string, lessonTitle: string, lessonData: any) {
    const metadata: any = {
      studentId: lessonData.studentId,
      duration: lessonData.duration,
      scheduledAt: lessonData.scheduledAt,
      isRecurring: lessonData.isRecurring,
    };

    // Adicionar informações de peças musicais se existirem
    if (lessonData.worksIds?.length > 0) {
      metadata.worksCount = lessonData.worksIds.length;
    }
    if (lessonData.workScoreIds?.length > 0) {
      metadata.scoresCount = lessonData.workScoreIds.length;
    }

    await createSchoolActivity({
      userId: this.userId,
      userType: 'teacher',
      action: 'LESSON_CREATED',
      entityType: 'lesson',
      entityId: lessonId,
      entityName: lessonTitle,
      title: `Criou nova aula: ${lessonTitle}`,
      description: lessonData.isRecurring
        ? `Criou série de aulas recorrentes com duração de ${lessonData.duration} minutos`
        : `Agendou aula de ${lessonData.duration} minutos`,
      metadata,
    });
  }

  // Professor editou aula existente
  async lessonUpdated(lessonId: string, lessonTitle: string, changes: any) {
    const changedFields = Object.keys(changes).filter(
      (key) => !['id', 'createdAt', 'updatedAt'].includes(key)
    );

    await createSchoolActivity({
      userId: this.userId,
      userType: 'teacher',
      action: 'LESSON_UPDATED',
      entityType: 'lesson',
      entityId: lessonId,
      entityName: lessonTitle,
      title: `Editou aula: ${lessonTitle}`,
      description: `Alterou ${changedFields.length} campo(s) da aula`,
      changes: this.formatChanges(changes),
      metadata: {
        changedFields,
      },
    });
  }

  // Professor alterou status da aula (cancelou, remarcou, etc.)
  async lessonStatusChanged(
    lessonId: string,
    lessonTitle: string,
    oldStatus: string,
    newStatus: string,
    reason?: string,
    newDate?: Date
  ) {
    let actionTitle = '';
    let description = '';

    switch (newStatus) {
      case 'CANCELLED':
        actionTitle = `Cancelou aula: ${lessonTitle}`;
        description = reason
          ? `Motivo: ${reason}`
          : 'Aula cancelada pelo professor';
        break;
      case 'NO_SHOW':
        actionTitle = `Marcou falta em: ${lessonTitle}`;
        description = 'Aluno não compareceu à aula';
        break;
      case 'RESCHEDULED':
        actionTitle = `Reagendou aula: ${lessonTitle}`;
        description = newDate
          ? `Nova data: ${newDate.toLocaleDateString('pt-BR')}`
          : 'Aula reagendada pelo professor';
        break;
      default:
        actionTitle = `Alterou status da aula: ${lessonTitle}`;
        description = `Status alterado de ${oldStatus} para ${newStatus}`;
    }

    await createSchoolActivity({
      userId: this.userId,
      userType: 'teacher',
      action: 'LESSON_STATUS_CHANGED',
      entityType: 'lesson',
      entityId: lessonId,
      entityName: lessonTitle,
      title: actionTitle,
      description,
      changes: {
        status: { from: oldStatus, to: newStatus },
        reason,
        newDate,
      },
    });
  }

  // Professor criou nova tarefa
  async assignmentCreated(
    assignmentId: string,
    assignmentTitle: string,
    assignmentData: any
  ) {
    const metadata: any = {
      studentId: assignmentData.studentId,
      type: assignmentData.type,
      priority: assignmentData.priority,
      dueDate: assignmentData.dueDate,
    };

    if (assignmentData.workScoreIds?.length > 0) {
      metadata.scoresCount = assignmentData.workScoreIds.length;
    }

    await createSchoolActivity({
      userId: this.userId,
      userType: 'teacher',
      action: 'ASSIGNMENT_CREATED',
      entityType: 'assignment',
      entityId: assignmentId,
      entityName: assignmentTitle,
      title: `Criou nova tarefa: ${assignmentTitle}`,
      description: `Tarefa do tipo ${assignmentData.type} com prioridade ${assignmentData.priority}`,
      metadata,
    });
  }

  // Professor editou tarefa
  async assignmentUpdated(
    assignmentId: string,
    assignmentTitle: string,
    changes: any
  ) {
    const changedFields = Object.keys(changes).filter(
      (key) => !['id', 'createdAt', 'updatedAt'].includes(key)
    );

    await createSchoolActivity({
      userId: this.userId,
      userType: 'teacher',
      action: 'ASSIGNMENT_UPDATED',
      entityType: 'assignment',
      entityId: assignmentId,
      entityName: assignmentTitle,
      title: `Editou tarefa: ${assignmentTitle}`,
      description: `Alterou ${changedFields.length} campo(s) da tarefa`,
      changes: this.formatChanges(changes),
      metadata: {
        changedFields,
      },
    });
  }

  // Professor deu feedback na tarefa
  async assignmentFeedbackGiven(
    assignmentId: string,
    assignmentTitle: string,
    feedback: string,
    rating?: number
  ) {
    await createSchoolActivity({
      userId: this.userId,
      userType: 'teacher',
      action: 'ASSIGNMENT_FEEDBACK_GIVEN',
      entityType: 'assignment',
      entityId: assignmentId,
      entityName: assignmentTitle,
      title: `Deu feedback na tarefa: ${assignmentTitle}`,
      description: rating
        ? `Avaliou com ${rating} estrelas e adicionou comentários`
        : 'Adicionou feedback para o aluno',
      metadata: {
        hasRating: !!rating,
        rating,
        feedbackLength: feedback.length,
      },
    });
  }

  // Professor adicionou anotações na aula
  async lessonNotesAdded(
    lessonId: string,
    lessonTitle: string,
    notesType: 'teacher' | 'public' | 'summary'
  ) {
    const typeLabels = {
      teacher: 'Anotações privadas',
      public: 'Anotações públicas',
      summary: 'Resumo da aula',
    };

    await createSchoolActivity({
      userId: this.userId,
      userType: 'teacher',
      action: 'LESSON_NOTES_ADDED',
      entityType: 'lesson',
      entityId: lessonId,
      entityName: lessonTitle,
      title: `Adicionou ${typeLabels[notesType].toLowerCase()}: ${lessonTitle}`,
      description: `${typeLabels[notesType]} foram adicionadas à aula`,
      metadata: {
        notesType,
      },
    });
  }

  // Professor alterou perfil
  async teacherProfileUpdated(changes: any) {
    const changedFields = Object.keys(changes).filter(
      (key) => !['id', 'createdAt', 'updatedAt'].includes(key)
    );

    await createSchoolActivity({
      userId: this.userId,
      userType: 'teacher',
      action: 'TEACHER_PROFILE_UPDATED',
      entityType: 'profile',
      title: 'Atualizou perfil de professor',
      description: `Alterou ${changedFields.length} campo(s) do perfil`,
      changes: this.formatChanges(changes),
      metadata: {
        changedFields,
      },
    });
  }

  // Professor alterou dados do usuário
  async userProfileUpdated(changes: any) {
    const changedFields = Object.keys(changes).filter(
      (key) => !['id', 'createdAt', 'updatedAt'].includes(key)
    );

    await createSchoolActivity({
      userId: this.userId,
      userType: 'teacher',
      action: 'USER_PROFILE_UPDATED',
      entityType: 'user',
      title: 'Atualizou dados pessoais',
      description: `Alterou ${changedFields.length} campo(s) dos dados pessoais`,
      changes: this.formatChanges(changes),
      metadata: {
        changedFields,
      },
    });
  }

  // Função auxiliar para formatar mudanças
  private formatChanges(changes: any) {
    const formatted: any = {};

    Object.entries(changes).forEach(([key, value]) => {
      if (
        typeof value === 'object' &&
        value !== null &&
        'from' in value &&
        'to' in value
      ) {
        formatted[key] = value;
      } else {
        formatted[key] = { to: value };
      }
    });

    return formatted;
  }
}

// =============================================================================
// ATIVIDADES DO ALUNO
// =============================================================================

export class StudentActivityLogger {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Aluno enviou submissão (vídeo/arquivo)
  async assignmentSubmissionSent(
    assignmentId: string,
    assignmentTitle: string,
    submissionType: 'video' | 'file' | 'text'
  ) {
    const typeLabels = {
      video: 'vídeo',
      file: 'arquivo',
      text: 'texto',
    };

    await createSchoolActivity({
      userId: this.userId,
      userType: 'student',
      action: 'ASSIGNMENT_SUBMISSION',
      entityType: 'assignment',
      entityId: assignmentId,
      entityName: assignmentTitle,
      title: `Enviou ${typeLabels[submissionType]} para: ${assignmentTitle}`,
      description: `Submissão do tipo ${typeLabels[submissionType]} enviada para avaliação`,
      metadata: {
        submissionType,
      },
    });
  }

  // Aluno completou tarefa
  async assignmentCompleted(
    assignmentId: string,
    assignmentTitle: string,
    completionData?: any
  ) {
    await createSchoolActivity({
      userId: this.userId,
      userType: 'student',
      action: 'ASSIGNMENT_COMPLETED',
      entityType: 'assignment',
      entityId: assignmentId,
      entityName: assignmentTitle,
      title: `Completou tarefa: ${assignmentTitle}`,
      description: 'Tarefa marcada como concluída pelo aluno',
      metadata: {
        actualTime: completionData?.actualTime,
        progress: completionData?.progress,
      },
    });
  }

  // Aluno deu feedback da aula
  async lessonFeedbackGiven(
    lessonId: string,
    lessonTitle: string,
    feedback: string
  ) {
    await createSchoolActivity({
      userId: this.userId,
      userType: 'student',
      action: 'LESSON_FEEDBACK_GIVEN',
      entityType: 'lesson',
      entityId: lessonId,
      entityName: lessonTitle,
      title: `Deu feedback da aula: ${lessonTitle}`,
      description: 'Compartilhou opinião sobre a aula com o professor',
      metadata: {
        feedbackLength: feedback.length,
      },
    });
  }

  // Aluno solicitou reagendamento
  async lessonRescheduleRequested(
    lessonId: string,
    lessonTitle: string,
    message?: string
  ) {
    await createSchoolActivity({
      userId: this.userId,
      userType: 'student',
      action: 'LESSON_RESCHEDULE_REQUESTED',
      entityType: 'lesson',
      entityId: lessonId,
      entityName: lessonTitle,
      title: `Solicitou reagendamento: ${lessonTitle}`,
      description: message
        ? 'Enviou solicitação de reagendamento com mensagem'
        : 'Solicitou reagendamento da aula',
      metadata: {
        hasMessage: !!message,
        messageLength: message?.length,
      },
    });
  }

  // Aluno informou ausência
  async lessonAbsenceInformed(
    lessonId: string,
    lessonTitle: string,
    message?: string
  ) {
    await createSchoolActivity({
      userId: this.userId,
      userType: 'student',
      action: 'LESSON_ABSENCE_INFORMED',
      entityType: 'lesson',
      entityId: lessonId,
      entityName: lessonTitle,
      title: `Informou ausência: ${lessonTitle}`,
      description: message
        ? 'Comunicou que não poderá comparecer com justificativa'
        : 'Informou que não poderá comparecer à aula',
      metadata: {
        hasMessage: !!message,
        messageLength: message?.length,
      },
    });
  }

  // Aluno alterou perfil
  async studentProfileUpdated(changes: any) {
    const changedFields = Object.keys(changes).filter(
      (key) => !['id', 'createdAt', 'updatedAt', 'lastActiveAt'].includes(key)
    );

    await createSchoolActivity({
      userId: this.userId,
      userType: 'student',
      action: 'STUDENT_PROFILE_UPDATED',
      entityType: 'profile',
      title: 'Atualizou perfil de aluno',
      description: `Alterou ${changedFields.length} campo(s) do perfil`,
      changes: this.formatChanges(changes),
      metadata: {
        changedFields,
      },
    });
  }

  // Função auxiliar para formatar mudanças
  private formatChanges(changes: any) {
    const formatted: any = {};

    Object.entries(changes).forEach(([key, value]) => {
      if (
        typeof value === 'object' &&
        value !== null &&
        'from' in value &&
        'to' in value
      ) {
        formatted[key] = value;
      } else {
        formatted[key] = { to: value };
      }
    });

    return formatted;
  }
}

// =============================================================================
// FUNÇÕES DE CONVENIÊNCIA
// =============================================================================

// Criar logger para professor
export function createTeacherActivityLogger(
  userId: string
): TeacherActivityLogger {
  return new TeacherActivityLogger(userId);
}

// Criar logger para aluno
export function createStudentActivityLogger(
  userId: string
): StudentActivityLogger {
  return new StudentActivityLogger(userId);
}

// Buscar atividades recentes (últimos 7 dias)
export async function getRecentActivities(
  userId: string,
  userType: 'teacher' | 'student',
  limit: number = 5
) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return prisma.schoolActivity.findMany({
    where: {
      userId,
      userType,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

// Limpar atividades antigas (para ser chamado periodicamente)
export async function cleanupOldActivities(daysToKeep: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.schoolActivity.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  console.log(
    `🧹 [SCHOOL-ACTIVITY] Limpeza concluída: ${result.count} atividades antigas removidas`
  );
  return result.count;
}
