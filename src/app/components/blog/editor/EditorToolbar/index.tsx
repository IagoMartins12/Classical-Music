// components/blog/editor/EditorToolbar.tsx - COM SESSIONID
'use client';

import { Editor } from '@tiptap/react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaCode,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaLink,
  FaImage,
  FaYoutube,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaUndo,
  FaRedo,
  FaMusic,
  FaUser,
  FaFileAudio,
  FaClock,
  FaColumns,
} from 'react-icons/fa';
import { BsTypeH1, BsTypeH2, BsTypeH3 } from 'react-icons/bs';
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
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-gray-200 text-blue-600' : 'text-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Desfazer (Ctrl+Z)"
        >
          <FaUndo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Refazer (Ctrl+Y)"
        >
          <FaRedo className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Negrito (Ctrl+B)"
        >
          <FaBold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Itálico (Ctrl+I)"
        >
          <FaItalic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Sublinhado (Ctrl+U)"
        >
          <FaUnderline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Riscado"
        >
          <FaStrikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Código"
        >
          <FaCode className="w-4 h-4" />
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
          <BsTypeH1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive('heading', { level: 2 })}
          title="Título 2"
        >
          <BsTypeH2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive('heading', { level: 3 })}
          title="Título 3"
        >
          <BsTypeH3 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista com marcadores"
        >
          <FaListUl className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <FaListOl className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Citação"
        >
          <FaQuoteRight className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Alinhar à esquerda"
        >
          <FaAlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Centralizar"
        >
          <FaAlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Alinhar à direita"
        >
          <FaAlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justificar"
        >
          <FaAlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Media */}
        <ToolbarButton
          onClick={() => setShowLinkModal(true)}
          title="Inserir link"
        >
          <FaLink className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowImageModal(true)}
          title="Inserir imagem"
        >
          <FaImage className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowYoutubeModal(true)}
          title="Inserir vídeo do YouTube"
        >
          <FaYoutube className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Blocos Especiais */}
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded">
          <span className="text-xs font-medium text-blue-700">
            Blocos Especiais:
          </span>
        </div>

        <ToolbarButton
          onClick={() => setShowComposerModal(true)}
          title="Card de Compositor"
        >
          <FaUser className="w-4 h-4 text-blue-600" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowWorkModal(true)}
          title="Card de Obra"
        >
          <FaMusic className="w-4 h-4 text-blue-600" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowScoreModal(true)}
          title="Visualizador de Partitura"
        >
          <FaFileAudio className="w-4 h-4 text-blue-600" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowAudioModal(true)}
          title="Player de Áudio"
        >
          <FaMusic className="w-4 h-4 text-purple-600" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowTimelineModal(true)}
          title="Timeline"
        >
          <FaClock className="w-4 h-4 text-green-600" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowVideoComparisonModal(true)}
          title="Comparação de Vídeos"
        >
          <FaColumns className="w-4 h-4 text-orange-600" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowQuoteModal(true)}
          title="Citação Musical"
        >
          <FaQuoteRight className="w-4 h-4 text-purple-600" />
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
