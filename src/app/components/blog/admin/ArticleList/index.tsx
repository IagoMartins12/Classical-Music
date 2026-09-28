'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from '@/app/components/SmartImage';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  deleteArticle,
  duplicateArticle,
} from '@/app/requests/blog/admin-actions';
import {
  PiCalendarBlank,
  PiChatCenteredText,
  PiClock,
  PiCopy,
  PiDotsThreeVertical,
  PiEye,
  PiFunnel,
  PiHeart,
  PiMagnifyingGlass,
  PiNotePencil,
  PiTrash,
  PiUser,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import Modal from '@/app/components/Modal';
import Select from '@/app/components/Common/Select';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

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
      await deleteArticle(id);

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
      await duplicateArticle(id);

      toast.success('Artigo duplicado!');
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao duplicar artigo');
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
        <PiWarningCircle className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
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
          <PiNotePencil className="w-4 h-4" />
          <span>Criar Primeiro Artigo</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filters */}
      <Card densidade="compacta" className="mb-6">
        <Stack>
          {/* Search Bar */}
          <Inline gap={2}>
            <form onSubmit={handleSearch} className="flex-1 relative">
              <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
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
              <PiFunnel className="w-4 h-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full"></span>
              )}
            </button>

            {hasActiveFilters && (
              <Button
                variante="secundario"
                type="submit"
                onClick={clearFilters}
                title="Limpar filtros"
              >
                <PiX className="w-5 h-5" />
              </Button>
            )}
          </Inline>

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-theme-secondary">
              {/* Status Filter */}
              <div>
                <Select
                  label="Status"
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
                <Select
                  label="Categoria"
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
                <Select
                  label="Tipo"
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
                <Select
                  label="Autor"
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
        </Stack>
      </Card>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="classical-card p-12 text-center">
          <PiMagnifyingGlass className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-theme-primary mb-2">
            Nenhum artigo encontrado
          </h3>
          <p className="text-theme-secondary mb-4">
            Tente ajustar os filtros ou fazer uma nova busca
          </p>
          <Button variante="primario" type="submit" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {articles.map((article) => (
              <div
                key={article.id}
                className="classical-card overflow-hidden transition-all group"
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
                        <PiNotePencil className="w-12 h-12" />
                      </div>
                    )}

                    {/* Featured Badge */}
                    {article.isFeatured && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                        Destaque
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
                            <Text papel="legenda" tom="fraco">
                              +{article.categories.length - 2}
                            </Text>
                          )}
                        </div>
                      </div>

                      {/* Action Menu */}
                      <div className="relative">
                        <Button
                          variante="fantasma"
                          tamanho="p"
                          onClick={() =>
                            setActionMenu(
                              actionMenu === article.id ? null : article.id
                            )
                          }
                          icone={PiDotsThreeVertical}
                        >
                          <NomeAcao acao="maisOpcoes" />
                        </Button>

                        {actionMenu === article.id && (
                          <div className="absolute top-0 right-7 mt-1 w-48 bg-theme-tertiary rounded-lg shadow-xl z-10">
                            <Link
                              href={`/blog/admin/articles/${article.id}/edit`}
                              className="flex items-center space-x-2 px-4 py-2 text-theme-secondary"
                            >
                              <PiNotePencil className="w-4 h-4" />
                              <span>Editar</span>
                            </Link>

                            {article.status === 'PUBLISHED' && (
                              <Link
                                href={`/blog/${article.slug}`}
                                target="_blank"
                                className="flex items-center space-x-2 px-4 py-2 text-theme-secondary"
                              >
                                <PiEye className="w-4 h-4" />
                                <span>Ver Publicado</span>
                              </Link>
                            )}

                            <Inline
                              as="button"
                              gap={2}
                              onClick={() => handleDuplicate(article.id)}
                              className="w-full px-4 py-2 text-theme-secondary"
                            >
                              <PiCopy className="w-4 h-4" />
                              <span>Duplicar</span>
                            </Inline>

                            <Inline
                              as="button"
                              gap={2}
                              onClick={() => setDeleteModal(article.id)}
                              className="w-full px-4 py-2 hover:bg-red-500/10 rounded-b-lg !text-erro"
                            >
                              <PiTrash className="w-4 h-4" />
                              <span>Deletar</span>
                            </Inline>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {article.description && (
                      <Text
                        papel="rotulo"
                        tom="fraco"
                        as="p"
                        className="mb-3 line-clamp-2"
                      >
                        {article.description}
                      </Text>
                    )}

                    {/* Meta */}
                    <div className="mt-auto">
                      {/* Author & Date */}
                      <Inline
                        gap={3}
                        className="text-xs text-theme-tertiary mb-3"
                      >
                        <Inline gap={1}>
                          <PiUser className="w-3 h-3" />
                          <span>{getAuthorName(article.author)}</span>
                        </Inline>

                        <Inline gap={1}>
                          <PiCalendarBlank className="w-3 h-3" />
                          <span>
                            {new Date(article.updatedAt).toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        </Inline>

                        <Inline gap={1}>
                          <PiClock className="w-3 h-3" />
                          <span>{article.readTime} min</span>
                        </Inline>
                      </Inline>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <Inline gap={3} className="text-theme-tertiary">
                          <Inline gap={1}>
                            <PiEye className="w-4 h-4" />
                            <span>{article.viewCount}</span>
                          </Inline>

                          <Inline gap={1}>
                            <PiHeart className="w-4 h-4" />
                            <span>{article._count.likes}</span>
                          </Inline>

                          <Inline gap={1}>
                            <PiChatCenteredText className="w-4 h-4" />
                            <span>{article._count.comments}</span>
                          </Inline>
                        </Inline>

                        {/* Quick Actions */}
                        <Inline
                          gap={1}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Link
                            href={`/blog/admin/articles/${article.id}/edit`}
                            className="p-2 rounded-lg text-theme-tertiary hover:text-blue-500 transition-all"
                            title="Editar"
                          >
                            <PiNotePencil className="w-4 h-4" />
                          </Link>

                          {article.status === 'PUBLISHED' && (
                            <Link
                              href={`/blog/${article.slug}`}
                              target="_blank"
                              className="p-2 rounded-lg text-theme-tertiary hover:text-green-500 transition-all"
                              title="Ver"
                            >
                              <PiEye className="w-4 h-4" />
                            </Link>
                          )}

                          <Button
                            variante="fantasma"
                            tamanho="p"
                            onClick={() => setDeleteModal(article.id)}
                            title="Deletar"
                            icone={PiTrash}
                            rotulo="Deletar"
                            className="text-erro"
                          />
                        </Inline>
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
              <Text papel="rotulo" tom="fraco" as="p">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                de {pagination.total} artigos
              </Text>

              <Inline gap={2}>
                {pagination.page > 1 && (
                  <Button
                    variante="secundario"
                    type="submit"
                    onClick={() =>
                      updateParams({ page: (pagination.page - 1).toString() })
                    }
                  >
                    Anterior
                  </Button>
                )}

                <Inline gap={1}>
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
                                ? 'text-white'
                                : 'bg-theme-elevated text-theme-secondary'
                            }
                          `}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </Inline>

                {pagination.page < pagination.totalPages && (
                  <Button
                    variante="secundario"
                    type="submit"
                    onClick={() =>
                      updateParams({ page: (pagination.page + 1).toString() })
                    }
                  >
                    Próxima
                  </Button>
                )}
              </Inline>
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
                <PiWarningCircle className="w-6 h-6 text-red-500" />
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

                <Inline gap={3}>
                  <Button
                    tamanho="p"
                    onClick={() => setDeleteModal(null)}
                    disabled={deleting}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variante="perigo"
                    tamanho="p"
                    onClick={() => handleDelete(deleteModal)}
                    disabled={deleting}
                    className="flex-1"
                  >
                    {deleting ? 'Deletando...' : 'Deletar'}
                  </Button>
                </Inline>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
