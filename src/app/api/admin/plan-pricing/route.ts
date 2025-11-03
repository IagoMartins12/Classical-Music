// app/api/admin/plan-pricing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { PlanType } from '@prisma/client';

// GET - Buscar todos os preços dos planos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é admin (role >= 1)
    if (!session?.user?.id || (session.user as any).role < 1) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const planPricing = await prisma.planPricing.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: planPricing });
  } catch (error) {
    console.error('Error fetching plan pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan pricing' },
      { status: 500 }
    );
  }
}

// POST - Criar/Atualizar preço de plano
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é admin (role >= 1)
    if (!session?.user?.id || (session.user as any).role < 1) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      planType,
      monthlyPrice,
      quarterlyDiscount,
      biannualDiscount,
      yearlyDiscount,
      trialDays,
      description,
      features,
    } = body;

    // Validações
    if (!planType || !Object.values(PlanType).includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    if (monthlyPrice < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    // Calcular preços com desconto
    const quarterlyPrice = monthlyPrice * 3 * (1 - quarterlyDiscount / 100);
    const biannualPrice = monthlyPrice * 6 * (1 - biannualDiscount / 100);
    const yearlyPrice = monthlyPrice * 12 * (1 - yearlyDiscount / 100);
    // Desativar preço antigo (se existir)

    const oldPrice = await prisma.planPricing.findFirst({
      where: { planType, isActive: true },
      select: {
        id: true,
        planType: true,
        displayOrder: true,
      },
    });

    const newPricing = await prisma.$transaction(async (tx) => {
      // 1. Desativar todos do plano
      await tx.planPricing.updateMany({
        where: { planType },
        data: { isActive: false },
      });

      // 2. Criar novo ativo
      return tx.planPricing.create({
        data: {
          planType,
          monthlyPrice,
          quarterlyPrice,
          biannualPrice,
          yearlyPrice,
          quarterlyDiscount,
          biannualDiscount,
          yearlyDiscount,
          trialDays: trialDays || 0,
          description,
          features,
          isActive: true,
          displayOrder: oldPrice?.displayOrder ?? 0,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Plan pricing updated successfully',
      data: newPricing,
    });
  } catch (error) {
    console.error('Error updating plan pricing:', error);
    return NextResponse.json(
      { error: 'Failed to update plan pricing' },
      { status: 500 }
    );
  }
}
