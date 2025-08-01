// app/actions/auth.ts
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

// 🔧 SCHEMA CORRIGIDO - Suporta objetos completos da localização
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

  // 🔧 LOCALIZAÇÃO CORRIGIDA - Objetos completos aninhados
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

  // 🆕 TELEFONE
  phone: z.string().optional(),

  favoriteComposerId: z.string().optional(),
  favoriteEpochId: z.string().optional(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  practiceTimePerWeek: z.number().min(0).max(9999).optional(),
  image: z.string().optional(),
  bio: z.string().max(500).optional(),
});

// Types existentes...
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

const processPhoneForDatabase = (phone?: string) => {
  if (!phone || !phone.startsWith('+')) {
    return {
      phone: undefined,
      phoneCountryCode: undefined,
      phoneNumber: undefined,
    };
  }

  // Lista de códigos de país conhecidos (ordenados por tamanho, maior primeiro)
  const countryCodes = [
    { dialCode: '+358', code: 'FI' }, // Finlândia
    { dialCode: '+351', code: 'PT' }, // Portugal
    { dialCode: '+55', code: 'BR' }, // Brasil
    { dialCode: '+54', code: 'AR' }, // Argentina
    { dialCode: '+56', code: 'CL' }, // Chile
    { dialCode: '+57', code: 'CO' }, // Colômbia
    { dialCode: '+52', code: 'MX' }, // México
    { dialCode: '+49', code: 'DE' }, // Alemanha
    { dialCode: '+44', code: 'GB' }, // Reino Unido
    { dialCode: '+43', code: 'AT' }, // Áustria
    { dialCode: '+41', code: 'CH' }, // Suíça
    { dialCode: '+39', code: 'IT' }, // Itália
    { dialCode: '+34', code: 'ES' }, // Espanha
    { dialCode: '+33', code: 'FR' }, // França
    { dialCode: '+32', code: 'BE' }, // Bélgica
    { dialCode: '+31', code: 'NL' }, // Países Baixos
    { dialCode: '+91', code: 'IN' }, // Índia
    { dialCode: '+86', code: 'CN' }, // China
    { dialCode: '+81', code: 'JP' }, // Japão
    { dialCode: '+61', code: 'AU' }, // Austrália
    { dialCode: '+7', code: 'RU' }, // Rússia
    { dialCode: '+46', code: 'SE' }, // Suécia
    { dialCode: '+47', code: 'NO' }, // Noruega
    { dialCode: '+45', code: 'DK' }, // Dinamarca
    { dialCode: '+1', code: 'US' }, // Estados Unidos / Canadá
  ];

  // Encontrar o código do país
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

// Register user with email and password - VERSÃO INTEGRADA
export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  try {
    // Validate input with Zod
    const validatedData = registerSchema.parse(data);

    // Normalize email
    const normalizedEmail = validatedData.email.toLowerCase().trim();
    const normalizedUsername = validatedData.username.trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Um usuário com este email já existe.',
      };
    }

    // Check if username already exists
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

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      saltRounds
    );

    // Get request information for logs
    const headersList = await headers();
    const userIP =
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: normalizedUsername,
        username: normalizedUsername,
        email: normalizedEmail,
        hashedPassword,
        role: 0, // normal user
        onboardingCompleted: false,
        profilePublic: true,
        showLocation: false,
        // IMPORTANTE: emailVerified fica null até confirmação
        emailVerified: null,
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

    // NOVO: Criar token de confirmação de conta
    try {
      const confirmationToken = await createToken({
        userId: user.id,
        type: 'EMAIL_CONFIRMATION',
        expiresInHours: 24, // Token válido por 24 horas
        ipAddress: userIP,
        userAgent,
        metadata: {
          registrationTime: new Date().toISOString(),
          emailAddress: normalizedEmail,
        },
      });

      // NOVO: Criar URL de confirmação
      const confirmationUrl = createTokenUrl(
        process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'confirm-account',
        confirmationToken
      );

      // NOVO: Enviar email de confirmação de conta
      const emailResult = await sendTemplateEmail(normalizedEmail, {
        type: 'ACCOUNT_CONFIRMATION',
        variables: {
          firstName: user.firstName || 'Usuário',
          confirmationUrl,
        },
      });

      if (emailResult.success) {
        // Log de sucesso
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
        // Se falhar o envio do email, ainda assim criou a conta
        // Mas avisa sobre o problema
        logSecurityEvent('USER_REGISTERED_EMAIL_FAILED', user.id, {
          email: normalizedEmail,
          username: normalizedUsername,
          ip: userIP,
          emailError: emailResult.error,
        });

        return {
          success: true,
          message:
            'Conta criada, mas houve um problema ao enviar o email de confirmação. Entre em contato conosco.',
          user,
          requiresOnboarding: true,
        };
      }
    } catch (tokenError) {
      // Se falhar a criação do token, ainda assim criou a conta
      // Mas o usuário precisará solicitar confirmação manualmente
      console.error('Erro ao criar token de confirmação:', tokenError);

      logSecurityEvent('USER_REGISTERED_TOKEN_FAILED', user.id, {
        email: normalizedEmail,
        username: normalizedUsername,
        ip: userIP,
        tokenError:
          tokenError instanceof Error ? tokenError.message : 'Unknown error',
      });

      return {
        success: true,
        message:
          'Conta criada, mas houve um problema técnico. Entre em contato conosco para ativar sua conta.',
        user,
        requiresOnboarding: true,
      };
    }
  } catch (error) {
    console.error('Registration error:', error);

    // Log do erro (sem dados sensíveis)
    logSecurityEvent('USER_REGISTRATION_ERROR', '', {
      email: data.email ? 'provided' : 'not_provided',
      username: data.username ? 'provided' : 'not_provided',
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: (await headers()).get('x-forwarded-for') || 'unknown',
    });

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados inválidos.',
      };
    }

    // Verificar se o erro é de duplicação (pode acontecer em race conditions)
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
      return {
        success: false,
        message: 'Email é obrigatório',
      };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Buscar usuário
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
      // Por segurança, não revelar se o email existe ou não
      return {
        success: true,
        message:
          'Se este email estiver cadastrado, você receberá um novo link de confirmação.',
      };
    }

    // Verificar se já foi confirmado
    if (user.emailVerified) {
      return {
        success: false,
        message: 'Esta conta já foi confirmada',
      };
    }

    // Verificar rate limiting
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

    // Obter informações da requisição
    const headersList = await headers();
    const userIP = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Criar novo token
    const confirmationToken = await createToken({
      userId: user.id,
      type: 'EMAIL_CONFIRMATION',
      expiresInHours: 24,
      ipAddress: userIP,
      userAgent,
    });

    // Criar URL de confirmação
    const confirmationUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'confirm-account',
      confirmationToken
    );

    // Enviar email
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

    logSecurityEvent('RESEND_CONFIRMATION_ERROR', '', {
      email: email ? 'provided' : 'not_provided',
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: (await headers()).get('x-forwarded-for') || 'unknown',
    });

    return {
      success: false,
      message: 'Erro interno. Tente novamente.',
    };
  }
}

