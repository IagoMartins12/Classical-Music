// app/pricing/page.tsx - Otimizado para SEO de Planos e Conversão
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { Metadata } from 'next';
import PricingPage from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';
import prisma from '@/app/libs/prismadb';
import { PlanType } from '@prisma/client';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Planos e Preços - Opus Atlas | Aluno Plus, Mentor e Maestro',
      description:
        'Escolha o plano perfeito para sua jornada musical. Free para sempre, Plus para alunos dedicados (R$ 29/mês), Mentor para professores iniciantes (R$ 79/mês) e Maestro para profissionais (R$ 149/mês). Teste grátis, cancele quando quiser.',
      keywords: [
        'planos opus atlas',
        'preços opus atlas',
        'assinatura música clássica',
        'plano aluno música',
        'plano professor música',
        'quanto custa opus atlas',
        'free trial música clássica',
        'professor de piano online',
        'professor de violino online',
        'aulas de música online',
        'plataforma ensino música',
        'software gestão alunos música',
        'app para professores de música',
        'estudar piano online',
        'aprender música clássica',
        'conservatório virtual',
        'plano mensal música',
        'plano anual música',
        'desconto aula música',
        'professor verificado música',
      ],
      ogTitle:
        'Planos Opus Atlas - Free, Plus (R$ 29), Mentor (R$ 79) e Maestro (R$ 149)',
      ogDescription:
        'Do aluno casual ao professor profissional: escolha o plano ideal. Teste grátis, sem compromisso. Cancele quando quiser.',
    },
    en: {
      title: 'Plans & Pricing - Opus Atlas | Student Plus, Mentor and Maestro',
      description:
        'Choose the perfect plan for your musical journey. Free forever, Plus for dedicated students ($29/month), Mentor for beginning teachers ($79/month) and Maestro for professionals ($149/month). Free trial, cancel anytime.',
      keywords: [
        'opus atlas plans',
        'opus atlas pricing',
        'classical music subscription',
        'student music plan',
        'teacher music plan',
        'opus atlas cost',
        'classical music free trial',
        'online piano teacher',
        'online violin teacher',
        'online music lessons',
        'music teaching platform',
        'music student management software',
        'app for music teachers',
        'study piano online',
        'learn classical music',
        'virtual conservatory',
        'monthly music plan',
        'yearly music plan',
        'music lesson discount',
        'verified music teacher',
      ],
      ogTitle:
        'Opus Atlas Plans - Free, Plus ($29), Mentor ($79) and Maestro ($149)',
      ogDescription:
        'From casual student to professional teacher: choose the ideal plan. Free trial, no commitment. Cancel anytime.',
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas Team' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url:
        language === 'pt'
          ? 'https://opusatlas.com.br/pricing'
          : 'https://opusatlas.com.br/pricing',
      siteName: 'Opus Atlas',
      images: [
        {
          url: 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
          width: 1200,
          height: 630,
          alt:
            language === 'pt'
              ? 'Planos Opus Atlas - Free, Plus, Mentor e Maestro'
              : 'Opus Atlas Plans - Free, Plus, Mentor and Maestro',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.ogTitle,
      description: t.ogDescription,
      images: ['https://opusatlas.com.br/logo-opus-atlas.jpeg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical:
        language === 'pt'
          ? 'https://opusatlas.com.br/pricing'
          : 'https://opusatlas.com.br/pricing',
      languages: {
        'pt-BR': 'https://opusatlas.com.br/pricing',
        'en-US': 'https://opusatlas.com.br/pricing',
      },
    },
    other: {
      // Schema.org structured data para Google
      'structured-data': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Opus Atlas',
        description:
          language === 'pt'
            ? 'Plataforma completa de música clássica para alunos e professores'
            : 'Complete classical music platform for students and teachers',
        brand: {
          '@type': 'Brand',
          name: 'Opus Atlas',
        },
        offers: [
          {
            '@type': 'Offer',
            name: 'Free Plan',
            price: '0',
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            url: 'https://opusatlas.com.br/pricing',
          },
          {
            '@type': 'Offer',
            name: 'Plus Plan',
            price: '29.00',
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            url: 'https://opusatlas.com.br/pricing',
            priceValidUntil: '2025-12-31',
          },
          {
            '@type': 'Offer',
            name: 'Mentor Plan',
            price: '79.00',
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            url: 'https://opusatlas.com.br/pricing',
            priceValidUntil: '2025-12-31',
          },
          {
            '@type': 'Offer',
            name: 'Maestro Plan',
            price: '149.00',
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            url: 'https://opusatlas.com.br/pricing',
            priceValidUntil: '2025-12-31',
          },
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '1250',
          bestRating: '5',
          worstRating: '1',
        },
      }),
    },
  };
}

