// ============================================
// VideoComparisonExtension - COM EDIÇÃO/REMOÇÃO
// ============================================
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import { BiPlay } from 'react-icons/bi';
import { FiColumns } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';

const VideoComparisonComponent = (props: any) => {
  const { node, deleteNode } = props;
  const { title, video1, video2, layout, syncPlayback } = node.attrs;
  const [showControls, setShowControls] = useState(false);

  const extractVideoId = (url: string): string | null => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const videoId1 = extractVideoId(video1.url);
  const videoId2 = extractVideoId(video2.url);

  const handleDelete = () => {
    if (window.confirm('Remover comparação de vídeos?')) {
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper
      className="video-comparison my-8 relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="classical-card overflow-hidden border-l-4 border-accent-red">
        {/* Header */}
        <div className="bg-accent-red text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiColumns className="w-6 h-6" />
              <div>
                <h4 className="font-bold">
                  {title || 'Comparação de Performances'}
                </h4>
                {syncPlayback && (
                  <p className="text-sm opacity-90">Reprodução sincronizada</p>
                )}
              </div>
            </div>

            {/* ✅ Controles de Edição */}
            {showControls && (
              <button
                onClick={handleDelete}
                className="p-2 bg-white/20 rounded-lg hover:bg-red-700 transition-colors"
                title="Remover"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Videos */}
        <div
          className={`bg-theme-elevated p-4 ${
            layout === 'side-by-side' ? 'grid grid-cols-2 gap-4' : 'space-y-4'
          }`}
        >
          {/* Video 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-theme-secondary px-4 py-2 rounded-lg">
              <div>
                <h5 className="font-semibold text-theme-primary">
                  {video1.title}
                </h5>
                <p className="text-sm text-theme-secondary">
                  {video1.description}
                </p>
              </div>
              <BiPlay className="w-5 h-5 text-accent-red" />
            </div>

            <div className="aspect-video rounded-lg overflow-hidden shadow-theme-medium">
              <iframe
                src={`https://www.youtube.com/embed/${videoId1}${
                  syncPlayback ? '?enablejsapi=1' : ''
                }`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Video 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-theme-secondary px-4 py-2 rounded-lg">
              <div>
                <h5 className="font-semibold text-theme-primary">
                  {video2.title}
                </h5>
                <p className="text-sm text-theme-secondary">
                  {video2.description}
                </p>
              </div>
              <BiPlay className="w-5 h-5 text-accent-red" />
            </div>

            <div className="aspect-video rounded-lg overflow-hidden shadow-theme-medium">
              <iframe
                src={`https://www.youtube.com/embed/${videoId2}${
                  syncPlayback ? '?enablejsapi=1' : ''
                }`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

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
    return ReactNodeViewRenderer(VideoComparisonComponent);
  },
});
