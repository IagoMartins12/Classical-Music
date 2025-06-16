// app/actions/profile.ts
'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/app/libs/prismadb';
import { revalidatePath } from 'next/cache';

// Validation schemas
const updatePersonalInfoSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório').max(50),
  lastName: z.string().min(1, 'Sobrenome é obrigatório').max(50),
  bio: z.string().max(500).optional(),
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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
});

const userInstrumentSchema = z.object({
  instrumentId: z.string(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  isPrimary: z.boolean(),
  isLearning: z.boolean(),
});

// Types
export interface ProfileResult {
  success: boolean;
  message: string;
  data?: any;
}

// Update personal information
export async function updatePersonalInfo(
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    bio?: string;
    city?: string;
    state?: string;
    country?: string;
  }
): Promise<ProfileResult> {
  try {
    const validatedData = updatePersonalInfoSchema.parse(data);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        bio: validatedData.bio || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        country: validatedData.country || null,
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

// Update musical preferences
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

// Update user instruments
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

// Change password
export async function changePassword(
  userId: string,
  data: {
    currentPassword: string;
    newPassword: string;
  }
): Promise<ProfileResult> {
  try {
    const validatedData = changePasswordSchema.parse(data);

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        hashedPassword: true,
      },
    });

    if (!user || !user.hashedPassword) {
      return {
        success: false,
        message: 'Usuário não encontrado.',
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

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        hashedPassword: hashedNewPassword,
      },
    });

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
      message: 'Erro ao alterar senha. Tente novamente.',
    };
  }
}

// Update privacy settings
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

// Delete user account
export async function deleteUserAccount(
  userId: string
): Promise<ProfileResult> {
  try {
    await prisma.$transaction(async (tx) => {
      // Delete all related data first
      await tx.userInstrument.deleteMany({ where: { userId } });
      await tx.annotation.deleteMany({ where: { userId } });
      await tx.favoriteWork.deleteMany({ where: { userId } });
      await tx.favoriteComposer.deleteMany({ where: { userId } });
      await tx.wantToLearn.deleteMany({ where: { userId } });
      await tx.learned.deleteMany({ where: { userId } });
      await tx.studySession.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });

      // Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    return {
      success: true,
      message: 'Conta deletada com sucesso.',
    };
  } catch (error) {
    console.error('Delete user account error:', error);

    return {
      success: false,
      message: 'Erro ao deletar conta. Tente novamente.',
    };
  }
}

// Get user instruments with details
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

// Get available instruments for selection
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

// Get composers and epochs for preferences
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

// Get user profile stats (for display)
export async function getUserProfileStats(
  userId: string
): Promise<ProfileResult> {
  try {
    const [
      instrumentsCount,
      favoriteWorksCount,
      favoriteComposersCount,
      studySessionsCount,
      learnedWorksCount,
    ] = await Promise.all([
      prisma.userInstrument.count({ where: { userId } }),
      prisma.favoriteWork.count({ where: { userId } }),
      prisma.favoriteComposer.count({ where: { userId } }),
      prisma.studySession.count({ where: { userId } }),
      prisma.learned.count({ where: { userId } }),
    ]);

    const stats = {
      instrumentsCount,
      favoriteWorksCount,
      favoriteComposersCount,
      studySessionsCount,
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
