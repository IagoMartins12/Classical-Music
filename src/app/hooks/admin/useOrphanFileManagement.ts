// app/hooks/admin/useOrphanFileManagement.ts - VERSÃO HÍBRIDA
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  OrphanScanResult,
  OrphanFile,
  OrphanFileCategory,
} from '@/app/libs/orphanFiles/orphanFileScanner';
import {
  CloudinaryOrphanFile,
  CloudinaryFileCategory,
} from '@/app/libs/orphanFiles/cloudinaryOrphanScanner';

interface ScanOptions {
  category?: OrphanFileCategory;
  includeTemp?: boolean;
  minSize?: number;
  maxSize?: number;
  includeCloudinary?: boolean;
  scanType?: 'local' | 'cloudinary' | 'hybrid';
}

// 🆕 INTERFACE HÍBRIDA PARA SELEÇÃO
interface HybridSelection {
  localFiles: string[];
  cloudinaryPublicIds: string[];
}

interface UseOrphanFileManagementReturn {
  // Estados
  scanResult: OrphanScanResult | null;
  loading: boolean;
  error: string | null;
  isScanning: boolean;
  isRemoving: boolean;
  selectedFiles: string[];
  selectedCloudinaryFiles: string[]; // 🆕 SELEÇÃO DO CLOUDINARY

  // Ações
  scanFiles: (options?: ScanOptions) => Promise<void>;
  removeSelectedFiles: () => Promise<void>;
  removeFiles: (
    filePaths?: string[],
    cloudinaryPublicIds?: string[]
  ) => Promise<void>;
  clearScan: () => void;

  // Seleção local (original)
  toggleFileSelection: (filePath: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  selectByCategory: (category: OrphanFileCategory) => void;

  // 🆕 SELEÇÃO DO CLOUDINARY
  toggleCloudinarySelection: (publicId: string) => void;
  selectAllCloudinaryFiles: () => void;
  clearCloudinarySelection: () => void;
  selectCloudinaryByCategory: (category: CloudinaryFileCategory) => void;

  // 🆕 SELEÇÃO HÍBRIDA
  selectAllHybrid: () => void;
  clearAllSelections: () => void;
  getHybridSelection: () => HybridSelection;

  // Utilitários
  getSelectedSize: () => number;
  getSelectedCloudinarySize: () => number; // 🆕
  getTotalSelectedSize: () => number; // 🆕 TOTAL HÍBRIDO
  getFormattedSelectedSize: () => string;
  getCategoryStats: () => Record<
    OrphanFileCategory,
    { count: number; size: number }
  >;
  getCloudinaryCategoryStats: () => Record<
    CloudinaryFileCategory,
    { count: number; size: number; orphans: number }
  >; // 🆕
  formatFileDate: (date: Date | string) => string;
  getFileTypeIcon: (file: OrphanFile | CloudinaryOrphanFile) => string;
  getCategoryDisplayName: (
    category: OrphanFileCategory | CloudinaryFileCategory
  ) => string;

  // 🆕 UTILITÁRIOS DO CLOUDINARY
  formatCloudinaryAge: (dateString: string) => string;
  getCloudinaryFileIcon: (file: CloudinaryOrphanFile) => string;
}

const CATEGORY_DISPLAY_NAMES: Record<OrphanFileCategory, string> = {
  profiles: 'Fotos de Perfil',
  composers: 'Fotos de Compositores',
  scores: 'Partituras',
  advertisements: 'Publicidades',
  works: 'Mídia de Obras',
  general: 'Gerais',
  unknown: 'Desconhecidos',
  cloudinary: 'Cloudinary',
};

// 🆕 NOMES DAS CATEGORIAS DO CLOUDINARY
const CLOUDINARY_CATEGORY_DISPLAY_NAMES: Record<
  CloudinaryFileCategory,
  string
> = {
  assignments: 'Vídeos de Tarefas',
  learned: 'Vídeos de Performance',
  scores: 'Partituras',
  'works-audio': 'Áudios de Obras',
  'works-video': 'Vídeos Educativos',
  advertisements: 'Publicidades',
  profiles: 'Fotos de Perfil',
  composers: 'Fotos de Compositores',
  unknown: 'Desconhecidos',
};

export const useOrphanFileManagement = (): UseOrphanFileManagementReturn => {
  const [scanResult, setScanResult] = useState<OrphanScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedCloudinaryFiles, setSelectedCloudinaryFiles] = useState<
    string[]
  >([]); // 🆕

