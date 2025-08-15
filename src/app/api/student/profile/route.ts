// app/api/student/profile/route.ts - VERSÃO COM LOGGING DE ATIVIDADES

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createStudentActivityLogger } from '@/app/utils/schoolActivities';

// 🆕 FUNÇÃO MELHORADA PARA INVALIDAR CACHE DO ESTUDANTE
async function revalidateStudentProfileData(userId: string) {
  console.log(
    `🔄 [CACHE] Revalidating student profile data for user ${userId}`
  );

  try {
    // 1. Revalidar paths específicos da página de perfil
    revalidatePath('/student/profile', 'page');
    revalidatePath(`/student/profile`);

    // 2. Tags específicas de student profile
    revalidateTag('student-profile');
    revalidateTag('student-profile-data');
    revalidateTag('student-dashboard');
    revalidateTag('student-dashboard-data');

    // 3. Tag específica do usuário
    revalidateTag(`student-${userId}`);
    revalidateTag(`user-${userId}`);

    // 4. Revalidar funções de cache específicas
    revalidateTag('getStudentProfile');
    revalidateTag('getStudentProfileForPageServer');

    // 5. Paths relacionados
    revalidatePath('/api/student/profile');
    revalidatePath('/student');

    console.log(
      `✅ [CACHE] Student profile cache revalidated for user ${userId}`
    );
  } catch (error) {
    console.error(
      `❌ [CACHE] Error revalidating cache for user ${userId}:`,
      error
    );
  }
}

