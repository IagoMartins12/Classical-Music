// app/teacher/students/pageServer.tsx - Server Component para Gestão de Alunos

import TeacherStudentsPageClient from './pageClient';
import { getTeacherStudentsData } from '@/app/requests/teacher-request';

export interface TeacherStudentsServerData {
  students: Array<{
    relationshipId: string;
    student: {
      id: string;
      name: string;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
      location?: string | null;
      experienceLevel?: string | null;
      level: string;
      mainInstrument?: string | null;
      musicalGoals?: string[];
      practiceTime?: number | null;
    };
    relationship: {
      isActive: boolean;
      startDate: Date;
      endDate?: Date | null;
      pausedAt?: Date | null;
      pauseReason?: string | null;
      maxLessonsPerWeek: number;
      lessonDuration: number;
      preferredDays?: string[];
      preferredTimes?: string[];
      learningPlan?: string | null;
      currentFocus?: string[];
      teacherNotes?: string | null;
    };
    stats: {
      totalLessons: number;
      completedLessons: number;
      scheduledLessons: number;
      cancelledLessons: number;
      completionRate: number;
    };
    nextLesson?: {
      id: string;
      scheduledAt: Date;
      title: string;
      duration: number;
    } | null;
  }>;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  summary: {
    total: number;
    active: number;
    inactive: number;
  };
}

export default async function TeacherStudentsPageServer({
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
  console.log(`📋 [TEACHER-STUDENTS-PAGE-SERVER] Loading for user ${userId}`);

  try {
    // 🚀 Buscar dados iniciais direto do banco
    const studentsData = await getTeacherStudentsData(userId, 'all', 100, 0);

    if (!studentsData) {
      throw new Error('Falha ao carregar dados dos alunos');
    }

    const serverData: TeacherStudentsServerData = {
      students: studentsData.students,
      pagination: studentsData.pagination,
      summary: studentsData.summary,
    };

    console.log(`✅ [TEACHER-STUDENTS-PAGE-SERVER] Data loaded successfully`);

    return (
      <TeacherStudentsPageClient
        initialData={serverData}
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
    console.error('❌ [TEACHER-STUDENTS-PAGE-SERVER] Critical error:', error);

    // Fallback com dados vazios
    return (
      <TeacherStudentsPageClient
        initialData={{
          students: [],
          pagination: { offset: 0, limit: 100, total: 0, hasMore: false },
          summary: { total: 0, active: 0, inactive: 0 },
        }}
        teacherProfile={{
          id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
          role: userRole,
        }}
        errorMessage="Erro ao carregar dados dos alunos. Tente recarregar a página."
      />
    );
  }
}
