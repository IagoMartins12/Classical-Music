'use client';

import { useEditorState, type Editor } from '@tiptap/react';
import { useState, type ComponentType, type SVGProps } from 'react';
import {
  PiArrowClockwise,
  PiArrowCounterClockwise,
  PiClock,
  PiCode,
  PiColumns,
  PiFileAudio,
  PiFileText,
  PiImage,
  PiLink,
  PiListBullets,
  PiListNumbers,
  PiMusicNotes,
  PiQuotes,
  PiQuotesFill,
  PiTextAlignCenter,
  PiTextAlignJustify,
  PiTextAlignLeft,
  PiTextAlignRight,
  PiTextB,
  PiTextHThree,
  PiTextHTwo,
  PiTextItalic,
  PiTextStrikethrough,
  PiTextUnderline,
  PiUser,
  PiYoutubeLogo,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
import { YoutubeModal } from '../modals/YoutubeModal';
import { ImageModal } from '../modals/ImageModal';
import { LinkModal } from '../modals/LinkModal';
import { ComposerModal } from '../modals/ComposerModal';
import { WorkModal } from '../modals/WorkModal';
import { ScoreModal } from '../modals/ScoreModal';
import { AudioPlayerModal } from '../modals/AudioPlayerModal';
import { TimelineModal } from '../modals/TimelineModal';
import { VideoComparisonModal } from '../modals/VideoComparisonModal';
import { QuoteMusicalModal } from '../modals/QuoteMusicalModal';

/**
 * A barra do editor do artigo.
 *
 * **Fica presa sob o cabeçalho do painel.** Num texto de oito mil palavras a
 * barra rolava para fora e o negrito virava atalho decorado. Os botões são o
 * fantasma do sistema, com nome (`rotulo`) e `aria-pressed` no que está
 * ativo; o ativo se distingue pelo ouro do texto e pelo fundo de foco, não
 * por azul. Os blocos de música perderam o verde, o laranja e o roxo de cada
 * ícone: a cor não dizia nada que o nome não dissesse.
 *
 * **Sem "Título 1".** O título do artigo já é o `h1` da página; no texto, as
 * seções são `h2` e as subseções `h3`. Artigos antigos com `h1` continuam
 * abrindo (o esquema ainda aceita) e o leitor nivela os títulos na hora de
 * publicar (ver `titulosDoArtigo`).
 */

type Modal =
  | 'link'
  | 'imagem'
  | 'youtube'
  | 'compositor'
  | 'obra'
  | 'partitura'
  | 'audio'
  | 'linha'
  | 'comparacao'
  | 'citacao';

type IconeDoBotao = ComponentType<SVGProps<SVGSVGElement>>;

interface Comando {
  rotulo: string;
  icone: IconeDoBotao;
  fazer: () => void;
  ativo?: boolean;
  desligado?: boolean;
}

interface EditorToolbarProps {
  editor: Editor;
  articleId?: string;
  sessionId?: string;
}

export function EditorToolbar({
  editor,
  articleId,
  sessionId,
}: EditorToolbarProps) {
  const [modal, setModal] = useState<Modal | null>(null);
  const fechar = () => setModal(null);
  const cadeia = () => editor.chain().focus();

  // TipTap 3 não redesenha a barra a cada transação: lido daqui, o "ativo"
  // ficava velho (o negrito parecia desligado com o texto em negrito).
  const estado = useEditorState({
    editor,
    selector: ({ editor }) => ({
      desfazer: editor.can().undo(),
      refazer: editor.can().redo(),
      negrito: editor.isActive('bold'),
      italico: editor.isActive('italic'),
      sublinhado: editor.isActive('underline'),
      riscado: editor.isActive('strike'),
      codigo: editor.isActive('code'),
      secao: editor.isActive('heading', { level: 2 }),
      subsecao: editor.isActive('heading', { level: 3 }),
      marcadores: editor.isActive('bulletList'),
      numerada: editor.isActive('orderedList'),
      citacao: editor.isActive('blockquote'),
      esquerda: editor.isActive({ textAlign: 'left' }),
      centro: editor.isActive({ textAlign: 'center' }),
      direita: editor.isActive({ textAlign: 'right' }),
      justificado: editor.isActive({ textAlign: 'justify' }),
      link: editor.isActive('link'),
    }),
  });

  // Alinhamento ativo, clicado de novo, volta ao padrão (a esquerda).
  const alinhar = (lado: 'left' | 'center' | 'right' | 'justify') => {
    if (editor.isActive({ textAlign: lado })) cadeia().unsetTextAlign().run();
    else cadeia().setTextAlign(lado).run();
  };

  const grupos: Comando[][] = [
    [
      {
        rotulo: 'Desfazer (Ctrl+Z)',
        icone: PiArrowCounterClockwise,
        fazer: () => cadeia().undo().run(),
        desligado: !estado.desfazer,
      },
      {
        rotulo: 'Refazer (Ctrl+Y)',
        icone: PiArrowClockwise,
        fazer: () => cadeia().redo().run(),
        desligado: !estado.refazer,
      },
    ],
    [
      {
        rotulo: 'Negrito (Ctrl+B)',
        icone: PiTextB,
        fazer: () => cadeia().toggleBold().run(),
        ativo: estado.negrito,
      },
      {
        rotulo: 'Itálico (Ctrl+I)',
        icone: PiTextItalic,
        fazer: () => cadeia().toggleItalic().run(),
        ativo: estado.italico,
      },
      {
        rotulo: 'Sublinhado (Ctrl+U)',
        icone: PiTextUnderline,
        fazer: () => cadeia().toggleUnderline().run(),
        ativo: estado.sublinhado,
      },
      {
        rotulo: 'Riscado',
        icone: PiTextStrikethrough,
        fazer: () => cadeia().toggleStrike().run(),
        ativo: estado.riscado,
      },
      {
        rotulo: 'Código',
        icone: PiCode,
        fazer: () => cadeia().toggleCode().run(),
        ativo: estado.codigo,
      },
    ],
    [
      {
        rotulo: 'Seção (título)',
        icone: PiTextHTwo,
        fazer: () => cadeia().toggleHeading({ level: 2 }).run(),
        ativo: estado.secao,
      },
      {
        rotulo: 'Subseção',
        icone: PiTextHThree,
        fazer: () => cadeia().toggleHeading({ level: 3 }).run(),
        ativo: estado.subsecao,
      },
      {
        rotulo: 'Lista com marcadores',
        icone: PiListBullets,
        fazer: () => cadeia().toggleBulletList().run(),
        ativo: estado.marcadores,
      },
      {
        rotulo: 'Lista numerada',
        icone: PiListNumbers,
        fazer: () => cadeia().toggleOrderedList().run(),
        ativo: estado.numerada,
      },
      {
        rotulo: 'Citação',
        icone: PiQuotes,
        fazer: () => cadeia().toggleBlockquote().run(),
        ativo: estado.citacao,
      },
    ],
    [
      {
        rotulo: 'Alinhar à esquerda',
        icone: PiTextAlignLeft,
        fazer: () => alinhar('left'),
        ativo: estado.esquerda,
      },
      {
        rotulo: 'Centralizar',
        icone: PiTextAlignCenter,
        fazer: () => alinhar('center'),
        ativo: estado.centro,
      },
      {
        rotulo: 'Alinhar à direita',
        icone: PiTextAlignRight,
        fazer: () => alinhar('right'),
        ativo: estado.direita,
      },
      {
        rotulo: 'Justificar',
        icone: PiTextAlignJustify,
        fazer: () => alinhar('justify'),
        ativo: estado.justificado,
      },
    ],
    [
      {
        rotulo: 'Link',
        icone: PiLink,
        fazer: () => setModal('link'),
        ativo: estado.link,
      },
      { rotulo: 'Imagem', icone: PiImage, fazer: () => setModal('imagem') },
      {
        rotulo: 'Vídeo do YouTube',
        icone: PiYoutubeLogo,
        fazer: () => setModal('youtube'),
      },
    ],
    [
      {
        rotulo: 'Compositor',
        icone: PiUser,
        fazer: () => setModal('compositor'),
      },
      { rotulo: 'Obra', icone: PiMusicNotes, fazer: () => setModal('obra') },
      {
        rotulo: 'Partitura',
        icone: PiFileText,
        fazer: () => setModal('partitura'),
      },
      {
        rotulo: 'Áudio',
        icone: PiFileAudio,
        fazer: () => setModal('audio'),
      },
      {
        rotulo: 'Linha do tempo',
        icone: PiClock,
        fazer: () => setModal('linha'),
      },
      {
        rotulo: 'Comparar vídeos',
        icone: PiColumns,
        fazer: () => setModal('comparacao'),
      },
      {
        rotulo: 'Citação musical',
        icone: PiQuotesFill,
        fazer: () => setModal('citacao'),
      },
    ],
  ];

  return (
    <>
      <div
        role="toolbar"
        aria-label="Formatação do texto"
        className="sticky top-14 z-10 flex items-center gap-x-1 gap-y-0.5 overflow-x-auto overscroll-x-contain rounded-t-card bg-sup-2 px-2 py-1.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible"
      >
        {grupos.map((grupo, i) => (
          <div key={i} className="flex shrink-0 items-center">
            {i > 0 && (
              <span aria-hidden="true" className="mx-1 h-5 w-px bg-linha" />
            )}
            {grupo.map((c) => (
              <Button
                key={c.rotulo}
                variante="fantasma"
                tamanho="p"
                icone={c.icone}
                rotulo={c.rotulo}
                title={c.rotulo}
                aria-pressed={c.ativo === undefined ? undefined : c.ativo}
                disabled={c.desligado}
                onClick={c.fazer}
                className={cx(
                  c.ativo && 'bg-(--interactive-hover)! text-ouro-texto!'
                )}
              />
            ))}
          </div>
        ))}
      </div>

      {modal === 'link' && <LinkModal editor={editor} onClose={fechar} />}
      {modal === 'imagem' && (
        <ImageModal
          editor={editor}
          onClose={fechar}
          articleId={articleId}
          sessionId={sessionId}
        />
      )}
      {modal === 'youtube' && <YoutubeModal editor={editor} onClose={fechar} />}
      {modal === 'compositor' && (
        <ComposerModal editor={editor} onClose={fechar} />
      )}
      {modal === 'obra' && <WorkModal editor={editor} onClose={fechar} />}
      {modal === 'partitura' && <ScoreModal editor={editor} onClose={fechar} />}
      {modal === 'audio' && (
        <AudioPlayerModal
          editor={editor}
          onClose={fechar}
          articleId={articleId}
          sessionId={sessionId}
        />
      )}
      {modal === 'linha' && (
        <TimelineModal
          editor={editor}
          onClose={fechar}
          articleId={articleId}
          sessionId={sessionId}
        />
      )}
      {modal === 'comparacao' && (
        <VideoComparisonModal editor={editor} onClose={fechar} />
      )}
      {modal === 'citacao' && (
        <QuoteMusicalModal
          editor={editor}
          onClose={fechar}
          articleId={articleId}
          sessionId={sessionId}
        />
      )}
    </>
  );
}
