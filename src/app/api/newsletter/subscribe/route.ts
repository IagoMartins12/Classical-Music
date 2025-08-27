// app/api/newsletter/subscribe/route.ts - VERSÃO COMPLETA CORRIGIDA
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import {
  createToken,
  logSecurityEvent,
  createTokenUrl,
} from '@/app/libs/tokenUtils';
import { sendTemplateEmail } from '@/app/libs/newsletter/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      interests = [],
      frequency = 'weekly',
      sourceUrl,
      utmSource,
    } = body;

    // Validações básicas
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Obter informações da requisição
    const userIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // VERIFICAR SE EMAIL JÁ ESTÁ CADASTRADO
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        status: true,
        firstName: true,
        subscribedAt: true,
        confirmedAt: true,
      },
    });

    // Se email já existe, tratar conforme o status
    if (existingSubscriber) {
      switch (existingSubscriber.status) {
        case 'ACTIVE':
          return NextResponse.json({
            success: false,
            error: 'Este email já está inscrito na nossa newsletter',
            errorCode: 'ALREADY_SUBSCRIBED',
            status: 'ACTIVE',
            subscribedAt: existingSubscriber.subscribedAt.toISOString(),
            message:
              'Você já está recebendo nossa newsletter. Se não está recebendo os emails, verifique sua caixa de spam.',
          });

        case 'PENDING':
          // Oferecer opção de reenviar confirmação
          return NextResponse.json({
            success: false,
            error: 'Este email já foi cadastrado mas ainda não foi confirmado',
            errorCode: 'PENDING_CONFIRMATION',
            status: 'PENDING',
            subscribedAt: existingSubscriber.subscribedAt.toISOString(),
            message:
              'Verifique seu email para confirmar a inscrição ou solicite um novo link.',
            canResendConfirmation: true,
          });

        case 'UNSUBSCRIBED':
          // Permitir reinscrição - atualizar registro existente
          const resubscribeToken = await createToken({
            userId: undefined,
            type: 'NEWSLETTER_CONFIRMATION',
            ipAddress: userIP,
            userAgent,
            anonymousEmail: normalizedEmail,
            expiresInHours: 48,
          });

          // Criar token de unsubscribe
          const resubscribeUnsubToken = await createToken({
            userId: undefined,
            type: 'NEWSLETTER_UNSUBSCRIBE',
            ipAddress: userIP,
            userAgent,
            anonymousEmail: normalizedEmail,
            expiresInHours: 24 * 365, // 1 ano
          });

          const resubConfirmationUrl = createTokenUrl(
            process.env.NEXTAUTH_URL || 'http://localhost:3000',
            'newsletter/confirm',
            resubscribeToken
          );

          const resubUnsubscribeUrl = createTokenUrl(
            process.env.NEXTAUTH_URL || 'http://localhost:3000',
            'newsletter/unsubscribe',
            resubscribeUnsubToken
          );

          // Atualizar subscriber existente
          await prisma.newsletterSubscriber.update({
            where: { id: existingSubscriber.id },
            data: {
              status: 'PENDING',
              firstName: firstName?.trim() || existingSubscriber.firstName,
              subscribedAt: new Date(),
              confirmedAt: null,
              unsubscribedAt: null,
              unsubscribeReason: null,
              preferences: interests.length > 0 ? { interests } : undefined,
              frequency,
              sourceUrl,
              referralSource: utmSource,
              ipAddress: userIP,
              userAgent,
            },
          });

          // Enviar email de re-confirmação
          const resubEmailResult = await sendTemplateEmail(normalizedEmail, {
            type: 'WELCOME',
            variables: {
              firstName: firstName || existingSubscriber.firstName || 'Usuário',
              confirmationUrl: resubConfirmationUrl,
              unsubscribeUrl: resubUnsubscribeUrl,
            },
          });

          if (!resubEmailResult.success) {
            return NextResponse.json(
              { success: false, error: 'Erro ao enviar email de confirmação' },
              { status: 500 }
            );
          }

          logSecurityEvent('NEWSLETTER_RESUBSCRIBED', existingSubscriber.id, {
            email: normalizedEmail,
            ip: userIP,
            source: utmSource,
          });

          return NextResponse.json({
            success: true,
            message: 'Bem-vindo de volta! Enviamos um email de confirmação.',
            status: 'RESUBSCRIBED',
            needsConfirmation: true,
          });

        case 'BOUNCED':
          return NextResponse.json({
            success: false,
            error: 'Este email teve problemas de entrega anteriormente',
            errorCode: 'EMAIL_BOUNCED',
            status: 'BOUNCED',
            message:
              'Verifique se o endereço de email está correto ou use outro email.',
          });

        case 'BLOCKED':
          return NextResponse.json({
            success: false,
            error: 'Este email foi bloqueado',
            errorCode: 'EMAIL_BLOCKED',
            status: 'BLOCKED',
            message: 'Entre em contato conosco se acredita que isso é um erro.',
          });

        default:
          return NextResponse.json({
            success: false,
            error: 'Status de email desconhecido',
            errorCode: 'UNKNOWN_STATUS',
          });
      }
    }

    // EMAIL NÃO EXISTE - CRIAR NOVA INSCRIÇÃO

    // Verificar se é usuário registrado
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    // CRIAR TOKEN DE CONFIRMAÇÃO
    const confirmationToken = await createToken({
      userId: existingUser?.id,
      type: 'NEWSLETTER_CONFIRMATION',
      ipAddress: userIP,
      userAgent,
      anonymousEmail: !existingUser ? normalizedEmail : undefined,
      expiresInHours: 48,
    });

    // CRIAR TOKEN DE UNSUBSCRIBE
    const unsubscribeToken = await createToken({
      userId: existingUser?.id,
      type: 'NEWSLETTER_UNSUBSCRIBE',
      ipAddress: userIP,
      userAgent,
      anonymousEmail: !existingUser ? normalizedEmail : undefined,
      expiresInHours: 24 * 365, // 1 ano
    });

    const confirmationUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'newsletter/confirm',
      confirmationToken
    );

    const unsubscribeUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'newsletter/unsubscribe',
      unsubscribeToken
    );

    // Criar novo subscriber
    const newSubscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        firstName: firstName?.trim() || existingUser?.firstName || null,
        lastName: lastName?.trim() || existingUser?.lastName || null,
        userId: existingUser?.id || null,
        status: 'PENDING',
        preferences: interests.length > 0 ? { interests } : null,
        frequency,
        sourceUrl,
        referralSource: utmSource,
        ipAddress: userIP,
        userAgent,
      },
    });

    // Enviar email de confirmação
    const emailResult = await sendTemplateEmail(normalizedEmail, {
      type: 'WELCOME',
      variables: {
        firstName: firstName || existingUser?.firstName || 'Usuário',
        confirmationUrl,
        unsubscribeUrl,
      },
    });

    if (!emailResult.success) {
      // Se falhar o envio, deletar o subscriber criado
      await prisma.newsletterSubscriber.delete({
        where: { id: newSubscriber.id },
      });

      return NextResponse.json(
        { success: false, error: 'Erro ao enviar email de confirmação' },
        { status: 500 }
      );
    }

    // Log de segurança
    logSecurityEvent('NEWSLETTER_SUBSCRIBED', existingUser?.id || 'anonymous', {
      email: normalizedEmail,
      ip: userIP,
      source: utmSource,
      hasUserAccount: !!existingUser,
    });

    return NextResponse.json({
      success: true,
      message: 'Inscrição realizada! Verifique seu email para confirmar.',
      status: 'PENDING',
      needsConfirmation: true,
      subscriber: {
        email: normalizedEmail,
        firstName: firstName || existingUser?.firstName,
        subscribedAt: newSubscriber.subscribedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro na inscrição da newsletter:', error);

    logSecurityEvent('NEWSLETTER_SUBSCRIPTION_ERROR', '', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(
      { success: false, error: 'Erro interno. Tente novamente.' },
      { status: 500 }
    );
  }
}

// MÉTODO PUT para reenviar confirmação
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, action } = body;

    if (action !== 'resend-confirmation') {
      return NextResponse.json(
        { success: false, error: 'Ação inválida' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Buscar subscriber
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Email não encontrado' },
        { status: 404 }
      );
    }

    if (subscriber.status === 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Email já está confirmado' },
        { status: 400 }
      );
    }

    if (subscriber.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Status de email inválido para reenvio' },
        { status: 400 }
      );
    }

    // Criar novo token
    const userIP = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // CRIAR TOKEN DE CONFIRMAÇÃO
    const newConfirmationToken = await createToken({
      userId: subscriber.userId || undefined,
      type: 'NEWSLETTER_CONFIRMATION',
      ipAddress: userIP,
      userAgent,
      anonymousEmail: !subscriber.userId ? normalizedEmail : undefined,
      expiresInHours: 48,
    });

    // CRIAR TOKEN DE UNSUBSCRIBE
    const newUnsubscribeToken = await createToken({
      userId: subscriber.userId || undefined,
      type: 'NEWSLETTER_UNSUBSCRIBE',
      ipAddress: userIP,
      userAgent,
      anonymousEmail: !subscriber.userId ? normalizedEmail : undefined,
      expiresInHours: 24 * 365, // 1 ano
    });

    const confirmationUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'newsletter/confirm',
      newConfirmationToken
    );

    const unsubscribeUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'newsletter/unsubscribe',
      newUnsubscribeToken
    );

    // Reenviar email
    const emailResult = await sendTemplateEmail(normalizedEmail, {
      type: 'WELCOME',
      variables: {
        firstName: subscriber.firstName || 'Usuário',
        confirmationUrl,
        unsubscribeUrl,
      },
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Erro ao reenviar email' },
        { status: 500 }
      );
    }

    logSecurityEvent('NEWSLETTER_CONFIRMATION_RESENT', subscriber.id, {
      email: normalizedEmail,
      ip: userIP,
    });

    return NextResponse.json({
      success: true,
      message: 'Email de confirmação reenviado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao reenviar confirmação:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    );
  }
}
