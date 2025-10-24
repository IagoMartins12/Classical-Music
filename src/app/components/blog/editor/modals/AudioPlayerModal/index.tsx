// ============================================
// AudioPlayerModal - COM UPLOAD/YOUTUBE
// ============================================
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { FiUpload, FiMusic } from 'react-icons/fi';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Button from '@/app/components/Common/Button';
import ComposerSearchInputSimple from '@/app/components/ComposerSearchInputSimple';
import SimpleWorkSearchInput from '@/app/components/SimpleWorkSearchInput';

interface AudioPlayerModalProps {
  editor: Editor;
  onClose: () => void;
  articleId?: string;
  sessionId?: string;
}

export function AudioPlayerModal({
  editor,
  onClose,
  articleId,
  sessionId,
}: AudioPlayerModalProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'upload' | 'youtube'>('upload');

  // Dados do áudio
  const [audioUrl, setAudioUrl] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // YouTube
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Vinculações opcionais
  const [selectedComposer, setSelectedComposer] = useState('');
  const [composerData, setComposerData] = useState<any>(null);
  const [selectedWork, setSelectedWork] = useState('');
  const [workData, setWorkData] = useState<any>(null);

  // Upload de arquivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setAudioTitle(file.name.replace(/\.[^/.]+$/, '')); // Remove extensão
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

  // Buscar compositor
  const handleComposerSelect = async (composerId: string) => {
    setSelectedComposer(composerId);

    if (composerId) {
      try {
        const response = await fetch('/api/composers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: composerId }),
        });

        if (response.ok) {
          const composer = await response.json();
          setComposerData(composer);
        }
      } catch (error) {
        console.error('Erro ao buscar compositor:', error);
      }
    }
  };

  // Buscar obra
  const handleWorkSelect = async (workId: string, data?: any) => {
    setSelectedWork(workId);

    if (data) {
      setWorkData(data);
    } else if (workId) {
      try {
        const response = await fetch(`/api/works/${workId}`);
        if (response.ok) {
          const work = await response.json();
          setWorkData(work);
        }
      } catch (error) {
        console.error('Erro ao buscar obra:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let finalAudioUrl = '';
    let audioType = '';

    if (activeTab === 'upload') {
      if (!audioUrl) {
        alert('Faça upload de um áudio primeiro');
        return;
      }
      finalAudioUrl = audioUrl;
      audioType = 'upload';
    } else {
      if (!youtubeUrl) {
        alert('Insira o link do YouTube');
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

    editor.commands.insertContent({
      type: 'audioPlayer',
      attrs: {
        audioUrl: finalAudioUrl,
        audioType,
        title: audioTitle || 'Áudio sem título',
        composerId: composerData?.id || null,
        composerName: composerData?.name || null,
        workId: workData?.id || null,
        workTitle: workData?.title || null,
      },
    });
    onClose();
  };

  // Trocar de aba limpa campos
  const handleTabChange = (tab: 'upload' | 'youtube') => {
    setActiveTab(tab);
    setAudioUrl('');
    setAudioTitle('');
    setYoutubeUrl('');
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Inserir Player de Áudio"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TABS */}
        <div className="flex">
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
          <>
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Selecionar Arquivo de Áudio
              </label>
              <div className="border-2 border-dashed border-theme-secondary rounded-lg p-6 text-center hover:border-brand-primary transition-colors">
                <input
                  type="file"
                  id="audio-upload"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />

                {audioUrl && !uploading ? (
                  <div className="space-y-3">
                    <FiMusic className="w-12 h-12 text-green-600 mx-auto" />
                    <p className="text-sm text-green-700 font-medium">
                      ✓ Áudio carregado com sucesso
                    </p>
                    <p className="text-xs text-theme-tertiary">{audioTitle}</p>
                    <label
                      htmlFor="audio-upload"
                      className="inline-block cursor-pointer text-sm text-brand-primary hover:text-brand-secondary underline"
                    >
                      Alterar áudio
                    </label>
                  </div>
                ) : (
                  <label htmlFor="audio-upload" className="cursor-pointer">
                    <FiUpload className="w-12 h-12 text-theme-tertiary mx-auto mb-2" />
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

            {audioUrl && (
              <Input
                label="Título do Áudio"
                type="text"
                value={audioTitle}
                onChange={(e) => setAudioTitle(e.target.value)}
                placeholder="Ex: Moonlight Sonata - 1º Movimento"
                widhtFull
              />
            )}
          </>
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
              required
              widhtFull
            />

            <Input
              label="Título do Áudio"
              type="text"
              value={audioTitle}
              onChange={(e) => setAudioTitle(e.target.value)}
              placeholder="Ex: Moonlight Sonata - 1º Movimento"
              widhtFull
            />

            {youtubeUrl && extractYouTubeId(youtubeUrl) && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 mb-2">
                  ✓ Link válido do YouTube
                </p>
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(
                    youtubeUrl
                  )}`}
                  className="rounded-lg"
                  title="Preview"
                />
              </div>
            )}
          </>
        )}

        {/* VINCULAÇÕES OPCIONAIS */}
        {(audioUrl || youtubeUrl) && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-theme-primary">
              📎 Vinculações Opcionais
            </h4>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Compositor (opcional)
              </label>
              <ComposerSearchInputSimple
                selectedComposer={selectedComposer}
                onComposerSelect={handleComposerSelect}
              />
              {composerData && (
                <p className="text-sm text-green-600 mt-1">✓ Vinculado</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Obra (opcional)
              </label>
              <SimpleWorkSearchInput
                selectedWork={selectedWork}
                onWorkSelect={handleWorkSelect}
                filterByComposer={selectedComposer}
              />
              {workData && (
                <p className="text-sm text-green-600 mt-1">✓ Vinculado</p>
              )}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              uploading ||
              (activeTab === 'upload' && !audioUrl) ||
              (activeTab === 'youtube' && !youtubeUrl)
            }
          >
            Inserir Player
          </Button>
        </div>
      </form>
    </Modal>
  );
}
