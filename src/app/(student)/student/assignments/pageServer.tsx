// app/student/assignments/pageServer.tsx - Server Component para Tarefas do Aluno

import {
  getStudentAssignmentsForPageServer,
  getStudentProfileForPageServer,
} from '@/app/requests/student-requests';
import StudentAssignmentsPageClient from './pageClient';

export interface StudentAssignmentsData {
  assignments: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    workScoreIds: string[];
    exercises: string[];
    practiceGoals: string[];
    tempoTargets?: any;
    technicalGoals: string[];
    musicalGoals: string[];
    status: string;
    dueDate?: Date | null;
    estimatedTime?: number | null;
    actualTime?: number | null;
    isOverdue: boolean;
    daysUntilDue?: number | null;
    isCompleted: boolean;
    completedAt?: Date | null;
    progress?: number | null;
    teacherFeedback?: string | null;
    teacherRating?: number | null;
    studentNotes?: string | null;
    studentRating?: number | null;
    submissions?: any;
    submissionDate?: Date | null;
    lesson: {
      id: string;
      title: string;
      scheduledAt: Date;
      teacher: {
        name: string;
      };
    };
    createdAt: Date;
    updatedAt: Date;
  }>;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
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

interface StudentAssignmentsPageServerProps {
  userId: string;
}

export default async function StudentAssignmentsPageServer({
  userId,
}: StudentAssignmentsPageServerProps) {
  console.log(
    `📋 [STUDENT-ASSIGNMENTS-PAGE-SERVER] Loading for user ${userId}`
  );

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
        <StudentAssignmentsPageClient
          initialData={null}
          errorMessage="no_teachers"
        />
      );
    }

    // Buscar assignments do aluno
    console.log('📋 Carregando assignments do aluno...');
    const assignmentsData = await getStudentAssignmentsForPageServer(userId, {
      limit: 50,
      offset: 0,
    });

    if (!assignmentsData) {
      throw new Error('Falha ao carregar assignments');
    }

    // Preparar dados dos professores para filtros
    const teachersInfo = activeTeachers.map((teacher) => ({
      teacherId: teacher.teacherId,
      teacherName: teacher.teacherName,
      teacherImage: teacher.teacherImage,
      isActive: teacher.isActive,
      totalLessons: teacher.totalLessons,
    }));

    const studentAssignmentsData: StudentAssignmentsData = {
      assignments: assignmentsData.assignments,
      stats: assignmentsData.stats,
      pagination: assignmentsData.pagination,
      teachers: teachersInfo,
    };

    console.log(
      `✅ [STUDENT-ASSIGNMENTS-PAGE-SERVER] Data loaded successfully - ${assignmentsData.assignments.length} assignments`
    );

    return (
      <StudentAssignmentsPageClient initialData={studentAssignmentsData} />
    );
  } catch (error) {
    console.error(
      '❌ [STUDENT-ASSIGNMENTS-PAGE-SERVER] Critical error:',
      error
    );

    // Fallback com dados vazios
    return (
      <StudentAssignmentsPageClient
        initialData={null}
        errorMessage="Erro ao carregar tarefas. Tente recarregar a página."
      />
    );
  }
}
