// app/components/Admin/OrphanFiles/OrphanFilesManagementClient.tsx - VERSÃO CORRIGIDA
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
  FiDatabase,
  FiInfo,
  FiFolder,
  FiUsers,
  FiUser,
  FiPlay,
  FiGrid,
  FiEye,
  FiCloud,
  FiMonitor,
  FiLayers,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import { useOrphanFileManagement } from '@/app/hooks/admin/useOrphanFileManagement';
import Button from '@/app/components/Common/Button';
import { MetricCard } from '@/app/components/Admin/Charts/AdminCharts';
import {
  OrphanFileCategory,
  OrphanFile,
} from '@/app/libs/orphanFiles/orphanFileScanner';
import {
  CloudinaryOrphanFile,
  CloudinaryFileCategory,
} from '@/app/libs/orphanFiles/cloudinaryOrphanScanner';
import { IconType } from 'react-icons';

// Tabs atualizadas com Cloudinary
const CATEGORY_TABS = [
  {
    value: 'all' as const,
    label: 'Todos',
    icon: FiGrid,
    description: 'Todos os arquivos órfãos (local + Cloudinary)',
    color: 'text-theme-primary',
  },
  {
    value: 'local' as const,
    label: 'Locais',
    icon: FiMonitor,
    description: 'Arquivos locais do servidor',
    color: 'text-blue-500',
  },
  {
    value: 'cloudinary' as const,
    label: 'Cloudinary',
    icon: FiCloud,
    description: 'Arquivos no Cloudinary',
    color: 'text-purple-500',
  },
  {
    value: 'assignments' as const,
    label: 'Tarefas',
    icon: FiFileText,
    description: 'Vídeos de tarefas',
    color: 'text-green-500',
  },
  {
    value: 'learned' as const,
    label: 'Performances',
    icon: FiPlay,
    description: 'Vídeos de performance',
    color: 'text-red-500',
  },
  {
    value: 'profiles' as const,
    label: 'Perfis',
    icon: FiUsers,
    description: 'Fotos de usuários',
    color: 'text-indigo-500',
  },
  {
    value: 'composers' as const,
    label: 'Compositores',
    icon: FiUser,
    description: 'Retratos de compositores',
    color: 'text-pink-500',
  },
  {
    value: 'works' as const,
    label: 'Obras',
    icon: FiMusic,
    description: 'Mídia de obras',
    color: 'text-yellow-500',
  },
];

// Opções de scan type
const SCAN_TYPE_OPTIONS = [
  { value: 'hybrid' as const, label: 'Híbrido (Local + Cloudinary)' },
  { value: 'local' as const, label: 'Apenas Locais' },
  { value: 'cloudinary' as const, label: 'Apenas Cloudinary' },
];

// Função auxiliar para obter componente de ícone
const getIconComponent = (iconName: string): IconType => {
  const iconMap: Record<string, IconType> = {
    FiImage,
    FiVideo,
    FiMusic,
    FiFileText,
    FiFile,
  };
  return iconMap[iconName] || FiFile;
};

// Componente de arquivo do Cloudinary
interface CloudinaryFileItemProps {
  file: CloudinaryOrphanFile;
  isSelected: boolean;
  onToggleSelection: (publicId: string) => void;
  onPreview: (file: CloudinaryOrphanFile) => void;
  onDetails: (file: CloudinaryOrphanFile) => void;
  getCategoryDisplayName: (category: CloudinaryFileCategory) => string;
  formatCloudinaryAge: (dateString: string) => string;
  getCloudinaryFileIcon: (file: CloudinaryOrphanFile) => string;
}

