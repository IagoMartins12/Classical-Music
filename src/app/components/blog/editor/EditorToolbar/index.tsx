// components/blog/editor/EditorToolbar.tsx - COM SESSIONID
'use client';

import { Editor } from '@tiptap/react';
import {
  PiArrowClockwise,
  PiArrowCounterClockwise,
  PiClock,
  PiCode,
  PiColumns,
  PiFileAudio,
  PiImage,
  PiLink,
  PiListBullets,
  PiListNumbers,
  PiMusicNotes,
  PiQuotes,
  PiTextAlignCenter,
  PiTextAlignJustify,
  PiTextAlignLeft,
  PiTextAlignRight,
  PiTextB,
  PiTextHOne,
  PiTextHThree,
  PiTextHTwo,
  PiTextItalic,
  PiTextStrikethrough,
  PiTextUnderline,
  PiUser,
  PiYoutubeLogo,
} from 'react-icons/pi';
import { useState } from 'react';
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

interface EditorToolbarProps {
  editor: Editor;
  articleId?: string;
  sessionId?: string; // ✅ NOVO
}

export function EditorToolbar({
  editor,
  articleId,
  sessionId,
}: EditorToolbarProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [showComposerModal, setShowComposerModal] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showVideoComparisonModal, setShowVideoComparisonModal] =
    useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const ToolbarButton = ({
    onClick,
    active = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-sup-2 transition-colors ${
        active ? 'bg-sup-2 text-aviso' : 'text-texto-suave'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-linha-forte mx-1" />;

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-linha bg-sup-2">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Desfazer (Ctrl+Z)"
        >
          <PiArrowCounterClockwise className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Refazer (Ctrl+Y)"
        >
          <PiArrowClockwise className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Negrito (Ctrl+B)"
        >
          <PiTextB className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Itálico (Ctrl+I)"
        >
          <PiTextItalic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Sublinhado (Ctrl+U)"
        >
          <PiTextUnderline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Riscado"
        >
          <PiTextStrikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Código"
        >
          <PiCode className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive('heading', { level: 1 })}
          title="Título 1"
        >
          <PiTextHOne className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive('heading', { level: 2 })}
          title="Título 2"
        >
          <PiTextHTwo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive('heading', { level: 3 })}
          title="Título 3"
        >
          <PiTextHThree className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista com marcadores"
        >
          <PiListBullets className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <PiListNumbers className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Citação"
        >
          <PiQuotes className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Alinhar à esquerda"
        >
          <PiTextAlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Centralizar"
        >
          <PiTextAlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Alinhar à direita"
        >
          <PiTextAlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justificar"
        >
          <PiTextAlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Media */}
        <ToolbarButton
          onClick={() => setShowLinkModal(true)}
          title="Inserir link"
        >
          <PiLink className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowImageModal(true)}
          title="Inserir imagem"
        >
          <PiImage className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowYoutubeModal(true)}
          title="Inserir vídeo do YouTube"
        >
          <PiYoutubeLogo className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Blocos Especiais */}
        <div className="flex items-center gap-1 px-2 py-1 bg-aviso/10 rounded">
          <span className="text-xs font-medium text-aviso">
            Blocos Especiais:
          </span>
        </div>

        <ToolbarButton
          onClick={() => setShowComposerModal(true)}
          title="Card de Compositor"
        >
          <PiUser className="w-4 h-4 text-aviso" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowWorkModal(true)}
          title="Card de Obra"
        >
          <PiMusicNotes className="w-4 h-4 text-aviso" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowScoreModal(true)}
          title="Visualizador de Partitura"
        >
          <PiFileAudio className="w-4 h-4 text-aviso" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowAudioModal(true)}
          title="Player de Áudio"
        >
          <PiMusicNotes className="w-4 h-4 text-ouro-texto" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowTimelineModal(true)}
          title="Timeline"
        >
          <PiClock className="w-4 h-4 text-ok" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowVideoComparisonModal(true)}
          title="Comparação de Vídeos"
        >
          <PiColumns className="w-4 h-4 text-atencao" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowQuoteModal(true)}
          title="Citação Musical"
        >
          <PiQuotes className="w-4 h-4 text-ouro-texto" />
        </ToolbarButton>
      </div>

      {/* Modals - ✅ Passar sessionId para modais que precisam */}
      {showLinkModal && (
        <LinkModal editor={editor} onClose={() => setShowLinkModal(false)} />
      )}
      {showImageModal && (
        <ImageModal
          editor={editor}
          onClose={() => setShowImageModal(false)}
          articleId={articleId}
          sessionId={sessionId} // ✅ PASSAR sessionId
        />
      )}
      {showYoutubeModal && (
        <YoutubeModal
          editor={editor}
          onClose={() => setShowYoutubeModal(false)}
        />
      )}
      {showComposerModal && (
        <ComposerModal
          editor={editor}
          onClose={() => setShowComposerModal(false)}
        />
      )}
      {showWorkModal && (
        <WorkModal editor={editor} onClose={() => setShowWorkModal(false)} />
      )}
      {showScoreModal && (
        <ScoreModal editor={editor} onClose={() => setShowScoreModal(false)} />
      )}
      {showAudioModal && (
        <AudioPlayerModal
          editor={editor}
          onClose={() => setShowAudioModal(false)}
        />
      )}
      {showTimelineModal && (
        <TimelineModal
          editor={editor}
          onClose={() => setShowTimelineModal(false)}
          articleId={articleId}
          sessionId={sessionId} // ✅ PASSAR sessionId
        />
      )}
      {showVideoComparisonModal && (
        <VideoComparisonModal
          editor={editor}
          onClose={() => setShowVideoComparisonModal(false)}
        />
      )}
      {showQuoteModal && (
        <QuoteMusicalModal
          editor={editor}
          onClose={() => setShowQuoteModal(false)}
          articleId={articleId} // ✅ Adicionar
          sessionId={sessionId} // ✅ Adicionar
        />
      )}
    </>
  );
}
