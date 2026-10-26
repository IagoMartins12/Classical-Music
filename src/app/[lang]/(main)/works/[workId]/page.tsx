// app/work/[workId]/page.tsx - Obra específica com SEO ULTRA otimizado
import { notFound } from 'next/navigation';
import WorkDetailsServer from './pageServer';
import { getWorkById } from '@/app/requests/work-page-details';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { SITE_URL, alternatesFor } from '@/app/utils/seoAlternates';
import { eraName } from '@/app/conteudo/site/eras';
import { workTitle } from '@/app/components/site/workTitle';
import { resumo, urlDe } from '@/app/utils/seo';

interface WorkParams {
  workId: string;
}

interface WorkDetailsPageProps {
  params: LangParams<WorkParams>;
}

// 🚀 Metadata SUPER otimizada para obras específicas
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
export async function generateMetadata({ params }: WorkDetailsPageProps) {
  const resolvedParams = await params;
  const language = await routeLanguage(params);

  const work = await getWorkById(resolvedParams.workId);

  if (!work) {
    const notFoundContent = {
      pt: {
        title: 'Obra não encontrada',
        description:
          'A obra solicitada não foi encontrada em nossa enciclopédia de música clássica. Explore outras partituras gratuitas de Bach, Chopin, Beethoven e Mozart.',
      },
      en: {
        title: 'Work not found',
        description:
          'The requested work was not found in our classical music encyclopedia. Explore other free sheet music from Bach, Chopin, Beethoven and Mozart.',
      },
    };

    return notFoundContent[language];
  }

  // Title and description aimed at what people search for a piece: its name
  // and composer, then "sheet music" (the root layout adds " | Opus Atlas").
  // The description is the work's facts, then what the page offers.
  const nome = workTitle(work.title, work.opOrCatalog);
  const era = eraName(work.epoch?.name ?? work.composer.epochName, language);
  const formacao = work.instrumentation || work.instrument?.name;
  const fatos =
    language === 'pt'
      ? [
          `${nome}, de ${work.composer.fullName}`,
          work.compositionYear && `composta em ${work.compositionYear}`,
          formacao && `para ${formacao.toLowerCase()}`,
          work.tone && `em ${work.tone}`,
          era && `período ${era}`,
        ]
      : [
          `${nome} by ${work.composer.fullName}`,
          work.compositionYear && `composed in ${work.compositionYear}`,
          formacao && `for ${formacao.toLowerCase()}`,
          work.tone && `in ${work.tone}`,
          era && `${era} period`,
        ];
  const t = {
    titleTemplate:
      language === 'pt'
        ? `${nome} (${work.composer.name}): partitura e estudo`
        : `${nome} (${work.composer.name}): sheet music and study`,
    ogTitle: `${nome} — ${work.composer.fullName}`,
  };
  const description = resumo(
    `${fatos.filter(Boolean).join(', ')}. ${
      language === 'pt'
        ? 'Partituras gratuitas, gravações e nível de estudo.'
        : 'Free sheet music, recordings and study level.'
    }`
  );

  return {
    title: t.titleTemplate,
    description,
    openGraph: {
      title: t.ogTitle,
      description,
      type: 'music.song',
      siteName: 'Opus Atlas',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      url: urlDe(`/works/${work.id}`, language),
      images: [
        {
          url: `${SITE_URL}/og/work/${work.id}?l=${language}`,
          // Com foto, a rota devolve o retrato quadrado; sem, o cartão.
          ...(work.composer.portraitUrl
            ? { width: 600, height: 600 }
            : { width: 1200, height: 630 }),
          alt: `${work.title} — ${work.composer.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.titleTemplate,
      description,
    },
    alternates: alternatesFor(`/works/${work.id}`, language),
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
 * caso aqui: cada visita a um obra renderizava a página do zero, para 207 mil obras.
 *
 * Devolvendo uma lista vazia, nada é gerado no build (não faria sentido gerar
 * centenas de milhares de páginas) mas a rota passa a ser guardada: a primeira
 * visita de cada endereço renderiza, as seguintes vêm do Redis compartilhado,
 * e a API revalida por tag quando o dado muda.
 */
export async function generateStaticParams() {
  return [];
}

export default async function WorkDetailsPage({
  params,
}: WorkDetailsPageProps) {
  const language = await routeLanguage(params);
  const resolvedParams = await params;

  // Verificação otimizada de ID
  if (
    !resolvedParams.workId ||
    resolvedParams.workId.length !== 24 ||
    !/^[0-9a-fA-F]{24}$/.test(resolvedParams.workId)
  ) {
    console.log(`❌ [WORK-PAGE] ID inválido: ${resolvedParams.workId}`);
    notFound();
  }

  return (
    <WorkDetailsServer workId={resolvedParams.workId} language={language} />
  );
}
