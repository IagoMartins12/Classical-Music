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
        const result = await uploadComposerImage(file, composerId);

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

  const nome = composerName || fallbackText;

  return (
    <div className={cx('flex flex-col items-center gap-4', className)}>
      <Abas rotulo="Como enviar o retrato">
        <Aba
          ativa={inputMode === 'upload'}
          onClick={() => handleModeChange('upload')}
        >
          Do aparelho
        </Aba>
        <Aba
          ativa={inputMode === 'url'}
          onClick={() => handleModeChange('url')}
        >
          Por link
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
              {currentImage ? 'Trocar retrato' : 'Escolher arquivo'}
            </Button>
          </div>
          <span className="t-legenda">JPG, PNG, GIF ou WebP, até 5 MB.</span>
        </div>
      ) : (
        <div className="flex w-full max-w-md items-end gap-2">
          <Field
            className="flex-1"
            label="Link da imagem"
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
          <Button onClick={() => handleUrlSubmit()}>Aplicar</Button>
        </div>
      )}

      {currentImage && showRemove && !currentUploading && (
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiX}
          onClick={handleRemove}
        >
          Remover retrato
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
