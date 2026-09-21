// app/composer/[composerId]/page.tsx - Compositor específico SUPER otimizado
import { notFound } from 'next/navigation';
import ComposerDetailsServer from './pageServer';
import { getComposerById } from '@/app/requests/composer-details';
import { translateEpochName } from '@/app/utils/translations/epochTranslations';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { alternatesFor } from '@/app/utils/seoAlternates';

interface ComposerParams {
  composerId: string;
}

interface ComposerDetailsPageProps {
  params: LangParams<ComposerParams>;
}

// Metadata ULTRA otimizada para compositores
/**
 * **Sem `loading.tsx`, de propósito.**
 *
 * Um `loading.tsx` cria um limite de `Suspense` no topo da rota, e com ele o
 * Next despacha a casca da página — já com HTTP 200 — antes de saber se o dado
 * vem. Quando a API falha, o status já foi enviado e não há como voltar
 * atrás: a resposta vira **200 com esqueleto e sem `<title>`**, que é
 * exatamente o "soft 404" que os buscadores penalizam. Esta página existe para
 * ser indexada; um erro passageiro tem de sair como 500, que o buscador
 * entende como "volte depois".
 *
 * O que se perde é pequeno e foi medido: o render frio leva ~54 ms, então o
 * esqueleto piscava e sumia. Na navegação pelo roteador, o Next mantém a
 * página anterior visível até a nova chegar — que é o comportamento padrão
 * dele sem `loading.tsx`.
 */

/**
 * **Sem `catch` que devolve "Erro" como título, de propósito.**
 *
 * `generateMetadata` roda **antes** do primeiro byte da resposta. Um erro aqui
 * vira 500 antes de qualquer HTML sair — que é o que queremos numa falha da
 * API: nada é enviado, nada é guardado, e o buscador vê um erro passageiro de
 * servidor em vez de uma página 200 sem conteúdo.
 *
 * Engolir a falha fazia o oposto: a resposta começava com 200, o corpo vinha
 * vazio (o `loading.tsx` já havia sido despachado) e não havia como voltar
 * atrás no status. "Não existe" continua tratado no `if` abaixo, que é a
 * única situação em que um 404 é verdade.
 */
