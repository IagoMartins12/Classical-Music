// app/api/teacher/profile/route.ts - VERSÃO COM LOGGING DE ATIVIDADES

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag, revalidatePath } from 'next/cache';
import { createTeacherActivityLogger } from '@/app/utils/schoolActivities';
import { NotificationFactory } from '@/app/utils/notifications/createNotification';

// Função auxiliar para revalidar cache de teacher profile - MELHORADA
async function revalidateTeacherProfileData(userId: string) {
  console.log(
    `🔄 [CACHE] Revalidating teacher profile data for user ${userId}`
  );

  try {
    // Tags específicas de teacher profile
    revalidateTag('teacher-profile');
    revalidateTag('teacher-profile-data');
    revalidateTag('teacher-profile-extended-data');
    revalidateTag('teacher-dashboard');
    revalidateTag('teacher-dashboard-data');

    // Tag específica do usuário
    revalidateTag(`teacher-${userId}`);
    revalidateTag(`user-${userId}`);

    // Paths específicos
    revalidatePath('/teacher/profile');
    revalidatePath('/teacher/dashboard');
    revalidatePath('/api/teacher/profile');

    // Tags adicionais para páginas que podem usar dados de teacher
    revalidateTag('public-teachers');
    revalidateTag('teachers-list');

    console.log(
      `✅ [CACHE] Teacher profile cache revalidated for user ${userId}`
    );
  } catch (error) {
    console.error(
      `❌ [CACHE] Error revalidating cache for user ${userId}:`,
      error
    );
  }
}

// Enum para status do teacher (baseado no schema)
enum TeacherStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

interface TeacherProfileData {
  id: string;
  userId: string;

  // Informações básicas
  bio?: string;
  specialties: string[];
  instruments: string[];
  experience?: string;
  education?: string;
  achievements?: string;

  // Perfil público
  isPublicProfile: boolean;
  profileImage?: string;
  website?: string;
  socialMedia?: any;
  publicBio?: string;
  highlightedWorks: string[];

  // Configurações de ensino
  defaultLessonDuration: number;
  maxStudentsPerWeek: number;
  timezone: string;

  // Metodologia
  teachingMethod?: string;
  ageGroups: string[];
  skillLevels: string[];

  // Status e verificação
  status: TeacherStatus;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string; // ✅ Adicionado conforme schema

  // Configurações de relatórios
  allowProgressReports: boolean;
  reportPreferences?: any;

  // Métricas
  totalStudents: number;
  totalLessons: number;
  averageRating?: number;
  totalReviews: number;
  completionRate?: number;

