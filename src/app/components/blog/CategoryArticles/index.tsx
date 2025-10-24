// app/components/blog/CategoryArticles.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ViewModeToggle, { ViewMode } from '@/app/components/ViewModeToggle';
import { ArticleCard } from '@/app/components/blog/ArticleCard';
import { ArticleCardList } from '@/app/components/blog/ArticleCardList';
import { FiSearch } from 'react-icons/fi';

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

interface CategoryArticlesProps {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  categorySlug: string;
}

export function CategoryArticles({
  articles,
  pagination,
  categorySlug,
}: CategoryArticlesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Estado local - sem sync com URL
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // ✅ Apenas muda o estado local - sem router.push
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/blog/category/${categorySlug}?${params.toString()}`);
  };

  if (articles.length === 0) {
    return (
      <div className="classical-card p-12 text-center">
        <FiSearch className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-theme-primary mb-2">
          Nenhum artigo publicado ainda
        </h3>
        <p className="text-theme-secondary mb-6">
          Em breve teremos novos artigos nesta categoria
        </p>
        <Link href="/blog" className="btn-classical-primary">
          Ver todos os artigos
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-sm text-theme-tertiary">
          Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
          {pagination.total} artigos
        </p>

        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      {/* Articles */}
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
                onClick={() => handlePageChange(pagination.page - 1)}
                className="btn-classical-secondary"
              >
                Anterior
              </button>
            )}

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
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
                      onClick={() => handlePageChange(p)}
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
                onClick={() => handlePageChange(pagination.page + 1)}
                className="btn-classical-secondary"
              >
                Próxima
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
