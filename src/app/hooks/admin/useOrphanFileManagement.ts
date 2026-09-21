// app/hooks/admin/useOrphanFileManagement.ts - VERSÃO HÍBRIDA
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  runMaintenanceTask,
  waitForMaintenanceJob,
} from '@/app/requests/admin/maintenance';

// Tipos da tela (antes vinham das bibliotecas do legado, que leem o banco).
export type OrphanFileCategory =
  | 'profiles'
  | 'composers'
  | 'scores'
  | 'advertisements'
  | 'works'
  | 'general'
  | 'unknown'
  | 'cloudinary';

export interface OrphanFile {
  path: string;
  name: string;
  size: number;
  lastModified: Date;
  category: OrphanFileCategory;
  subCategory?: string;
  relativePath: string;
  directory: string;
  extension: string;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  isPDF: boolean;
  formattedSize: string;
}

export type CloudinaryFileCategory =
  | 'assignments'
  | 'learned'
  | 'scores'
  | 'works-audio'
  | 'works-video'
  | 'advertisements'
  | 'profiles'
  | 'composers'
  | 'unknown';

export interface CloudinaryOrphanFile {
  publicId: string;
  secureUrl: string;
  format: string;
  resourceType: 'image' | 'video' | 'raw';
  bytes: number;
  createdAt: string;
  folder: string;
  tags: string[];
  category: CloudinaryFileCategory;
  isOrphan: boolean;
  formattedSize: string;
  relativeAge: string;
}

export interface CloudinaryOrphanScanResult {
  totalFiles: number;
  orphanFiles: CloudinaryOrphanFile[];
  referencedFiles: CloudinaryOrphanFile[];
  totalSize: number;
  formattedTotalSize: string;
  categories: Record<
    CloudinaryFileCategory,
    { count: number; size: number; orphans: number }
  >;
  scanDuration: number;
  scannedFolders: string[];
  errors: string[];
}

export interface OrphanScanResult {
  totalFiles: number;
  orphanFiles: OrphanFile[];
  totalSize: number;
  formattedTotalSize: string;
  categories: Record<OrphanFileCategory, number>;
  scanDuration: number;
  scannedDirectories: string[];
  errors: string[];
  cloudinaryData?: CloudinaryOrphanScanResult;
  includesCloudinary: boolean;
}

// Dono do arquivo na API → categoria da tela.
const OWNER_CATEGORY: Record<string, CloudinaryFileCategory> = {
  user: 'profiles',
  composer: 'composers',
  workScore: 'scores',
  work: 'works-audio',
  assignment: 'assignments',
  advertisement: 'advertisements',
};

const CLOUD_CATEGORIES: CloudinaryFileCategory[] = [
  'assignments',
  'learned',
  'scores',
  'works-audio',
  'works-video',
  'advertisements',
  'profiles',
  'composers',
  'unknown',
];

const LOCAL_CATEGORIES: OrphanFileCategory[] = [
  'profiles',
  'composers',
  'scores',
  'advertisements',
  'works',
  'general',
  'unknown',
  'cloudinary',
];

const NOT_OWNER_KEYS = ['examinados', 'orfaos', 'semDonoDeclarado'];

/**
 * A varredura é a tarefa `storage.orphan-sweep` da API: confere, no registro
 * de arquivos, quem tem dono que já não existe. Ela relata (contagem por tipo
 * de dono e uma amostra), não apaga; não há mais arquivo local para varrer.
 */
async function runOrphanSweep(): Promise<OrphanScanResult> {
  const startedAt = Date.now();
  const { jobId } = await runMaintenanceTask('storage.orphan-sweep', false);
  const outcome = await waitForMaintenanceJob(jobId);
  const summary = outcome.summary ?? {};
  const warnings = outcome.warnings ?? [];

  const categories = Object.fromEntries(
    CLOUD_CATEGORIES.map((category) => [
      category,
      { count: 0, size: 0, orphans: 0 },
    ])
  ) as CloudinaryOrphanScanResult['categories'];

  for (const [owner, count] of Object.entries(summary)) {
    if (NOT_OWNER_KEYS.includes(owner)) continue;
    const category = categories[OWNER_CATEGORY[owner] ?? 'unknown'];
    category.count += count;
    category.orphans += count;
  }

  const orphanFiles: CloudinaryOrphanFile[] = (outcome.sample ?? []).map(
    (line) => {
      const [owner, publicId = ''] = line.split(' → ');
      const ownerType = owner.split(':')[0];

      return {
        publicId,
        secureUrl: '',
        format: publicId.split('.').pop() ?? '',
        resourceType: 'image',
        bytes: 0,
        createdAt: '',
        folder: publicId.split('/').slice(0, -1).join('/'),
        tags: [],
        category: OWNER_CATEGORY[ownerType] ?? 'unknown',
        isOrphan: true,
        formattedSize: '—',
        relativeAge: '',
      };
    }
  );

  const scanDuration = Date.now() - startedAt;

  return {
    totalFiles: summary.examinados ?? 0,
    orphanFiles: [],
    totalSize: 0,
    formattedTotalSize: '0 B',
    categories: Object.fromEntries(
      LOCAL_CATEGORIES.map((category) => [category, 0])
    ) as Record<OrphanFileCategory, number>,
    scanDuration,
    scannedDirectories: [],
    errors: warnings,
    includesCloudinary: true,
    cloudinaryData: {
      totalFiles: summary.examinados ?? 0,
      orphanFiles,
      referencedFiles: [],
      totalSize: 0,
      formattedTotalSize: '—',
      categories,
      scanDuration,
      scannedFolders: [],
      errors: warnings,
    },
  };
}

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
  const [isRemoving] = useState(false);
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
        const result = await runOrphanSweep();
        setScanResult(result);
        setSelectedFiles([]);
        setSelectedCloudinaryFiles([]);

        const orphans = result.cloudinaryData?.categories
          ? Object.values(result.cloudinaryData.categories).reduce(
              (sum, category) => sum + category.orphans,
              0
            )
          : 0;

        toast.success(
          orphans > 0
            ? `${orphans} arquivos órfãos encontrados (amostra de ${result.cloudinaryData?.orphanFiles.length ?? 0})`
            : 'Nenhum arquivo órfão encontrado!',
          { id: toastId }
        );
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

  // A varredura da API só relata; não há remoção de órfão pelo painel.
  const removeFiles = useCallback(
    async (_filePaths?: string[], _cloudinaryPublicIds?: string[]) => {
      toast.error(
        'A API não apaga arquivo órfão pelo painel: a varredura só relata. O arquivo sai quando o registro dele é limpo.'
      );
    },
    []
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
