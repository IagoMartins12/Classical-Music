// components/blog/editor/extensions/ComposerCardExtension.tsx - ATUALIZADO COM WIKIPEDIA
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import Image from '@/app/components/SmartImage';
import Link from 'next/link';
import { PiTrash } from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

const ComposerCardComponent = (props: any) => {
  const { node, deleteNode } = props;
  const {
    composerId,
    composerName,
    composerImage,
    composerBio,
    composerBirthDate,
    composerDeathDate,
    composerNationality,
    composerInstrumentation,
    composerEpoch,
    composerWikipediaLink,
    layout,
    showWorksButton,
  } = node.attrs;

  const [showControls, setShowControls] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Remover card de compositor?')) {
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper
      className="composer-card my-6 relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Controles de Edição */}
      {showControls && (
        <Inline
          gap={2}
          className="absolute top-4 right-4 z-10 p-2 shadow-lg rounded-lg"
        >
          <button
            onClick={handleDelete}
            className="p-2 text-erro hover:bg-erro/10 rounded transition-colors"
            title="Remover"
          >
            <PiTrash className="w-4 h-4" />
          </button>
        </Inline>
      )}

      {/* Card do Compositor */}
      <div
        className={`border classical-card rounded-lg border-ouro/40 shadow-md p-6 ${
          layout === 'horizontal' ? 'flex items-start space-x-6' : ''
        }`}
      >
        {/* Imagem */}
        {composerImage && (
          <div
            className={
              layout === 'horizontal' ? 'flex-shrink-0' : 'mb-4 text-center'
            }
          >
            <Image
              src={composerImage}
              alt={composerName}
              width={layout === 'horizontal' ? 120 : 160}
              height={layout === 'horizontal' ? 120 : 160}
              className={`${
                layout === 'horizontal' ? 'w-28 h-28' : 'w-40 h-40 mx-auto'
              } rounded-full object-cover shadow-md`}
            />
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex-1">
          <h3
            className={`text-2xl font-bold text-theme-primary mb-2 ${layout === 'vertical' ? 'text-center' : ''}`}
          >
            {composerName}
          </h3>

          {/* Datas */}
          {(composerBirthDate || composerDeathDate) && (
            <p
              className={`text-sm text-theme-secondary mb-2 ${layout === 'vertical' ? 'text-center' : ''}`}
            >
              📅 {composerBirthDate || '?'} - {composerDeathDate || 'Presente'}
            </p>
          )}

          {/* Época */}
          {composerEpoch && (
            <p
              className={`text-sm text-ouro-texto font-medium mb-2 ${layout === 'vertical' ? 'text-center' : ''}`}
            >
              📜 Época: {composerEpoch}
            </p>
          )}

          {/* ✅ NACIONALIDADE ADICIONADA */}
          {composerNationality && (
            <p
              className={`text-sm text-theme-tertiary mb-2 ${layout === 'vertical' ? 'text-center' : ''}`}
            >
              🌍 {composerNationality}
            </p>
          )}

          {/* Instrumentação */}
          {composerInstrumentation && (
            <p
              className={`text-sm text-theme-tertiary mb-3 ${layout === 'vertical' ? 'text-center' : ''}`}
            >
              🎼 {composerInstrumentation}
            </p>
          )}

          {/* Biografia */}
          {composerBio && (
            <Text
              papel="rotulo"
              tom="suave"
              as="p"
              className="mb-4 leading-relaxed"
            >
              {composerBio}
            </Text>
          )}

          {/* Botões */}
          <div
            className={`flex items-center space-x-2 mt-4 ${layout === 'vertical' ? 'justify-center' : ''}`}
          >
            <Link
              href={`/composer/${composerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-ouro text-sobre-ouro text-sm rounded-lg hover:opacity-90 transition-opacity shadow-sm inline-flex items-center"
            >
              Ver no Opus Atlas →
            </Link>

            {showWorksButton && (
              <Link
                href={`/composer/${composerId}#works`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-sup-2 text-texto-suave text-sm rounded-lg hover:bg-linha-forte transition-colors inline-flex items-center"
              >
                Ver Obras
              </Link>
            )}

            {/* ✅ BOTÃO WIKIPEDIA ADICIONADO */}
            {composerWikipediaLink && (
              <Link
                href={composerWikipediaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-aviso/10 text-aviso text-sm rounded-lg hover:bg-aviso/10 transition-colors inline-flex items-center"
              >
                Wikipedia
              </Link>
            )}
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

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
    return ReactNodeViewRenderer(ComposerCardComponent);
  },
});
