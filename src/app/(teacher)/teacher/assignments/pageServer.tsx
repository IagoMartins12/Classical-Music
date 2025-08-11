// app/teacher/assignments/pageServer.tsx - Server Component para Tarefas do Professor

import {
  getTeacherStudentsData,
  getTeacherAssignmentsData,
} from '@/app/requests/teacher-request';
import TeacherAssignmentsPageClient from './pageClient';

export interface TeacherAssignment {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  workScoreIds: string[];
  exercises: string[];
  audioFiles: string[];
  videoFiles: string[];
  documents: string[];
  practiceGoals: string[];
  tempoTargets?: any;
  technicalGoals: string[];
  musicalGoals: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
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
  student: {
    id: string;
    name: string;
    image?: string | null;
  };
  lesson: {
    id: string;
    title: string;
    scheduledAt: Date;
    teacher: {
      name: string;
      image?: string | null;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
  averageTime: number;
}

export interface TeacherAssignmentsData {
  assignments: TeacherAssignment[];
  stats: AssignmentStats;
  students: Array<{
    id: string;
    name: string;
    image?: string | null;
    level: string;
    isActive: boolean;
  }>;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

export default async function TeacherAssignmentsPageServer({
  userId,
}: {
  userId: string;
}) {
  console.log(
    `📋 [TEACHER-ASSIGNMENTS-PAGE-SERVER] Loading for user ${userId}`
  );

  try {
    // Buscar dados em paralelo
    const [assignmentsResponse, studentsData] = await Promise.all([
      getTeacherAssignmentsData(userId, undefined, undefined, undefined, 50, 0),
      getTeacherStudentsData(userId, 'active', 100, 0),
    ]);

    if (!assignmentsResponse || !assignmentsResponse.success) {
      throw new Error('Falha ao carregar tarefas');
    }

    // Preparar lista de alunos
    const activeStudents =
      studentsData?.students?.map((studentRel) => ({
        id: studentRel.student.id,
        name: studentRel.student.name,
        image: studentRel.student.image,
        level: studentRel.student.level,
        isActive: studentRel.relationship.isActive,
      })) || [];

    const teacherAssignmentsData: TeacherAssignmentsData = {
      assignments: assignmentsResponse.assignments,
      stats: assignmentsResponse.stats,
      students: activeStudents,
      pagination: assignmentsResponse.pagination,
    };

    console.log(
      `✅ [TEACHER-ASSIGNMENTS-PAGE-SERVER] Data loaded successfully - ${assignmentsResponse.assignments.length} assignments, ${activeStudents.length} students`
    );

    return (
      <TeacherAssignmentsPageClient initialData={teacherAssignmentsData} />
    );
  } catch (error) {
    console.error(
      '❌ [TEACHER-ASSIGNMENTS-PAGE-SERVER] Critical error:',
      error
    );

    // Fallback com dados vazios
    return (
      <TeacherAssignmentsPageClient
        initialData={{
          assignments: [],
          stats: {
            total: 0,
            pending: 0,
            inProgress: 0,
            completed: 0,
            overdue: 0,
            completionRate: 0,
            averageTime: 0,
          },
          students: [],
          pagination: {
            offset: 0,
            limit: 50,
            total: 0,
            hasMore: false,
          },
        }}
        errorMessage="Erro ao carregar dados das tarefas. Tente recarregar a página."
      />
    );
  }
}
