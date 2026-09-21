// app/actions/profile.ts — server actions do perfil, pela API (Etapa 3)
'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, apiFetch, type ApiRequest } from '@/app/libs/api/client';
import type { ProfileAccount, ProfileWriteBody } from '@/app/libs/api/profile';
import { getServerAccessToken } from '@/app/libs/api/server-session';
import type { ApiSchema } from '@/app/libs/api/types';

/*
 * As actions mantêm a assinatura do legado (as seções do perfil não mudaram),
 * mas quem diz de quem é a conta é o token do cookie: o `userId` que o
 * navegador passa é ignorado. No legado ele era confiado — qualquer um que
 * soubesse o id de outra pessoa alterava os dados dela, e `changePassword`
 * definia senha sem conferir nada para conta do Google.
 */

export interface ProfileResult {
  success: boolean;
  message: string | null;
  data?: any;
}

export interface CascadeInfoResult {
  success: boolean;
  message: string;
  data?: {
    totalItems: number;
    composersCount: number;
    worksCount: number;
    scoresCount: number;
    annotationsCount: number;
    favoritesCount: number;
    instrumentsCount: number;
    favoriteComposersCount: number;
    learnedWorksCount: number;
    wantToLearnCount: number;
    sampleComposers: { id: string; name: string; epochName?: string | null }[];
    sampleWorks: { id: string; title: string; composer: { name: string } }[];
    sampleAnnotations: { id: string; title: string; work: { title: string } }[];
  } | null;
}

export interface LoginMethodResult {
  success: boolean;
  message: string;
  data?: {
    hasPassword: boolean;
    hasSocialLogin: boolean;
    socialProviders: string[];
  };
}

type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type AccountView = { account: ProfileAccount };

/** Chamada à API em nome de quem está logado (token do cookie), sem cache. */
async function callApi<T>(path: string, request: ApiRequest = {}): Promise<T> {
  const token = await getServerAccessToken();

  if (!token) {
    throw new ApiError(401, 'Sua sessão expirou. Entre de novo.', null);
  }

  return apiFetch<T>(path, { ...request, token, cache: 'no-store' });
}

/** A mensagem da API quando ela explica o erro; senão, a do legado. */
function failure(
  error: unknown,
  fallback: string
): ProfileResult & {
  message: string;
} {
  console.error(fallback, error);
  return {
    success: false,
    message:
      error instanceof ApiError && error.message ? error.message : fallback,
  };
}

function patchProfile(body: ProfileWriteBody) {
  return callApi<AccountView>('/profile', { method: 'PATCH', body });
}

function getLoginInfo() {
  return callApi<AccountView>('/profile', { query: { include: 'account' } });
}

export async function checkUserLoginMethod(
  _userId: string
): Promise<LoginMethodResult> {
  try {
    const { account } = await getLoginInfo();
    const providers = account.login.providers;

    return {
      success: true,
      message: 'Método de login verificado com sucesso',
      data: {
        hasPassword: account.login.hasPassword,
        hasSocialLogin: providers.length > 0,
        socialProviders: providers,
      },
    };
  } catch (error) {
    return failure(error, 'Erro interno do servidor');
  }
}

// Conta do Google sem senha: a API define a primeira senha sem pedir a atual.
export async function changePassword(
  _userId: string,
  data: { currentPassword: string; newPassword: string }
): Promise<ProfileResult> {
  try {
    const { account } = await getLoginInfo();

    await callApi('/profile/password', {
      method: 'PATCH',
      body: {
        currentPassword: data.currentPassword ?? '',
        newPassword: data.newPassword,
      },
    });
    revalidatePath('/profile');

    return {
      success: true,
      message: account.login.hasPassword
        ? 'Senha alterada com sucesso!'
        : 'Senha definida com sucesso! Agora você pode fazer login com email e senha.',
    };
  } catch (error) {
    return failure(error, 'Erro interno do servidor. Tente novamente.');
  }
}

