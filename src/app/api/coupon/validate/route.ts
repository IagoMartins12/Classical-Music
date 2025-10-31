// app/api/coupon/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import {
  PlanType,
  calculateFinalPrice,
} from '@/app/libs/subscriptionConstants';

/**
 * POST /api/coupon/validate
 * Valida um cupom de desconto
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { code, planType, billingPeriod } = body;

    // Validações
    if (!code) {
      return NextResponse.json(
        { error: 'Código do cupom obrigatório' },
        { status: 400 }
      );
    }

    if (!planType || !Object.values(PlanType).includes(planType)) {
      return NextResponse.json(
        { error: 'Tipo de plano inválido' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar cupom
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Cupom inválido ou expirado',
        },
        { status: 400 }
      );
    }

    // Verificar se já usou o cupom
    const couponUsage = await prisma.couponUsage.findUnique({
      where: {
        couponId_userId: {
          couponId: coupon.id,
          userId: user.id,
        },
      },
    });

    if (couponUsage) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Você já utilizou este cupom',
        },
        { status: 400 }
      );
    }

    // Verificar limite de usos
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Cupom esgotado',
        },
        { status: 400 }
      );
    }

    // Verificar se cupom é aplicável ao plano
    if (
      coupon.applicablePlans.length > 0 &&
      !coupon.applicablePlans.includes(planType)
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Cupom não aplicável a este plano',
        },
        { status: 400 }
      );
    }

    // Calcular desconto
    const { originalPrice, discount, finalPrice } = calculateFinalPrice(
      planType,
      billingPeriod,
      {
        type: coupon.type as any,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount || undefined,
      }
    );

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        discountValue: coupon.discountValue,
        description: coupon.description,
        extraTrialDays: coupon.extraTrialDays,
      },
      pricing: {
        originalPrice,
        discount,
        finalPrice,
        savings: originalPrice - finalPrice,
        savingsPercentage: (
          ((originalPrice - finalPrice) / originalPrice) *
          100
        ).toFixed(2),
      },
      message: `Cupom aplicado! Você economizou ${(((originalPrice - finalPrice) / originalPrice) * 100).toFixed(0)}%`,
    });
  } catch (error) {
    console.error('[POST /api/coupon/validate] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao validar cupom' },
      { status: 500 }
    );
  }
}
