// app/teacher/assignments/[id]/pageServer.tsx - Server Component para Detalhes da Tarefa

import { getTeacherAssignmentDetailsData } from '@/app/requests/teacher-request';
import AssignmentDetailsPageClient from './pageClient';

export interface AssignmentDetailsData {
  assignment: {
    id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    workScoreIds: string[];
    exercises: string[];
    practiceGoals: string[];
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
    };
    createdAt: Date;
    updatedAt: Date;
  };
  canEdit: boolean;
  canGiveFeedback: boolean;
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

export default async function AssignmentDetailsPageServer({
  assignmentId,
  userId,
  userRole,
}: {
  assignmentId: string;
  userId: string;

  userRole: number;
}) {
  console.log(
    `📋👁️ [ASSIGNMENT-DETAILS-PAGE-SERVER] Loading assignment ${assignmentId} for user ${userId}`
  );

  try {
    // Buscar detalhes da tarefa diretamente do banco
    const assignmentData = await getTeacherAssignmentDetailsData(
      assignmentId,
      userId,
      userRole
    );

    if (
      !assignmentData ||
      !assignmentData.success ||
      !assignmentData.assignment
    ) {
      throw new Error(
        assignmentData?.error ||
          'Tarefa não encontrada ou sem permissão de acesso'
      );
    }

    const assignment = assignmentData.assignment;

    // Verificar permissões baseadas no assignment carregado
    const canEdit = assignment.permissions.canEdit;
    const canGiveFeedback = userRole === 1; // Professor sempre pode dar feedback

    const assignmentDetailsData: AssignmentDetailsData = {
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        priority: assignment.priority,
        workScoreIds: assignment.workScoreIds || [],
        exercises: assignment.exercises || [],
        practiceGoals: assignment.practiceGoals || [],
        technicalGoals: assignment.technicalGoals || [],
        musicalGoals: assignment.musicalGoals || [],
        status: assignment.status,
        dueDate: assignment.dueDate,
        estimatedTime: assignment.estimatedTime,
        actualTime: assignment.actualTime,
        isOverdue: assignment.isOverdue || false,
        daysUntilDue: assignment.daysUntilDue,
        isCompleted: assignment.isCompleted,
        completedAt: assignment.completedAt,
        progress: assignment.progress,
        teacherFeedback: assignment.teacherFeedback,
        teacherRating: assignment.teacherRating,
        studentNotes: assignment.studentNotes,
        studentRating: assignment.studentRating,
        submissions: assignment.submissions,
        submissionDate: assignment.submissionDate,
        student: {
          id: assignment.student.id,
          name: assignment.student.name,
          image: assignment.student.image,
        },
        lesson: {
          id: assignment.lesson.id,
          title: assignment.lesson.title,
          scheduledAt: assignment.lesson.scheduledAt,
        },
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      },
      canEdit,
      canGiveFeedback,
    };

    console.log(
      `✅ [ASSIGNMENT-DETAILS-PAGE-SERVER] Assignment loaded successfully - ${assignment.title}`
    );

    return <AssignmentDetailsPageClient initialData={assignmentDetailsData} />;
  } catch (error) {
    console.error('❌ [ASSIGNMENT-DETAILS-PAGE-SERVER] Critical error:', error);

    // Fallback com erro
    return (
      <AssignmentDetailsPageClient
        initialData={null}
        errorMessage={
          error instanceof Error
            ? error.message
            : 'Erro ao carregar dados da tarefa'
        }
      />
    );
  }
}
