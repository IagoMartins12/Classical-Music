// app/teacher/assignments/create/pageServer.tsx - Server Component para Criar Nova Tarefa

import {
  getTeacherStudentsData,
  getTeacherLessonsData,
} from '@/app/requests/teacher-request';
import CreateAssignmentPageClient from './pageClient';

export interface CreateAssignmentData {
  students: Array<{
    id: string;
    name: string;
    image?: string | null;
    level: string;
    isActive: boolean;
  }>;
  recentLessons: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    student: {
      id: string;
      name: string;
    };
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

export default async function CreateAssignmentPageServer({
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
  console.log(
    `📋➕ [CREATE-ASSIGNMENT-PAGE-SERVER] Loading for user ${userId}`
  );

  try {
    // Buscar dados em paralelo
    const [studentsData, lessonsData] = await Promise.all([
      getTeacherStudentsData(userId, 'active', 100, 0),
      getTeacherLessonsData(
        userId,
        undefined,
        'SCHEDULED',
        undefined,
        undefined,
        20,
        0,
        false
      ),
    ]);

    if (!studentsData || !studentsData.success) {
      throw new Error('Falha ao carregar dados dos alunos');
    }

    // Preparar lista de alunos
    const students = studentsData.students.map((studentRel) => ({
      id: studentRel.student.id,
      name: studentRel.student.name,
      image: studentRel.student.image,
      level: studentRel.student.level,
      isActive: studentRel.relationship.isActive,
    }));

    // Preparar aulas recentes (apenas as agendadas)
    const recentLessons =
      lessonsData?.lessons?.slice(0, 10).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        scheduledAt: lesson.scheduledAt,
        student: {
          id: lesson.student.id,
          name: lesson.student.name,
        },
      })) || [];

    const createAssignmentData: CreateAssignmentData = {
      students,
      recentLessons,
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
      `✅ [CREATE-ASSIGNMENT-PAGE-SERVER] Data loaded successfully - ${students.length} students, ${recentLessons.length} recent lessons`
    );

    return (
      <CreateAssignmentPageClient
        initialData={createAssignmentData}
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
    console.error('❌ [CREATE-ASSIGNMENT-PAGE-SERVER] Critical error:', error);

    // Fallback com dados vazios
    return (
      <CreateAssignmentPageClient
        initialData={{
          students: [],
          recentLessons: [],
          assignmentTypes: [
            {
              value: 'practice',
              label: 'Prática',
              description: 'Exercícios de prática',
            },
            { value: 'theory', label: 'Teoria', description: 'Estudo teórico' },
            {
              value: 'listening',
              label: 'Escuta',
              description: 'Exercícios auditivos',
            },
          ],
          priorityLevels: [
            { value: 'low', label: 'Baixa', color: 'text-accent-green' },
            { value: 'medium', label: 'Média', color: 'text-accent-yellow' },
            { value: 'high', label: 'Alta', color: 'text-accent-red' },
          ],
        }}
        teacherProfile={{
          id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
          role: userRole,
        }}
        errorMessage="Erro ao carregar dados. Tente recarregar a página."
      />
    );
  }
}
