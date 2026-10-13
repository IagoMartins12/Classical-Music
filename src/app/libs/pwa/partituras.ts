'use client';

import { CACHE_PARTITURAS, ROTA_PARTITURA_OFFLINE } from './caches';

/** A score file kept on the device, as the "No aparelho" page lists it. */
export interface PartituraGuardada {
  /** The file's original address (IMSLP, Cloudinary). */
  url: string;
  titulo: string;
  obra?: string;
  compositor?: string;
  /** Where to go back to it online. */
  pagina?: string;
  bytes: number;
  guardadaEm: string;
}

const CHAVE = 'opus-atlas:partituras-no-aparelho';
const EVENTO = 'opus:partituras';

/** The same-origin address the app saves and opens offline. */
export const enderecoOffline = (url: string) =>
  `${ROTA_PARTITURA_OFFLINE}?url=${encodeURIComponent(url)}`;

export function listarPartituras(): PartituraGuardada[] {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE) ?? '[]');
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function gravar(lista: PartituraGuardada[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    // Storage full or blocked: the file stays in the cache, unlisted.
  }
  window.dispatchEvent(new Event(EVENTO));
}

export const estaGuardada = (url: string) =>
  listarPartituras().some((p) => p.url === url);

/**
 * Downloads the file through `/score-file` and keeps it in its own cache,
 * which the service worker never evicts. Asks the browser to keep the
 * site's storage (so the system does not clear it under pressure).
 */
export async function guardarPartitura(
  dados: Omit<PartituraGuardada, 'bytes' | 'guardadaEm'>
): Promise<PartituraGuardada> {
  const endereco = enderecoOffline(dados.url);
  const resposta = await fetch(endereco);
  if (!resposta.ok) throw new Error(String(resposta.status));
  const blob = await resposta.clone().blob();
  const cache = await caches.open(CACHE_PARTITURAS);
  await cache.put(endereco, resposta);
  await navigator.storage?.persist?.().catch(() => false);
  const item: PartituraGuardada = {
    ...dados,
    bytes: blob.size,
    guardadaEm: new Date().toISOString(),
  };
  gravar([item, ...listarPartituras().filter((p) => p.url !== dados.url)]);
  return item;
}

export async function removerPartitura(url: string) {
  const cache = await caches.open(CACHE_PARTITURAS);
  await cache.delete(enderecoOffline(url));
  gravar(listarPartituras().filter((p) => p.url !== url));
}

/** Re-renders a component when the saved list changes (any tab). */
export function aoMudarPartituras(callback: () => void) {
  const aoArmazenar = (e: StorageEvent) => e.key === CHAVE && callback();
  window.addEventListener(EVENTO, callback);
  window.addEventListener('storage', aoArmazenar);
  return () => {
    window.removeEventListener(EVENTO, callback);
    window.removeEventListener('storage', aoArmazenar);
  };
}
