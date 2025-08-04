// app/actions/profile.ts - VERSÃO ATUALIZADA com verificação de login social
'use server';

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/app/libs/prismadb';
import { revalidatePath } from 'next/cache';
import { OnboardingData } from '../stores/authStore';
import {
  createToken,
  logSecurityEvent,
  checkTokenRateLimit,
  createTokenUrl,
} from '@/app/libs/tokenUtils';
import { headers } from 'next/headers';
import { sendTemplateEmail } from '../libs/newsletter/email';

// Validation schemas existentes...
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
});

const emailChangeSchema = z.object({
  newEmail: z.string().email('Email inválido'),
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
});

const userTypeSchema = z.object({
  userType: z.enum(['MUSIC_STUDENT', 'CASUAL_USER', 'PROFESSIONAL', 'TEACHER']),
});

// Validation schemas existentes
const updatePersonalInfoSchema = z.object({
  firstName: z.string().max(50),
  lastName: z.string().max(50),
  image: z.string().optional(),
  bio: z.string().max(500).optional(),

  // 🆕 Campos de localização
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),

  // 🆕 Campos de telefone
  phone: z.string().optional(),
  phoneCountryCode: z.string().max(5).optional(),
  phoneNumber: z.string().optional(),
});

const updateLocationSchema = z.object({
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

const updateMusicalPreferencesSchema = z.object({
  favoriteComposerId: z.string().optional(),
  favoriteEpochId: z.string().optional(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  practiceTimePerWeek: z.number().min(0).max(9999).optional(),
});

const updatePrivacySettingsSchema = z.object({
  profilePublic: z.boolean(),
  showLocation: z.boolean(),
});

const userInstrumentSchema = z.object({
  instrumentId: z.string(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  isPrimary: z.boolean(),
  isLearning: z.boolean(),
});

// 🆕 NEW SCHEMAS

// Types
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

// 🆕 NOVA INTERFACE: Para informações do método de login
export interface LoginMethodResult {
  success: boolean;
  message: string;
  data?: {
    hasPassword: boolean;
    hasSocialLogin: boolean;
    socialProviders: string[];
  };
}

function parsePhoneNumber(phone: string) {
  if (!phone || !phone.startsWith('+')) {
    return { phoneCountryCode: null, phoneNumber: null };
  }

  // Regex para extrair código do país (1-4 dígitos após o +)
  const phoneRegex = /^\+(\d{1,4})(.*)$/;
  const match = phone.match(phoneRegex);

  if (!match) {
    return { phoneCountryCode: null, phoneNumber: null };
  }

  const countryCode = match[1];
  const number = match[2];

  // Mapear códigos numéricos para códigos de país (exemplos principais)
  const countryCodeMap: Record<string, string> = {
    '1': 'US', // Estados Unidos/Canadá
    '55': 'BR', // Brasil
    '44': 'GB', // Reino Unido
    '33': 'FR', // França
    '49': 'DE', // Alemanha
    '39': 'IT', // Itália
    '34': 'ES', // Espanha
    '7': 'RU', // Rússia
    '81': 'JP', // Japão
    '86': 'CN', // China
    '91': 'IN', // Índia
    '61': 'AU', // Austrália
    '52': 'MX', // México
    '54': 'AR', // Argentina
    '56': 'CL', // Chile
    '57': 'CO', // Colômbia
  };

  return {
    phoneCountryCode: countryCodeMap[countryCode] || null,
    phoneNumber: number.replace(/\D/g, ''), // Remove caracteres não numéricos
  };
}
// 🆕 NOVA ACTION: Verificar método de login do usuário
export async function checkUserLoginMethod(
  userId: string
): Promise<LoginMethodResult> {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'ID do usuário é obrigatório',
      };
    }

    // Buscar usuário e suas contas
    const userWithAccounts = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        hashedPassword: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!userWithAccounts) {
      return {
        success: false,
        message: 'Usuário não encontrado',
      };
    }

    const hasPassword = !!userWithAccounts.hashedPassword;
    const hasSocialLogin = userWithAccounts.accounts.length > 0;
    const socialProviders = userWithAccounts.accounts.map(
      (account) => account.provider
    );

    return {
      success: true,
      message: 'Método de login verificado com sucesso',
      data: {
        hasPassword,
        hasSocialLogin,
        socialProviders,
      },
    };
  } catch (error) {
    console.error('Erro ao verificar método de login:', error);
    return {
      success: false,
      message: 'Erro interno do servidor',
    };
  }
}

