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

/**
 * Whose data this tab holds in memory. `undefined` until the session first
 * answers: the stores then hold what `localStorage` had, owned by
 * `CHAVE_DONO`. Kept apart from `localStorage` because another tab may have
 * changed the owner there while this one still holds the old account's.
 */
let donoDaMemoria: string | null | undefined;

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
  let guardado: string | null = null;
  try {
    guardado = localStorage.getItem(CHAVE_DONO);
  } catch {
    guardado = null;
  }
  // The memory's owner when known, else the stored one (what the stores
  // loaded from). Either differing from the account signed in clears.
  const anterior = donoDaMemoria === undefined ? guardado : donoDaMemoria;
  donoDaMemoria = id;
  if (anterior !== id || guardado !== id) limparDadosDaConta();
  // Written only when it changes: other tabs listen to this key
  // (`ouvirOutrasAbas`), and removing and rewriting the same owner would set
  // them clearing each other back and forth.
  if (guardado !== id) {
    try {
      if (id) localStorage.setItem(CHAVE_DONO, id);
      else localStorage.removeItem(CHAVE_DONO);
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
  donoDaMemoria = null;
  limparDadosDaConta();
  try {
    localStorage.removeItem(CHAVE_DONO);
  } catch {
    // Without storage there is no owner to forget.
  }
}

/**
 * Another tab signed out or in with another account: this tab drops what it
 * holds in memory and hides it at once, then `aoMudar` asks the session
 * again (which calls `garantirDono` for whoever is signed in now). Returns
 * the cleanup.
 */
export function ouvirOutrasAbas(aoMudar: () => void) {
  const aoGuardar = (evento: StorageEvent) => {
    // `null` key: the other tab cleared all of `localStorage`.
    if (evento.key !== CHAVE_DONO && evento.key !== null) return;
    if (evento.key === CHAVE_DONO && evento.newValue === donoDaMemoria) return;
    useDono.setState({ confirmado: false });
    useLearningStore.getState().reset();
    useFavoritesStore.getState().reset();
    useAnnotationsStore.getState().reset();
    useLearningModalStore.getState().reset();
    donoDaMemoria = null;
    aoMudar();
  };
  window.addEventListener('storage', aoGuardar);
  return () => window.removeEventListener('storage', aoGuardar);
}
