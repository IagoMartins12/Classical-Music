// app/pricing/page.tsx - Otimizado para SEO de Planos e Conversão
import { loadPageTranslationsWithCommon } from '@/app/utils/translations/serverTranslations';
import { Metadata } from 'next';
import PricingPage from './pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';
import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { alternatesFor } from '@/app/utils/seoAlternates';

/** `[lang]` é quem decide o idioma desta página — ver `routeLanguage`. */
interface LangPageProps {
  params: LangParams;
}

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  const language = await routeLanguage(params);

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
    alternates: alternatesFor('/pricing', language),
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
/**
 * Preços dos planos ativos, da API (`GET /pricing`) — o mesmo formato por
 * período que o legado montava lendo o banco.
 *
 * **Sem preços padrão quando a API falha, de propósito.**
 *
 * Esta página é guardada em cache por uma hora. Devolver uma tabela de preços
 * embutida no código quando a API não responde faz o site anunciar, com HTTP
 * 200 e em cache, valores que podem não ser os que estão à venda — e ninguém
 * fica sabendo. Numa página comercial isso é pior que ficar fora do ar.
 *
 * Deixando o erro subir, o Next devolve 500 e não guarda nada.
 */
async function getPricing() {
  const response = await apiFetch<ApiSchema<'PricingResponseDto'>>('/pricing', {
    next: { revalidate: 3600, tags: ['billing'] },
    // **Vazio, nunca inventado.** O build do CI não tem API, e sem isto ele
    // não consegue nem provar que a página compila. O que não pode acontecer
    // é o contrário — uma tabela de preços embutida no código, que faria o
    // site anunciar valores que talvez não estejam à venda. Aqui não há preço
    // nenhum, e a página em branco se preenche na primeira revalidação.
    buildFallback: { success: true, data: {} },
  });

  const formattedPricing: Record<string, PricingData> = Object.fromEntries(
    Object.entries(response.data).map(([planType, plan]) => [
      planType,
      { ...plan, description: plan.description ?? null },
    ])
  );

  return formattedPricing;
}

export default async function PricingPageRoute({ params }: LangPageProps) {
  const language = await routeLanguage(params);
  const pricing = await getPricing();

  // Só acontece no build sem API (ver `buildFallback` acima): em execução, a
  // falha sobe e o Next devolve 500 sem guardar nada.
  if (Object.keys(pricing).length === 0) {
    return null;
  }

  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/pricing',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <PricingPage pricing={pricing} />
    </TranslationProvider>
  );
}
