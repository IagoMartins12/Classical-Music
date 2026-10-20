import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionView } from '@/app/components/site/collections/CollectionView';
import { publicCollection } from '@/app/requests/collections';
import { alternatesFor } from '@/app/utils/seoAlternates';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

type Params = LangParams<{ id: string }>;

export const revalidate = 600;

/** Nothing at build time; each collection renders on its first visit. */
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const language = await routeLanguage(params);
  const c = await publicCollection(id);
  if (!c) return {};
  return {
    title: `${c.title} · Opus Atlas`,
    description: c.description ?? undefined,
    alternates: alternatesFor(`/collections/${id}`, language),
  };
}

/** Public collections only; a private one lives on its owner's shelf. */
export default async function CollectionPage({ params }: { params: Params }) {
  const c = await publicCollection((await params).id);
  if (!c?.isPublic) notFound();
  return <CollectionView initial={c} />;
}
