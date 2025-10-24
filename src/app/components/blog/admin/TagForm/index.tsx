'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiAlertCircle, FiTag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface TagFormProps {
  mode: 'create' | 'edit';
  tag?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
  };
}

export function TagForm({ mode, tag }: TagFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: tag?.name || '',
    slug: tag?.slug || '',
    description: tag?.description || '',
    color: tag?.color || '#d4af37',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));

    if (mode === 'create' || !tag) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  // Validate
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length > 30) {
      newErrors.name = 'Nome deve ter no máximo 30 caracteres';
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

  // Submit
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
          ? '/api/blog/admin/tags'
          : `/api/blog/admin/tags/${tag?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar tag');
      }

      toast.success(
        mode === 'create'
          ? 'Tag criada com sucesso!'
          : 'Tag atualizada com sucesso!'
      );

      router.push('/blog/admin/tags');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar tag');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="classical-card p-6">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          Informações da Tag
        </h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Nome da Tag *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`input-classical w-full ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder="Ex: beethoven, análise, técnica"
              maxLength={30}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1 flex items-center space-x-1">
                <FiAlertCircle className="w-4 h-4" />
                <span>{errors.name}</span>
              </p>
            )}
            <p className="text-xs text-theme-tertiary mt-1">
              {formData.name.length}/30 caracteres
            </p>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Slug (URL) *
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-theme-tertiary text-sm">/blog/tag/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className={`input-classical flex-1 ${
                  errors.slug ? 'border-red-500' : ''
                }`}
                placeholder="beethoven"
                maxLength={60}
              />
            </div>
            {errors.slug && (
              <p className="text-sm text-red-500 mt-1 flex items-center space-x-1">
                <FiAlertCircle className="w-4 h-4" />
                <span>{errors.slug}</span>
              </p>
            )}
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
              placeholder="Breve descrição da tag..."
              rows={2}
              maxLength={150}
            />
            <p className="text-xs text-theme-tertiary mt-1">
              {formData.description.length}/150 caracteres
            </p>
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
          </div>
        </div>

        {/* Preview */}
        <div className="classical-card-simple mt-8 max-w-fit p-6">
          <h3 className="text-lg font-semibold text-theme-primary mb-4">
            Preview
          </h3>

          <div className="space-y-4">
            {/* Badge Preview */}
            <div>
              <p className="text-xs text-theme-tertiary mb-2">Badge:</p>
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: `${formData.color}20`,
                  color: formData.color,
                }}
              >
                #{formData.name || 'tag'}
              </span>
            </div>

            {/* Card Preview */}
            <div>
              <p className="text-xs text-theme-tertiary mb-2">Card:</p>
              <div className="classical-card p-4 max-w-xs">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: `${formData.color}20`,
                      color: formData.color,
                    }}
                  >
                    <FiTag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-theme-primary">
                      #{formData.name || 'tag'}
                    </h4>
                    {formData.description && (
                      <p className="text-xs text-theme-tertiary line-clamp-1">
                        {formData.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
                  ? 'Criar Tag'
                  : 'Salvar Alterações'}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
