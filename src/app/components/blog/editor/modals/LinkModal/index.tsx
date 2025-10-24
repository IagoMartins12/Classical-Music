// components/blog/editor/modals/LinkModal.tsx
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Button from '@/app/components/Common/Button';

interface LinkModalProps {
  editor: Editor;
  onClose: () => void;
}

export function LinkModal({ editor, onClose }: LinkModalProps) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ ADICIONAR ESTA LINHA

    if (url) {
      if (text) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text,
            marks: [{ type: 'link', attrs: { href: url } }],
          })
          .run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }

    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Inserir Link"
      maxWidth="md"
      preventBodyScroll={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://exemplo.com"
          required
          autoFocus
          widhtFull
        />

        <Input
          label="Texto (opcional)"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Texto do link"
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
