// app/hooks/admin/useOrphanFileManagement.ts
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  OrphanScanResult,
  OrphanFile,
  OrphanFileCategory,
} from '@/app/libs/orphanFiles/orphanFileScanner';

interface ScanOptions {
  category?: OrphanFileCategory;
  includeTemp?: boolean;
  minSize?: number;
  maxSize?: number;
}

interface UseOrphanFileManagementReturn {
  // Estados
  scanResult: OrphanScanResult | null;
  loading: boolean;
  error: string | null;
  isScanning: boolean;
  isRemoving: boolean;
  selectedFiles: string[];

  // Ações
  scanFiles: (options?: ScanOptions) => Promise<void>;
  removeSelectedFiles: () => Promise<void>;
  removeFiles: (filePaths: string[]) => Promise<void>;
  clearScan: () => void;

  // Seleção
  toggleFileSelection: (filePath: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  selectByCategory: (category: OrphanFileCategory) => void;

  // Utilitários
  getSelectedSize: () => number;
  getFormattedSelectedSize: () => string;
  getCategoryStats: () => Record<
    OrphanFileCategory,
    { count: number; size: number }
  >;
  formatFileDate: (date: Date | string) => string;
  getFileTypeIcon: (file: OrphanFile) => string;
  getCategoryDisplayName: (category: OrphanFileCategory) => string;
}

const CATEGORY_DISPLAY_NAMES: Record<OrphanFileCategory, string> = {
  profiles: 'Fotos de Perfil',
  composers: 'Fotos de Compositores',
  scores: 'Partituras',
  advertisements: 'Publicidades',
  works: 'Mídia de Obras',
  general: 'Gerais',
  unknown: 'Desconhecidos',
};

export const useOrphanFileManagement = (): UseOrphanFileManagementReturn => {
  const [scanResult, setScanResult] = useState<OrphanScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const scanFiles = useCallback(
    async (options: ScanOptions = {}) => {
      if (isScanning) return;

      setIsScanning(true);
      setLoading(true);
      setError(null);

      const toastId = toast.loading(
        options.category
          ? `Escaneando arquivos de ${getCategoryDisplayName(
              options.category
            )}...`
          : 'Escaneando todos os arquivos...'
      );

      try {
        const params = new URLSearchParams({
          action: 'scan',
          ...(options.category && { category: options.category }),
          ...(options.includeTemp && { includeTemp: 'true' }),
          ...(options.minSize && { minSize: options.minSize.toString() }),
          ...(options.maxSize && { maxSize: options.maxSize.toString() }),
        });

        const response = await fetch(`/api/admin/orphan-files?${params}`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          setScanResult(data.data);
          setSelectedFiles([]); // Limpar seleção anterior

          const orphanCount = data.data.orphanFiles.length;
          const message =
            orphanCount > 0
              ? `${orphanCount} arquivos órfãos encontrados (${data.data.formattedTotalSize})`
              : 'Nenhum arquivo órfão encontrado!';

          toast.success(message, { id: toastId });
        } else {
          throw new Error(data.error || 'Erro ao escanear arquivos');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro no scan: ${errorMessage}`, { id: toastId });
        console.error('Erro ao escanear arquivos:', err);
      } finally {
        setIsScanning(false);
        setLoading(false);
      }
    },
    [isScanning]
  );

  const removeFiles = useCallback(
    async (filePaths: string[]) => {
      if (isRemoving || filePaths.length === 0) return;

      setIsRemoving(true);
      setError(null);

      const toastId = toast.loading(
        `Removendo ${filePaths.length} arquivos...`
      );

      try {
        const response = await fetch('/api/admin/orphan-files', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePaths }),
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          const { removed, failed, totalSizeFreed } = data.data;

          // Atualizar scan result removendo arquivos deletados
          if (scanResult) {
            const updatedOrphanFiles = scanResult.orphanFiles.filter(
              (file) => !removed.includes(file.relativePath)
            );

            setScanResult({
              ...scanResult,
              orphanFiles: updatedOrphanFiles,
              totalSize: scanResult.totalSize - totalSizeFreed,
            });
          }

          // Limpar seleção dos arquivos removidos
          setSelectedFiles((prev) =>
            prev.filter((path) => !removed.includes(path))
          );

          const message =
            failed.length > 0
              ? `${removed.length} arquivos removidos, ${failed.length} falharam`
              : `${removed.length} arquivos removidos com sucesso`;

          toast.success(message, { id: toastId });

          if (failed.length > 0) {
            console.warn('Arquivos que falharam ao ser removidos:', failed);
          }
        } else {
          throw new Error(data.error || 'Erro ao remover arquivos');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro ao remover arquivos: ${errorMessage}`, {
          id: toastId,
        });
        console.error('Erro ao remover arquivos:', err);
      } finally {
        setIsRemoving(false);
      }
    },
    [isRemoving, scanResult]
  );

  const removeSelectedFiles = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja remover ${selectedFiles.length} arquivo(s) selecionado(s)? Esta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    await removeFiles(selectedFiles);
  }, [selectedFiles, removeFiles]);

  const clearScan = useCallback(() => {
    setScanResult(null);
    setSelectedFiles([]);
    setError(null);
  }, []);

  const toggleFileSelection = useCallback((filePath: string) => {
    setSelectedFiles((prev) =>
      prev.includes(filePath)
        ? prev.filter((path) => path !== filePath)
        : [...prev, filePath]
    );
  }, []);

  const selectAllFiles = useCallback(() => {
    if (!scanResult) return;
    setSelectedFiles(scanResult.orphanFiles.map((file) => file.relativePath));
  }, [scanResult]);

  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const selectByCategory = useCallback(
    (category: OrphanFileCategory) => {
      if (!scanResult) return;

      const categoryFiles = scanResult.orphanFiles
        .filter((file) => file.category === category)
        .map((file) => file.relativePath);

      setSelectedFiles(categoryFiles);
    },
    [scanResult]
  );

  const getSelectedSize = useCallback(() => {
    if (!scanResult) return 0;

    return scanResult.orphanFiles
      .filter((file) => selectedFiles.includes(file.relativePath))
      .reduce((total, file) => total + file.size, 0);
  }, [scanResult, selectedFiles]);

  const getFormattedSelectedSize = useCallback(() => {
    return formatBytes(getSelectedSize());
  }, [getSelectedSize]);

  const getCategoryStats = useCallback(() => {
    if (!scanResult) {
      return {} as Record<OrphanFileCategory, { count: number; size: number }>;
    }

    const stats: Record<OrphanFileCategory, { count: number; size: number }> = {
      profiles: { count: 0, size: 0 },
      composers: { count: 0, size: 0 },
      scores: { count: 0, size: 0 },
      advertisements: { count: 0, size: 0 },
      works: { count: 0, size: 0 },
      general: { count: 0, size: 0 },
      unknown: { count: 0, size: 0 },
    };

    scanResult.orphanFiles.forEach((file) => {
      stats[file.category].count++;
      stats[file.category].size += file.size;
    });

    return stats;
  }, [scanResult]);

  const formatFileDate = useCallback((date: Date | string): string => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getFileTypeIcon = useCallback((file: OrphanFile): string => {
    if (file.isImage) return 'FiImage';
    if (file.isVideo) return 'FiVideo';
    if (file.isAudio) return 'FiMusic';
    if (file.isPDF) return 'FiFileText';
    return 'FiFile';
  }, []);

  const getCategoryDisplayName = useCallback(
    (category: OrphanFileCategory): string => {
      return CATEGORY_DISPLAY_NAMES[category] || category;
    },
    []
  );

  return {
    scanResult,
    loading,
    error,
    isScanning,
    isRemoving,
    selectedFiles,

    scanFiles,
    removeSelectedFiles,
    removeFiles,
    clearScan,

    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    selectByCategory,

    getSelectedSize,
    getFormattedSelectedSize,
    getCategoryStats,
    formatFileDate,
    getFileTypeIcon,
    getCategoryDisplayName,
  };
};

// Utilitário para formatar bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
