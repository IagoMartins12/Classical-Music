// app/requests/composer-biography.ts — biografia de compositor, pela API
//
// A da página do compositor (gravada ou, faltando, gerada e gravada pela
// API), o rascunho do cadastro (gera sem gravar: vai junto com o compositor)
// e a tradução do texto do formulário. No legado a versão em inglês ficava
// num JSON dentro do front; na API é o campo `bioEn` do compositor.
import { apiFetch } from '@/app/libs/api/client';

export type BioLanguage = 'pt' | 'en';

export type BiographyResult =
  | {
      biography: string;
      language: BioLanguage;
      source: 'database' | 'generated' | 'translated';
      generatedBy: string | null;
    }
  | {
      biography: null;
      language: BioLanguage;
      /** `unavailable`: a IA não conhece o compositor. `generating`: pergunte de novo em `retryAfter` s. */
      status: 'unavailable' | 'generating';
      retryAfter?: number;
    };

export function composerBiography(
  composerId: string,
  language: BioLanguage,
  signal?: AbortSignal
) {
  return apiFetch<BiographyResult>(`/composers/${composerId}/biography`, {
    method: 'POST',
    body: { language },
    signal,
  });
}

export interface BiographyDraftInput {
  name: string;
  fullName?: string;
  alternativeNames?: string;
  birthDate?: string;
  deathDate?: string;
  epochName?: string;
  roleName?: string;
  nationality?: string;
  instruments?: string;
}

/** Rascunho para o cadastro — nada é gravado até salvar o compositor. */
export function draftComposerBiography(
  input: BiographyDraftInput,
  language: BioLanguage
) {
  const body: Record<string, string> = { language };

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string' && value.trim()) {
      body[key] = value.trim();
    }
  }

  return apiFetch<BiographyResult>('/composers/biography/draft', {
    method: 'POST',
    body,
  });
}

/** Traduz do português para o inglês (a única direção que a API faz). */
export async function translateBiographyText(portuguese: string) {
  const result = await apiFetch<{ translatedText: string }>(
    '/composers/biography/translate',
    { method: 'POST', body: { text: portuguese } }
  );

  return result.translatedText;
}

/** As duas biografias gravadas do compositor, para a edição. */
export async function loadComposerBiographies(composerId: string) {
  const composer = await apiFetch<{
    bio?: string | null;
    bioEn?: string | null;
  }>(`/composers/${composerId}`, { cache: 'no-store' });

  return { pt: composer.bio ?? '', en: composer.bioEn ?? '' };
}
