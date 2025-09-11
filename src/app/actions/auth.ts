// app/actions/auth.ts - VERSÃO ATUALIZADA com email de boas-vindas para Google
'use server';

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/app/libs/prismadb';
import { revalidatePath } from 'next/cache';
import { OnboardingData } from '../stores/authStore';
import { allFamousNames } from '../requests/utils';
import {
  createToken,
  logSecurityEvent,
  checkTokenRateLimit,
  createTokenUrl,
} from '@/app/libs/tokenUtils';
import { headers } from 'next/headers';
import { sendTemplateEmail } from '../libs/newsletter/email';

// Validation schemas existentes...
const registerSchema = z.object({
  username: z
    .string()
    .min(2, 'Nome de usuário deve ter pelo menos 2 caracteres')
    .max(50)
    .regex(/^\S+$/, 'Nome de usuário não pode conter espaços')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Nome de usuário só pode conter letras, números, _ e -'
    ),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Schema para processamento de usuário Google
const googleUserSchema = z.object({
  email: z.string().email('Email inválido'),
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().optional(),
  image: z.string().url().optional(),
  googleId: z.string().min(1, 'Google ID é obrigatório'),
});

// Schema de onboarding...
const onboardingSchema = z.object({
  userType: z
    .enum(['MUSIC_STUDENT', 'CASUAL_USER', 'PROFESSIONAL', 'TEACHER'])
    .optional(),
  instruments: z
    .array(
      z.object({
        id: z.string(),
        level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
        isPrimary: z.boolean(),
        isLearning: z.boolean(),
      })
    )
    .optional(),
  location: z
    .object({
      country: z
        .object({
          isoCode: z.string(),
          name: z.string(),
          flag: z.string(),
        })
        .optional(),
      state: z
        .object({
          isoCode: z.string(),
          name: z.string(),
          countryCode: z.string(),
        })
        .optional(),
      city: z
        .object({
          name: z.string(),
          stateCode: z.string(),
          countryCode: z.string(),
        })
        .optional(),
    })
    .optional(),
  phone: z.string().optional(),
  favoriteComposerId: z.string().optional(),
  favoriteEpochId: z.string().optional(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  practiceTimePerWeek: z.number().min(0).max(9999).optional(),
  image: z.string().optional(),
  bio: z.string().max(500).optional(),
});

// Types...
export interface AuthResult {
  success: boolean;
  message: string;
  user?: any;
  requiresOnboarding?: boolean;
}

export interface OnboardingResult {
  success: boolean;
  message: string;
  user?: any;
}

export interface OnboardingOptionsResult {
  success: boolean;
  data?: {
    instruments: Array<{ id: string; name: string; category: string | null }>;
    composers: Array<{
      id: string;
      name: string;
      fullName: string;
      portraitUrl: string | null;
      epochName: string | null;
    }>;
    epochs: Array<{ id: string; name: string }>;
  };
  message: string;
}

export interface ResendConfirmationResult {
  success: boolean;
  message: string;
}

// Função para processar telefone
const processPhoneForDatabase = (phone?: string) => {
  if (!phone || !phone.startsWith('+')) {
    return {
      phone: undefined,
      phoneCountryCode: undefined,
      phoneNumber: undefined,
    };
  }

  const countryCodes = [
    { dialCode: '+358', code: 'FI' },
    { dialCode: '+351', code: 'PT' },
    { dialCode: '+55', code: 'BR' },
    { dialCode: '+54', code: 'AR' },
    { dialCode: '+56', code: 'CL' },
    { dialCode: '+57', code: 'CO' },
    { dialCode: '+52', code: 'MX' },
    { dialCode: '+49', code: 'DE' },
    { dialCode: '+44', code: 'GB' },
    { dialCode: '+43', code: 'AT' },
    { dialCode: '+41', code: 'CH' },
    { dialCode: '+39', code: 'IT' },
    { dialCode: '+34', code: 'ES' },
    { dialCode: '+33', code: 'FR' },
    { dialCode: '+32', code: 'BE' },
    { dialCode: '+31', code: 'NL' },
    { dialCode: '+91', code: 'IN' },
    { dialCode: '+86', code: 'CN' },
    { dialCode: '+81', code: 'JP' },
    { dialCode: '+61', code: 'AU' },
    { dialCode: '+7', code: 'RU' },
    { dialCode: '+46', code: 'SE' },
    { dialCode: '+47', code: 'NO' },
    { dialCode: '+45', code: 'DK' },
    { dialCode: '+1', code: 'US' },
  ];

  let matchedCountry = null;
  for (const country of countryCodes) {
    if (phone.startsWith(country.dialCode)) {
      matchedCountry = country;
      break;
    }
  }

  if (!matchedCountry) {
    return {
      phone,
      phoneCountryCode: undefined,
      phoneNumber: undefined,
    };
  }

  const phoneNumber = phone.slice(matchedCountry.dialCode.length);

  return {
    phone,
    phoneCountryCode: matchedCountry.code,
    phoneNumber,
  };
};

// 🆕 NOVA FUNÇÃO: Processar usuário Google (chamada pelo NextAuth)
export async function processGoogleUser(data: {
  email: string;
  firstName: string;
  lastName?: string;
  image?: string;
  googleId: string;
}): Promise<AuthResult> {
  try {
    console.log('🔄 Processando usuário Google:', data.email);

    // Validar dados do Google
    const validatedData = googleUserSchema.parse(data);
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      console.log('👤 Usuário Google já existe, fazendo login');
      return {
        success: true,
        message: 'Login realizado com sucesso!',
        user: existingUser,
        requiresOnboarding: !existingUser.onboardingCompleted,
      };
    }

    // Obter informações da requisição
    const headersList = await headers();
    const userIP = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // 🎉 CRIAR NOVO USUÁRIO GOOGLE com email já verificado
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        username: validatedData.firstName.toLowerCase().replace(/\s+/g, ''),
        email: normalizedEmail,
        image: validatedData.image,
        role: 0,
        onboardingCompleted: false,
        profilePublic: true,
        showLocation: false,
        // ✅ IMPORTANTE: Email já verificado para usuários Google
        emailVerified: new Date(),
        // Pode armazenar Google ID se necessário
        // googleId: validatedData.googleId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        image: true,
        role: true,
        onboardingCompleted: true,
        userType: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    console.log('✅ Usuário Google criado:', user.id);

    // 🎉 ENVIAR EMAIL DE BOAS-VINDAS (não confirmação)
    try {
      const welcomeEmailResult = await sendTemplateEmail(normalizedEmail, {
        type: 'WELCOME',
        variables: {
          firstName: user.firstName || 'Usuário',
          siteUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        },
      });

      if (welcomeEmailResult.success) {
        console.log('📧 Email de boas-vindas enviado com sucesso');

        logSecurityEvent('GOOGLE_USER_REGISTERED_WITH_WELCOME', user.id, {
          email: normalizedEmail,
          firstName: user.firstName,
          ip: userIP,
          userAgent,
          emailProvider: welcomeEmailResult.provider,
        });
      } else {
        console.warn(
          '⚠️ Falha ao enviar email de boas-vindas:',
          welcomeEmailResult.error
        );

        logSecurityEvent('GOOGLE_USER_REGISTERED_EMAIL_FAILED', user.id, {
          email: normalizedEmail,
          firstName: user.firstName,
          ip: userIP,
          emailError: welcomeEmailResult.error,
        });
      }
    } catch (emailError) {
      console.error('❌ Erro ao enviar email de boas-vindas:', emailError);

      logSecurityEvent('GOOGLE_USER_REGISTERED_EMAIL_ERROR', user.id, {
        email: normalizedEmail,
        firstName: user.firstName,
        ip: userIP,
        emailError:
          emailError instanceof Error ? emailError.message : 'Unknown error',
      });
    }

    return {
      success: true,
      message: 'Conta criada com sucesso via Google! Bem-vindo(a)!',
      user,
      requiresOnboarding: true, // Sempre precisa fazer onboarding
    };
  } catch (error) {
    console.error('❌ Erro ao processar usuário Google:', error);

    logSecurityEvent('GOOGLE_USER_REGISTRATION_ERROR', '', {
      email: data.email ? 'provided' : 'not_provided',
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: (await headers()).get('x-forwarded-for') || 'unknown',
    });

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados do Google inválidos.',
      };
    }

    return {
      success: false,
      message: 'Erro interno ao processar conta Google. Tente novamente.',
    };
  }
}

