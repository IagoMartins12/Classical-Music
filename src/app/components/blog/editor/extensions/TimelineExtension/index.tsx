// components/blog/editor/extensions/TimelineExtension.tsx - COM COMPOSITOR E EDIÇÃO
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import Image from '@/app/components/SmartImage';
import { PiClock, PiTrash, PiUser } from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

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
        <Inline
          gap={2}
          className="absolute top-0 right-0 p-2 bg-white shadow-lg rounded-lg z-10"
        >
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Remover"
          >
            <PiTrash className="w-4 h-4" />
          </button>
        </Inline>
      )}

      {/* ✅ Header com compositor se existir */}
      {composerName && (
        <Inline
          gap={3}
          className="mb-6 p-4 bg-brand-primary/10 rounded-lg border-l-4 border-brand-primary"
        >
          <PiUser className="w-5 h-5 text-brand-primary" />
          <div>
            <Text papel="rotulo" tom="fraco" as="p">
              Timeline de
            </Text>
            <p className="font-semibold text-theme-primary">{composerName}</p>
          </div>
        </Inline>
      )}

      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-theme-tertiary"></div>

        <Stack gap={8}>
          {events.map((event: any, index: number) => (
            <div key={index} className="relative flex items-start space-x-6">
              {/* Ícone */}
              <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary border-4 border-theme-elevated shadow-theme-medium">
                <PiClock className="w-6 h-6 text-theme-primary" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 pb-8">
                <Card>
                  <Text
                    papel="rotulo"
                    tom="ouro"
                    as="div"
                    className="font-semibold mb-1"
                  >
                    {event.date}
                  </Text>
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
                </Card>
              </div>
            </div>
          ))}
        </Stack>
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
