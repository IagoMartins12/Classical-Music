// components/Portal/assignment/assignmentText.ts — como uma tarefa se escreve
import type {
  Assignment,
  AssignmentPriority,
  AssignmentType,
} from '@/app/requests/portal/api';

export const TYPE_LABEL: Record<AssignmentType, string> = {
  practice: 'Prática',
  theory: 'Teoria',
  listening: 'Escuta',
  composition: 'Composição',
  performance: 'Apresentação',
};

export const PRIORITY_LABEL: Record<AssignmentPriority, string> = {
  low: 'baixa',
  medium: 'média',
  high: 'alta',
};

export type AssignmentState = 'awaiting' | 'overdue' | 'done' | 'open';

/** Entregue sem retorno é trabalho do professor; atraso é do aluno. */
export function assignmentState(
  a: Pick<Assignment, 'isCompleted' | 'teacherFeedback' | 'isOverdue'>
): AssignmentState {
  if (a.isCompleted) return a.teacherFeedback ? 'done' : 'awaiting';
  return a.isOverdue ? 'overdue' : 'open';
}

export const typeLabel = (t: string) => TYPE_LABEL[t as AssignmentType] ?? t;
export const priorityLabel = (p: string) =>
  PRIORITY_LABEL[p as AssignmentPriority] ?? p;
