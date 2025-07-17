// app/admin/ads/components/MediaUploadModal.tsx
'use client';

import { useState, useRef } from 'react';
import {
  FiUpload,
  FiImage,
  FiVideo,
  FiTrash2,
  FiX,
  FiCheck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';

interface MediaUploadModalProps {
  ad: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MediaUploadModal({
  ad,
  onClose,
  onSuccess,
}: MediaUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validar tipo
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Apenas imagens e vídeos são permitidos');
      return;
    }

    if (isImage) {
      setUploadType('image');
    } else if (isVideo) {
      setUploadType('video');
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);

      const response = await fetch(`/api/admin/ads/${ad.id}/media`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no upload');
      }

      toast.success('Mídia enviada com sucesso!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

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
      const response = await fetch(
        `/api/admin/ads/${ad.id}/media?type=${type}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao remover mídia');
      }

      toast.success('Mídia removida com sucesso!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover mídia');
    }
  };

  return (
    <Modal isOpen={!!ad} onClose={onClose} maxWidth="2xl">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
              <FiUpload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                Mídia do Anúncio
              </h2>
              <p className="text-sm text-theme-tertiary">{ad.title}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status atual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Imagem atual */}
            <div className="classical-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-theme-primary flex items-center space-x-2">
                  <FiImage className="w-4 h-4" />
                  <span>Imagem</span>
                </h3>
                {ad.imageUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<FiTrash2 />}
                    onClick={() => removeMedia('image')}
                    className="text-accent-red hover:text-accent-red"
                  >
                    Remover
                  </Button>
                )}
              </div>

              {ad.imageUrl ? (
                <div className="space-y-2">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="flex items-center space-x-2 text-sm text-accent-green">
                    <FiCheck className="w-4 h-4" />
                    <span>Imagem carregada</span>
                  </div>
                </div>
              ) : (
                <div className="h-32 border-2 border-dashed border-theme-primary rounded-lg flex items-center justify-center">
                  <div className="text-center text-theme-tertiary">
                    <FiImage className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Nenhuma imagem</p>
                  </div>
                </div>
              )}
            </div>

            {/* Vídeo atual */}
            <div className="classical-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-theme-primary flex items-center space-x-2">
                  <FiVideo className="w-4 h-4" />
                  <span>Vídeo</span>
                </h3>
                {ad.videoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<FiTrash2 />}
                    onClick={() => removeMedia('video')}
                    className="text-accent-red hover:text-accent-red"
                  >
                    Remover
                  </Button>
                )}
              </div>

              {ad.videoUrl ? (
                <div className="space-y-2">
                  <video
                    src={ad.videoUrl}
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                  <div className="flex items-center space-x-2 text-sm text-accent-green">
                    <FiCheck className="w-4 h-4" />
                    <span>Vídeo carregado</span>
                  </div>
                </div>
              ) : (
                <div className="h-32 border-2 border-dashed border-theme-primary rounded-lg flex items-center justify-center">
                  <div className="text-center text-theme-tertiary">
                    <FiVideo className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Nenhum vídeo</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload area */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary">
              Fazer Upload
            </h3>

            {/* Tipo de mídia */}
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="image"
                  checked={uploadType === 'image'}
                  onChange={(e) =>
                    setUploadType(e.target.value as 'image' | 'video')
                  }
                  className="text-brand-primary"
                />
                <span className="text-theme-primary">Imagem</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="video"
                  checked={uploadType === 'video'}
                  onChange={(e) =>
                    setUploadType(e.target.value as 'image' | 'video')
                  }
                  className="text-brand-primary"
                />
                <span className="text-theme-primary">Vídeo</span>
              </label>
            </div>

            {/* Drop zone */}
            <div
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all
                ${
                  dragActive
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-theme-primary hover:border-brand-primary/50'
                }
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
                  <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-theme-primary font-medium">Enviando...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto">
                    {uploadType === 'image' ? (
                      <FiImage className="w-8 h-8 text-brand-primary" />
                    ) : (
                      <FiVideo className="w-8 h-8 text-brand-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-theme-primary">
                      Arraste e solte{' '}
                      {uploadType === 'image' ? 'uma imagem' : 'um vídeo'} aqui
                    </p>
                    <p className="text-theme-secondary">
                      ou clique para selecionar
                    </p>
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    {uploadType === 'image' ? (
                      <>
                        <p>Formatos: JPG, PNG, WebP</p>
                        <p>Tamanho máximo: 5MB</p>
                      </>
                    ) : (
                      <>
                        <p>Formatos: MP4, WebM, OGG</p>
                        <p>Tamanho máximo: 50MB</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info sobre o anúncio */}
          <div className="classical-card p-4 bg-accent-blue/5">
            <h4 className="font-medium text-theme-primary mb-2">💡 Dicas</h4>
            <ul className="text-sm text-theme-secondary space-y-1">
              <li>• Use imagens de alta qualidade e com boa resolução</li>
              <li>• Mantenha o texto claro e legível</li>
              <li>• Para vídeos, os primeiros segundos são cruciais</li>
              <li>• Teste em diferentes dispositivos</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-theme-primary">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
