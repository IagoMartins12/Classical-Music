// app/composer/[composerId]/page.tsx - Compositor específico SUPER otimizado
import { notFound } from 'next/navigation';
import ComposerDetailsServer from './pageServer';
import { getComposerById } from '@/app/requests/composer-details';
import { eraName } from '@/app/conteudo/site/eras';
import { anosDeVida, resumo, urlDe } from '@/app/utils/seo';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { SITE_URL, alternatesFor } from '@/app/utils/seoAlternates';

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

  // Title and description aimed at what people search for a composer: the
  // name, then biography, works and scores (the root layout adds
  // " | Opus Atlas"). The description opens with the dates and the era and
  // goes on with the biography, cut at a sentence.
  const era = eraName(composer.epochName, language);
  const anos = anosDeVida(composer.birth?.year, composer.death?.year, language);
  const bio = (language === 'en' && composer.bioEn) || composer.bio || '';
  const abertura = [
    `${composer.fullName}${anos ? ` (${anos})` : ''}`,
    era && (language === 'pt' ? `período ${era}` : `${era} period`),
  ]
    .filter(Boolean)
    .join(', ');
  // Most biographies already open with the name and the dates: then the
  // biography alone is the description, instead of saying them twice.
  const bioJaAbre =
    !!bio &&
    (bio.startsWith(composer.name) ||
      bio.startsWith(composer.fullName) ||
      (!!composer.birth?.year &&
        bio.slice(0, 120).includes(String(composer.birth.year))));
  const descricao = (semBio: string) =>
    resumo(
      bioJaAbre ? bio : bio ? `${abertura}. ${bio}` : `${abertura}. ${semBio}`
    );
  const content = {
    pt: {
      title: `${composer.fullName}: biografia, obras e partituras`,
      description: descricao(
        'Biografia, lista de obras e partituras gratuitas para estudar, com o nível de cada peça.'
      ),
      ogTitle: `${composer.fullName}: biografia, obras e partituras`,
    },
    en: {
      title: `${composer.fullName}: biography, works and sheet music`,
      description: descricao(
        'Biography, list of works and free sheet music to study, with the level of each piece.'
      ),
      ogTitle: `${composer.fullName}: biography, works and sheet music`,
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    openGraph: {
      title: t.ogTitle,
      description: t.description,
      type: 'profile',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url: urlDe(`/composer/${composer.id}`, language),
      siteName: 'Opus Atlas',
      images: [
        {
          url: `${SITE_URL}/og/composer/${composer.id}?l=${language}`,
          // Com foto, a rota devolve o retrato quadrado; sem, o cartão.
          ...(composer.portraitUrl
            ? { width: 600, height: 600 }
            : { width: 1200, height: 630 }),
          alt: composer.fullName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.ogTitle,
      description: t.description,
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
