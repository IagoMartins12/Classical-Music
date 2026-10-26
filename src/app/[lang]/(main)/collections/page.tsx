import type { Metadata } from 'next';
import { CollectionsIndex } from '@/app/components/site/collections/CollectionsIndex';
import { COLLECTIONS } from '@/app/conteudo/site/collections';
import { publicCollections } from '@/app/requests/collections';
import { alternatesFor } from '@/app/utils/seoAlternates';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

/** Revalidated by the API (`collections` tag) when a collection changes. */
export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: LangParams;
}): Promise<Metadata> {
  const language = await routeLanguage(params);
  const copy = COLLECTIONS[language];
  return {
    title: copy.title,
    description: copy.subtitle,
    alternates: alternatesFor('/collections', language),
  };
}

export default async function CollectionsPage({
  params,
}: {
  params: LangParams;
}) {
  const language = await routeLanguage(params);
  const { collections } = await publicCollections({ limit: 48 });
  return <CollectionsIndex language={language} collections={collections} />;
}