// Change user password
export async function changePassword(
  userId: string,
  data: { currentPassword: string; newPassword: string }
): Promise<ProfileResult> {
  try {
    // Validate input
    const validatedData = changePasswordSchema.parse(data);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        hashedPassword: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado.',
      };
    }

    // 🆕 NOVO: Se não tem senha, criar nova (caso de login social)
    if (!user.hashedPassword) {
      // Para usuários de login social que querem definir uma senha
      console.log('🔐 Definindo primeira senha para usuário social');

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(
        validatedData.newPassword,
        saltRounds
      );

      await prisma.user.update({
        where: { id: userId },
        data: { hashedPassword },
      });

      // Log da criação de senha
      const headersList = await headers();
      logSecurityEvent('PASSWORD_CREATED_SOCIAL_USER', userId, {
        email: user.email || 'unknown',
        ip: headersList.get('x-forwarded-for') || 'unknown',
        userAgent: headersList.get('user-agent') || 'unknown',
      });

      return {
        success: true,
        message:
          'Senha definida com sucesso! Agora você pode fazer login com email e senha.',
      };
    }

    // Verify current password (para usuários que já têm senha)
    const isValidPassword = await bcrypt.compare(
      validatedData.currentPassword,
      user.hashedPassword
    );

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Senha atual incorreta.',
      };
    }

    // Check if new password is different
    const isSamePassword = await bcrypt.compare(
      validatedData.newPassword,
      user.hashedPassword
    );

    if (isSamePassword) {
      return {
        success: false,
        message: 'A nova senha deve ser diferente da atual.',
      };
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      validatedData.newPassword,
      saltRounds
    );

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });

    // Log password change
    const headersList = await headers();
    logSecurityEvent('PASSWORD_CHANGED', userId, {
      email: user.email || 'unknown',
      ip: headersList.get('x-forwarded-for') || 'unknown',
      userAgent: headersList.get('user-agent') || 'unknown',
    });

    // Revalidate paths
    revalidatePath('/profile');

    return {
      success: true,
      message: 'Senha alterada com sucesso!',
    };
  } catch (error) {
    console.error('Change password error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados inválidos.',
      };
    }

    return {
      success: false,
      message: 'Erro interno do servidor. Tente novamente.',
    };
  }
}

// Request email change
export async function requestEmailChange(
  userId: string,
  data: { newEmail: string; currentPassword: string },
  hostname: string,
  userAgent: string
): Promise<ProfileResult> {
  try {
    // Validate input
    const validatedData = emailChangeSchema.parse(data);

    // Normalize email
    const normalizedEmail = validatedData.newEmail.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        hashedPassword: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado.',
      };
    }

    // 🆕 ATUALIZADO: Verificar se tem senha (necessário para alterar email)
    if (!user.hashedPassword) {
      return {
        success: false,
        message:
          'Para alterar o email, você precisa primeiro definir uma senha para sua conta.',
      };
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      validatedData.currentPassword,
      user.hashedPassword
    );

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Senha atual incorreta.',
      };
    }

    // Check if new email is different
    if (normalizedEmail === user.email?.toLowerCase()) {
      return {
        success: false,
        message: 'Este já é seu email atual.',
      };
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Este email já está em uso por outra conta.',
      };
    }

    // Check rate limiting
    const rateLimit = await checkTokenRateLimit(userId, 'EMAIL_CHANGE', 3);

    if (!rateLimit.allowed) {
      return {
        success: false,
        message: 'Muitas tentativas. Aguarde 1 hora para solicitar novamente.',
      };
    }

    // Get request information
    const headersList = await headers();
    const userIP = headersList.get('x-forwarded-for') || 'unknown';

    // Create email change token
    const emailChangeToken = await createToken({
      userId: userId,
      type: 'EMAIL_CHANGE',
      expiresInHours: 24,
      ipAddress: userIP,
      userAgent,
      metadata: {
        newEmail: normalizedEmail,
        oldEmail: user.email,
        requestTime: new Date().toISOString(),
      },
    });

    // Create email change confirmation URL
    const confirmationUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'confirm-email-change',
      emailChangeToken
    );

    // Send confirmation email to NEW email address
    const emailResult = await sendTemplateEmail(normalizedEmail, {
      type: 'EMAIL_CHANGE_CONFIRMATION',
      variables: {
        firstName: user.firstName || 'Usuário',
        oldEmail: user.email || '',
        newEmail: normalizedEmail,
        confirmationUrl,
        expirationTime: '24 horas',
      },
    });

    if (emailResult.success) {
      // Log successful request
      logSecurityEvent('EMAIL_CHANGE_REQUESTED', userId, {
        oldEmail: user.email || 'unknown',
        newEmail: normalizedEmail,
        ip: userIP,
        userAgent,
        remainingAttempts: rateLimit.remainingAttempts - 1,
      });

      return {
        success: true,
        message: `Email de confirmação enviado para ${normalizedEmail}. Verifique sua caixa de entrada.`,
        data: {
          newEmail: normalizedEmail,
          expiresIn: '24 horas',
        },
      };
    } else {
      return {
        success: false,
        message: 'Erro ao enviar email de confirmação. Tente novamente.',
      };
    }
  } catch (error) {
    console.error('Request email change error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados inválidos.',
      };
    }

    return {
      success: false,
      message: 'Erro interno do servidor. Tente novamente.',
    };
  }
}