// Register user with email and password - MANTIDO IGUAL
export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  try {
    const validatedData = registerSchema.parse(data);
    const normalizedEmail = validatedData.email.toLowerCase().trim();
    const normalizedUsername = validatedData.username.trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Um usuário com este email já existe.',
      };
    }

    const existingUserUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: normalizedUsername,
          mode: 'insensitive',
        },
      },
    });

    if (existingUserUsername) {
      return {
        success: false,
        message: 'Um usuário com este nome de usuário já existe.',
      };
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      saltRounds
    );

    const headersList = await headers();
    const userIP = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    const user = await prisma.user.create({
      data: {
        firstName: normalizedUsername,
        username: normalizedUsername,
        email: normalizedEmail,
        hashedPassword,
        role: 0,
        onboardingCompleted: false,
        profilePublic: true,
        showLocation: false,
        emailVerified: null, // Email não verificado para registro normal
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        image: true,
        role: true,
        onboardingCompleted: true,
        userType: true,
        createdAt: true,
      },
    });

    // ENVIAR EMAIL DE CONFIRMAÇÃO (não boas-vindas) para registro normal
    try {
      const confirmationToken = await createToken({
        userId: user.id,
        type: 'EMAIL_CONFIRMATION',
        expiresInHours: 24,
        ipAddress: userIP,
        userAgent,
        metadata: {
          registrationTime: new Date().toISOString(),
          emailAddress: normalizedEmail,
        },
      });

      const confirmationUrl = createTokenUrl(
        process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'confirm-account',
        confirmationToken
      );

      const emailResult = await sendTemplateEmail(normalizedEmail, {
        type: 'ACCOUNT_CONFIRMATION',
        variables: {
          firstName: user.firstName || 'Usuário',
          confirmationUrl,
        },
      });

      if (emailResult.success) {
        logSecurityEvent('USER_REGISTERED_WITH_CONFIRMATION', user.id, {
          email: normalizedEmail,
          username: normalizedUsername,
          ip: userIP,
          userAgent,
          emailProvider: emailResult.provider,
        });

        return {
          success: true,
          message:
            'Conta criada com sucesso! Verifique seu email para confirmar sua conta.',
          user,
          requiresOnboarding: true,
        };
      } else {
        logSecurityEvent('USER_REGISTERED_EMAIL_FAILED', user.id, {
          email: normalizedEmail,
          username: normalizedUsername,
          ip: userIP,
          emailError: emailResult.error,
        });

        return {
          success: true,
          message:
            'Conta criada, mas houve um problema ao enviar o email de confirmação.',
          user,
          requiresOnboarding: true,
        };
      }
    } catch (tokenError) {
      console.error('Erro ao criar token de confirmação:', tokenError);

      return {
        success: true,
        message:
          'Conta criada, mas houve um problema técnico. Entre em contato conosco.',
        user,
        requiresOnboarding: true,
      };
    }
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados inválidos.',
      };
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('email')) {
        return {
          success: false,
          message: 'Um usuário com este email já existe.',
        };
      }
      if (error.message.includes('username')) {
        return {
          success: false,
          message: 'Um usuário com este nome de usuário já existe.',
        };
      }
    }

    return {
      success: false,
      message: 'Erro interno do servidor. Tente novamente.',
    };
  }
}

