/** Conta, pelo navegador: presença (heartbeat) e foto do perfil no onboarding. */
import { ApiError, apiFetch, apiUrl } from '@/app/libs/api/client';

/**
 * A API quer o horário em milissegundos e sabe quem é pelo token (o legado
 * recebia `userId` e a data em texto no corpo).
 */
export function sendHeartbeat() {
  return apiFetch('/profile/heartbeat', {
    method: 'POST',
    body: { timestamp: Date.now() },
  });
}

/**
 * Ao fechar a página. `keepalive` deixa o pedido terminar com a aba já
 * fechando, como o `sendBeacon` do legado; falha aqui não tem a quem avisar.
 */
export function sendExitHeartbeat() {
  void fetch(apiUrl('/profile/heartbeat'), {
    method: 'POST',
    keepalive: true,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timestamp: Date.now(), type: 'beforeunload' }),
  }).catch(() => undefined);
}

/** Foto do perfil (`POST /profile/avatar`), no formato que o onboarding lia (`success`, `imageUrl`, `message`). */
export async function uploadAvatarRequest(file: File) {
  const form = new FormData();
  form.append('file', file);

  try {
    const { imageUrl } = await apiFetch<{ imageUrl: string }>(
      '/profile/avatar',
      { method: 'POST', body: form }
    );

    return { success: true, imageUrl, message: '' };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, imageUrl: '', message: error.message };
    }

    throw error;
  }
}
