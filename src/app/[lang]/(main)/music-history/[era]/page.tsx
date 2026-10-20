import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EraChapterPage } from '@/app/components/site/history/EraChapterPage';
import { eraBySlug, eraChapter } from '@/app/conteudo/history';
import { ERAS } from '@/app/conteudo/site/eras';
import { LEARN } from '@/app/conteudo/site/learn';
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
  return <EraChapterPage era={era} language={await routeLanguage(params)} />;
}
