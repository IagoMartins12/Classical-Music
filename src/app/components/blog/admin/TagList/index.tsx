'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteTag } from '@/app/requests/blog/admin-actions';
import {
  PiEye,
  PiMagnifyingGlass,
  PiNotePencil,
  PiTag,
  PiTrash,
  PiWarningCircle,
} from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  articleCount: number;
  _count: {
    articles: number;
  };
}

interface TagListProps {
  tags: Tag[];
}

export function TagList({ tags: tags }: TagListProps) {
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    router.push(`/blog/admin/tags?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteTag(id);

      toast.success('Tag deletada com sucesso!');
      setDeleteModal(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar tag');
    } finally {
      setDeleting(false);
    }
  };

  const filteredTags = searchTerm
    ? tags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tags;

  if (tags.length === 0) {
    return (
      <div className="classical-card p-12 text-center">
        <PiWarningCircle className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-theme-primary mb-2">
          Nenhuma tag criada
        </h3>
        <p className="text-theme-secondary mb-6">
          Crie sua primeira tag para começar a organizar os artigos
        </p>
        <Link
          href="/blog/admin/tags/create"
          className="btn-classical-primary inline-flex items-center space-x-2"
        >
          <PiTag className="w-4 h-4" />
          <span>Criar Primeira Tag</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <Card densidade="compacta" className="mb-6">
        <form onSubmit={handleSearch} className="relative">
          <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar tags por nome ou slug..."
            className="input-classical w-full pl-10"
          />
        </form>
      </Card>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTags.map((tag) => (
          <Card
            key={tag.id}
            className="hover:shadow-theme-medium transition-all group"
          >
            {/* Tag Header */}
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: tag.color ? `${tag.color}20` : '#d4af3720',
                  color: tag.color || '#d4af37',
                }}
              >
                <PiTag className="w-6 h-6" />
              </div>

              <Inline
                gap={1}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Link
                  href={`/blog/tag/${tag.slug}`}
                  target="_blank"
                  className="p-2 rounded-lg hover:bg-interactive-hover text-theme-tertiary hover:text-brand-primary transition-all"
                  title="Ver tag"
                >
                  <PiEye className="w-4 h-4" />
                </Link>

                <Link
                  href={`/blog/admin/tags/edit/${tag.id}`}
                  className="p-2 rounded-lg hover:bg-interactive-hover text-theme-tertiary hover:text-blue-500 transition-all"
                  title="Editar"
                >
                  <PiNotePencil className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setDeleteModal(tag.id)}
                  className="p-2 rounded-lg hover:bg-interactive-hover text-theme-tertiary hover:text-red-500 transition-all"
                  title="Deletar"
                  disabled={tag._count.articles > 0}
                >
                  <PiTrash className="w-4 h-4" />
                </button>
              </Inline>
            </div>

            {/* Tag Info */}
            <div>
              <h3 className="text-lg font-semibold text-theme-primary mb-1 truncate">
                #{tag.name}
              </h3>

              {tag.description && (
                <Text
                  papel="rotulo"
                  tom="fraco"
                  as="p"
                  className="mb-3 line-clamp-2"
                >
                  {tag.description}
                </Text>
              )}

              <div className="flex items-center justify-between text-sm">
                <code className="text-xs bg-theme-elevated px-2 py-1 rounded text-brand-primary">
                  /{tag.slug}
                </code>

                <span className="text-theme-tertiary">
                  {tag._count.articles}{' '}
                  {tag._count.articles === 1 ? 'artigo' : 'artigos'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTags.length === 0 && searchTerm && (
        <div className="classical-card p-12 text-center">
          <PiMagnifyingGlass className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-theme-primary mb-2">
            Nenhuma tag encontrada
          </h3>
          <p className="text-theme-secondary">Tente buscar com outros termos</p>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-theme-secondary rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <PiWarningCircle className="w-6 h-6 text-red-500" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  Deletar Tag
                </h3>
                <p className="text-theme-secondary mb-4">
                  Tem certeza que deseja deletar esta tag? Esta ação não pode
                  ser desfeita.
                </p>

                {(tags.find((t) => t.id === deleteModal)?._count.articles ??
                  0) > 0 && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-600">
                      ⚠️ Esta tag possui{' '}
                      {tags.find((t) => t.id === deleteModal)?._count.articles}{' '}
                      artigos. Remova a tag dos artigos primeiro.
                    </p>
                  </div>
                )}

                <Inline gap={3}>
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
                    disabled={
                      deleting ||
                      (tags.find((t) => t.id === deleteModal)?._count
                        .articles ?? 0) > 0
                    }
                  >
                    {deleting ? 'Deletando...' : 'Deletar'}
                  </button>
                </Inline>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