  // User data - ✅ CORRIGIDO COM CAMPOS DE TELEFONE
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    phoneCountryCode?: string | null; // ✅ Novo campo conforme schema
    phoneNumber?: string | null; // ✅ Novo campo conforme schema
    city?: string | null;
    state?: string | null;
    country?: string | null;
    image?: string | null;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// GET - Buscar perfil do professor (MANTIDO IGUAL)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    console.log(
      `👨‍🏫 [TEACHER-PROFILE] Buscando perfil do professor ${session.user.id}`
    );

    // Buscar perfil do professor
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            phoneCountryCode: true, // ✅ Incluído
            phoneNumber: true, // ✅ Incluído
            city: true,
            state: true,
            country: true,
            image: true,
          },
        },
      },
    });

    if (!teacherProfile) {
      // Se não existe, criar perfil básico
      console.log(
        `🆕 [TEACHER-PROFILE] Criando perfil básico para professor ${session.user.id}`
      );

      const newTeacherProfile = await prisma.teacher.create({
        data: {
          userId: session.user.id,
          specialties: [],
          instruments: [],
          ageGroups: [],
          skillLevels: [],
          highlightedWorks: [],
          status: TeacherStatus.PENDING,
          isVerified: false,
          isPublicProfile: false,
          allowProgressReports: true,
          defaultLessonDuration: 60,
          maxStudentsPerWeek: 50,
          timezone: 'America/Sao_Paulo',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              phoneCountryCode: true,
              phoneNumber: true,
              city: true,
              state: true,
              country: true,
              image: true,
            },
          },
        },
      });

      // 🆕 CRIAR NOTIFICAÇÃO DE BOAS-VINDAS PARA O PROFESSOR
      try {
        const teacherName =
          `${newTeacherProfile.user.firstName} ${newTeacherProfile.user.lastName}`.trim();

        await NotificationFactory.welcomeNewTeacher(
          newTeacherProfile.user.id,
          teacherName
        );

        console.log(
          `🎓 [TEACHER-PROFILE] Notificação de boas-vindas enviada para professor ${session.user.id}`
        );
      } catch (notificationError) {
        console.error(
          '❌ [TEACHER-PROFILE] Erro ao criar notificação de boas-vindas:',
          notificationError
        );
      }

      const profileData: TeacherProfileData = {
        id: newTeacherProfile.id,
        userId: newTeacherProfile.userId,
        bio: newTeacherProfile.bio || undefined,
        specialties: newTeacherProfile.specialties,
        instruments: newTeacherProfile.instruments,
        experience: newTeacherProfile.experience || undefined,
        education: newTeacherProfile.education || undefined,
        achievements: newTeacherProfile.achievements || undefined,
        isPublicProfile: newTeacherProfile.isPublicProfile,
        profileImage: newTeacherProfile.profileImage || undefined,
        website: newTeacherProfile.website || undefined,
        socialMedia: newTeacherProfile.socialMedia,
        publicBio: newTeacherProfile.publicBio || undefined,
        highlightedWorks: newTeacherProfile.highlightedWorks,
        defaultLessonDuration: newTeacherProfile.defaultLessonDuration,
        maxStudentsPerWeek: newTeacherProfile.maxStudentsPerWeek,
        timezone: newTeacherProfile.timezone,
        teachingMethod: newTeacherProfile.teachingMethod || undefined,
        ageGroups: newTeacherProfile.ageGroups,
        skillLevels: newTeacherProfile.skillLevels,
        status: newTeacherProfile.status as TeacherStatus,
        isVerified: newTeacherProfile.isVerified,
        verifiedAt: newTeacherProfile.verifiedAt || undefined,
        verifiedBy: newTeacherProfile.verifiedBy || undefined, // ✅ Incluído
        allowProgressReports: newTeacherProfile.allowProgressReports,
        reportPreferences: newTeacherProfile.reportPreferences,
        totalStudents: newTeacherProfile.totalStudents,
        totalLessons: newTeacherProfile.totalLessons,
        averageRating: newTeacherProfile.averageRating || undefined,
        totalReviews: newTeacherProfile.totalReviews,
        completionRate: newTeacherProfile.completionRate || undefined,
        user: newTeacherProfile.user,
        createdAt: newTeacherProfile.createdAt,
        updatedAt: newTeacherProfile.updatedAt,
      };

      return NextResponse.json({
        success: true,
        profile: profileData,
        isNew: true,
      });
    }

    // ✅ Formatar perfil existente COM TODOS OS CAMPOS
    const profileData: TeacherProfileData = {
      id: teacherProfile.id,
      userId: teacherProfile.userId,
      bio: teacherProfile.bio || undefined,
      specialties: teacherProfile.specialties || [],
      instruments: teacherProfile.instruments || [],
      experience: teacherProfile.experience || undefined,
      education: teacherProfile.education || undefined,
      achievements: teacherProfile.achievements || undefined,
      isPublicProfile: teacherProfile.isPublicProfile,
      profileImage: teacherProfile.profileImage || undefined,
      website: teacherProfile.website || undefined,
      socialMedia: teacherProfile.socialMedia || {},
      publicBio: teacherProfile.publicBio || undefined,
      highlightedWorks: teacherProfile.highlightedWorks || [],
      defaultLessonDuration: teacherProfile.defaultLessonDuration,
      maxStudentsPerWeek: teacherProfile.maxStudentsPerWeek,
      timezone: teacherProfile.timezone,
      teachingMethod: teacherProfile.teachingMethod || undefined,
      ageGroups: teacherProfile.ageGroups || [],
      skillLevels: teacherProfile.skillLevels || [],
      status: teacherProfile.status as TeacherStatus,
      isVerified: teacherProfile.isVerified,
      verifiedAt: teacherProfile.verifiedAt || undefined,
      verifiedBy: teacherProfile.verifiedBy || undefined,
      allowProgressReports: teacherProfile.allowProgressReports,
      reportPreferences: teacherProfile.reportPreferences || {},
      totalStudents: teacherProfile.totalStudents,
      totalLessons: teacherProfile.totalLessons,
      averageRating: teacherProfile.averageRating || undefined,
      totalReviews: teacherProfile.totalReviews,
      completionRate: teacherProfile.completionRate || undefined,
      user: teacherProfile.user,
      createdAt: teacherProfile.createdAt,
      updatedAt: teacherProfile.updatedAt,
    };

    console.log(`✅ [TEACHER-PROFILE] Perfil do professor carregado`);

    return NextResponse.json({
      success: true,
      profile: profileData,
      isNew: false,
    });
  } catch (error) {
    console.error('❌ [TEACHER-PROFILE] Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🆕 PUT - Atualizar perfil do professor COM LOGGING DE ATIVIDADES
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userData, teacherData } = body;

    console.log(
      `👨‍🏫✏️ [TEACHER-PROFILE] Atualizando perfil do professor ${session.user.id}`,
      { userData, teacherData }
    );

    // Verificar se perfil existe
    const existingProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Perfil de professor não encontrado' },
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
        phoneCountryCode: true,
        phoneNumber: true,
        city: true,
        state: true,
        country: true,
      },
    });

    const oldTeacherData = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: {
        bio: true,
        specialties: true,
        instruments: true,
        experience: true,
        education: true,
        achievements: true,
        isPublicProfile: true,
        website: true,
        socialMedia: true,
        publicBio: true,
        highlightedWorks: true,
        defaultLessonDuration: true,
        maxStudentsPerWeek: true,
        timezone: true,
        teachingMethod: true,
        ageGroups: true,
        skillLevels: true,
        allowProgressReports: true,
        reportPreferences: true,
      },
    });

    // 🔧 ATUALIZAR DADOS DO USUÁRIO COM VALIDAÇÃO MELHORADA
    let userChanges: any = {};
    if (userData) {
      const allowedUserFields = [
        'firstName',
        'lastName',
        'phone',
        'phoneCountryCode', // ✅ Novo campo
        'phoneNumber', // ✅ Novo campo
        'city',
        'state',
        'country',
        'image',
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

          // 🔧 Tratamento especial para campos que podem ser null
          if (
            userData[key] === '' &&
            [
              'phone',
              'phoneCountryCode',
              'phoneNumber',
              'city',
              'state',
              'country',
            ].includes(key)
          ) {
            userUpdateData[key] = null;
          } else {
            userUpdateData[key] = userData[key];
          }
        }
      });

      // 🆕 PROCESSAMENTO DE TELEFONE MELHORADO
      if (userData.phone !== undefined) {
        if (userData.phone && userData.phone.trim()) {
          // Se há telefone, processar para extrair componentes
          const phone = userData.phone.trim();

          // Se começar com +, é um número internacional
          if (phone.startsWith('+')) {
            userUpdateData.phone = phone;

            // Extrair código do país (primeiros 2-3 dígitos após +)
            const match = phone.match(/^\+(\d{1,3})/);
            if (match) {
              const countryCodeNum = match[1];

              // Mapear códigos numéricos para códigos ISO (básico)
              const countryCodeMap: { [key: string]: string } = {
                '55': 'BR',
                '1': 'US',
                '44': 'GB',
                '33': 'FR',
                '49': 'DE',
                '39': 'IT',
                '34': 'ES',
              };

              userUpdateData.phoneCountryCode =
                countryCodeMap[countryCodeNum] || 'BR';
              userUpdateData.phoneNumber = phone.substring(match[0].length);
            }
          } else {
            // Se não tem +, assumir que é brasileiro
            userUpdateData.phone = phone.startsWith('+55')
              ? phone
              : `+55${phone.replace(/\D/g, '')}`;
            userUpdateData.phoneCountryCode = 'BR';
            userUpdateData.phoneNumber = phone.replace(/\D/g, '');
          }
        } else {
          // Se telefone está vazio, limpar todos os campos relacionados
          userUpdateData.phone = null;
          userUpdateData.phoneCountryCode = null;
          userUpdateData.phoneNumber = null;
        }
      }

      if (Object.keys(userUpdateData).length > 0) {
        console.log(
          '📝 [TEACHER-PROFILE] Atualizando dados do usuário:',
          userUpdateData
        );

        await prisma.user.update({
          where: { id: session.user.id },
          data: userUpdateData,
        });
        console.log('✅ [TEACHER-PROFILE] Dados do usuário atualizados');
      }
    }

    // 🔧 ATUALIZAR DADOS DO PROFESSOR COM VALIDAÇÃO CORRIGIDA
    let teacherChanges: any = {};
    if (teacherData) {
      const allowedTeacherFields = [
        'bio',
        'specialties',
        'instruments',
        'experience',
        'education',
        'achievements',
        'isPublicProfile',
        'profileImage',
        'website',
        'socialMedia',
        'publicBio',
        'highlightedWorks',
        'defaultLessonDuration',
        'maxStudentsPerWeek',
        'timezone',
        'teachingMethod',
        'ageGroups',
        'skillLevels',
        'allowProgressReports',
        'reportPreferences',
      ];

      const teacherUpdateData: any = {};

      Object.keys(teacherData).forEach((key) => {
        if (
          allowedTeacherFields.includes(key) &&
          teacherData[key] !== undefined
        ) {
          const value = teacherData[key];

          // Detectar mudanças para logging
          const oldValue = (oldTeacherData as any)?.[key];

          if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
            teacherChanges[key] = { from: oldValue, to: value };
          }

          switch (key) {
            case 'defaultLessonDuration':
              // Validar duração da aula
              if (typeof value === 'number' && value >= 15 && value <= 240) {
                teacherUpdateData[key] = value;
              }
              break;

            case 'maxStudentsPerWeek':
              // Validar máximo de alunos por semana
              if (typeof value === 'number' && value >= 1 && value <= 200) {
                teacherUpdateData[key] = value;
              }
              break;

            case 'specialties':
            case 'instruments':
            case 'ageGroups':
            case 'skillLevels':
            case 'highlightedWorks':
              // ✅ CORREÇÃO: Validar arrays e garantir que arrays vazios também sejam salvos
              if (Array.isArray(value)) {
                teacherUpdateData[key] = value;
              }
              break;

            case 'timezone':
              // Validar timezone
              if (typeof value === 'string' && value.trim()) {
                teacherUpdateData[key] = value;
              }
              break;

            case 'isPublicProfile':
            case 'allowProgressReports':
              // Validar booleans
              if (typeof value === 'boolean') {
                teacherUpdateData[key] = value;
              }
              break;

            case 'website':
              // ✅ CORREÇÃO: Validar URL corretamente e permitir strings vazias
              if (!value || value.trim() === '') {
                teacherUpdateData[key] = null;
              } else if (typeof value === 'string') {
                // Adicionar protocolo se não tiver
                let url = value.trim();
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                  url = `https://${url}`;
                }
                teacherUpdateData[key] = url;
              }
              break;

            case 'teachingMethod':
              // ✅ CORREÇÃO: Permitir strings vazias e converter para null se vazio
              if (typeof value === 'string') {
                teacherUpdateData[key] = value.trim() || null;
              } else {
                teacherUpdateData[key] = value;
              }
              break;

            case 'socialMedia':
            case 'reportPreferences':
              // ✅ CORREÇÃO: Permitir objetos JSON
              teacherUpdateData[key] = value || {};
              break;

            default:
              // ✅ CORREÇÃO: Para outros campos de string, permitir strings vazias
              if (typeof value === 'string') {
                teacherUpdateData[key] = value.trim() || null;
              } else {
                teacherUpdateData[key] = value;
              }
          }
        }
      });

      if (Object.keys(teacherUpdateData).length > 0) {
        console.log(
          '📝 [TEACHER-PROFILE] Atualizando dados do professor:',
          teacherUpdateData
        );

        await prisma.teacher.update({
          where: { id: existingProfile.id },
          data: teacherUpdateData,
        });
        console.log('✅ [TEACHER-PROFILE] Dados do professor atualizados');
      }
    }

    // 🆕 LOGGING DE ATIVIDADE: PERFIL ATUALIZADO
    try {
      const allChanges = { ...userChanges, ...teacherChanges };

      if (Object.keys(allChanges).length > 0) {
        const activityLogger = createTeacherActivityLogger(session.user.id);

        await activityLogger.teacherProfileUpdated(allChanges);

        console.log(
          `📝 [ACTIVITY] TEACHER_PROFILE_UPDATED registrado para professor ${session.user.id}`,
          { changedFields: Object.keys(allChanges) }
        );
      }
    } catch (loggingError) {
      console.error(
        '❌ [TEACHER-PROFILE] Erro ao registrar atividade:',
        loggingError
      );
      // Não falhar a atualização por causa do logging
    }

    // 🔥 REVALIDAR CACHE ANTES DE BUSCAR OS DADOS ATUALIZADOS
    await revalidateTeacherProfileData(session.user.id);

    // ✅ Buscar perfil atualizado COM TODOS OS CAMPOS
    const updatedProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            phoneCountryCode: true,
            phoneNumber: true,
            city: true,
            state: true,
            country: true,
            image: true,
          },
        },
      },
    });

    // ✅ FORMATAR RESPOSTA COMPLETA
    const formattedProfile = {
      id: updatedProfile!.id,
      userId: updatedProfile!.userId,
      bio: updatedProfile!.bio,
      specialties: updatedProfile!.specialties || [],
      instruments: updatedProfile!.instruments || [],
      experience: updatedProfile!.experience,
      education: updatedProfile!.education,
      achievements: updatedProfile!.achievements,
      isPublicProfile: updatedProfile!.isPublicProfile,
      profileImage: updatedProfile!.profileImage,
      website: updatedProfile!.website,
      socialMedia: updatedProfile!.socialMedia || {},
      publicBio: updatedProfile!.publicBio,
      highlightedWorks: updatedProfile!.highlightedWorks || [],
      defaultLessonDuration: updatedProfile!.defaultLessonDuration,
      maxStudentsPerWeek: updatedProfile!.maxStudentsPerWeek,
      timezone: updatedProfile!.timezone,
      teachingMethod: updatedProfile!.teachingMethod,
      ageGroups: updatedProfile!.ageGroups || [],
      skillLevels: updatedProfile!.skillLevels || [],
      status: updatedProfile!.status,
      isVerified: updatedProfile!.isVerified,
      verifiedAt: updatedProfile!.verifiedAt,
      verifiedBy: updatedProfile!.verifiedBy,
      allowProgressReports: updatedProfile!.allowProgressReports,
      reportPreferences: updatedProfile!.reportPreferences || {},
      totalStudents: updatedProfile!.totalStudents,
      totalLessons: updatedProfile!.totalLessons,
      averageRating: updatedProfile!.averageRating,
      totalReviews: updatedProfile!.totalReviews,
      completionRate: updatedProfile!.completionRate,
      user: updatedProfile!.user,
      createdAt: updatedProfile!.createdAt,
      updatedAt: updatedProfile!.updatedAt,
    };

    console.log(
      `✅ [TEACHER-PROFILE] Perfil atualizado com sucesso, cache revalidado e atividade registrada`
    );

    return NextResponse.json({
      success: true,
      profile: formattedProfile,
      message: 'Perfil atualizado com sucesso',
      activityLogged:
        Object.keys(userChanges).length + Object.keys(teacherChanges).length >
        0,
    });
  } catch (error) {
    console.error('❌ [TEACHER-PROFILE] Erro ao atualizar perfil:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// PATCH - Atualização parcial (campos específicos) COM REVALIDAÇÃO MELHORADA (MANTIDO IGUAL)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
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
      `👨‍🏫🔧 [TEACHER-PROFILE] Atualizando campo ${field} - Ação: ${action} - Valor:`,
      value
    );

    // Verificar se perfil existe
    const existingProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Perfil de professor não encontrado' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Campos array que suportam add/remove
    const arrayFields = [
      'specialties',
      'instruments',
      'ageGroups',
      'skillLevels',
      'highlightedWorks',
    ];

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
        case 'defaultLessonDuration':
          if (typeof value === 'number' && value >= 15 && value <= 240) {
            updateData[field] = value;
          }
          break;
        case 'maxStudentsPerWeek':
          if (typeof value === 'number' && value >= 1 && value <= 200) {
            updateData[field] = value;
          }
          break;
        default:
          updateData[field] = value;
      }
    }

    // Atualizar perfil
    const updatedProfile = await prisma.teacher.update({
      where: { id: existingProfile.id },
      data: updateData,
    });

    // 🔥 REVALIDAR CACHE APÓS ATUALIZAÇÃO
    await revalidateTeacherProfileData(session.user.id);

    console.log(
      `✅ [TEACHER-PROFILE] Campo ${field} atualizado e cache revalidado`
    );

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: `Campo ${field} atualizado com sucesso`,
    });
  } catch (error) {
    console.error('❌ [TEACHER-PROFILE] Erro ao atualizar campo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
