// app/components/Admin/OrphanFiles/OrphanFilesManagementClient.tsx
'use client';

import { useState } from 'react';
import {
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiFile,
  FiImage,
  FiVideo,
  FiMusic,
  FiFileText,
  FiCheckSquare,
  FiSquare,
  FiAlertTriangle,
  FiHardDrive,
  FiClock,
  FiFilter,
  FiX,
  FiDatabase,
  FiInfo,
  FiDownload,
  FiFolder,
  FiUsers,
  FiUser,
  FiBookOpen,
  FiPlay,
  FiGrid,
  FiEye,
  FiMaximize2,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import { useOrphanFileManagement } from '@/app/hooks/admin/useOrphanFileManagement';
import Button from '@/app/components/Common/Button';
import { MetricCard } from '@/app/components/Admin/Charts/AdminCharts';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import {
  OrphanFileCategory,
  OrphanFile,
} from '@/app/libs/orphanFiles/orphanFileScanner';
import { GiMegaphone } from 'react-icons/gi';
import Image from 'next/image';

const getFileTypeColor = (file: OrphanFile): string => {
  if (file.isImage) return 'text-blue-500';
  if (file.isVideo) return 'text-purple-500';
  if (file.isAudio) return 'text-green-500';
  if (file.isPDF) return 'text-red-500';
  return 'text-theme-tertiary';
};

const getCategoryColor = (category: OrphanFileCategory): string => {
  const colors = {
    profiles: 'bg-blue-500',
    composers: 'bg-purple-500',
    scores: 'bg-red-500',
    advertisements: 'bg-green-500',
    works: 'bg-yellow-500',
    general: 'bg-gray-500',
    unknown: 'bg-gray-400',
  };
  return colors[category] || 'bg-gray-500';
};

// 🆕 CATEGORIAS COM ÍCONES E INFORMAÇÕES
const CATEGORY_TABS = [
  {
    value: 'all',
    label: 'Todos',
    icon: FiGrid,
    description: 'Todos os arquivos órfãos',
    color: 'text-theme-primary',
  },
  {
    value: 'profiles',
    label: 'Perfis',
    icon: FiUsers,
    description: 'Fotos de usuários',
    color: 'text-blue-500',
  },
  {
    value: 'composers',
    label: 'Compositores',
    icon: FiUser,
    description: 'Retratos de compositores',
    color: 'text-purple-500',
  },
  {
    value: 'scores',
    label: 'Partituras',
    icon: FiBookOpen,
    description: 'PDFs e thumbnails',
    color: 'text-red-500',
  },
  {
    value: 'advertisements',
    label: 'Publicidades',
    icon: GiMegaphone,
    description: 'Imagens e vídeos de anúncios',
    color: 'text-green-500',
  },
  {
    value: 'works',
    label: 'Obras',
    icon: FiPlay,
    description: 'Áudios e vídeos de obras',
    color: 'text-yellow-500',
  },
  {
    value: 'general',
    label: 'Gerais',
    icon: FiFolder,
    description: 'Outros uploads',
    color: 'text-gray-500',
  },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Todas as Categorias' },
  { value: 'profiles', label: 'Fotos de Perfil' },
  { value: 'composers', label: 'Fotos de Compositores' },
  { value: 'scores', label: 'Partituras' },
  { value: 'advertisements', label: 'Publicidades' },
  { value: 'works', label: 'Mídia de Obras' },
  { value: 'general', label: 'Gerais' },
];

const FILE_TYPE_ICONS = {
  FiImage: FiImage,
  FiVideo: FiVideo,
  FiMusic: FiMusic,
  FiFileText: FiFileText,
  FiFile: FiFile,
};

interface FilterOptions {
  category: OrphanFileCategory | '';
  minSize: string;
  maxSize: string;
  includeTemp: boolean;
  fileType: 'all' | 'images' | 'videos' | 'audio' | 'documents';
}

// 🆕 Componente de Preview de Arquivo
interface FilePreviewProps {
  file: OrphanFile;
  onClose: () => void;
  getCategoryDisplayName: (category: OrphanFileCategory) => string;
}

const FilePreview = ({
  file,
  onClose,
  getCategoryDisplayName,
}: FilePreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileUrl = `/api/admin/orphan-files/preview?path=${encodeURIComponent(
    file.relativePath
  )}`;

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Erro ao carregar o arquivo');
  };

  const renderPreview = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center h-64 bg-theme-secondary rounded-lg">
          <div className="text-center">
            <FiAlertTriangle className="w-12 h-12 text-accent-red mx-auto mb-2" />
            <p className="text-theme-secondary">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => window.open(fileUrl, '_blank')}
              leftIcon={<FiDownload />}
            >
              Fazer Download
            </Button>
          </div>
        </div>
      );
    }

    // Preview para Imagens
    if (file.isImage) {
      return (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-theme-secondary rounded-lg">
              <LoadingSpinner size="lg" />
            </div>
          )}
          <Image
            height={150}
            width={150}
            src={fileUrl}
            alt={file.name}
            className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        </div>
      );
    }

    // Preview para Vídeos
    if (file.isVideo) {
      return (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-theme-secondary rounded-lg">
              <LoadingSpinner size="lg" />
            </div>
          )}
          <video
            src={fileUrl}
            controls
            className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
            onLoadedData={handleLoad}
            onError={handleError}
            style={{ display: isLoading ? 'none' : 'block' }}
          >
            Seu navegador não suporta reprodução de vídeo.
          </video>
        </div>
      );
    }

    // Preview para Áudios
    if (file.isAudio) {
      return (
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-8 rounded-lg">
          <div className="text-center mb-6">
            <FiMusic className="w-20 h-20 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-theme-primary mb-2">
              {file.name}
            </h3>
            <p className="text-theme-secondary">{file.formattedSize}</p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="lg" />
            </div>
          )}

          <audio
            src={fileUrl}
            controls
            className="w-full"
            onLoadedData={handleLoad}
            onError={handleError}
            style={{ display: isLoading ? 'none' : 'block' }}
          >
            Seu navegador não suporta reprodução de áudio.
          </audio>
        </div>
      );
    }

    // Preview para PDFs
    if (file.isPDF) {
      return (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-theme-secondary rounded-lg">
              <LoadingSpinner size="lg" />
            </div>
          )}
          <iframe
            src={fileUrl}
            className="w-full h-96 border border-theme-primary rounded-lg"
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
          <div className="mt-4 text-center">
            <Button
              variant="secondary"
              onClick={() => window.open(fileUrl, '_blank')}
              leftIcon={<FiMaximize2 />}
            >
              Abrir em Nova Aba
            </Button>
          </div>
        </div>
      );
    }

    // Para outros tipos de arquivo
    return (
      <div className="flex items-center justify-center h-64 bg-theme-secondary rounded-lg">
        <div className="text-center">
          <FiFile className="w-20 h-20 text-theme-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-theme-primary mb-2">
            {file.name}
          </h3>
          <p className="text-theme-secondary mb-4">
            Preview não disponível para este tipo de arquivo
          </p>
          <Button
            variant="primary"
            onClick={() => window.open(fileUrl, '_blank')}
            leftIcon={<FiDownload />}
          >
            Fazer Download
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen maxWidth="4xl" onClose={onClose}>
      <div className="bg-theme-elevated p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-theme-primary">
              {file.name}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-theme-secondary mt-1">
              <span>{file.formattedSize}</span>
              <span>{file.extension.toUpperCase()}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs text-white ${getCategoryColor(
                  file.category
                )}`}
              >
                {getCategoryDisplayName(file.category)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">{renderPreview()}</div>

        <div className="flex items-center justify-between pt-4 border-t border-theme-primary">
          <div className="text-sm text-theme-secondary">
            <span className="font-mono">{file.relativePath}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(fileUrl, '_blank')}
              leftIcon={<FiDownload />}
            >
              Download
            </Button>
            <Button
              variant="delete"
              size="sm"
              leftIcon={<FiTrash2 />}
              onClick={() => {
                if (
                  window.confirm('Tem certeza que deseja remover este arquivo?')
                ) {
                  // Aqui você chamaria a função de remoção
                  onClose();
                }
              }}
            >
              Remover
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default function OrphanFilesManagementClient() {
  const {
    scanResult,
    error,
    isScanning,
    isRemoving,
    selectedFiles,
    scanFiles,
    removeSelectedFiles,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    getFormattedSelectedSize,
    getCategoryStats,
    formatFileDate,
    getFileTypeIcon,
    getCategoryDisplayName,
  } = useOrphanFileManagement();

  // 🆕 ESTADO PARA ABA ATIVA
  const [activeTab, setActiveTab] = useState<OrphanFileCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showFileDetails, setShowFileDetails] = useState<OrphanFile | null>(
    null
  );
  const [showFilePreview, setShowFilePreview] = useState<OrphanFile | null>(
    null
  ); // 🆕 Estado para preview
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    minSize: '',
    maxSize: '',
    includeTemp: true,
    fileType: 'all',
  });

  // 🆕 FUNÇÃO DE SCAN BASEADA NA ABA ATIVA
  const handleScan = async (category?: OrphanFileCategory | 'all') => {
    const targetCategory = category || activeTab;

    const options: any = {
      includeTemp: filters.includeTemp,
    };

    // Se não for "all", definir categoria específica
    if (targetCategory !== 'all') {
      options.category = targetCategory;
    }

    if (filters.minSize) options.minSize = parseInt(filters.minSize) * 1024;
    if (filters.maxSize) options.maxSize = parseInt(filters.maxSize) * 1024;

    await scanFiles(options);
  };

  // 🆕 FUNÇÃO PARA TROCAR ABA E FAZER SCAN AUTOMÁTICO
  const handleTabChange = async (category: OrphanFileCategory | 'all') => {
    setActiveTab(category);

    // Se já temos um scan result, fazer novo scan para a categoria
    if (scanResult || isScanning) {
      await handleScan(category);
    }
  };

  // 🆕 FILTRAR ARQUIVOS BASEADO NA ABA ATIVA
  const filteredFiles =
    scanResult?.orphanFiles.filter((file) => {
      // Filtro por aba ativa
      if (activeTab !== 'all' && file.category !== activeTab) {
        return false;
      }

      // Filtro por tipo de arquivo
      if (filters.fileType !== 'all') {
        switch (filters.fileType) {
          case 'images':
            if (!file.isImage) return false;
            break;
          case 'videos':
            if (!file.isVideo) return false;
            break;
          case 'audio':
            if (!file.isAudio) return false;
            break;
          case 'documents':
            if (!file.isPDF) return false;
            break;
        }
      }
      return true;
    }) || [];

  const categoryStats = getCategoryStats();

  // 🆕 STATS PARA ABA ATIVA
  const activeTabStats =
    activeTab === 'all'
      ? {
          count: filteredFiles.length,
          size: filteredFiles.reduce((sum, file) => sum + file.size, 0),
        }
      : categoryStats[activeTab] || { count: 0, size: 0 };

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="text-center py-16">
          <FiAlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Erro ao Carregar Sistema
          </h2>
          <p className="text-theme-secondary mb-6">{error}</p>
          <Button
            variant="primary"
            leftIcon={<FiRefreshCw />}
            onClick={() => window.location.reload()}
          >
            Recarregar Página
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <div className="space-y-8">
        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header Section */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8 lg:py-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <FiTrash2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Limpeza de Arquivos Órfãos
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Encontre e remova arquivos não utilizados para liberar espaço em
                disco
              </p>
            </div>
          </AnimatedItem>

          {/* 🆕 NAVEGAÇÃO POR ABAS */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="flex justify-center mb-8">
              <div className="flex flex-wrap justify-center gap-1 bg-theme-secondary p-1 rounded-xl max-w-4xl">
                {CATEGORY_TABS.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.value;
                  const tabCount =
                    tab.value === 'all'
                      ? Object.values(categoryStats).reduce(
                          (sum, stat) => sum + stat.count,
                          0
                        )
                      : categoryStats[tab.value as OrphanFileCategory]?.count ||
                        0;

                  return (
                    <button
                      key={tab.value}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                        isActive
                          ? 'bg-theme-tertiary text-theme-primary shadow-lg'
                          : 'text-theme-secondary hover:bg-theme-primary hover:text-theme-primary'
                      }`}
                      onClick={() => handleTabChange(tab.value as any)}
                      disabled={isScanning}
                    >
                      <IconComponent
                        className={`w-4 h-4 ${isActive ? tab.color : ''}`}
                      />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {scanResult && tabCount > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-accent-red text-white'
                              : 'bg-theme-tertiary text-theme-primary'
                          }`}
                        >
                          {tabCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </AnimatedItem>

          {/* 🆕 INFO DA ABA ATIVA */}
          {scanResult && (
            <AnimatedItem direction="up" springType="gentle">
              <div className="text-center py-4">
                <h2 className="text-2xl font-bold text-theme-primary mb-2">
                  {activeTab === 'all'
                    ? 'Todos os Arquivos Órfãos'
                    : `Órfãos em ${
                        CATEGORY_TABS.find((t) => t.value === activeTab)?.label
                      }`}
                </h2>
                <p className="text-theme-secondary">
                  {activeTab === 'all'
                    ? 'Visualizando todos os arquivos órfãos encontrados'
                    : CATEGORY_TABS.find((t) => t.value === activeTab)
                        ?.description}
                </p>
                {activeTabStats.count > 0 && (
                  <div className="flex items-center justify-center space-x-4 mt-3 text-sm">
                    <span className="flex items-center space-x-1">
                      <FiFile className="w-4 h-4 text-accent-red" />
                      <span className="text-theme-primary font-medium">
                        {activeTabStats.count.toLocaleString()} arquivos órfãos
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FiHardDrive className="w-4 h-4 text-accent-green" />
                      <span className="text-theme-primary font-medium">
                        {(activeTabStats.size / (1024 * 1024)).toFixed(2)} MB
                        recuperáveis
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </AnimatedItem>
          )}

          {/* Scan Controls */}
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-theme-primary mb-2">
                    Escanear Arquivos Órfãos
                    {activeTab !== 'all' && (
                      <span className="ml-2 text-base font-normal text-theme-secondary">
                        -{' '}
                        {
                          CATEGORY_TABS.find((t) => t.value === activeTab)
                            ?.label
                        }
                      </span>
                    )}
                  </h3>
                  <p className="text-theme-secondary">
                    {activeTab === 'all'
                      ? 'Procure por todos os arquivos que não possuem referência no banco de dados'
                      : `Procure especificamente por arquivos órfãos em ${CATEGORY_TABS.find(
                          (t) => t.value === activeTab
                        )?.description?.toLowerCase()}`}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="secondary"
                    leftIcon={<FiFilter />}
                    onClick={() => setShowFilters(true)}
                  >
                    Filtros Avançados
                  </Button>

                  <Button
                    variant="primary"
                    leftIcon={<FiSearch />}
                    onClick={() => handleScan()}
                    disabled={isScanning}
                    isLoading={isScanning}
                  >
                    {isScanning
                      ? 'Escaneando...'
                      : `Escanear ${
                          activeTab === 'all'
                            ? 'Tudo'
                            : CATEGORY_TABS.find((t) => t.value === activeTab)
                                ?.label
                        }`}
                  </Button>
                </div>
              </div>

              {/* Quick Scan Buttons - só mostra se aba for "all" */}
              {activeTab === 'all' && (
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="text-sm text-theme-tertiary mr-2">
                    Scan rápido por categoria:
                  </span>
                  {CATEGORY_TABS.slice(1).map((category) => (
                    <Button
                      key={category.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabChange(category.value as any)}
                      disabled={isScanning}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              )}
            </AnimatedCard>
          </AnimatedItem>

          {/* Stats Grid */}
          {scanResult && (
            <AnimatedItem direction="up" springType="gentle">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <MetricCard
                  title={`Órfãos ${
                    activeTab === 'all' ? 'Total' : 'na Categoria'
                  }`}
                  value={filteredFiles.length.toLocaleString()}
                  change={{
                    value:
                      scanResult.totalFiles > 0
                        ? (filteredFiles.length / scanResult.totalFiles) * 100
                        : 0,
                    isPositive: false,
                  }}
                  icon={FiTrash2}
                  color="#EF4444"
                />

                <MetricCard
                  title="Espaço Recuperável"
                  value={`${(activeTabStats.size / (1024 * 1024)).toFixed(
                    2
                  )} MB`}
                  icon={FiHardDrive}
                  color="#10B981"
                />

                <MetricCard
                  title="Arquivos Selecionados"
                  value={selectedFiles.length.toLocaleString()}
                  change={{
                    value: getFormattedSelectedSize(),
                    isPositive: true,
                  }}
                  icon={FiCheckSquare}
                  color="#3B82F6"
                />

                <MetricCard
                  title="Tempo de Scan"
                  value={`${(scanResult.scanDuration / 1000).toFixed(1)}s`}
                  icon={FiClock}
                  color="#F59E0B"
                />
              </div>
            </AnimatedItem>
          )}

          {/* Category Breakdown - só mostra se aba for "all" */}
          {scanResult && activeTab === 'all' && (
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard className="classical-card p-6">
                <h3 className="text-xl font-bold text-theme-primary mb-6">
                  Distribuição por Categoria
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(categoryStats).map(([category, stats]) => {
                    if (stats.count === 0) return null;

                    const categoryTab = CATEGORY_TABS.find(
                      (t) => t.value === category
                    );
                    const IconComponent = categoryTab?.icon || FiFolder;

                    return (
                      <div
                        key={category}
                        className="p-4 border border-theme-primary rounded-lg hover:bg-theme-secondary transition-colors cursor-pointer"
                        onClick={() =>
                          handleTabChange(category as OrphanFileCategory)
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <IconComponent
                              className={`w-4 h-4 ${
                                categoryTab?.color || 'text-theme-tertiary'
                              }`}
                            />
                            <span className="font-medium text-theme-primary">
                              {getCategoryDisplayName(
                                category as OrphanFileCategory
                              )}
                            </span>
                          </div>
                          <span className="text-sm text-theme-tertiary">
                            {stats.count} arquivos
                          </span>
                        </div>
                        <div className="text-sm text-theme-secondary">
                          {(stats.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AnimatedCard>
            </AnimatedItem>
          )}

          {/* Files List */}
          {scanResult && (
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-theme-primary">
                    {activeTab === 'all'
                      ? `Todos os Arquivos Órfãos (${filteredFiles.length})`
                      : `Órfãos em ${
                          CATEGORY_TABS.find((t) => t.value === activeTab)
                            ?.label
                        } (${filteredFiles.length})`}
                  </h3>

                  {filteredFiles.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={
                          selectedFiles.length === filteredFiles.length
                            ? clearSelection
                            : selectAllFiles
                        }
                        leftIcon={
                          selectedFiles.length === filteredFiles.length ? (
                            <FiSquare />
                          ) : (
                            <FiCheckSquare />
                          )
                        }
                      >
                        {selectedFiles.length === filteredFiles.length
                          ? 'Desmarcar Todos'
                          : 'Selecionar Todos'}
                      </Button>

                      {selectedFiles.length > 0 && (
                        <Button
                          variant="delete"
                          size="sm"
                          leftIcon={<FiTrash2 />}
                          onClick={removeSelectedFiles}
                          disabled={isRemoving}
                          isLoading={isRemoving}
                        >
                          Remover Selecionados ({selectedFiles.length})
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {filteredFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <FiDatabase className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-theme-primary mb-2">
                      {scanResult
                        ? `Nenhum arquivo órfão encontrado ${
                            activeTab !== 'all'
                              ? `em ${
                                  CATEGORY_TABS.find(
                                    (t) => t.value === activeTab
                                  )?.label
                                }`
                              : ''
                          }!`
                        : 'Nenhum scan realizado'}
                    </h4>
                    <p className="text-theme-secondary mb-6">
                      {scanResult
                        ? activeTab === 'all'
                          ? 'Seus uploads estão organizados e todos os arquivos estão sendo utilizados.'
                          : `Não há arquivos órfãos nesta categoria. Tente outras categorias ou faça um scan completo.`
                        : 'Execute um scan para encontrar arquivos não utilizados.'}
                    </p>
                    {!scanResult && (
                      <Button
                        variant="primary"
                        leftIcon={<FiSearch />}
                        onClick={() => handleScan()}
                        disabled={isScanning}
                      >
                        Iniciar Primeiro Scan
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredFiles.map((file) => {
                      const isSelected = selectedFiles.includes(
                        file.relativePath
                      );
                      const IconComponent =
                        FILE_TYPE_ICONS[
                          getFileTypeIcon(file) as keyof typeof FILE_TYPE_ICONS
                        ] || FiFile;

                      return (
                        <div
                          key={file.relativePath}
                          className={`p-4 border rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? 'border-brand-primary bg-brand-primary/5'
                              : 'border-theme-primary hover:border-theme-secondary hover:bg-theme-secondary'
                          }`}
                          onClick={() => toggleFileSelection(file.relativePath)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="flex-shrink-0">
                                {isSelected ? (
                                  <FiCheckSquare className="w-5 h-5 text-brand-primary" />
                                ) : (
                                  <FiSquare className="w-5 h-5 text-theme-tertiary" />
                                )}
                              </div>

                              <div className="flex-shrink-0">
                                <IconComponent
                                  className={`w-5 h-5 ${getFileTypeColor(
                                    file
                                  )}`}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="font-medium text-theme-primary truncate">
                                    {file.name}
                                  </p>
                                  {/* Só mostra categoria se estiver na aba "all" */}
                                  {activeTab === 'all' && (
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full text-white ${getCategoryColor(
                                        file.category
                                      )}`}
                                    >
                                      {getCategoryDisplayName(file.category)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                                  <span className="flex items-center space-x-1">
                                    <FiFolder className="w-3 h-3" />
                                    <span className="truncate max-w-48">
                                      {file.directory}
                                    </span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <FiHardDrive className="w-3 h-3" />
                                    <span>{file.formattedSize}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <FiClock className="w-3 h-3" />
                                    <span>
                                      {formatFileDate(file.lastModified)}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* 🆕 Botão de Preview */}
                              <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<FiEye />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowFilePreview(file);
                                }}
                              >
                                Preview
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<FiInfo />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowFileDetails(file);
                                }}
                              >
                                Detalhes
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </AnimatedCard>
            </AnimatedItem>
          )}

          {/* System Info - Sempre visível */}
          {scanResult && (
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard className="classical-card p-6">
                <h3 className="text-xl font-bold text-theme-primary mb-4">
                  Informações do Scan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-theme-primary mb-3">
                      Diretórios Escaneados
                    </h4>
                    <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                      {scanResult.scannedDirectories.map((dir, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-theme-secondary font-mono">
                            {dir}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-theme-primary mb-3">
                      Estatísticas
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-theme-secondary">
                          Total de arquivos encontrados:
                        </span>
                        <span className="font-medium text-theme-primary">
                          {scanResult.totalFiles.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-secondary">
                          {activeTab === 'all'
                            ? 'Arquivos órfãos total:'
                            : 'Órfãos na categoria:'}
                        </span>
                        <span className="font-medium text-accent-red">
                          {filteredFiles.length.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-secondary">
                          Espaço recuperável:
                        </span>
                        <span className="font-medium text-accent-green">
                          {(activeTabStats.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-secondary">
                          Tempo de processamento:
                        </span>
                        <span className="font-medium text-theme-primary">
                          {(scanResult.scanDuration / 1000).toFixed(2)}s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {scanResult.errors.length > 0 && (
                  <div className="mt-6 p-4 bg-accent-red/10 border border-accent-red/20 rounded-lg">
                    <h5 className="font-medium text-accent-red mb-2">
                      Erros Encontrados:
                    </h5>
                    <ul className="text-sm text-accent-red space-y-1">
                      {scanResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AnimatedCard>
            </AnimatedItem>
          )}
        </AnimatedContainer>
      </div>

      {/* 🆕 Modal de Preview de Arquivo */}
      {showFilePreview && (
        <FilePreview
          file={showFilePreview}
          onClose={() => setShowFilePreview(null)}
          getCategoryDisplayName={getCategoryDisplayName}
        />
      )}

      {/* Filters Modal */}
      {showFilters && (
        <Modal
          isOpen
          maxWidth="2xl"
          onClose={() => setShowFilters(false)}
          confirmOnClose
          withouVerification
        >
          <div className="bg-theme-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-theme-primary">
                Filtros Avançados
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <FiX className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Categoria
                </label>
                <Select
                  options={CATEGORY_OPTIONS}
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value as any,
                    }))
                  }
                  className="w-full"
                />
                <p className="text-xs text-theme-tertiary mt-1">
                  Este filtro se aplica independentemente da aba selecionada
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Tamanho Mínimo (KB)
                  </label>
                  <Input
                    type="number"
                    value={filters.minSize}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minSize: e.target.value,
                      }))
                    }
                    placeholder="Ex: 100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Tamanho Máximo (KB)
                  </label>
                  <Input
                    type="number"
                    value={filters.maxSize}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxSize: e.target.value,
                      }))
                    }
                    placeholder="Ex: 5000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Tipo de Arquivo
                </label>
                <Select
                  options={[
                    { value: 'all', label: 'Todos os Tipos' },
                    { value: 'images', label: 'Apenas Imagens' },
                    { value: 'videos', label: 'Apenas Vídeos' },
                    { value: 'audio', label: 'Apenas Áudios' },
                    { value: 'documents', label: 'Apenas Documentos' },
                  ]}
                  value={filters.fileType}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      fileType: e.target.value as any,
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  checked={filters.includeTemp}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      includeTemp: e.target.checked,
                    }))
                  }
                />
                <label className="text-sm text-theme-primary">
                  Incluir arquivos temporários
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="ghost" onClick={() => setShowFilters(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleScan();
                  setShowFilters(false);
                }}
                disabled={isScanning}
              >
                Aplicar Filtros e Escanear
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* File Details Modal */}
      {showFileDetails && (
        <Modal
          isOpen
          maxWidth="2xl"
          onClose={() => setShowFileDetails(null)}
          confirmOnClose
          withouVerification
        >
          <div className="bg-theme-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-theme-primary">
                Detalhes do Arquivo
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFileDetails(null)}
              >
                <FiX className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-1">
                    Nome
                  </label>
                  <p className="text-theme-primary font-medium">
                    {showFileDetails.name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-1">
                    Categoria
                  </label>
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full text-white ${getCategoryColor(
                      showFileDetails.category
                    )}`}
                  >
                    {getCategoryDisplayName(showFileDetails.category)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-1">
                    Tamanho
                  </label>
                  <p className="text-theme-primary">
                    {showFileDetails.formattedSize}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-1">
                    Última Modificação
                  </label>
                  <p className="text-theme-primary">
                    {formatFileDate(showFileDetails.lastModified)}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-theme-tertiary mb-1">
                    Caminho Completo
                  </label>
                  <p className="text-theme-primary font-mono text-sm bg-theme-secondary p-2 rounded">
                    {showFileDetails.relativePath}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-theme-tertiary mb-1">
                    Diretório
                  </label>
                  <p className="text-theme-primary font-mono text-sm">
                    {showFileDetails.directory}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-1">
                    Extensão
                  </label>
                  <p className="text-theme-primary">
                    {showFileDetails.extension}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-1">
                    Tipo
                  </label>
                  <div className="flex items-center space-x-2">
                    {showFileDetails.isImage && (
                      <span className="text-blue-500 text-sm">Imagem</span>
                    )}
                    {showFileDetails.isVideo && (
                      <span className="text-purple-500 text-sm">Vídeo</span>
                    )}
                    {showFileDetails.isAudio && (
                      <span className="text-green-500 text-sm">Áudio</span>
                    )}
                    {showFileDetails.isPDF && (
                      <span className="text-red-500 text-sm">PDF</span>
                    )}
                    {!showFileDetails.isImage &&
                      !showFileDetails.isVideo &&
                      !showFileDetails.isAudio &&
                      !showFileDetails.isPDF && (
                        <span className="text-theme-tertiary text-sm">
                          Outro
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="ghost" onClick={() => setShowFileDetails(null)}>
                Fechar
              </Button>
              <Button
                variant="delete"
                leftIcon={<FiTrash2 />}
                onClick={async () => {
                  if (showFileDetails) {
                    toggleFileSelection(showFileDetails.relativePath);
                    await removeSelectedFiles();
                    setShowFileDetails(null);
                  }
                }}
                disabled={isRemoving}
              >
                Remover Este Arquivo
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
