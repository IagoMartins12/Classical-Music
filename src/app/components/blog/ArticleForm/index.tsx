// components/blog/ArticleForm.tsx - ATUALIZADO COM COMPOSITORES E OBRAS
'use client';

import { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import {
  FaUpload,
  FaTimes,
  FaMusic,
  FaSave,
  FaEye,
  FaArrowRight,
  FaArrowLeft,
  FaClock,
  FaPlus,
  FaTrash,
} from 'react-icons/fa';
import { ArticleType, ArticleStatus } from '@prisma/client';
import { BlogEditor } from '../editor/BlogEditor';
import Image from 'next/image';
import Select from '@/app/components/Common/Select';
import MultiSelect from '@/app/components/Common/MultiSelect';
import { useToast } from '@/app/hooks/useToast';
import MultiSelectWithId from '../../Common/MultiSelectWithId';
import CoverCropper from '../CoverCropper';
import ArticlePreviewModal from '../ArticlePreviewModal';
import FeaturedArticlesManager from '../FeaturedArticlesManager';
import ComposerSearchInputSimple from '@/app/components/ComposerSearchInputSimple';
import SimpleWorkSearchInput from '@/app/components/SimpleWorkSearchInput';
import { FiUpload } from 'react-icons/fi';

const articleSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres'),
  description: z.string().nullish(),
  content: z.any(),
  coverImage: z.string().nullish(),
  coverImageAlt: z.string().nullish(),
  coverImageCredit: z.string().nullish(),
  status: z.nativeEnum(ArticleStatus),
  isFeatured: z.boolean(),
  featuredOrder: z.number().nullable().optional(),
  types: z.array(z.nativeEnum(ArticleType)),
  categoryIds: z.array(z.string()),
  tags: z.array(z.string()),
  composerIds: z.array(z.string()),
  workIds: z.array(z.string()),
  scoreIds: z.array(z.string()),
  instrumentIds: z.array(z.string()),
  epochIds: z.array(z.string()),
  backgroundMusic: z
    .object({
      url: z.string().optional(),
      title: z.string().optional(),
      volume: z.number().optional(),
      loop: z.boolean().optional(),
      autoplay: z.boolean().optional(),
    })
    .optional(),

  metaTitle: z.string().nullish(),
  metaDescription: z.string().nullish(),
  keywords: z.array(z.string()),
  scheduledFor: z.string().nullish(),
  readTime: z.number().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  initialData?: Partial<ArticleFormData> & {
    id?: string;
    // ✅ ADICIONAR campos planos do Prisma para conversão
    backgroundMusicUrl?: string | null;
    backgroundMusicTitle?: string | null;
    backgroundMusicVolume?: number | null;
    backgroundMusicLoop?: boolean | null;
    backgroundMusicAutoplay?: boolean | null;
  };
  onSubmit: (data: ArticleFormData) => Promise<void>;
  categories: any[];
  isSubmitting?: boolean;
}

