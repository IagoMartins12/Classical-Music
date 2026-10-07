'use client';

import { useId, useState, type ChangeEvent } from 'react';
import type { Editor } from '@tiptap/react';
import { PiUploadSimple } from 'react-icons/pi';
import {
  BuscaNoAcervo,
  ItemEscolhido,
  type ItemDoAcervo,
} from '@/app/components/blog/escrita/BuscaNoAcervo';
import { uploadBlogMedia } from '@/app/requests/blog/interactions';
import { BlocoDoArtigo } from '@/app/components/blog/site/CorpoDoArtigo';
import { idDoYoutube } from '@/app/components/blog/site/useFonteDeAudio';
import { Chip } from '@/app/components/ui/Badge';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { FolhaDoEditor } from '../FolhaDoEditor';

interface AudioPlayerModalProps {
  editor: Editor;
  onClose: () => void;
  articleId?: string;
  sessionId?: string;
}

const FORMATOS = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];

/**
 * Áudio no texto: um arquivo enviado ou o som de um vídeo do YouTube, com
 * compositor e obra opcionais (viram links no bloco). A prévia é o próprio
 * bloco do artigo, já tocável.
 */
export function AudioPlayerModal({
  editor,
  onClose,
  articleId,
  sessionId,
}: AudioPlayerModalProps) {
  const id = useId();
  const [origem, setOrigem] = useState<'arquivo' | 'youtube'>('arquivo');
  const [arquivoUrl, setArquivoUrl] = useState('');
  const [youtube, setYoutube] = useState('');
  const [titulo, setTitulo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [compositor, setCompositor] = useState<ItemDoAcervo | null>(null);
  const [obra, setObra] = useState<ItemDoAcervo | null>(null);

  const idYoutube = idDoYoutube(youtube);
  const url =
    origem === 'arquivo'
      ? arquivoUrl
      : idYoutube
        ? `https://www.youtube.com/embed/${idYoutube}`
        : '';

  async function enviar(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    if (!FORMATOS.includes(arquivo.type)) {
      setErro('Formato não aceito. Use MP3, WAV ou OGG.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      setArquivoUrl(
        await uploadBlogMedia(arquivo, {
          folder: 'audio',
          articleId,
          sessionId,
        })
      );
      if (!titulo) setTitulo(arquivo.name.replace(/\.[^/.]+$/, ''));
    } catch (falha) {
      setErro(
        falha instanceof Error
          ? `Não deu para enviar: ${falha.message}`
          : 'Não deu para enviar o áudio.'
      );
    } finally {
      setEnviando(false);
    }
  }

  const attrs = url
    ? {
        audioUrl: url,
        audioType: origem === 'arquivo' ? 'upload' : 'youtube',
        title: titulo.trim() || null,
        composerId: compositor?.id ?? null,
        composerName: compositor?.nome ?? null,
        workId: obra?.id ?? null,
        workTitle: obra?.nome ?? null,
      }
    : null;

  function inserir() {
    if (!attrs) return;
    editor.chain().focus().insertContent({ type: 'audioPlayer', attrs }).run();
    onClose();
  }

  return (
    <FolhaDoEditor
      titulo="Áudio"
      aoFechar={onClose}
      aoEnviar={inserir}
      podeEnviar={Boolean(attrs)}
      enviando={enviando}
    >
      <div
        role="group"
        aria-label="De onde vem o áudio"
        className="flex gap-1.5"
      >
        <Chip
          selecionado={origem === 'arquivo'}
          onClick={() => setOrigem('arquivo')}
        >
          Enviar arquivo
        </Chip>
        <Chip
          selecionado={origem === 'youtube'}
          onClick={() => setOrigem('youtube')}
        >
          Vídeo do YouTube
        </Chip>
      </div>

      {origem === 'arquivo' ? (
        <div className="flex flex-col gap-2">
          <input
            id={`${id}-arquivo`}
            type="file"
            accept={FORMATOS.join(',')}
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
              : arquivoUrl
                ? 'Trocar arquivo'
                : 'Escolher arquivo'}
          </label>
          <p className="t-legenda">MP3, WAV ou OGG, até 10 MB.</p>
        </div>
      ) : (
        <Field
          label="Endereço do vídeo"
          type="url"
          inputMode="url"
          value={youtube}
          onChange={(e) => setYoutube(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          ajuda="O leitor ouve o som; o vídeo não aparece."
          erro={
            youtube.trim() && !idYoutube
              ? 'Não é um endereço de vídeo do YouTube.'
              : undefined
          }
          autoFocus
        />
      )}

      {erro && (
        <p role="alert" className="t-legenda text-erro">
          {erro}
        </p>
      )}

      <Field
        label="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Ex.: Sonata ao Luar, 1º movimento"
      />

      <details
        className="group rounded-card bg-sup-2 px-4"
        open={Boolean(compositor || obra)}
      >
        <summary className="flex min-h-[var(--alvo)] cursor-pointer items-center justify-between text-sm font-medium text-texto">
          Ligar ao acervo
          <span className="font-normal text-texto-fraco">
            {compositor ? compositor.nome : 'opcional'}
          </span>
        </summary>
        <div className="flex flex-col gap-5 pb-4">
          {compositor ? (
            <ItemEscolhido
              rotulo="Compositor"
              item={compositor}
              aoTrocar={() => {
                setCompositor(null);
                setObra(null);
              }}
            />
          ) : (
            <BuscaNoAcervo
              tipo="compositor"
              rotulo="Compositor"
              aoEscolher={setCompositor}
            />
          )}
          {compositor &&
            (obra ? (
              <ItemEscolhido
                rotulo="Obra"
                item={obra}
                aoTrocar={() => setObra(null)}
              />
            ) : (
              <BuscaNoAcervo
                tipo="obra"
                rotulo={`Obra de ${compositor.nome} (opcional)`}
                compositorId={compositor.id}
                aoEscolher={setObra}
              />
            ))}
        </div>
      </details>

      {attrs && (
        <div className="flex flex-col gap-2">
          <span className="t-rotulo text-texto-fraco">Como fica no artigo</span>
          <BlocoDoArtigo no={{ type: 'audioPlayer', attrs }} />
        </div>
      )}
    </FolhaDoEditor>
  );
}
