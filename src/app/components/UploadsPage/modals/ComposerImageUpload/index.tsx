// app/components/ComposerImageUpload.tsx
'use client';

import React, { useState, useRef } from 'react';
import { PiSpinnerGap, PiUploadSimple, PiX } from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import Image from '@/app/components/SmartImage';
import { uploadComposerImage } from '@/app/requests/uploads-client';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { cx } from '@/app/components/ui/cx';
import { iniciais } from '@/app/components/blog/site/pecas';
import { useTx } from '@/app/hooks/useTx';

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
  const tx = useTx();
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
      toast.error(
        tx(
          'Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP.',
          'File type not allowed. Use JPG, PNG, GIF or WebP.'
        )
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      toast.error(
        tx(
          'Arquivo muito grande. Máximo 5MB.',
          'File too large. The maximum is 5 MB.'
        )
      );
      return;
    }

    setUploading(true);

    try {
      if (onImageUpload) {
        await onImageUpload(file);
      } else {
        // Upload padrão via API
        const result = await uploadComposerImage(file, composerId);

        if (result.success) {
          onImageChange?.(result.imageUrl);
          onImageUrlChange?.(result.imageUrl);
          toast.success(tx('Imagem carregada com sucesso!', 'Image uploaded.'));
        } else {
          throw new Error(
            result.message || tx('Erro ao fazer upload', 'Upload failed')
          );
        }
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : tx('Erro ao fazer upload da imagem', 'Could not upload the image')
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error(tx('Digite uma URL válida', 'Enter a valid URL'));
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
    toast.success(
      tx('URL da imagem adicionada com sucesso!', 'Image link added.')
    );
  };

  const handleRemove = () => {
    onImageChange?.(null);
    onImageUrlChange?.('');
    setUrlInput('');
    toast.success(tx('Imagem removida', 'Image removed'));
  };

  const handleModeChange = (mode: 'upload' | 'url') => {
    setInputMode(mode);
    if (mode === 'upload') {
      setUrlInput('');
    }
  };

  const currentUploading = uploading || isUploading;

  const nome = composerName || fallbackText;

  return (
    <div className={cx('flex flex-col items-center gap-4', className)}>
      <Abas rotulo={tx('Como enviar o retrato', 'How to send the portrait')}>
        <Aba
          ativa={inputMode === 'upload'}
          onClick={() => handleModeChange('upload')}
        >
          {tx('Do aparelho', 'From the device')}
        </Aba>
        <Aba
          ativa={inputMode === 'url'}
          onClick={() => handleModeChange('url')}
        >
          {tx('Por link', 'By link')}
        </Aba>
      </Abas>

      <div
        className={cx(
          sizeClasses[size],
          'relative grid place-items-center overflow-hidden rounded-card bg-sup-2',
          currentUploading && 'opacity-60'
        )}
      >
        {currentImage ? (
          <Image
            src={currentImage}
            alt={`Retrato de ${nome}`}
            fill
            className="object-cover"
            sizes="192px"
            onError={() => onImageChange?.(null)}
          />
        ) : (
          <span
            aria-hidden="true"
            className="font-display text-[2.5rem] text-ouro-texto"
          >
            {iniciais(nome)}
          </span>
        )}
        {currentUploading && (
          <span className="absolute inset-0 grid place-items-center bg-black/55">
            <PiSpinnerGap
              aria-hidden="true"
              className="h-7 w-7 animate-spin text-white"
            />
          </span>
        )}
      </div>

      {inputMode === 'upload' ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            <Button
              tamanho="p"
              icone={PiUploadSimple}
              carregando={currentUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {currentImage
                ? tx('Trocar retrato', 'Change portrait')
                : tx('Escolher arquivo', 'Choose file')}
            </Button>
          </div>
          <span className="t-legenda">
            {tx(
              'JPG, PNG, GIF ou WebP, até 5 MB.',
              'JPG, PNG, GIF or WebP, up to 5 MB.'
            )}
          </span>
        </div>
      ) : (
        <div className="flex w-full max-w-md items-end gap-2">
          <Field
            className="flex-1"
            label={tx('Link da imagem', 'Image link')}
            type="url"
            inputMode="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUrlSubmit();
              }
            }}
          />
          <Button onClick={() => handleUrlSubmit()}>
            {tx('Aplicar', 'Apply')}
          </Button>
        </div>
      )}

      {currentImage && showRemove && !currentUploading && (
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiX}
          onClick={handleRemove}
        >
          {tx('Remover retrato', 'Remove portrait')}
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="sr-only"
        tabIndex={-1}
      />
    </div>
  );
};

export default ComposerImageUpload;
