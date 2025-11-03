// app/components/Admin/BlogMediaGallery/BlogMediaGalleryClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiTrash2,
  FiRefreshCw,
  FiImage,
  FiVideo,
  FiMusic,
  FiCheckSquare,
  FiSquare,
  FiAlertTriangle,
  FiHardDrive,
  FiClock,
  FiInfo,
  FiEye,
  FiGrid,
  FiFileText,
  FiCheck,
  FiX,
  FiLayers,
  FiExternalLink,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import {
  useBlogMediaGallery,
  MediaCategory,
  BlogMediaFile,
} from '@/app/hooks/admin/useBlogMediaGallery';
import Button from '@/app/components/Common/Button';
import { MetricCard } from '@/app/components/Admin/Charts/AdminCharts';
import Image from 'next/image';

const CATEGORY_TABS = [
  {
    value: 'all' as const,
    label: 'Todos',
    icon: FiGrid,
    description: 'Todos os arquivos de mídia',
    color: 'text-theme-primary',
  },
  {
    value: 'cover' as const,
    label: 'Capas',
    icon: FiImage,
    description: 'Imagens de capa dos artigos',
    color: 'text-blue-500',
  },
  {
    value: 'content' as const,
    label: 'Conteúdo',
    icon: FiFileText,
    description: 'Imagens e vídeos do conteúdo',
    color: 'text-green-500',
  },
  {
    value: 'audio' as const,
    label: 'Áudios',
    icon: FiMusic,
    description: 'Áudios de fundo dos artigos',
    color: 'text-purple-500',
  },
  {
    value: 'gallery' as const,
    label: 'Galeria',
    icon: FiImage,
    description: 'Mídia da galeria do artigo',
    color: 'text-pink-500',
  },
  {
    value: 'temp' as const,
    label: 'Temporários',
    icon: FiClock,
    description: 'Arquivos temporários não vinculados',
    color: 'text-yellow-500',
  },
];

