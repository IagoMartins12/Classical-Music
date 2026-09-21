// app/hooks/admin/useBlogMediaGallery.ts
import { useCallback, useState } from 'react';
import {
  adminKeys,
  errorMessage,
  useAdminFetch,
  useAdminQuery,
  useInvalidateAdmin,
} from './query';
import { useToast } from '@/app/hooks/useToast';
import { apiFetch } from '@/app/libs/api/client';

export type MediaCategory =
  | 'all'
  | 'cover'
  | 'content'
  | 'audio'
  | 'temp'
  | 'gallery';

export type MediaSource = 'local' | 'cloudinary';

export interface BlogMediaFile {
  id: string;
  articleId?: string;
  articleTitle?: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  url: string;
  source: MediaSource;
  category: MediaCategory;
  title?: string;
  alt?: string;
  size: number;
  formattedSize: string;
  width?: number;
  height?: number;
  createdAt: string;
  folder: string;
  isTemporary: boolean;
  inGallery: boolean;
  // 🆕 CAMPOS DE USO
  isUsed: boolean;
  usedIn: Array<{
    articleId: string;
    articleTitle: string;
    usageType: 'cover' | 'content' | 'background-music' | 'gallery';
    slug: string;
  }>;
  usageCount: number;
}

export interface MediaGalleryStats {
  totalFiles: number;
  totalSize: number;
  formattedTotalSize: string;
  byCategory: Record<MediaCategory, { count: number; size: number }>;
  byType: Record<string, { count: number; size: number }>;
  temporaryFiles: number;
  temporarySize: number;
  // 🆕 STATS DE USO
  usedFiles: number;
  unusedFiles: number;
  multiUseFiles: number;
}
// ✅ Tipo correto para os dados por categoria
type CategoryStats = Record<MediaCategory, { count: number; size: number }>;
export interface MediaGalleryResult {
  files: BlogMediaFile[];
  stats: MediaGalleryStats;
  scanDuration: string;
}

const GALLERY_CATEGORIES = [
  'all',
  'cover',
  'content',
  'audio',
  'temp',
  'gallery',
  'category',
  'legacy',
];

