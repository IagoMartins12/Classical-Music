// app/teacher/assignments/[id]/edit/pageServer.tsx - Server Component para Editar Tarefa

import {
  getTeacherStudentsData,
  getTeacherLessonsData,
} from '@/app/requests/teacher-request';
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
    audioFiles: string[];
    videoFiles: string[];
    documents: string[];
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
    `📋✏️ [EDIT-ASSIGNMENT-PAGE-SERVER] Loading for assignment ${assignmentId} - user ${userId}`
  );

  try {
    // Buscar dados do assignment via API interna
    const assignmentResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/assignments/${assignmentId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          // TODO: Adicionar headers de autenticação se necessário
        },
      }
    );

    if (!assignmentResponse.ok) {
      if (assignmentResponse.status === 404) {
        throw new Error('Tarefa não encontrada');
      } else if (assignmentResponse.status === 403) {
        throw new Error('Acesso negado');
      } else {
        throw new Error('Falha ao carregar tarefa');
      }
    }

    const assignmentData = await assignmentResponse.json();

    if (!assignmentData.success || !assignmentData.assignment) {
      throw new Error('Dados da tarefa inválidos');
    }

    const assignment = assignmentData.assignment;

    // Buscar dados dos alunos para possível troca
    const studentsData = await getTeacherStudentsData(userId, 'active', 100, 0);

    if (!studentsData || !studentsData.success) {
      console.warn(
        '⚠️ [EDIT-ASSIGNMENT-PAGE-SERVER] Could not load students data'
      );
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

    const editAssignmentData: EditAssignmentData = {
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        priority: assignment.priority,
        dueDate: assignment.dueDate ? new Date(assignment.dueDate) : null,
        estimatedTime: assignment.estimatedTime,
        workScoreIds: assignment.workScoreIds || [],
        exercises: assignment.exercises || [],
        audioFiles: assignment.audioFiles || [],
        videoFiles: assignment.videoFiles || [],
        documents: assignment.documents || [],
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
        createdAt: new Date(assignment.createdAt),
        updatedAt: new Date(assignment.updatedAt),
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
      `✅ [EDIT-ASSIGNMENT-PAGE-SERVER] Data loaded successfully - Assignment: ${assignment.title}`
    );

    return (
      <EditAssignmentPageClient
        initialData={editAssignmentData}
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
    console.error('❌ [EDIT-ASSIGNMENT-PAGE-SERVER] Critical error:', error);

    // Fallback com mensagem de erro
    return (
      <EditAssignmentPageClient
        initialData={null}
        teacherProfile={{
          id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
          role: userRole,
        }}
        errorMessage={
          error instanceof Error ? error.message : 'Erro ao carregar tarefa'
        }
      />
    );
  }
}
