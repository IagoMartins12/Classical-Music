import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { vistaDe } from '../VistaDoBloco';

export const VideoComparisonExtension = Node.create({
  name: 'videoComparison',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      title: {
        default: 'Comparação de Performances',
      },
      video1: {
        default: {
          url: '',
          title: '',
          description: '',
        },
      },
      video2: {
        default: {
          url: '',
          title: '',
          description: '',
        },
      },
      layout: {
        default: 'side-by-side',
      },
      syncPlayback: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video-comparison"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'video-comparison' }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(vistaDe('Comparação de vídeos'));
  },
});