interface ApiGalleryFile {
  id: string;
  url: string;
  source: 'cloud' | 'legacy-disk';
  type: BlogMediaFile['type'];
  category: string;
  size: number;
  formattedSize: string;
  width: number | null;
  height: number | null;
  createdAt: string | null;
  isTemporary: boolean;
  deletable: boolean;
  isUsed: boolean;
  usedIn: BlogMediaFile['usedIn'];
  usageCount: number;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

function toMediaFile(file: ApiGalleryFile): BlogMediaFile {
  return {
    id: file.id,
    articleId: file.usedIn[0]?.articleId,
    articleTitle: file.usedIn[0]?.articleTitle,
    type: file.type,
    url: file.url,
    source: file.source === 'cloud' ? 'cloudinary' : 'local',
    category: file.category as MediaCategory,
    size: file.size,
    formattedSize: file.formattedSize,
    width: file.width ?? undefined,
    height: file.height ?? undefined,
    createdAt: file.createdAt ?? '',
    folder: '',
    isTemporary: file.isTemporary,
    inGallery: file.category === 'gallery',
    isUsed: file.isUsed,
    usedIn: file.usedIn,
    usageCount: file.usageCount,
  };
}

/** As contas da tela saem da lista; a API devolve só totais simples. */
function galleryStats(files: BlogMediaFile[]): MediaGalleryStats {
  const byCategory = Object.fromEntries(
    ['all', 'cover', 'content', 'audio', 'temp', 'gallery'].map((key) => [
      key,
      { count: 0, size: 0 },
    ])
  ) as MediaGalleryStats['byCategory'];
  const byType: MediaGalleryStats['byType'] = {};

  for (const file of files) {
    const category = (byCategory[file.category] ??= { count: 0, size: 0 });
    category.count += 1;
    category.size += file.size;
    byCategory.all.count += 1;
    byCategory.all.size += file.size;
    const type = (byType[file.type] ??= { count: 0, size: 0 });
    type.count += 1;
    type.size += file.size;
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const temporary = files.filter((file) => file.isTemporary);

  return {
    totalFiles: files.length,
    totalSize,
    formattedTotalSize: formatSize(totalSize),
    byCategory,
    byType,
    temporaryFiles: temporary.length,
    temporarySize: temporary.reduce((sum, file) => sum + file.size, 0),
    usedFiles: files.filter((file) => file.isUsed).length,
    unusedFiles: files.filter((file) => !file.isUsed).length,
    multiUseFiles: files.filter((file) => file.usageCount > 1).length,
  };
}

export interface GalleryOptions {
  category?: MediaCategory;
  source?: MediaSource;
  includeTemp?: boolean;
}

const galleryKey = (options: GalleryOptions) =>
  adminKeys.list('blog-media', options);

/** A galeria da API (`GET /blog/admin/media`); origem e temporários se filtram aqui. */
async function fetchGallery(
  options: GalleryOptions
): Promise<MediaGalleryResult> {
  const startedAt = Date.now();
  const data = await apiFetch<{ data: { files: ApiGalleryFile[] } }>(
    '/blog/admin/media',
    {
      query: {
        category:
          options.category && GALLERY_CATEGORIES.includes(options.category)
            ? options.category
            : undefined,
      },
      cache: 'no-store',
    }
  );

  const files = data.data.files
    .map(toMediaFile)
    .filter(
      (file) =>
        (!options.source || file.source === options.source) &&
        (options.includeTemp !== false || !file.isTemporary)
    );

  return {
    files,
    stats: galleryStats(files),
    scanDuration: `${Date.now() - startedAt}ms`,
  };
}

/**
 * Galeria de mídia do blog no painel. O resultado é estado de servidor
 * (TanStack Query, chave com os filtros); `loadGallery` continua devolvendo o
 * que buscou, porque a tela usa o retorno — a busca passa pelo cache.
 */
export function useBlogMediaGallery() {
  const toast = useToast();
  const [options, setOptions] = useState<GalleryOptions>({});
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const fetchAdmin = useAdminFetch();
  const invalidate = useInvalidateAdmin();

  const gallery = useAdminQuery(galleryKey(options), () =>
    fetchGallery(options)
  );

  const loadGallery = useCallback(
    async (next: GalleryOptions = {}) => {
      setOptions(next);
      setActionError(null);

      try {
        return await fetchAdmin(galleryKey(next), () => fetchGallery(next));
      } catch (error) {
        const message = errorMessage(error);
        setActionError(message);
        toast.error('Erro', message);
        return null;
      }
    },
    [fetchAdmin, toast]
  );

  // Apagar os selecionados. A API só apaga arquivo registrado e fora de uso.
  const deleteSelectedFiles = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error('Erro', 'Nenhum arquivo selecionado');
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja deletar ${selectedFiles.length} arquivo(s)?\n\n` +
        'Esta ação não pode ser desfeita!'
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const data = await apiFetch<any>('/blog/admin/media', {
        method: 'DELETE',
        body: { fileUrls: selectedFiles },
      });
      const payload = data?.data ?? data;
      const removed = Array.isArray(payload?.removed)
        ? payload.removed.length
        : Number(payload?.removed ?? 0);

      toast.success(
        'Arquivos deletados!',
        `${removed} arquivo(s) removido(s) com sucesso.`
      );

      setSelectedFiles([]);
      await invalidate('blog-media');
    } catch (error) {
      const message = errorMessage(error);
      setActionError(message);
      toast.error('Erro', message);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedFiles, toast, invalidate]);

  // Toggle seleção de arquivo
  const toggleFileSelection = useCallback((url: string) => {
    setSelectedFiles((previous) =>
      previous.includes(url)
        ? previous.filter((file) => file !== url)
        : [...previous, url]
    );
  }, []);

  // Selecionar todos
  const selectAll = useCallback(() => {
    if (gallery.data) {
      setSelectedFiles(gallery.data.files.map((file) => file.url));
    }
  }, [gallery.data]);

  // Limpar seleção
  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const getCategoryStats = useCallback(
    (): CategoryStats =>
      gallery.data?.stats.byCategory || {
        all: { count: 0, size: 0 },
        cover: { count: 0, size: 0 },
        content: { count: 0, size: 0 },
        audio: { count: 0, size: 0 },
        temp: { count: 0, size: 0 },
        gallery: { count: 0, size: 0 },
      },
    [gallery.data]
  );

  const getFormattedSelectedSize = useCallback(() => {
    if (!gallery.data || selectedFiles.length === 0) return '0 B';

    const totalSize = gallery.data.files
      .filter((file) => selectedFiles.includes(file.url))
      .reduce((sum, file) => sum + file.size, 0);

    if (totalSize < 1024) return `${totalSize} B`;
    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(2)} KB`;
    return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
  }, [gallery.data, selectedFiles]);

  // Get display name da categoria
  const getCategoryDisplayName = useCallback(
    (category: MediaCategory): string => {
      const names: Record<MediaCategory, string> = {
        all: 'Todos',
        cover: 'Capas',
        content: 'Conteúdo',
        audio: 'Áudios',
        temp: 'Temporários',
        gallery: 'Galeria',
      };
      return names[category] || category;
    },
    []
  );

  // Format date
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days}d atrás`;
    if (days < 30) return `${Math.floor(days / 7)}sem atrás`;
    if (days < 365) return `${Math.floor(days / 30)}m atrás`;
    return `${Math.floor(days / 365)}a atrás`;
  }, []);

  // Get display name do tipo de uso
  const getUsageTypeLabel = useCallback((type: string): string => {
    const labels: Record<string, string> = {
      cover: 'Capa',
      content: 'Conteúdo',
      'background-music': 'Música de Fundo',
      gallery: 'Galeria',
    };
    return labels[type] || type;
  }, []);

  return {
    galleryResult: gallery.data ?? null,
    isLoading: gallery.loading,
    isDeleting,
    selectedFiles,
    error: gallery.error ?? actionError,
    loadGallery,
    deleteSelectedFiles,
    toggleFileSelection,
    selectAll,
    clearSelection,
    getCategoryStats,
    getFormattedSelectedSize,
    getCategoryDisplayName,
    formatDate,
    getUsageTypeLabel, // 🆕 NOVA FUNÇÃO
  };
}
