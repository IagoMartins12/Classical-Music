'use client';

import { create } from 'zustand';
import { useAuthStore } from '@/app/stores/authStore';
import { useAnnotationsStore } from '@/app/stores/useAnnotationsStore';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { useLearningModalStore } from '@/app/stores/useLearningModalStore';
import { useLearningStore } from '@/app/stores/useLearningStore';

/**
 * The data of one account that the browser keeps between visits: studies,
 * favorites, annotations and the draft of the welcome questions (stores
 * persisted in `localStorage`, and the drafts' backups).
 *
 * **Never another account's.** Those stores load from `localStorage` before
 * anyone knows who is signed in. Without an owner, whoever signed in next on
 * the same browser saw the studies of the account before (found on
 * 25/10/2026). So:
 *
 * - the browser notes whose data it keeps (`CHAVE_DONO`);
 * - when the session says who is signed in, a different account, or none,
 *   empties the stores and their `localStorage` copies (`garantirDono`);
 * - until then, `useDadosDaConta` is false and nothing that comes from those
 *   stores is shown.
 */
const CHAVE_DONO = 'opus-atlas:dono-dos-dados';
const GUARDADOS = [
  'learning-storage',
  'favorites-storage',
  'annotations-storage',
];

const useDono = create<{ confirmado: boolean }>(() => ({ confirmado: false }));

/** True once the stored data is known to be the signed-in account's. */
export const useDadosDaConta = () => useDono((s) => s.confirmado);

/** Empties everything the browser keeps for an account. */
export function limparDadosDaConta() {
  useLearningStore.getState().reset();
  useFavoritesStore.getState().reset();
  useAnnotationsStore.getState().reset();
  useLearningModalStore.getState().reset();
  useAuthStore.getState().resetOnboardingData();
  try {
    for (const chave of GUARDADOS) localStorage.removeItem(chave);
    for (const chave of Object.keys(localStorage))
      if (chave.startsWith('onboarding-backup-'))
        localStorage.removeItem(chave);
    localStorage.removeItem(CHAVE_DONO);
  } catch {
    // No storage (private mode): the stores above are already empty.
  }
}

/**
 * The session answered: `id` is the account signed in, or `null` for none.
 * Data kept for anyone else is erased before it can be shown. Returns
 * whether it belonged to another account, so the caller also drops what it
 * keeps in memory (the API answers' cache).
 */
export function garantirDono(id: string | null): boolean {
  let anterior: string | null = null;
  try {
    anterior = localStorage.getItem(CHAVE_DONO);
  } catch {
    anterior = null;
  }
  if (anterior !== id) {
    limparDadosDaConta();
    try {
      if (id) localStorage.setItem(CHAVE_DONO, id);
    } catch {
      // Without storage nothing persists, so nothing can leak either.
    }
  }
  useDono.setState({ confirmado: id !== null });
  return anterior !== null && anterior !== id;
}

/** Signing out: nothing of the account stays, and nothing shows. */
export function esquecerConta() {
  useDono.setState({ confirmado: false });
  limparDadosDaConta();
}
