// app/student/assignments/[id]/pageServer.tsx - Server Component para Detalhes da Tarefa do Aluno

import { getStudentAssignmentDetailsData } from '@/app/requests/student-requests';
import StudentAssignmentDetailsPageClient from './pageClient';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';

export interface StudentAssignmentDetailsData {
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
    lesson: {
      id: string;
      title: string;
      scheduledAt: Date;
      teacher: {
        name: string;
        image?: string | null;
      };
    };
    workScores: Array<{
      id: string;
      title: string;
      composer: string;
      workTitle: string;
      type: string;
      downloadUrl?: string;
    }>;
    // 🆕 PROGRESS MILESTONES TIPADO CORRETAMENTE
    progressMilestones: {
      learnedLeftHand: boolean;
      learnedRightHand: boolean;
      playedWithMetronome: boolean;
      memorized: boolean;
      playedAtTempo: boolean;
      masteredDynamics: boolean;
      performedForOthers: boolean;
    };
    permissions: {
      canEdit: boolean;
      canDelete: boolean;
      canComplete: boolean;
      canAddFeedback: boolean;
      canAddSubmission: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
  };
  canSubmit: boolean;
  isOwner: boolean;
}

interface StudentAssignmentDetailsPageServerProps {
  assignmentId: string;
  userId: string;
  userRole: number;
}

export default async function StudentAssignmentDetailsPageServer({
  assignmentId,
  userId,
  userRole,
}: StudentAssignmentDetailsPageServerProps) {
  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'student/assignmentsId',
  ]);
  try {
    // Buscar detalhes da tarefa diretamente do banco (perspectiva do aluno)
    const assignmentData = await getStudentAssignmentDetailsData(
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

    // Verificar permissões baseadas no assignment carregado (perspectiva do aluno)
    const canSubmit = userRole === 0 && !assignment.isCompleted; // Apenas aluno pode submeter
    const isOwner = userRole === 0; // Aluno é "dono" da tarefa do ponto de vista dele

    const assignmentDetailsData: StudentAssignmentDetailsData = {
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
        lesson: {
          id: assignment.lesson.id,
          title: assignment.lesson.title,
          scheduledAt: assignment.lesson.scheduledAt,
          teacher: {
            name: assignment.lesson.teacher.name,
            image: assignment.lesson.teacher.image,
          },
        },
        // 🆕 ADICIONAR WORKSCORES DO BACKEND
        workScores: assignment.workScores || [],
        // 🆕 PROGRESS MILESTONES (extrair de submissions ou criar sistema próprio)
        progressMilestones: assignment.progressMilestones || {
          learnedLeftHand: false,
          learnedRightHand: false,
          playedWithMetronome: false,
          memorized: false,
          playedAtTempo: false,
          masteredDynamics: false,
          performedForOthers: false,
        },
        permissions: assignment.permissions,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      },
      canSubmit,
      isOwner,
    };

    console.log(
      `✅ [STUDENT-ASSIGNMENT-DETAILS-PAGE-SERVER] Assignment loaded successfully - ${assignment.title}`
    );

    return (
      <TranslationProvider language={language} translations={translations}>
        <StudentAssignmentDetailsPageClient
          initialData={assignmentDetailsData}
        />
      </TranslationProvider>
    );
  } catch (error) {
    console.error(
      '❌ [STUDENT-ASSIGNMENT-DETAILS-PAGE-SERVER] Critical error:',
      error
    );

    // Fallback com erro
    return (
      <TranslationProvider language={language} translations={translations}>
        <StudentAssignmentDetailsPageClient
          initialData={null}
          errorMessage={
            error instanceof Error
              ? error.message
              : 'Erro ao carregar dados da tarefa'
          }
        />
      </TranslationProvider>
    );
  }
}
