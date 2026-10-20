/**
 * A revisão das biografias no painel: as escritas por IA e as traduções
 * automáticas que esperam uma pessoa da equipe (`/admin/bio-review`).
 */
import { apiFetch } from '@/app/libs/api/client';

export type RecorteBiografias = 'pending' | 'reviewed';

export interface BiografiaParaRevisar {
  id: string;
  name: string;
  portraitUrl: string | null;
  epochName: string | null;
  worksCount: number;
  bio: string | null;
  bioEn: string | null;
  /** Escrita pela IA (a origem; segue verdadeira depois da revisão). */
  writtenByAi: boolean;
  generatedBy: string | null;
  generatedAt: string | null;
  /** O outro idioma é tradução de máquina deste. */
  translatedFrom: 'pt' | 'en' | null;
  reviewedAt: string | null;
}

export interface FilaDeBiografias {
  items: BiografiaParaRevisar[];
  counts: { pending: number; reviewed: number };
  nextCursor: string | null;
}

export const BIO_MIN = 300;
export const BIO_MAX = 12_000;

export const getBiografias = (filtros: {
  status: RecorteBiografias;
  search?: string;
  cursor?: string;
}) =>
  apiFetch<FilaDeBiografias>('/admin/bio-review', {
    query: {
      status: filtros.status,
      search: filtros.search || undefined,
      cursor: filtros.cursor,
      limit: 20,
    },
    cache: 'no-store',
  });

/** Sem corpo, aprova como está; com texto, grava o reescrito e aprova. */
export const revisarBiografia = (
  id: string,
  corpo: { bio?: string; bioEn?: string } = {}
) =>
  apiFetch<BiografiaParaRevisar>(`/admin/bio-review/${id}`, {
    method: 'POST',
    body: corpo,
  });