const CloudinaryFileItem = ({
  file,
  isSelected,
  onToggleSelection,
  onPreview,
  onDetails,
  getCategoryDisplayName,
  formatCloudinaryAge,
  getCloudinaryFileIcon,
}: CloudinaryFileItemProps) => {
  const IconComponent = getIconComponent(getCloudinaryFileIcon(file));

  const getCategoryColor = (category: CloudinaryFileCategory): string => {
    const colors: Record<CloudinaryFileCategory, string> = {
      assignments: 'bg-green-500',
      learned: 'bg-red-500',
      scores: 'bg-blue-500',
      'works-audio': 'bg-yellow-500',
      'works-video': 'bg-purple-500',
      advertisements: 'bg-pink-500',
      profiles: 'bg-indigo-500',
      composers: 'bg-cyan-500',
      unknown: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div
      className={`p-4 border rounded-lg transition-all cursor-pointer ${
        isSelected
          ? 'border-brand-primary bg-brand-primary/5'
          : 'border-theme-primary hover:border-theme-secondary hover:bg-theme-secondary'
      }`}
      onClick={() => onToggleSelection(file.publicId)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Checkbox */}
          <div className="flex-shrink-0">
            {isSelected ? (
              <FiCheckSquare className="w-5 h-5 text-brand-primary" />
            ) : (
              <FiSquare className="w-5 h-5 text-theme-tertiary" />
            )}
          </div>

          {/* Ícone do Tipo */}
          <div className="flex-shrink-0">
            <IconComponent className="w-5 h-5 text-purple-500" />
          </div>

          {/* Informações do Arquivo */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <p className="font-medium text-theme-primary truncate">
                {file.publicId.split('/').pop() || file.publicId}
              </p>
              <span
                className={`text-xs px-2 py-1 rounded-full text-white ${getCategoryColor(
                  file.category
                )}`}
              >
                {getCategoryDisplayName(file.category)}
              </span>
              <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                Cloudinary
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-theme-secondary">
              <span className="flex items-center space-x-1">
                <FiFolder className="w-3 h-3" />
                <span className="truncate max-w-48">
                  {file.folder || 'Root'}
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <FiHardDrive className="w-3 h-3" />
                <span>{file.formattedSize}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FiClock className="w-3 h-3" />
                <span>{formatCloudinaryAge(file.createdAt)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FiEye />}
            onClick={(e) => {
              e.stopPropagation();
              onPreview(file);
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
              onDetails(file);
            }}
          >
            Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
};

type TabValue =
  | 'all'
  | 'local'
  | 'cloudinary'
  | CloudinaryFileCategory
  | OrphanFileCategory;

export default function OrphanFilesManagementClient() {
  const {
    scanResult,
    error,
    isScanning,
    isRemoving,
    selectedFiles,
    selectedCloudinaryFiles,
    scanFiles,
    removeSelectedFiles,
    // Seleções locais
    toggleFileSelection,
    // Seleções do Cloudinary
    toggleCloudinarySelection,
    // Seleções híbridas
    clearAllSelections,
    getFormattedSelectedSize,
    getCategoryStats,
    getCloudinaryCategoryStats,
    formatFileDate,
    formatCloudinaryAge,
    getFileTypeIcon,
    getCloudinaryFileIcon,
    getCategoryDisplayName,
  } = useOrphanFileManagement();

  // Estados
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [scanType, setScanType] = useState<'hybrid' | 'local' | 'cloudinary'>(
    'hybrid'
  );
  const [showFileDetails, setShowFileDetails] = useState<
    OrphanFile | CloudinaryOrphanFile | null
  >(null);
  const [showFilePreview, setShowFilePreview] = useState<
    OrphanFile | CloudinaryOrphanFile | null
  >(null);

  console.log('show', showFileDetails, showFilePreview);
  // Função de scan
  const handleScan = async () => {
    const options: any = {
      scanType,
    };

    if (
      activeTab !== 'all' &&
      activeTab !== 'local' &&
      activeTab !== 'cloudinary'
    ) {
      options.category = activeTab;
    }

    await scanFiles(options);
  };

  // Função para trocar aba
  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);

    // Auto-ajustar scanType baseado na aba
    if (tab === 'local') {
      setScanType('local');
    } else if (
      tab === 'cloudinary' ||
      tab === 'assignments' ||
      tab === 'learned'
    ) {
      setScanType('cloudinary');
    } else if (tab === 'all') {
      setScanType('hybrid');
    }
  };

  // Filtrar arquivos baseado na aba ativa
  const getFilteredFiles = () => {
    if (!scanResult) return { local: [], cloudinary: [] };

    const localFiles = scanResult.orphanFiles || [];
    const cloudinaryFiles = scanResult.cloudinaryData?.orphanFiles || [];

    switch (activeTab) {
      case 'all':
        return { local: localFiles, cloudinary: cloudinaryFiles };
      case 'local':
        return { local: localFiles, cloudinary: [] };
      case 'cloudinary':
        return { local: [], cloudinary: cloudinaryFiles };
      case 'assignments':
      case 'learned':
        return {
          local: [],
          cloudinary: cloudinaryFiles.filter((f) => f.category === activeTab),
        };
      default:
        // Categorias que podem estar em ambos
        return {
          local: localFiles.filter((f) => f.category === activeTab),
          cloudinary: cloudinaryFiles.filter((f) => f.category === activeTab),
        };
    }
  };

  const { local: filteredLocalFiles, cloudinary: filteredCloudinaryFiles } =
    getFilteredFiles();
  const totalFilteredFiles =
    filteredLocalFiles.length + filteredCloudinaryFiles.length;

  // Stats para aba ativa
  const activeTabStats = {
    count: totalFilteredFiles,
    size:
      filteredLocalFiles.reduce((sum, file) => sum + file.size, 0) +
      filteredCloudinaryFiles.reduce((sum, file) => sum + file.bytes, 0),
  };

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
                  <FiLayers className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Limpeza Híbrida de Arquivos Órfãos
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Encontre e remova arquivos não utilizados tanto localmente
                quanto no Cloudinary
              </p>
            </div>
          </AnimatedItem>

          {/* Navegação por abas */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="flex justify-center mb-8">
              <div className="flex flex-wrap justify-center gap-1 bg-theme-secondary p-1 rounded-xl max-w-5xl">
                {CATEGORY_TABS.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.value;

                  // Calcular contagem por aba
                  let tabCount = 0;
                  if (scanResult) {
                    const localStats = getCategoryStats();
                    const cloudinaryStats = getCloudinaryCategoryStats();

                    switch (tab.value) {
                      case 'all':
                        tabCount =
                          Object.values(localStats).reduce(
                            (sum, stat) => sum + stat.count,
                            0
                          ) +
                          Object.values(cloudinaryStats).reduce(
                            (sum, stat) => sum + stat.orphans,
                            0
                          );
                        break;
                      case 'local':
                        tabCount = Object.values(localStats).reduce(
                          (sum, stat) => sum + stat.count,
                          0
                        );
                        break;
                      case 'cloudinary':
                        tabCount = Object.values(cloudinaryStats).reduce(
                          (sum, stat) => sum + stat.orphans,
                          0
                        );
                        break;
                      default:
                        tabCount =
                          (localStats[tab.value as OrphanFileCategory]?.count ||
                            0) +
                          (cloudinaryStats[tab.value as CloudinaryFileCategory]
                            ?.orphans || 0);
                    }
                  }

                  return (
                    <button
                      key={tab.value}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                        isActive
                          ? 'bg-theme-tertiary text-theme-primary shadow-lg'
                          : 'text-theme-secondary hover:bg-theme-primary hover:text-theme-primary'
                      }`}
                      onClick={() => handleTabChange(tab.value)}
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

          {/* Scan Controls */}
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1">
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
                  <p className="text-theme-secondary mb-4">
                    {CATEGORY_TABS.find((t) => t.value === activeTab)
                      ?.description || 'Escaneie arquivos não utilizados'}
                  </p>

                  {/* Seletor de tipo de scan */}
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-theme-primary">
                      Tipo de Scan:
                    </label>
                    <div className="flex items-center space-x-2">
                      {SCAN_TYPE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            scanType === option.value
                              ? 'bg-brand-primary text-white'
                              : 'bg-theme-secondary text-theme-secondary hover:bg-theme-primary'
                          }`}
                          onClick={() => setScanType(option.value)}
                          disabled={isScanning}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    leftIcon={<FiSearch />}
                    onClick={handleScan}
                    disabled={isScanning}
                    isLoading={isScanning}
                  >
                    {isScanning
                      ? 'Escaneando...'
                      : `Escanear ${
                          scanType === 'hybrid'
                            ? 'Híbrido'
                            : scanType === 'cloudinary'
                              ? 'Cloudinary'
                              : 'Local'
                        }`}
                  </Button>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedItem>

          {/* Stats Grid */}
          {scanResult && (
            <AnimatedItem direction="up" springType="gentle">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <MetricCard
                  title={`Órfãos ${
                    activeTab === 'all' ? 'Total' : 'na Seleção'
                  }`}
                  value={totalFilteredFiles.toLocaleString()}
                  change={{
                    value:
                      scanResult.totalFiles > 0
                        ? (totalFilteredFiles / scanResult.totalFiles) * 100
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
                  title="Selecionados"
                  value={(
                    selectedFiles.length + selectedCloudinaryFiles.length
                  ).toLocaleString()}
                  change={{
                    value: getFormattedSelectedSize(),
                    isPositive: true,
                  }}
                  icon={FiCheckSquare}
                  color="#3B82F6"
                />

                <MetricCard
                  title="Fontes"
                  value={`${scanResult.includesCloudinary ? '2' : '1'} fonte${
                    scanResult.includesCloudinary ? 's' : ''
                  }`}
                  change={{
                    value: scanResult.includesCloudinary
                      ? 'Local + Cloudinary'
                      : 'Apenas Local',
                    isPositive: true,
                  }}
                  icon={scanResult.includesCloudinary ? FiLayers : FiMonitor}
                  color="#F59E0B"
                />
              </div>
            </AnimatedItem>
          )}

          {/* Files List */}
          {scanResult && (
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-theme-primary">
                    Arquivos Órfãos ({totalFilteredFiles})
                    {activeTab !== 'all' && (
                      <span className="text-base font-normal text-theme-secondary ml-2">
                        -{' '}
                        {
                          CATEGORY_TABS.find((t) => t.value === activeTab)
                            ?.label
                        }
                      </span>
                    )}
                  </h3>

                  {totalFilteredFiles > 0 && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            selectedFiles.length ===
                              filteredLocalFiles.length &&
                            selectedCloudinaryFiles.length ===
                              filteredCloudinaryFiles.length
                          ) {
                            clearAllSelections();
                          } else {
                            // Selecionar todos os visíveis
                            filteredLocalFiles.forEach((file) => {
                              if (!selectedFiles.includes(file.relativePath)) {
                                toggleFileSelection(file.relativePath);
                              }
                            });
                            filteredCloudinaryFiles.forEach((file) => {
                              if (
                                !selectedCloudinaryFiles.includes(file.publicId)
                              ) {
                                toggleCloudinarySelection(file.publicId);
                              }
                            });
                          }
                        }}
                        leftIcon={
                          selectedFiles.length === filteredLocalFiles.length &&
                          selectedCloudinaryFiles.length ===
                            filteredCloudinaryFiles.length ? (
                            <FiSquare />
                          ) : (
                            <FiCheckSquare />
                          )
                        }
                      >
                        {selectedFiles.length === filteredLocalFiles.length &&
                        selectedCloudinaryFiles.length ===
                          filteredCloudinaryFiles.length
                          ? 'Desmarcar Todos'
                          : 'Selecionar Todos'}
                      </Button>

                      {(selectedFiles.length > 0 ||
                        selectedCloudinaryFiles.length > 0) && (
                        <Button
                          variant="delete"
                          size="sm"
                          leftIcon={<FiTrash2 />}
                          onClick={removeSelectedFiles}
                          disabled={isRemoving}
                          isLoading={isRemoving}
                        >
                          Remover Selecionados (
                          {selectedFiles.length +
                            selectedCloudinaryFiles.length}
                          )
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {totalFilteredFiles === 0 ? (
                  <div className="text-center py-12">
                    <FiDatabase className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-theme-primary mb-2">
                      Nenhum arquivo órfão encontrado!
                    </h4>
                    <p className="text-theme-secondary mb-6">
                      {activeTab === 'all'
                        ? 'Seus arquivos estão organizados tanto localmente quanto no Cloudinary.'
                        : `Não há arquivos órfãos em ${
                            CATEGORY_TABS.find((t) => t.value === activeTab)
                              ?.label
                          }.`}
                    </p>
                    {!scanResult && (
                      <Button
                        variant="primary"
                        leftIcon={<FiSearch />}
                        onClick={handleScan}
                        disabled={isScanning}
                      >
                        Iniciar Primeiro Scan
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Arquivos Locais */}
                    {filteredLocalFiles.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-theme-primary mb-3 flex items-center space-x-2">
                          <FiMonitor className="w-5 h-5" />
                          <span>
                            Arquivos Locais ({filteredLocalFiles.length})
                          </span>
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {filteredLocalFiles.map((file) => {
                            const isSelected = selectedFiles.includes(
                              file.relativePath
                            );
                            const IconComponent = getIconComponent(
                              getFileTypeIcon(file)
                            );

                            return (
                              <div
                                key={file.relativePath}
                                className={`p-4 border rounded-lg transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-brand-primary bg-brand-primary/5'
                                    : 'border-theme-primary hover:border-theme-secondary hover:bg-theme-secondary'
                                }`}
                                onClick={() =>
                                  toggleFileSelection(file.relativePath)
                                }
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
                                      <IconComponent className="w-5 h-5 text-blue-500" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <p className="font-medium text-theme-primary truncate">
                                          {file.name}
                                        </p>
                                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                          Local
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                                        <span className="flex items-center space-x-1">
                                          <FiFolder className="w-3 h-3" />
                                          <span className="truncate max-w-48">
                                            {file.directory}
                                          </span>
                                        </span>
                                        <span>{file.formattedSize}</span>
                                        <span>
                                          {formatFileDate(file.lastModified)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
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
                      </div>
                    )}

                    {/* Arquivos do Cloudinary */}
                    {filteredCloudinaryFiles.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-theme-primary mb-3 flex items-center space-x-2">
                          <FiCloud className="w-5 h-5" />
                          <span>
                            Arquivos do Cloudinary (
                            {filteredCloudinaryFiles.length})
                          </span>
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {filteredCloudinaryFiles.map((file) => (
                            <CloudinaryFileItem
                              key={file.publicId}
                              file={file}
                              isSelected={selectedCloudinaryFiles.includes(
                                file.publicId
                              )}
                              onToggleSelection={toggleCloudinarySelection}
                              onPreview={setShowFilePreview}
                              onDetails={setShowFileDetails}
                              getCategoryDisplayName={getCategoryDisplayName}
                              formatCloudinaryAge={formatCloudinaryAge}
                              getCloudinaryFileIcon={getCloudinaryFileIcon}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </AnimatedCard>
            </AnimatedItem>
          )}
        </AnimatedContainer>
      </div>
    </PageContainer>
  );
}