export const revalidate = 3600; // Revalidar a cada 1 hora
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
  description: string | null;
};
async function getPricing() {
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

    const formattedPricing: Record<PlanType, PricingData> = planPricing.reduce(
      (acc, plan) => {
        acc[plan.planType] = {
          monthly: plan.monthlyPrice,
          quarterly: {
            price: plan.quarterlyPrice || 0,
            discount: plan.quarterlyDiscount,
            monthlyEquivalent: (plan.quarterlyPrice || 0) / 3,
            savings: plan.monthlyPrice * 3 - (plan.quarterlyPrice || 0),
          },
          biannual: {
            price: plan.biannualPrice || 0,
            discount: plan.biannualDiscount,
            monthlyEquivalent: (plan.biannualPrice || 0) / 6,
            savings: plan.monthlyPrice * 6 - (plan.biannualPrice || 0),
          },
          yearly: {
            price: plan.yearlyPrice || 0,
            discount: plan.yearlyDiscount,
            monthlyEquivalent: (plan.yearlyPrice || 0) / 12,
            savings: plan.monthlyPrice * 12 - (plan.yearlyPrice || 0),
          },
          trialDays: plan.trialDays,
          description: plan.description ?? null, // ✅ AQUI!
        };
        return acc;
      },
      {} as Record<PlanType, PricingData>
    );

    return formattedPricing;
  } catch (error) {
    console.error('Error fetching pricing:', error);
    // Retornar preços default em caso de erro
    return {
      PLUS: {
        monthly: 29,
        quarterly: {
          price: 78.3,
          discount: 10,
          monthlyEquivalent: 26.1,
          savings: 8.7,
        },
        biannual: {
          price: 148.2,
          discount: 15,
          monthlyEquivalent: 24.7,
          savings: 25.8,
        },
        yearly: {
          price: 278.4,
          discount: 20,
          monthlyEquivalent: 23.2,
          savings: 69.6,
        },
        trialDays: 7,
      },
      MENTOR: {
        monthly: 79,
        quarterly: {
          price: 213.3,
          discount: 10,
          monthlyEquivalent: 71.1,
          savings: 23.7,
        },
        biannual: {
          price: 403.8,
          discount: 15,
          monthlyEquivalent: 67.3,
          savings: 70.2,
        },
        yearly: {
          price: 758.4,
          discount: 20,
          monthlyEquivalent: 63.2,
          savings: 189.6,
        },
        trialDays: 14,
      },
      MAESTRO: {
        monthly: 149,
        quarterly: {
          price: 402.3,
          discount: 10,
          monthlyEquivalent: 134.1,
          savings: 44.7,
        },
        biannual: {
          price: 761.4,
          discount: 15,
          monthlyEquivalent: 126.9,
          savings: 132.6,
        },
        yearly: {
          price: 1428.0,
          discount: 20,
          monthlyEquivalent: 119.0,
          savings: 360.0,
        },
        trialDays: 30,
      },
    };
  }
}

export default async function PricingPageRoute() {
  const language = await getServerLanguageStatic();
  const pricing = await getPricing();

  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/pricing',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <PricingPage pricing={pricing} />
    </TranslationProvider>
  );
}
