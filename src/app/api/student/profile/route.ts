// app/api/student/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface StudentProfileData {
  id: string;
  userId: string;

  // Informações musicais
  level: string;
  mainInstrument?: string;
  musicalGoals?: string | null;
  preferredGenres: string[];
  musicalBackground?: string;

  // Configurações de privacidade
  allowPublicProgress: boolean;
  allowProgressShare: boolean;
  profileVisibility: string;

  // Informações de estudo
  practiceTime?: number;
  practiceSchedule?: any;
  learningPace?: string;
  specialNeeds?: string;

  // Status e datas
  status: string;
  enrollmentDate: Date;
  lastLessonAt?: Date;
  lastActiveAt?: Date;

  // Configurações de comunicação
  preferredContact: string;
  reminderPreferences?: any;

  // Métricas de progresso
  totalLessonsAttended: number;
  totalAssignments: number;
  completedAssignments: number;
  currentStreak: number;
  longestStreak: number;
  progressScore?: number;

  // User data
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

  // Professores vinculados
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

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// GET - Buscar perfil do aluno
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

// PUT - Atualizar perfil do aluno
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

    // Atualizar dados do usuário se fornecidos
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
        if (allowedUserFields.includes(key)) {
          userUpdateData[key] = userData[key];
        }
      });

      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: userUpdateData,
        });
        console.log('📝 [STUDENT-PROFILE] Dados do usuário atualizados');
      }
    }

    // Atualizar dados do aluno se fornecidos
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
        if (allowedStudentFields.includes(key)) {
          studentUpdateData[key] = studentData[key];
        }
      });

      // Atualizar lastActiveAt sempre que perfil for atualizado
      studentUpdateData.lastActiveAt = new Date();

      if (Object.keys(studentUpdateData).length > 0) {
        await prisma.student.update({
          where: { id: existingProfile.id },
          data: studentUpdateData,
        });
        console.log('📝 [STUDENT-PROFILE] Dados do aluno atualizados');
      }
    }

    // Buscar perfil atualizado
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
      },
    });

    console.log(`✅ [STUDENT-PROFILE] Perfil atualizado com sucesso`);

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Perfil atualizado com sucesso',
    });
  } catch (error) {
    console.error('❌ [STUDENT-PROFILE] Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualização parcial (campos específicos)
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
      `👨‍🎓🔧 [STUDENT-PROFILE] Atualizando campo ${field} - Ação: ${action}`
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
      // Atualização simples
      updateData[field] = value;
    }

    // Sempre atualizar lastActiveAt
    updateData.lastActiveAt = new Date();

    // Atualizar perfil
    const updatedProfile = await prisma.student.update({
      where: { id: existingProfile.id },
      data: updateData,
    });

    console.log(`✅ [STUDENT-PROFILE] Campo ${field} atualizado`);

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: `Campo ${field} atualizado com sucesso`,
    });
  } catch (error) {
    console.error('❌ [STUDENT-PROFILE] Erro ao atualizar campo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Inicializar onboarding do aluno
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

    console.log(
      `✅ [STUDENT-PROFILE] Onboarding concluído para aluno ${session.user.id}`
    );

    return NextResponse.json({
      success: true,
      profile: newProfile,
      message: 'Perfil criado com sucesso! Bem-vindo ao Opus Atlas!',
    });
  } catch (error) {
    console.error('❌ [STUDENT-PROFILE] Erro no onboarding:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
