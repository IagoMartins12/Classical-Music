// app/api/pricing/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { PlanType } from '@prisma/client';

export const revalidate = 3600;

// Tipo para garantir retorno seguro e tipado
type PricingData = {
  monthly: number;
  quarterly: {
    price: number;
    discount: number;
    monthlyEquivalent: number;
    savings: number;
  };
  biannual: {
    price: number;
    discount: number;
    monthlyEquivalent: number;
    savings: number;
  };
  yearly: {
    price: number;
    discount: number;
    monthlyEquivalent: number;
    savings: number;
  };
  trialDays: number;
  description?: string;
};

export async function GET() {
  try {
    const planPricing = await prisma.planPricing.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        planType: true,
        monthlyPrice: true,
        quarterlyPrice: true,
        biannualPrice: true,
        yearlyPrice: true,
        quarterlyDiscount: true,
        biannualDiscount: true,
        yearlyDiscount: true,
        trialDays: true,
        description: true,
      },
    });

    // ✅ Tipagem correta do reduce
    const formattedPricing: Record<PlanType, PricingData> = planPricing.reduce(
      (acc, plan) => {
        acc[plan.planType] = {
          monthly: plan.monthlyPrice,
          quarterly: {
            price: plan.quarterlyPrice ?? 0,
            discount: plan.quarterlyDiscount,
            monthlyEquivalent: (plan.quarterlyPrice ?? 0) / 3,
            savings: plan.monthlyPrice * 3 - (plan.quarterlyPrice ?? 0),
          },
          biannual: {
            price: plan.biannualPrice ?? 0,
            discount: plan.biannualDiscount,
            monthlyEquivalent: (plan.biannualPrice ?? 0) / 6,
            savings: plan.monthlyPrice * 6 - (plan.biannualPrice ?? 0),
          },
          yearly: {
            price: plan.yearlyPrice ?? 0,
            discount: plan.yearlyDiscount,
            monthlyEquivalent: (plan.yearlyPrice ?? 0) / 12,
            savings: plan.monthlyPrice * 12 - (plan.yearlyPrice ?? 0),
          },
          trialDays: plan.trialDays,
          description: plan.description ?? undefined, // ✅ remove null
        };
        return acc;
      },
      {} as Record<PlanType, PricingData>
    );

    return NextResponse.json(
      {
        success: true,
        data: formattedPricing,
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}