interface StudentProfileData {
  id: string;
  userId: string;
  level: string;
  mainInstrument?: string;
  musicalGoals?: string | null;
  preferredGenres: string[];
  musicalBackground?: string;
  allowPublicProgress: boolean;
  allowProgressShare: boolean;
  profileVisibility: string;
  practiceTime?: number;
  practiceSchedule?: any;
  learningPace?: string;
  specialNeeds?: string;
  status: string;
  enrollmentDate: Date;
  lastLessonAt?: Date;
  lastActiveAt?: Date;
  preferredContact: string;
  reminderPreferences?: any;
  totalLessonsAttended: number;
  totalAssignments: number;
  completedAssignments: number;
  currentStreak: number;
  longestStreak: number;
  progressScore?: number;
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    image?: string | null;
    experienceLevel: string | null;
  };
  teachers: Array<{
    teacherId: string;
    teacherName: string;
    teacherImage?: string;
    isActive: boolean;
    startDate: Date;
    maxLessonsPerWeek: number;
    lessonDuration: number;
    nextLessonAt?: Date;
    totalLessons: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// GET - Buscar perfil do aluno (MANTIDO IGUAL)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas alunos' },
        { status: 403 }
      );
    }

    console.log(
      `👨‍🎓 [STUDENT-PROFILE] Buscando perfil do aluno ${session.user.id}`
    );

    // Buscar perfil do aluno
    const studentProfile = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            city: true,
            state: true,
            country: true,
            image: true,
            experienceLevel: true,
          },
        },
        teachers: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    image: true,
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!studentProfile) {
      // Se não existe, criar perfil básico
      console.log(
        `🆕 [STUDENT-PROFILE] Criando perfil básico para aluno ${session.user.id}`
      );

      const newStudentProfile = await prisma.student.create({
        data: {
          userId: session.user.id,
          level: 'BEGINNER',
          preferredGenres: [],
          allowPublicProgress: false,
          allowProgressShare: true,
          profileVisibility: 'teacher_only',
          status: 'ACTIVE',
          preferredContact: 'whatsapp',
          totalLessonsAttended: 0,
          totalAssignments: 0,
          completedAssignments: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              city: true,
              state: true,
              country: true,
              image: true,
              experienceLevel: true,
            },
          },
          teachers: {
            include: {
              teacher: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const profileData: StudentProfileData = {
        id: newStudentProfile.id,
        userId: newStudentProfile.userId,
        level: newStudentProfile.level,
        mainInstrument: newStudentProfile.mainInstrument || undefined,
        musicalGoals: newStudentProfile.musicalGoals || undefined,
        preferredGenres: newStudentProfile.preferredGenres,
        musicalBackground: newStudentProfile.musicalBackground || undefined,
        allowPublicProgress: newStudentProfile.allowPublicProgress,
        allowProgressShare: newStudentProfile.allowProgressShare,
        profileVisibility: newStudentProfile.profileVisibility,
        practiceTime: newStudentProfile.practiceTime || undefined,
        practiceSchedule: newStudentProfile.practiceSchedule,
        learningPace: newStudentProfile.learningPace || undefined,
        specialNeeds: newStudentProfile.specialNeeds || undefined,
        status: newStudentProfile.status,
        enrollmentDate: newStudentProfile.enrollmentDate,
        lastLessonAt: newStudentProfile.lastLessonAt || undefined,
        lastActiveAt: newStudentProfile.lastActiveAt || undefined,
        preferredContact: newStudentProfile.preferredContact,
        reminderPreferences: newStudentProfile.reminderPreferences,
        totalLessonsAttended: newStudentProfile.totalLessonsAttended,
        totalAssignments: newStudentProfile.totalAssignments,
        completedAssignments: newStudentProfile.completedAssignments,
        currentStreak: newStudentProfile.currentStreak,
        longestStreak: newStudentProfile.longestStreak,
        progressScore: newStudentProfile.progressScore || undefined,
        user: newStudentProfile.user,
        teachers: [],
        createdAt: newStudentProfile.createdAt,
        updatedAt: newStudentProfile.updatedAt,
      };

      // 🆕 INVALIDAR CACHE APÓS CRIAÇÃO
      await revalidateStudentProfileData(session.user.id);

      return NextResponse.json({
        success: true,
        profile: profileData,
        isNew: true,
      });
    }

    // Buscar informações dos professores
    const teachersWithDetails = await Promise.all(
      studentProfile.teachers.map(async (rel) => {
        // Próxima aula com este professor
        const nextLesson = await prisma.lesson.findFirst({
          where: {
            teacherId: rel.teacherId,
            studentId: studentProfile.id,
            status: 'SCHEDULED',
            scheduledAt: {
              gte: new Date(),
            },
          },
          orderBy: { scheduledAt: 'asc' },
          select: { scheduledAt: true },
        });

        // Total de aulas com este professor
        const totalLessons = await prisma.lesson.count({
          where: {
            teacherId: rel.teacherId,
            studentId: studentProfile.id,
          },
        });

        return {
          teacherId: rel.teacher.user.id,
          teacherName:
            `${rel.teacher.user.firstName} ${rel.teacher.user.lastName}`.trim(),
          teacherImage: rel.teacher.user.image || undefined,
          isActive: rel.isActive,
          startDate: rel.startDate,
          maxLessonsPerWeek: rel.maxLessonsPerWeek,
          lessonDuration: rel.lessonDuration,
          nextLessonAt: nextLesson?.scheduledAt,
          totalLessons,
        };
      })
    );

    // Formatar perfil existente
    const profileData: StudentProfileData = {
      id: studentProfile.id,
      userId: studentProfile.userId,
      level: studentProfile.level,
      mainInstrument: studentProfile.mainInstrument || undefined,
      musicalGoals: studentProfile.musicalGoals || undefined,
      preferredGenres: studentProfile.preferredGenres,
      musicalBackground: studentProfile.musicalBackground || undefined,
      allowPublicProgress: studentProfile.allowPublicProgress,
      allowProgressShare: studentProfile.allowProgressShare,
      profileVisibility: studentProfile.profileVisibility,
      practiceTime: studentProfile.practiceTime || undefined,
      practiceSchedule: studentProfile.practiceSchedule,
      learningPace: studentProfile.learningPace || undefined,
      specialNeeds: studentProfile.specialNeeds || undefined,
      status: studentProfile.status,
      enrollmentDate: studentProfile.enrollmentDate,
      lastLessonAt: studentProfile.lastLessonAt || undefined,
      lastActiveAt: studentProfile.lastActiveAt || undefined,
      preferredContact: studentProfile.preferredContact,
      reminderPreferences: studentProfile.reminderPreferences,
      totalLessonsAttended: studentProfile.totalLessonsAttended,
      totalAssignments: studentProfile.totalAssignments,
      completedAssignments: studentProfile.completedAssignments,
      currentStreak: studentProfile.currentStreak,
      longestStreak: studentProfile.longestStreak,
      progressScore: studentProfile.progressScore || undefined,
      user: studentProfile.user,
      teachers: teachersWithDetails,
      createdAt: studentProfile.createdAt,
      updatedAt: studentProfile.updatedAt,
    };

    console.log(`✅ [STUDENT-PROFILE] Perfil do aluno carregado`);

    return NextResponse.json({
      success: true,
      profile: profileData,
      isNew: false,
    });
  } catch (error) {
    console.error('❌ [STUDENT-PROFILE] Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🆕 PUT - Atualizar perfil do aluno COM LOGGING DE ATIVIDADES
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 0) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas alunos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userData, studentData } = body;

    console.log(
      `👨‍🎓✏️ [STUDENT-PROFILE] Atualizando perfil do aluno ${session.user.id}`
    );

    // Verificar se perfil existe
    const existingProfile = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Perfil de aluno não encontrado' },
        { status: 404 }
      );
    }

    // 🆕 CAPTURAR DADOS ANTIGOS PARA DETECTAR MUDANÇAS
    const oldUserData = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        state: true,
        country: true,
        experienceLevel: true,
      },
    });

    const oldStudentData = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: {
        level: true,
        mainInstrument: true,
        musicalGoals: true,
        preferredGenres: true,
        musicalBackground: true,
        allowPublicProgress: true,
        allowProgressShare: true,
        profileVisibility: true,
        practiceTime: true,
        learningPace: true,
        specialNeeds: true,
        preferredContact: true,
      },
    });

    // 🔧 ATUALIZAR DADOS DO USUÁRIO COM VALIDAÇÃO MELHORADA
    let userChanges: any = {};
    if (userData) {
      const allowedUserFields = [
        'firstName',
        'lastName',
        'phone',
        'city',
        'state',
        'country',
        'image',
        'experienceLevel',
      ];

      const userUpdateData: any = {};

      Object.keys(userData).forEach((key) => {
        if (allowedUserFields.includes(key) && userData[key] !== undefined) {
          // Detectar mudanças para logging
          const oldValue = (oldUserData as any)?.[key];
          const newValue = userData[key];

          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            userChanges[key] = { from: oldValue, to: newValue };
          }

          // Tratamento especial para campos que podem ser null
          if (
            userData[key] === '' &&
            ['phone', 'city', 'state', 'country'].includes(key)
          ) {
            userUpdateData[key] = null;
          } else {
            userUpdateData[key] = userData[key];
          }
        }
      });

      if (Object.keys(userUpdateData).length > 0) {
        console.log(
          '📝 [STUDENT-PROFILE] Atualizando dados do usuário:',
          userUpdateData
        );

        await prisma.user.update({
          where: { id: session.user.id },
          data: userUpdateData,
        });
        console.log('✅ [STUDENT-PROFILE] Dados do usuário atualizados');
      }
    }

    // 🔧 ATUALIZAR DADOS DO ESTUDANTE COM VALIDAÇÃO
    let studentChanges: any = {};
    if (studentData) {
      const allowedStudentFields = [
        'level',
        'mainInstrument',
        'musicalGoals',
        'preferredGenres',
        'musicalBackground',
        'allowPublicProgress',
        'allowProgressShare',
        'profileVisibility',
        'practiceTime',
        'practiceSchedule',
        'learningPace',
        'specialNeeds',
        'preferredContact',
        'reminderPreferences',
      ];

      const studentUpdateData: any = {};

      Object.keys(studentData).forEach((key) => {
        if (
          allowedStudentFields.includes(key) &&
          studentData[key] !== undefined
        ) {
          const value = studentData[key];

          // Detectar mudanças para logging
          const oldValue = (oldStudentData as any)?.[key];

          if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
            studentChanges[key] = { from: oldValue, to: value };
          }

          switch (key) {
            case 'practiceTime':
              // Validar tempo de prática
              if (typeof value === 'number' && value >= 0 && value <= 2400) {
                studentUpdateData[key] = value;
              }
              break;

            case 'preferredGenres':
              // Validar array de gêneros
              if (Array.isArray(value)) {
                studentUpdateData[key] = value;
              }
              break;

            case 'allowPublicProgress':
            case 'allowProgressShare':
              // Validar booleans
              if (typeof value === 'boolean') {
                studentUpdateData[key] = value;
              }
              break;

            case 'level':
              // Validar nível
              if (['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(value)) {
                studentUpdateData[key] = value;
              }
              break;

            case 'profileVisibility':
              // Validar visibilidade
              if (['public', 'teacher_only', 'private'].includes(value)) {
                studentUpdateData[key] = value;
              }
              break;

            case 'preferredContact':
              // Validar contato preferido
              if (['whatsapp', 'email', 'both'].includes(value)) {
                studentUpdateData[key] = value;
              }
              break;

            case 'learningPace':
              // Validar ritmo de aprendizado
              if (['slow', 'medium', 'fast'].includes(value) || value === '') {
                studentUpdateData[key] = value || null;
              }
              break;

            case 'practiceSchedule':
            case 'reminderPreferences':
              // Permitir objetos JSON
              studentUpdateData[key] = value || {};
              break;

            default:
              // Para outros campos de string, permitir strings vazias
              if (typeof value === 'string') {
                studentUpdateData[key] = value.trim() || null;
              } else {
                studentUpdateData[key] = value;
              }
          }
        }
      });

      // Atualizar lastActiveAt sempre que perfil for atualizado
      studentUpdateData.lastActiveAt = new Date();

      if (Object.keys(studentUpdateData).length > 0) {
        console.log(
          '📝 [STUDENT-PROFILE] Atualizando dados do aluno:',
          studentUpdateData
        );

        await prisma.student.update({
          where: { id: existingProfile.id },
          data: studentUpdateData,
        });
        console.log('✅ [STUDENT-PROFILE] Dados do aluno atualizados');
      }
    }

    // 🆕 LOGGING DE ATIVIDADE: PERFIL ATUALIZADO
    try {
      const allChanges = { ...userChanges, ...studentChanges };

      if (Object.keys(allChanges).length > 0) {
        const activityLogger = createStudentActivityLogger(session.user.id);

        await activityLogger.studentProfileUpdated(allChanges);

        console.log(
          `📝 [ACTIVITY] STUDENT_PROFILE_UPDATED registrado para aluno ${session.user.id}`,
          { changedFields: Object.keys(allChanges) }
        );
      }
    } catch (loggingError) {
      console.error(
        '❌ [STUDENT-PROFILE] Erro ao registrar atividade:',
        loggingError
      );
      // Não falhar a atualização por causa do logging
    }

    // 🔥 REVALIDAR CACHE ANTES DE BUSCAR OS DADOS ATUALIZADOS
    await revalidateStudentProfileData(session.user.id);

    // ✅ Buscar perfil atualizado COM TODOS OS CAMPOS
    const updatedProfile = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            city: true,
            state: true,
            country: true,
            image: true,
            experienceLevel: true,
          },
        },
        teachers: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    image: true,
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Buscar informações dos professores novamente
    const teachersWithDetails = await Promise.all(
      (updatedProfile?.teachers || []).map(async (rel) => {
        const nextLesson = await prisma.lesson.findFirst({
          where: {
            teacherId: rel.teacherId,
            studentId: updatedProfile!.id,
            status: 'SCHEDULED',
            scheduledAt: { gte: new Date() },
          },
          orderBy: { scheduledAt: 'asc' },
          select: { scheduledAt: true },
        });

        const totalLessons = await prisma.lesson.count({
          where: {
            teacherId: rel.teacherId,
            studentId: updatedProfile!.id,
          },
        });

        return {
          teacherId: rel.teacher.user.id,
          teacherName:
            `${rel.teacher.user.firstName} ${rel.teacher.user.lastName}`.trim(),
          teacherImage: rel.teacher.user.image || undefined,
          isActive: rel.isActive,
          startDate: rel.startDate,
          maxLessonsPerWeek: rel.maxLessonsPerWeek,
          lessonDuration: rel.lessonDuration,
          nextLessonAt: nextLesson?.scheduledAt,
          totalLessons,
        };
      })
    );

    // ✅ FORMATAR RESPOSTA COMPLETA
    const formattedProfile = {
      id: updatedProfile!.id,
      userId: updatedProfile!.userId,
      level: updatedProfile!.level,
      mainInstrument: updatedProfile!.mainInstrument,
      musicalGoals: updatedProfile!.musicalGoals,
      preferredGenres: updatedProfile!.preferredGenres || [],
      musicalBackground: updatedProfile!.musicalBackground,
      allowPublicProgress: updatedProfile!.allowPublicProgress,
      allowProgressShare: updatedProfile!.allowProgressShare,
      profileVisibility: updatedProfile!.profileVisibility,
      practiceTime: updatedProfile!.practiceTime,
      practiceSchedule: updatedProfile!.practiceSchedule || {},
      learningPace: updatedProfile!.learningPace,
      specialNeeds: updatedProfile!.specialNeeds,
      status: updatedProfile!.status,
      enrollmentDate: updatedProfile!.enrollmentDate,
      lastLessonAt: updatedProfile!.lastLessonAt,
      lastActiveAt: updatedProfile!.lastActiveAt,
      preferredContact: updatedProfile!.preferredContact,
      reminderPreferences: updatedProfile!.reminderPreferences || {},
      totalLessonsAttended: updatedProfile!.totalLessonsAttended,
      totalAssignments: updatedProfile!.totalAssignments,
      completedAssignments: updatedProfile!.completedAssignments,
      currentStreak: updatedProfile!.currentStreak,
      longestStreak: updatedProfile!.longestStreak,
      progressScore: updatedProfile!.progressScore,
      user: updatedProfile!.user,
      teachers: teachersWithDetails,
      createdAt: updatedProfile!.createdAt,
      updatedAt: updatedProfile!.updatedAt,
    };

    console.log(
      `✅ [STUDENT-PROFILE] Perfil atualizado com sucesso, cache revalidado e atividade registrada`
    );

    return NextResponse.json({
      success: true,
      profile: formattedProfile,
      message: 'Perfil atualizado com sucesso',
      activityLogged:
        Object.keys(userChanges).length + Object.keys(studentChanges).length >
        0,
    });
  } catch (error) {
    console.error('❌ [STUDENT-PROFILE] Erro ao atualizar perfil:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// PATCH - Atualização parcial COM REVALIDAÇÃO MELHORADA (MANTIDO IGUAL)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 0) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas alunos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { field, value, action } = body; // action: 'set', 'add', 'remove'

    if (!field) {
      return NextResponse.json(
        { error: 'Campo é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `👨‍🎓🔧 [STUDENT-PROFILE] Atualizando campo ${field} - Ação: ${action} - Valor:`,
      value
    );

    // Verificar se perfil existe
    const existingProfile = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Perfil de aluno não encontrado' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Campos array que suportam add/remove
    const arrayFields = ['preferredGenres'];

    if (arrayFields.includes(field) && action) {
      const currentArray = (existingProfile as any)[field] || [];

      switch (action) {
        case 'add':
          if (!currentArray.includes(value)) {
            updateData[field] = [...currentArray, value];
          }
          break;
        case 'remove':
          updateData[field] = currentArray.filter(
            (item: string) => item !== value
          );
          break;
        case 'set':
          updateData[field] = Array.isArray(value) ? value : [value];
          break;
      }
    } else {
      // Atualização simples com validação
      switch (field) {
        case 'practiceTime':
          if (typeof value === 'number' && value >= 0 && value <= 2400) {
            updateData[field] = value;
          }
          break;
        case 'level':
          if (['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(value)) {
            updateData[field] = value;
          }
          break;
        default:
          updateData[field] = value;
      }
    }

    // Sempre atualizar lastActiveAt
    updateData.lastActiveAt = new Date();

    // Atualizar perfil
    const updatedProfile = await prisma.student.update({
      where: { id: existingProfile.id },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            city: true,
            state: true,
            country: true,
            image: true,
            experienceLevel: true,
          },
        },
      },
    });

    // 🔥 REVALIDAR CACHE APÓS ATUALIZAÇÃO DE CAMPO
    await revalidateStudentProfileData(session.user.id);

    console.log(
      `✅ [STUDENT-PROFILE] Campo ${field} atualizado e cache revalidado`
    );

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: `Campo ${field} atualizado com sucesso`,
    });
  } catch (error) {
    console.error('❌ [STUDENT-PROFILE] Erro ao atualizar campo:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// POST - Inicializar onboarding do aluno COM REVALIDAÇÃO (MANTIDO IGUAL)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 0) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas alunos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      level,
      mainInstrument,
      musicalGoals,
      preferredGenres,
      practiceTime,
      learningPace,
      allowPublicProgress,
      preferredContact,
    } = body;

    console.log(
      `👨‍🎓🚀 [STUDENT-PROFILE] Inicializando onboarding do aluno ${session.user.id}`
    );

    // Verificar se já tem perfil
    const existingProfile = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        {
          error: 'Perfil já existe. Use PUT para atualizar.',
        },
        { status: 409 }
      );
    }

    // Criar perfil inicial baseado no onboarding
    const newProfile = await prisma.student.create({
      data: {
        userId: session.user.id,
        level: level || 'BEGINNER',
        mainInstrument,
        musicalGoals,
        preferredGenres: preferredGenres || [],
        practiceTime,
        learningPace,
        allowPublicProgress: allowPublicProgress ?? false,
        preferredContact: preferredContact || 'whatsapp',
        status: 'ACTIVE',
        allowProgressShare: true,
        profileVisibility: 'teacher_only',
        totalLessonsAttended: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveAt: new Date(),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            experienceLevel: true,
          },
        },
      },
    });

    // Marcar onboarding como completo no usuário
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompleted: true },
    });

    // 🔥 REVALIDAR CACHE APÓS CRIAÇÃO DO PERFIL
    await revalidateStudentProfileData(session.user.id);

    console.log(
      `✅ [STUDENT-PROFILE] Onboarding concluído para aluno ${session.user.id} e cache revalidado`
    );

    return NextResponse.json({
      success: true,
      profile: newProfile,
      message: 'Perfil criado com sucesso! Bem-vindo ao Opus Atlas!',
    });
  } catch (error) {
    console.error('❌ [STUDENT-PROFILE] Erro no onboarding:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
