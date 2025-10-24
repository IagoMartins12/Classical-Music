// components/blog/editor/BlogEditor.tsx - COM SESSIONID
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

interface BlogEditorProps {
  content: any;
  onChange: (content: any) => void;
  placeholder?: string;
  editable?: boolean;
  articleId?: string;
  sessionId?: string; // ✅ NOVO
}

export function BlogEditor({
  content,
  onChange,
  placeholder = 'Comece a escrever seu artigo...',
  editable = true,
  articleId,
  sessionId, // ✅ NOVO
}: BlogEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-lg',
        },
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
        class:
          'prose prose-lg max-w-none focus:outline-none min-h-[500px] px-8 py-6',
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
    return <div className="animate-pulse bg-gray-100 rounded-lg h-[600px]" />;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden classical-card-simple">
      {editable && (
        <EditorToolbar
          editor={editor}
          articleId={articleId}
          sessionId={sessionId} // ✅ PASSAR sessionId
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
