// app/hooks/admin/useBlogMediaGallery.ts
import { useState, useCallback } from 'react';
import { useToast } from '@/app/hooks/useToast';

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
}

export interface MediaGalleryStats {
  totalFiles: number;
  totalSize: number;
  formattedTotalSize: string;
  byCategory: Record<MediaCategory, { count: number; size: number }>;
  byType: Record<string, { count: number; size: number }>;
  temporaryFiles: number;
  temporarySize: number;
}

export interface MediaGalleryResult {
  files: BlogMediaFile[];
  stats: MediaGalleryStats;
  scanDuration: string;
}

export function useBlogMediaGallery() {
  const toast = useToast();
  const [galleryResult, setGalleryResult] = useState<MediaGalleryResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Carregar galeria
  const loadGallery = useCallback(
    async (options?: {
      category?: MediaCategory;
      source?: MediaSource;
      includeTemp?: boolean;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          ...(options?.category && { category: options.category }),
          ...(options?.source && { source: options.source }),
          includeTemp: options?.includeTemp !== false ? 'true' : 'false',
        });

        const response = await fetch(`/api/admin/blog/media/gallery?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar galeria');
        }

        setGalleryResult(data.data);
        return data.data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao carregar galeria';
        setError(message);
        toast.error('Erro', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Deletar arquivos selecionados
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
      const response = await fetch('/api/admin/blog/media/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrls: selectedFiles }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar arquivos');
      }

      toast.success(
        'Arquivos deletados!',
        `${data.data.removed.length} arquivo(s) removido(s) com sucesso.`
      );

      // Limpar seleção
      setSelectedFiles([]);

      // Recarregar galeria
      await loadGallery();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao deletar arquivos';
      toast.error('Erro', message);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedFiles, toast, loadGallery]);

  // Toggle seleção de arquivo
  const toggleFileSelection = useCallback((url: string) => {
    setSelectedFiles((prev) =>
      prev.includes(url) ? prev.filter((f) => f !== url) : [...prev, url]
    );
  }, []);

  // Selecionar todos
  const selectAll = useCallback(() => {
    if (galleryResult) {
      setSelectedFiles(galleryResult.files.map((f) => f.url));
    }
  }, [galleryResult]);

  // Limpar seleção
  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  // Get stats por categoria
  const getCategoryStats = useCallback(() => {
    if (!galleryResult) return {};
    return galleryResult.stats.byCategory;
  }, [galleryResult]);

  // Formatar tamanho selecionado
  const getFormattedSelectedSize = useCallback(() => {
    if (!galleryResult || selectedFiles.length === 0) return '0 B';

    const totalSize = galleryResult.files
      .filter((f) => selectedFiles.includes(f.url))
      .reduce((sum, f) => sum + f.size, 0);

    if (totalSize < 1024) return `${totalSize} B`;
    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(2)} KB`;
    return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
  }, [galleryResult, selectedFiles]);

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

  return {
    galleryResult,
    isLoading,
    isDeleting,
    selectedFiles,
    error,
    loadGallery,
    deleteSelectedFiles,
    toggleFileSelection,
    selectAll,
    clearSelection,
    getCategoryStats,
    getFormattedSelectedSize,
    getCategoryDisplayName,
    formatDate,
  };
}
