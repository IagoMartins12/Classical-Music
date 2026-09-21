import {
  refreshSessionData,
  SESSION_QUERY_KEY,
} from '../session/session-client';
import { getQueryClient } from '../query-client';
import type { OnboardingData } from '@/app/stores/authStore';
import { authApi } from './auth';
import { catalogApi } from './catalog';
import { ApiError } from './client';
import { invitesApi } from './invites';
import { ProfileAccount, profileApi } from './profile';

/**
 * Adaptadores de formato da Etapa 2.
 *
 * As páginas de token e os modais foram escritos contra as API routes do Next,
 * que respondiam `{ success, error, errorCode, user… }`. Aqui a chamada vai à
 * API NestJS e a resposta volta no formato que a tela já sabe mostrar — a tela
 * não muda. Sai quando cada página for refeita contra a API (Etapas 3 a 6).
 *
 * O tipo de retorno é o mesmo do `response.json()` que estas funções
 * substituem: as páginas leem campos soltos do formato do legado.
 */
type LegacyJson = any;

export type TokenErrorCode =
  | 'EXPIRED_TOKEN'
  | 'USED_TOKEN'
  | 'INVALID_TOKEN'
  | 'EMAIL_TAKEN'
  | 'RATE_LIMITED'
  | 'CONNECTION_ERROR';

/** A API responde mensagem, não código; o código que a tela espera sai dela. */
export function tokenErrorCode(error: unknown): TokenErrorCode {
  if (!(error instanceof ApiError)) return 'CONNECTION_ERROR';
  if (error.status === 429) return 'RATE_LIMITED';

  const message = error.message.toLowerCase();

  if (message.includes('expirado') || message.includes('não vale mais')) {
    return 'EXPIRED_TOKEN';
  }
  if (message.includes('utilizado') || message.includes('já foi respondido')) {
    return 'USED_TOKEN';
  }
  if (error.status === 403 && message.includes('e-mail')) {
    return 'EMAIL_TAKEN';
  }

  return 'INVALID_TOKEN';
}

function failed(error: unknown): LegacyJson {
  const message =
    error instanceof ApiError
      ? error.message
      : 'Erro de conexão. Tente novamente.';

  return {
    success: false,
    error: message,
    message,
    errorCode: tokenErrorCode(error),
    rateLimited: error instanceof ApiError && error.status === 429,
  };
}

async function attempt(run: () => Promise<LegacyJson>): Promise<LegacyJson> {
  try {
    return await run();
  } catch (error) {
    return failed(error);
  }
}

/** O legado devolvia o usuário; a API não — quem está logado vem da sessão. */
function sessionUser() {
  const account = getQueryClient().getQueryData<ProfileAccount | null>(
    SESSION_QUERY_KEY
  );

  return account
    ? {
        firstName: account.firstName,
        email: account.email,
        onboardingCompleted: account.onboardingCompleted,
      }
    : undefined;
}

/** A resposta mudou algo da conta (e-mail confirmado, papel): relê a sessão. */
function afterAccountChange(): void {
  void refreshSessionData().catch(() => undefined);
}