// Change user type
export async function changeUserType(
  userId: string,
  data: {
    userType: 'MUSIC_STUDENT' | 'CASUAL_USER' | 'PROFESSIONAL' | 'TEACHER';
  }
): Promise<ProfileResult> {
  try {
    // Validate input
    const validatedData = userTypeSchema.parse(data);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userType: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado.',
      };
    }

    // Check if it's different
    if (user.userType === validatedData.userType) {
      return {
        success: false,
        message: 'Este já é seu tipo de conta atual.',
      };
    }

    // Update user type
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { userType: validatedData.userType },
      select: {
        id: true,
        userType: true,
      },
    });

    // Revalidate paths
    revalidatePath('/profile');

    return {
      success: true,
      message: 'Tipo de conta alterado com sucesso!',
      data: {
        userType: updatedUser.userType,
      },
    };
  } catch (error) {
    console.error('Change user type error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados inválidos.',
      };
    }

    return {
      success: false,
      message: 'Erro interno do servidor. Tente novamente.',
    };
  }
}

// Get account cascade info for deletion
export async function getAccountCascadeInfo(
  userId: string
): Promise<CascadeInfoResult> {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'ID do usuário é obrigatório',
      };
    }

    // Get all related data counts
    const [
      composersCount,
      worksCount,
      scoresCount,
      annotationsCount,
      favoritesCount,
      instrumentsCount,
      favoriteComposersCount,
      learnedWorksCount,
      wantToLearnCount,
      sampleComposers,
      sampleWorks,
      sampleAnnotations,
    ] = await Promise.all([
      // Composers created
      prisma.composer.count({ where: { createdBy: userId } }),
      // Works created
      prisma.work.count({ where: { createdBy: userId } }),
      // Scores created
      prisma.workScore.count({ where: { uploadedBy: userId } }),
      // Work annotations
      prisma.workAnnotation.count({ where: { userId } }),
      // Favorite works
      prisma.favoriteWork.count({ where: { userId } }),
      // User instruments
      prisma.userInstrument.count({ where: { userId } }),
      // Favorite composers
      prisma.favoriteComposer.count({ where: { userId } }),
      // Learned works
      prisma.learned.count({ where: { userId } }),
      // Want to learn
      prisma.wantToLearn.count({ where: { userId } }),

      // Sample composers (first 3)
      prisma.composer.findMany({
        where: { createdBy: userId },
        select: { id: true, name: true, epochName: true },
      }),
      // Sample works (first 3)
      prisma.work.findMany({
        where: { createdBy: userId },
        select: { id: true, title: true, composer: { select: { name: true } } },
      }),
      // Sample annotations (first 3)
      prisma.workAnnotation.findMany({
        where: { userId },
        select: { id: true, title: true, work: { select: { title: true } } },
      }),
    ]);

    const totalItems =
      composersCount +
      worksCount +
      scoresCount +
      annotationsCount +
      favoritesCount +
      instrumentsCount +
      favoriteComposersCount +
      learnedWorksCount +
      wantToLearnCount;

    return {
      success: true,
      message: 'Informações carregadas com sucesso',
      data: {
        totalItems,
        composersCount,
        worksCount,
        scoresCount,
        annotationsCount,
        favoritesCount,
        instrumentsCount,
        favoriteComposersCount,
        learnedWorksCount,
        wantToLearnCount,

        sampleComposers,
        sampleWorks,
        sampleAnnotations,
      },
    };
  } catch (error) {
    console.error('Get cascade info error:', error);
    return {
      success: false,
      message: 'Erro ao carregar informações da conta',
    };
  }
}

