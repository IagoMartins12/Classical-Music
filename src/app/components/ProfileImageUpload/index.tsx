'use client';

import { useToast } from '@/app/hooks/useToast';
import { useOnboardingModal } from '@/app/stores/authStore';
import Image from '@/app/components/SmartImage';
import React, { useRef, useState, useEffect } from 'react';
import { PiCamera, PiPencilLine, PiSpinnerGap, PiTrash } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { iniciais } from '@/app/components/blog/site/pecas';
import { porIdioma } from '@/app/utils/porIdioma';
import { useTx } from '@/app/hooks/useTx';

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
  const tx = useTx();
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

  // Same as the navbar avatar: Garamond initials in gold.
  const initialsSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
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
      toast.error(
        porIdioma('A imagem pode ter até 5 MB', 'The image can be up to 5 MB')
      );
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error(
        tx('Arquivo deve ser uma imagem', 'The file must be an image')
      );
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
    if (fallbackText?.trim()) {
      return (
        <span
          aria-hidden="true"
          className={cx('font-display text-ouro-texto', initialsSizes[size])}
        >
          {iniciais(fallbackText)}
        </span>
      );
    }

    return <PiCamera aria-hidden="true" className={iconSizes[size]} />;
  };

  return (
    <div className={cx('relative inline-block', className)}>
      <button
        type="button"
        onClick={triggerImageUpload}
        disabled={isUploading}
        aria-label={tx('Trocar foto do perfil', 'Change profile photo')}
        className={cx(
          'group relative block overflow-hidden rounded-full bg-sup-2 shadow-[inset_0_0_0_2px_var(--linha)] transition-shadow hover:shadow-[inset_0_0_0_2px_var(--ouro)]',
          sizeClasses[size]
        )}
      >
        {imagePreview ? (
          <Image
            src={imagePreview}
            width={100}
            height={100}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-texto-fraco">
            {getFallbackContent()}
          </span>
        )}

        {isUploading ? (
          <span
            role="status"
            className="absolute inset-0 flex items-center justify-center bg-[var(--bg-overlay)]"
          >
            <Icon
              de={PiSpinnerGap}
              tamanho="m"
              className="animate-spin text-texto"
            />
            <span className="sr-only">{tx('Enviando', 'Uploading')}</span>
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-[var(--bg-overlay)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <Icon de={PiPencilLine} tamanho="p" className="text-texto" />
          </span>
        )}
      </button>

      {imagePreview && showRemove && (
        <button
          type="button"
          onClick={handleRemoveImage}
          disabled={isUploading}
          aria-label={tx('Remover foto', 'Remove photo')}
          title={tx('Remover foto', 'Remove photo')}
          className={cx(
            'absolute -right-1 -top-1 grid place-items-center rounded-full bg-sup-2 text-erro shadow-[var(--sombra-1)] transition-transform hover:scale-110 disabled:opacity-50',
            removeSizes[size]
          )}
        >
          <Icon de={PiTrash} tamanho="pp" />
        </button>
      )}

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
