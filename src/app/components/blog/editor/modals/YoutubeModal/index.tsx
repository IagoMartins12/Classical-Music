// ============================================
// 2. components/blog/editor/modals/YoutubeModal.tsx
// ============================================
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Button from '@/app/components/Common/Button';

interface YoutubeModalProps {
  editor: Editor;
  onClose: () => void;
}

export function YoutubeModal({ editor, onClose }: YoutubeModalProps) {
  const [url, setUrl] = useState('');

  const extractVideoId = (url: string): string | null => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ ADICIONAR ESTA LINHA

    const videoId = extractVideoId(url);
    if (videoId) {
      editor.commands.setYoutubeVideo({
        src: `https://www.youtube.com/watch?v=${videoId}`,
      });
      onClose();
    } else {
      alert('URL do YouTube inválida');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Inserir Vídeo do YouTube"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="URL do YouTube"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          helperText="Cole o link do vídeo do YouTube"
          required
          autoFocus
          widhtFull
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Inserir
          </Button>
        </div>
      </form>
    </Modal>
  );
}
