// app/components/blog/BookmarksPageClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import Link from 'next/link';
import ViewModeToggle, { ViewMode } from '../../ViewModeToggle';
import { ArticleCard } from '../ArticleCard';
import { ArticleCardList } from '../ArticleCardList';
interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
}

// ✅ INTERFACE CORRIGIDA
interface Article {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  readTime: number;
  publishedAt: Date | null;
  author: {
    id: string;
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

interface BookmarksPageClientProps {
  categories: Category[];
}

export function BookmarksPageClient({ categories }: BookmarksPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchBookmarks();
  }, [page, selectedCategory]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const res = await fetch(`/api/blog/interactions/my-bookmarks?${params}`);
      const data = await res.json();

      if (data.success) {
        // ✅ MAPEAMENTO CORRETO - Transformar array de categorias no formato esperado
        const mappedArticles = data.bookmarks.map((bookmark: any) => ({
          ...bookmark.article,
          categories: bookmark.article.categories.map((cat: any) => ({
            category: cat,
          })),
        }));
        setArticles(mappedArticles);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Erro ao buscar salvos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Carregando artigos salvos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Stats & Filters */}
      <div className="classical-card p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Stats */}
          <div className="flex items-center gap-6">
            <div>
              <p className="text-3xl font-bold text-brand-primary">
                {pagination.total}
              </p>
              <p className="text-sm text-theme-tertiary">
                {pagination.total === 1 ? 'artigo salvo' : 'artigos salvos'}
              </p>
            </div>
          </div>

          {/* View Mode */}
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* Category Filter */}
        <div className="mt-6 pt-6 border-t border-theme-secondary">
          <div className="flex items-center gap-2 mb-3">
            <FiFilter className="w-4 h-4 text-theme-tertiary" />
            <span className="text-sm font-medium text-theme-secondary">
              Filtrar por categoria:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-brand-primary text-white shadow-theme-glow'
                  : 'bg-theme-elevated text-theme-secondary hover:bg-interactive-hover'
              }`}
            >
              Todas
            </button>

            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  selectedCategory === cat.slug
                    ? 'shadow-lg'
                    : 'hover:scale-105'
                }`}
                style={{
                  background:
                    selectedCategory === cat.slug
                      ? cat.color || 'var(--brand-primary)'
                      : cat.color
                        ? `${cat.color}20`
                        : 'var(--theme-elevated)',
                  color:
                    selectedCategory === cat.slug
                      ? '#ffffff'
                      : cat.color || 'var(--theme-secondary)',
                }}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="classical-card p-12 text-center">
          <FiSearch className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-theme-primary mb-2">
            {selectedCategory === 'all'
              ? 'Nenhum artigo salvo ainda'
              : 'Nenhum artigo salvo nesta categoria'}
          </h3>
          <p className="text-theme-secondary mb-6">
            {selectedCategory === 'all'
              ? 'Comece a construir sua biblioteca pessoal salvando artigos interessantes!'
              : 'Tente selecionar outra categoria ou explore todos os artigos'}
          </p>
          <Link href="/blog" className="btn-classical-primary">
            Explorar Blog
          </Link>
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
                {page > 1 && (
                  <button
                    onClick={() => handlePageChange(page - 1)}
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
                        Math.abs(p - page) <= 1
                    )
                    .map((p, i, arr) => (
                      <div key={p} className="flex items-center">
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <span className="px-2 text-theme-tertiary">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(p)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            page === p
                              ? 'bg-brand-primary text-white shadow-theme-glow'
                              : 'bg-theme-elevated text-theme-secondary hover:bg-interactive-hover'
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    ))}
                </div>

                {page < pagination.totalPages && (
                  <button
                    onClick={() => handlePageChange(page + 1)}
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
