// app/student/lessons/pageServer.tsx - Server Component para Aulas do Aluno

import {
  getStudentLessonsForPageServer,
  getStudentProfileForPageServer,
} from '@/app/requests/student-requests';
import StudentLessonsPageClient from './pageClient';

export interface StudentLessonsData {
  lessons: Array<{
    id: string;
    title: string;
    description?: string;
    scheduledAt: Date;
    duration: number;
    status: string;
    type: string;
    location?: string;
    objectives: string[];
    homework?: string;
    publicNotes?: string;
    studentFeedback?: string;
    lessonSummary?: string;
    skillsWorked: string[];
    improvements: string[];
    challenges: string[];
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
    };
    createdAt: Date;
    updatedAt: Date;
  }>;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  teachers: Array<{
    teacherId: string;
    teacherName: string;
    teacherImage?: string;
    isActive: boolean;
    totalLessons: number;
  }>;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

interface StudentLessonsPageServerProps {
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string | null;
  userRole: number;
}

export default async function StudentLessonsPageServer({
  userId,
  userEmail,
  userName,
  userImage,
  userRole,
}: StudentLessonsPageServerProps) {
  console.log(`📚 [STUDENT-LESSONS-PAGE-SERVER] Loading for user ${userId}`);

  try {
    // Buscar perfil do aluno para verificar professores vinculados
    console.log('🔍 Verificando perfil do aluno...');
    const profileData = await getStudentProfileForPageServer(userId);

    if (!profileData || !profileData.profile) {
      throw new Error('Perfil de aluno não encontrado');
    }

    // Verificar se tem professores ativos
    const activeTeachers = profileData.profile.teachers.filter(
      (t) => t.isActive
    );

    if (activeTeachers.length === 0) {
      // Aluno não tem professores - mostrar página especial
      return (
        <StudentLessonsPageClient
          initialData={null}
          studentProfile={{
            id: userId,
            name: userName,
            email: userEmail,
            image: userImage,
            role: userRole,
          }}
          errorMessage="no_teachers"
        />
      );
    }

    // Buscar aulas do aluno (últimas 3 meses + próximas aulas)
    console.log('📅 Carregando aulas do aluno...');
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);

    const lessonsData = await getStudentLessonsForPageServer(userId, {
      dateFrom: threeMonthsAgo.toISOString().split('T')[0],
      dateTo: futureDate.toISOString().split('T')[0],
      limit: 50,
      offset: 0,
    });

    if (!lessonsData) {
      throw new Error('Falha ao carregar aulas');
    }

    // Preparar dados dos professores para filtros
    const teachersInfo = activeTeachers.map((teacher) => ({
      teacherId: teacher.teacherId,
      teacherName: teacher.teacherName,
      teacherImage: teacher.teacherImage,
      isActive: teacher.isActive,
      totalLessons: teacher.totalLessons,
    }));

    const studentLessonsData: StudentLessonsData = {
      lessons: lessonsData.lessons,
      pagination: lessonsData.pagination,
      teachers: teachersInfo,
    };

    console.log(
      `✅ [STUDENT-LESSONS-PAGE-SERVER] Data loaded successfully - ${lessonsData.lessons.length} aulas`
    );

    return (
      <StudentLessonsPageClient
        initialData={studentLessonsData}
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
    console.error('❌ [STUDENT-LESSONS-PAGE-SERVER] Critical error:', error);

    // Fallback com dados vazios
    return (
      <StudentLessonsPageClient
        initialData={null}
        studentProfile={{
          id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
          role: userRole,
        }}
        errorMessage="Erro ao carregar aulas. Tente recarregar a página."
      />
    );
  }
}
