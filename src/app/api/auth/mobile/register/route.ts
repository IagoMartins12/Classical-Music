// app/api/auth/mobile/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/app/libs/prismadb';
import { generateTokens } from '@/app/libs/jwtUtils';
import { headers } from 'next/headers';
import {
  logSecurityEvent,
  createToken,
  createTokenUrl,
} from '@/app/libs/tokenUtils';
import { sendTemplateEmail } from '@/app/libs/newsletter/email';

const registerSchema = z.object({
  username: z
    .string()
    .min(2, 'Nome de usuário deve ter pelo menos 2 caracteres')
    .max(50)
    .regex(/^\S+$/, 'Nome de usuário não pode conter espaços')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Nome de usuário só pode conter letras, números, _ e -'
    ),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados
    const validatedData = registerSchema.parse(body);
    const normalizedEmail = validatedData.email.toLowerCase().trim();
    const normalizedUsername = validatedData.username.trim();

    // Verificar se email já existe
    const existingUserEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUserEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Um usuário com este email já existe',
        },
        { status: 409 }
      );
    }

    // Verificar se username já existe
    const existingUserUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: normalizedUsername,
          mode: 'insensitive',
        },
      },
    });

    if (existingUserUsername) {
      return NextResponse.json(
        {
          success: false,
          error: 'Um usuário com este nome de usuário já existe',
        },
        { status: 409 }
      );
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      saltRounds
    );

    // Headers para logs
    const headersList = await headers();
    const userIP = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        firstName: normalizedUsername,
        username: normalizedUsername,
        email: normalizedEmail,
        hashedPassword,
        role: 0,
        onboardingCompleted: false,
        profilePublic: true,
        showLocation: false,
        emailVerified: null, // Precisa confirmar email
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
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
        createdAt: true,
      },
    });

    console.log(
      `✅ [MOBILE REGISTER] Usuário ${normalizedEmail} criado com sucesso`
    );

    // Gerar tokens JWT imediatamente (para UX melhor)
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

    // Enviar email de confirmação (não bloquear resposta)
    try {
      const confirmationToken = await createToken({
        userId: user.id,
        type: 'EMAIL_CONFIRMATION',
        expiresInHours: 24,
        ipAddress: userIP,
        userAgent,
        metadata: {
          registrationTime: new Date().toISOString(),
          emailAddress: normalizedEmail,
          platform: 'mobile',
        },
      });

      const confirmationUrl = createTokenUrl(
        process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'confirm-account',
        confirmationToken
      );

      const emailResult = await sendTemplateEmail(normalizedEmail, {
        type: 'ACCOUNT_CONFIRMATION',
        variables: {
          firstName: user.firstName || 'Usuário',
          confirmationUrl,
        },
      });

      if (emailResult.success) {
        logSecurityEvent('MOBILE_USER_REGISTERED_WITH_CONFIRMATION', user.id, {
          email: normalizedEmail,
          username: normalizedUsername,
          ip: userIP,
          userAgent,
          emailProvider: emailResult.provider,
        });
      } else {
        logSecurityEvent('MOBILE_USER_REGISTERED_EMAIL_FAILED', user.id, {
          email: normalizedEmail,
          username: normalizedUsername,
          ip: userIP,
          emailError: emailResult.error,
        });
      }
    } catch (emailError) {
      console.error('❌ [MOBILE REGISTER] Erro ao enviar email:', emailError);

      logSecurityEvent('MOBILE_USER_REGISTERED_EMAIL_ERROR', user.id, {
        email: normalizedEmail,
        username: normalizedUsername,
        ip: userIP,
        emailError:
          emailError instanceof Error ? emailError.message : 'Unknown error',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso! Verifique seu email para confirmar.',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: tokens.user,
      requiresOnboarding: true,
      emailConfirmationRequired: true,
    });
  } catch (error) {
    console.error('❌ [MOBILE REGISTER] Erro:', error);

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

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('email')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Um usuário com este email já existe',
          },
          { status: 409 }
        );
      }
      if (error.message.includes('username')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Um usuário com este nome de usuário já existe',
          },
          { status: 409 }
        );
      }
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
