import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OnThisDayPage } from '@/app/components/site/on-this-day/OnThisDayPage';
import {
  ON_THIS_DAY,
  formatDay,
  parseDaySlug,
} from '@/app/conteudo/site/onThisDay';
import { alternatesFor } from '@/app/utils/seoAlternates';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

type DayParams = LangParams<{ day: string }>;

export const revalidate = 21600;

/** Nothing at build time; each day renders on its first visit and is kept. */
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: DayParams;
}): Promise<Metadata> {
  const language = await routeLanguage(params);
  const date = parseDaySlug((await params).day);
  if (!date) return {};
  const copy = ON_THIS_DAY[language];
  const label = formatDay(date, language);
  return {
    title: copy.metaTitle(label),
    description: copy.metaDescription(label),
    alternates: alternatesFor(`/on-this-day/${(await params).day}`, language),
  };
}

export default async function OnThisDayRoute({
  params,
}: {
  params: DayParams;
}) {
  const date = parseDaySlug((await params).day);
  if (!date) notFound();
  return <OnThisDayPage date={date} language={await routeLanguage(params)} />;
}
