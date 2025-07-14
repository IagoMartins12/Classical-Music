// app/admin/ads/components/MediaUploadModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiX,
  FiUpload,
  FiImage,
  FiVideo,
  FiTrash2,
  FiCheck,
  FiStar,
} from 'react-icons/fi';

import toast from 'react-hot-toast';
import { useAds } from '@/app/hooks/admin/useAds';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';

interface MediaUploadModalProps {
  ad: any;
  onClose: () => void;
}

export default function MediaUploadModal({
  ad,
  onClose,
}: MediaUploadModalProps) {
  const { uploadMedia } = useAds();
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/ads/media?adId=${ad.id}`);
      const data = await response.json();
      if (data.success) {
        setMediaFiles(data.mediaFiles);
      }
    } catch (error) {
      console.error('Erro ao buscar arquivos de mídia:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const options = {
          isMain: mediaFiles.length === 0, // Primeiro arquivo é main por padrão
          altText: `${ad.title} - ${file.name}`,
          caption: '',
        };

        await uploadMedia(ad.id, file, options);
      }

      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);
      await fetchMediaFiles();
    } catch (error) {
      toast.error('Erro ao fazer upload dos arquivos');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const setAsMain = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/admin/ads/media`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId,
          isMain: true,
        }),
      });

      if (response.ok) {
        toast.success('Mídia principal atualizada');
        await fetchMediaFiles();
      }
    } catch (error) {
      toast.error('Erro ao atualizar mídia principal');
    }
  };

  const deleteMedia = async (mediaId: string) => {
    if (confirm('Tem certeza que deseja deletar este arquivo?')) {
      try {
        const response = await fetch(
          `/api/admin/ads/media?mediaId=${mediaId}`,
          {
            method: 'DELETE',
          }
        );

        if (response.ok) {
          toast.success('Arquivo deletado com sucesso');
          await fetchMediaFiles();
        }
      } catch (error) {
        toast.error('Erro ao deletar arquivo');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return FiVideo;
      case 'IMAGE':
        return FiImage;
      default:
        return FiImage;
    }
  };

  return (
    <Modal isOpen={ad} onClose={onClose} maxWidth="4xl">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-amber to-accent-red rounded-xl flex items-center justify-center">
              <FiImage className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                Gerenciar Mídia
              </h2>
              <p className="text-sm text-theme-tertiary">{ad.title}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <FiX className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver
                ? 'border-brand-primary bg-brand-primary/10'
                : 'border-theme-primary hover:border-brand-primary hover:bg-brand-primary/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <FiUpload className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-primary mb-2">
              Arrastar arquivos aqui ou clique para selecionar
            </h3>
            <p className="text-theme-tertiary mb-4">
              Suporte para imagens (JPG, PNG, GIF, WebP) e vídeos (MP4, WebM,
              OGG)
            </p>
            <p className="text-sm text-theme-tertiary mb-4">
              Tamanho máximo: 50MB por arquivo
            </p>

            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) =>
                e.target.files && handleFileUpload(e.target.files)
              }
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="primary"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
              loading={uploading}
            >
              Selecionar Arquivos
            </Button>
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-theme-secondary">Carregando arquivos...</p>
              </div>
            </div>
          ) : mediaFiles.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-theme-primary mb-4">
                Arquivos de Mídia ({mediaFiles.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaFiles.map((media) => {
                  const MediaIcon = getMediaIcon(media.type);

                  return (
                    <div
                      key={media.id}
                      className={`relative bg-theme-secondary rounded-xl overflow-hidden ${
                        media.isMain ? 'ring-2 ring-brand-primary' : ''
                      }`}
                    >
                      {/* Media Preview */}
                      <div className="aspect-video bg-theme-primary flex items-center justify-center relative">
                        {media.type === 'IMAGE' ? (
                          <img
                            src={media.url}
                            alt={media.altText || media.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : media.type === 'VIDEO' ? (
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            controls={false}
                            muted
                          />
                        ) : (
                          <MediaIcon className="w-12 h-12 text-theme-tertiary" />
                        )}

                        {/* Main Badge */}
                        {media.isMain && (
                          <div className="absolute top-2 left-2 bg-brand-primary text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                            <FiStar className="w-3 h-3" />
                            <span>Principal</span>
                          </div>
                        )}
                      </div>

                      {/* Media Info */}
                      <div className="p-3">
                        <h4 className="font-medium text-theme-primary truncate">
                          {media.originalName}
                        </h4>
                        <p className="text-sm text-theme-tertiary">
                          {formatFileSize(media.fileSize)} • {media.type}
                        </p>

                        {media.altText && (
                          <p className="text-xs text-theme-tertiary mt-1 truncate">
                            {media.altText}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-1">
                            {!media.isMain && (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<FiCheck />}
                                onClick={() => setAsMain(media.id)}
                                className="text-accent-green hover:text-accent-green"
                                title="Definir como principal"
                              />
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiTrash2 />}
                            onClick={() => deleteMedia(media.id)}
                            className="text-accent-red hover:text-accent-red"
                            title="Deletar arquivo"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiImage className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-medium text-theme-primary mb-2">
                Nenhum arquivo de mídia
              </h3>
              <p className="text-theme-tertiary">
                Faça upload de imagens e vídeos para sua publicidade.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
