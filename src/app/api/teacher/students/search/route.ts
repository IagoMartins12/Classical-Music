// app/api/teacher/students/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é professor (role 1)
    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!email || email.trim().length < 3) {
      return NextResponse.json({
        success: true,
        students: [],
        message: 'Digite pelo menos 3 caracteres do email',
      });
    }

    console.log(
      `🔍 [TEACHER-SEARCH] Professor ${session.user.id} buscando: ${email}`
    );

    // Buscar usuários com role 0 (alunos) por email
    const potentialStudents = await prisma.user.findMany({
      where: {
        role: 0, // Apenas alunos
        email: {
          contains: email.trim(),
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        createdAt: true,
        city: true,
        state: true,
        experienceLevel: true,

        // Verificar se já é nosso aluno
        studentProfile: {
          select: {
            id: true,
            level: true,
            mainInstrument: true,
            teachers: {
              where: {
                teacherId: session.user.id,
                isActive: true,
              },
              select: {
                id: true,
                isActive: true,
                startDate: true,
              },
            },
          },
        },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      take: limit,
    });

    // Formatar resultado
    const studentsFormatted = potentialStudents.map((user) => {
      const isAlreadyStudent =
        user.studentProfile?.teachers &&
        user.studentProfile?.teachers?.length > 0;
      const relationshipData = user.studentProfile?.teachers?.[0];

      return {
        id: user.id,
        name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sem nome',
        email: user.email,
        image: user.image,
        location: [user.city, user.state].filter(Boolean).join(', ') || null,
        experienceLevel: user.experienceLevel,
        mainInstrument: user.studentProfile?.mainInstrument || null,
        studentLevel: user.studentProfile?.level || null,
        createdAt: user.createdAt,
        // Status do relacionamento
        isAlreadyStudent,
        relationshipId: relationshipData?.id || null,
        relationshipStartDate: relationshipData?.startDate || null,
        hasStudentProfile: !!user.studentProfile,
      };
    });

    console.log(
      `✅ [TEACHER-SEARCH] Encontrados ${studentsFormatted.length} alunos potenciais`
    );

    return NextResponse.json({
      success: true,
      students: studentsFormatted,
      total: studentsFormatted.length,
      searchTerm: email,
    });
  } catch (error) {
    console.error('❌ [TEACHER-SEARCH] Erro na busca de alunos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