export async function requestEmailChange(
  _userId: string,
  data: { newEmail: string; currentPassword: string },
  _hostname?: string,
  _userAgent?: string
): Promise<ProfileResult> {
  try {
    const newEmail = data.newEmail.toLowerCase().trim();

    await callApi('/profile/email-change', {
      method: 'POST',
      body: { newEmail, currentPassword: data.currentPassword },
    });

    return {
      success: true,
      message: `Email de confirmação enviado para ${newEmail}. Verifique sua caixa de entrada.`,
      data: { newEmail, expiresIn: '24 horas' },
    };
  } catch (error) {
    return failure(error, 'Erro interno do servidor. Tente novamente.');
  }
}

export async function changeUserType(
  _userId: string,
  data: {
    userType: 'MUSIC_STUDENT' | 'CASUAL_USER' | 'PROFESSIONAL' | 'TEACHER';
  }
): Promise<ProfileResult> {
  try {
    const { account } = await patchProfile({
      account: { userType: data.userType },
    });
    revalidatePath('/profile');

    return {
      success: true,
      message: 'Tipo de conta alterado com sucesso!',
      data: { userType: account.userType },
    };
  } catch (error) {
    return failure(error, 'Erro interno do servidor. Tente novamente.');
  }
}

export async function getAccountCascadeInfo(
  _userId: string
): Promise<CascadeInfoResult> {
  try {
    const data = await callApi<ApiSchema<'AccountCascadeInfoDto'>>(
      '/profile/cascade-info'
    );

    return {
      success: true,
      message: 'Informações carregadas com sucesso',
      data: {
        ...data,
        // No contrato, compositor e obra das amostras vêm sem tipo próprio.
        sampleWorks: data.sampleWorks.map((work) => ({
          ...work,
          composer: { name: work.composer.name ?? '' },
        })),
        sampleAnnotations: data.sampleAnnotations.map((annotation) => ({
          ...annotation,
          work: { title: annotation.work.title ?? '' },
        })),
      },
    };
  } catch (error) {
    return failure(error, 'Erro ao carregar informações da conta');
  }
}

/**
 * A API exige a senha atual de quem tem senha. A saída da sessão é do
 * chamador (`useAccountManagement` chama `signOut`).
 */
export async function deleteUserAccount(
  _userId: string,
  _hostname?: string,
  _userAgent?: string,
  currentPassword?: string
): Promise<ProfileResult> {
  try {
    const data = await callApi<ApiSchema<'DeleteAccountResponseDto'>>(
      '/profile',
      { method: 'DELETE', body: currentPassword ? { currentPassword } : {} }
    );

    return { success: true, message: null, data };
  } catch (error) {
    return failure(error, 'Erro ao deletar conta. Tente novamente.');
  }
}

export async function getUserInstruments(
  _userId: string
): Promise<ProfileResult> {
  try {
    const { instruments } = await callApi<{
      instruments: ApiSchema<'UserInstrumentDto'>[];
    }>('/profile', { query: { include: 'instruments' } });

    return {
      success: true,
      message: 'Instrumentos carregados com sucesso!',
      data: instruments,
    };
  } catch (error) {
    return failure(error, 'Erro ao carregar instrumentos.');
  }
}

export async function getAvailableInstruments(): Promise<ProfileResult> {
  try {
    const instruments = await apiFetch<ApiSchema<'InstrumentItemDto'>[]>(
      '/instruments',
      { next: { revalidate: 21600, tags: ['instruments'] } }
    );

    // Por categoria e nome, como o legado.
    const sorted = instruments
      .map(({ id, name, category }) => ({
        id,
        name,
        category: category ?? null,
      }))
      .sort(
        (a, b) =>
          (a.category ?? '').localeCompare(b.category ?? '') ||
          a.name.localeCompare(b.name)
      );

    return {
      success: true,
      message: 'Instrumentos disponíveis carregados!',
      data: sorted,
    };
  } catch (error) {
    return failure(error, 'Erro ao carregar instrumentos disponíveis.');
  }
}

