// app/requests/portal/records.ts — aulas e tarefas da API no formato do legado (Etapa 4)
//
// Aluno e professor recebem os mesmos registros; o que muda é o que cada tela
// monta em volta. Os ids de pessoa no legado são ids de **usuário** (`userId`),
// enquanto a API também expõe o id de perfil (`id`) — por isso o `userId` vira
// o `id` das pessoas aqui.
import {
  ApiParticipant,
  orUndefined,
  personName,
  toDate,
  toOptionalDate,
} from './common';

export interface ApiWorkScore {
  id: string;
  title: string;
  type: string;
  downloadUrl: string | null;
  source?: string | null;
  work: {
    id: string;
    title: string;
    composer: { id: string; name: string; fullName?: string | null };
  };
}

export interface ApiLinkedWork {
  id: string;
  title: string;
  composer: { id: string; name: string; fullName?: string | null };
}

export interface ApiLesson {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  duration: number;
  status: string;
  type: string;
  location: string | null;
  objectives: string[];
  worksIds: string[];
  workScoreIds: string[];
  topics: string[];
  techniques: string[];
  repertoire: string[];
  homework: string | null;
  practiceGoals: string[];
  publicNotes: string | null;
  lessonSummary: string | null;
  studentFeedback: string | null;
  studentPresent: boolean | null;
  isRecurring: boolean;
  recurrenceType: string | null;
  parentLessonId: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  // Só para o professor da aula.
  teacherNotes?: string | null;
  engagement?: number | null;
  preparation?: number | null;
  teacher: ApiParticipant;
  student: ApiParticipant;
  // Só no detalhe (`GET /lessons/:id`).
  workScores?: ApiWorkScore[];
  works?: ApiLinkedWork[];
}

export interface ApiMilestone {
  label: string;
  progress: number;
  reachedAt: string | null;
}

export interface ApiSubmissionEntry {
  id?: string;
  kind: string;
  assetId?: string | null;
  url?: string | null;
  note?: string | null;
  submittedAt?: string | null;
}

export interface ApiAssignment {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string | null;
  estimatedTime: number | null;
  actualTime: number | null;
  isCompleted: boolean;
  completedAt: string | null;
  progress: number;
  workScoreIds: string[];
  worksIds: string[];
  exercises: string[];
  practiceGoals: string[];
  technicalGoals: string[];
  musicalGoals: string[];
  tempoTargets: unknown;
  teacherFeedback: string | null;
  teacherRating: number | null;
  studentNotes: string | null;
  studentRating: number | null;
  submissionDate: string | null;
  createdAt: string;
  updatedAt: string;
  student: ApiParticipant;
  lesson: {
    id: string;
    title: string;
    scheduledAt: string;
    teacher: ApiParticipant;
  };
  submissions: { entries: ApiSubmissionEntry[]; milestones: ApiMilestone[] };
  isOverdue: boolean;
  daysUntilDue: number | null;
  effectiveStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  // Só no detalhe (`GET /assignments/:id`).
  workScores?: ApiWorkScore[];
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canGiveFeedback: boolean;
    canSubmit: boolean;
    canComplete: boolean;
  };
}

export interface ApiAssignmentStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

/** Os marcos que a tela de tarefa do legado marcava como caixas de seleção. */
export const MILESTONE_KEYS = [
  'learnedLeftHand',
  'learnedRightHand',
  'playedWithMetronome',
  'memorized',
  'playedAtTempo',
  'masteredDynamics',
  'performedForOthers',
] as const;

export type MilestoneKey = (typeof MILESTONE_KEYS)[number];

/**
 * A API guarda marcos como lista (`{label, progress, reachedAt}`); o legado
 * lia um objeto de booleanos. Cada chave vale `true` se há marco com o rótulo.
 */
export function milestonesObject(
  milestones: ApiMilestone[]
): Record<MilestoneKey, boolean> {
  const reached = new Set(milestones.map((milestone) => milestone.label));

  return Object.fromEntries(
    MILESTONE_KEYS.map((key) => [key, reached.has(key)])
  ) as Record<MilestoneKey, boolean>;
}

/**
 * `submissions` do legado: as entradas da API, o objeto de marcos e o
 * `videoSubmission` que a tela de tarefa do aluno lê (o último vídeo enviado).
 * O tamanho do arquivo a API não guarda.
 */
export function legacySubmissions(submissions: ApiAssignment['submissions']) {
  const lastVideo = [...submissions.entries]
    .reverse()
    .find((entry) => entry.kind === 'video' && entry.url);

  return {
    entries: submissions.entries,
    milestones: submissions.milestones,
    progressMilestones: milestonesObject(submissions.milestones),
    videoSubmission: lastVideo
      ? {
          filePath: lastVideo.url,
          originalName: lastVideo.note || 'Vídeo enviado',
          uploadedAt: lastVideo.submittedAt ?? undefined,
          fileSize: undefined,
        }
      : undefined,
  };
}

