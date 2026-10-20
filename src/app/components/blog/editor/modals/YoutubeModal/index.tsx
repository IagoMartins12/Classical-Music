'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Field } from '@/app/components/ui/Field';
import { idDoYoutube } from '@/app/components/blog/site/useFonteDeAudio';
import { FolhaDoEditor } from '../FolhaDoEditor';

interface YoutubeModalProps {
  editor: Editor;
  onClose: () => void;
}

/**
 * Vídeo do YouTube no texto. O endereço é lido pelo mesmo `idDoYoutube` do
 * leitor (aceita `watch?v=`, `youtu.be/`, `embed/`, `shorts/`); o erro
 * aparece no campo, não num `alert`.
 */
export function YoutubeModal({ editor, onClose }: YoutubeModalProps) {
  const [url, setUrl] = useState('');
  const [erro, setErro] = useState('');

  function inserir() {
    const id = idDoYoutube(url);
    if (!id) {
      setErro('Não é um endereço de vídeo do YouTube.');
      return;
    }
    editor
      .chain()
      .focus()
      .setYoutubeVideo({ src: `https://www.youtube.com/watch?v=${id}` })
      .run();
    onClose();
  }

  return (
    <FolhaDoEditor
      titulo="Vídeo do YouTube"
      aoFechar={onClose}
      aoEnviar={inserir}
      podeEnviar={Boolean(url.trim())}
      largura="p"
    >
      <Field
        label="Endereço do vídeo"
        type="url"
        inputMode="url"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setErro('');
        }}
        placeholder="https://www.youtube.com/watch?v=…"
        ajuda="No artigo, o vídeo só carrega quando o leitor aperta o play."
        erro={erro || undefined}
        autoFocus
      />
    </FolhaDoEditor>
  );
}
