// app/Common/ProfileImageUpload.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FiCamera, FiEdit3, FiTrash2 } from 'react-icons/fi';

interface ProfileImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  onImageUpload?: (file: File) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  showRemove?: boolean;
  isUploading?: boolean;
  fallbackText?: string;
  className?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImage,
  onImageChange,
  onImageUpload,
  size = 'md',
  showRemove = true,
  isUploading = false,
  fallbackText,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    currentImage || null
  );

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  const buttonSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const removeSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  useEffect(() => {
    setImagePreview(currentImage || null);
  }, [currentImage]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem deve ter no máximo 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Arquivo deve ser uma imagem');
      return;
    }

    try {
      if (onImageUpload) {
        // Upload via API
        await onImageUpload(file);
      } else {
        // Preview local (para onboarding)
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImagePreview(result);
          onImageChange(result);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const getFallbackContent = () => {
    if (fallbackText && fallbackText.length >= 2) {
      return (
        <div className="text-2xl font-bold text-theme-inverse">
          {fallbackText
            .split(' ')
            .map((word) => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
      );
    }

    return <FiCamera className={iconSizes[size]} />;
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main Image Container */}
      <div
        onClick={triggerImageUpload}
        className={`
        ${sizeClasses[size]} 
        rounded-full overflow-hidden border-4 border-theme-secondary 
        ${
          !imagePreview && fallbackText
            ? 'bg-brand-gradient'
            : 'bg-theme-secondary'
        }
        relative
      `}
      >
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Foto do perfil"
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-theme-tertiary">
            <FiCamera className="w-8 h-8" />
          </div>
        )}

        {/* Upload Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex bg- items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Edit Button */}
      {/* <button
        onClick={triggerImageUpload}
        disabled={isUploading}
        className={`
          absolute bottom-0 right-0 shadow-2xl ${buttonSizes[size]}
          bg-brand-primary rounded-full flex items-center justify-center 
          text-theme-inverse shadow-lg hover:scale-110 transition-transform
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={imagePreview ? 'Alterar foto' : 'Adicionar foto'}
      >
        {isUploading ? (
          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <FiEdit3 className="w-3 h-3 text-theme-primary" />
        )}
      </button> */}

      {/* Remove Button */}
      {imagePreview && showRemove && (
        <button
          onClick={handleRemoveImage}
          disabled={isUploading}
          className={`
            absolute top-0 right-0 ${removeSizes[size]}
            bg-accent-red rounded-full flex items-center justify-center 
            text-white hover:scale-110 transition-transform
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="Remover foto"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default ProfileImageUpload;
