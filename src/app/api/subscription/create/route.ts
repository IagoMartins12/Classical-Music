// app/api/subscription/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import {
  PlanType,
  TRIAL_PERIODS,
  calculateFinalPrice,
} from '@/app/libs/subscriptionConstants';
import { updateUserPlanCache } from '@/app/libs/subscriptionChecker';
import { createCheckoutSession } from '@/app/libs/stripeClient'; // ✅ novo import

/**
 * POST /api/subscription/create
 * Cria uma nova assinatura (com trial ou pagamento via Stripe)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { planType, billingPeriod, couponCode } = body;

    // Validações
    if (!planType || !Object.values(PlanType).includes(planType)) {
      return NextResponse.json(
        { error: 'Tipo de plano inválido' },
        { status: 400 }
      );
    }

    if (planType !== PlanType.FREE && !billingPeriod) {
      return NextResponse.json(
        { error: 'Período de cobrança obrigatório para planos pagos' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currentPlan: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já tem assinatura ativa
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['TRIAL', 'ACTIVE'] },
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        {
          error: 'Você já possui uma assinatura ativa',
          subscription: existingSubscription,
        },
        { status: 400 }
      );
    }

    // Verificar cupom (mesma lógica)
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
      });

      if (!coupon) {
        return NextResponse.json(
          { error: 'Cupom inválido ou expirado' },
          { status: 400 }
        );
      }

      const couponUsage = await prisma.couponUsage.findUnique({
        where: {
          couponId_userId: { couponId: coupon.id, userId: user.id },
        },
      });

      if (couponUsage) {
        return NextResponse.json(
          { error: 'Você já utilizou este cupom' },
          { status: 400 }
        );
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: 'Cupom esgotado' }, { status: 400 });
      }

      if (
        coupon.applicablePlans.length > 0 &&
        !coupon.applicablePlans.includes(planType)
      ) {
        return NextResponse.json(
          { error: 'Cupom não aplicável a este plano' },
          { status: 400 }
        );
      }
    }

    // Calcular datas e trial
    const now = new Date();
    const trialDays = TRIAL_PERIODS[planType as keyof typeof TRIAL_PERIODS];
    const trialEndDate =
      trialDays > 0
        ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
        : null;

    // Plano gratuito
    if (planType === PlanType.FREE) {
      const subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planType,
          status: 'ACTIVE',
          startDate: now,
          endDate: null,
          trialEndDate: null,
          price: 0,
          autoRenew: false,
        },
      });

      await updateUserPlanCache(user.id);
      await prisma.subscriptionHistory.create({
        data: {
          subscriptionId: subscription.id,
          userId: user.id,
          action: 'CREATED',
          fromPlan: null,
          toPlan: planType,
          reason: 'Criação de conta',
        },
      });

      revalidateTag(`subscription-${user.id}`);
      return NextResponse.json({
        success: true,
        subscription,
        message: 'Assinatura gratuita criada com sucesso',
      });
    }

    // 🔁 Para planos pagos → criar sessão Stripe
    const userName =
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário';

    if (!user.email) {
      return NextResponse.json(
        {
          error: 'Email não inserido',
        },
        { status: 500 }
      );
    }
    const sessionResult = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      userName,
      planType,
      billingPeriod,
      couponCode: couponCode || undefined,
    });

    if (!sessionResult.success || !sessionResult.sessionId) {
      return NextResponse.json(
        {
          error: 'Erro ao criar sessão de pagamento no Stripe',
          details: sessionResult.error,
        },
        { status: 500 }
      );
    }

    // Calcular preço
    const { finalPrice } = calculateFinalPrice(
      planType,
      billingPeriod,
      coupon
        ? {
            type: coupon.type as any,
            discountValue: coupon.discountValue,
            maxDiscount: coupon.maxDiscount || undefined,
          }
        : undefined
    );

    // Criar registro da assinatura pendente
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planType,
        billingPeriod,
        status: 'TRIAL', // aguardando confirmação de pagamento
        startDate: now,
        endDate: null,
        trialEndDate,
        price: finalPrice,
        autoRenew: true,
        stripeSessionId: sessionResult.sessionId, // novo campo
        stripeCheckoutUrl: sessionResult.url,
        couponId: coupon?.id,
      },
    });

    // Criar histórico
    await prisma.subscriptionHistory.create({
      data: {
        subscriptionId: subscription.id,
        userId: user.id,
        action: 'CREATED',
        fromPlan: user.currentPlan as any,
        toPlan: planType,
        toPrice: finalPrice,
        reason: trialEndDate
          ? 'Iniciando período de teste'
          : 'Assinatura criada',
      },
    });

    // Cupom: registrar uso e incrementar contador
    if (coupon) {
      await prisma.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId: user.id,
          discountApplied:
            finalPrice -
            calculateFinalPrice(planType, billingPeriod).finalPrice,
        },
      });

      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    await updateUserPlanCache(user.id);
    revalidateTag(`subscription-${user.id}`);

    // ✅ Retorna URL de checkout do Stripe para redirecionar
    return NextResponse.json({
      success: true,
      subscription,
      payment: {
        sessionId: sessionResult.sessionId,
        checkoutUrl: sessionResult.url,
      },
      trial: trialEndDate
        ? {
            active: true,
            endsAt: trialEndDate,
            daysRemaining: trialDays,
          }
        : null,
      message: trialEndDate
        ? `Período de teste de ${trialDays} dias iniciado!`
        : 'Redirecionando para o checkout seguro...',
    });
  } catch (error) {
    console.error('[POST /api/subscription/create] Error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar assinatura', details: String(error) },
      { status: 500 }
    );
  }
}
