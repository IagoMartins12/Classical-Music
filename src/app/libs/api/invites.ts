import { MessageResponse } from './auth';
import { apiFetch } from './client';

const at = (path: string, token: string) =>
  `${path}/${encodeURIComponent(token)}`;

const post = <T>(path: string) =>
  apiFetch<T>(path, { method: 'POST', skipRefresh: true });

/**
 * Respostas aos convites por e-mail. Sempre `POST`: o `GET` que o legado usava
 * era disparado pelo pré-carregador de links do cliente de e-mail, e aceitava
 * o convite sem a pessoa ver.
 */
export const invitesApi = {
  acceptTeacher: (token: string) =>
    post<MessageResponse>(at('/invites/teacher/accept', token)),
  declineTeacher: (token: string) =>
    post<MessageResponse>(at('/invites/teacher/decline', token)),
  resendTeacher: (token: string) =>
    post<MessageResponse>(at('/invites/teacher/resend', token)),

  acceptStudent: (token: string) =>
    post<{ accepted: boolean; relationshipId: string; teacherName: string }>(
      at('/invites/student/accept', token)
    ),
  declineStudent: (token: string) =>
    post<{ declined: boolean; teacherName: string }>(
      at('/invites/student/decline', token)
    ),
};
