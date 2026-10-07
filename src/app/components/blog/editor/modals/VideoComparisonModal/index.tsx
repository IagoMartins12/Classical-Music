'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { idDoYoutube } from '@/app/components/blog/site/useFonteDeAudio';
import { Chip } from '@/app/components/ui/Badge';
import { Field } from '@/app/components/ui/Field';
import { FolhaDoEditor } from '../FolhaDoEditor';

interface VideoComparisonModalProps {
  editor: Editor;
  onClose: () => void;
}

interface Video {
  url: string;
  title: string;
  description: string;
}

const VAZIO: Video = { url: '', title: '', description: '' };

/**
 * Duas gravações da mesma peça, lado a lado ou uma sobre a outra.
 *
 * O "sincronizar reprodução (experimental)" saiu: o leitor nunca o fez, e a
 * opção gravava `syncPlayback` sem efeito nenhum.
 */
export function VideoComparisonModal({
  editor,
  onClose,
}: VideoComparisonModalProps) {
  const [titulo, setTitulo] = useState('');
  const [videos, setVideos] = useState<[Video, Video]>([
    { ...VAZIO },
    { ...VAZIO },
  ]);
  const [layout, setLayout] = useState<'side-by-side' | 'top-bottom'>(
    'side-by-side'
  );

  const validos = videos.every((v) => idDoYoutube(v.url) && v.title.trim());

  function mudar(i: 0 | 1, campo: keyof Video, valor: string) {
    setVideos((atual) => {
      const novo: [Video, Video] = [{ ...atual[0] }, { ...atual[1] }];
      novo[i][campo] = valor;
      return novo;
    });
  }

  function inserir() {
    const [video1, video2] = videos.map((v) => ({
      url: v.url.trim(),
      title: v.title.trim(),
      description: v.description.trim(),
    }));
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'videoComparison',
        attrs: {
          title: titulo.trim() || null,
          video1,
          video2,
          layout,
          syncPlayback: false,
        },
      })
      .run();
    onClose();
  }

  return (
    <FolhaDoEditor
      titulo="Comparar gravações"
      descricao="Dois vídeos do YouTube; no artigo, cada um só carrega quando o leitor aperta o play."
      aoFechar={onClose}
      aoEnviar={inserir}
      podeEnviar={validos}
      largura="g"
    >
      <Field
        label="Título (opcional)"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Ex.: Variações Goldberg, Gould em 1955 e 1981"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {([0, 1] as const).map((i) => {
          const v = videos[i];
          return (
            <fieldset
              key={i}
              className="flex flex-col gap-4 rounded-card bg-sup-2 p-4"
            >
              <legend className="sr-only">Vídeo {i + 1}</legend>
              <span aria-hidden="true" className="t-rotulo text-texto-fraco">
                Vídeo {i + 1}
              </span>
              <Field
                label="Endereço no YouTube"
                type="url"
                inputMode="url"
                value={v.url}
                onChange={(e) => mudar(i, 'url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                erro={
                  v.url.trim() && !idDoYoutube(v.url)
                    ? 'Não é um endereço de vídeo do YouTube.'
                    : undefined
                }
              />
              <Field
                label="Quem toca"
                value={v.title}
                onChange={(e) => mudar(i, 'title', e.target.value)}
                placeholder="Ex.: Glenn Gould (1955)"
              />
              <Field
                label="Nota (opcional)"
                value={v.description}
                onChange={(e) => mudar(i, 'description', e.target.value)}
                placeholder="Ex.: gravação de estúdio"
              />
            </fieldset>
          );
        })}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-texto">
          Disposição
        </legend>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            selecionado={layout === 'side-by-side'}
            onClick={() => setLayout('side-by-side')}
          >
            Lado a lado
          </Chip>
          <Chip
            selecionado={layout === 'top-bottom'}
            onClick={() => setLayout('top-bottom')}
          >
            Um sobre o outro
          </Chip>
        </div>
        <p className="t-legenda mt-2">
          No telefone, ficam sempre um sobre o outro.
        </p>
      </fieldset>
    </FolhaDoEditor>
  );
}
