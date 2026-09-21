/**
 * Cliente da API NestJS no navegador.
 *
 * Um caminho só para toda chamada: base da URL, cookies da sessão
 * (`credentials: 'include'`), JSON e erro tipado — e o "401 → renova →
 * repete", uma vez, com uma renovação só em andamento mesmo que várias
 * chamadas falhem juntas. Os tokens nunca passam por aqui: vivem nos cookies
 * `httpOnly` da API, que o navegador manda sozinho.
 *
 * É `fetch`, não axios, de propósito: é o mesmo `fetch` que o servidor do Next
 * usa com cache e revalidação por tag.
 */

const IS_SERVER = typeof window === 'undefined';

/**
 * No servidor do Next vale `NEST_API_URL` primeiro (endereço interno, quando
 * houver); o navegador só enxerga `NEXT_PUBLIC_API_URL`.
 */
export const API_BASE_URL = normalizeBase(
  (IS_SERVER ? process.env.NEST_API_URL : undefined) ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:4000/api'
);

/** Disparado quando a sessão venceu de vez (a renovação também falhou). */
export const SESSION_EXPIRED_EVENT = 'opus:session-expired';

type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequest {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  /** Não tentar renovar em 401 — as rotas de sessão e as públicas. */
  skipRefresh?: boolean;
  /** Cache do `fetch` do Next — só tem efeito no servidor. */
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
  /**
   * Token de acesso, para o servidor do Next chamar em nome de quem está
   * logado (ele não tem os cookies do navegador). Vai como `Bearer`.
   */
  token?: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function normalizeBase(url: string): string {
  const trimmed = url.trim().replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

export function apiUrl(
  path: string,
  query?: Record<string, QueryValue>
): string {
  const url = new URL(
    `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  );

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

let refreshing: Promise<boolean> | null = null;

/** Renova a sessão pelo cookie de renovação. Uma renovação por vez. */
export function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(apiUrl('/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
}

export async function apiFetch<T = unknown>(
  path: string,
  request: ApiRequest = {}
): Promise<T> {
  const response = await send(path, request);

  // No servidor não há cookie de renovação para usar: a página que chamou
  // decide o que fazer com o 401.
  if (response.status === 401 && !request.skipRefresh && !IS_SERVER) {
    if (await refreshSession()) {
      return parse<T>(await send(path, request));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
  }

  return parse<T>(response);
}

function send(
  path: string,
  { method = 'GET', body, query, signal, cache, next, token }: ApiRequest
): Promise<Response> {
  // Arquivo (envio de imagem, partitura): o navegador monta o multipart.
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  return fetch(apiUrl(path, query), {
    method,
    signal,
    cache,
    next,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined || isForm
        ? {}
        : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
}

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data: unknown = text ? safeJson(text) : undefined;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      messageOf(data) ?? `Erro ${response.status}`,
      data
    );
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** A API responde erro como `{ statusCode, error, message }`. */
function messageOf(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || !('message' in data)) {
    return undefined;
  }

  const { message } = data as { message: unknown };

  if (Array.isArray(message)) {
    return message.join(' ');
  }

  return typeof message === 'string' ? message : undefined;
}
