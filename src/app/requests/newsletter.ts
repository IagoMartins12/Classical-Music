/**
 * Newsletter pela API (`/newsletter/*`), chamada do navegador.
 *
 * Devolve o formato que o `useNewsletterSubscription` e a página de
 * descadastro já liam do legado.
 */
import { ApiError, apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

type NewsletterAction = ApiSchema<'NewsletterActionResponseDto'>;
// O gerador marca como obrigatório o campo que tem `default` no Swagger; a API
// aceita a `frequency` ausente (vale `weekly`).
type SubscribeBody = Omit<ApiSchema<'SubscribeNewsletterDto'>, 'frequency'> & {
  frequency?: NewsletterSubscribeInput['frequency'];
};

export interface NewsletterSubscribeInput {
  email: string;
  firstName?: string;
  lastName?: string;
  interests?: string[];
  experienceLevel?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  sourceUrl?: string;
  utmSource?: string;
}

export interface NewsletterActionResult {
  success: boolean;
  message: string;
  status?: string;
  error?: string;
  errorCode?: string;
  canResendConfirmation?: boolean;
}

export type UnsubscribeResult = { ok: true } | { ok: false; error: string };

// O legado dizia o motivo da recusa em `errorCode`; a API devolve o `status`
// da inscrição que já existe.
const ERROR_CODE_BY_STATUS: Record<string, string> = {
  ACTIVE: 'ALREADY_SUBSCRIBED',
  PENDING: 'PENDING_CONFIRMATION',
  BOUNCED: 'EMAIL_BOUNCED',
  BLOCKED: 'EMAIL_BLOCKED',
};

/** Erro de conexão sobe como exceção; erro da API vira `error`, como no legado. */
export async function subscribeToNewsletter(
  input: NewsletterSubscribeInput
): Promise<NewsletterActionResult> {
  // A API recusa campo que não conhece; `experienceLevel` não existe nela (o
  // legado também não o gravava).
  const body: SubscribeBody = {
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    interests: input.interests,
    frequency: input.frequency,
    sourceUrl: input.sourceUrl,
    utmSource: input.utmSource,
  };

  try {
    const result = await apiFetch<NewsletterAction>('/newsletter/subscribe', {
      method: 'POST',
      body,
      skipRefresh: true,
    });

    if (result.success) {
      return result;
    }

    return {
      ...result,
      error: result.message,
      errorCode: ERROR_CODE_BY_STATUS[result.status ?? ''] ?? 'UNKNOWN_STATUS',
      canResendConfirmation: result.status === 'PENDING',
    };
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    return {
      success: false,
      message: '',
      error: apiErrorMessage(
        error,
        'Email inválido',
        'Erro interno. Tente novamente.'
      ),
    };
  }
}

export async function resendNewsletterConfirmation(
  email: string
): Promise<NewsletterActionResult> {
  try {
    const result = await apiFetch<NewsletterAction>('/newsletter/subscribe', {
      method: 'PUT',
      body: { email: email.trim() },
      skipRefresh: true,
    });

    return result.success ? result : { ...result, error: result.message };
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    return {
      success: false,
      message: '',
      error: apiErrorMessage(error, 'Email inválido', 'Erro ao reenviar email'),
    };
  }
}

export async function unsubscribeFromNewsletter(input: {
  token: string;
  reason?: string;
  feedback?: string;
}): Promise<UnsubscribeResult> {
  try {
    const result = await apiFetch<NewsletterAction>('/newsletter/unsubscribe', {
      method: 'POST',
      body: input,
      skipRefresh: true,
    });

    // Já cancelada conta como feito: o legado respondia 200 e a página
    // mostrava a conclusão.
    if (result.success || result.status === 'UNSUBSCRIBED') {
      return { ok: true };
    }

    // Token inválido, vencido ou já usado: no legado era 400, com a mensagem.
    return { ok: false, error: result.message };
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    return {
      ok: false,
      error: apiErrorMessage(
        error,
        'Dados inválidos',
        'Erro interno do servidor'
      ),
    };
  }
}

function apiErrorMessage(
  error: ApiError,
  invalidMessage: string,
  fallbackMessage: string
): string {
  if (error.status === 400) {
    return invalidMessage;
  }

  // As mensagens de "não encontrado" da API já vêm em português.
  if (error.status === 404) {
    return error.message;
  }

  // A API limita as rotas públicas da newsletter; o legado não tinha limite.
  if (error.status === 429) {
    return 'Muitas tentativas em pouco tempo. Tente novamente em um minuto.';
  }

  return fallbackMessage;
}
