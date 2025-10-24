// components/blog/editor/modals/ImageModal.tsx - CORRIGIDO
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { FiUpload } from 'react-icons/fi';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';

interface ImageModalProps {
  editor: Editor;
  onClose: () => void;
  articleId?: string;
  sessionId?: string;
}

export function ImageModal({
  editor,
  onClose,
  articleId,
  sessionId,
}: ImageModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [alignment, setAlignment] = useState('center');

  const alignmentOptions = [
    { value: 'left', label: 'Esquerda' },
    { value: 'center', label: 'Centro' },
    { value: 'right', label: 'Direita' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'content');

      if (articleId) {
        formData.append('articleId', articleId);
      } else if (sessionId) {
        formData.append('sessionId', sessionId);
      }

      const response = await fetch('/api/blog/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUrl(data.url);
      } else {
        alert('Erro ao fazer upload: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  // ✅ CORRIGIDO: Adicionar stopPropagation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ IMPEDE QUE O FORM PAI SEJA SUBMETIDO

    if (url) {
      const attrs: any = {
        src: url,
        alt,
        title: caption,
      };

      if (width) attrs.width = width;
      if (height) attrs.height = height;

      if (alignment === 'left') {
        attrs.style = 'float: left; margin-right: 1rem;';
      } else if (alignment === 'right') {
        attrs.style = 'float: right; margin-left: 1rem;';
      } else {
        attrs.style = 'display: block; margin: 0 auto;';
      }

      editor.chain().focus().setImage(attrs).run();
      onClose();
    }
  };

  const handleTabChange = (tab: 'upload' | 'link') => {
    setActiveTab(tab);
    setUrl('');
    setImageError(false);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Inserir Imagem" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TABS */}
        <div className="flex ">
          <button
            type="button" // ✅ IMPORTANTE: type="button" para não submeter
            onClick={() => handleTabChange('upload')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'border-b-2 border-brand-primary text-brand-primary'
                : 'text-theme-tertiary hover:text-theme-primary'
            }`}
          >
            📤 Fazer Upload
          </button>
          <button
            type="button" // ✅ IMPORTANTE: type="button" para não submeter
            onClick={() => handleTabChange('link')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'link'
                ? 'border-b-2 border-brand-primary text-brand-primary'
                : 'text-theme-tertiary hover:text-theme-primary'
            }`}
          >
            🔗 Link Externo
          </button>
        </div>

        {/* ABA - UPLOAD */}
        {activeTab === 'upload' && (
          <>
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Selecionar Arquivo
              </label>
              <div className="border-2 border-dashed border-theme-secondary rounded-lg p-4 text-center hover:border-brand-primary transition-colors">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />

                {url && !uploading ? (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Preview"
                      className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block cursor-pointer text-sm text-brand-primary hover:text-brand-secondary underline"
                    >
                      Alterar imagem
                    </label>
                  </div>
                ) : (
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <FiUpload className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                    <span className="text-sm text-theme-secondary">
                      {uploading ? 'Enviando...' : 'Clique para fazer upload'}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {url && (
              <Input
                label="Caminho da Imagem"
                type="text"
                value={url}
                onChange={() => {}}
                readOnly={true}
                disabled={true}
                widhtFull
              />
            )}
          </>
        )}

        {/* ABA - LINK */}
        {activeTab === 'link' && (
          <>
            {url && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Preview
                </label>
                <div className="border-2 border-theme-secondary rounded-lg p-4 text-center bg-gray-50">
                  {!imageError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt="Preview"
                      className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <p className="text-sm text-red-500">
                      ❌ Não foi possível carregar a imagem
                    </p>
                  )}
                </div>
              </div>
            )}

            <Input
              label="URL da Imagem"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setImageError(false);
              }}
              placeholder="https://exemplo.com/imagem.jpg"
              required
              widhtFull
            />
          </>
        )}

        {/* Dimensões */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Largura (opcional)"
            type="text"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="Ex: 500px ou 100%"
            widhtFull
          />
          <Input
            label="Altura (opcional)"
            type="text"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Ex: 300px ou auto"
            widhtFull
          />
        </div>

        {/* Alinhamento */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Alinhamento
          </label>
          <Select
            options={alignmentOptions}
            value={alignment}
            onChange={(e) => setAlignment(e.target.value)}
          />
        </div>

        <Input
          label="Texto Alternativo (ALT)"
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Descrição da imagem"
          widhtFull
        />

        <Input
          label="Legenda"
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Legenda da imagem (opcional)"
          widhtFull
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button" // ✅ IMPORTANTE: type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit" // ✅ Este é o único que deve ser type="submit"
            variant="primary"
            disabled={!url}
          >
            Inserir
          </Button>
        </div>
      </form>
    </Modal>
  );
}
