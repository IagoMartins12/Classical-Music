// ============================================
// QuoteMusicalModal.tsx - COM UPLOAD/YOUTUBE
// ============================================
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { FiUpload } from 'react-icons/fi';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Button from '@/app/components/Common/Button';
import Checkbox from '@/app/components/Common/Checkbox';

interface QuoteMusicalModalProps {
  editor: Editor;
  onClose: () => void;
  articleId?: string;
  sessionId?: string;
}

export function QuoteMusicalModal({
  editor,
  onClose,
  articleId,
  sessionId,
}: QuoteMusicalModalProps) {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');

  // Áudio de fundo
  const [enableAudio, setEnableAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'youtube'>('upload');
  const [audioUrl, setAudioUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [audioVolume, setAudioVolume] = useState(30); // 0-100

  // Upload de arquivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      alert('Formato inválido. Use MP3, WAV ou OGG.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'audio');

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
        setAudioUrl(data.url);
      } else {
        alert('Erro ao fazer upload: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do áudio');
    } finally {
      setUploading(false);
    }
  };

  // Extrair ID do YouTube
  const extractYouTubeId = (url: string) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  // Trocar de aba
  const handleTabChange = (tab: 'upload' | 'youtube') => {
    setActiveTab(tab);
    setAudioUrl('');
    setYoutubeUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!quote || !author) {
      alert('Preencha a citação e o autor');
      return;
    }

    let finalAudioUrl = null;
    let audioType = null;

    if (enableAudio) {
      if (activeTab === 'upload') {
        if (!audioUrl) {
          alert(
            'Faça upload de um áudio ou desmarque "Adicionar música de fundo"'
          );
          return;
        }
        finalAudioUrl = audioUrl;
        audioType = 'upload';
      } else {
        if (!youtubeUrl) {
          alert(
            'Insira o link do YouTube ou desmarque "Adicionar música de fundo"'
          );
          return;
        }
        const youtubeId = extractYouTubeId(youtubeUrl);
        if (!youtubeId) {
          alert('Link do YouTube inválido');
          return;
        }
        finalAudioUrl = `https://www.youtube.com/embed/${youtubeId}`;
        audioType = 'youtube';
      }
    }

    editor.commands.insertContent({
      type: 'quoteMusical',
      attrs: {
        quote,
        author,
        backgroundAudioUrl: finalAudioUrl,
        backgroundAudioType: audioType,
        backgroundAudioVolume: audioVolume,
      },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Inserir Citação Musical"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Citação *
          </label>
          <textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={4}
            placeholder="Digite a citação aqui..."
            className="input-classical-2 w-full resize-none"
            required
          />
        </div>

        <Input
          label="Autor *"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Ex: Ludwig van Beethoven"
          required
          widhtFull
        />
        <div className="border-t border-theme-secondary pt-4">
          <Checkbox
            label="Adicionar música de fundo"
            checked={enableAudio}
            onChange={(e) => setEnableAudio(e.target.checked)}
          />
        </div>

        {enableAudio && (
          <div className="space-y-4 pl-6 border-l-2 border-accent-purple">
            {/* TABS */}
            <div className="flex ">
              <button
                type="button"
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
                type="button"
                onClick={() => handleTabChange('youtube')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'youtube'
                    ? 'border-b-2 border-brand-primary text-brand-primary'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                🎥 Link do YouTube
              </button>
            </div>

            {/* ABA UPLOAD */}
            {activeTab === 'upload' && (
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Selecionar Arquivo de Áudio
                </label>
                <div className="border-2 border-dashed border-theme-secondary rounded-lg p-4 text-center hover:border-brand-primary transition-colors">
                  <input
                    type="file"
                    id="audio-upload-quote"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />

                  {audioUrl && !uploading ? (
                    <div className="space-y-2">
                      <p className="text-sm text-green-700 font-medium">
                        ✓ Áudio carregado com sucesso
                      </p>
                      <label
                        htmlFor="audio-upload-quote"
                        className="inline-block cursor-pointer text-sm text-brand-primary hover:text-brand-secondary underline"
                      >
                        Alterar áudio
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="audio-upload-quote"
                      className="cursor-pointer"
                    >
                      <FiUpload className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                      <span className="text-sm text-theme-secondary">
                        {uploading ? 'Enviando...' : 'Clique para fazer upload'}
                      </span>
                      <p className="text-xs text-theme-tertiary mt-2">
                        MP3, WAV ou OGG (máx 10MB)
                      </p>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* ABA YOUTUBE */}
            {activeTab === 'youtube' && (
              <>
                <Input
                  label="Link do YouTube"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  widhtFull
                />

                {youtubeUrl && extractYouTubeId(youtubeUrl) && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Link válido do YouTube
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Volume */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Volume: {audioVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={audioVolume}
                onChange={(e) => setAudioVolume(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--accent-purple) 0%, var(--accent-purple) ${audioVolume}%, #e5e7eb ${audioVolume}%, #e5e7eb 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-theme-tertiary mt-1">
                <span>Silencioso</span>
                <span>Alto</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>Dica:</strong> A música tocará automaticamente em
                loop quando o leitor visualizar a citação. Apenas o áudio será
                reproduzido.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t border-theme-secondary">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              !quote ||
              !author ||
              (enableAudio &&
                ((activeTab === 'upload' && !audioUrl) ||
                  (activeTab === 'youtube' && !youtubeUrl)))
            }
          >
            Inserir Citação
          </Button>
        </div>
      </form>
    </Modal>
  );
}
