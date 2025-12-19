// app/api/admin/users/details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é admin
    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar dados completos do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // Compositores favoritos
        favoriteComposers: {
          include: {
            composer: {
              select: {
                id: true,
                name: true,
                fullName: true,
                portraitUrl: true,
                epochName: true,
              },
            },
          },
          take: 10,
          orderBy: { id: 'desc' },
        },

        // Obras favoritas
        favoriteWorks: {
          include: {
            work: {
              select: {
                id: true,
                title: true,
                composer: {
                  select: {
                    name: true,
                    fullName: true,
                  },
                },
                instrumentId: true,
              },
            },
          },
          take: 10,
          orderBy: { id: 'desc' },
        },

        // Partituras favoritas
        favoriteScores: {
          select: {
            id: true,
            scoreTitle: true,
            scoreType: true,
            personalRating: true,
            addedAt: true,
            work: {
              select: {
                id: true,
                title: true,
                composer: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          take: 10,
          orderBy: { addedAt: 'desc' },
        },

        // Instrumentos
        instruments: {
          include: {
            instrument: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },

        // Obras que quer aprender
        wantToLearn: {
          include: {
            work: {
              select: {
                id: true,
                title: true,
                composer: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          take: 10,
          orderBy: { priority: 'desc' },
        },

        // Obras que já aprendeu
        learned: {
          include: {
            work: {
              select: {
                id: true,
                title: true,
                composer: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          take: 10,
          orderBy: { learnedAt: 'desc' },
        },

        // Anotações
        workAnnotations: {
          include: {
            work: {
              select: {
                id: true,
                title: true,
                composer: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },

        // Compositor e Época favoritos (relação direta)
        favoriteComposer: {
          select: {
            id: true,
            name: true,
            fullName: true,
            portraitUrl: true,
            epochName: true,
          },
        },
        favoriteEpoch: {
          select: {
            id: true,
            name: true,
          },
        },

        // Perfil de Professor (se aplicável)
        teacherProfile: {
          include: {
            students: {
              include: {
                student: {
                  select: {
                    userId: true,
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },

        // Perfil de Estudante (se aplicável)
        studentProfile: {
          include: {
            teachers: {
              include: {
                teacher: {
                  select: {
                    userId: true,
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Calcular estatísticas adicionais
    const [totalAnnotations, helpfulAnnotations, totalUploads, totalFavorites] =
      await Promise.all([
        prisma.workAnnotation.count({
          where: { userId: user.id },
        }),
        prisma.workAnnotation.count({
          where: {
            userId: user.id,
            helpfulCount: { gt: 0 },
          },
        }),
        prisma.uploadHistory.count({
          where: {
            userId: user.id,
            action: 'create',
          },
        }),
        prisma.favoriteWork.count({
          where: { userId: user.id },
        }),
        prisma.favoriteComposer.count({
          where: { userId: user.id },
        }),
        prisma.favoriteScore.count({
          where: { userId: user.id },
        }),
      ]);

    // Calcular tempo desde o cadastro
    const joinedDaysAgo = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calcular tempo desde última atividade
    const lastActivityDate = user.lastSeen ?? user.updatedAt;

    const lastSeenMinutesAgo = Math.floor(
      (Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60)
    );

    // Determinar status online
    const isOnline = lastSeenMinutesAgo < 10; // Online se visto nos últimos 10 minutos

    // Montar resposta detalhada
    const detailedUser = {
      // Informações básicas
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      image: user.image,
      bio: user.bio,
      role: user.role,
      userType: user.userType,
      experienceLevel: user.experienceLevel,
      onboardingCompleted: user.onboardingCompleted,
      profilePublic: user.profilePublic,
      showLocation: user.showLocation,

      // Localização
      city: user.city,
      state: user.state,
      country: user.country,

      // Telefone
      phone: user.phone,
      phoneCountryCode: user.phoneCountryCode,
      phoneNumber: user.phoneNumber,

      // Preferências musicais
      favoriteComposerId: user.favoriteComposerId,
      favoriteComposer: user.favoriteComposer,
      favoriteEpochId: user.favoriteEpochId,
      favoriteEpoch: user.favoriteEpoch,
      practiceTimePerWeek: user.practiceTimePerWeek,

      // Status e atividade
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      joinedDaysAgo,
      lastSeenMinutesAgo,
      isOnline,
      lastActivity: user.updatedAt,

      // Estatísticas
      stats: {
        totalAnnotations,
        helpfulAnnotations,
        totalUploads,
        totalFavorites,
        annotationsCount: user.totalAnnotationsCount,
        uploadScore: user.uploadScore,
      },

      // Coleções
      favoriteComposers: user.favoriteComposers,
      favoriteWorks: user.favoriteWorks,
      favoriteScores: user.favoriteScores,
      instruments: user.instruments,
      wantToLearn: user.wantToLearn,
      learned: user.learned,
      annotations: user.workAnnotations,

      // Perfis (professor/estudante)
      teacherProfile: user.teacherProfile,
      studentProfile: user.studentProfile,
      isTeacher: user.isTeacher,
      isStudent: user.isStudent,
    };

    return NextResponse.json({
      success: true,
      user: detailedUser,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro ao buscar detalhes do usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes do usuário' },
      { status: 500 }
    );
  }
}
