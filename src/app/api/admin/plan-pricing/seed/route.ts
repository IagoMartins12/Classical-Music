// app/api/admin/plan-pricing/seed/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { PlanType } from '@prisma/client';
import prisma from '@/app/libs/prismadb';

const INITIAL_PRICING = [
  {
    planType: PlanType.PLUS,
    monthlyPrice: 29.0,
    quarterlyDiscount: 10,
    biannualDiscount: 15,
    yearlyDiscount: 20,
    trialDays: 7,
    displayOrder: 1,
    description: 'Para alunos dedicados que querem acelerar sua evolução',
  },
  {
    planType: PlanType.MENTOR,
    monthlyPrice: 79.0,
    quarterlyDiscount: 10,
    biannualDiscount: 15,
    yearlyDiscount: 20,
    trialDays: 14,
    displayOrder: 2,
    description: 'Para professores iniciantes que querem organizar suas aulas',
  },
  {
    planType: PlanType.MAESTRO,
    monthlyPrice: 149.0,
    quarterlyDiscount: 10,
    biannualDiscount: 15,
    yearlyDiscount: 20,
    trialDays: 30,
    displayOrder: 3,
    description: 'Para professores profissionais com alunos ilimitados',
  },
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é admin
    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = [];

    for (const pricing of INITIAL_PRICING) {
      // Calcular preços com desconto
      const quarterlyPrice =
        pricing.monthlyPrice * 3 * (1 - pricing.quarterlyDiscount / 100);
      const biannualPrice =
        pricing.monthlyPrice * 6 * (1 - pricing.biannualDiscount / 100);
      const yearlyPrice =
        pricing.monthlyPrice * 12 * (1 - pricing.yearlyDiscount / 100);

      // Desativar preços antigos
      await prisma.planPricing.updateMany({
        where: { planType: pricing.planType, isActive: true },
        data: { isActive: false },
      });

      // Criar novo preço
      const created = await prisma.planPricing.create({
        data: {
          ...pricing,
          quarterlyPrice,
          biannualPrice,
          yearlyPrice,
          isActive: true,
        },
      });

      results.push({
        planType: created.planType,
        monthlyPrice: created.monthlyPrice,
        quarterlyPrice: created.quarterlyPrice,
        biannualPrice: created.biannualPrice,
        yearlyPrice: created.yearlyPrice,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Planos populados com sucesso!',
      data: results,
    });
  } catch (error: any) {
    console.error('Error seeding plans:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
