// app/requests/portal/server.ts — ponte das páginas servidoras do portal (Etapa 4)
//
// Só para código de servidor: lê o token do cookie da requisição. Sem sessão ou
// com erro da API, devolve `null`, que é o que as páginas do legado já tratam.
import { ApiError } from '@/app/libs/api/client';
import { getServerAccessToken } from '@/app/libs/api/server-session';

export async function withServerToken<T>(
  label: string,
  load: (token: string) => Promise<T>
): Promise<T | null> {
  const token = await getServerAccessToken();

  if (!token) {
    return null;
  }

  try {
    return await load(token);
  } catch (error) {
    console.error(
      `❌ [${label}]`,
      error instanceof ApiError
        ? `${error.status} ${error.message}`
        : error instanceof Error
          ? error.message
          : error
    );
    return null;
  }
}

/** Mensagem legível de um erro da API, para as respostas `{ success, error }`. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
