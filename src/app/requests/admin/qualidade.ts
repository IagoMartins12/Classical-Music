/** O quadro de qualidade do acervo (`/admin/catalog-quality`). */
import { apiFetch } from '@/app/libs/api/client';

export interface QualidadeDoAcervo {
  generatedAt: string;
  composers: {
    total: number;
    verified: number;
    withBirthYear: number;
    withNationality: number;
    withWorks: number;
    suspects: number;
    withBio: number;
    bioWaitingReview: number;
    withPortrait: number;
    epochChecked: number;
    epochInAgreement: number;
  };
  works: {
    total: number;
    withTone: number;
    withYear: number;
    withInstrumentation: number;
    withMedia: number;
  };
}

export const getQualidade = () =>
  apiFetch<QualidadeDoAcervo>('/admin/catalog-quality', { cache: 'no-store' });