export default function BlogMediaGalleryClient() {
  const {
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
    getUsageTypeLabel, // 🆕
  } = useBlogMediaGallery();

  const [activeTab, setActiveTab] = useState<MediaCategory>('all');
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [showUsageDetails, setShowUsageDetails] =
    useState<BlogMediaFile | null>(null); // 🆕

  console.log('showUsageDetails', showUsageDetails);
  // Auto-load na primeira montagem
  useEffect(() => {
    loadGallery({ includeTemp: true });
  }, []);

  const handleScan = async () => {
    const options: any = { includeTemp: true };
    if (activeTab !== 'all') {
      options.category = activeTab;
    }
    await loadGallery(options);
  };

  const getFilteredFiles = () => {
    if (!galleryResult) return [];

    if (activeTab === 'all') {
      return galleryResult.files;
    }

    return galleryResult.files.filter((f) => f.category === activeTab);
  };

  const filteredFiles = getFilteredFiles();
  const categoryStats = getCategoryStats();

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return FiVideo;
      case 'AUDIO':
        return FiMusic;
      default:
        return FiImage;
    }
  };

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="text-center py-16">
          <FiAlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Erro ao Carregar Galeria
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
          {/* Header */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8 lg:py-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <FiImage className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Galeria de Mídia do Blog
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Gerencie todas as imagens, vídeos e áudios dos seus artigos
              </p>
            </div>
          </AnimatedItem>

          {/* Tabs */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="flex justify-center mb-8">
              <div className="flex flex-wrap justify-center gap-1 bg-theme-secondary p-1 rounded-xl max-w-5xl">
                {CATEGORY_TABS.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.value;
                  const tabCount = categoryStats[tab.value]?.count || 0;

                  return (
                    <button
                      key={tab.value}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                        isActive
                          ? 'bg-theme-tertiary text-theme-primary shadow-lg'
                          : 'text-theme-secondary hover:bg-theme-primary hover:text-theme-primary'
                      }`}
                      onClick={() => setActiveTab(tab.value)}
                      disabled={isLoading}
                    >
                      <IconComponent
                        className={`w-4 h-4 ${isActive ? tab.color : ''}`}
                      />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tabCount > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-brand-primary text-white'
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

          {/* Controls */}
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-theme-primary mb-2">
                    Arquivos de Mídia
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
                    {
                      CATEGORY_TABS.find((t) => t.value === activeTab)
                        ?.description
                    }
                  </p>
                </div>

                <Button
                  variant="primary"
                  leftIcon={<FiRefreshCw />}
                  onClick={handleScan}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Carregando...' : 'Atualizar'}
                </Button>
              </div>
            </AnimatedCard>
          </AnimatedItem>

          {/* Stats */}
          {galleryResult && (
            <AnimatedItem direction="up" springType="gentle">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
                <MetricCard
                  title={`Arquivos ${activeTab === 'all' ? 'Total' : 'na Seleção'}`}
                  value={filteredFiles.length.toLocaleString()}
                  icon={FiImage}
                  color="#3B82F6"
                />

                <MetricCard
                  title="Espaço Usado"
                  value={
                    categoryStats[activeTab]?.size
                      ? `${(categoryStats[activeTab].size / (1024 * 1024)).toFixed(2)} MB`
                      : '0 MB'
                  }
                  icon={FiHardDrive}
                  color="#10B981"
                />

                <MetricCard
                  title="Selecionados"
                  value={selectedFiles.length.toLocaleString()}
                  change={{
                    value: getFormattedSelectedSize(),
                    isPositive: true,
                  }}
                  icon={FiCheckSquare}
                  color="#8B5CF6"
                />

                <MetricCard
                  title="Temporários"
                  value={galleryResult.stats.temporaryFiles.toLocaleString()}
                  change={{
                    value: `${(galleryResult.stats.temporarySize / (1024 * 1024)).toFixed(2)} MB`,
                    isPositive: false,
                  }}
                  icon={FiClock}
                  color="#F59E0B"
                />

                <MetricCard
                  title="Não Usados"
                  value={galleryResult.stats.unusedFiles.toLocaleString()}
                  change={{
                    value: `${galleryResult.stats.usedFiles} em uso`,
                    isPositive: true,
                  }}
                  icon={FiX}
                  color="#EF4444"
                />

                <MetricCard
                  title="Múltiplo Uso"
                  value={galleryResult.stats.multiUseFiles.toLocaleString()}
                  change={{
                    value: 'Usados em 2+ artigos',
                    isPositive: true,
                  }}
                  icon={FiLayers}
                  color="#8B5CF6"
                />
              </div>
            </AnimatedItem>
          )}

          {/* Files Grid */}
          {galleryResult && (
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-theme-primary">
                    Arquivos ({filteredFiles.length})
                  </h3>

                  {filteredFiles.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (selectedFiles.length === filteredFiles.length) {
                            clearSelection();
                          } else {
                            selectAll();
                          }
                        }}
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
                          onClick={deleteSelectedFiles}
                          disabled={isDeleting}
                          isLoading={isDeleting}
                        >
                          Remover ({selectedFiles.length})
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {filteredFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <FiImage className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-theme-primary mb-2">
                      Nenhum arquivo encontrado
                    </h4>
                    <p className="text-theme-secondary">
                      {activeTab === 'all'
                        ? 'Não há arquivos de mídia no momento.'
                        : `Não há arquivos em ${getCategoryDisplayName(activeTab)}.`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredFiles.map((file) => {
                      const isSelected = selectedFiles.includes(file.url);
                      const FileIcon = getFileIcon(file.type);

                      return (
                        <div
                          key={file.url}
                          className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-brand-primary shadow-theme-glow'
                              : 'border-theme-secondary hover:border-theme-primary'
                          }`}
                          onClick={() => toggleFileSelection(file.url)}
                        >
                          {/* Checkbox */}
                          <div className="absolute top-2 left-2 z-10">
                            {isSelected ? (
                              <FiCheckSquare className="w-5 h-5 text-brand-primary bg-white rounded shadow-md" />
                            ) : (
                              <FiSquare className="w-5 h-5 text-white bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>

                          {/* Preview */}
                          <div className="aspect-square bg-theme-secondary">
                            {file.type === 'IMAGE' ? (
                              <Image
                                src={file.url}
                                alt={file.title || 'Media'}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileIcon className="w-12 h-12 text-theme-tertiary" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-2 bg-theme-elevated">
                            <p className="text-xs font-medium text-theme-primary truncate">
                              {file.title || file.url.split('/').pop()}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-theme-tertiary">
                                {file.formattedSize}
                              </span>
                              <div className="flex items-center space-x-1">
                                {file.isTemporary && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">
                                    Temp
                                  </span>
                                )}
                                {file.isUsed ? (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-800 flex items-center space-x-1">
                                    <FiCheck className="w-3 h-3" />
                                    <span>{file.usageCount}</span>
                                  </span>
                                ) : (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                                    Não usado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<FiEye />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPreview(file.url);
                              }}
                            >
                              Ver
                            </Button>
                            {file.usageCount > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<FiInfo />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowUsageDetails(file);
                                }}
                              >
                                Uso
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </AnimatedCard>
            </AnimatedItem>
          )}
        </AnimatedContainer>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(null)}
        >
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <Image
              src={showPreview}
              alt="Preview"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Usage Details Modal */}
      {showUsageDetails && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowUsageDetails(null)}
        >
          <div
            className="classical-card max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-theme-primary mb-2">
                    Uso do Arquivo
                  </h3>
                  <p className="text-sm text-theme-secondary break-all">
                    {showUsageDetails.url}
                  </p>
                </div>
                <button
                  onClick={() => setShowUsageDetails(null)}
                  className="p-2 hover:bg-theme-secondary rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-theme-tertiary" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-theme-secondary rounded-lg">
                  <p className="text-2xl font-bold text-brand-primary">
                    {showUsageDetails.usageCount}
                  </p>
                  <p className="text-xs text-theme-tertiary mt-1">
                    Artigos usando
                  </p>
                </div>
                <div className="text-center p-4 bg-theme-secondary rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {showUsageDetails.formattedSize}
                  </p>
                  <p className="text-xs text-theme-tertiary mt-1">Tamanho</p>
                </div>
                <div className="text-center p-4 bg-theme-secondary rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {showUsageDetails.type}
                  </p>
                  <p className="text-xs text-theme-tertiary mt-1">Tipo</p>
                </div>
              </div>

              {/* Usage List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-theme-primary">
                  Usado em {showUsageDetails.usageCount} artigo
                  {showUsageDetails.usageCount !== 1 ? 's' : ''}:
                </h4>

                {showUsageDetails.usedIn.map((usage, index) => (
                  <div
                    key={`${usage.articleId}-${index}`}
                    className="p-4 bg-theme-secondary rounded-lg hover:bg-theme-primary transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-theme-primary mb-1">
                          {usage.articleTitle}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 rounded bg-brand-primary/10 text-brand-primary">
                            {getUsageTypeLabel(usage.usageType)}
                          </span>
                          <span className="text-xs text-theme-tertiary">
                            ID: {usage.articleId.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                      <a
                        href={`/blog/${usage.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-theme-tertiary rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiExternalLink className="w-4 h-4 text-brand-primary" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