export const legacyAuth = {
  confirmAccount: (token: string) =>
    attempt(async () => {
      const result = await authApi.confirmAccount(token);
      afterAccountChange();
      return {
        success: true,
        message: result.message,
        alreadyConfirmed: result.alreadyConfirmed ?? false,
        user: sessionUser(),
      };
    }),

  /** Reenvio pelo link — vencido ou não —, para quem não entrou. */
  resendAccountConfirmation: (token: string) =>
    attempt(async () => {
      const result = await authApi.resendConfirmation({ token });
      return { success: true, message: result.message };
    }),

  /** Reenvio pelo e-mail — o banner e a tela de verificação de quem entrou. */
  resendConfirmationByEmail: (email: string) =>
    attempt(async () => {
      const result = await authApi.resendConfirmation({ email });
      return { success: true, message: result.message };
    }),

  confirmEmailChange: (token: string) =>
    attempt(async () => {
      const result = await authApi.confirmEmailChange(token);
      return {
        success: true,
        message: result.message,
        data: { oldEmail: result.oldEmail, newEmail: result.newEmail },
      };
    }),

  /** A API não reenvia troca de e-mail pelo link: a troca se pede de novo. */
  resendEmailChange: async (): Promise<LegacyJson> => {
    const message =
      'Este link não pode ser reenviado. Peça a troca de e-mail de novo no seu perfil.';
    return { success: false, message, error: message };
  },

  forgotPassword: (email: string) =>
    attempt(async () => {
      const result = await authApi.forgotPassword(email);
      return {
        success: true,
        message: result.message,
        remainingAttempts: result.remainingAttempts,
      };
    }),

  resetPassword: (input: {
    token: string;
    password: string;
    confirmPassword: string;
  }) =>
    attempt(async () => {
      const result = await authApi.resetPassword(input);
      return { success: true, message: result.message };
    }),

  acceptTeacherInvite: (token: string) =>
    attempt(async () => {
      const result = await invitesApi.acceptTeacher(token);
      afterAccountChange();
      return { success: true, message: result.message, user: sessionUser() };
    }),

  declineTeacherInvite: (token: string) =>
    attempt(async () => {
      const result = await invitesApi.declineTeacher(token);
      afterAccountChange();
      return { success: true, message: result.message, user: sessionUser() };
    }),

  resendTeacherInvite: (token: string) =>
    attempt(async () => {
      const result = await invitesApi.resendTeacher(token);
      return { success: true, message: result.message };
    }),

  acceptStudentInvite: (token: string) =>
    attempt(async () => {
      const result = await invitesApi.acceptStudent(token);
      afterAccountChange();
      return {
        success: true,
        message: `Você agora é aluno de ${result.teacherName}.`,
        user: sessionUser(),
        teacher: { name: result.teacherName },
      };
    }),

  declineStudentInvite: (token: string) =>
    attempt(async () => {
      const result = await invitesApi.declineStudent(token);
      afterAccountChange();
      return {
        success: true,
        message: 'Convite recusado.',
        user: sessionUser(),
        teacher: { name: result.teacherName },
      };
    }),

  /** O aluno não reenvia o próprio convite pela API: quem reenvia é o professor. */
  resendStudentInvite: async (): Promise<LegacyJson> => {
    const message = 'Peça ao seu professor para reenviar o convite.';
    return { success: false, message, error: message };
  },
};

/** Os instrumentos que o onboarding do legado oferecia — o catálogo tem mais. */
const ONBOARDING_INSTRUMENTS = new Set([
  'Piano',
  'Violão',
  'Voz',
  'Clarinete',
  'Violino',
  'Violoncelo',
  'Flauta',
  'Clavicórdio',
  'Harpa',
  'Órgão',
  'Viola',
  'Saxophone',
  'Corneta',
  'Contrabaixo',
  'Trombete',
  'Teclado',
  'Banjo',
  'Trompa',
  'Oboé',
  'Vocal',
  'Alaúde',
  'Orquestra',
  'Soprano',
]);

/**
 * Compositores famosos e períodos como as server actions do legado
 * devolviam: compositores por nome, sem o período "Desconhecido".
 */
async function musicalOptions() {
  const [composers, epochs] = await Promise.all([
    catalogApi.famousComposers(),
    catalogApi.epochs(),
  ]);

  return {
    composers: composers
      .map((composer) => ({
        id: composer.id,
        name: composer.name,
        fullName: composer.fullName ?? composer.name,
        portraitUrl: composer.portraitUrl ?? null,
        epochName: composer.epochName ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    epochs: epochs.filter((epoch) => epoch.name !== 'Desconhecido'),
  };
}

/** Opções das preferências musicais do perfil — do catálogo público. */
export const legacyCatalog = { musicalOptions };

export const legacyOnboarding = {
  /** Dado de apoio do formulário — do catálogo público. */
  options: () =>
    attempt(async () => {
      const [instruments, { composers, epochs }] = await Promise.all([
        catalogApi.instruments(),
        musicalOptions(),
      ]);

      return {
        success: true,
        data: {
          instruments: instruments
            .filter((instrument) => ONBOARDING_INSTRUMENTS.has(instrument.name))
            .sort(
              (a, b) =>
                (a.category ?? '').localeCompare(b.category ?? '') ||
                a.name.localeCompare(b.name)
            ),
          composers,
          epochs,
        },
      };
    }),

  /**
   * Conclui o cadastro inicial. A localização chega como os objetos do
   * seletor; só o nome de cada nível é gravado. A foto não vai aqui: o passo
   * de perfil já a enviou.
   */
  complete: (data: OnboardingData) =>
    attempt(async () => {
      const { account } = await profileApi.completeOnboarding({
        account: {
          userType: data.userType,
          experienceLevel: data.experienceLevel,
          practiceTimePerWeek: data.practiceTimePerWeek,
          favoriteComposerId: data.favoriteComposerId,
          favoriteEpochId: data.favoriteEpochId,
          bio: data.bio,
          phone: data.phone,
          city: data.location?.city?.name,
          state: data.location?.state?.name,
          country: data.location?.country?.name,
        },
        instruments: data.instruments?.map((instrument) => ({
          instrumentId: instrument.id,
          level: instrument.level,
          isPrimary: instrument.isPrimary,
          isLearning: instrument.isLearning,
        })),
      });
      afterAccountChange();
      return { success: true, user: account };
    }),
};
