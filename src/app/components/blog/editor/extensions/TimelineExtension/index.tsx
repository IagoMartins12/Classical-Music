// components/blog/editor/extensions/TimelineExtension.tsx - COM COMPOSITOR E EDIÇÃO
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import Image from 'next/image';
import { FaClock, FaTrash, FaUser } from 'react-icons/fa';

const TimelineComponent = (props: any) => {
  const { node, deleteNode } = props;
  const { events, composerName } = node.attrs;
  const [showControls, setShowControls] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Remover timeline?')) {
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper
      className="timeline my-8 relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* ✅ Controles de Edição */}
      {showControls && (
        <div className="absolute top-0 right-0 flex items-center space-x-2 p-2 bg-white shadow-lg rounded-lg z-10">
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Remover"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ✅ Header com compositor se existir */}
      {composerName && (
        <div className="mb-6 flex items-center space-x-3 p-4 bg-brand-primary/10 rounded-lg border-l-4 border-brand-primary">
          <FaUser className="w-5 h-5 text-brand-primary" />
          <div>
            <p className="text-sm text-theme-tertiary">Timeline de</p>
            <p className="font-semibold text-theme-primary">{composerName}</p>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-theme-tertiary"></div>

        <div className="space-y-8">
          {events.map((event: any, index: number) => (
            <div key={index} className="relative flex items-start space-x-6">
              {/* Ícone */}
              <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary border-4 border-theme-elevated shadow-theme-medium">
                <FaClock className="w-6 h-6 text-theme-primary" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 pb-8">
                <div className="classical-card p-6">
                  <div className="text-sm font-semibold text-brand-primary mb-1">
                    {event.date}
                  </div>
                  <h4 className="text-lg font-bold text-theme-primary mb-2">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-theme-secondary">{event.description}</p>
                  )}
                  {event.image && (
                    <Image
                      src={event.image}
                      alt={event.title}
                      width={800}
                      height={400}
                      className="mt-4 rounded-lg w-full shadow-theme-small"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const TimelineExtension = Node.create({
  name: 'timeline',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      events: {
        default: [],
      },
      composerId: {
        // ✅ NOVO
        default: null,
      },
      composerName: {
        // ✅ NOVO
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="timeline"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'timeline' }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TimelineComponent);
  },
});
