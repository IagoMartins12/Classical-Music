// app/api/invites/teacher/decline/[token]/route.ts
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

    console.log(`❌ [TEACHER-DECLINE] Processando recusa de convite: ${token}`);

    // Validar token
    const validation = await validateToken(token, 'TEACHER_INVITATION_DECLINE');

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
        role: true,
        isTeacher: true,
        teacherProfile: {
          select: {
            id: true,
            status: true,
            isVerified: true,
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

    // Verificar se já foi processado
    if (user.role !== 1) {
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

    // Recusar o convite - voltar role para 0
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: 0, // 🔄 Voltar para usuário comum
        isTeacher: false,
      },
    });

    // Desativar Teacher profile se existir
    if (user.teacherProfile) {
      await prisma.teacher.update({
        where: { userId: user.id },
        data: {
          status: 'INACTIVE',
          isVerified: false,
        },
      });
    }

    // Marcar token como usado
    await markTokenAsUsed(token);

    // Log de segurança
    logSecurityEvent('TEACHER_INVITE_DECLINED', user.id, {
      email: user.email,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      teacherProfileId: user.teacherProfile?.id,
    });

    console.log(
      `❌ [TEACHER-DECLINE] Convite recusado para usuário ${user.id}, role voltou para 0`
    );

    return NextResponse.json({
      success: true,
      message: 'Convite recusado. Sua conta voltou ao status de usuário comum.',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ [TEACHER-DECLINE] Erro ao recusar convite:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
