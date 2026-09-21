import { apiFetch } from './client';

export interface InstrumentItem {
  id: string;
  name: string;
  category: string | null;
}

export interface ComposerItem {
  id: string;
  name: string;
  fullName: string | null;
  portraitUrl: string | null;
  epochName?: string | null;
}

export interface EpochItem {
  id: string;
  name: string;
}

/** Leituras públicas do catálogo usadas fora das páginas do catálogo. */
export const catalogApi = {
  instruments: () =>
    apiFetch<InstrumentItem[]>('/instruments', { skipRefresh: true }),
  famousComposers: () =>
    apiFetch<ComposerItem[]>('/composers/famous', { skipRefresh: true }),
  epochs: () => apiFetch<EpochItem[]>('/epochs', { skipRefresh: true }),
};
