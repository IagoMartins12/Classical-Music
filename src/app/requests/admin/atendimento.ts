/** Atendimento: as mensagens do formulário de contato (`/admin/support-tickets`). */
import { apiFetch } from '@/app/libs/api/client';

export type SituacaoDoChamado = 'open' | 'answered' | 'closed';

export interface Chamado {
  id: string;
  ticketId: string;
  userId: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  prioritySupport: boolean;
  plan: string;
  language: string;
  status: SituacaoDoChamado;
  note: string | null;
  answeredAt: string | null;
  createdAt: string;
}

export interface FilaDeAtendimento {
  tickets: Chamado[];
  counts: {
    open: number;
    answered: number;
    closed: number;
    priorityOpen: number;
  };
  pagination: { page: number; total: number; totalPages: number };
}

export const getChamados = (f: {
  status: SituacaoDoChamado | 'all';
  search: string;
  page: number;
}) =>
  apiFetch<FilaDeAtendimento>('/admin/support-tickets', {
    cache: 'no-store',
    query: {
      status: f.status,
      search: f.search.trim() || undefined,
      page: f.page,
    },
  });

export const atualizarChamado = (
  id: string,
  body: { status?: SituacaoDoChamado; note?: string }
) =>
  apiFetch<Chamado>(`/admin/support-tickets/${id}`, {
    method: 'PATCH',
    body,
  });
