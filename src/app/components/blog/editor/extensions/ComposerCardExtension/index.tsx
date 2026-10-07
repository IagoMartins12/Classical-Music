import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { vistaDe } from '../VistaDoBloco';

export const ComposerCardExtension = Node.create({
  name: 'composerCard',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      composerId: {
        default: null,
      },
      composerName: {
        default: null,
      },
      composerImage: {
        default: null,
      },
      composerBio: {
        default: null,
      },
      composerBirthDate: {
        default: null,
      },
      composerDeathDate: {
        default: null,
      },
      composerNationality: {
        // ✅ ADICIONADO
        default: null,
      },
      composerInstrumentation: {
        default: null,
      },
      composerEpoch: {
        default: null,
      },
      composerWikipediaLink: {
        // ✅ ADICIONADO
        default: null,
      },
      layout: {
        default: 'vertical',
      },
      showWorksButton: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="composer-card"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'composer-card' }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(vistaDe('Compositor'));
  },
});
