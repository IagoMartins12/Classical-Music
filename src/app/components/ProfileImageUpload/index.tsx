// app/Common/ProfileImageUpload.tsx (versão atualizada)
'use client';

import { useToast } from '@/app/hooks/useToast';
import { useOnboardingModal } from '@/app/stores/authStore';
import Image from 'next/image';
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
  const { updateData } = useOnboardingModal();
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

  const removeSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const toast = useToast();

  // Sincronizar com a prop currentImage
  useEffect(() => {
    setImagePreview(currentImage || null);
    if (currentImage && typeof updateData === 'function') {
      updateData({ image: currentImage });
    }
  }, [currentImage, updateData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo deve ser uma imagem');
      return;
    }

    try {
      if (onImageUpload) {
        // Upload via API (para perfil)
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
        relative cursor-pointer hover:opacity-90 transition-opacity
      `}
      >
        {imagePreview ? (
          <Image
            src={imagePreview}
            width={100}
            height={100}
            alt="Foto do perfil"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-theme-tertiary">
            {getFallbackContent()}
          </div>
        )}

        {/* Upload Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Upload Overlay Hint */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all opacity-0 hover:opacity-100">
          <FiEdit3 className="text-white text-lg" />
        </div>
      </div>

      {/* Remove Button */}
      {imagePreview && showRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveImage();
          }}
          disabled={isUploading}
          className={`
            absolute -top-2 -right-2 ${removeSizes[size]}
            bg-accent-red rounded-full flex items-center justify-center 
            text-white hover:scale-110 transition-transform shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="Remover foto"
        >
          <FiTrash2 className="w-3 h-3" />
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
