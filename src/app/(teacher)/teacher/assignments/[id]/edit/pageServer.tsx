// app/teacher/assignments/[id]/edit/pageServer.tsx - Server Component para Editar Tarefa

import { getTeacherAssignmentEditData } from '@/app/requests/teacher-request';
import EditAssignmentPageClient from './pageClient';

export interface EditAssignmentData {
  assignment: {
    id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    dueDate?: Date | null;
    estimatedTime?: number | null;
    workScoreIds: string[];
    exercises: string[];
    practiceGoals: string[];
    tempoTargets?: any;
    technicalGoals: string[];
    musicalGoals: string[];
    status: string;
    isCompleted: boolean;
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
    workScores: Array<{
      id: string;
      title: string;
      composer: string;
      workTitle: string;
      type: string;
      downloadUrl?: string;
    }>;
    permissions: {
      canEdit: boolean;
      canDelete: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
  };
  students: Array<{
    id: string;
    name: string;
    image?: string | null;
    level: string;
    isActive: boolean;
  }>;
  assignmentTypes: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  priorityLevels: Array<{
    value: string;
    label: string;
    color: string;
  }>;
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

export default async function EditAssignmentPageServer({
  assignmentId,
  userId,
}: {
  assignmentId: string;
  userId: string;
}) {
  console.log(
    `📋✏️ [EDIT-ASSIGNMENT-PAGE-SERVER] Loading for assignment ${assignmentId} - user ${userId}`
  );

  try {
    // Buscar dados da tarefa diretamente do banco
    const assignmentData = await getTeacherAssignmentEditData(
      assignmentId,
      userId
    );

    if (
      !assignmentData ||
      !assignmentData.success ||
      !assignmentData.assignment
    ) {
      throw new Error(
        assignmentData?.error || 'Falha ao carregar dados da tarefa'
      );
    }

    const assignment = assignmentData.assignment;
    const students = assignmentData.students || [];

    const editAssignmentData: EditAssignmentData = {
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        priority: assignment.priority,
        dueDate: assignment.dueDate,
        estimatedTime: assignment.estimatedTime,
        workScoreIds: assignment.workScoreIds || [],
        exercises: assignment.exercises || [],
        practiceGoals: assignment.practiceGoals || [],
        tempoTargets: assignment.tempoTargets,
        technicalGoals: assignment.technicalGoals || [],
        musicalGoals: assignment.musicalGoals || [],
        status: assignment.status,
        isCompleted: assignment.isCompleted,
        student: assignment.student,
        lesson: assignment.lesson,
        workScores: assignment.workScores || [],
        permissions: assignment.permissions,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      },
      students,
      assignmentTypes: [
        {
          value: 'practice',
          label: 'Prática',
          description: 'Exercícios de prática e repetição',
        },
        {
          value: 'theory',
          label: 'Teoria',
          description: 'Estudo teórico e conceitos musicais',
        },
        {
          value: 'listening',
          label: 'Escuta',
          description: 'Exercícios de percepção auditiva',
        },
        {
          value: 'composition',
          label: 'Composição',
          description: 'Criação e arranjos musicais',
        },
        {
          value: 'performance',
          label: 'Performance',
          description: 'Preparação para apresentações',
        },
        {
          value: 'reading',
          label: 'Leitura',
          description: 'Leitura musical e partitura',
        },
      ],
      priorityLevels: [
        {
          value: 'low',
          label: 'Baixa',
          color: 'text-accent-green',
        },
        {
          value: 'medium',
          label: 'Média',
          color: 'text-accent-yellow',
        },
        {
          value: 'high',
          label: 'Alta',
          color: 'text-accent-red',
        },
      ],
    };

    console.log(
      `✅ [EDIT-ASSIGNMENT-PAGE-SERVER] Data loaded successfully - Assignment: ${assignment.title}, Students: ${students.length}`
    );

    return <EditAssignmentPageClient initialData={editAssignmentData} />;
  } catch (error) {
    console.error('❌ [EDIT-ASSIGNMENT-PAGE-SERVER] Critical error:', error);

    // Fallback com mensagem de erro
    return (
      <EditAssignmentPageClient
        initialData={null}
        errorMessage={
          error instanceof Error ? error.message : 'Erro ao carregar tarefa'
        }
      />
    );
  }
}
