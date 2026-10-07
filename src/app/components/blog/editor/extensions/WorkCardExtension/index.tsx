import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { vistaDe } from '../VistaDoBloco';

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
    return ReactNodeViewRenderer(vistaDe('Obra'));
  },
});