// A foto não passa por aqui: quem sobe a imagem já a grava na conta.
export async function updatePersonalInfo(
  _userId: string,
  data: {
    firstName: string;
    lastName: string;
    image?: string;
    bio?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    phoneCountryCode?: string;
    phoneNumber?: string;
  }
): Promise<ProfileResult> {
  try {
    const { account } = await patchProfile({
      account: {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        country: data.country ?? '',
        // Como no legado, telefone vazio não apaga o que está gravado.
        ...(data.phone ? { phone: data.phone } : {}),
      },
    });
    revalidatePath('/profile');

    return {
      success: true,
      message: 'Informações pessoais atualizadas com sucesso!',
      data: {
        id: account.id,
        firstName: account.firstName,
        lastName: account.lastName,
        bio: account.bio,
        city: account.city,
        state: account.state,
        country: account.country,
        phone: account.phone,
        phoneCountryCode: account.phoneCountryCode,
        phoneNumber: account.phoneNumber,
      },
    };
  } catch (error) {
    return failure(error, 'Erro ao atualizar informações. Tente novamente.');
  }
}

export async function updateMusicalPreferences(
  _userId: string,
  data: {
    favoriteComposerId?: string;
    favoriteEpochId?: string;
    experienceLevel?: Level;
    practiceTimePerWeek?: number;
  }
): Promise<ProfileResult> {
  try {
    const { account } = await patchProfile({
      account: {
        favoriteComposerId: data.favoriteComposerId || null,
        favoriteEpochId: data.favoriteEpochId || null,
        ...(data.experienceLevel
          ? { experienceLevel: data.experienceLevel }
          : {}),
        practiceTimePerWeek: data.practiceTimePerWeek || null,
      },
    });
    revalidatePath('/profile');

    return {
      success: true,
      message: 'Preferências musicais atualizadas com sucesso!',
      data: {
        id: account.id,
        favoriteComposerId: account.favoriteComposerId,
        favoriteEpochId: account.favoriteEpochId,
        experienceLevel: account.experienceLevel,
        practiceTimePerWeek: account.practiceTimePerWeek,
      },
    };
  } catch (error) {
    return failure(error, 'Erro ao atualizar preferências. Tente novamente.');
  }
}

export async function updateUserInstruments(
  _userId: string,
  instruments: Array<{
    instrumentId: string;
    level: Level;
    isPrimary: boolean;
    isLearning: boolean;
  }>
): Promise<ProfileResult> {
  if (instruments.filter((inst) => inst.isPrimary).length > 1) {
    return {
      success: false,
      message: 'Apenas um instrumento pode ser marcado como principal.',
    };
  }

  try {
    await patchProfile({
      instruments: instruments.map(
        ({ instrumentId, level, isPrimary, isLearning }) => ({
          instrumentId,
          level,
          isPrimary,
          isLearning,
        })
      ),
    });
    revalidatePath('/profile');

    return { success: true, message: 'Instrumentos atualizados com sucesso!' };
  } catch (error) {
    return failure(error, 'Erro ao atualizar instrumentos. Tente novamente.');
  }
}

export async function updatePrivacySettings(
  _userId: string,
  data: {
    profilePublic: boolean;
    showLocation: boolean;
  }
): Promise<ProfileResult> {
  try {
    const { account } = await patchProfile({
      account: {
        profilePublic: data.profilePublic,
        showLocation: data.showLocation,
      },
    });
    revalidatePath('/profile');

    return {
      success: true,
      message: 'Configurações de privacidade atualizadas!',
      data: {
        id: account.id,
        profilePublic: account.profilePublic,
        showLocation: account.showLocation,
      },
    };
  } catch (error) {
    return failure(error, 'Erro ao atualizar configurações. Tente novamente.');
  }
}