// Login user with email and password
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  try {
    // Validate input
    const validatedData = loginSchema.parse(data);

    // Find user
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
        emailVerified: true, // NOVO: Verificar se email foi confirmado
      },
    });

    if (!user || !user.hashedPassword) {
      return {
        success: false,
        message: 'Email ou senha incorretos.',
      };
    }

    // OPCIONAL: Email não confirmado não bloqueia login
    // Usuário pode fazer login mesmo sem confirmar email

    // Verify password
    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.hashedPassword
    );

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Email ou senha incorretos.',
      };
    }

    // Remove password from response
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

export async function getSpecificsInstrument() {
  const instrumentsData = await prisma.instrument.findMany({
    select: {
      id: true,
      name: true,
      category: true,
    },
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
  const composerData = await prisma.composer.findMany({
    where: {
      AND: [
        {
          fullName: {
            in: allFamousNames,
          },
        },
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
  });

  return composerData;
}

export async function getEpochs() {
  const epochsData = await prisma.epoch.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return epochsData.filter((epoch) => epoch.name !== 'Desconhecido');
}

const processLocationForDatabase = (location?: OnboardingData['location']) => {
  console.log('🔄 Processando localização para o banco:', location);

  if (!location) {
    return {
      city: undefined,
      state: undefined,
      country: undefined,
    };
  }

  const result = {
    city: location.city?.name || undefined,
    state: location.state?.name || undefined,
    country: location.country?.name || undefined,
  };

  console.log('✅ Localização processada para o banco:', result);
  return result;
};

// Get onboarding options (instruments, composers, epochs)
export async function getOnboardingOptions(): Promise<OnboardingOptionsResult> {
  try {
    const [instruments, composers, epochs] = await Promise.all([
      // Get instruments grouped by category
      getSpecificsInstrument(),

      // Get popular composers with portraits
      getFamousComposers(),
      // Get all epochs
      getEpochs(),
    ]);

    return {
      success: true,
      data: {
        instruments,
        composers,
        epochs,
      },
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

// Complete user onboarding
export async function completeOnboarding(
  userId: string,
  data: OnboardingData
): Promise<OnboardingResult> {
  try {
    console.log('🎯 Iniciando completeOnboarding com dados:', {
      userId,
      hasLocation: !!data.location,
      hasPhone: !!data.phone,
      userType: data.userType,
      locationData: data.location,
    });

    // Validate input
    const validatedData = onboardingSchema.parse(data);
    console.log('✅ Dados validados com sucesso');

    // 🔧 PROCESSAR DADOS DE LOCALIZAÇÃO com objetos completos
    const locationData = processLocationForDatabase(validatedData.location);

    // 🔧 PROCESSAR DADOS DE TELEFONE
    const phoneData = processPhoneForDatabase(validatedData.phone);

    console.log('🔄 Dados processados:', {
      location: locationData,
      phone: phoneData,
    });

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 🔄 UPDATE USER DATA com novos campos
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          // Dados básicos
          userType: validatedData.userType,
          favoriteComposerId: validatedData.favoriteComposerId,
          favoriteEpochId: validatedData.favoriteEpochId,
          experienceLevel: validatedData.experienceLevel,
          practiceTimePerWeek: validatedData.practiceTimePerWeek,
          image: validatedData.image,
          bio: validatedData.bio,
          onboardingCompleted: true,

          // 🆕 DADOS DE LOCALIZAÇÃO (strings simples para o banco)
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,

          // 🆕 DADOS DE TELEFONE
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

          // 🆕 INCLUIR NOVOS CAMPOS NO SELECT
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

      // Delete existing user instruments
      await tx.userInstrument.deleteMany({
        where: { userId },
      });

      // Add new instruments if provided
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

      console.log('✅ Usuário atualizado com sucesso:', {
        id: user.id,
        onboardingCompleted: user.onboardingCompleted,
        hasLocation: !!(user.city || user.state || user.country),
        hasPhone: !!user.phone,
      });

      return user;
    });

    // Revalidate relevant paths
    revalidatePath('/profile');

    return {
      success: true,
      message: 'Perfil configurado com sucesso!',
      user: result,
    };
  } catch (error) {
    console.error('❌ Complete onboarding error:', error);

    if (error instanceof z.ZodError) {
      console.error('❌ Validation errors:', error.errors);
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

// 🔧 FUNÇÃO CORRIGIDA - updateUserProfile
export async function updateUserProfile(
  userId: string,
  data: Partial<OnboardingData>
): Promise<OnboardingResult> {
  try {
    console.log('🔄 Atualizando perfil do usuário:', { userId, data });

    // Validate input
    const validatedData = onboardingSchema.partial().parse(data);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {};

      // Dados básicos
      if (validatedData.userType) updateData.userType = validatedData.userType;
      if (validatedData.favoriteComposerId !== undefined)
        updateData.favoriteComposerId = validatedData.favoriteComposerId;
      if (validatedData.favoriteEpochId !== undefined)
        updateData.favoriteEpochId = validatedData.favoriteEpochId;
      if (validatedData.experienceLevel !== undefined)
        updateData.experienceLevel = validatedData.experienceLevel;
      if (validatedData.practiceTimePerWeek !== undefined)
        updateData.practiceTimePerWeek = validatedData.practiceTimePerWeek;
      if (validatedData.image !== undefined)
        updateData.image = validatedData.image;
      if (validatedData.bio !== undefined) updateData.bio = validatedData.bio;

      // 🔄 PROCESSAR LOCALIZAÇÃO SE FORNECIDA
      if (validatedData.location !== undefined) {
        const locationData = processLocationForDatabase(validatedData.location);
        updateData.city = locationData.city;
        updateData.state = locationData.state;
        updateData.country = locationData.country;
      }

      // 🔄 PROCESSAR TELEFONE SE FORNECIDO
      if (validatedData.phone !== undefined) {
        const phoneData = processPhoneForDatabase(validatedData.phone);
        updateData.phone = phoneData.phone;
        updateData.phoneCountryCode = phoneData.phoneCountryCode;
        updateData.phoneNumber = phoneData.phoneNumber;
      }

      // Update user
      const user = await tx.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          role: true,
          onboardingCompleted: true,
          userType: true,

          // 🆕 INCLUIR NOVOS CAMPOS
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

      // Update instruments if provided
      if (validatedData.instruments) {
        // Delete existing user instruments
        await tx.userInstrument.deleteMany({
          where: { userId },
        });

        // Add new instruments
        if (validatedData.instruments.length > 0) {
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
      }

      return user;
    });

    // Revalidate relevant paths
    revalidatePath('/profile');

    return {
      success: true,
      message: 'Perfil atualizado com sucesso!',
      user: result,
    };
  } catch (error) {
    console.error('❌ Update user profile error:', error);

    if (error instanceof z.ZodError) {
      console.error('❌ Validation errors:', error.errors);
      return {
        success: false,
        message: error.errors[0]?.message || 'Dados inválidos.',
      };
    }

    return {
      success: false,
      message: 'Erro ao atualizar perfil. Tente novamente.',
    };
  }
}
// Get user by ID (for session management)
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
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

        // 🆕 INCLUIR NOVOS CAMPOS
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

    return user;
  } catch (error) {
    console.error('Get user by ID error:', error);
    return null;
  }
}

// Check if username is available
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

// Update username
export async function updateUsername(
  userId: string,
  username: string
): Promise<AuthResult> {
  try {
    // Check if username is available
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
