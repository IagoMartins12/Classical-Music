'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiFloppyDisk, PiTag, PiWarningCircle, PiX } from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import { createTag, updateTag } from '@/app/requests/blog/admin-actions';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';
import { Card } from '@/app/components/ui/Card';

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
      if (mode === 'create' || !tag) {
        await createTag(formData);
      } else {
        await updateTag(tag.id, formData);
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
      <Card>
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
              <Inline as="p" gap={1} className="text-sm text-red-500 mt-1">
                <PiWarningCircle className="w-4 h-4" />
                <span>{errors.name}</span>
              </Inline>
            )}
            <Text papel="legenda" tom="fraco" as="p" className="mt-1">
              {formData.name.length}/30 caracteres
            </Text>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Slug (URL) *
            </label>
            <Inline gap={2}>
              <Text papel="rotulo" tom="fraco">
                /blog/tag/
              </Text>
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
            </Inline>
            {errors.slug && (
              <Inline as="p" gap={1} className="text-sm text-red-500 mt-1">
                <PiWarningCircle className="w-4 h-4" />
                <span>{errors.slug}</span>
              </Inline>
            )}
          </div>

          {/* Description */}
          <div>
            <Field.Area
              label="Descrição"
              classeCampo="resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Breve descrição da tag..."
              rows={2}
              maxLength={150}
            />
            <Text papel="legenda" tom="fraco" as="p" className="mt-1">
              {formData.description.length}/150 caracteres
            </Text>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Cor *
            </label>
            <Inline gap={3}>
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
            </Inline>
            {errors.color && (
              <Inline as="p" gap={1} className="text-sm text-red-500 mt-1">
                <PiWarningCircle className="w-4 h-4" />
                <span>{errors.color}</span>
              </Inline>
            )}
          </div>
        </div>

        {/* Preview */}
        <Card nivel={2} className="mt-8 max-w-fit">
          <h3 className="text-lg font-semibold text-theme-primary mb-4">
            Preview
          </h3>

          <div className="space-y-4">
            {/* Badge Preview */}
            <div>
              <Text papel="legenda" tom="fraco" as="p" className="mb-2">
                Badge:
              </Text>
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
              <Text papel="legenda" tom="fraco" as="p" className="mb-2">
                Card:
              </Text>
              <Card densidade="compacta" className="max-w-xs">
                <Inline gap={3}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: `${formData.color}20`,
                      color: formData.color,
                    }}
                  >
                    <PiTag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-theme-primary">
                      #{formData.name || 'tag'}
                    </h4>
                    {formData.description && (
                      <Text
                        papel="legenda"
                        tom="fraco"
                        as="p"
                        className="line-clamp-1"
                      >
                        {formData.description}
                      </Text>
                    )}
                  </div>
                </Inline>
              </Card>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Inline gap={4} className="justify-end">
          <Inline
            as="button"
            gap={2}
            type="button"
            onClick={() => router.back()}
            className="btn-classical-secondary"
            disabled={submitting}
          >
            <PiX className="w-4 h-4" />
            <span>Cancelar</span>
          </Inline>

          <Inline
            as="button"
            gap={2}
            type="submit"
            className="btn-classical-primary"
            disabled={submitting}
          >
            <PiFloppyDisk className="w-4 h-4" />
            <span>
              {submitting
                ? 'Salvando...'
                : mode === 'create'
                  ? 'Criar Tag'
                  : 'Salvar Alterações'}
            </span>
          </Inline>
        </Inline>
      </Card>
    </form>
  );
}
