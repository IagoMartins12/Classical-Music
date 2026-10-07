import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { vistaDe } from '../VistaDoBloco';

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
    return ReactNodeViewRenderer(vistaDe('Partitura'));
  },
});
