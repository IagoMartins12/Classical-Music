// app/requests/portal/relationship-actions.ts — vínculos professor–aluno pela API (Etapa 4)
//
// Usadas no navegador (vão pela sessão). O vínculo na API fica ativo ou é
// encerrado; não há pausa. Os campos de plano de estudos que a API não guarda
// (metas, frequência de prática, instruções especiais) não são enviados.
import { apiFetch } from '@/app/libs/api/client';

const RELATIONSHIP_FIELDS = [
  'maxLessonsPerWeek',
  'lessonDuration',
  'preferredDays',
  'preferredTimes',
  'learningPlan',
  'currentFocus',
  'nextGoals',
  'teacherNotes',
  'homeworkFrequency',
  'reportFrequency',
] as const;

function relationshipBody(data: Record<string, any>) {
  return Object.fromEntries(
    RELATIONSHIP_FIELDS.filter((key) => {
      const value = data[key];
      return value !== undefined && value !== null && value !== '';
    }).map((key) => [key, data[key]])
  );
}

/** Convida o aluno (e-mail de convite sai da API); o vínculo nasce pendente. */
export function inviteStudentRequest(
  studentUserId: string,
  plan: Record<string, any> = {}
) {
  return apiFetch<Record<string, any>>('/teacher/students', {
    method: 'POST',
    body: { studentUserId, ...relationshipBody(plan) },
  });
}

export function updateRelationshipRequest(
  relationshipId: string,
  updates: Record<string, any>
) {
  // Anotação vazia é um valor válido (apagar a nota), então vai mesmo vazia.
  const body = {
    ...relationshipBody(updates),
    ...(typeof updates.teacherNotes === 'string'
      ? { teacherNotes: updates.teacherNotes }
      : {}),
    ...(typeof updates.learningPlan === 'string'
      ? { learningPlan: updates.learningPlan }
      : {}),
  };

  return apiFetch<Record<string, any>>(`/teacher/students/${relationshipId}`, {
    method: 'PATCH',
    body,
  });
}

export function endRelationshipRequest(relationshipId: string) {
  return apiFetch<void>(`/teacher/students/${relationshipId}`, {
    method: 'DELETE',
  });
}

export function resendInviteRequest(relationshipId: string) {
  return apiFetch<Record<string, any>>(
    `/teacher/students/${relationshipId}/resend-invite`,
    { method: 'POST' }
  );
}

/**
 * Usuários que o professor pode convidar (a API já tira quem é aluno dele).
 * A busca devolve só nome, e-mail e foto — dados de perfil de terceiros não
 * saem; os campos do legado sem equivalente vêm vazios.
 */
export async function searchInvitableStudents(term: string) {
  const data = await apiFetch<{
    users: Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      image: string | null;
    }>;
  }>('/teacher/students/search', { query: { q: term.trim() } });

  return data.users.map((user) => ({
    id: user.id,
    name:
      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
      (user.email ?? ''),
    email: user.email ?? '',
    image: user.image ?? undefined,
    location: null,
    experienceLevel: null,
    mainInstrument: null,
    studentLevel: null,
    isAlreadyStudent: false,
    relationshipId: null,
    hasStudentProfile: false,
  }));
}

export const PAUSE_NOT_SUPPORTED =
  'Pausar o vínculo não está disponível: o vínculo fica ativo ou é encerrado.';
