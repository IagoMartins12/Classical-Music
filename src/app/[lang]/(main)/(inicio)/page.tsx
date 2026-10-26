import { imagemPadrao } from '@/app/utils/ogImagem';
import { CONTATO, REDES } from '@/app/utils/contato';
// app/page.tsx - Homepage com metadata SEO DEFINITIVO
import { Metadata } from 'next';
import PageServer from './pageServer';
import { JsonLd } from '@/app/components/site/JsonLd';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { SITE_URL, alternatesFor } from '@/app/utils/seoAlternates';
import { ID_DA_ORGANIZACAO, ID_DO_SITE, urlDe } from '@/app/utils/seo';

/** `[lang]` é quem decide o idioma desta página — ver `routeLanguage`. */
interface LangPageProps {
  params: LangParams;
}

/**
 * What the home says to search engines and AI answers. Short and true: no
 * keyword list (Google ignores the tag and Bing reads a long one as spam), no
 * "largest" claim nor counts (the brand never quotes catalog numbers), and
 * structured data only for what the site is — a website with search and the
 * organization behind it. The old "Course" and "Library" types described
 * things the site is not.
 */
const CONTENT = {
  pt: {
    title: 'Opus Atlas: música clássica, compositores e partituras',
    description:
      'Biografias de compositores, obras e partituras gratuitas de música clássica, com o nível de cada peça, guias de estudo e um portal para professores e alunos.',
    ogTitle: 'Opus Atlas: o atlas da música clássica',
  },
  en: {
    title: 'Opus Atlas: classical music, composers and sheet music',
    description:
      'Composer biographies, works and free classical sheet music, with the level of each piece, study guides and a portal for teachers and students.',
    ogTitle: 'Opus Atlas: the atlas of classical music',
  },
};

/** Dados estruturados da home, no corpo da página (ver `JsonLd`). */
function dadosEstruturados(language: 'pt' | 'en') {
  const t = CONTENT[language];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': ID_DO_SITE,
        name: 'Opus Atlas',
        alternateName:
          language === 'pt'
            ? 'Atlas da Música Clássica'
            : 'The Atlas of Classical Music',
        description: t.description,
        url: SITE_URL,
        inLanguage: ['pt-BR', 'en-US'],
        publisher: { '@id': ID_DA_ORGANIZACAO },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${urlDe('/search', language)}?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'EducationalOrganization',
        '@id': ID_DA_ORGANIZACAO,
        name: 'Opus Atlas',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/brand/opus-atlas-logo-512.png`,
          width: 512,
          height: 512,
        },
        description: t.description,
        knowsAbout: [
          'Classical music',
          'Music history',
          'Composers',
          'Sheet music',
          'Music education',
        ],
        sameAs: Object.values(REDES),
        email: CONTATO.contato,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'São Paulo',
          addressRegion: 'SP',
          addressCountry: 'BR',
        },
      },
    ],
  };
}

// 🏆 METADATA HOMEPAGE ULTRA OTIMIZADO
export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  const language = await routeLanguage(params);

  const t = CONTENT[language];

  return {
    // Already carries the brand: without `absolute` the root template made it
    // "Opus Atlas: … | Opus Atlas".
    title: { absolute: t.title },
    description: t.description,
    applicationName: 'Opus Atlas',
    category: 'education',

    // OpenGraph otimizado
    openGraph: {
      type: 'website',
      siteName: 'Opus Atlas',
      title: t.ogTitle,
      description: t.description,
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url: urlDe('/', language),
      images: imagemPadrao(language),
    },

    // Twitter Cards otimizado
    twitter: {
      card: 'summary_large_image',
      site: '@Opus_Atlas',
      creator: '@Opus_Atlas',
      title: t.ogTitle,
      description: t.description,
      images: imagemPadrao(language),
    },

    // Robots ultra otimizado
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Sem `languages`: o inglês não tem endereço próprio, e declarar um que
    // não existe é pior do que não declarar nenhum.
    alternates: alternatesFor('/', language),
  };
}

// Cache otimizado para homepage
export const revalidate = 1800; // 30 minutos (homepage muda com frequência)

export default async function HomePage({ params }: LangPageProps) {
  const language = await routeLanguage(params);

  return (
    <div className="mx-auto py-6">
      {/* A home não tinha título de página: abria direto num card de
          destaque (h2). Leitor de tela e buscador leem este; a tela, não. */}
      <h1 className="sr-only">
        {language === 'en'
          ? 'Opus Atlas — Classical Music Encyclopedia'
          : 'Opus Atlas — Enciclopédia de Música Clássica'}
      </h1>
      <JsonLd data={dadosEstruturados(language)} />
      <PageServer language={language} />
    </div>
  );
}
