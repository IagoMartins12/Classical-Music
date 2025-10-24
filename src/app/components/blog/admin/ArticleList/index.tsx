'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiSearch,
  FiFilter,
  FiX,
  FiAlertCircle,
  FiClock,
  FiCalendar,
  FiUser,
  FiHeart,
  FiMessageSquare,
  FiMoreVertical,
  FiCopy,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Modal from '@/app/components/Modal';
import Select from '@/app/components/Common/Select';

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  status: string;
  types: string[];
  isFeatured: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  readTime: number | null;
  viewCount: number;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
      icon: string | null;
    };
  }>;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
    };
  }>;
  _count: {
    comments: number;
    likes: number;
  };
}

interface ArticleListProps {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      icon: string | null;
    }>;
    authors: Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      image: string | null;
    }>;
  };
  currentParams: any;
}

export function ArticleList({
  articles,
  pagination,
  filters,
  currentParams,
}: ArticleListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(currentParams.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const articleTypes = [
    { value: 'ANALYSIS', label: 'Análise Musical' },
    { value: 'BIOGRAPHY', label: 'Biografia' },
    { value: 'COMPARISON', label: 'Comparação' },
    { value: 'GUIDE', label: 'Guia/Tutorial' },
    { value: 'HISTORY', label: 'História' },
    { value: 'INTERVIEW', label: 'Entrevista' },
    { value: 'NEWS', label: 'Notícias' },
    { value: 'OPINION', label: 'Opinião' },
    { value: 'PERFORMANCE', label: 'Performance' },
    { value: 'REVIEW', label: 'Resenha' },
    { value: 'TECHNIQUE', label: 'Técnica' },
    { value: 'THEORY', label: 'Teoria Musical' },
  ];

  const statusOptions = [
    { value: 'DRAFT', label: 'Rascunho', color: 'gray' },
    { value: 'PUBLISHED', label: 'Publicado', color: 'green' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchTerm, page: '1' });
  };

  const updateParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/blog/admin/articles?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/blog/admin/articles');
    setSearchTerm('');
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/blog/articles?id=${id}`, {
        method: 'DELETE',
        body: JSON.stringify({
          id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar');
      }

      toast.success('Artigo deletado com sucesso!');
      setDeleteModal(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar artigo');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/blog/articles/${id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error();

      toast.success('Artigo duplicado!');
      router.refresh();
    } catch {
      toast.error('Erro ao duplicar artigo');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Rascunho',
      PUBLISHED: 'Publicado',
    };
    return labels[status] || status;
  };

  const getAuthorName = (author: Article['author']) => {
    return (
      `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Autor'
    );
  };

  const hasActiveFilters =
    currentParams.search ||
    currentParams.status ||
    currentParams.category ||
    currentParams.author ||
    currentParams.type;

  if (articles.length === 0 && !hasActiveFilters) {
    return (
      <div className="classical-card p-12 text-center">
        <FiAlertCircle className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-theme-primary mb-2">
          Nenhum artigo criado
        </h3>
        <p className="text-theme-secondary mb-6">
          Comece criando seu primeiro artigo para o blog
        </p>
        <Link
          href="/blog/admin/articles/create"
          className="btn-classical-primary inline-flex items-center space-x-2"
        >
          <FiEdit className="w-4 h-4" />
          <span>Criar Primeiro Artigo</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filters */}
      <div className="classical-card p-4 mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-2">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título ou descrição..."
                className="input-classical w-full pl-10"
              />
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-classical-secondary flex items-center space-x-2 ${
                hasActiveFilters ? '' : ''
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
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-theme-secondary">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Status
                </label>
                <Select
                  options={statusOptions}
                  value={currentParams.status || ''}
                  onChange={(e) =>
                    updateParams({ status: e.target.value, page: '1' })
                  }
                  className="input-classical-2 w-full text-sm"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Categoria
                </label>

                <Select
                  options={filters.categories.map((cat) => {
                    return {
                      label: `${cat.icon} ${cat.name}`,
                      value: cat.id,
                    };
                  })}
                  value={currentParams.author || ''}
                  onChange={(e) =>
                    updateParams({ author: e.target.value, page: '1' })
                  }
                  className="input-classical-2 w-full text-sm"
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Tipo
                </label>
                <Select
                  options={articleTypes}
                  value={currentParams.type || ''}
                  onChange={(e) =>
                    updateParams({ type: e.target.value, page: '1' })
                  }
                  className="input-classical-2 w-full text-sm"
                />
              </div>

              {/* Author Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Autor
                </label>
                <Select
                  options={filters.authors.map((author) => {
                    return {
                      label: getAuthorName(author),
                      value: author.id,
                    };
                  })}
                  value={currentParams.author || ''}
                  onChange={(e) =>
                    updateParams({ author: e.target.value, page: '1' })
                  }
                  className="input-classical-2 w-full text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="classical-card p-12 text-center">
          <FiSearch className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-theme-primary mb-2">
            Nenhum artigo encontrado
          </h3>
          <p className="text-theme-secondary mb-4">
            Tente ajustar os filtros ou fazer uma nova busca
          </p>
          <button onClick={clearFilters} className="btn-classical-primary">
            Limpar Filtros
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {articles.map((article) => (
              <div
                key={article.id}
                className="classical-card overflow-hidden hover:shadow-theme-large transition-all group"
              >
                <div className="flex">
                  {/* Cover Image */}
                  <div className="relative w-48 h-48 flex-shrink-0 bg-theme-elevated">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-theme-tertiary">
                        <FiEdit className="w-12 h-12" />
                      </div>
                    )}

                    {/* Featured Badge */}
                    {article.isFeatured && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                        ⭐ Destaque
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute bottom-2 left-2">
                      <span
                        className={`
                          px-2 py-1 rounded text-xs font-medium
                          ${
                            article.status === 'PUBLISHED'
                              ? 'bg-green-500 text-white'
                              : article.status === 'DRAFT'
                                ? 'bg-gray-500 text-white'
                                : article.status === 'REVIEW'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-red-500 text-white'
                          }
                        `}
                      >
                        {getStatusLabel(article.status)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="text-lg font-bold text-theme-primary mb-1 line-clamp-2">
                          {article.title}
                        </h3>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {article.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat.category.id}
                              className="text-xs px-2 py-0.5 rounded"
                              style={{
                                background: cat.category.color
                                  ? `${cat.category.color}20`
                                  : '#d4af3720',
                                color: cat.category.color || '#d4af37',
                              }}
                            >
                              {cat.category.icon} {cat.category.name}
                            </span>
                          ))}
                          {article.categories.length > 2 && (
                            <span className="text-xs text-theme-tertiary">
                              +{article.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActionMenu(
                              actionMenu === article.id ? null : article.id
                            )
                          }
                          className="p-2 rounded-lg hover:bg-interactive-hover text-theme-tertiary transition-all"
                        >
                          <FiMoreVertical className="w-4 h-4" />
                        </button>

                        {actionMenu === article.id && (
                          <div className="absolute top-0 right-7 mt-1 w-48 bg-theme-tertiary rounded-lg shadow-xl border border-theme-secondary z-10">
                            <Link
                              href={`/blog/admin/articles/${article.id}/edit`}
                              className="flex items-center space-x-2 px-4 py-2 hover:bg-interactive-hover text-theme-secondary"
                            >
                              <FiEdit className="w-4 h-4" />
                              <span>Editar</span>
                            </Link>

                            {article.status === 'PUBLISHED' && (
                              <Link
                                href={`/blog/${article.slug}`}
                                target="_blank"
                                className="flex items-center space-x-2 px-4 py-2 hover:bg-interactive-hover text-theme-secondary"
                              >
                                <FiEye className="w-4 h-4" />
                                <span>Ver Publicado</span>
                              </Link>
                            )}

                            <button
                              onClick={() => handleDuplicate(article.id)}
                              className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-interactive-hover text-theme-secondary"
                            >
                              <FiCopy className="w-4 h-4" />
                              <span>Duplicar</span>
                            </button>

                            <button
                              onClick={() => setDeleteModal(article.id)}
                              className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-red-500/10 text-red-500 rounded-b-lg"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              <span>Deletar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {article.description && (
                      <p className="text-sm text-theme-tertiary mb-3 line-clamp-2">
                        {article.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="mt-auto">
                      {/* Author & Date */}
                      <div className="flex items-center space-x-3 text-xs text-theme-tertiary mb-3">
                        <div className="flex items-center space-x-1">
                          <FiUser className="w-3 h-3" />
                          <span>{getAuthorName(article.author)}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <FiCalendar className="w-3 h-3" />
                          <span>
                            {new Date(article.updatedAt).toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <FiClock className="w-3 h-3" />
                          <span>{article.readTime} min</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3 text-theme-tertiary">
                          <div className="flex items-center space-x-1">
                            <FiEye className="w-4 h-4" />
                            <span>{article.viewCount}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <FiHeart className="w-4 h-4" />
                            <span>{article._count.likes}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <FiMessageSquare className="w-4 h-4" />
                            <span>{article._count.comments}</span>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/blog/admin/articles/${article.id}/edit`}
                            className="p-2 rounded-lg hover:bg-interactive-hover text-theme-tertiary hover:text-blue-500 transition-all"
                            title="Editar"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>

                          {article.status === 'PUBLISHED' && (
                            <Link
                              href={`/blog/${article.slug}`}
                              target="_blank"
                              className="p-2 rounded-lg hover:bg-interactive-hover text-theme-tertiary hover:text-green-500 transition-all"
                              title="Ver"
                            >
                              <FiEye className="w-4 h-4" />
                            </Link>
                          )}

                          <button
                            onClick={() => setDeleteModal(article.id)}
                            className="p-2 rounded-lg hover:bg-interactive-hover text-theme-tertiary hover:text-red-500 transition-all"
                            title="Deletar"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-theme-tertiary">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                de {pagination.total} artigos
              </p>

              <div className="flex items-center space-x-2">
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

                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === pagination.totalPages ||
                        Math.abs(page - pagination.page) <= 1
                    )
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-theme-tertiary">...</span>
                        )}
                        <button
                          onClick={() =>
                            updateParams({ page: page.toString() })
                          }
                          className={`
                            px-3 py-2 rounded-lg font-medium transition-all
                            ${
                              pagination.page === page
                                ? 'bg-brand-primary text-white'
                                : 'bg-theme-elevated text-theme-secondary hover:bg-interactive-hover'
                            }
                          `}
                        >
                          {page}
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

      {/* Delete Modal */}
      {deleteModal && (
        <Modal isOpen onClose={() => setDeleteModal(null)} maxWidth="lg">
          <div className=" rounded-2xl max-w-md w-full p-6 ">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <FiAlertCircle className="w-6 h-6 text-red-500" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  Deletar Artigo
                </h3>
                <p className="text-theme-secondary mb-4">
                  Tem certeza que deseja deletar este artigo? Esta ação não pode
                  ser desfeita. Todos os comentários e interações serão
                  perdidos.
                </p>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="flex-1 px-4 py-2 rounded-lg bg-theme-elevated hover:bg-interactive-hover text-theme-primary transition-all"
                    disabled={deleting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(deleteModal)}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50"
                    disabled={deleting}
                  >
                    {deleting ? 'Deletando...' : 'Deletar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
