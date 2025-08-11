// app/teacher/lessons/[id]/pageServer.tsx - Server Component para Detalhes da Aula

import { notFound } from 'next/navigation';
import { getTeacherLessonDetailsData } from '@/app/requests/teacher-request';
import TeacherLessonDetailsPageClient from './pageClient';

export interface LessonDetailsData {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  type: 'INDIVIDUAL' | 'GROUP' | 'THEORY' | 'PRACTICE' | 'MASTERCLASS';
  location?: string;

  // Recorrência
  isRecurring: boolean;
  recurrenceType?: string;
  parentLessonId?: string;
  recurrenceEnd?: Date;

  // Conteúdo da aula
  objectives: string[];
  workScoreIds: string[];
  topics: string[];
  techniques: string[];
  repertoire: string[];
  homework?: string;
  practiceGoals: string[];
  nextLessonPrep?: string;

  // Anotações
  teacherNotes?: string;
  publicNotes?: string;
  studentFeedback?: string;
  lessonSummary?: string;

  // Avaliação e progresso
  studentProgress?: any;
  skillsWorked: string[];
  improvements: string[];
  challenges: string[];

  // Presença e participação
  studentPresent?: boolean;
  punctuality?: string;
  engagement?: number;
  preparation?: number;

  // Dados do professor e aluno
  teacher: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  student: {
    id: string;
    name: string;
    email: string;
    image?: string;
    level: string;
  };

  // Informações contextuais
  relationship: {
    totalLessons: number;
    completedLessons: number;
    relationshipDuration: string;
  };

  // WorkScores relacionados
  workScores?: Array<{
    id: string;
    title: string;
    composer: string;
    workTitle: string;
    type: string;
    downloadUrl?: string;
  }>;

  // Assignments relacionados
  assignments?: Array<{
    id: string;
    title: string;
    description: string;
    dueDate?: Date;
    status: string;
    isCompleted: boolean;
  }>;

  // Aulas relacionadas (série/recorrência)
  relatedLessons?: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    status: string;
  }>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Permissões
  permissions: {
    canEdit: boolean;
    canCancel: boolean;
    canReschedule: boolean;
    canViewTeacherNotes: boolean;
    canAddFeedback: boolean;
    canMarkAttendance: boolean;
  };
}

export default async function TeacherLessonDetailsPageServer({
  lessonId,
  userId,

  userRole,
}: {
  lessonId: string;
  userId: string;

  userRole: number;
}) {
  console.log(
    `📖 [TEACHER-LESSON-DETAILS-PAGE-SERVER] Loading lesson ${lessonId} for user ${userId}`
  );

  try {
    // Buscar dados detalhados da aula
    const lessonDetailsResponse = await getTeacherLessonDetailsData(
      lessonId,
      userId,
      userRole
    );

    if (!lessonDetailsResponse || !lessonDetailsResponse.success) {
      console.log(
        `❌ [TEACHER-LESSON-DETAILS-PAGE-SERVER] Lesson ${lessonId} not found or access denied`
      );
      return notFound();
    }

    const lessonData = lessonDetailsResponse.lesson;

    console.log(
      `✅ [TEACHER-LESSON-DETAILS-PAGE-SERVER] Lesson data loaded successfully`
    );

    return <TeacherLessonDetailsPageClient lessonData={lessonData} />;
  } catch (error) {
    console.error(
      '❌ [TEACHER-LESSON-DETAILS-PAGE-SERVER] Critical error:',
      error
    );

    // Se for erro relacionado a não encontrar aula, mostrar 404
    if (
      error instanceof Error &&
      (error.message.includes('not found') || error.message.includes('404'))
    ) {
      return notFound();
    }

    // Para outros erros, mostrar página de erro
    return (
      <TeacherLessonDetailsPageClient
        lessonData={null}
        errorMessage="Erro ao carregar dados da aula. Tente recarregar a página."
      />
    );
  }
}
