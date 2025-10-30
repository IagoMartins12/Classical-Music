// components/blog/FocusModeModal.tsx - Modo Foco Imersivo
'use client';

import Image from 'next/image';
import { JSX, useEffect, useState } from 'react';
import { FiX, FiMinus, FiPlus } from 'react-icons/fi';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: any; // TipTap JSON
  title: string;
}

export function FocusModeModal({
  isOpen,
  onClose,
  content,
  title,
}: FocusModeModalProps) {
  const [fontSize, setFontSize] = useState(18);

  // Detectar tema do sistema

  // Bloquear scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const changeFontSize = (delta: number) => {
    setFontSize((prev) => Math.max(14, Math.min(32, prev + delta)));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className={`absolute inset-0 transition-colors bg-theme-primary duration-300 `}
        onClick={onClose}
      />

      {/* CONTROLES FLUTUANTES */}
      <div className="absolute top-8 right-8 flex items-center space-x-4 z-10">
        {/* Controle de Fonte */}
        <div className="flex items-center space-x-2 bg-theme-elevated rounded-full px-4 py-2 shadow-2xl border border-theme-secondary">
          <button
            onClick={() => changeFontSize(-2)}
            className="p-1 hover:bg-theme-classical rounded-full transition-colors"
            title="Diminuir fonte"
          >
            <FiMinus className="w-4 h-4 text-theme-primary" />
          </button>
          <span className="text-sm font-medium text-theme-primary min-w-[3rem] text-center">
            {fontSize}px
          </span>
          <button
            onClick={() => changeFontSize(2)}
            className="p-1 hover:bg-theme-classical rounded-full transition-colors"
            title="Aumentar fonte"
          >
            <FiPlus className="w-4 h-4 text-theme-primary" />
          </button>
        </div>

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="p-3 bg-red-500 text-white rounded-full shadow-2xl hover:bg-red-600 transition-all"
          title="Fechar (ESC)"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="relative max-w-4xl w-full h-full overflow-y-auto px-8 py-16 z-1">
        <article
          className={`prose max-w-none transition-all duration-300 `}
          style={{ fontSize: `${fontSize}px` }}
        >
          <h1 className="text-4xl font-bold mb-8 leading-tight">{title}</h1>

          {/* RENDERIZAR CONTEÚDO */}
          <div className="article-content leading-relaxed space-y-6">
            {content && typeof content === 'object' && renderContent(content)}
          </div>
        </article>
      </div>
    </div>
  );
}

// ✅ RENDERIZAR CONTEÚDO TIPTAP
function renderContent(json: any): React.ReactNode {
  if (!json || !json.content) return null;

  return json.content.map((node: any, index: number) => {
    return <div key={index}>{renderNode(node)}</div>;
  });
}

function renderNode(node: any): React.ReactNode {
  switch (node.type) {
    case 'paragraph':
      return (
        <p className="mb-4 leading-relaxed">
          {node.content?.map((child: any, i: number) => renderText(child, i))}
        </p>
      );

    case 'heading': {
      const level = node.attrs?.level || 2;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      const className = `font-bold mt-8 mb-4 ${
        level === 1
          ? 'text-4xl'
          : level === 2
            ? 'text-3xl'
            : level === 3
              ? 'text-2xl'
              : 'text-xl'
      }`;

      return (
        <Tag className={className}>
          {node.content?.map((child: any, i: number) => renderText(child, i))}
        </Tag>
      );
    }

    case 'bulletList':
      return (
        <ul className="list-disc list-inside mb-4 space-y-2">
          {node.content?.map((item: any, i: number) => (
            <li key={i}>
              {item.content?.[0]?.content?.map((text: any, j: number) =>
                renderText(text, j)
              )}
            </li>
          ))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol className="list-decimal list-inside mb-4 space-y-2">
          {node.content?.map((item: any, i: number) => (
            <li key={i}>
              {item.content?.[0]?.content?.map((text: any, j: number) =>
                renderText(text, j)
              )}
            </li>
          ))}
        </ol>
      );

    case 'blockquote':
      return (
        <blockquote className="border-l-4 border-brand-primary pl-6 py-4 mb-4 italic bg-opacity-10 bg-brand-primary rounded-r-lg">
          {node.content?.map((child: any, i: number) => (
            <div key={i}>{renderNode(child)}</div>
          ))}
        </blockquote>
      );

    case 'image':
      return (
        <figure className="my-8">
          <Image
            src={node.attrs?.src || ''}
            alt={node.attrs?.alt || ''}
            className="rounded-lg w-full shadow-lg"
          />
          {node.attrs?.title && (
            <figcaption className="text-center text-sm opacity-70 mt-2">
              {node.attrs.title}
            </figcaption>
          )}
        </figure>
      );

    default:
      return null;
  }
}

function renderText(node: any, key: number): React.ReactNode {
  if (node.type !== 'text') return null;

  let text: React.ReactNode = node.text;

  if (node.marks) {
    node.marks.forEach((mark: any) => {
      switch (mark.type) {
        case 'bold':
          text = <strong key={key}>{text}</strong>;
          break;
        case 'italic':
          text = <em key={key}>{text}</em>;
          break;
        case 'underline':
          text = <u key={key}>{text}</u>;
          break;
        case 'strike':
          text = <s key={key}>{text}</s>;
          break;
        case 'code':
          text = (
            <code
              key={key}
              className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono"
            >
              {text}
            </code>
          );
          break;
        case 'link':
          text = (
            <a
              key={key}
              href={mark.attrs?.href || '#'}
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              {text}
            </a>
          );
          break;
      }
    });
  }

  return <span key={key}>{text}</span>;
}
