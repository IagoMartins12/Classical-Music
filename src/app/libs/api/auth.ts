import { apiFetch, apiUrl } from './client';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: number;
  isTeacher: boolean;
  isStudent: boolean;
}

/** Os tokens ficam nos cookies; o corpo traz só a validade e quem é. */
export interface AuthResponse {
  expiresIn: number;
  user: AuthUser;
}

export interface MessageResponse {
  success: boolean;
  message: string;
  remainingAttempts?: number;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const token = (value: string) => encodeURIComponent(value);

/** `AuthModule` da API. Tudo aqui é público: nenhuma tentativa de renovar. */
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipRefresh: true,
    }),

  register: (input: RegisterInput) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: input,
      skipRefresh: true,
    }),

  logout: () =>
    apiFetch<void>('/auth/logout', { method: 'POST', skipRefresh: true }),

  forgotPassword: (email: string) =>
    apiFetch<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      skipRefresh: true,
    }),

  resetPassword: (input: {
    token: string;
    password: string;
    confirmPassword: string;
  }) =>
    apiFetch<MessageResponse>('/auth/reset-password', {
      method: 'POST',
      body: input,
      skipRefresh: true,
    }),

  confirmAccount: (value: string) =>
    apiFetch<MessageResponse & { alreadyConfirmed?: boolean }>(
      `/auth/confirm-account/${token(value)}`,
      { skipRefresh: true }
    ),

  confirmEmailChange: (value: string) =>
    apiFetch<MessageResponse & { oldEmail: string; newEmail: string }>(
      `/auth/confirm-email-change/${token(value)}`,
      { skipRefresh: true }
    ),

  /** Pelo e-mail (quem está logado) ou pelo token do link (mesmo vencido). */
  resendConfirmation: (by: { email: string } | { token: string }) =>
    apiFetch<MessageResponse>('/auth/resend-confirmation', {
      method: 'POST',
      body: by,
      skipRefresh: true,
    }),

  /**
   * Endereço que começa o login com o Google — para navegar, não para
   * `fetch`. A API manda ao Google e, na volta, grava a sessão e devolve o
   * navegador a `redirect` (ou com `?authError=`).
   */
  googleSignInUrl: (redirect: string) => apiUrl('/auth/google', { redirect }),
};
