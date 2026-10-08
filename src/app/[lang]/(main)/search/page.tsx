import type { Metadata } from 'next';
import { SearchPage } from '@/app/components/site/search/SearchPage';
import { SEARCH } from '@/app/conteudo/site/search';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

interface SearchRouteProps {
  params: LangParams;
  searchParams: Promise<{ q?: string | string[] }>;
}

const termOf = async (searchParams: SearchRouteProps['searchParams']) => {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 120) ?? '';
};

/** Every query is its own answer: rendered per request, never indexed. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
  searchParams,
}: SearchRouteProps): Promise<Metadata> {
  const language = await routeLanguage(params);
  return {
    title: SEARCH[language].metaTitle(await termOf(searchParams)),
    robots: { index: false, follow: true },
  };
}

export default async function SearchRoute({
  params,
  searchParams,
}: SearchRouteProps) {
  return (
    <SearchPage
      language={await routeLanguage(params)}
      q={await termOf(searchParams)}
    />
  );
}