  const scanFiles = useCallback(
    async (options: ScanOptions = {}) => {
      if (isScanning) return;

      setIsScanning(true);
      setLoading(true);
      setError(null);

      const scanType = options.scanType || 'hybrid';
      const categoryText = options.category
        ? getCategoryDisplayName(options.category)
        : 'todos os arquivos';

      const toastId = toast.loading(
        `Escaneando ${
          scanType === 'cloudinary'
            ? 'Cloudinary'
            : scanType === 'local'
            ? 'arquivos locais'
            : 'arquivos híbridos'
        }: ${categoryText}...`
      );

      try {
        const params = new URLSearchParams({
          action: 'scan',
          scanType,
          ...(options.category && { category: options.category }),
          ...(options.includeTemp && { includeTemp: 'true' }),
          ...(options.minSize && { minSize: options.minSize.toString() }),
          ...(options.maxSize && { maxSize: options.maxSize.toString() }),
          ...(options.includeCloudinary !== undefined && {
            includeCloudinary: options.includeCloudinary.toString(),
          }),
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
          setSelectedCloudinaryFiles([]); // 🆕 Limpar seleção do Cloudinary

          const localOrphans = data.data.orphanFiles.length;
          const cloudinaryOrphans =
            data.data.cloudinaryData?.orphanFiles.length || 0;
          const totalOrphans = localOrphans + cloudinaryOrphans;

          let message: string;
          if (scanType === 'cloudinary') {
            message =
              cloudinaryOrphans > 0
                ? `${cloudinaryOrphans} arquivos órfãos no Cloudinary (${
                    data.data.cloudinaryData?.formattedTotalSize || '0 B'
                  })`
                : 'Nenhum arquivo órfão no Cloudinary!';
          } else if (scanType === 'local') {
            message =
              localOrphans > 0
                ? `${localOrphans} arquivos órfãos locais (${data.data.formattedTotalSize})`
                : 'Nenhum arquivo órfão local!';
          } else {
            message =
              totalOrphans > 0
                ? `${totalOrphans} arquivos órfãos encontrados (${localOrphans} locais, ${cloudinaryOrphans} Cloudinary)`
                : 'Nenhum arquivo órfão encontrado!';
          }

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
    async (filePaths?: string[], cloudinaryPublicIds?: string[]) => {
      if (isRemoving) return;

      const localCount = filePaths?.length || 0;
      const cloudinaryCount = cloudinaryPublicIds?.length || 0;
      const totalCount = localCount + cloudinaryCount;

      if (totalCount === 0) return;

      setIsRemoving(true);
      setError(null);

      const toastId = toast.loading(
        `Removendo ${totalCount} arquivos (${localCount} locais, ${cloudinaryCount} Cloudinary)...`
      );

      try {
        const response = await fetch('/api/admin/orphan-files', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePaths, cloudinaryPublicIds }),
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          const { localResult, cloudinaryResult, summary } = data.data;

          // Atualizar scan result removendo arquivos deletados
          if (scanResult) {
            let updatedOrphanFiles = [...scanResult.orphanFiles];
            let updatedCloudinaryData = scanResult.cloudinaryData;

            // Remover arquivos locais
            if (localResult?.removed) {
              updatedOrphanFiles = updatedOrphanFiles.filter(
                (file) => !localResult.removed.includes(file.relativePath)
              );
            }

            // Remover arquivos do Cloudinary
            if (cloudinaryResult?.removed && updatedCloudinaryData) {
              updatedCloudinaryData = {
                ...updatedCloudinaryData,
                orphanFiles: updatedCloudinaryData.orphanFiles.filter(
                  (file) => !cloudinaryResult.removed.includes(file.publicId)
                ),
                totalSize:
                  updatedCloudinaryData.totalSize -
                  cloudinaryResult.totalSizeFreed,
              };
            }

            setScanResult({
              ...scanResult,
              orphanFiles: updatedOrphanFiles,
              totalSize:
                scanResult.totalSize - (localResult?.totalSizeFreed || 0),
              cloudinaryData: updatedCloudinaryData,
            });
          }

          // Limpar seleções dos arquivos removidos
          if (localResult?.removed) {
            setSelectedFiles((prev) =>
              prev.filter((path) => !localResult.removed.includes(path))
            );
          }

          if (cloudinaryResult?.removed) {
            setSelectedCloudinaryFiles((prev) =>
              prev.filter((id) => !cloudinaryResult.removed.includes(id))
            );
          }

          const totalRemoved = summary.totalRemoved;
          const totalFailed = summary.totalFailed;

          const message =
            totalFailed > 0
              ? `${totalRemoved} arquivos removidos, ${totalFailed} falharam`
              : `${totalRemoved} arquivos removidos com sucesso`;

          toast.success(message, { id: toastId });

          if (totalFailed > 0) {
            console.warn('Arquivos que falharam:', {
              localResult,
              cloudinaryResult,
            });
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
    const localCount = selectedFiles.length;
    const cloudinaryCount = selectedCloudinaryFiles.length;
    const totalCount = localCount + cloudinaryCount;

    if (totalCount === 0) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja remover ${totalCount} arquivo(s) selecionado(s)? ` +
        `(${localCount} locais, ${cloudinaryCount} do Cloudinary)\n\n` +
        'Esta ação não pode ser desfeita.'
    );

    if (!confirmed) return;

    await removeFiles(
      selectedFiles.length > 0 ? selectedFiles : undefined,
      selectedCloudinaryFiles.length > 0 ? selectedCloudinaryFiles : undefined
    );
  }, [selectedFiles, selectedCloudinaryFiles, removeFiles]);

  const clearScan = useCallback(() => {
    setScanResult(null);
    setSelectedFiles([]);
    setSelectedCloudinaryFiles([]);
    setError(null);
  }, []);

  // 🔄 FUNÇÕES DE SELEÇÃO LOCAL (mantidas originais)
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

  // 🆕 FUNÇÕES DE SELEÇÃO DO CLOUDINARY
  const toggleCloudinarySelection = useCallback((publicId: string) => {
    setSelectedCloudinaryFiles((prev) =>
      prev.includes(publicId)
        ? prev.filter((id) => id !== publicId)
        : [...prev, publicId]
    );
  }, []);

  const selectAllCloudinaryFiles = useCallback(() => {
    if (!scanResult?.cloudinaryData) return;
    setSelectedCloudinaryFiles(
      scanResult.cloudinaryData.orphanFiles.map((file) => file.publicId)
    );
  }, [scanResult]);

  const clearCloudinarySelection = useCallback(() => {
    setSelectedCloudinaryFiles([]);
  }, []);

  const selectCloudinaryByCategory = useCallback(
    (category: CloudinaryFileCategory) => {
      if (!scanResult?.cloudinaryData) return;

      const categoryFiles = scanResult.cloudinaryData.orphanFiles
        .filter((file) => file.category === category)
        .map((file) => file.publicId);

      setSelectedCloudinaryFiles(categoryFiles);
    },
    [scanResult]
  );

  // 🆕 FUNÇÕES DE SELEÇÃO HÍBRIDA
  const selectAllHybrid = useCallback(() => {
    selectAllFiles();
    selectAllCloudinaryFiles();
  }, [selectAllFiles, selectAllCloudinaryFiles]);

  const clearAllSelections = useCallback(() => {
    clearSelection();
    clearCloudinarySelection();
  }, [clearSelection, clearCloudinarySelection]);

  const getHybridSelection = useCallback((): HybridSelection => {
    return {
      localFiles: selectedFiles,
      cloudinaryPublicIds: selectedCloudinaryFiles,
    };
  }, [selectedFiles, selectedCloudinaryFiles]);

  // UTILITÁRIOS DE TAMANHO
  const getSelectedSize = useCallback(() => {
    if (!scanResult) return 0;

    return scanResult.orphanFiles
      .filter((file) => selectedFiles.includes(file.relativePath))
      .reduce((total, file) => total + file.size, 0);
  }, [scanResult, selectedFiles]);

  const getSelectedCloudinarySize = useCallback(() => {
    if (!scanResult?.cloudinaryData) return 0;

    return scanResult.cloudinaryData.orphanFiles
      .filter((file) => selectedCloudinaryFiles.includes(file.publicId))
      .reduce((total, file) => total + file.bytes, 0);
  }, [scanResult, selectedCloudinaryFiles]);

  const getTotalSelectedSize = useCallback(() => {
    return getSelectedSize() + getSelectedCloudinarySize();
  }, [getSelectedSize, getSelectedCloudinarySize]);

  const getFormattedSelectedSize = useCallback(() => {
    return formatBytes(getTotalSelectedSize());
  }, [getTotalSelectedSize]);

  // ESTATÍSTICAS
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
      cloudinary: { count: 0, size: 0 },
    };

    scanResult.orphanFiles.forEach((file) => {
      stats[file.category].count++;
      stats[file.category].size += file.size;
    });

    return stats;
  }, [scanResult]);

  const getCloudinaryCategoryStats = useCallback(() => {
    if (!scanResult?.cloudinaryData) {
      return {} as Record<
        CloudinaryFileCategory,
        { count: number; size: number; orphans: number }
      >;
    }

    return scanResult.cloudinaryData.categories;
  }, [scanResult]);

  // UTILITÁRIOS
  const formatFileDate = useCallback((date: Date | string): string => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const formatCloudinaryAge = useCallback((dateString: string): string => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'hoje';
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return `${Math.floor(diffDays / 365)} anos atrás`;
  }, []);

  const getFileTypeIcon = useCallback(
    (file: OrphanFile | CloudinaryOrphanFile): string => {
      // Para arquivos locais (OrphanFile)
      if ('isImage' in file) {
        if (file.isImage) return 'FiImage';
        if (file.isVideo) return 'FiVideo';
        if (file.isAudio) return 'FiMusic';
        if (file.isPDF) return 'FiFileText';
        return 'FiFile';
      }

      // Para arquivos do Cloudinary (CloudinaryOrphanFile)
      if (file.resourceType === 'image') return 'FiImage';
      if (file.resourceType === 'video') return 'FiVideo';
      if (
        file.format === 'mp3' ||
        file.format === 'wav' ||
        file.format === 'ogg'
      )
        return 'FiMusic';
      if (file.format === 'pdf') return 'FiFileText';
      return 'FiFile';
    },
    []
  );

  const getCloudinaryFileIcon = useCallback(
    (file: CloudinaryOrphanFile): string => {
      return getFileTypeIcon(file);
    },
    [getFileTypeIcon]
  );

  const getCategoryDisplayName = useCallback(
    (category: OrphanFileCategory | CloudinaryFileCategory): string => {
      // Tentar primeiro como categoria local
      if (category in CATEGORY_DISPLAY_NAMES) {
        return CATEGORY_DISPLAY_NAMES[category as OrphanFileCategory];
      }
      // Depois como categoria do Cloudinary
      if (category in CLOUDINARY_CATEGORY_DISPLAY_NAMES) {
        return CLOUDINARY_CATEGORY_DISPLAY_NAMES[
          category as CloudinaryFileCategory
        ];
      }
      return String(category);
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
    selectedCloudinaryFiles,

    scanFiles,
    removeSelectedFiles,
    removeFiles,
    clearScan,

    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    selectByCategory,

    toggleCloudinarySelection,
    selectAllCloudinaryFiles,
    clearCloudinarySelection,
    selectCloudinaryByCategory,

    selectAllHybrid,
    clearAllSelections,
    getHybridSelection,

    getSelectedSize,
    getSelectedCloudinarySize,
    getTotalSelectedSize,
    getFormattedSelectedSize,
    getCategoryStats,
    getCloudinaryCategoryStats,
    formatFileDate,
    formatCloudinaryAge,
    getFileTypeIcon,
    getCloudinaryFileIcon,
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
