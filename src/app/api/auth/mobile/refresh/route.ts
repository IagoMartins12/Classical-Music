// app/api/auth/mobile/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { refreshAccessToken, verifyRefreshToken } from '@/app/libs/jwtUtils';
import { headers } from 'next/headers';
import { logSecurityEvent } from '@/app/libs/tokenUtils';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = refreshSchema.parse(body);

    // Verificar refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      const headersList = await headers();
      const userIP = headersList.get('x-forwarded-for') || 'unknown';

      logSecurityEvent('MOBILE_REFRESH_INVALID', '', {
        ip: userIP,
        reason: 'invalid_refresh_token',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Refresh token inválido ou expirado',
          code: 'INVALID_REFRESH_TOKEN',
        },
        { status: 401 }
      );
    }

    // Gerar novo access token
    const result = await refreshAccessToken(refreshToken);
    if (!result) {
      const headersList = await headers();
      const userIP = headersList.get('x-forwarded-for') || 'unknown';

      logSecurityEvent('MOBILE_REFRESH_FAILED', decoded.userId, {
        ip: userIP,
        reason: 'user_not_found',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Log de refresh bem-sucedido
    const headersList = await headers();
    const userIP = headersList.get('x-forwarded-for') || 'unknown';

    logSecurityEvent('MOBILE_REFRESH_SUCCESS', decoded.userId, {
      ip: userIP,
      tokenGenerated: true,
    });

    console.log(
      `✅ [MOBILE REFRESH] Token renovado para usuário ${decoded.userId}`
    );

    return NextResponse.json({
      success: true,
      accessToken: result.accessToken,
      message: 'Token renovado com sucesso',
    });
  } catch (error) {
    console.error('❌ [MOBILE REFRESH] Erro:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          validationErrors: error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
