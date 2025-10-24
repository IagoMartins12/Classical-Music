// ============================================
// ScoreViewerExtension - COM EDIÇÃO/REMOÇÃO
// ============================================
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import { BiDownload } from 'react-icons/bi';
import { FiFile, FiMaximize2 } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';

const ScoreViewerComponent = (props: any) => {
  const { node, deleteNode } = props;
  const {
    workId,
    scoreUrl,
    scoreTitle,
    workTitle,
    composerName,
    pageNumber,
    allowDownload,
  } = node.attrs;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Remover visualizador de partitura?')) {
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper
      className="score-viewer my-6 relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="classical-card overflow-hidden border-l-4 border-accent-green">
        {/* Header */}
        <div className="bg-accent-green text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiFile className="w-6 h-6" />
              <div>
                <h4 className="font-bold">{scoreTitle || 'Partitura'}</h4>
                <p className="text-sm opacity-90">
                  {workTitle} - {composerName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* ✅ Controles de Edição */}
              {showControls && (
                <button
                  onClick={handleDelete}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Remover"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              )}

              {allowDownload && (
                <a
                  href={scoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  title="Download"
                >
                  <BiDownload className="w-5 h-5" />
                </a>
              )}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Tela cheia"
              >
                <FiMaximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Viewer */}
        <div
          className={`bg-theme-elevated ${
            isFullscreen ? 'fixed inset-0 z-50' : 'relative'
          }`}
        >
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-theme-primary/80 backdrop-blur text-theme-inverse rounded-lg hover:bg-theme-primary transition-colors shadow-theme-large"
            >
              Fechar
            </button>
          )}

          <iframe
            src={`${scoreUrl}#page=${pageNumber || 1}`}
            className={`w-full ${isFullscreen ? 'h-screen' : 'h-[600px]'} border-0`}
            title={scoreTitle}
          />
        </div>

        {/* Footer */}
        <div className="bg-theme-secondary px-6 py-4 border-t border-theme-secondary">
          <div className="flex items-center justify-between text-sm">
            <span className="text-theme-secondary">
              Página {pageNumber || 1}
            </span>
            <a
              href={`/works/${workId}#scores`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-green hover:text-brand-primary font-medium transition-colors"
            >
              Ver partitura completa no Opus Atlas →
            </a>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const ScoreViewerExtension = Node.create({
  name: 'scoreViewer',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      workId: {
        default: null,
      },
      scoreId: {
        default: null,
      },
      scoreUrl: {
        default: null,
      },
      scoreTitle: {
        default: null,
      },
      workTitle: {
        default: null,
      },
      composerName: {
        default: null,
      },
      pageNumber: {
        default: 1,
      },
      allowDownload: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="score-viewer"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'score-viewer' }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ScoreViewerComponent);
  },
});
