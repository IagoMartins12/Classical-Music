// app/components/ComposerImageUpload.tsx
'use client';

import React, { useState, useRef } from 'react';
import {
  FiCamera,
  FiLoader,
  FiX,
  FiLink,
  FiUpload,
  FiImage,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface ComposerImageUploadProps {
  currentImage?: string | null;
  onImageUpload?: (file: File) => Promise<void>;
  onImageChange?: (imageUrl: string | null) => void;
  onImageUrlChange?: (imageUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isUploading?: boolean;
  fallbackText?: string;
  showRemove?: boolean;
  composerId?: string;
  composerName?: string;
  className?: string;
}

const ComposerImageUpload: React.FC<ComposerImageUploadProps> = ({
  currentImage,
  onImageUpload,
  onImageChange,
  onImageUrlChange,
  size = 'xl',
  isUploading = false,
  fallbackText = 'Compositor',
  showRemove = true,
  composerId,
  composerName,
  className = '',
}) => {
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validações básicas
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setUploading(true);

    try {
      if (onImageUpload) {
        await onImageUpload(file);
      } else {
        // Upload padrão via API
        const formData = new FormData();
        formData.append('file', file);
        if (composerId) formData.append('composerId', composerId);
        if (composerName) formData.append('composerName', composerName);

        const response = await fetch('/api/uploads/composer-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          onImageChange?.(result.imageUrl);
          onImageUrlChange?.(result.imageUrl);
          toast.success('Imagem carregada com sucesso!');
        } else {
          throw new Error(result.message || 'Erro ao fazer upload');
        }
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao fazer upload da imagem'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error('Digite uma URL válida');
      return;
    }

    // Validar se é uma URL de imagem
    // const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    // const isImageUrl = imageExtensions.some((ext) =>
    //   urlInput.toLowerCase().includes(ext)
    // );

    // if (!isImageUrl) {
    //   toast.error('URL deve ser de uma imagem válida');
    //   return;
    // }

    onImageChange?.(urlInput);
    onImageUrlChange?.(urlInput);
    toast.success('URL da imagem adicionada com sucesso!');
  };

  const handleRemove = () => {
    onImageChange?.(null);
    onImageUrlChange?.('');
    setUrlInput('');
    toast.success('Imagem removida');
  };

  const handleModeChange = (mode: 'upload' | 'url') => {
    setInputMode(mode);
    if (mode === 'upload') {
      setUrlInput('');
    }
  };

  const currentUploading = uploading || isUploading;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Mode Selection */}
      <div className="flex items-center space-x-2 bg-theme-secondary rounded-lg p-1">
        <button
          onClick={(e) => {
            e.preventDefault();
            if (inputMode === 'upload') {
              fileInputRef.current?.click();
            }
            handleModeChange('upload');
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            inputMode === 'upload'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-theme-primary hover:bg-theme-primary hover:text-theme-secondary'
          }`}
        >
          <FiUpload className="w-4 h-4" />
          <span className="text-sm font-medium">Upload</span>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleModeChange('url');
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            inputMode === 'url'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-theme-primary hover:bg-theme-primary hover:text-theme-secondary'
          }`}
        >
          <FiLink className="w-4 h-4" />
          <span className="text-sm font-medium">URL</span>
        </button>
      </div>

      {/* Image Container */}
      <div className="relative">
        <div
          className={`
            ${sizeClasses[size]} 
            relative rounded-2xl overflow-hidden border-2 border-theme-secondary
            bg-gradient-to-br from-theme-secondary to-theme-tertiary
            flex items-center justify-center
            transition-all duration-300
            ${currentUploading ? 'opacity-50' : 'hover:border-brand-primary'}
          `}
        >
          {currentImage ? (
            <Image
              src={currentImage}
              alt={`Retrato de ${composerName || fallbackText}`}
              fill
              className="object-cover"
              sizes={`(max-width: 768px) ${sizeClasses[size]}, ${sizeClasses[size]}`}
              onError={(e) => {
                console.error('Erro ao carregar imagem:', e);
                onImageChange?.(null);
              }}
            />
          ) : (
            <div className="text-center">
              <FiImage
                className={`${iconSizeClasses[size]} text-theme-tertiary mx-auto mb-2`}
              />
            </div>
          )}

          {/* Loading Overlay */}
          {currentUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <FiLoader className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {/* Remove Button */}
          {currentImage && showRemove && !currentUploading && (
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-accent-red text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Remover imagem"
            >
              <FiX className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Upload Button - Only show for upload mode */}
        {inputMode === 'upload' && !currentUploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center hover:bg-brand-secondary transition-colors shadow-lg"
            title="Fazer upload de imagem"
          >
            <FiCamera className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Input based on mode */}
      {inputMode === 'upload' ? (
        /* Upload Mode */
        <div className="text-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              fileInputRef.current?.click();
            }}
            disabled={currentUploading}
            className="flex items-center space-x-2 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiUpload className="w-4 h-4" />
            <span>Selecionar Arquivo</span>
          </button>
          <p className="text-xs text-theme-tertiary mt-2">
            JPG, PNG, GIF ou WebP. Máximo 5MB.
          </p>
        </div>
      ) : (
        /* URL Mode */
        <div className="w-full max-w-md space-y-3">
          <div className="flex space-x-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="flex-1 px-3 py-2 border border-theme-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                handleUrlSubmit();
              }}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
            >
              Aplicar
            </button>
          </div>
          <p className="text-xs text-theme-tertiary text-center">
            Insira a URL completa da imagem
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ComposerImageUpload;
