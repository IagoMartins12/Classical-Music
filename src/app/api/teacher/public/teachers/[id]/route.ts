// app/api/public/teachers/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface DetailedPublicTeacher {
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
  teachingMethod?: string;
  ageGroups: string[];
  skillLevels: string[];

  // Estatísticas
  isVerified: boolean;
  averageRating?: number;
  totalReviews: number;
  totalStudents: number;
  totalLessons: number;
  completionRate?: number;
  teachingSince: Date;

  // Reviews públicos
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    studentName: string; // Anonimizado
    createdAt: Date;
    relationshipDuration?: string;
    wouldRecommend: boolean;
    teachingQuality?: number;
    communication?: number;
    punctuality?: number;
    patience?: number;
  }>;

  // Breakdown das avaliações
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };

  // Destaques das obras que ensina
  highlightedWorksDetails?: Array<{
    id: string;
    title: string;
    composer: string;
    difficulty?: string;
  }>;

  // Informações de contato (se disponível)
  contactInfo?: {
    hasWhatsApp: boolean;
    acceptingStudents: boolean;
    maxStudentsPerWeek: number;
    defaultLessonDuration: number;
  };
}

// Cache do professor específico por 15 minutos
const getCachedTeacherDetails = unstable_cache(
  async (teacherId: string): Promise<DetailedPublicTeacher | null> => {
    console.log(
      `🎓 [TEACHER-DETAILS] Buscando detalhes do professor ${teacherId} (cache miss)`
    );

    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: teacherId,
        isPublicProfile: true,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            phone: true,
            createdAt: true,
          },
        },
        reviews: {
          where: {
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
          take: 20, // Máximo de 20 reviews
        },
      },
    });

    if (!teacher) {
      return null;
    }

    // Calcular breakdown das avaliações
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    teacher.reviews.forEach((review) => {
      ratingBreakdown[review.rating as keyof typeof ratingBreakdown]++;
    });

    // Buscar detalhes das obras destacadas se houver
    let highlightedWorksDetails: any[] = [];
    if (teacher.highlightedWorks.length > 0) {
      // Assumindo que highlightedWorks contém IDs de Work
      try {
        const worksDetails = await prisma.work.findMany({
          where: {
            id: { in: teacher.highlightedWorks },
          },
          include: {
            composer: {
              select: { name: true },
            },
          },
          take: 10, // Máximo de 10 obras destacadas
        });

        highlightedWorksDetails = worksDetails.map((work) => ({
          id: work.id,
          title: work.title,
          composer: work.composer.name,
          difficulty: work.difficultyLevel || work.imslpDifficultyLevel,
        }));
      } catch (error) {
        console.log('⚠️ Erro ao buscar obras destacadas:', error);
      }
    }

    const detailedTeacher: DetailedPublicTeacher = {
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
      teachingMethod: teacher.teachingMethod || undefined,
      ageGroups: teacher.ageGroups,
      skillLevels: teacher.skillLevels,

      // Estatísticas
      isVerified: teacher.isVerified,
      averageRating: teacher.averageRating || undefined,
      totalReviews: teacher.totalReviews,
      totalStudents: teacher.totalStudents,
      totalLessons: teacher.totalLessons,
      completionRate: teacher.completionRate || undefined,
      teachingSince: teacher.createdAt,

      // Reviews formatados e anonimizados
      reviews: teacher.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment || undefined,
        studentName: `${review.student.user.firstName?.charAt(0)}${'*'.repeat(
          Math.max(2, review.student.user.firstName?.length ?? 0 - 1)
        )}`, // Ex: J***
        createdAt: review.createdAt,
        relationshipDuration: review.relationshipDuration || undefined,
        wouldRecommend: review.wouldRecommend,
        teachingQuality: review.teachingQuality || undefined,
        communication: review.communication || undefined,
        punctuality: review.punctuality || undefined,
        patience: review.patience || undefined,
      })),

      ratingBreakdown,

      highlightedWorksDetails:
        highlightedWorksDetails.length > 0
          ? highlightedWorksDetails
          : undefined,

      // Informações de contato
      contactInfo: {
        hasWhatsApp: !!teacher.user.phone,
        acceptingStudents:
          teacher.status === 'ACTIVE' &&
          teacher.totalStudents < teacher.maxStudentsPerWeek,
        maxStudentsPerWeek: teacher.maxStudentsPerWeek,
        defaultLessonDuration: teacher.defaultLessonDuration,
      },
    };

    return detailedTeacher;
  },
  ['teacher-details'],
  {
    revalidate: 900, // 15 minutos
    tags: ['teacher-details'],
  }
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacherId = params.id;

    if (!teacherId) {
      return NextResponse.json(
        { error: 'ID do professor é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `🎓 [TEACHER-DETAILS] Buscando detalhes públicos do professor ${teacherId}`
    );

    // Buscar detalhes do professor (com cache)
    const teacher = await getCachedTeacherDetails(teacherId);

    if (!teacher) {
      return NextResponse.json(
        {
          error: 'Professor não encontrado ou perfil não é público',
        },
        { status: 404 }
      );
    }

    console.log(
      `✅ [TEACHER-DETAILS] Detalhes do professor ${teacherId} carregados`
    );

    return NextResponse.json({
      success: true,
      teacher,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      '❌ [TEACHER-DETAILS] Erro ao buscar detalhes do professor:',
      error
    );
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Expressar interesse em ter aulas (para usuários não logados ou alunos)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacherId = params.id;
    const body = await request.json();
    const {
      studentName,
      studentEmail,
      studentPhone,
      message,
      preferredInstrument,
      experienceLevel,
      preferredSchedule,
    } = body;

    if (!teacherId || !studentName || !studentEmail) {
      return NextResponse.json(
        {
          error: 'ID do professor, nome e email são obrigatórios',
        },
        { status: 400 }
      );
    }

    console.log(
      `📧 [TEACHER-DETAILS] Interesse em aulas para professor ${teacherId}`
    );

    // Verificar se professor existe e é público
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: teacherId,
        isPublicProfile: true,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json(
        {
          error: 'Professor não encontrado ou não está aceitando alunos',
        },
        { status: 404 }
      );
    }

    // TODO: Aqui você pode implementar:
    // 1. Salvar interesse em uma tabela LeadContacts
    // 2. Enviar email para o professor
    // 3. Enviar email de confirmação para o interessado
    // 4. Integrar com sistema de CRM

    // Por enquanto, vamos simular sucesso
    const interestData = {
      teacherId: teacher.id,
      teacherName: `${teacher.user.firstName} ${teacher.user.lastName}`.trim(),
      teacherEmail: teacher.user.email,
      studentName,
      studentEmail,
      studentPhone: studentPhone || null,
      message: message || null,
      preferredInstrument: preferredInstrument || null,
      experienceLevel: experienceLevel || 'BEGINNER',
      preferredSchedule: preferredSchedule || null,
      submittedAt: new Date(),
    };

    console.log('📝 [TEACHER-DETAILS] Dados do interesse:', interestData);

    // TODO: Implementar salvamento e envio de emails
    // await saveLeadContact(interestData);
    // await sendTeacherNotification(interestData);
    // await sendStudentConfirmation(interestData);

    console.log(
      `✅ [TEACHER-DETAILS] Interesse registrado para professor ${teacherId}`
    );

    return NextResponse.json({
      success: true,
      message:
        'Seu interesse foi registrado! O professor entrará em contato em breve.',
      submittedAt: interestData.submittedAt,
    });
  } catch (error) {
    console.error('❌ [TEACHER-DETAILS] Erro ao registrar interesse:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