export function legacyWorkScores(scores: ApiWorkScore[] = []) {
  return scores.map((score) => ({
    id: score.id,
    title: score.title,
    composer: score.work.composer.name,
    workTitle: score.work.title,
    type: score.type,
    downloadUrl: orUndefined(score.downloadUrl),
  }));
}

function person(participant: ApiParticipant) {
  return {
    id: participant.userId,
    name: personName(participant.user),
    image: participant.user.image,
  };
}

/**
 * Linha de aula das listagens. O que a API não devolve nas listagens
 * (avaliação por habilidade, pontualidade, e-mail das pessoas) vem vazio.
 */
export function legacyLessonRow(lesson: ApiLesson, studentLevel?: string) {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    scheduledAt: toDate(lesson.scheduledAt),
    duration: lesson.duration,
    status: lesson.status,
    type: lesson.type,
    location: lesson.location,

    isRecurring: lesson.isRecurring,
    recurrenceType: lesson.recurrenceType,
    parentLessonId: lesson.parentLessonId,

    objectives: lesson.objectives,
    worksIds: lesson.worksIds,
    workScoreIds: lesson.workScoreIds,
    topics: lesson.topics,
    techniques: lesson.techniques,
    repertoire: lesson.repertoire,
    homework: lesson.homework,
    practiceGoals: lesson.practiceGoals,

    teacherNotes: lesson.teacherNotes ?? null,
    publicNotes: lesson.publicNotes,
    studentFeedback: lesson.studentFeedback,
    lessonSummary: lesson.lessonSummary,

    studentProgress: null,
    skillsWorked: [] as string[],
    improvements: [] as string[],
    challenges: [] as string[],

    studentPresent: lesson.studentPresent,
    punctuality: null,
    engagement: lesson.engagement ?? null,
    preparation: lesson.preparation ?? null,

    cancelledAt: toOptionalDate(lesson.cancelledAt),
    cancelReason: lesson.cancelReason,

    teacher: { ...person(lesson.teacher), email: '' },
    student: {
      ...person(lesson.student),
      email: '',
      level: studentLevel ?? 'BEGINNER',
    },

    createdAt: toDate(lesson.createdAt),
  };
}

export function legacyAssignmentRow(assignment: ApiAssignment) {
  return {
    id: assignment.id,
    lessonId: assignment.lesson.id,
    title: assignment.title,
    description: assignment.description,
    type: assignment.type,
    priority: assignment.priority,

    workScoreIds: assignment.workScoreIds,
    worksIds: assignment.worksIds,
    exercises: assignment.exercises,

    practiceGoals: assignment.practiceGoals,
    tempoTargets: assignment.tempoTargets,
    technicalGoals: assignment.technicalGoals,
    musicalGoals: assignment.musicalGoals,

    status: assignment.effectiveStatus,
    dueDate: assignment.dueDate ? toDate(assignment.dueDate) : null,
    estimatedTime: assignment.estimatedTime,
    actualTime: assignment.actualTime,
    isOverdue: assignment.isOverdue,
    daysUntilDue: assignment.daysUntilDue,

    isCompleted: assignment.isCompleted,
    completedAt: assignment.completedAt ? toDate(assignment.completedAt) : null,
    progress: assignment.progress,

    teacherFeedback: assignment.teacherFeedback,
    teacherRating: assignment.teacherRating,
    studentNotes: assignment.studentNotes,
    studentRating: assignment.studentRating,

    submissions: legacySubmissions(assignment.submissions),
    submissionDate: assignment.submissionDate
      ? toDate(assignment.submissionDate)
      : null,

    student: person(assignment.student),
    lesson: {
      id: assignment.lesson.id,
      title: assignment.lesson.title,
      scheduledAt: toDate(assignment.lesson.scheduledAt),
      teacher: {
        name: personName(assignment.lesson.teacher.user),
        image: assignment.lesson.teacher.user.image,
      },
    },

    createdAt: toDate(assignment.createdAt),
    updatedAt: toDate(assignment.updatedAt),
  };
}

/** Obras e partituras da aula como a tela de detalhe do professor mostrava. */
export function musicalPieces(
  scores: ApiWorkScore[] = [],
  works: ApiLinkedWork[] = []
) {
  const pieces: Array<{
    workId: string;
    workTitle: string;
    composerName: string;
    composerId: string;
    scoreId?: string;
    scoreTitle?: string;
    scoreUrl?: string | null;
    scoreType?: string;
    scoreSource?: string | null;
  }> = scores.map((score) => ({
    workId: score.work.id,
    workTitle: score.work.title,
    composerName: score.work.composer.fullName || score.work.composer.name,
    composerId: score.work.composer.id,
    scoreId: score.id,
    scoreTitle: score.title,
    scoreUrl: score.downloadUrl,
    scoreType: score.type,
    scoreSource: score.source ?? null,
  }));

  for (const work of works) {
    if (!pieces.some((piece) => piece.workId === work.id)) {
      pieces.push({
        workId: work.id,
        workTitle: work.title,
        composerName: work.composer.fullName || work.composer.name,
        composerId: work.composer.id,
      });
    }
  }

  return pieces;
}
