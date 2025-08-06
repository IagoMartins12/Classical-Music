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

// Função para buscar detalhes da tarefa (precisa ser implementada no teacher-request.ts)
async function getTeacherAssignmentDetailsData(
  assignmentId: string,
  userId: string
): Promise<{ success: boolean; assignment?: any; error?: string }> {
  try {
    // Esta função deve ser implementada no teacher-request.ts
    // Por agora, vou simular a estrutura
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/assignments/${assignmentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Aqui deveria ter autenticação server-side
        },
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Tarefa não encontrada' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    return { success: false, error: 'Erro ao carregar tarefa' };
  }
}

export default async function AssignmentDetailsPageServer({
  assignmentId,
  userId,
  userEmail,
  userName,
  userImage,
  userRole,
}: {
  assignmentId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string | null;
  userRole: number;
}) {
  console.log(
    `📋👁️ [ASSIGNMENT-DETAILS-PAGE-SERVER] Loading assignment ${assignmentId} for user ${userId}`
  );

  try {
    // Buscar detalhes da tarefa
    const assignmentData = await getTeacherAssignmentDetailsData(
      assignmentId,
      userId
    );

    if (!assignmentData || !assignmentData.success) {
      throw new Error('Tarefa não encontrada ou sem permissão de acesso');
    }

    const assignment = assignmentData.assignment;

    // Verificar permissões
    const canEdit = assignment.status !== 'COMPLETED';
    const canGiveFeedback = true; // Professor sempre pode dar feedback

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
        status: assignment.isOverdue ? 'OVERDUE' : assignment.status,
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

    return (
      <AssignmentDetailsPageClient
        initialData={assignmentDetailsData}
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
    console.error('❌ [ASSIGNMENT-DETAILS-PAGE-SERVER] Critical error:', error);

    // Fallback com erro
    return (
      <AssignmentDetailsPageClient
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
            : 'Erro ao carregar dados da tarefa'
        }
      />
    );
  }
}
