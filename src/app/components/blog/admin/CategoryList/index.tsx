'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiMove,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  image: string | null;
  order: number;
  isActive: boolean;
  _count: {
    articles: number;
  };
}

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({
  categories: initialCategories,
}: CategoryListProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  // 🔧 refs para evitar stale closures nos listeners do document
  const draggingIndexRef = useRef<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);
  const offsetYRef = useRef(0);
  const categoriesRef = useRef(categories);

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);
  // 🔹 Quando começa a arrastar
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault(); // evita seleção de texto durante o drag

    const item = itemRefs.current[index];
    if (!item) return;

    const rect = item.getBoundingClientRect();

    // estado (apenas para render/estilo visual)
    setDraggingIndex(index);
    setDragOverIndex(index);

    // refs (são lidas pelos listeners do document)
    draggingIndexRef.current = index;
    dragOverIndexRef.current = index;
    offsetYRef.current = e.clientY - rect.top;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 🔹 Enquanto arrasta
  const handleMouseMove = (e: MouseEvent) => {
    const draggingIdx = draggingIndexRef.current;
    if (draggingIdx === null) return;

    const draggingItem = itemRefs.current[draggingIdx];
    if (!draggingItem) return;

    const midY = e.clientY - offsetYRef.current + draggingItem.offsetHeight / 2;

    let overIndex: number | null = null;
    for (let i = 0; i < itemRefs.current.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (midY >= rect.top && midY <= rect.bottom) {
        overIndex = i;
        break;
      }
    }

    if (overIndex !== null && overIndex !== dragOverIndexRef.current) {
      dragOverIndexRef.current = overIndex;
      // atualiza highlight visual enquanto arrasta
      setDragOverIndex(overIndex);
    }
  };
  // 🔹 Soltar o item
  const handleMouseUp = async () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    const from = draggingIndexRef.current;
    const to = dragOverIndexRef.current;

    // limpa refs de runtime
    draggingIndexRef.current = null;
    dragOverIndexRef.current = null;
    offsetYRef.current = 0;

    // limpa estado visual
    setDraggingIndex(null);
    setDragOverIndex(null);

    if (from === null || to === null || from === to) return;

    // usa snapshot atual das categorias (sem stale)
    const current = [...categoriesRef.current];
    const [moved] = current.splice(from, 1);
    current.splice(to, 0, moved);

    const updated = current.map((item, idx) => ({ ...item, order: idx }));
    setCategories(updated); // otimista

    setReordering(true);
    try {
      const resp = await fetch('/api/blog/admin/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: updated.map((it) => ({ id: it.id, order: it.order })),
        }),
      });
      if (!resp.ok) throw new Error();
      toast.success('Ordem salva!');
      router.refresh();
    } catch {
      toast.error('Erro ao salvar ordem');
      setCategories(initialCategories);
    } finally {
      setReordering(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/blog/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error();

      toast.success(
        currentStatus ? 'Categoria desativada!' : 'Categoria ativada!'
      );
      router.refresh();
    } catch {
      toast.error('Erro ao atualizar categoria');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/blog/admin/categories/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar');
      }

      toast.success('Categoria deletada com sucesso!');
      setDeleteModal(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar categoria');
    } finally {
      setDeleting(false);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="classical-card p-12 text-center">
        <FiAlertCircle className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-theme-primary mb-2">
          Nenhuma categoria criada
        </h3>
        <p className="text-theme-secondary mb-6">
          Crie sua primeira categoria para começar a organizar os artigos
        </p>
        <Link
          href="/blog/admin/categories/create"
          className="btn-classical-primary inline-flex items-center space-x-2"
        >
          <FiEdit className="w-4 h-4" />
          <span>Criar Primeira Categoria</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="classical-card overflow-hidden">
        {/* Table Header */}
        <div className="bg-theme-elevated border-b border-theme-secondary px-6 py-4">
          <div className="grid grid-cols-12 gap-4 font-semibold text-sm text-theme-tertiary">
            <div className="col-span-1"></div>
            <div className="col-span-4">Categoria</div>
            <div className="col-span-2">Slug</div>
            <div className="col-span-1 text-center">Artigos</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-3 text-right">Ações</div>
          </div>
        </div>

        {categories.map((category, index) => (
          <div
            key={category.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={`
      grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-theme-secondary
      ${draggingIndex === index ? 'opacity-50' : ''}
      ${dragOverIndex === index ? 'bg-theme-elevated' : ''}
    `}
          >
            {/* Drag Handle */}
            <div className="col-span-1">
              <button
                type="button"
                onMouseDown={(e) => handleMouseDown(e, index)}
                className="cursor-grab select-none p-1 rounded hover:bg-interactive-hover"
                title="Arrastar para reordenar"
              >
                <FiMove className="w-5 h-5 text-theme-tertiary" />
              </button>
            </div>
            {/* Category Info */}
            <div className="col-span-4 flex items-center space-x-3">
              {/* Icon or Image */}
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{
                    background: category.color
                      ? `${category.color}20`
                      : 'var(--bg-elevated)',
                    color: category.color || 'var(--text-primary)',
                  }}
                >
                  {category.icon || '📁'}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-theme-primary truncate">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-theme-tertiary truncate">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
            {/* Slug */}
            <div className="col-span-2">
              <code className="text-xs bg-theme-elevated px-2 py-1 rounded text-brand-primary">
                /{category.slug}
              </code>
            </div>
            {/* Article Count */}
            <div className="col-span-1 text-center">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-theme-elevated text-sm font-medium text-theme-primary">
                {category._count.articles}
              </span>
            </div>
            {/* Status */}
            <div className="col-span-1 text-center">
              <button
                onClick={() =>
                  handleToggleActive(category.id, category.isActive)
                }
                className={`
                                inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all
                                ${
                                  category.isActive
                                    ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
                                    : 'bg-gray-500/20 text-gray-600 hover:bg-gray-500/30'
                                }
                              `}
              >
                {category.isActive ? (
                  <>
                    <FiCheck className="w-3 h-3" />
                    <span>Ativa</span>
                  </>
                ) : (
                  <>
                    <FiX className="w-3 h-3" />
                    <span>Inativa</span>
                  </>
                )}
              </button>
            </div>
            {/* Actions */}
            <div className="col-span-3 flex items-center justify-end space-x-2">
              {/* View */}
              <Link
                href={`/blog/category/${category.slug}`}
                target="_blank"
                className="p-2 rounded-lg hover:bg-interactive-hover text-theme-secondary hover:text-brand-primary transition-all"
                title="Ver categoria"
              >
                {category.isActive ? (
                  <FiEye className="w-4 h-4" />
                ) : (
                  <FiEyeOff className="w-4 h-4" />
                )}
              </Link>

              {/* Edit */}
              <Link
                href={`/blog/admin/categories/edit/${category.id}`}
                className="p-2 rounded-lg hover:bg-interactive-hover text-theme-secondary hover:text-blue-500 transition-all"
                title="Editar"
              >
                <FiEdit className="w-4 h-4" />
              </Link>

              {/* Delete */}
              <button
                onClick={() => setDeleteModal(category.id)}
                className="p-2 rounded-lg hover:bg-interactive-hover text-theme-secondary hover:text-red-500 transition-all"
                title="Deletar"
                disabled={category._count.articles > 0}
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>{' '}
          </div>
        ))}
      </div>

      {/* Loading Overlay */}
      {reordering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-theme-secondary  classical-card  rounded-lg px-6 py-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-theme-primary font-medium">
                Atualizando ordem...
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {deleteModal && (
        <Modal isOpen onClose={() => setDeleteModal(null)}>
          <div className="rounded-2xl max-w-md w-full p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <FiAlertCircle className="w-6 h-6 text-red-500" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  Deletar Categoria
                </h3>
                <p className="text-theme-secondary mb-4">
                  Tem certeza que deseja deletar esta categoria? Esta ação não
                  pode ser desfeita.
                </p>

                {(categories.find((c) => c.id === deleteModal)?._count
                  .articles ?? 0) > 0 && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-600">
                      ⚠️ Esta categoria possui{' '}
                      {
                        categories.find((c) => c.id === deleteModal)?._count
                          .articles
                      }{' '}
                      artigos. Primeiro mova ou delete os artigos.
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => setDeleteModal(null)}
                    disabled={deleting}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="delete"
                    className="flex-1"
                    onClick={() => handleDelete(deleteModal)}
                    disabled={
                      deleting ||
                      (categories.find((c) => c.id === deleteModal)?._count
                        .articles ?? 0) > 0
                        ? true
                        : false
                    }
                  >
                    {deleting ? 'Deletando...' : 'Deletar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
