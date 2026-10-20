import type { Metadata } from 'next';
import { OnThisDayPage } from '@/app/components/site/on-this-day/OnThisDayPage';
import { ON_THIS_DAY, formatDay, today } from '@/app/conteudo/site/onThisDay';
import { alternatesFor } from '@/app/utils/seoAlternates';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

/** Today's page. Re-rendered every hour, so it turns over soon after midnight. */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: LangParams;
}): Promise<Metadata> {
  const language = await routeLanguage(params);
  const date = formatDay(today(), language);
  const copy = ON_THIS_DAY[language];
  return {
    title: copy.metaTitle(date),
    description: copy.metaDescription(date),
    alternates: alternatesFor('/on-this-day', language),
  };
}

export default async function OnThisDayToday({
  params,
}: {
  params: LangParams;
}) {
  return (
    <OnThisDayPage date={today()} language={await routeLanguage(params)} />
  );
}
