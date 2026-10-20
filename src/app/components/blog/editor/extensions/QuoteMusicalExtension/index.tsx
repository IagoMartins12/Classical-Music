import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { vistaDe } from '../VistaDoBloco';

export const QuoteMusicalExtension = Node.create({
  name: 'quoteMusical',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      quote: { default: '' },
      author: { default: '' },
      backgroundAudioUrl: { default: null },
      backgroundAudioType: { default: 'upload' },
      backgroundAudioVolume: { default: 30 },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="quote-musical"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'quote-musical' }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(vistaDe('Citação musical'));
  },
});
