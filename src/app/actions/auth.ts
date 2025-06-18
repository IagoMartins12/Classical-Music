// app/actions/auth.ts
'use server';

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/app/libs/prismadb';
import { revalidatePath } from 'next/cache';
import { OnboardingData } from '../stores/authStore';
import { allFamousNames } from '../requests/utils';

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(1, 'Username é obrigatório').max(50),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

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
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  favoriteComposerId: z.string().optional(),
  favoriteEpochId: z.string().optional(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  practiceTimePerWeek: z.number().min(0).max(9999).optional(),
  image: z.string().optional(),
  bio: z.string().max(500).optional(),
});

// Types
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

// Register user with email and password
export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  try {
    // Validate input
    const validatedData = registerSchema.parse(data);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
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
          equals: validatedData.username,
          mode: 'insensitive',
        },
      },
    });
    if (existingUserUsername) {
      return {
        success: false,
        message: 'Um usuário com este nome de usuário existe.',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email.toLowerCase(),
        hashedPassword,
        role: 0, // normal user
        onboardingCompleted: false,
        profilePublic: true,
        showLocation: false,
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
        createdAt: true,
      },
    });

    return {
      success: true,
      message: 'Conta criada com sucesso!',
      user,
      requiresOnboarding: true,
    };
  } catch (error) {
    console.error('Registration error:', error);

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
      },
    });

    if (!user || !user.hashedPassword) {
      return {
        success: false,
        message: 'Email ou senha incorretos.',
      };
    }

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
    const { ...safeUser } = user;

    // const { hashedPassword, ...safeUser } = user;

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

  return epochsData;
}

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
    // Validate input
    const validatedData = onboardingSchema.parse(data);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user data
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          userType: validatedData.userType,
          city: validatedData.location?.city,
          state: validatedData.location?.state,
          country: validatedData.location?.country,
          favoriteComposerId: validatedData.favoriteComposerId,
          favoriteEpochId: validatedData.favoriteEpochId,
          experienceLevel: validatedData.experienceLevel,
          practiceTimePerWeek: validatedData.practiceTimePerWeek,
          image: validatedData.image,
          bio: validatedData.bio,
          onboardingCompleted: true,
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

// Update user profile (partial update)
export async function updateUserProfile(
  userId: string,
  data: Partial<OnboardingData>
): Promise<OnboardingResult> {
  try {
    // Validate input
    const validatedData = onboardingSchema.partial().parse(data);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {};

      if (validatedData.userType) updateData.userType = validatedData.userType;
      if (validatedData.location?.city !== undefined)
        updateData.city = validatedData.location.city;
      if (validatedData.location?.state !== undefined)
        updateData.state = validatedData.location.state;
      if (validatedData.location?.country !== undefined)
        updateData.country = validatedData.location.country;
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
          city: true,
          state: true,
          country: true,
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
    console.error('Update user profile error:', error);

    if (error instanceof z.ZodError) {
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
        lastName: true,
        email: true,
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
