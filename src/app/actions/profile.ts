// app/actions/profile.ts - UPDATED WITH NEW FEATURES
'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/app/libs/prismadb';
import { revalidatePath } from 'next/cache';
import {
  createToken,
  logSecurityEvent,
  createTokenUrl,
  checkTokenRateLimit,
} from '@/app/libs/tokenUtils';
import { sendTemplateEmail } from '@/app/libs/newsletter/email';

// Validation schemas existentes
const updatePersonalInfoSchema = z.object({
  firstName: z.string().max(50),
  lastName: z.string().max(50),
  image: z.string().optional(),
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

// 🆕 NEW SCHEMAS
const changeEmailSchema = z.object({
  newEmail: z.string().email('Email inválido'),
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
});

const changeUserTypeSchema = z.object({
  userType: z.enum(['MUSIC_STUDENT', 'CASUAL_USER', 'PROFESSIONAL', 'TEACHER']),
});

// Types
export interface ProfileResult {
  success: boolean;
  message: string;
  data?: any;
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
        image: validatedData.image,
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

// 🆕 NEW FUNCTION: Change Email
export async function requestEmailChange(
  userId: string,
  data: {
    newEmail: string;
    currentPassword: string;
  },
  ipAddress?: string,
  userAgent?: string
): Promise<ProfileResult> {
  try {
    const validatedData = changeEmailSchema.parse(data);
    const newEmail = validatedData.newEmail.toLowerCase();

    // Get user with current info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        hashedPassword: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado.',
      };
    }

    // Check if it's the same email
    if (user.email === newEmail) {
      return {
        success: false,
        message: 'Este já é seu email atual.',
      };
    }

    // Verify current password (only for accounts with password)
    if (user.hashedPassword) {
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
    }

    // Check if new email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Este email já está sendo usado por outra conta.',
      };
    }

    // Check rate limiting
    const rateLimit = await checkTokenRateLimit(userId, 'EMAIL_CHANGE', 3);

    if (!rateLimit.allowed) {
      return {
        success: false,
        message: 'Muitas tentativas. Tente novamente em 1 hora.',
      };
    }

    // Create email change token
    const changeToken = await createToken({
      userId: userId,
      type: 'EMAIL_CHANGE',
      expiresInHours: 24, // 24 hours to confirm
      metadata: {
        newEmail: newEmail,
        oldEmail: user.email,
        requestedAt: new Date().toISOString(),
      },
      ipAddress: ipAddress,
      userAgent: userAgent,
      anonymousEmail: newEmail, // Store new email in token
    });

    // Create confirmation URL
    const confirmationUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'confirm-email-change',
      changeToken
    );

    // Send confirmation email to NEW email address
    const emailResult = await sendTemplateEmail(newEmail, {
      type: 'EMAIL_CHANGE_CONFIRMATION',
      variables: {
        firstName: user.firstName || 'Usuário',
        oldEmail: user.email,
        newEmail: newEmail,
        confirmationUrl,
        requestDate: new Date().toLocaleString('pt-BR'),
        ipAddress: ipAddress || 'unknown',
      },
    });

    if (!emailResult.success) {
      return {
        success: false,
        message: 'Erro ao enviar email de confirmação. Tente novamente.',
      };
    }

    // Log security event
    logSecurityEvent('EMAIL_CHANGE_REQUESTED', userId, {
      oldEmail: user.email,
      newEmail: newEmail,
      ip: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
    });

    return {
      success: true,
      message:
        'Email de confirmação enviado para o novo endereço. Verifique sua caixa de entrada.',
      data: {
        newEmail: newEmail,
        tokenExpiry: '24 horas',
      },
    };
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
      message: 'Erro ao solicitar mudança de email. Tente novamente.',
    };
  }
}

