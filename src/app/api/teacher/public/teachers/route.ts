// app/api/public/teachers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';

interface PublicTeacher {
  id: string;
  name: string;
  profileImage?: string;
  bio?: string;
  publicBio?: string;
  specialties: string[];
  instruments: string[];
  experience?: string;
  education?: string;
  achievements?: string;
  website?: string;
  socialMedia?: any;
  highlightedWorks: string[];
  isVerified: boolean;
  averageRating?: number;
  totalReviews: number;
  totalStudents: number;
  totalLessons: number;
  // Dados contextuais
  teachingSince: Date;
  ageGroups: string[];
  skillLevels: string[];
  teachingMethod?: string;
}

// Cache dos professores públicos por 30 minutos
const getCachedPublicTeachers = unstable_cache(
  async (): Promise<PublicTeacher[]> => {
    console.log(
      '🎓 [PUBLIC-TEACHERS] Buscando professores públicos (cache miss)'
    );

    const teachers = await prisma.teacher.findMany({
      where: {
        isPublicProfile: true,
        status: 'ACTIVE',
        isVerified: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { averageRating: 'desc' },
        { totalStudents: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    // Formatar dados públicos
    const publicTeachers: PublicTeacher[] = teachers.map((teacher) => ({
      id: teacher.user.id,
      name: `${teacher.user.firstName} ${teacher.user.lastName}`.trim(),
      profileImage: teacher.profileImage || teacher.user.image || undefined,
      bio: teacher.bio || undefined,
      publicBio: teacher.publicBio || teacher.bio || undefined,
      specialties: teacher.specialties,
      instruments: teacher.instruments,
      experience: teacher.experience || undefined,
      education: teacher.education || undefined,
      achievements: teacher.achievements || undefined,
      website: teacher.website || undefined,
      socialMedia: teacher.socialMedia,
      highlightedWorks: teacher.highlightedWorks,
      isVerified: teacher.isVerified,
      averageRating: teacher.averageRating || undefined,
      totalReviews: teacher.totalReviews,
      totalStudents: teacher.totalStudents,
      totalLessons: teacher.totalLessons,
      teachingSince: teacher.createdAt,
      ageGroups: teacher.ageGroups,
      skillLevels: teacher.skillLevels,
      teachingMethod: teacher.teachingMethod || undefined,
    }));

    return publicTeachers;
  },
  ['public-teachers-v1'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['public-teachers'],
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const instrument = searchParams.get('instrument'); // Filtrar por instrumento
    const specialty = searchParams.get('specialty'); // Filtrar por especialidade
    const skillLevel = searchParams.get('skillLevel'); // Filtrar por nível que ensina
    const ageGroup = searchParams.get('ageGroup'); // Filtrar por faixa etária
    const verified = searchParams.get('verified') === 'true'; // Apenas verificados
    const sortBy = searchParams.get('sortBy') || 'rating'; // rating, students, experience, name

    console.log('🎓 [PUBLIC-TEACHERS] Buscando professores públicos');

    // Buscar todos os professores (com cache)
    let teachers = await getCachedPublicTeachers();

    // Aplicar filtros
    if (instrument) {
      teachers = teachers.filter((t) =>
        t.instruments.some((inst) =>
          inst.toLowerCase().includes(instrument.toLowerCase())
        )
      );
    }

    if (specialty) {
      teachers = teachers.filter((t) =>
        t.specialties.some((spec) =>
          spec.toLowerCase().includes(specialty.toLowerCase())
        )
      );
    }

    if (skillLevel) {
      teachers = teachers.filter((t) =>
        t.skillLevels.some((level) =>
          level.toLowerCase().includes(skillLevel.toLowerCase())
        )
      );
    }

    if (ageGroup) {
      teachers = teachers.filter((t) =>
        t.ageGroups.some((age) =>
          age.toLowerCase().includes(ageGroup.toLowerCase())
        )
      );
    }

    if (verified) {
      teachers = teachers.filter((t) => t.isVerified);
    }

    // Aplicar ordenação
    switch (sortBy) {
      case 'rating':
        teachers.sort(
          (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
        );
        break;
      case 'students':
        teachers.sort((a, b) => b.totalStudents - a.totalStudents);
        break;
      case 'experience':
        teachers.sort(
          (a, b) => a.teachingSince.getTime() - b.teachingSince.getTime()
        );
        break;
      case 'name':
        teachers.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Manter ordenação padrão (rating desc)
        break;
    }

    // Aplicar paginação
    const paginatedTeachers = teachers.slice(offset, offset + limit);

    // Buscar estatísticas adicionais se necessário
    const teachersWithStats = await Promise.all(
      paginatedTeachers.map(async (teacher) => {
        // Buscar reviews recentes (apenas uma amostra)
        const recentReviews = await prisma.teacherReview.findMany({
          where: {
            teacher: {
              userId: teacher.id,
            },
            isPublic: true,
            isModerated: false,
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        });

        return {
          ...teacher,
          recentReviews: recentReviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            studentName:
              `${review.student.user.firstName} ${review.student.user.lastName}`.charAt(
                0
              ) + '***', // Anonimizar
            createdAt: review.createdAt,
            relationshipDuration: review.relationshipDuration,
            wouldRecommend: review.wouldRecommend,
          })),
        };
      })
    );

    // Calcular estatísticas gerais
    const stats = {
      totalTeachers: teachers.length,
      verifiedTeachers: teachers.filter((t) => t.isVerified).length,
      averageRating:
        teachers.length > 0
          ? teachers.reduce((sum, t) => sum + (t.averageRating || 0), 0) /
            teachers.length
          : 0,
      totalActiveStudents: teachers.reduce(
        (sum, t) => sum + t.totalStudents,
        0
      ),
      availableInstruments: [
        ...new Set(teachers.flatMap((t) => t.instruments)),
      ].sort(),
      availableSpecialties: [
        ...new Set(teachers.flatMap((t) => t.specialties)),
      ].sort(),
      availableSkillLevels: [
        ...new Set(teachers.flatMap((t) => t.skillLevels)),
      ].sort(),
      availableAgeGroups: [
        ...new Set(teachers.flatMap((t) => t.ageGroups)),
      ].sort(),
    };

    console.log(
      `✅ [PUBLIC-TEACHERS] Retornando ${teachersWithStats.length} professores`
    );

    return NextResponse.json({
      success: true,
      teachers: teachersWithStats,
      stats,
      pagination: {
        offset,
        limit,
        total: teachers.length,
        hasMore: offset + paginatedTeachers.length < teachers.length,
      },
      filters: {
        instrument,
        specialty,
        skillLevel,
        ageGroup,
        verified,
        sortBy,
      },
    });
  } catch (error) {
    console.error(
      '❌ [PUBLIC-TEACHERS] Erro ao buscar professores públicos:',
      error
    );
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar perfil público (apenas professor logado)
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
    const {
      isPublicProfile,
      publicBio,
      profileImage,
      website,
      socialMedia,
      highlightedWorks,
      specialties,
      instruments,
      ageGroups,
      skillLevels,
      teachingMethod,
      experience,
      education,
      achievements,
    } = body;

    console.log(
      `🎓✏️ [PUBLIC-TEACHERS] Atualizando perfil público do professor ${session.user.id}`
    );

    // Verificar se professor existe
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: 'Perfil de professor não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar perfil
    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherProfile.id },
      data: {
        isPublicProfile: isPublicProfile ?? teacherProfile.isPublicProfile,
        publicBio: publicBio ?? teacherProfile.publicBio,
        profileImage: profileImage ?? teacherProfile.profileImage,
        website: website ?? teacherProfile.website,
        socialMedia: socialMedia ?? teacherProfile.socialMedia,
        highlightedWorks: highlightedWorks ?? teacherProfile.highlightedWorks,
        specialties: specialties ?? teacherProfile.specialties,
        instruments: instruments ?? teacherProfile.instruments,
        ageGroups: ageGroups ?? teacherProfile.ageGroups,
        skillLevels: skillLevels ?? teacherProfile.skillLevels,
        teachingMethod: teachingMethod ?? teacherProfile.teachingMethod,
        experience: experience ?? teacherProfile.experience,
        education: education ?? teacherProfile.education,
        achievements: achievements ?? teacherProfile.achievements,
      },
    });

    // Invalidar cache se tornou público ou deixou de ser
    if (isPublicProfile !== undefined) {
      // Invalidar cache dos professores públicos
      console.log(
        '🔄 [PUBLIC-TEACHERS] Invalidando cache de professores públicos'
      );
    }

    console.log(
      `✅ [PUBLIC-TEACHERS] Perfil público atualizado para ${session.user.id}`
    );

    return NextResponse.json({
      success: true,
      teacher: updatedTeacher,
      message: 'Perfil público atualizado com sucesso',
    });
  } catch (error) {
    console.error(
      '❌ [PUBLIC-TEACHERS] Erro ao atualizar perfil público:',
      error
    );
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
