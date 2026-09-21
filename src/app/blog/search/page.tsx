// app/blog/search/page.tsx — busca de artigos, pela API
import { Metadata } from 'next';
import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';
import { Breadcrumb } from '@/app/components/blog/Breadcrumb';
import { SearchInput } from '@/app/components/blog/SearchInput';
import { SearchResults } from '@/app/components/blog/SearchResults';
import {
  autocomplete,
  searchArticles as searchBlog,
  type SearchQuery,
} from '@/app/requests/blog/taxonomy';

export const revalidate = 0; // Sem cache para busca

interface PageProps {
  searchParams: Promise<{
    q?: string;
    tipos?: string;
    categorias?: string;
    tags?: string;
    ordenar?: string;
    page?: string;
  }>;
}

type SearchParams = Awaited<PageProps['searchParams']>;

interface TagSuggestion {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  articleCount: number;
}

interface CategorySuggestion {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon?: string | null;
}

interface SearchSuggestions {
  relatedTags: TagSuggestion[];
  relatedCategories: CategorySuggestion[];
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';

  return {
    title: query
      ? `Busca: ${query} - Blog Opus Atlas`
      : 'Buscar - Blog Opus Atlas',
    description: 'Encontre artigos sobre música clássica',
  };
}

/**
 * Ordem da tela → ordem da API. A API não ordena por curtidas: "curtidas"
 * vai pelos mais visitados.
 */
const SORT_BY: Record<string, NonNullable<SearchQuery['sortBy']>> = {
  relevancia: 'relevance',
  recente: 'newest',
  popular: 'popular',
  curtidas: 'popular',
};

const splitList = (value?: string) => value?.split(',').filter(Boolean);

function searchArticles(params: SearchParams) {
  return searchBlog({
    q: params.q,
    types: splitList(params.tipos),
    categories: splitList(params.categorias),
    tags: splitList(params.tags),
    sortBy: SORT_BY[params.ordenar || 'relevancia'] ?? 'relevance',
    page: Math.max(1, parseInt(params.page || '1') || 1),
    limit: 12,
  });
}

async function getSearchSuggestions(query: string): Promise<SearchSuggestions> {
  const term = query.trim();

  if (term.length < 2) {
    return { relatedTags: [], relatedCategories: [] };
  }

  try {
    const suggestions = await autocomplete(term, 'all');

    return {
      relatedTags: suggestions.tags.slice(0, 5).map((tag) => ({
        ...tag,
        articleCount: tag.articleCount ?? 0,
      })),
      relatedCategories: suggestions.categories.slice(0, 5),
    };
  } catch {
    // A sugestão é acessória: sem ela, a busca segue.
    return { relatedTags: [], relatedCategories: [] };
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  const [{ articles, pagination }, suggestions] = await Promise.all([
    searchArticles(resolvedParams),
    query ? getSearchSuggestions(query) : Promise.resolve(null),
  ]);

  const hasFilters =
    resolvedParams.tipos ||
    resolvedParams.categorias ||
    resolvedParams.tags ||
    (resolvedParams.ordenar && resolvedParams.ordenar !== 'relevancia');

  return (
    <div className="min-h-screen">
      <div className="section-wrap !pb-0 !pt-8">
        <Breadcrumb
          items={[{ label: 'Início', href: '/blog' }, { label: 'Busca' }]}
        />
      </div>

      {/* Search Header */}
      <div className="section-wrap !pt-0 pb-8">
        <div className="classical-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <FaSearch className="w-8 h-8 text-brand-primary" />
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-theme-primary">
                {query ? `Resultados para "${query}"` : 'Buscar Artigos'}
              </h1>
              {pagination.total > 0 && (
                <p className="text-theme-secondary mt-2">
                  {pagination.total}{' '}
                  {pagination.total === 1
                    ? 'resultado encontrado'
                    : 'resultados encontrados'}
                </p>
              )}
            </div>
          </div>

          {/* Search Form */}
          <SearchInput />

          {/* Suggestions */}
          {suggestions &&
            (suggestions.relatedTags.length > 0 ||
              suggestions.relatedCategories.length > 0) && (
              <div className="space-y-3 mt-6">
                {suggestions.relatedTags.length > 0 && (
                  <div>
                    <p className="text-xs text-theme-tertiary mb-2">
                      Tags relacionadas:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.relatedTags.map((tag: TagSuggestion) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 rounded-full text-sm bg-theme-elevated hover:bg-theme-classical transition-all"
                          style={{ color: tag.color || undefined }}
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.relatedCategories.length > 0 && (
                  <div>
                    <p className="text-xs text-theme-tertiary mb-2">
                      Categorias relacionadas:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.relatedCategories.map(
                        (category: CategorySuggestion) => (
                          <Link
                            key={category.id}
                            href={`/blog/category/${category.slug}`}
                            className="px-3 py-1 rounded-full text-sm bg-theme-elevated hover:bg-theme-classical transition-all"
                            style={{ color: category.color || undefined }}
                          >
                            {category.icon} {category.name}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Filters & Results */}
      <div className="section-wrap pb-12">
        <SearchResults
          articles={articles}
          pagination={pagination}
          currentParams={resolvedParams}
          hasFilters={hasFilters}
        />
      </div>
    </div>
  );
}
