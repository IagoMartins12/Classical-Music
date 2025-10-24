// ============================================
// WorkCardExtension - COM EDIÇÃO/REMOÇÃO
// ============================================
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import Link from 'next/link';
import { BiMusic } from 'react-icons/bi';
import { FaTrash } from 'react-icons/fa';

const WorkCardComponent = (props: any) => {
  const { node, deleteNode } = props;
  const { workId, workTitle, composerName, instrumentName } = node.attrs;
  const [showControls, setShowControls] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Remover card de obra?')) {
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper
      className="work-card my-6 relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* ✅ Controles de Edição */}
      {showControls && (
        <div className="absolute top-2 right-2 flex items-center space-x-2 p-2 bg-white shadow-lg rounded-lg z-10">
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Remover"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="classical-card p-6 border-l-4 border-accent-purple">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-accent-purple rounded-lg shadow-theme-medium">
            <BiMusic className="w-8 h-8 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-theme-primary mb-1">
              {workTitle}
            </h3>
            <p className="text-theme-secondary mb-3">
              {composerName} • {instrumentName}
            </p>

            <div className="flex items-center space-x-2">
              <Link
                href={`/works/${workId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-accent-purple text-white rounded-lg hover:opacity-90 transition-opacity shadow-theme-small"
              >
                Ver Obra →
              </Link>
              <Link
                href={`/works/${workId}#scores`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-theme-elevated border border-accent-purple text-accent-purple rounded-lg hover:bg-interactive-hover transition-colors"
              >
                Ver Partituras
              </Link>
            </div>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const WorkCardExtension = Node.create({
  name: 'workCard',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      workId: {
        default: null,
      },
      workTitle: {
        default: null,
      },
      composerName: {
        default: null,
      },
      instrumentName: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="work-card"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'work-card' }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(WorkCardComponent);
  },
});
