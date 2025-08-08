// app/api/invites/student/decline/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import {
  validateToken,
  markTokenAsUsed,
  logSecurityEvent,
} from '@/app/libs/tokenUtils';

interface Params {
  token: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 400 }
      );
    }

    console.log(`❌ [STUDENT-DECLINE] Processando recusa de convite: ${token}`);

    // Validar token
    const validation = await validateToken(token, 'STUDENT_INVITATION_DECLINE');

    if (!validation.valid) {
      let errorMessage = 'Token inválido';
      let errorCode = 'INVALID_TOKEN';

      if (validation.expired) {
        errorMessage = 'Token expirado.';
        errorCode = 'EXPIRED_TOKEN';
      } else if (validation.used) {
        errorMessage = 'Este link já foi utilizado anteriormente.';
        errorCode = 'USED_TOKEN';
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          errorCode,
        },
        { status: 400 }
      );
    }

    const tokenRecord = validation.token;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: tokenRecord.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isStudent: true,
        studentProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar informações do relacionamento a partir dos metadados do token
    const metadata = tokenRecord.metadata as any;
    const teacherId = metadata?.teacherId;
    const relationshipId = metadata?.relationshipId;

    if (!teacherId || !relationshipId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Token inválido - informações do relacionamento não encontradas',
          errorCode: 'INVALID_METADATA',
        },
        { status: 400 }
      );
    }

    // Buscar o relacionamento e informações do professor
    const relationship = await prisma.teacherStudent.findFirst({
      where: {
        id: relationshipId,
        studentId: user.studentProfile?.id,
      },
      include: {
        teacher: {
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
    });

    const teacherName = relationship
      ? `${relationship.teacher.user.firstName || ''} ${
          relationship.teacher.user.lastName || ''
        }`.trim() || 'Professor'
      : 'Professor';

    // Verificar se o relacionamento ainda existe
    if (!relationship) {
      // Marcar token como usado mesmo assim
      await markTokenAsUsed(token);

      return NextResponse.json({
        success: true,
        message: 'Convite já foi processado anteriormente.',
        alreadyProcessed: true,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    }

    // Recusar o convite - deletar o relacionamento professor-aluno
    await prisma.teacherStudent.delete({
      where: { id: relationshipId },
    });

    // Se o usuário não tem outros professores, remover isStudent flag
    const otherRelationships = await prisma.teacherStudent.count({
      where: {
        studentId: user.studentProfile?.id,
        isActive: true,
      },
    });

    if (otherRelationships === 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isStudent: false, // 🔄 Remover flag de estudante se não tem mais professores
        },
      });
    }

    // Marcar token como usado
    await markTokenAsUsed(token);

    // Log de segurança
    logSecurityEvent('STUDENT_INVITE_DECLINED', user.id, {
      email: user.email,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      teacherId: teacherId,
      relationshipId: relationshipId,
      teacherName: teacherName,
    });

    console.log(
      `❌ [STUDENT-DECLINE] Convite recusado para usuário ${user.id}, relacionamento ${relationshipId} deletado`
    );

    return NextResponse.json({
      success: true,
      message: `Convite recusado. Você não será aluno de ${teacherName}.`,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      teacher: {
        name: teacherName,
      },
    });
  } catch (error) {
    console.error('❌ [STUDENT-DECLINE] Erro ao recusar convite:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
