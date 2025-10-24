// app/components/blog/SearchResults.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaFilter } from 'react-icons/fa';
import ViewModeToggle, { ViewMode } from '@/app/components/ViewModeToggle';
import { ArticleCard } from '@/app/components/blog/ArticleCard';
import { ArticleCardList } from '@/app/components/blog/ArticleCardList';
import { SearchFilters } from '@/app/components/blog/SearchFilters';
import { SortSelector } from '@/app/components/blog/SortSelector';

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  readTime: number;
  publishedAt: Date | null;
  author: {
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  };
  categories: Array<{
    category: {
      name: string;
      slug: string;
      color: string | null;
      icon?: string | null;
    };
  }>;
  _count: {
    comments: number;
    likes: number;
  };
}

interface SearchResultsProps {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentParams: {
    q?: string;
    tipos?: string;
    categorias?: string;
    tags?: string;
    ordenar?: string;
    page?: string;
  };
  hasFilters: boolean | string | undefined;
}

export function SearchResults({
  articles,
  pagination,
  currentParams,
  hasFilters,
}: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado local - sem sync com URL
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const updateParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/blog/search?${params.toString()}`);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  if (articles.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="classical-card p-6 sticky top-24">
            <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <FaFilter className="text-brand-primary" />
              Filtros
            </h3>
            <SearchFilters currentParams={currentParams} />
            {hasFilters && (
              <Link
                href="/blog/search"
                className="mt-4 block text-center text-sm text-brand-primary hover:text-brand-secondary"
              >
                Limpar filtros
              </Link>
            )}
          </div>
        </div>

        {/* Empty State */}
        <div className="lg:col-span-3">
          <div className="classical-card p-12 text-center">
            <FaSearch className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-primary mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-theme-secondary mb-6">
              Tente usar termos diferentes ou remover alguns filtros
            </p>
            <Link href="/blog" className="btn-classical-primary">
              Ver todos os artigos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <div className="classical-card p-6 sticky top-24">
          <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
            <FaFilter className="text-brand-primary" />
            Filtros
          </h3>
          <SearchFilters currentParams={currentParams} />
          {hasFilters && (
            <Link
              href="/blog/search"
              className="mt-4 block text-center text-sm text-brand-primary hover:text-brand-secondary"
            >
              Limpar filtros
            </Link>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-3">
        {/* Toolbar com Sort e View Mode */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-theme-tertiary">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total}
          </p>

          <div className="flex items-center gap-4">
            <SortSelector
              currentValue={currentParams.ordenar || 'relevancia'}
            />
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
          </div>
        </div>

        {/* Articles Grid/List */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <ArticleCardList key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              {pagination.page > 1 && (
                <button
                  onClick={() =>
                    updateParams({ page: (pagination.page - 1).toString() })
                  }
                  className="btn-classical-secondary"
                >
                  Anterior
                </button>
              )}

              <span className="px-4 py-2 text-theme-secondary">
                Página {pagination.page} de {pagination.totalPages}
              </span>

              {pagination.page < pagination.totalPages && (
                <button
                  onClick={() =>
                    updateParams({ page: (pagination.page + 1).toString() })
                  }
                  className="btn-classical-secondary"
                >
                  Próxima
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
