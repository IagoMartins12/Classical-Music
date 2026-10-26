import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EraChapterPage } from '@/app/components/site/history/EraChapterPage';
import { eraBySlug, eraChapter } from '@/app/conteudo/history';
import { ERAS } from '@/app/conteudo/site/eras';
import { LEARN } from '@/app/conteudo/site/learn';
import { JsonLd } from '@/app/components/site/JsonLd';
import { capituloJsonLd } from '@/app/utils/seo';
import { alternatesFor } from '@/app/utils/seoAlternates';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

type EraParams = LangParams<{ era: string }>;

export const revalidate = 3600;

/** Seven chapters, all known at build time. */
export async function generateStaticParams() {
  return ERAS.map((era) => ({ era: era.key }));
}

export async function generateMetadata({
  params,
}: {
  params: EraParams;
}): Promise<Metadata> {
  const language = await routeLanguage(params);
  const era = eraBySlug((await params).era);
  if (!era) return {};
  return {
    title: LEARN[language].history.metaTitle(era.name[language]),
    description: eraChapter(era.key, language)?.lede,
    alternates: alternatesFor(`/music-history/${era.key}`, language),
    openGraph: { images: [era.image] },
  };
}

export default async function EraRoute({ params }: { params: EraParams }) {
  const era = eraBySlug((await params).era);
  if (!era) notFound();
  const language = await routeLanguage(params);
  return (
    <>
      <JsonLd
        data={capituloJsonLd({
          caminho: `/music-history/${era.key}`,
          titulo: LEARN[language].history.metaTitle(era.name[language]),
          descricao: eraChapter(era.key, language)?.lede,
          imagem: era.image,
          assunto: era.name[language],
          secao: [
            language === 'pt' ? 'História da música' : 'History of music',
            '/music-history',
          ],
          language,
        })}
      />
      <EraChapterPage era={era} language={language} />
    </>
  );
}
