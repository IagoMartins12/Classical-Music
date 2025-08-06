// app/teacher/lessons/[id]/edit/pageServer.tsx - Server Component para Editar Aula

import {
  getTeacherStudentsData,
  getTeacherLessonDetailsData,
} from '@/app/requests/teacher-request';
import EditLessonPageClient from './pageClient';

export interface EditLessonData {
  lesson: {
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

    // Conteúdo
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

    // Pessoas
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

    // Timestamps
    createdAt: Date;
    updatedAt: Date;

    // Permissões
    permissions: {
      canEdit: boolean;
      canCancel: boolean;
      canReschedule: boolean;
    };
  };
  students: Array<{
    id: string;
    name: string;
    image?: string | null;
    level: string;
    isActive: boolean;
    relationship: {
      maxLessonsPerWeek: number;
      lessonDuration: number;
      preferredDays?: string[];
      preferredTimes?: string[];
    };
  }>;
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

export default async function EditLessonPageServer({
  lessonId,
  userId,
  userEmail,
  userName,
  userImage,
  userRole,
}: {
  lessonId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string | null;
  userRole: number;
}) {
  console.log(
    `📅✏️ [EDIT-LESSON-PAGE-SERVER] Loading lesson ${lessonId} for user ${userId}`
  );

  try {
    // Buscar dados da aula e lista de alunos em paralelo
    const [lessonData, studentsData] = await Promise.all([
      getTeacherLessonDetailsData(lessonId, userId, userRole),
      getTeacherStudentsData(userId, 'active', 100, 0),
    ]);

    if (!lessonData || !lessonData.success) {
      throw new Error('Aula não encontrada ou sem permissão de acesso');
    }

    if (!lessonData.lesson.permissions.canEdit) {
      throw new Error('Sem permissão para editar esta aula');
    }

    if (!studentsData || !studentsData.success) {
      throw new Error('Falha ao carregar dados dos alunos');
    }

    // Preparar lista de alunos
    const students = studentsData.students.map((studentRel) => ({
      id: studentRel.student.id,
      name: studentRel.student.name,
      image: studentRel.student.image,
      level: studentRel.student.level,
      isActive: studentRel.relationship.isActive,
      relationship: {
        maxLessonsPerWeek: studentRel.relationship.maxLessonsPerWeek,
        lessonDuration: studentRel.relationship.lessonDuration,
        preferredDays: studentRel.relationship.preferredDays,
        preferredTimes: studentRel.relationship.preferredTimes,
      },
    }));

    const editLessonData: EditLessonData = {
      lesson: lessonData.lesson,
      students,
    };

    console.log(
      `✅ [EDIT-LESSON-PAGE-SERVER] Data loaded successfully - Lesson: ${lessonData.lesson.title}`
    );

    return (
      <EditLessonPageClient
        initialData={editLessonData}
        teacherProfile={{
          id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
          role: userRole,
        }}
      />
    );
  } catch (error) {
    console.error('❌ [EDIT-LESSON-PAGE-SERVER] Critical error:', error);

    // Fallback com erro
    return (
      <EditLessonPageClient
        initialData={null}
        teacherProfile={{
          id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
          role: userRole,
        }}
        errorMessage={
          error instanceof Error
            ? error.message
            : 'Erro ao carregar dados da aula'
        }
      />
    );
  }
}
