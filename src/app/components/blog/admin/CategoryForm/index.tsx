// components/blog/CategoryForm.tsx - COM ROTA ESPECÍFICA
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSave, FiX, FiUpload, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface CategoryFormProps {
  mode: 'create' | 'edit';
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    image: string | null;
    order: number;
    isActive: boolean;
  };
}

export function CategoryForm({ mode, category }: CategoryFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || '',
    color: category?.color || '#d4af37',
    image: category?.image || '',
    isActive: category?.isActive ?? true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    category?.image || null
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));

    if (mode === 'create' || !category) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug é obrigatório';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        'Slug deve conter apenas letras minúsculas, números e hífens';
    }

    if (!formData.color) {
      newErrors.color = 'Cor é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ CORRIGIDO: Upload usando rota específica de categoria
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 2MB');
      return;
    }

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      // Se está editando, passar o categoryId
      if (category?.id) {
        formDataUpload.append('categoryId', category.id);
      }

      console.log('categr', { formDataUpload, category, file });
      // ✅ USAR ROTA ESPECÍFICA PARA CATEGORIAS
      const response = await fetch('/api/blog/admin/categories/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      // sempre tenta ler o JSON
      const data = await response.json();

      console.log('RESPONSE');
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro no upload');
      }

      setFormData((prev) => ({ ...prev, image: data.url }));
      setImagePreview(data.url);
      toast.success('Imagem enviada!');
    } catch (error) {
      toast.error('Erro ao enviar imagem');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.image) return;

    try {
      // ✅ USAR ROTA ESPECÍFICA PARA DELETAR
      const response = await fetch(
        `/api/blog/admin/categories/upload?url=${encodeURIComponent(formData.image)}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, image: '' }));
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success('Imagem removida!');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover imagem');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Corrija os erros no formulário');
      return;
    }

    setSubmitting(true);

    try {
      const url =
        mode === 'create'
          ? '/api/blog/admin/categories/create'
          : `/api/blog/admin/categories/${category?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar categoria');
      }

      toast.success(
        mode === 'create'
          ? 'Categoria criada com sucesso!'
          : 'Categoria atualizada com sucesso!'
      );

      router.push('/blog/admin/categories');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar categoria');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info Card */}
      <div className="classical-card p-6">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          Informações Básicas
        </h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Nome da Categoria *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`input-classical w-full ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder="Ex: Análise Musical"
              maxLength={50}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1 flex items-center space-x-1">
                <FiAlertCircle className="w-4 h-4" />
                <span>{errors.name}</span>
              </p>
            )}
            <p className="text-xs text-theme-tertiary mt-1">
              {formData.name.length}/50 caracteres
            </p>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Slug (URL) *
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-theme-tertiary text-sm">
                /blog/category/
              </span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className={`input-classical flex-1 ${
                  errors.slug ? 'border-red-500' : ''
                }`}
                placeholder="analise-musical"
                maxLength={60}
              />
            </div>
            {errors.slug && (
              <p className="text-sm text-red-500 mt-1 flex items-center space-x-1">
                <FiAlertCircle className="w-4 h-4" />
                <span>{errors.slug}</span>
              </p>
            )}
            <p className="text-xs text-theme-tertiary mt-1">
              Apenas letras minúsculas, números e hífens
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="input-classical w-full resize-none"
              placeholder="Breve descrição da categoria..."
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-theme-tertiary mt-1">
              {formData.description.length}/200 caracteres
            </p>
          </div>
        </div>
      </div>

      {/* Appearance Card */}
      <div className="classical-card p-6">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          Aparência
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Ícone (Emoji)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, icon: e.target.value }))
              }
              className="input-classical w-full"
              placeholder="📚"
              maxLength={2}
            />
            <p className="text-xs text-theme-tertiary mt-1">
              Use um emoji para representar a categoria
            </p>

            {formData.icon && (
              <div className="mt-3 p-4 bg-theme-elevated rounded-lg">
                <p className="text-xs text-theme-tertiary mb-2">Preview:</p>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{
                      background: formData.color
                        ? `${formData.color}20`
                        : 'var(--bg-elevated)',
                      color: formData.color || 'var(--text-primary)',
                    }}
                  >
                    {formData.icon}
                  </div>
                  <span className="font-medium text-theme-primary">
                    {formData.name || 'Nome da Categoria'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Cor *
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                className="h-12 w-20 rounded-lg cursor-pointer border-2 border-theme-secondary"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                className="input-classical flex-1"
                placeholder="#d4af37"
                maxLength={7}
              />
            </div>
            {errors.color && (
              <p className="text-sm text-red-500 mt-1 flex items-center space-x-1">
                <FiAlertCircle className="w-4 h-4" />
                <span>{errors.color}</span>
              </p>
            )}

            <div className="mt-3 p-4 bg-theme-elevated rounded-lg">
              <p className="text-xs text-theme-tertiary mb-2">Preview:</p>
              <div
                className="px-4 py-2 rounded-lg inline-block text-sm font-medium"
                style={{
                  background: `${formData.color}20`,
                  color: formData.color,
                  border: `1px solid ${formData.color}`,
                }}
              >
                {formData.name || 'Categoria'}
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Imagem da Categoria (Opcional)
          </label>
          <p className="text-xs text-theme-tertiary mb-3">
            Recomendado: 800x400px, máximo 2MB
          </p>

          {imagePreview ? (
            <div className="relative">
              <Image
                src={imagePreview}
                alt="Preview"
                width={800}
                height={400}
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-theme-secondary rounded-lg p-8 text-center hover:border-brand-primary hover:bg-interactive-hover transition-all ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-theme-secondary">
                    Enviando imagem...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <FiUpload className="w-8 h-8 text-theme-tertiary" />
                  <p className="text-sm text-theme-secondary">
                    Clique para selecionar uma imagem
                  </p>
                  <p className="text-xs text-theme-tertiary">
                    JPG, PNG ou WebP até 2MB
                  </p>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Settings Card */}
      <div className="classical-card p-6">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          Configurações
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-theme-primary">Categoria Ativa</p>
            <p className="text-sm text-theme-tertiary">
              Categorias inativas não aparecem no blog
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-classical-secondary flex items-center space-x-2"
          disabled={submitting}
        >
          <FiX className="w-4 h-4" />
          <span>Cancelar</span>
        </button>

        <button
          type="submit"
          className="btn-classical-primary flex items-center space-x-2"
          disabled={submitting}
        >
          <FiSave className="w-4 h-4" />
          <span>
            {submitting
              ? 'Salvando...'
              : mode === 'create'
                ? 'Criar Categoria'
                : 'Salvar Alterações'}
          </span>
        </button>
      </div>
    </form>
  );
}