// 🆕 NEW FUNCTION: Change User Type
export async function changeUserType(
  userId: string,
  data: {
    userType: 'MUSIC_STUDENT' | 'CASUAL_USER' | 'PROFESSIONAL' | 'TEACHER';
  }
): Promise<ProfileResult> {
  try {
    const validatedData = changeUserTypeSchema.parse(data);

    // Get current user type
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true, firstName: true },
    });

    if (!currentUser) {
      return {
        success: false,
        message: 'Usuário não encontrado.',
      };
    }

    if (currentUser.userType === validatedData.userType) {
      return {
        success: false,
        message: 'Este já é seu tipo de conta atual.',
      };
    }

    // Update user type
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        userType: validatedData.userType,
      },
      select: {
        id: true,
        userType: true,
      },
    });

    revalidatePath('/profile');

    // Log the change
    logSecurityEvent('USER_TYPE_CHANGED', userId, {
      oldType: currentUser.userType,
      newType: validatedData.userType,
    });

    const typeLabels = {
      MUSIC_STUDENT: 'Estudante de Música',
      CASUAL_USER: 'Entusiasta',
      PROFESSIONAL: 'Profissional',
      TEACHER: 'Professor',
    };

    return {
      success: true,
      message: `Tipo de conta alterado para ${
        typeLabels[validatedData.userType]
      } com sucesso!`,
      data: updatedUser,
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
      message: 'Erro ao alterar tipo de conta. Tente novamente.',
    };
  }
}

// 🆕 ENHANCED FUNCTION: Get Account Cascade Info
export async function getAccountCascadeInfo(
  userId: string
): Promise<ProfileResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado.',
      };
    }

    // Get all data that will be deleted
    const [
      composersCount,
      worksCount,
      scoresCount,
      annotationsCount,
      favoritesCount,
      studySessionsCount,
      instrumentsCount,
      favoriteComposersCount,
      learnedWorksCount,
      wantToLearnCount,
      pdfAnnotationsCount,
      bookmarksCount,
    ] = await Promise.all([
      // Compositores criados
      prisma.composer.count({ where: { createdBy: userId } }),
      // Obras criadas
      prisma.work.count({ where: { createdBy: userId } }),
      // Partituras criadas
      prisma.workScore.count({ where: { uploadedBy: userId } }),
      // Anotações criadas
      prisma.workAnnotation.count({ where: { userId } }),
      // Obras favoritas
      prisma.favoriteWork.count({ where: { userId } }),
      // Sessões de estudo
      prisma.studySession.count({ where: { userId } }),
      // Instrumentos configurados
      prisma.userInstrument.count({ where: { userId } }),
      // Compositores favoritos
      prisma.favoriteComposer.count({ where: { userId } }),
      // Obras aprendidas
      prisma.learned.count({ where: { userId } }),
      // Lista "quero aprender"
      prisma.wantToLearn.count({ where: { userId } }),
      // Anotações em PDFs
      prisma.pdfAnnotation.count({ where: { userId } }),
      // Marcadores
      prisma.scoreBookmark.count({ where: { userId } }),
    ]);

    // Get sample data for preview
    const [sampleComposers, sampleWorks, sampleAnnotations] = await Promise.all(
      [
        prisma.composer.findMany({
          where: { createdBy: userId },
          select: { id: true, name: true, epochName: true },
          take: 5,
        }),
        prisma.work.findMany({
          where: { createdBy: userId },
          select: {
            id: true,
            title: true,
            composer: { select: { name: true } },
          },
          take: 5,
        }),
        prisma.workAnnotation.findMany({
          where: { userId },
          select: { id: true, title: true, work: { select: { title: true } } },
          take: 5,
        }),
      ]
    );

    const cascadeInfo = {
      // Totals
      totalItems:
        composersCount +
        worksCount +
        scoresCount +
        annotationsCount +
        favoritesCount +
        studySessionsCount +
        instrumentsCount +
        favoriteComposersCount +
        learnedWorksCount +
        wantToLearnCount +
        pdfAnnotationsCount +
        bookmarksCount,

      // Individual counts
      composersCount,
      worksCount,
      scoresCount,
      annotationsCount,
      favoritesCount,
      studySessionsCount,
      instrumentsCount,
      favoriteComposersCount,
      learnedWorksCount,
      wantToLearnCount,
      pdfAnnotationsCount,
      bookmarksCount,

      // Sample data for preview
      sampleComposers,
      sampleWorks,
      sampleAnnotations,
    };

    return {
      success: true,
      message: 'Informações de cascata carregadas com sucesso.',
      data: cascadeInfo,
    };
  } catch (error) {
    console.error('Get cascade info error:', error);

    return {
      success: false,
      message: 'Erro ao carregar informações. Tente novamente.',
    };
  }
}

