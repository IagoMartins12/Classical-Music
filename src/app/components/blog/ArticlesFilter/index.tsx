// app/components/blog/ArticlesFilter.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import ViewModeToggle, { ViewMode } from '@/app/components/ViewModeToggle';
import { ArticleCard } from '@/app/components/blog/ArticleCard';
import { ArticleCardList } from '@/app/components/blog/ArticleCardList';

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

interface ArticlesFilterProps {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  }>;
  currentParams: any;
}

export function ArticlesFilter({
  articles,
  pagination,
  categories,
  currentParams,
}: ArticlesFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Estado local - sem sync com URL
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchTerm, setSearchTerm] = useState(currentParams.search || '');
  const [showFilters, setShowFilters] = useState(false);

  const updateParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/blog/articles?${params.toString()}`);
  };

  // ✅ Apenas muda o estado local - sem router.push
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchTerm, page: '1' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    router.push('/blog/articles');
  };

  const hasActiveFilters =
    currentParams.search || currentParams.category || currentParams.sort;

  return (
    <>
      {/* Filters Bar */}
      <div className="classical-card p-4 mb-6">
        <div className="space-y-4">
          {/* Search & View Toggle */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar artigos..."
                className="input-classical w-full pl-10"
              />
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-classical-secondary flex items-center space-x-2 ${
                hasActiveFilters ? 'ring-2 ring-brand-primary' : ''
              }`}
            >
              <FiFilter className="w-4 h-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-brand-primary rounded-full"></span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-classical-secondary text-red-500"
                title="Limpar filtros"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}

            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-theme-secondary">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Categoria
                </label>
                <select
                  value={currentParams.category || ''}
                  onChange={(e) =>
                    updateParams({ category: e.target.value, page: '1' })
                  }
                  className="input-classical-2 w-full text-sm"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Ordenar por
                </label>
                <select
                  value={currentParams.sort || 'recent'}
                  onChange={(e) =>
                    updateParams({ sort: e.target.value, page: '1' })
                  }
                  className="input-classical-2 w-full text-sm"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="popular">Mais populares</option>
                  <option value="likes">Mais curtidos</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-theme-secondary">
          {pagination.total === 0
            ? 'Nenhum artigo encontrado'
            : `${pagination.total} ${pagination.total === 1 ? 'artigo' : 'artigos'} ${hasActiveFilters ? 'encontrado' : 'publicado'}${pagination.total !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="classical-card p-12 text-center">
          <FiSearch className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-theme-primary mb-2">
            Nenhum artigo encontrado
          </h3>
          <p className="text-theme-secondary mb-6">
            Tente ajustar os filtros ou fazer uma nova busca
          </p>
          <button onClick={clearFilters} className="btn-classical-primary">
            Limpar Filtros
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.totalPages ||
                        Math.abs(p - pagination.page) <= 1
                    )
                    .map((p, i, arr) => (
                      <div key={p} className="flex items-center">
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <span className="px-2 text-theme-tertiary">...</span>
                        )}
                        <button
                          onClick={() => updateParams({ page: p.toString() })}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            pagination.page === p
                              ? 'bg-brand-primary text-white shadow-theme-glow'
                              : 'bg-theme-elevated text-theme-secondary hover:bg-interactive-hover'
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    ))}
                </div>

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
        </>
      )}
    </>
  );
}
