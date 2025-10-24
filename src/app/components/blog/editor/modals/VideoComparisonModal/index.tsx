// ============================================
// 9. components/blog/editor/modals/VideoComparisonModal.tsx
// ============================================
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Button from '@/app/components/Common/Button';
import Checkbox from '@/app/components/Common/Checkbox';

interface VideoComparisonModalProps {
  editor: Editor;
  onClose: () => void;
}

export function VideoComparisonModal({
  editor,
  onClose,
}: VideoComparisonModalProps) {
  const [title, setTitle] = useState('Comparação de Performances');
  const [video1, setVideo1] = useState({ url: '', title: '', description: '' });
  const [video2, setVideo2] = useState({ url: '', title: '', description: '' });
  const [layout, setLayout] = useState<'side-by-side' | 'top-bottom'>(
    'side-by-side'
  );
  const [syncPlayback, setSyncPlayback] = useState(false);

  const extractVideoId = (url: string): string | null => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!video1.url || !video2.url) {
      alert('Preencha as URLs dos dois vídeos');
      return;
    }

    if (!extractVideoId(video1.url) || !extractVideoId(video2.url)) {
      alert('URLs do YouTube inválidas');
      return;
    }

    editor.commands.insertContent({
      type: 'videoComparison',
      attrs: {
        title,
        video1,
        video2,
        layout,
        syncPlayback,
      },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Inserir Comparação de Vídeos"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Título da Comparação"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Glenn Gould vs Lang Lang - Goldberg Variations"
          widhtFull
        />

        <div className="classical-card-simple p-4 bg-theme-secondary">
          <h4 className="font-medium text-theme-primary mb-3">Vídeo 1</h4>

          <div className="space-y-3">
            <Input
              label="URL do YouTube *"
              type="url"
              value={video1.url}
              onChange={(e) => setVideo1({ ...video1, url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              required
              widhtFull
            />

            <Input
              label="Título *"
              type="text"
              value={video1.title}
              onChange={(e) => setVideo1({ ...video1, title: e.target.value })}
              placeholder="Ex: Glenn Gould (1955)"
              required
              widhtFull
            />

            <Input
              label="Descrição"
              type="text"
              value={video1.description}
              onChange={(e) =>
                setVideo1({ ...video1, description: e.target.value })
              }
              placeholder="Ex: Gravação histórica de estúdio"
              widhtFull
            />
          </div>
        </div>

        <div className="classical-card-simple p-4 bg-theme-secondary">
          <h4 className="font-medium text-theme-primary mb-3">Vídeo 2</h4>

          <div className="space-y-3">
            <Input
              label="URL do YouTube *"
              type="url"
              value={video2.url}
              onChange={(e) => setVideo2({ ...video2, url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              required
              widhtFull
            />

            <Input
              label="Título *"
              type="text"
              value={video2.title}
              onChange={(e) => setVideo2({ ...video2, title: e.target.value })}
              placeholder="Ex: Lang Lang (2020)"
              required
              widhtFull
            />

            <Input
              label="Descrição"
              type="text"
              value={video2.description}
              onChange={(e) =>
                setVideo2({ ...video2, description: e.target.value })
              }
              placeholder="Ex: Performance ao vivo em Berlim"
              widhtFull
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-theme-secondary pt-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Layout
            </label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={layout === 'side-by-side' ? 'primary' : 'outline'}
                onClick={() => setLayout('side-by-side')}
                className="flex-1"
              >
                Lado a Lado
              </Button>
              <Button
                type="button"
                variant={layout === 'top-bottom' ? 'primary' : 'outline'}
                onClick={() => setLayout('top-bottom')}
                className="flex-1"
              >
                Um sobre o Outro
              </Button>
            </div>
          </div>

          <Checkbox
            label="Sincronizar reprodução (experimental)"
            checked={syncPlayback}
            onChange={(e) => setSyncPlayback(e.target.checked)}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Inserir Comparação
          </Button>
        </div>
      </form>
    </Modal>
  );
}