export function ArticleForm({
  initialData,
  onSubmit,
  categories,
  isSubmitting = false,
}: ArticleFormProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<
    'content' | 'settings' | 'relations' | 'seo'
  >('content');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [backgroundMusicTab, setBackgroundMusicTab] = useState<
    'upload' | 'link'
  >('link');
  const [uploadingAudio, setUploadingAudio] = useState(false);
  // ✅ sessionId para uploads temporários
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).substring(7)}`
  );

  const convertedInitialData = useMemo(() => {
    if (!initialData) return {};

    const data = { ...initialData };

    // Se tiver campos planos, converter para objeto
    if (
      'backgroundMusicUrl' in data ||
      'backgroundMusicTitle' in data ||
      'backgroundMusicVolume' in data
    ) {
      data.backgroundMusic = {
        url: data.backgroundMusicUrl || '',
        title: data.backgroundMusicTitle || '',
        volume: data.backgroundMusicVolume ?? 0.3,
        loop: data.backgroundMusicLoop ?? true,
        autoplay: data.backgroundMusicAutoplay ?? true,
      };

      // Remover campos planos
      delete data.backgroundMusicUrl;
      delete data.backgroundMusicTitle;
      delete data.backgroundMusicVolume;
      delete data.backgroundMusicLoop;
      delete data.backgroundMusicAutoplay;
    }

    return data;
  }, [initialData]);

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    description: '',
    content: {},
    status: 'DRAFT',
    isFeatured: false,
    types: [],
    categoryIds: [],
    tags: [],
    composerIds: [],
    workIds: [],
    scoreIds: [],
    instrumentIds: [],
    epochIds: [],
    keywords: [],
    readTime: 0,
    backgroundMusic: {
      url: '', // ✅ SEMPRE string vazia (nunca undefined)
      title: '', // ✅ SEMPRE string vazia (nunca undefined)
      volume: 0.3,
      loop: true,
      autoplay: true,
    },
    ...convertedInitialData, // ✅ Usar dados convertidos
  });

  // 🆕 ESTADOS PARA BUSCA DE COMPOSITORES E OBRAS
  const [currentComposer, setCurrentComposer] = useState('');
  const [currentWork, setCurrentWork] = useState('');
  const [composerFilterForWorks, setComposerFilterForWorks] = useState(''); // ✅ NOVO: Filtro de compositor para obras
  const [composersData, setComposersData] = useState<any[]>([]);
  const [worksData, setWorksData] = useState<any[]>([]);

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  // 🆕 CARREGAR DADOS DOS COMPOSITORES SELECIONADOS
  useEffect(() => {
    const fetchComposers = async () => {
      if (formData.composerIds.length > 0) {
        try {
          const data = await Promise.all(
            formData.composerIds.map(async (id) => {
              const response = await fetch('/api/composers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, fullData: true }),
              });
              if (response.ok) {
                return await response.json();
              }
              return null;
            })
          );
          setComposersData(data.filter((c) => c !== null));
        } catch (error) {
          console.error('Erro ao buscar compositores:', error);
          setComposersData([]);
        }
      } else {
        setComposersData([]);
      }
    };

    fetchComposers();
  }, [formData.composerIds]);

  // 🆕 CARREGAR DADOS DAS OBRAS SELECIONADAS
  useEffect(() => {
    const fetchWorks = async () => {
      if (formData.workIds.length > 0) {
        try {
          const data = await Promise.all(
            formData.workIds.map(async (id) => {
              const response = await fetch(`/api/works/${id}`);
              if (response.ok) {
                return await response.json();
              }
              return null;
            })
          );
          setWorksData(data.filter((w) => w !== null));
        } catch (error) {
          console.error('Erro ao buscar obras:', error);
          setWorksData([]);
        }
      } else {
        setWorksData([]);
      }
    };

    fetchWorks();
  }, [formData.workIds]);

  // 🆕 ADICIONAR COMPOSITOR
  const handleAddComposer = async () => {
    if (!currentComposer) return;

    if (!formData.composerIds.includes(currentComposer)) {
      console.log('✅ Adicionando compositor:', currentComposer);
      setFormData((prev) => ({
        ...prev,
        composerIds: [...prev.composerIds, currentComposer],
      }));
      console.log('📊 Compositores após adicionar:', [
        ...formData.composerIds,
        currentComposer,
      ]);
    } else {
      console.log('⚠️ Compositor já está na lista:', currentComposer);
    }

    setCurrentComposer('');
  };

  // 🆕 REMOVER COMPOSITOR
  const handleRemoveComposer = (composerId: string) => {
    setFormData((prev) => ({
      ...prev,
      composerIds: prev.composerIds.filter((id) => id !== composerId),
    }));
  };

  // 🆕 ADICIONAR OBRA
  const handleAddWork = async () => {
    if (!currentWork) return;

    if (!formData.workIds.includes(currentWork)) {
      console.log('✅ Adicionando obra:', currentWork);
      setFormData((prev) => ({
        ...prev,
        workIds: [...prev.workIds, currentWork],
      }));
      console.log('📊 Obras após adicionar:', [
        ...formData.workIds,
        currentWork,
      ]);
    } else {
      console.log('⚠️ Obra já está na lista:', currentWork);
    }

    // ✅ RESETAR CAMPOS
    setCurrentWork('');
    setComposerFilterForWorks('');
  };

  // 🆕 FUNÇÃO PARA UPLOAD DE ÁUDIO DE FUNDO
  const handleBackgroundAudioUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido', 'Use MP3, WAV ou OGG.');
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande', 'O áudio deve ter no máximo 10MB.');
      return;
    }

    setUploadingAudio(true);
    const uploadToast = toast.loading(
      'Enviando áudio...',
      'Por favor, aguarde.'
    );

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'audio');

      if (initialData?.id) {
        formDataUpload.append('articleId', initialData.id);
      } else {
        formDataUpload.append('sessionId', sessionId);
      }

      const response = await fetch('/api/blog/media/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          backgroundMusic: {
            ...prev.backgroundMusic,
            url: data.url,
            title:
              prev.backgroundMusic?.title || file.name.replace(/\.[^/.]+$/, ''),
          },
        }));
        toast.dismiss(uploadToast);
        toast.upload(
          'Upload concluído!',
          'Áudio de fundo adicionado com sucesso.'
        );
      } else {
        toast.dismiss(uploadToast);
        toast.error('Erro ao fazer upload', data.error);
      }
    } catch (error) {
      toast.dismiss(uploadToast);
      toast.error(
        'Erro ao fazer upload',
        error instanceof Error ? error.message : 'Erro ao enviar áudio'
      );
    } finally {
      setUploadingAudio(false);
    }
  };

  // 🆕 REMOVER OBRA
  const handleRemoveWork = (workId: string) => {
    setFormData((prev) => ({
      ...prev,
      workIds: prev.workIds.filter((id) => id !== workId),
    }));
  };

  const calculateReadTime = () => {
    let totalMinutes = 0;
    const contentText = JSON.stringify(formData.content);
    const wordCount = contentText.split(/\s+/).length;
    const readingSpeed = 200;
    totalMinutes += Math.ceil(wordCount / readingSpeed);
    const imageCount = (contentText.match(/\"type\":\"image\"/g) || []).length;
    totalMinutes += Math.ceil((imageCount * 12) / 60);
    const videoCount = (contentText.match(/\"type\":\"youtube\"/g) || [])
      .length;
    totalMinutes += videoCount * 2;
    return Math.max(1, totalMinutes);
  };

  useEffect(() => {
    const readTime = calculateReadTime();
    setFormData((prev) => ({ ...prev, readTime }));
  }, [formData.content]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropImageSrc(null);
    setUploadingCover(true);
    const uploadToast = toast.loading(
      'Enviando imagem...',
      'Por favor, aguarde.'
    );

    try {
      const formDataUpload = new FormData();
      formDataUpload.append(
        'file',
        croppedBlob,
        originalFile?.name || 'cover.jpg'
      );
      formDataUpload.append('folder', 'thumbnail');

      if (initialData?.id) {
        formDataUpload.append('articleId', initialData.id);
      } else {
        formDataUpload.append('sessionId', sessionId);
      }

      const response = await fetch('/api/blog/media/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, coverImage: data.url }));
        toast.dismiss(uploadToast);
        toast.upload(
          'Upload concluído!',
          'Imagem de capa atualizada com sucesso.'
        );
      } else {
        toast.dismiss(uploadToast);
        toast.error('Erro ao fazer upload', data.error);
      }
    } catch (error) {
      toast.dismiss(uploadToast);
      toast.error(
        'Erro ao fazer upload',
        error instanceof Error ? error.message : 'Erro ao enviar imagem'
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCropCancel = () => {
    setCropImageSrc(null);
    setOriginalFile(null);
  };

  const handleRemoveCover = async () => {
    if (!formData.coverImage) return;

    try {
      const response = await fetch(
        `/api/blog/media/upload?url=${encodeURIComponent(formData.coverImage)}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, coverImage: '' }));
        toast.success(
          'Imagem removida',
          'A imagem de capa foi removida com sucesso.'
        );
      } else {
        toast.error('Erro ao remover imagem', data.error);
      }
    } catch (error) {
      toast.error(
        'Erro ao remover imagem',
        error instanceof Error
          ? error.message
          : 'Não foi possível remover a imagem'
      );
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const articleTypeLabels: Record<ArticleType, string> = {
    [ArticleType.COMPOSER_ANALYSIS]: 'Análise de Compositor',
    [ArticleType.WORK_ANALYSIS]: 'Análise de Obra',
    [ArticleType.INSTRUMENT_GUIDE]: 'Guia de Instrumentos',
    [ArticleType.MUSIC_HISTORY]: 'História da Música',
    [ArticleType.TUTORIAL]: 'Tutorial / Guia Prático',
    [ArticleType.TOP_LIST]: 'Lista / Top 10',
    [ArticleType.INTERVIEW]: 'Entrevista',
    [ArticleType.NEWS]: 'Notícia',
    [ArticleType.CURIOSITY]: 'Curiosidades',
    [ArticleType.PERFORMANCE_VIDEO]: 'Vídeo de Performance',
    [ArticleType.CONCERT_GUIDE]: 'Guia de Concerto',
    [ArticleType.GENERAL]: 'Artigo Geral',
  };

  const statusOptions = useMemo(
    () => [
      { value: 'DRAFT', label: 'Rascunho' },
      { value: 'REVIEW', label: 'Em Revisão' },
      { value: 'SCHEDULED', label: 'Agendado' },
      { value: 'PUBLISHED', label: 'Publicado' },
    ],
    []
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({ ...prev, title: newTitle }));

    const slug = newTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!initialData) {
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      articleSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });

        console.log(newErrors);
        const errorCount = Object.keys(newErrors).length;
        const firstError = Object.values(newErrors)[0];

        toast.error(
          'Erro de validação',
          errorCount === 1
            ? firstError
            : `${errorCount} campos com erro. Verifique o formulário.`
        );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log('📤 Enviando artigo com dados:');
    console.log('- Compositores:', formData.composerIds);
    console.log('- Obras:', formData.workIds);
    console.log('- Form completo:', formData);

    try {
      await onSubmit(formData);

      toast.success(
        initialData ? 'Artigo atualizado!' : 'Artigo criado!',
        'As alterações foram salvas com sucesso.'
      );
    } catch (error) {
      toast.error(
        'Erro ao salvar',
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
      );
    }
  };

  const handleTypesChange = (values: string[]) => {
    const types = values as ArticleType[];
    setFormData((prev) => ({ ...prev, types }));
  };

  const handleTagsChange = async (values: string[]) => {
    const newTags = values.filter((tag) => !formData.tags.includes(tag));

    if (newTags.length > 0) {
      for (const tagName of newTags) {
        try {
          await fetch('/api/blog/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: tagName }),
          });
        } catch (error) {
          console.error('Erro ao criar tag:', error);
        }
      }
    }

    setFormData((prev) => ({ ...prev, tags: values }));
  };

  const handleKeywordsChange = (values: string[]) => {
    setFormData((prev) => ({ ...prev, keywords: values }));
  };

  const goToNextTab = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (activeTab === 'content') setActiveTab('settings');
    else if (activeTab === 'settings') setActiveTab('relations');
    else if (activeTab === 'relations') setActiveTab('seo');
  };

  const goToPreviousTab = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (activeTab === 'seo') setActiveTab('relations');
    else if (activeTab === 'relations') setActiveTab('settings');
    else if (activeTab === 'settings') setActiveTab('content');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-theme-secondary">
        <nav className="flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'content'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-secondary'
            }`}
          >
            Conteúdo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-secondary'
            }`}
          >
            Configurações
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('relations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'relations'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-secondary'
            }`}
          >
            Vinculações
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'seo'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-secondary'
            }`}
          >
            SEO
          </button>
        </nav>
      </div>

      {/* TAB: CONTEÚDO */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              className="input-classical-2 w-full text-lg"
              placeholder="Digite o título do artigo..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Slug (URL) *
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-theme-tertiary text-sm">/artigo/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className="input-classical-2 flex-1"
                placeholder="slug-do-artigo"
              />
            </div>
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.slug}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Descrição (Preview)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="input-classical-2 w-full resize-none"
              placeholder="Uma breve descrição do artigo para aparecer nos cards e SEO..."
            />
          </div>

          {/* Imagem de Capa */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Imagem de Capa
            </label>

            {cropImageSrc && (
              <CoverCropper
                imageUrl={cropImageSrc}
                onCropComplete={handleCropComplete}
                onCancel={handleCropCancel}
              />
            )}

            {formData.coverImage ? (
              <div className="relative rounded-lg overflow-hidden">
                <Image
                  src={formData.coverImage}
                  alt="Cover"
                  width={800}
                  height={400}
                  className="w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-theme-medium"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-theme-secondary rounded-lg p-12 text-center hover:border-brand-primary transition-colors">
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                  disabled={uploadingCover}
                />
                <label
                  htmlFor="cover-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <FaUpload className="w-12 h-12 text-theme-tertiary mb-4" />
                  <span className="text-sm text-theme-secondary">
                    {uploadingCover
                      ? 'Enviando...'
                      : 'Clique para fazer upload da capa'}
                  </span>
                  <span className="text-xs text-theme-tertiary mt-1">
                    PNG, JPG, WebP até 10MB
                  </span>
                </label>
              </div>
            )}

            {formData.coverImage && (
              <div className="mt-4 space-y-2">
                <input
                  type="text"
                  value={formData.coverImageAlt || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      coverImageAlt: e.target.value,
                    }))
                  }
                  placeholder="Texto alternativo (ALT)"
                  className="input-classical-2 w-full"
                />
                <input
                  type="text"
                  value={formData.coverImageCredit || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      coverImageCredit: e.target.value,
                    }))
                  }
                  placeholder="Crédito do fotógrafo"
                  className="input-classical-2 w-full"
                />
              </div>
            )}
          </div>

          {/* Editor */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Conteúdo *
            </label>
            <BlogEditor
              content={formData.content}
              onChange={(content) =>
                setFormData((prev) => ({ ...prev, content }))
              }
              articleId={initialData?.id}
              sessionId={sessionId}
            />
          </div>

          {/* Tempo de Leitura */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme-primary">
              Tempo de Leitura
            </label>
            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <FaClock className="text-blue-600 w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Tempo estimado automaticamente:{' '}
                  <strong>{calculateReadTime()} min</strong>
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Calculado com base no conteúdo (palavras, imagens, vídeos)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={formData.readTime || 0}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      readTime: parseInt(e.target.value),
                    }))
                  }
                  className="input-classical-2 w-20 text-center"
                  placeholder="0"
                />
                <span className="text-sm text-theme-secondary">min</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CONFIGURAÇÕES */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Status e Publicação */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as ArticleStatus,
                }))
              }
            />

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Agendar Publicação
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledFor || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduledFor: e.target.value,
                  }))
                }
                className="input-classical-2 w-full"
              />
            </div>
          </div>

          {/* Tipos de Artigo */}
          <MultiSelectWithId
            label="Tipos de Artigo"
            options={Object.values(ArticleType).map((type) => ({
              id: type,
              label: articleTypeLabels[type],
            }))}
            selectedValues={formData.types}
            onChange={handleTypesChange}
            placeholder="Selecione os tipos..."
          />

          {/* Categorias */}
          <MultiSelectWithId
            label="Categorias"
            options={categories.map((cat) => ({
              id: cat.id,
              label: cat.name,
            }))}
            selectedValues={formData.categoryIds}
            onChange={(values) =>
              setFormData((prev) => ({ ...prev, categoryIds: values }))
            }
            placeholder="Selecione as categorias..."
          />

          {/* Tags */}
          <MultiSelect
            label="Tags (pressione Enter para adicionar e criar no banco)"
            options={formData.tags}
            selectedValues={formData.tags}
            onChange={handleTagsChange}
            placeholder="Digite e pressione Enter..."
            allowCreate
          />

          {/* Destaque */}
          <FeaturedArticlesManager
            currentArticleId={initialData?.id}
            currentArticleTitle={formData.title || 'Novo Artigo'}
            isFeatured={formData.isFeatured}
            featuredOrder={formData.featuredOrder || null}
            onFeaturedChange={(isFeatured, order) =>
              setFormData((prev) => ({
                ...prev,
                isFeatured,
                featuredOrder: order,
              }))
            }
          />

          {/* 🔄 MÚSICA DE FUNDO - ATUALIZADA COM UPLOAD */}
          <div className="classical-card-simple p-4">
            <h3 className="text-sm font-medium text-theme-primary mb-4 flex items-center">
              <FaMusic className="w-4 h-4 mr-2 text-brand-primary" />
              Música de Fundo
            </h3>

            {/* 🆕 ABAS: Upload ou Link */}
            <div className="flex mb-4 border-b border-theme-secondary">
              <button
                type="button"
                onClick={() => setBackgroundMusicTab('upload')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  backgroundMusicTab === 'upload'
                    ? 'border-b-2 border-brand-primary text-brand-primary'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                📤 Fazer Upload
              </button>
              <button
                type="button"
                onClick={() => setBackgroundMusicTab('link')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  backgroundMusicTab === 'link'
                    ? 'border-b-2 border-brand-primary text-brand-primary'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                🔗 Link Externo
              </button>
            </div>

            <div className="space-y-4">
              {/* 🆕 ABA: UPLOAD */}
              {backgroundMusicTab === 'upload' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Selecionar Arquivo de Áudio
                    </label>
                    <div className="border-2 border-dashed border-theme-secondary rounded-lg p-6 text-center hover:border-brand-primary transition-colors">
                      <input
                        type="file"
                        id="background-audio-upload"
                        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                        onChange={handleBackgroundAudioUpload}
                        className="hidden"
                        disabled={uploadingAudio}
                      />

                      {formData.backgroundMusic?.url && !uploadingAudio ? (
                        <div className="space-y-3">
                          <FaMusic className="w-12 h-12 text-green-600 mx-auto" />
                          <p className="text-sm text-green-700 font-medium">
                            ✓ Áudio carregado com sucesso
                          </p>
                          {formData.backgroundMusic?.title && (
                            <p className="text-xs text-theme-tertiary">
                              {formData.backgroundMusic.title}
                            </p>
                          )}
                          <label
                            htmlFor="background-audio-upload"
                            className="inline-block cursor-pointer text-sm text-brand-primary hover:text-brand-secondary underline"
                          >
                            Alterar áudio
                          </label>
                        </div>
                      ) : (
                        <label
                          htmlFor="background-audio-upload"
                          className="cursor-pointer"
                        >
                          <FiUpload className="w-12 h-12 text-theme-tertiary mx-auto mb-2" />
                          <span className="text-sm text-theme-secondary">
                            {uploadingAudio
                              ? 'Enviando...'
                              : 'Clique para fazer upload'}
                          </span>
                          <p className="text-xs text-theme-tertiary mt-2">
                            MP3, WAV ou OGG (máx 10MB)
                          </p>
                        </label>
                      )}
                    </div>
                  </div>

                  {formData.backgroundMusic?.url && (
                    <input
                      type="text"
                      value={formData.backgroundMusic?.title || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          backgroundMusic: {
                            ...prev.backgroundMusic,
                            title: e.target.value,
                          },
                        }))
                      }
                      placeholder="Título da música"
                      className="input-classical-2 w-full"
                    />
                  )}
                </>
              )}

              {/* 🆕 ABA: LINK EXTERNO */}
              {backgroundMusicTab === 'link' && (
                <>
                  <input
                    type="text"
                    value={formData.backgroundMusic?.url || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        backgroundMusic: {
                          ...prev.backgroundMusic,
                          url: e.target.value,
                        },
                      }))
                    }
                    placeholder="URL do YouTube ou áudio externo"
                    className="input-classical-2 w-full"
                  />

                  <input
                    type="text"
                    value={formData.backgroundMusic?.title || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        backgroundMusic: {
                          ...prev.backgroundMusic,
                          title: e.target.value,
                        },
                      }))
                    }
                    placeholder="Título da música"
                    className="input-classical-2 w-full"
                  />
                </>
              )}

              {/* ✅ CONFIGURAÇÕES (mesmas para ambas as abas) */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-xs text-theme-tertiary mb-1">
                    Volume (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    value={formData.backgroundMusic?.volume ?? 0.3}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        backgroundMusic: {
                          ...prev.backgroundMusic,
                          volume: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    min={0}
                    max={1}
                    step={0.1}
                    className="input-classical-2 w-full"
                  />
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.backgroundMusic?.loop ?? true}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        backgroundMusic: {
                          ...prev.backgroundMusic,
                          loop: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 text-brand-primary border-theme-secondary rounded"
                  />
                  <span className="text-sm text-theme-secondary">Loop</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.backgroundMusic?.autoplay ?? true}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        backgroundMusic: {
                          ...prev.backgroundMusic,
                          autoplay: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 text-brand-primary border-theme-secondary rounded"
                  />
                  <span className="text-sm text-theme-secondary">Autoplay</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 TAB: VINCULAÇÕES */}
      {activeTab === 'relations' && (
        <div className="space-y-6">
          {/* ✅ INFO BOX - Mostra quantos estão vinculados */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Vinculações atuais
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Estes itens serão salvos junto com o artigo
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {formData.composerIds.length}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Compositor{formData.composerIds.length !== 1 ? 'es' : ''}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {formData.workIds.length}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Obra{formData.workIds.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Compositores */}
          <div className="classical-card-simple p-4">
            <h3 className="text-sm font-medium text-theme-primary mb-4">
              Compositores Vinculados
            </h3>

            {/* Lista de Compositores */}
            {composersData.length > 0 && (
              <div className="space-y-2 mb-4">
                {composersData.map((composer) => (
                  <div
                    key={composer.id}
                    className="flex items-center justify-between p-3 bg-theme-elevated rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {composer.portraitUrl && (
                        <Image
                          src={composer.portraitUrl}
                          alt={composer.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-theme-primary">
                          {composer.name}
                        </p>
                        <p className="text-xs text-theme-tertiary">
                          {composer.epochName} • {composer.nationality}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveComposer(composer.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Adicionar Compositor */}
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Buscar Compositor
                </label>
                <ComposerSearchInputSimple
                  selectedComposer={currentComposer}
                  onComposerSelect={setCurrentComposer}
                  fullData={true}
                />
              </div>
              <button
                type="button"
                onClick={handleAddComposer}
                disabled={!currentComposer}
                className="btn-classical-primary flex items-center space-x-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Obras */}
          <div className="classical-card-simple p-4">
            <h3 className="text-sm font-medium text-theme-primary mb-4">
              Obras Vinculadas
            </h3>

            {/* Lista de Obras */}
            {worksData.length > 0 && (
              <div className="space-y-2 mb-4">
                {worksData.map((work) => (
                  <div
                    key={work.id}
                    className="flex items-center justify-between p-3 bg-theme-elevated rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-theme-primary">
                        {work.title}
                      </p>
                      <p className="text-xs text-theme-tertiary">
                        {work.composer?.name} • {work.instrument?.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveWork(work.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Adicionar Obra */}
            <div className="space-y-3">
              {/* ✅ FILTRO DE COMPOSITOR (OPCIONAL) */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  1. Filtrar por Compositor (opcional)
                </label>
                <ComposerSearchInputSimple
                  selectedComposer={composerFilterForWorks}
                  onComposerSelect={setComposerFilterForWorks}
                  fullData={true}
                />
              </div>

              {/* ✅ BUSCA DE OBRA (COM FILTRO) */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    2. Buscar Obra
                  </label>
                  <SimpleWorkSearchInput
                    selectedWork={currentWork}
                    onWorkSelect={setCurrentWork}
                    filterByComposer={composerFilterForWorks}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddWork}
                  disabled={!currentWork}
                  className="btn-classical-primary flex items-center space-x-2"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SEO */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Meta Título
            </label>
            <input
              type="text"
              value={formData.metaTitle || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))
              }
              placeholder="Título customizado para SEO (deixe vazio para usar o título do artigo)"
              className="input-classical-2 w-full"
            />
            <p className="mt-1 text-xs text-theme-tertiary">
              Máximo 60 caracteres recomendado
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Meta Descrição
            </label>
            <textarea
              value={formData.metaDescription || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  metaDescription: e.target.value,
                }))
              }
              rows={3}
              placeholder="Descrição customizada para SEO (deixe vazio para usar a descrição do artigo)"
              className="input-classical-2 w-full resize-none"
            />
            <p className="mt-1 text-xs text-theme-tertiary">
              Máximo 160 caracteres recomendado
            </p>
          </div>

          <MultiSelect
            label="Palavras-chave (Keywords - pressione Enter para adicionar)"
            options={formData.keywords}
            selectedValues={formData.keywords}
            onChange={handleKeywordsChange}
            placeholder="Digite e pressione Enter..."
            allowCreate
          />
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center justify-between pt-6 border-t border-theme-secondary">
        <div>
          {activeTab !== 'content' && (
            <button
              type="button"
              onClick={goToPreviousTab}
              className="btn-classical-secondary flex items-center space-x-2"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="btn-classical-secondary flex items-center space-x-2"
          >
            <FaEye className="w-4 h-4" />
            <span>Preview</span>
          </button>

          {activeTab !== 'seo' ? (
            <button
              type="button"
              onClick={goToNextTab}
              className="btn-classical-primary flex items-center space-x-2"
            >
              <span>Próximo</span>
              <FaArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-classical-primary flex items-center space-x-2"
            >
              <FaSave className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Salvando...'
                  : initialData
                    ? 'Atualizar'
                    : 'Salvar e Visualizar'}
              </span>
            </button>
          )}
        </div>
      </div>

      {showPreview && (
        <ArticlePreviewModal
          article={formData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </form>
  );
}
