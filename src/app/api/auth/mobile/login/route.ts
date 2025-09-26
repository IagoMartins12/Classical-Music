// app/api/auth/mobile/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/app/libs/prismadb';
import { generateTokens } from '@/app/libs/jwtUtils';
import { headers } from 'next/headers';
import { logSecurityEvent } from '@/app/libs/tokenUtils';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados
    const validatedData = loginSchema.parse(body);
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        hashedPassword: true,
        image: true,
        role: true,
        onboardingCompleted: true,
        userType: true,
        phone: true,
        phoneCountryCode: true,
        phoneNumber: true,
        isStudent: true,
        isTeacher: true,
        favoriteComposerId: true,
        favoriteEpochId: true,
        experienceLevel: true,
        practiceTimePerWeek: true,
        profilePublic: true,
        showLocation: true,
        emailVerified: true,
      },
    });

    if (!user || !user.hashedPassword) {
      // Log de tentativa de login falhada
      const headersList = await headers();
      const userIP = headersList.get('x-forwarded-for') || 'unknown';

      logSecurityEvent('MOBILE_LOGIN_FAILED', '', {
        email: normalizedEmail,
        ip: userIP,
        reason: 'invalid_credentials',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Email ou senha incorretos',
        },
        { status: 401 }
      );
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.hashedPassword
    );

    if (!isValidPassword) {
      // Log de tentativa de login falhada
      const headersList = await headers();
      const userIP = headersList.get('x-forwarded-for') || 'unknown';

      logSecurityEvent('MOBILE_LOGIN_FAILED', user.id, {
        email: normalizedEmail,
        ip: userIP,
        reason: 'invalid_password',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Email ou senha incorretos',
        },
        { status: 401 }
      );
    }

    // Gerar tokens JWT
    const tokens = await generateTokens(user.id);

    if (!tokens) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erro interno ao gerar tokens',
        },
        { status: 500 }
      );
    }

    // Log de login bem-sucedido
    const headersList = await headers();
    const userIP = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    logSecurityEvent('MOBILE_LOGIN_SUCCESS', user.id, {
      email: normalizedEmail,
      ip: userIP,
      userAgent,
      tokenGenerated: true,
    });

    console.log(
      `✅ [MOBILE LOGIN] Usuário ${normalizedEmail} logado com sucesso`
    );

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: tokens.user,
      requiresOnboarding: !user.onboardingCompleted,
    });
  } catch (error) {
    console.error('❌ [MOBILE LOGIN] Erro:', error);

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
