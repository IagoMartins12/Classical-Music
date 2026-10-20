import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { vistaDe } from '../VistaDoBloco';

export const AudioPlayerExtension = Node.create({
  name: 'audioPlayer',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      audioUrl: {
        default: null,
      },
      audioType: {
        default: 'upload', // 'upload' ou 'youtube'
      },
      title: {
        default: 'Áudio sem título',
      },
      composerId: {
        default: null,
      },
      composerName: {
        default: null,
      },
      workId: {
        default: null,
      },
      workTitle: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="audio-player"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'audio-player' }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(vistaDe('Áudio'));
  },
});
