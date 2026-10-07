'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useEffect } from 'react';
import { ComposerCardExtension } from '../extensions/ComposerCardExtension';
import { WorkCardExtension } from '../extensions/WorkCardExtension';
import { ScoreViewerExtension } from '../extensions/ScoreViewerExtension';
import { AudioPlayerExtension } from '../extensions/AudioPlayerExtension';
import { TimelineExtension } from '../extensions/TimelineExtension';
import { VideoComparisonExtension } from '../extensions/VideoComparisonExtension';
import { QuoteMusicalExtension } from '../extensions/QuoteMusicalExtension';
import { EditorToolbar } from '../EditorToolbar';
import { Skeleton } from '@/app/components/ui/Skeleton';

/**
 * O editor do artigo (TipTap).
 *
 * **Escreve-se no texto do artigo.** A área usa o `.blog-corpo` do leitor (a
 * Garamond, o tamanho, o ritmo dos títulos e listas) e os blocos próprios se
 * desenham como no artigo (`VistaDoBloco`): o que se vê aqui é o que sai
 * publicado. O link não é azul nem leva classe: o `.blog-corpo` já desenha.
 */

interface BlogEditorProps {
  content: any;
  onChange: (content: any) => void;
  placeholder?: string;
  editable?: boolean;
  articleId?: string;
  sessionId?: string;
}

export function BlogEditor({
  content,
  onChange,
  placeholder = 'Comece a escrever seu artigo...',
  editable = true,
  articleId,
  sessionId,
}: BlogEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({ openOnClick: false }),
      Image.configure({
        HTMLAttributes: { class: 'h-auto max-w-full rounded-card' },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: { class: 'aspect-video h-auto w-full rounded-card' },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      TextStyle,
      Placeholder.configure({
        placeholder,
      }),
      ComposerCardExtension,
      WorkCardExtension,
      ScoreViewerExtension,
      AudioPlayerExtension,
      TimelineExtension,
      VideoComparisonExtension,
      QuoteMusicalExtension,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json);
    },
    editorProps: {
      attributes: {
        class: 'blog-corpo min-h-[32rem] px-5 py-8 focus:outline-none sm:px-10',
        lang: 'pt-BR',
        'aria-label': 'Texto do artigo',
      },
    },
  });

  useEffect(() => {
    if (
      editor &&
      content &&
      JSON.stringify(editor.getJSON()) !== JSON.stringify(content)
    ) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return <Skeleton className="h-[28rem] w-full rounded-card" />;
  }

  return (
    <div className="rounded-card bg-[var(--campo)]">
      {editable && (
        <EditorToolbar
          editor={editor}
          articleId={articleId}
          sessionId={sessionId}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
