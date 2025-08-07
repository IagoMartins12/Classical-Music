// app/teacher/lessons/pageServer.tsx - Server Component para Aulas

import {
  getTeacherStudentsData,
  getTeacherLessonsData,
} from '@/app/requests/teacher-request';
import TeacherLessonsPageClient from './pageClient';

export interface LessonData {
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

  // Conteúdo
  objectives: string[];
  workScoreIds: string[];
  topics: string[];
  techniques: string[];
  repertoire: string[];
  homework?: string;
  practiceGoals: string[];

  // Notas
  teacherNotes?: string;
  publicNotes?: string;
  studentFeedback?: string;
  lessonSummary?: string;

  // Avaliação
  studentProgress?: any;
  skillsWorked: string[];
  improvements: string[];
  challenges: string[];

  // Presença
  studentPresent?: boolean;
  punctuality?: string;
  engagement?: number;
  preparation?: number;

  // Dados do aluno
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
}

export interface LessonsStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  averageDuration: number;
  completionRate: number;
}

export interface TeacherLessonsData {
  lessons: LessonData[];
  stats: LessonsStats;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  students: Array<{
    id: string;
    name: string;
    image?: string | null;
    level: string;
    isActive: boolean;
  }>;
}

export default async function TeacherLessonsPageServer({
  userId,
  userEmail,
  userName,
  userImage,
  userRole,
}: {
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string | null;
  userRole: number;
}) {
  console.log(`📚 [TEACHER-LESSONS-PAGE-SERVER] Loading for user ${userId}`);

  try {
    // Buscar dados em paralelo
    const [lessonsData, studentsData] = await Promise.all([
      getTeacherLessonsData(
        userId,
        undefined, // studentId
        undefined, // status
        undefined, // dateFrom
        undefined, // dateTo
        20, // limit
        0, // offset
        true // includeStats
      ),
      getTeacherStudentsData(userId, 'active', 100, 0),
    ]);

    if (!lessonsData || !lessonsData.success) {
      throw new Error('Falha ao carregar dados das aulas');
    }

    // Preparar lista de alunos
    const students =
      studentsData?.students?.map((studentRel) => ({
        id: studentRel.student.id,
        name: studentRel.student.name,
        image: studentRel.student.image,
        level: studentRel.student.level,
        isActive: studentRel.relationship.isActive,
      })) || [];

    const teacherLessonsData: TeacherLessonsData = {
      lessons: lessonsData.lessons,
      stats: lessonsData.stats,
      pagination: lessonsData.pagination,
      students,
    };

    console.log(
      `✅ [TEACHER-LESSONS-PAGE-SERVER] Data loaded successfully - ${lessonsData.lessons.length} lessons, ${students.length} students`
    );

    return (
      <TeacherLessonsPageClient
        initialData={teacherLessonsData}
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
    console.error('❌ [TEACHER-LESSONS-PAGE-SERVER] Critical error:', error);

    // Fallback com dados vazios
    return (
      <TeacherLessonsPageClient
        initialData={{
          lessons: [],
          stats: {
            total: 0,
            scheduled: 0,
            completed: 0,
            cancelled: 0,
            noShow: 0,
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
            averageDuration: 60,
            completionRate: 0,
          },
          pagination: {
            offset: 0,
            limit: 20,
            total: 0,
            hasMore: false,
          },
          students: [],
        }}
        teacherProfile={{
          id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
          role: userRole,
        }}
        errorMessage="Erro ao carregar dados das aulas. Tente recarregar a página."
      />
    );
  }
}