// Delete user account
export async function deleteUserAccount(
  userId: string,
  hostname: string,
  userAgent: string
): Promise<ProfileResult> {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'ID do usuário é obrigatório',
      };
    }

    // Get user info before deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado.',
      };
    }

    // Get request information
    const headersList = await headers();
    const userIP = headersList.get('x-forwarded-for') || 'unknown';

    // Log deletion request
    logSecurityEvent('ACCOUNT_DELETION_REQUESTED', userId, {
      email: user.email || 'unknown',
      firstName: user.firstName || 'unknown',
      ip: userIP,
      userAgent,
      hostname,
    });

    // Send farewell email before deletion
    if (user.email) {
      try {
        await sendTemplateEmail(user.email, {
          type: 'ACCOUNT_FAREWELL',
          variables: {
            firstName: user.firstName || 'Usuário',
            userName:
              `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              'Usuário',
            deletionDate: new Date().toLocaleDateString('pt-BR'),
            supportEmail: 'contato@opusatlas.com',
          },
          customSubject: '👋 Até logo da Opus Atlas',
        });
        console.log('📧 Email de despedida enviado');
      } catch (emailError) {
        console.error('❌ Erro ao enviar email de despedida:', emailError);
        // Não falhar a exclusão por causa do email
      }
    }

    // Delete user (cascade will handle related data)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Log successful deletion
    logSecurityEvent('ACCOUNT_FAREWELL', userId, {
      email: user.email || 'unknown',
      firstName: user.firstName || 'unknown',
      ip: userIP,
      userAgent,
      hostname,
    });

    return {
      message: null,
      success: true,
      data: {
        deletedAt: new Date().toISOString(),
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      },
    };
  } catch (error) {
    console.error('Delete account error:', error);

    // Log deletion error
    logSecurityEvent('ACCOUNT_DELETION_ERROR', userId, {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: (await headers()).get('x-forwarded-for') || 'unknown',
      userAgent,
      hostname,
    });

    return {
      success: false,
      message: 'Erro ao deletar conta. Tente novamente.',
    };
  }
}

// Existing functions continue...
export async function getUserInstruments(
  userId: string
): Promise<ProfileResult> {
  try {
    const userInstruments = await prisma.userInstrument.findMany({
      where: { userId },
      include: {
        instrument: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { instrument: { name: 'asc' } }],
    });

    const formattedInstruments = userInstruments.map((ui) => ({
      id: ui.id,
      instrumentId: ui.instrumentId,
      name: ui.instrument.name,
      category: ui.instrument.category,
      level: ui.level,
      isPrimary: ui.isPrimary,
      isLearning: ui.isLearning,
      startedAt: ui.startedAt,
    }));

    return {
      success: true,
      message: 'Instrumentos carregados com sucesso!',
      data: formattedInstruments,
    };
  } catch (error) {
    console.error('Get user instruments error:', error);

    return {
      success: false,
      message: 'Erro ao carregar instrumentos.',
    };
  }
}

export async function getAvailableInstruments(): Promise<ProfileResult> {
  try {
    const instruments = await prisma.instrument.findMany({
      select: {
        id: true,
        name: true,
        category: true,
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return {
      success: true,
      message: 'Instrumentos disponíveis carregados!',
      data: instruments,
    };
  } catch (error) {
    console.error('Get available instruments error:', error);

    return {
      success: false,
      message: 'Erro ao carregar instrumentos disponíveis.',
    };
  }
}

export async function getComposersAndEpochs(): Promise<ProfileResult> {
  try {
    const [composers, epochs] = await Promise.all([
      prisma.composer.findMany({
        where: {
          AND: [
            {
              OR: [
                { primaryRoleId: '6839e5a5eba93979e36ad88b' }, // Composer role ID
                { roles: { contains: '6839e5a5eba93979e36ad88b' } },
              ],
            },
            { portraitUrl: { not: null } },
          ],
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          portraitUrl: true,
          epochName: true,
        },
        orderBy: { name: 'asc' },
        take: 100,
      }),

      prisma.epoch.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      success: true,
      message: 'Dados carregados com sucesso!',
      data: { composers, epochs },
    };
  } catch (error) {
    console.error('Get composers and epochs error:', error);

    return {
      success: false,
      message: 'Erro ao carregar dados.',
    };
  }
}

export async function getUserProfileStats(
  userId: string
): Promise<ProfileResult> {
  try {
    const [
      instrumentsCount,
      favoriteWorksCount,
      favoriteComposersCount,
      learnedWorksCount,
    ] = await Promise.all([
      prisma.userInstrument.count({ where: { userId } }),
      prisma.favoriteWork.count({ where: { userId } }),
      prisma.favoriteComposer.count({ where: { userId } }),
      prisma.learned.count({ where: { userId } }),
    ]);

    const stats = {
      instrumentsCount,
      favoriteWorksCount,
      favoriteComposersCount,
      learnedWorksCount,
    };

    return {
      success: true,
      message: 'Estatísticas carregadas!',
      data: stats,
    };
  } catch (error) {
    console.error('Get user profile stats error:', error);

    return {
      success: false,
      message: 'Erro ao carregar estatísticas.',
    };
  }
}

// Existing functions (keeping them all)
export async function updatePersonalInfo(
  userId: string,
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
    const validatedData = updatePersonalInfoSchema.parse(data);

    // Se tem telefone, processar código do país e número
    let phoneData = {};
    if (validatedData.phone) {
      const parsed = parsePhoneNumber(validatedData.phone);
      phoneData = {
        phone: validatedData.phone,
        phoneCountryCode: parsed.phoneCountryCode,
        phoneNumber: parsed.phoneNumber,
      };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        bio: validatedData.bio || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        country: validatedData.country || null,
        image: validatedData.image,
        ...phoneData,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        city: true,
        state: true,
        country: true,
        phone: true,
        phoneCountryCode: true,
        phoneNumber: true,
      },
    });

    revalidatePath('/profile');

    return {
      success: true,
      message: 'Informações pessoais atualizadas com sucesso!',
      data: user,
    };
  } catch (error) {
    console.error('Update personal info error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados inválidos.',
      };
    }

    return {
      success: false,
      message: 'Erro ao atualizar informações. Tente novamente.',
    };
  }
}

export async function updateProfile(
  userId: string,
  image: string
): Promise<ProfileResult> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        image: image,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        city: true,
        state: true,
        country: true,
      },
    });

    revalidatePath('/profile');

    return {
      success: true,
      message: 'Informações pessoais atualizadas com sucesso!',
      data: user,
    };
  } catch (error) {
    console.error('Update personal info error:', error);

    return {
      success: false,
      message: 'Erro ao atualizar informações. Tente novamente.',
    };
  }
}

export async function updateLocation(
  userId: string,
  data: {
    city?: string;
    state?: string;
    country?: string;
  }
): Promise<ProfileResult> {
  try {
    const validatedData = updateLocationSchema.parse(data);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        city: validatedData.city || null,
        state: validatedData.state || null,
        country: validatedData.country || null,
      },
      select: {
        id: true,
        city: true,
        state: true,
        country: true,
      },
    });

    revalidatePath('/profile');

    return {
      success: true,
      message: 'Localização atualizada com sucesso!',
      data: user,
    };
  } catch (error) {
    console.error('Update location error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados inválidos.',
      };
    }

    return {
      success: false,
      message: 'Erro ao atualizar localização. Tente novamente.',
    };
  }
}

// 🆕 Function específica para atualizar telefone
export async function updatePhone(
  userId: string,
  phone: string
): Promise<ProfileResult> {
  try {
    // Parse do telefone
    const { phoneCountryCode, phoneNumber } = parsePhoneNumber(phone);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: phone || null,
        phoneCountryCode,
        phoneNumber,
      },
      select: {
        id: true,
        phone: true,
        phoneCountryCode: true,
        phoneNumber: true,
      },
    });

    revalidatePath('/profile');

    return {
      success: true,
      message: 'Telefone atualizado com sucesso!',
      data: user,
    };
  } catch (error) {
    console.error('Update phone error:', error);

    return {
      success: false,
      message: 'Erro ao atualizar telefone. Tente novamente.',
    };
  }
}

export async function updateMusicalPreferences(
  userId: string,
  data: {
    favoriteComposerId?: string;
    favoriteEpochId?: string;
    experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    practiceTimePerWeek?: number;
  }
): Promise<ProfileResult> {
  try {
    const validatedData = updateMusicalPreferencesSchema.parse(data);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        favoriteComposerId: validatedData.favoriteComposerId || null,
        favoriteEpochId: validatedData.favoriteEpochId || null,
        experienceLevel: validatedData.experienceLevel,
        practiceTimePerWeek: validatedData.practiceTimePerWeek || null,
      },
      select: {
        id: true,
        favoriteComposerId: true,
        favoriteEpochId: true,
        experienceLevel: true,
        practiceTimePerWeek: true,
      },
    });

    revalidatePath('/profile');

    return {
      success: true,
      message: 'Preferências musicais atualizadas com sucesso!',
      data: user,
    };
  } catch (error) {
    console.error('Update musical preferences error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados inválidos.',
      };
    }

    return {
      success: false,
      message: 'Erro ao atualizar preferências. Tente novamente.',
    };
  }
}

export async function updateUserInstruments(
  userId: string,
  instruments: Array<{
    instrumentId: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    isPrimary: boolean;
    isLearning: boolean;
  }>
): Promise<ProfileResult> {
  try {
    // Validate each instrument
    const validatedInstruments = instruments.map((inst) =>
      userInstrumentSchema.parse(inst)
    );

    // Ensure only one primary instrument
    const primaryCount = validatedInstruments.filter(
      (inst) => inst.isPrimary
    ).length;
    if (primaryCount > 1) {
      return {
        success: false,
        message: 'Apenas um instrumento pode ser marcado como principal.',
      };
    }

    await prisma.$transaction(async (tx) => {
      // Delete existing user instruments
      await tx.userInstrument.deleteMany({
        where: { userId },
      });

      // Add new instruments
      if (validatedInstruments.length > 0) {
        await tx.userInstrument.createMany({
          data: validatedInstruments.map((inst) => ({
            userId,
            instrumentId: inst.instrumentId,
            level: inst.level,
            isPrimary: inst.isPrimary,
            isLearning: inst.isLearning,
          })),
        });
      }
    });

    revalidatePath('/profile');

    return {
      success: true,
      message: 'Instrumentos atualizados com sucesso!',
    };
  } catch (error) {
    console.error('Update user instruments error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados inválidos.',
      };
    }

    return {
      success: false,
      message: 'Erro ao atualizar instrumentos. Tente novamente.',
    };
  }
}

export async function updatePrivacySettings(
  userId: string,
  data: {
    profilePublic: boolean;
    showLocation: boolean;
  }
): Promise<ProfileResult> {
  try {
    const validatedData = updatePrivacySettingsSchema.parse(data);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePublic: validatedData.profilePublic,
        showLocation: validatedData.showLocation,
      },
      select: {
        id: true,
        profilePublic: true,
        showLocation: true,
      },
    });

    revalidatePath('/profile');

    return {
      success: true,
      message: 'Configurações de privacidade atualizadas!',
      data: user,
    };
  } catch (error) {
    console.error('Update privacy settings error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados inválidos.',
      };
    }

    return {
      success: false,
      message: 'Erro ao atualizar configurações. Tente novamente.',
    };
  }
}
export async function completeOnboarding(
  userId: string,
  data: OnboardingData
): Promise<ProfileResult> {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'ID do usuário é obrigatório',
      };
    }

    // Processar telefone se fornecido
    let phoneData = {};
    if (data.phone) {
      const parsed = parsePhoneNumber(data.phone);
      phoneData = {
        phone: data.phone,
        phoneCountryCode: parsed.phoneCountryCode,
        phoneNumber: parsed.phoneNumber,
      };
    }

    // Preparar dados para atualização
    const updateData: any = {
      onboardingCompleted: true,
      userType: data.userType,
      experienceLevel: data.experienceLevel,
      practiceTimePerWeek: data.practiceTimePerWeek,
      favoriteComposerId: data.favoriteComposerId,
      favoriteEpochId: data.favoriteEpochId,
      bio: data.bio,
      city: data.location?.city,
      state: data.location?.state,
      country: data.location?.country,
      ...phoneData,
    };

    // Remover campos undefined
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await prisma.$transaction(async (tx) => {
      // Atualizar usuário
      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      // Adicionar instrumentos se fornecidos
      if (data.instruments && data.instruments.length > 0) {
        // Deletar instrumentos existentes
        await tx.userInstrument.deleteMany({
          where: { userId },
        });

        // Adicionar novos instrumentos
        const instrumentsData = data.instruments.map((instrument) => ({
          userId,
          instrumentId: instrument.id,
          level: instrument.level,
          isPrimary: instrument.isPrimary,
          isLearning: instrument.isLearning,
        }));

        await tx.userInstrument.createMany({
          data: instrumentsData,
        });
      }
    });

    revalidatePath('/profile');

    return {
      success: true,
      message: 'Configuração inicial concluída com sucesso!',
    };
  } catch (error) {
    console.error('Complete onboarding error:', error);

    return {
      success: false,
      message: 'Erro ao salvar configurações. Tente novamente.',
    };
  }
}