// NOVO: Action para reenviar email de confirmação
export async function resendAccountConfirmation(
  email: string
): Promise<ResendConfirmationResult> {
  try {
    if (!email || !email.trim()) {
      return { success: false, message: 'Email é obrigatório' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return {
        success: true,
        message:
          'Se este email estiver cadastrado, você receberá um novo link de confirmação.',
      };
    }

    if (user.emailVerified) {
      return { success: false, message: 'Esta conta já foi confirmada' };
    }

    const rateLimit = await checkTokenRateLimit(
      user.id,
      'EMAIL_CONFIRMATION',
      3
    );
    if (!rateLimit.allowed) {
      return {
        success: false,
        message: 'Muitas tentativas. Aguarde 1 hora para solicitar novamente.',
      };
    }

    const headersList = await headers();
    const userIP = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    const confirmationToken = await createToken({
      userId: user.id,
      type: 'EMAIL_CONFIRMATION',
      expiresInHours: 24,
      ipAddress: userIP,
      userAgent,
    });

    const confirmationUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'confirm-account',
      confirmationToken
    );

    const emailResult = await sendTemplateEmail(normalizedEmail, {
      type: 'ACCOUNT_CONFIRMATION',
      variables: {
        firstName: user.firstName || 'Usuário',
        confirmationUrl,
      },
    });

    if (emailResult.success) {
      logSecurityEvent('ACCOUNT_CONFIRMATION_RESENT', user.id, {
        email: normalizedEmail,
        ip: userIP,
        remainingAttempts: rateLimit.remainingAttempts - 1,
      });

      return {
        success: true,
        message:
          'Novo email de confirmação enviado! Verifique sua caixa de entrada.',
      };
    } else {
      return {
        success: false,
        message: 'Erro ao enviar email. Tente novamente.',
      };
    }
  } catch (error) {
    console.error('Erro ao reenviar confirmação:', error);
    return { success: false, message: 'Erro interno. Tente novamente.' };
  }
}

