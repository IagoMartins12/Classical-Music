'use client';

import { CACHES_PESSOAIS } from './caches';

const CHAVE_CONTA = 'opus-atlas:conta-do-cache';

/**
 * Empties what belongs to one account: personal and portal pages, personal
 * API answers. Called on logout and when another account signs in on the
 * same device, so nobody opens someone else's studies offline. Scores saved
 * on the device stay: they are public files the person chose to keep.
 */
export async function limparCachesPessoais() {
  if (typeof caches === 'undefined') return;
  await Promise.all(CACHES_PESSOAIS.map((nome) => caches.delete(nome)));
}

/** Remembers whose data is cached; a different account clears it first. */
export async function lembrarConta(id: string | null) {
  try {
    const anterior = localStorage.getItem(CHAVE_CONTA);
    if (anterior && anterior !== id) await limparCachesPessoais();
    if (id) localStorage.setItem(CHAVE_CONTA, id);
    else localStorage.removeItem(CHAVE_CONTA);
  } catch {
    await limparCachesPessoais();
  }
}