export async function generateMetadata({ params }: ComposerDetailsPageProps) {
  const resolvedParams = await params;
  const language = await routeLanguage(params);

  const composer = await getComposerById(resolvedParams.composerId);

  if (!composer) {
    const notFoundContent = {
      pt: {
        title:
          'Compositor não encontrado - Opus Atlas | Compositores Clássicos',
        description:
          'O compositor solicitado não foi encontrado. Explore outros grandes mestres como Bach, Chopin, Beethoven, Mozart e suas partituras gratuitas.',
      },
      en: {
        title: 'Composer not found - Opus Atlas | Classical Composers',
        description:
          'The requested composer was not found. Explore other great masters like Bach, Chopin, Beethoven, Mozart and their free sheet music.',
      },
    };

    return notFoundContent[language];
  }

  // Bio resumida para description
  const bioSummary = composer.bio ? composer.bio.substring(0, 120) + '...' : '';

  const birthYear = composer.birthDate ? ` (${composer.birthDate}` : '';
  const deathYear = composer.deathDate
    ? `-${composer.deathDate})`
    : birthYear
      ? ')'
      : '';
  const years = birthYear + deathYear;

  const content = {
    pt: {
      title: `${composer.fullName} - Compositor ${composer.epochName} | Partituras Gratuitas`,
      description: `${composer.fullName}, grande compositor da época ${composer.epochName}${years}. ${bioSummary} Explore todas suas obras, partituras gratuitas para piano, violino e outros instrumentos. Análises musicais e recursos educacionais completos.`,
      keywords: [
        `${composer.name} compositor`,
        `${composer.fullName} partituras`,
        `${composer.name} obras completas`,
        `${composer.name} piano`,
        `${composer.name} violino`,
        `${composer.name} partituras gratuitas`,
        `biografia ${composer.name}`,
        `${composer.name} IMSLP`,
        `estudar ${composer.name}`,
        `análise ${composer.name}`,
        `${composer.epochName} compositor`,
        `música ${composer.epochName}`,
        'compositores clássicos',
        'partituras domínio público',
        'música clássica gratuita',
        'educação musical',
        'conservatório',
        'estudantes música',
        `${composer.name} PDF`,
        `obras ${composer.name} completas`,
      ].filter(Boolean),
      ogTitle: `${composer.fullName} - Partituras e Obras Completas`,
      ogDescription: `Conheça a vida e obra de ${composer.fullName}. Acesse partituras gratuitas e recursos educacionais completos.`,
    },
    en: {
      title: `${composer.fullName} - ${translateEpochName(
        composer.epochName,
        language
      )} Composer | Free Sheet Music`,
      description: `${composer.fullName}, great composer of the ${composer.epochName} era${years}. ${bioSummary} Explore all his works, free sheet music for piano, violin and other instruments. Musical analyses and complete educational resources.`,
      keywords: [
        `${composer.name} composer`,
        `${composer.fullName} sheet music`,
        `${composer.name} complete works`,
        `${composer.name} piano`,
        `${composer.name} violin`,
        `${composer.name} free scores`,
        `${composer.name} biography`,
        `${composer.name} IMSLP`,
        `study ${composer.name}`,
        `${composer.name} analysis`,
        `${composer.epochName} composer`,
        `${composer.epochName} music`,
        'classical composers',
        'public domain scores',
        'free classical music',
        'music education',
        'conservatory',
        'music students',
        `${composer.name} PDF`,
        `${composer.name} complete works`,
      ].filter(Boolean),
      ogTitle: `${composer.fullName} - Sheet Music and Complete Works`,
      ogDescription: `Discover the life and work of ${composer.fullName}. Access free sheet music and complete educational resources.`,
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas' }],
    creator: 'Opus Atlas',
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'profile',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url: `https://opusatlas.com.br/composer/${composer.id}`,
      siteName: 'Opus Atlas',
      images: composer.portraitUrl
        ? [
            {
              url: composer.portraitUrl,
              width: 400,
              height: 400,
              alt: `${composer.fullName} - Retrato`,
            },
          ]
        : [
            {
              url: 'https://opusatlas.com.br/logo-opus-atlas.jpeg',
              width: 1200,
              height: 630,
              alt: 'Opus Atlas - Classical Music Encyclopedia',
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.ogTitle,
      description: t.description.substring(0, 200),
    },
    alternates: alternatesFor(`/composer/${composer.id}`, language),
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
    // Schema.org para compositor
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `https://opusatlas.com.br/composer/${composer.id}`,
        name: composer.fullName,
        alternateName: composer.name,
        description: composer.bio || t.description,
        birthDate: composer.birthDate,
        deathDate: composer.deathDate,
        nationality: composer.nationality,
        jobTitle: 'Composer',
        genre: composer.epochName,
        url: `https://opusatlas.com.br/composer/${composer.id}`,
        image: composer.portraitUrl,
        sameAs: composer.wikipediaLink ? [composer.wikipediaLink] : undefined,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://opusatlas.com.br/composer/${composer.id}`,
        },
      }),
    },
  };
}

export const revalidate = 3600;

/**
 * **`generateStaticParams` vazio, e é isso que liga o cache.**
 *
 * No App Router, rota com segmento dinâmico e **sem** `generateStaticParams`
 * é renderizada a cada pedido, e o `revalidate` acima não vale nada — era o
 * caso aqui: cada visita a uma compositor renderizava a página do zero, para 19 mil compositores.
 *
 * Devolvendo uma lista vazia, nada é gerado no build (não faria sentido gerar
 * centenas de milhares de páginas) mas a rota passa a ser guardada: a primeira
 * visita de cada endereço renderiza, as seguintes vêm do Redis compartilhado,
 * e a API revalida por tag quando o dado muda.
 */
export async function generateStaticParams() {
  return [];
}

export default async function ComposerDetailsPage({
  params,
}: ComposerDetailsPageProps) {
  const language = await routeLanguage(params);
  const resolvedParams = await params;

  // Verificação básica de ID
  if (!resolvedParams.composerId || resolvedParams.composerId.length !== 24) {
    notFound();
  }

  return (
    <ComposerDetailsServer
      composerId={resolvedParams.composerId}
      language={language}
    />
  );
}