// 🆕 ENHANCED FUNCTION: Delete User Account with Email Notification
export async function deleteUserAccount(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<ProfileResult> {
  try {
    // Get user info before deletion for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado.',
      };
    }

    // Get final stats for farewell email
    const [composersCount, worksCount, studySessionsCount, totalStudyTime] =
      await Promise.all([
        prisma.composer.count({ where: { createdBy: userId } }),
        prisma.work.count({ where: { createdBy: userId } }),
        prisma.studySession.count({ where: { userId } }),
        prisma.studySession
          .aggregate({
            where: { userId },
            _sum: { durationMin: true },
          })
          .then((result) => result._sum.durationMin || 0),
      ]);

    await prisma.$transaction(async (tx) => {
      // Delete all related data first (in correct order due to foreign keys)
      await tx.userInstrument.deleteMany({ where: { userId } });
      await tx.annotation.deleteMany({ where: { userId } });
      await tx.favoriteWork.deleteMany({ where: { userId } });
      await tx.favoriteComposer.deleteMany({ where: { userId } });
      await tx.wantToLearn.deleteMany({ where: { userId } });
      await tx.learned.deleteMany({ where: { userId } });
      await tx.studySession.deleteMany({ where: { userId } });
      await tx.workAnnotation.deleteMany({ where: { userId } });
      await tx.annotationHelpfulVote.deleteMany({ where: { userId } });
      await tx.favoriteScore.deleteMany({ where: { userId } });
      await tx.pdfAnnotation.deleteMany({ where: { userId } });
      await tx.scoreBookmark.deleteMany({ where: { userId } });
      await tx.userSelectedScore.deleteMany({ where: { userId } });
      await tx.learningGoal.deleteMany({ where: { userId } });
      await tx.uploadHistory.deleteMany({ where: { userId } });
      await tx.adStats.deleteMany({ where: { userId } });
      await tx.userToken.deleteMany({ where: { userId } });

      // Delete newsletter subscription if exists
      await tx.newsletterSubscriber.deleteMany({ where: { userId } });
      await tx.newsletterEmailEvent.deleteMany({
        where: { subscriberId: { in: [] } },
      }); // This will be handled by cascade

      // Delete sessions and accounts (NextAuth)
      await tx.session.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });

      await tx.generatedReport.deleteMany({ where: { generatedBy: userId } });
      await tx.uploadHistory.deleteMany({
        where: { userId },
      });
      await tx.uploadModeration.deleteMany({
        where: {
          OR: [{ moderatedBy: userId }, { reportedBy: userId }],
        },
      });
      // Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    // Send farewell email (don't wait for it)
    sendTemplateEmail(user.email!, {
      type: 'ACCOUNT_FAREWELL',
      variables: {
        firstName: user.firstName || 'Usuário',
        email: user.email!,
        accountAge: Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ), // days
        composersCount,
        worksCount,
        studySessionsCount,
        totalStudyHours: Math.round(totalStudyTime / 60),
        deletionDate: new Date().toLocaleDateString('pt-BR'),
      },
    }).catch((error) => {
      console.error('Erro ao enviar email de despedida:', error);
    });

    // Log security event
    logSecurityEvent('ACCOUNT_DELETED', userId, {
      email: user.email,
      accountAge: Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      ),
      ip: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      stats: {
        composersCount,
        worksCount,
        studySessionsCount,
        totalStudyTime,
      },
    });

    return {
      success: true,
      message: 'Conta deletada com sucesso. Enviamos um email de confirmação.',
      data: {
        deletedStats: {
          composersCount,
          worksCount,
          studySessionsCount,
          totalStudyHours: Math.round(totalStudyTime / 60),
        },
      },
    };
  } catch (error) {
    console.error('Delete user account error:', error);

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
