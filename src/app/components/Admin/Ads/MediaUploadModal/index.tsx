// app/admin/ads/components/MediaUploadModal.tsx - Modal com preview corrigido
'use client';

import { useState, useRef, useCallback } from 'react';
import {
  PiCheck,
  PiDeviceMobile,
  PiDeviceTablet,
  PiEye,
  PiGear,
  PiImage,
  PiInfo,
  PiMonitor,
  PiTrash,
  PiUploadSimple,
  PiVideoCamera,
  PiWarning,
  PiX,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import {
  AD_DIMENSIONS,
  validateMediaDimensions,
} from '@/app/libs/ads/mediaUtils';
import ImageNext from 'next/image';
import { removeAdMedia, uploadAdMedia } from '@/app/requests/admin/ads';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

interface MediaUploadModalProps {
  ad: any;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FilePreview {
  file: File;
  type: 'image' | 'video';
  url: string;
  dimensions?: { width: number; height: number };
  validation?: {
    isValid: boolean;
    message?: string;
    suggestedDimensions?: any;
  };
}

export default function MediaUploadModal({
  ad,
  onClose,
  onSuccess,
}: MediaUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'upload'>('current');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const placementDimensions =
    AD_DIMENSIONS[ad.placement as keyof typeof AD_DIMENSIONS];

  // 🆕 Função corrigida para criar preview
  const createPreviewUrl = useCallback((file: File): string => {
    try {
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('❌ Erro ao criar preview URL:', error);
      throw error;
    }
  }, []);

  // 🆕 Função corrigida para obter dimensões de imagem
  const getImageDimensions = useCallback(
    (file: File): Promise<{ width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = createPreviewUrl(file);

        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          URL.revokeObjectURL(url); // Limpar URL após obter dimensões
        };

        img.onerror = () => {
          reject(new Error('Falha ao carregar imagem para obter dimensões'));
          URL.revokeObjectURL(url);
        };

        img.src = url;
      });
    },
    [createPreviewUrl]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file) return;

      // Validar tipo
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast.error('Apenas imagens e vídeos são permitidos');
        return;
      }

      const type = isImage ? 'image' : 'video';
      setUploadType(type);

      // 🆕 Criar preview imediatamente
      let previewUrl: string;
      try {
        previewUrl = createPreviewUrl(file);
      } catch {
        toast.error('Erro ao criar preview do arquivo');
        return;
      }

      // Criar objeto base do preview
      const preview: FilePreview = {
        file,
        type,
        url: previewUrl,
      };

      // 🆕 Definir preview imediatamente (para mostrar na tela)
      setFilePreview(preview);

      // Para imagens, obter dimensões e validar em background
      if (isImage) {
        try {
          console.log('🖼️ Obtendo dimensões da imagem...');
          const dimensions = await getImageDimensions(file);

          console.log(
            `📐 Dimensões obtidas: ${dimensions.width}x${dimensions.height}`
          );

          const validation = validateMediaDimensions(
            dimensions.width,
            dimensions.height,
            ad.placement as keyof typeof AD_DIMENSIONS
          );

          // 🆕 Atualizar preview com dimensões e validação
          setFilePreview((prev) => {
            if (prev && prev.file === file) {
              return {
                ...prev,
                dimensions,
                validation,
              };
            }
            return prev;
          });

          console.log('✅ Validação de imagem concluída');
        } catch (error) {
          console.error('❌ Erro ao obter dimensões:', error);

          // 🆕 Atualizar preview com erro, mas manter o preview visível
          setFilePreview((prev) => {
            if (prev && prev.file === file) {
              return {
                ...prev,
                validation: {
                  isValid: false,
                  message: 'Não foi possível validar as dimensões da imagem',
                },
              };
            }
            return prev;
          });
        }
      } else {
        console.log('🎥 Arquivo de vídeo selecionado - preview criado');
      }
    },
    [ad.placement, createPreviewUrl, getImageDimensions]
  );

  const uploadFile = async () => {
    if (!filePreview) return;

    setUploading(true);

    try {
      // Imagem e vídeo pelo mesmo caminho: o arquivo sobe por `/uploads/file`
      // e é ligado ao anúncio. O vídeo ia à rota do legado por um engano —
      // a API o aceita desde sempre (ver `uploadAdMedia`).
      await uploadAdMedia(ad.id, filePreview.file, uploadType);

      toast.success('✅ Mídia processada com sucesso!');

      // As "dicas de qualidade" que apareciam aqui vinham da rota do legado,
      // que analisava o arquivo no servidor do Next. A API não devolve isso, e
      // o aviso saiu junto com a rota.

      // 🆕 Limpar preview corretamente
      clearPreview();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeMedia = async (type: 'image' | 'video') => {
    if (!confirm('Tem certeza que deseja remover esta mídia?')) return;

    try {
      await removeAdMedia(ad.id, type);

      toast.success('Mídia removida com sucesso!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover mídia');
    }
  };

  // 🆕 Função corrigida para limpar preview
  const clearPreview = useCallback(() => {
    if (filePreview?.url) {
      try {
        URL.revokeObjectURL(filePreview.url);
        console.log('🧹 Preview URL limpa');
      } catch (error) {
        console.warn('⚠️ Erro ao limpar preview URL:', error);
      }
    }
    setFilePreview(null);

    // Limpar input file também
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [filePreview]);

  // 🆕 Cleanup ao desmontar componente
  const handleModalClose = useCallback(() => {
    clearPreview();
    onClose();
  }, [clearPreview, onClose]);

  const qualityOptions = [
    {
      value: 'high',
      label: 'Alta',
      description: 'Melhor qualidade, arquivos maiores',
    },
    {
      value: 'medium',
      label: 'Média',
      description: 'Boa qualidade, tamanho balanceado',
    },
    {
      value: 'low',
      label: 'Baixa',
      description: 'Menor qualidade, arquivos menores',
    },
  ] as const;

  return (
    <Modal
      isOpen={!!ad}
      onClose={handleModalClose}
      maxWidth="4xl"
      confirmOnClose
      withouVerification
    >
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <Inline gap={3}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
              <PiUploadSimple className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary">
                Gerenciar Mídia
              </h2>
              <Text papel="rotulo" tom="fraco" as="p">
                {ad.title}
              </Text>
            </div>
          </Inline>

          {/* Tabs */}
          <div className="flex bg-theme-secondary rounded-lg p-1">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'current' ? 'text-white' : 'text-theme-secondary'
              }`}
            >
              <PiEye className="w-4 h-4 inline mr-2" />
              Atual
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upload' ? 'text-white' : 'text-theme-secondary'
              }`}
            >
              <PiUploadSimple className="w-4 h-4 inline mr-2" />
              Upload
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'current' && (
            <Stack gap={6}>
              {/* Info sobre dimensões ideais */}
              <Card densidade="compacta" className="border">
                <h3 className="font-semibold text-theme-primary mb-3 flex items-center">
                  <PiGear className="w-5 h-5 mr-2" />
                  Dimensões para {ad.placement}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <PiMonitor className="w-6 h-6" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-theme-primary">
                        Desktop
                      </div>
                      <div className="text-theme-tertiary">
                        {placementDimensions.desktop.width}×
                        {placementDimensions.desktop.height}
                      </div>
                      <Text papel="legenda" tom="fraco" as="div">
                        {placementDimensions.desktop.aspectRatio}
                      </Text>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <PiDeviceTablet className="w-6 h-6" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-theme-primary">
                        Tablet
                      </div>
                      <div className="text-theme-tertiary">
                        {placementDimensions.tablet.width}×
                        {placementDimensions.tablet.height}
                      </div>
                      <Text papel="legenda" tom="fraco" as="div">
                        {placementDimensions.tablet.aspectRatio}
                      </Text>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <PiDeviceMobile className="w-6 h-6" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-theme-primary">
                        Mobile
                      </div>
                      <div className="text-theme-tertiary">
                        {placementDimensions.mobile.width}×
                        {placementDimensions.mobile.height}
                      </div>
                      <Text papel="legenda" tom="fraco" as="div">
                        {placementDimensions.mobile.aspectRatio}
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Status atual da mídia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Imagem atual */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <Inline
                      as="h3"
                      gap={2}
                      className="font-semibold text-theme-primary"
                    >
                      <PiImage className="w-5 h-5" />
                      <span>Imagem</span>
                    </Inline>
                    {(ad.imageUrl || ad.imageVersions) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<PiTrash />}
                        onClick={() => removeMedia('image')}
                        className=""
                      >
                        Remover
                      </Button>
                    )}
                  </div>

                  {ad.imageUrl || ad.imageVersions ? (
                    <Stack gap={3}>
                      <div className="relative overflow-hidden rounded-lg aspect-video bg-theme-secondary">
                        <ImageNext
                          width={50}
                          height={50}
                          src={
                            ad.imageUrl ||
                            ad.imageVersions?.desktop ||
                            ad.imageVersions?.original
                          }
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <Inline gap={2} className="">
                          <PiCheck className="w-4 h-4" />
                          <span>Imagem configurada</span>
                        </Inline>

                        {ad.imageVersions && (
                          <div className="text-theme-tertiary">
                            Versões responsivas: ✓
                          </div>
                        )}
                      </div>

                      {ad.mediaMetadata?.originalDimensions && (
                        <Text papel="legenda" tom="fraco" as="div">
                          Original: {ad.mediaMetadata.originalDimensions.width}×
                          {ad.mediaMetadata.originalDimensions.height}
                        </Text>
                      )}
                    </Stack>
                  ) : (
                    <div className="aspect-video border-2 border-dashed border-theme-primary rounded-lg flex items-center justify-center">
                      <div className="text-center text-theme-tertiary">
                        <PiImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma imagem</p>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Vídeo atual */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <Inline
                      as="h3"
                      gap={2}
                      className="font-semibold text-theme-primary"
                    >
                      <PiVideoCamera className="w-5 h-5" />
                      <span>Vídeo</span>
                    </Inline>
                    {(ad.videoUrl || ad.videoVersions) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<PiTrash />}
                        onClick={() => removeMedia('video')}
                        className=""
                      >
                        Remover
                      </Button>
                    )}
                  </div>

                  {ad.videoUrl || ad.videoVersions ? (
                    <Stack gap={3}>
                      <div className="relative overflow-hidden rounded-lg aspect-video bg-theme-secondary">
                        <video
                          src={
                            ad.videoUrl ||
                            ad.videoVersions?.desktop ||
                            ad.videoVersions?.original
                          }
                          className="w-full h-full object-cover"
                          controls
                          poster={ad.thumbnailUrl}
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <Inline gap={2} className="">
                          <PiCheck className="w-4 h-4" />
                          <span>Vídeo configurado</span>
                        </Inline>

                        {ad.videoVersions && (
                          <div className="text-theme-tertiary">
                            Versões responsivas: ✓
                          </div>
                        )}
                      </div>
                    </Stack>
                  ) : (
                    <div className="aspect-video border-2 border-dashed border-theme-primary rounded-lg flex items-center justify-center">
                      <div className="text-center text-theme-tertiary">
                        <PiVideoCamera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum vídeo</p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </Stack>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Controles de upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo de mídia */}
                <Stack gap={3}>
                  <label className="block text-sm font-medium text-theme-primary">
                    Tipo de Mídia
                  </label>
                  <div className="flex space-x-4">
                    <Inline as="label" gap={3} className="cursor-pointer">
                      <input
                        type="radio"
                        value="image"
                        checked={uploadType === 'image'}
                        onChange={(e) =>
                          setUploadType(e.target.value as 'image' | 'video')
                        }
                        className="text-ouro-texto"
                      />
                      <PiImage className="w-5 h-5" />
                      <span className="text-theme-primary font-medium">
                        Imagem
                      </span>
                    </Inline>

                    <Inline as="label" gap={3} className="cursor-pointer">
                      <input
                        type="radio"
                        value="video"
                        checked={uploadType === 'video'}
                        onChange={(e) =>
                          setUploadType(e.target.value as 'image' | 'video')
                        }
                        className="text-ouro-texto"
                      />
                      <PiVideoCamera className="w-5 h-5" />
                      <span className="text-theme-primary font-medium">
                        Vídeo
                      </span>
                    </Inline>
                  </div>
                </Stack>

                {/* Qualidade */}
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-3">
                    Qualidade de Processamento
                  </label>
                  <select
                    value={quality}
                    onChange={(e) =>
                      setQuality(e.target.value as 'high' | 'medium' | 'low')
                    }
                    className="input-classical-2 w-full"
                  >
                    {qualityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 🆕 Preview do arquivo selecionado - CORRIGIDO */}
              {filePreview && (
                <Card densidade="compacta" className="border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-theme-primary">Preview</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearPreview}
                      leftIcon={<PiX />}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Preview da mídia */}
                    <div className="md:col-span-2">
                      <div className="aspect-video bg-theme-secondary rounded-lg overflow-hidden">
                        {filePreview.type === 'image' ? (
                          <ImageNext
                            width={400}
                            height={300}
                            src={filePreview.url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={filePreview.url}
                            className="w-full h-full object-cover"
                            controls
                            preload="metadata"
                          />
                        )}
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="space-y-3">
                      <div>
                        <Text
                          papel="rotulo"
                          tom="forte"
                          as="div"
                          className="font-medium"
                        >
                          Arquivo
                        </Text>
                        <Text papel="legenda" tom="fraco" as="div">
                          {filePreview.file.name}
                        </Text>
                        <Text papel="legenda" tom="fraco" as="div">
                          {(filePreview.file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </div>

                      {filePreview.dimensions && (
                        <div>
                          <Text
                            papel="rotulo"
                            tom="forte"
                            as="div"
                            className="font-medium"
                          >
                            Dimensões
                          </Text>
                          <Text papel="legenda" tom="fraco" as="div">
                            {filePreview.dimensions.width}×
                            {filePreview.dimensions.height}
                          </Text>
                        </div>
                      )}

                      {filePreview.validation && (
                        <div
                          className={`p-2 rounded text-xs ${
                            filePreview.validation.isValid ? '' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {filePreview.validation.isValid ? (
                              <PiCheck className="w-3 h-3" />
                            ) : (
                              <PiWarning className="w-3 h-3" />
                            )}
                            <span className="font-medium">
                              {filePreview.validation.isValid
                                ? 'Dimensões ideais'
                                : 'Atenção'}
                            </span>
                          </div>
                          {filePreview.validation.message && (
                            <div>{filePreview.validation.message}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Drop zone */}
              <div
                className={`
                  border-2 border-dashed rounded-2xl p-8 text-center transition-all
                  ${dragActive ? '' : 'border-theme-primary'}
                  ${
                    uploading
                      ? 'opacity-50 pointer-events-none'
                      : 'cursor-pointer'
                  }
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={uploadType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileInputChange}
                  disabled={uploading}
                />

                {uploading ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div>
                      <p className="text-theme-primary font-medium text-lg">
                        Processando...
                      </p>
                      <Text papel="rotulo" tom="suave" as="p">
                        Criando versões otimizadas para diferentes dispositivos
                      </Text>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto">
                      {uploadType === 'image' ? (
                        <PiImage className="w-10 h-10 text-ouro-texto" />
                      ) : (
                        <PiVideoCamera className="w-10 h-10 text-ouro-texto" />
                      )}
                    </div>

                    <div>
                      <p className="text-xl font-medium text-theme-primary mb-2">
                        Arraste e solte{' '}
                        {uploadType === 'image' ? 'uma imagem' : 'um vídeo'}{' '}
                        aqui
                      </p>
                      <p className="text-theme-secondary mb-4">
                        ou clique para selecionar do seu computador
                      </p>
                    </div>

                    <Text
                      papel="rotulo"
                      tom="fraco"
                      as="div"
                      className="space-y-1"
                    >
                      {uploadType === 'image' ? (
                        <>
                          <p>
                            <strong>Formatos:</strong> JPG, PNG, WebP
                          </p>
                          <p>
                            <strong>Tamanho:</strong> Até 10MB
                          </p>
                          <p>
                            <strong>Recomendado:</strong>{' '}
                            {placementDimensions.desktop.aspectRatio}
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            <strong>Formatos:</strong> MP4, WebM, OGG
                          </p>
                          <p>
                            <strong>Tamanho:</strong> Até 500MB
                          </p>
                          <p>
                            <strong>Duração:</strong> Até 60 segundos
                          </p>
                        </>
                      )}
                    </Text>
                  </div>
                )}
              </div>

              {/* Info sobre processamento */}
              <Card densidade="compacta" className="">
                <div className="flex items-start space-x-3">
                  <PiInfo className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <Stack gap={2}>
                    <h4 className="font-medium text-theme-primary">
                      🚀 Processamento Inteligente
                    </h4>
                    <ul className="text-sm text-theme-secondary space-y-1">
                      <li>
                        • 📁 Arquivos salvos em pasta exclusiva do anúncio
                      </li>
                      <li>
                        • Criamos versões otimizadas para desktop, tablet e
                        mobile
                      </li>
                      <li>
                        • Recorte automático mantendo as proporções ideais
                      </li>
                      <li>• Compressão inteligente para carregamento rápido</li>
                      <li>• Formato WebP para imagens (melhor compressão)</li>
                      <li>• Thumbnails automáticos para vídeos</li>
                    </ul>
                  </Stack>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-theme-primary">
          <Text papel="rotulo" tom="fraco" as="div">
            {uploadType === 'image'
              ? 'Imagens são processadas em formato WebP para melhor performance'
              : 'Vídeos são otimizados em MP4 com diferentes qualidades'}
          </Text>

          <div className="flex space-x-3">
            <Button
              variant="ghost"
              onClick={handleModalClose}
              disabled={uploading}
            >
              Fechar
            </Button>

            {filePreview && activeTab === 'upload' && (
              <Button
                variant="primary"
                onClick={uploadFile}
                disabled={uploading}
                isLoading={uploading}
                leftIcon={<PiUploadSimple />}
              >
                {uploading ? 'Processando...' : 'Fazer Upload'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
