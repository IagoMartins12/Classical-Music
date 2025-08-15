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

    // Primeiro buscar o perfil de professor do usuário atual
    const currentTeacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!currentTeacher) {
      return NextResponse.json(
        { error: 'Perfil de professor não encontrado' },
        { status: 404 }
      );
    }

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
                teacherId: currentTeacher.id, // Filtrar apenas relacionamentos com este professor
              },
              select: {
                id: true,
                teacherId: true,
                isActive: true,
                startDate: true,
                inviteStatus: true,
                inviteAcceptedAt: true,
                inviteDeclinedAt: true,
              },
            },
          },
        },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      take: limit,
    });

    console.log(
      `📊 [TEACHER-SEARCH] Professor ID: ${currentTeacher.id}, Encontrados: ${potentialStudents.length} usuários`
    );

    // Formatar resultado
    const studentsFormatted = potentialStudents.map((user) => {
      // Como já filtramos na query, se existe relacionamento, é com este professor
      const existingRelationship = user.studentProfile?.teachers?.[0];
      const isAlreadyStudent = !!existingRelationship;

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
        relationshipId: existingRelationship?.id || null,
        relationshipStartDate: existingRelationship?.startDate || null,
        relationshipIsActive: existingRelationship?.isActive || false,
        inviteStatus: existingRelationship?.inviteStatus || null,
        inviteAcceptedAt: existingRelationship?.inviteAcceptedAt || null,
        inviteDeclinedAt: existingRelationship?.inviteDeclinedAt || null,
        hasStudentProfile: !!user.studentProfile,
      };
    });

    const activeStudents = studentsFormatted.filter(
      (s) => s.isAlreadyStudent && s.relationshipIsActive
    );
    const pendingInvites = studentsFormatted.filter(
      (s) => s.isAlreadyStudent && s.inviteStatus === 'PENDING'
    );
    const availableStudents = studentsFormatted.filter(
      (s) => !s.isAlreadyStudent
    );

    console.log(
      `✅ [TEACHER-SEARCH] Resultados: ${activeStudents.length} ativos, ${pendingInvites.length} pendentes, ${availableStudents.length} disponíveis`
    );

    return NextResponse.json({
      success: true,
      students: studentsFormatted,
      total: studentsFormatted.length,
      searchTerm: email,
      summary: {
        total: studentsFormatted.length,
        active: activeStudents.length,
        pending: pendingInvites.length,
        available: availableStudents.length,
      },
    });
  } catch (error) {
    console.error('❌ [TEACHER-SEARCH] Erro na busca de alunos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
