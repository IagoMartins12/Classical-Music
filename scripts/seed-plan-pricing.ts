// scripts/seed-plan-pricing.ts
// Execute: npx tsx scripts/seed-plan-pricing.ts

import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient();

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

async function main() {
  console.log('🌱 Seeding plan pricing...');

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

    console.log(`✅ ${created.planType}: R$ ${created.monthlyPrice}/mês`);
    console.log(
      `   Trimestral: R$ ${created.quarterlyPrice?.toFixed(2)} (-${pricing.quarterlyDiscount}%)`
    );
    console.log(
      `   Semestral: R$ ${created.biannualPrice?.toFixed(2)} (-${pricing.biannualDiscount}%)`
    );
    console.log(
      `   Anual: R$ ${created.yearlyPrice?.toFixed(2)} (-${pricing.yearlyDiscount}%)`
    );
  }

  console.log('\n✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
