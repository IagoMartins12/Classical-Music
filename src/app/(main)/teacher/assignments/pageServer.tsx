// app/teacher/assignments/pageServer.tsx - Server Component para Tarefas do Professor

import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/app/libs/auth';
import { getTeacherStudents } from '@/app/requests/teacher-request';
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
  dueDate?: Date;
  estimatedTime?: number;
  actualTime?: number;
  isOverdue: boolean;
  daysUntilDue?: number;
  isCompleted: boolean;
  completedAt?: Date;
  progress?: number;
  teacherFeedback?: string;
  teacherRating?: number;
  studentNotes?: string;
  studentRating?: number;
  submissions?: any;
  submissionDate?: Date;
  student: {
    id: string;
    name: string;
    image?: string;
  };
  lesson: {
    id: string;
    title: string;
    scheduledAt: Date;
    teacher: {
      name: string;
      image?: string;
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
    image?: string;
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

export default async function TeacherAssignmentsPageServer() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 1) {
    notFound();
  }

  try {
    // Buscar dados em paralelo
    const [assignmentsResponse, studentsData] = await Promise.all([
      fetch(`${process.env.NEXTAUTH_URL}/api/assignments?limit=50&offset=0`, {
        cache: 'no-store',
      }),
      getTeacherStudents('active', 100, 0),
    ]);

    if (!assignmentsResponse.ok) {
      throw new Error('Falha ao carregar tarefas');
    }

    const assignmentsData = await assignmentsResponse.json();

    if (!assignmentsData.success) {
      throw new Error(assignmentsData.error || 'Erro ao carregar tarefas');
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
      assignments: assignmentsData.assignments,
      stats: assignmentsData.stats,
      students: activeStudents,
      pagination: assignmentsData.pagination,
    };

    return (
      <TeacherAssignmentsPageClient
        initialData={teacherAssignmentsData}
        teacherProfile={{
          id: session.user.id,
          name: `${session.user.firstName || ''} ${
            session.user.lastName || ''
          }`.trim(),
          email: session.user.email || '',
          image: session.user.image,
          role: session.user.role,
        }}
      />
    );
  } catch (error) {
    console.error('❌ Erro crítico na página de tarefas:', error);

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
        teacherProfile={{
          id: session.user.id,
          name: `${session.user.firstName || ''} ${
            session.user.lastName || ''
          }`.trim(),
          email: session.user.email || '',
          image: session.user.image,
          role: session.user.role,
        }}
        errorMessage="Erro ao carregar dados das tarefas. Tente recarregar a página."
      />
    );
  }
}
