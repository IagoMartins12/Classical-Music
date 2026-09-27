// components/blog/CategoryForm.tsx - COM ROTA ESPECÍFICA
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/app/components/SmartImage';
import {
  PiFloppyDisk,
  PiTrash,
  PiUploadSimple,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import {
  createCategory,
  removeCategoryImage,
  updateCategory,
  uploadCategoryImage,
} from '@/app/requests/blog/admin-actions';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Card } from '@/app/components/ui/Card';

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
  const [pendingImage, setPendingImage] = useState<File | null>(null);
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

  const clearImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImagePreview(null);
    setPendingImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // A imagem sobe pela rota da categoria, que precisa do id: na criação ela
  // fica guardada e sobe logo depois de a categoria existir.
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

    if (!category?.id) {
      setPendingImage(file);
      setImagePreview(URL.createObjectURL(file));
      return;
    }

    setUploading(true);

    try {
      const url = await uploadCategoryImage(category.id, file);

      setFormData((prev) => ({ ...prev, image: url }));
      setImagePreview(url);
      toast.success('Imagem enviada!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (pendingImage) {
      clearImage();
      return;
    }

    if (!formData.image || !category?.id) return;

    try {
      await removeCategoryImage(category.id);
      clearImage();
      toast.success('Imagem removida!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao remover imagem');
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
      if (mode === 'create' || !category) {
        const created = await createCategory(formData);

        if (pendingImage && created.id) {
          try {
            await uploadCategoryImage(created.id, pendingImage);
          } catch {
            toast.error('Categoria criada, mas a imagem não foi enviada');
          }
        }
      } else {
        await updateCategory(category.id, formData);
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
    <Stack gap={6} as="form" onSubmit={handleSubmit}>
      {/* Basic Info Card */}
      <Card>
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          Informações Básicas
        </h3>

        <Stack>
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
                errors.name ? 'border-erro' : ''
              }`}
              placeholder="Ex: Análise Musical"
              maxLength={50}
            />
            {errors.name && (
              <Inline as="p" gap={1} className="text-sm text-erro mt-1">
                <PiWarningCircle className="w-4 h-4" />
                <span>{errors.name}</span>
              </Inline>
            )}
            <Text papel="legenda" tom="fraco" as="p" className="mt-1">
              {formData.name.length}/50 caracteres
            </Text>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Slug (URL) *
            </label>
            <Inline gap={2}>
              <Text papel="rotulo" tom="fraco">
                /blog/category/
              </Text>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className={`input-classical flex-1 ${
                  errors.slug ? 'border-erro' : ''
                }`}
                placeholder="analise-musical"
                maxLength={60}
              />
            </Inline>
            {errors.slug && (
              <Inline as="p" gap={1} className="text-sm text-erro mt-1">
                <PiWarningCircle className="w-4 h-4" />
                <span>{errors.slug}</span>
              </Inline>
            )}
            <Text papel="legenda" tom="fraco" as="p" className="mt-1">
              Apenas letras minúsculas, números e hífens
            </Text>
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
              placeholder="Breve descrição da categoria..."
              rows={3}
              maxLength={200}
            />
            <Text papel="legenda" tom="fraco" as="p" className="mt-1">
              {formData.description.length}/200 caracteres
            </Text>
          </div>
        </Stack>
      </Card>

      {/* Appearance Card */}
      <Card>
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          Aparência
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Icon */}
          <div>
            <Field
              label="Ícone (Emoji)"
              type="text"
              value={formData.icon}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, icon: e.target.value }))
              }
              placeholder="📚"
              maxLength={2}
            />
            <Text papel="legenda" tom="fraco" as="p" className="mt-1">
              Use um emoji para representar a categoria
            </Text>

            {formData.icon && (
              <Stack gap={2} className="mt-3 p-4 bg-theme-elevated rounded-lg">
                <Text papel="legenda" tom="fraco" as="p">
                  Preview:
                </Text>
                <Inline gap={3}>
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
                </Inline>
              </Stack>
            )}
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
              <Inline as="p" gap={1} className="text-sm text-erro mt-1">
                <PiWarningCircle className="w-4 h-4" />
                <span>{errors.color}</span>
              </Inline>
            )}

            <div className="mt-3 p-4 bg-theme-elevated rounded-lg">
              <Text papel="legenda" tom="fraco" as="p" className="mb-2">
                Preview:
              </Text>
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
          <Text papel="legenda" tom="fraco" as="p" className="mb-3">
            Recomendado: 800x400px, máximo 2MB
          </Text>

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
                className="absolute top-2 right-2 p-2 bg-erro hover:bg-erro text-white rounded-lg transition-all"
              >
                <PiTrash className="w-4 h-4" />
                <NomeAcao acao="excluir" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-theme-secondary rounded-lg p-8 text-center hover:border-ouro hover:bg-ouro/10 transition-all ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {uploading ? (
                <Stack gap={2} className="items-center">
                  <div className="w-8 h-8 border-2 border-ouro border-t-transparent rounded-full animate-spin"></div>
                  <Text papel="rotulo" tom="suave" as="p">
                    Enviando imagem...
                  </Text>
                </Stack>
              ) : (
                <Stack gap={2} className="items-center">
                  <PiUploadSimple className="w-8 h-8 text-theme-tertiary" />
                  <Text papel="rotulo" tom="suave" as="p">
                    Clique para selecionar uma imagem
                  </Text>
                  <Text papel="legenda" tom="fraco" as="p">
                    JPG, PNG ou WebP até 2MB
                  </Text>
                </Stack>
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
      </Card>

      {/* Settings Card */}
      <Card>
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          Configurações
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-theme-primary">Categoria Ativa</p>
            <Text papel="rotulo" tom="fraco" as="p">
              Categorias inativas não aparecem no blog
            </Text>
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
                ? 'Criar Categoria'
                : 'Salvar Alterações'}
          </span>
        </Inline>
      </Inline>
    </Stack>
  );
}
