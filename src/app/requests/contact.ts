/**
 * Formulário de contato pela API (`POST /contact`), chamado do navegador.
 *
 * Devolve o formato que o `useContactForm` já lia do legado
 * (`{ success, message, error?, ticketId? }`).
 */
import { ApiError, apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

// O gerador marca como obrigatório o campo que tem `default` no Swagger; a API
// aceita o `subscribeNewsletter` ausente.
type SubmitContactBody = Omit<
  ApiSchema<'SubmitContactDto'>,
  'subscribeNewsletter'
> & { subscribeNewsletter?: boolean };
type ContactResponse = ApiSchema<'ContactResponseDto'>;

export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  subscribeNewsletter?: boolean;
  sourceUrl?: string;
  userAgent?: string;
}

export interface ContactFormResult {
  success: boolean;
  message: string;
  error?: string;
  ticketId?: string;
}

/** Erro de conexão sobe como exceção; erro da API vira `error`, como no legado. */
export async function submitContact(
  input: ContactFormInput
): Promise<ContactFormResult> {
  // A API recusa campo que não conhece: o `userAgent` sai, porque ela o lê do
  // cabeçalho da requisição (o legado também preferia o cabeçalho).
  const body: SubmitContactBody = {
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
    category: input.category as SubmitContactBody['category'],
    priority: input.priority as SubmitContactBody['priority'],
    subscribeNewsletter: input.subscribeNewsletter,
    sourceUrl: input.sourceUrl,
  };

  try {
    return await apiFetch<ContactResponse>('/contact', {
      method: 'POST',
      body,
      skipRefresh: true,
    });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    return { success: false, message: '', error: contactErrorMessage(error) };
  }
}

function contactErrorMessage(error: ApiError): string {
  if (error.status === 400) {
    return 'Dados inválidos';
  }

  // A API limita a 3 mensagens por minuto; o legado não tinha limite.
  if (error.status === 429) {
    return 'Muitas mensagens em pouco tempo. Tente novamente em um minuto.';
  }

  return 'Erro interno do servidor. Tente novamente mais tarde.';
}
