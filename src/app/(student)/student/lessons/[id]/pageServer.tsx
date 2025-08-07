// app/student/lessons/[id]/pageServer.tsx - Server Component para Detalhes da Aula

import { getStudentLessonForPageServer } from '@/app/requests/student-requests';
import StudentLessonDetailPageClient from './pageClient';

export interface StudentLessonDetail {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: string;
  type: string;
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

  // Anotações (visão do aluno - sem teacherNotes)
  publicNotes?: string;
  studentFeedback?: string;
  lessonSummary?: string;

  // Avaliação e progresso
  studentProgress?: any;
  skillsWorked: string[];
  improvements: string[];
  challenges: string[];

  // Presença
  studentPresent?: boolean;
  punctuality?: string;
  engagement?: number;
  preparation?: number;

  // Dados do professor
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

  // Contexto
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

  // Aulas relacionadas
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

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

interface StudentLessonDetailPageServerProps {
  lessonId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string | null;
  userRole: number;
}

export default async function StudentLessonDetailPageServer({
  lessonId,
  userId,
  userEmail,
  userName,
  userImage,
  userRole,
}: StudentLessonDetailPageServerProps) {
  console.log(
    `📖 [STUDENT-LESSON-DETAIL-PAGE-SERVER] Loading lesson ${lessonId} for user ${userId}`
  );

  try {
    // Buscar detalhes da aula
    console.log('🔍 Carregando detalhes da aula...');
    const lessonData = await getStudentLessonForPageServer(userId, lessonId);

    if (!lessonData) {
      // Aula não encontrada ou sem permissão
      return (
        <StudentLessonDetailPageClient
          initialData={null}
          studentProfile={{
            id: userId,
            name: userName,
            email: userEmail,
            image: userImage,
            role: userRole,
          }}
          errorMessage="Aula não encontrada ou você não tem permissão para visualizá-la."
        />
      );
    }

    const studentLessonDetail: StudentLessonDetail = {
      ...lessonData,
    };

    console.log(
      `✅ [STUDENT-LESSON-DETAIL-PAGE-SERVER] Lesson data loaded successfully`
    );

    return (
      <StudentLessonDetailPageClient
        initialData={studentLessonDetail}
        studentProfile={{
          id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
          role: userRole,
        }}
      />
    );
  } catch (error) {
    console.error(
      '❌ [STUDENT-LESSON-DETAIL-PAGE-SERVER] Critical error:',
      error
    );

    // Fallback com erro
    return (
      <StudentLessonDetailPageClient
        initialData={null}
        studentProfile={{
          id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
          role: userRole,
        }}
        errorMessage="Erro ao carregar detalhes da aula. Tente recarregar a página."
      />
    );
  }
}
