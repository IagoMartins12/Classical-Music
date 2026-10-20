'use client';

import { useId, useState, type ChangeEvent } from 'react';
import type { Editor } from '@tiptap/react';
import { PiUploadSimple } from 'react-icons/pi';
import { uploadBlogMedia } from '@/app/requests/blog/interactions';
import { BlocoDoArtigo } from '@/app/components/blog/site/CorpoDoArtigo';
import { idDoYoutube } from '@/app/components/blog/site/useFonteDeAudio';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import { Chip } from '@/app/components/ui/Badge';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { FolhaDoEditor } from '../FolhaDoEditor';

interface QuoteMusicalModalProps {
  editor: Editor;
  onClose: () => void;
  articleId?: string;
  sessionId?: string;
}

const FORMATOS = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];

/**
 * Citação com música opcional.
 *
 * **A música não toca sozinha.** O diálogo antigo prometia "tocará
 * automaticamente em loop quando o leitor visualizar a citação" e pedia um
 * volume; som que começa sem pedido reprova o WCAG (1.4.2) e assusta quem lê
 * em público. No artigo a citação ganha um botão de ouvir, e o volume é o do
 * leitor. Por isso o diálogo não pergunta mais o volume.
 */
export function QuoteMusicalModal({
  editor,
  onClose,
  articleId,
  sessionId,
}: QuoteMusicalModalProps) {
  const id = useId();
  const [citacao, setCitacao] = useState('');
  const [autor, setAutor] = useState('');
  const [comMusica, setComMusica] = useState(false);
  const [origem, setOrigem] = useState<'arquivo' | 'youtube'>('arquivo');
  const [arquivoUrl, setArquivoUrl] = useState('');
  const [youtube, setYoutube] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const idYoutube = idDoYoutube(youtube);
  const audio = !comMusica
    ? null
    : origem === 'arquivo'
      ? arquivoUrl || null
      : idYoutube
        ? `https://www.youtube.com/embed/${idYoutube}`
        : null;

  const pronta = Boolean(
    citacao.trim() && autor.trim() && (!comMusica || audio)
  );

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

  const attrs = {
    quote: citacao.trim(),
    author: autor.trim(),
    backgroundAudioUrl: audio,
    backgroundAudioType: audio
      ? origem === 'arquivo'
        ? 'upload'
        : 'youtube'
      : null,
    backgroundAudioVolume: 30,
  };

  function inserir() {
    editor.chain().focus().insertContent({ type: 'quoteMusical', attrs }).run();
    onClose();
  }

  return (
    <FolhaDoEditor
      titulo="Citação musical"
      aoFechar={onClose}
      aoEnviar={inserir}
      podeEnviar={pronta}
      enviando={enviando}
    >
      <Field.Area
        label="Citação"
        rows={4}
        value={citacao}
        onChange={(e) => setCitacao(e.target.value)}
        classeCampo="resize-y"
        autoFocus
      />
      <Field
        label="De quem é"
        value={autor}
        onChange={(e) => setAutor(e.target.value)}
        placeholder="Ex.: Ludwig van Beethoven"
      />

      <Interruptor
        rotulo="Com música"
        ajuda="A citação ganha um botão para ouvir. Nada toca sem o leitor pedir."
        ligado={comMusica}
        aoMudar={setComMusica}
      />

      {comMusica && (
        <div className="flex flex-col gap-4">
          <div
            role="group"
            aria-label="De onde vem a música"
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
              erro={
                youtube.trim() && !idYoutube
                  ? 'Não é um endereço de vídeo do YouTube.'
                  : undefined
              }
            />
          )}
          {erro && (
            <p role="alert" className="t-legenda text-erro">
              {erro}
            </p>
          )}
        </div>
      )}

      {attrs.quote && (
        <div className="flex flex-col gap-2">
          <span className="t-rotulo text-texto-fraco">Como fica no artigo</span>
          <div className="blog-corpo text-[1.0625rem]">
            <BlocoDoArtigo no={{ type: 'quoteMusical', attrs }} />
          </div>
        </div>
      )}
    </FolhaDoEditor>
  );
}
