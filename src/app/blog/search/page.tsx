// app/blog/search/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';
import prisma from '@/app/libs/prismadb';
import { Breadcrumb } from '@/app/components/blog/Breadcrumb';
import { SearchInput } from '@/app/components/blog/SearchInput';
import { SearchResults } from '@/app/components/blog/SearchResults';

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

async function searchArticles(params: {
  q?: string;
  tipos?: string;
  categorias?: string;
  tags?: string;
  ordenar?: string;
  page?: string;
}) {
  const page = parseInt(params.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  const query = params.q?.trim();
  const tipos = params.tipos?.split(',').filter(Boolean);
  const categorias = params.categorias?.split(',').filter(Boolean);
  const tags = params.tags?.split(',').filter(Boolean);
  const ordenar = params.ordenar || 'relevancia';

  const where: any = {
    status: 'PUBLISHED',
    publishedAt: { lte: new Date() },
  };

  if (query && query.length >= 2) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { keywords: { hasSome: [query] } },
    ];
  }

  if (tipos && tipos.length > 0) {
    where.types = { hasSome: tipos };
  }

  if (categorias && categorias.length > 0) {
    where.categories = {
      some: { category: { slug: { in: categorias } } },
    };
  }

  if (tags && tags.length > 0) {
    where.tags = {
      some: { tag: { slug: { in: tags } } },
    };
  }

  let orderBy: any;
  switch (ordenar) {
    case 'recente':
      orderBy = { publishedAt: 'desc' };
      break;
    case 'popular':
      orderBy = { viewCount: 'desc' };
      break;
    case 'curtidas':
      orderBy = { likes: { _count: 'desc' } };
      break;
    default:
      orderBy = { publishedAt: 'desc' };
  }

  const [articles, total] = await Promise.all([
    prisma.blogArticle.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        categories: {
          include: { category: true },
        },
        tags: {
          include: { tag: true },
        },
        _count: {
          select: {
            comments: { where: { status: 'APPROVED' } },
            likes: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.blogArticle.count({ where }),
  ]);

  return {
    articles: articles.map((a) => ({
      ...a,
      readTime: a.readTime ?? 0,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getSearchSuggestions(query: string): Promise<SearchSuggestions> {
  if (!query || query.length < 2) {
    return { relatedTags: [], relatedCategories: [] };
  }

  const [relatedTags, relatedCategories] = await Promise.all([
    prisma.blogTag.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      orderBy: { articleCount: 'desc' },
      take: 5,
    }),
    prisma.blogCategory.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      orderBy: { order: 'asc' },
      take: 5,
    }),
  ]);

  return { relatedTags, relatedCategories };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  const { articles, pagination } = await searchArticles(resolvedParams);
  const suggestions = query ? await getSearchSuggestions(query) : null;

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
