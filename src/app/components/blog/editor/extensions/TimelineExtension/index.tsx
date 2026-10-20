import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { vistaDe } from '../VistaDoBloco';

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
    return ReactNodeViewRenderer(vistaDe('Linha do tempo'));
  },
});
