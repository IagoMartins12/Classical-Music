'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Field } from '@/app/components/ui/Field';
import { FolhaDoEditor } from '../FolhaDoEditor';

interface LinkModalProps {
  editor: Editor;
  onClose: () => void;
}

/**
 * Link no texto. Com texto selecionado, o link vai nele; sem seleção, o
 * "Texto" vira as palavras do link. Abrir sobre um link existente traz o
 * endereço dele, e apagar o endereço tira o link.
 */
export function LinkModal({ editor, onClose }: LinkModalProps) {
  const atual = (editor.getAttributes('link').href as string | undefined) ?? '';
  const temSelecao = !editor.state.selection.empty;
  const [url, setUrl] = useState(atual);
  const [text, setText] = useState('');

  function inserir() {
    const href = url.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else if (!temSelecao && !atual) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: text.trim() || href,
          marks: [{ type: 'link', attrs: { href } }],
        })
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    onClose();
  }

  return (
    <FolhaDoEditor
      titulo={atual ? 'Editar link' : 'Inserir link'}
      aoFechar={onClose}
      aoEnviar={inserir}
      rotuloDoEnvio={
        atual && !url.trim() ? 'Tirar link' : atual ? 'Salvar' : 'Inserir'
      }
      podeEnviar={Boolean(url.trim() || atual)}
      largura="p"
    >
      <Field
        label="Endereço"
        type="url"
        inputMode="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://"
        ajuda="Links para o próprio Opus Atlas abrem na mesma aba; os de fora, em outra."
        autoFocus
      />
      {!temSelecao && !atual && (
        <Field
          label="Texto do link"
          value={text}
          onChange={(e) => setText(e.target.value)}
          ajuda="Sem texto, o endereço vira o link."
        />
      )}
    </FolhaDoEditor>
  );
}
