'use client';

import { useId, useState, type ChangeEvent } from 'react';
import type { Editor } from '@tiptap/react';
import { PiUploadSimple } from 'react-icons/pi';
import { Chip } from '@/app/components/ui/Badge';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { uploadBlogMedia } from '@/app/requests/blog/interactions';
import { FolhaDoEditor } from '../FolhaDoEditor';

interface ImageModalProps {
  editor: Editor;
  onClose: () => void;
  articleId?: string;
  sessionId?: string;
}

/**
 * Imagem no texto: enviar um arquivo ou colar um endereço.
 *
 * **Sem largura, altura e alinhamento.** O diálogo antigo pedia os três e
 * gravava `float` no estilo da imagem; o leitor novo ignora os três (a
 * imagem ocupa a coluna do texto, como no resto do blog), então perguntar
 * era prometer o que não acontece. **A descrição é obrigatória**: é o que o
 * leitor de tela lê e o que o Google indexa da imagem.
 */
export function ImageModal({
  editor,
  onClose,
  articleId,
  sessionId,
}: ImageModalProps) {
  const id = useId();
  const [origem, setOrigem] = useState<'arquivo' | 'link'>('arquivo');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [legenda, setLegenda] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [quebrada, setQuebrada] = useState(false);

  async function enviar(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setEnviando(true);
    setErro('');
    try {
      setUrl(
        await uploadBlogMedia(arquivo, {
          folder: 'content',
          articleId,
          sessionId,
        })
      );
      setQuebrada(false);
    } catch (falha) {
      setErro(
        falha instanceof Error
          ? `Não deu para enviar: ${falha.message}`
          : 'Não deu para enviar a imagem.'
      );
    } finally {
      setEnviando(false);
    }
  }

  function inserir() {
    editor
      .chain()
      .focus()
      .setImage({
        src: url,
        alt: alt.trim(),
        title: legenda.trim() || undefined,
      })
      .run();
    onClose();
  }

  function trocarOrigem(nova: 'arquivo' | 'link') {
    setOrigem(nova);
    setUrl('');
    setErro('');
    setQuebrada(false);
  }

  return (
    <FolhaDoEditor
      titulo="Imagem"
      aoFechar={onClose}
      aoEnviar={inserir}
      podeEnviar={Boolean(url && alt.trim() && !quebrada)}
      enviando={enviando}
    >
      <div
        role="group"
        aria-label="De onde vem a imagem"
        className="flex gap-1.5"
      >
        <Chip
          selecionado={origem === 'arquivo'}
          onClick={() => trocarOrigem('arquivo')}
        >
          Enviar arquivo
        </Chip>
        <Chip
          selecionado={origem === 'link'}
          onClick={() => trocarOrigem('link')}
        >
          Colar endereço
        </Chip>
      </div>

      {origem === 'arquivo' ? (
        <div className="flex flex-col gap-2">
          <input
            id={`${id}-arquivo`}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={enviar}
            disabled={enviando}
            className="sr-only"
          />
          <label
            htmlFor={`${id}-arquivo`}
            className={cx(
              classesDeBotao('secundario'),
              'cursor-pointer self-start'
            )}
          >
            <Icon de={PiUploadSimple} tamanho="p" />
            {enviando
              ? 'Enviando…'
              : url
                ? 'Trocar arquivo'
                : 'Escolher arquivo'}
          </label>
          <p className="t-legenda">JPG, PNG, WebP ou AVIF.</p>
        </div>
      ) : (
        <Field
          label="Endereço da imagem"
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value.trim());
            setQuebrada(false);
          }}
          placeholder="https://"
          erro={quebrada ? 'A imagem não abriu neste endereço.' : undefined}
          autoFocus
        />
      )}

      {erro && (
        <p role="alert" className="t-legenda text-erro">
          {erro}
        </p>
      )}

      {url && !quebrada && (
        // A prévia é do endereço como digitado, antes de passar pelo
        // otimizador de imagens; por isso `<img>` e não `Image`.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt.trim() || 'Prévia da imagem'}
          onError={() => setQuebrada(true)}
          className="max-h-56 w-full rounded-card bg-sup-2 object-contain"
        />
      )}

      <Field
        label="Descrição da imagem"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        ajuda="O que a imagem mostra, para quem não a vê. Ex.: Brahms ao piano, por volta de 1890."
      />
      <Field
        label="Legenda (opcional)"
        value={legenda}
        onChange={(e) => setLegenda(e.target.value)}
        ajuda="Aparece sob a imagem. Bom lugar para o crédito."
      />
    </FolhaDoEditor>
  );
}