// Funções restantes mantidas iguais...
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  try {
    const validatedData = loginSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        hashedPassword: true,
        image: true,
        role: true,
        onboardingCompleted: true,
        userType: true,
        city: true,
        state: true,
        country: true,
        favoriteComposerId: true,
        favoriteEpochId: true,
        experienceLevel: true,
        practiceTimePerWeek: true,
        profilePublic: true,
        showLocation: true,
        emailVerified: true,
      },
    });

    if (!user || !user.hashedPassword) {
      return { success: false, message: 'Email ou senha incorretos.' };
    }

    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.hashedPassword
    );

    if (!isValidPassword) {
      return { success: false, message: 'Email ou senha incorretos.' };
    }

    const { hashedPassword: _hashedPassword, ...safeUser } = user;

    return {
      success: true,
      message: 'Login realizado com sucesso!',
      user: safeUser,
      requiresOnboarding: !user.onboardingCompleted,
    };
  } catch (error) {
    console.error('Login error:', error);

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

// Funções para onboarding e outras mantidas iguais...
export async function getSpecificsInstrument() {
  const instrumentsData = await prisma.instrument.findMany({
    select: { id: true, name: true, category: true },
    where: {
      name: {
        in: [
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
        ],
      },
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  return instrumentsData;
}

export async function getFamousComposers() {
  return await prisma.composer.findMany({
    where: { AND: [{ fullName: { in: allFamousNames } }] },
    select: {
      id: true,
      name: true,
      fullName: true,
      portraitUrl: true,
      epochName: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function getEpochs() {
  const epochsData = await prisma.epoch.findMany({
    select: { id: true, name: true },
  });
  return epochsData.filter((epoch) => epoch.name !== 'Desconhecido');
}

const processLocationForDatabase = (location?: OnboardingData['location']) => {
  if (!location)
    return { city: undefined, state: undefined, country: undefined };

  return {
    city: location.city?.name || undefined,
    state: location.state?.name || undefined,
    country: location.country?.name || undefined,
  };
};

export async function getOnboardingOptions(): Promise<OnboardingOptionsResult> {
  try {
    const [instruments, composers, epochs] = await Promise.all([
      getSpecificsInstrument(),
      getFamousComposers(),
      getEpochs(),
    ]);

    return {
      success: true,
      data: { instruments, composers, epochs },
      message: 'Opções carregadas com sucesso.',
    };
  } catch (error) {
    console.error('Get onboarding options error:', error);
    return {
      success: false,
      message: 'Erro ao carregar opções. Tente novamente.',
    };
  }
}

export async function completeOnboarding(
  userId: string,
  data: OnboardingData
): Promise<OnboardingResult> {
  try {
    const validatedData = onboardingSchema.parse(data);
    const locationData = processLocationForDatabase(validatedData.location);
    const phoneData = processPhoneForDatabase(validatedData.phone);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          userType: validatedData.userType,
          favoriteComposerId: validatedData.favoriteComposerId,
          favoriteEpochId: validatedData.favoriteEpochId,
          experienceLevel: validatedData.experienceLevel,
          practiceTimePerWeek: validatedData.practiceTimePerWeek,
          image: validatedData.image,
          bio: validatedData.bio,
          onboardingCompleted: true,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
          phone: phoneData.phone,
          phoneCountryCode: phoneData.phoneCountryCode,
          phoneNumber: phoneData.phoneNumber,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          role: true,
          onboardingCompleted: true,
          userType: true,
          city: true,
          state: true,
          country: true,
          phone: true,
          phoneCountryCode: true,
          phoneNumber: true,
          favoriteComposerId: true,
          favoriteEpochId: true,
          experienceLevel: true,
          practiceTimePerWeek: true,
          profilePublic: true,
          showLocation: true,
        },
      });

      await tx.userInstrument.deleteMany({ where: { userId } });

      if (validatedData.instruments && validatedData.instruments.length > 0) {
        await tx.userInstrument.createMany({
          data: validatedData.instruments.map((instrument) => ({
            userId,
            instrumentId: instrument.id,
            level: instrument.level,
            isPrimary: instrument.isPrimary,
            isLearning: instrument.isLearning,
          })),
        });
      }

      return user;
    });

    revalidatePath('/profile');

    return {
      success: true,
      message: 'Perfil configurado com sucesso!',
      user: result,
    };
  } catch (error) {
    console.error('Complete onboarding error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados inválidos.',
      };
    }

    return {
      success: false,
      message: 'Erro ao salvar perfil. Tente novamente.',
    };
  }
}

export async function getUserById(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        bio: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        onboardingCompleted: true,
        userType: true,
        city: true,
        state: true,
        country: true,
        phone: true,
        phoneCountryCode: true,
        phoneNumber: true,
        favoriteComposerId: true,
        favoriteEpochId: true,
        experienceLevel: true,
        practiceTimePerWeek: true,
        profilePublic: true,
        showLocation: true,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return null;
  }
}

export async function checkUsernameAvailability(
  username: string
): Promise<boolean> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });
    return !existingUser;
  } catch (error) {
    console.error('Check username availability error:', error);
    return false;
  }
}

export async function updateUsername(
  userId: string,
  username: string
): Promise<AuthResult> {
  try {
    const isAvailable = await checkUsernameAvailability(username);

    if (!isAvailable) {
      return {
        success: false,
        message: 'Este nome de usuário já está em uso.',
      };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { username: username.toLowerCase() },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        image: true,
        role: true,
        onboardingCompleted: true,
        userType: true,
      },
    });

    revalidatePath('/profile');

    return {
      success: true,
      message: 'Nome de usuário atualizado com sucesso!',
      user,
    };
  } catch (error) {
    console.error('Update username error:', error);
    return {
      success: false,
      message: 'Erro ao atualizar nome de usuário. Tente novamente.',
    };
  }
}
