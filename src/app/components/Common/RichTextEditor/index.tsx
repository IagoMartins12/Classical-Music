// components/Common/RichTextEditor.tsx
'use client';

import { useRef, forwardRef, useState, useEffect } from 'react';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiType,
  FiLink,
  FiCode,
  FiEye,
  FiEdit3,
} from 'react-icons/fi';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  error?: string;
  label?: string;
  disabled?: boolean;
}

const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Digite o conteúdo...',
      height = '300px',
      error,
      label,
      disabled = false,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isPreview, setIsPreview] = useState(false);
    const [isActive, setIsActive] = useState({
      bold: false,
      italic: false,
      underline: false,
    });

    useEffect(() => {
      if (
        editorRef.current &&
        value !== editorRef.current.innerHTML &&
        !isPreview
      ) {
        editorRef.current.innerHTML = value;
      }
    }, [value, isPreview]);

    const handleCommand = (command: string, value?: string) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      updateContent();
      updateButtonStates();
    };

    const updateContent = () => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        onChange(content);
      }
    };

    const updateButtonStates = () => {
      setIsActive({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
      });
    };

    const handleKeyUp = () => {
      updateButtonStates();
      updateContent();
    };

    const handleInput = () => {
      updateContent();
    };

    const insertHeading = (level: number) => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const heading = document.createElement(`h${level}`);

        if (range.collapsed) {
          heading.textContent = `Título ${level}`;
        } else {
          heading.appendChild(range.extractContents());
        }

        range.insertNode(heading);
        range.selectNodeContents(heading);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      updateContent();
    };

    const insertLink = () => {
      const url = prompt('Digite a URL:');
      if (url) {
        handleCommand('createLink', url);
      }
    };

    const insertBlockquote = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const blockquote = document.createElement('blockquote');

        if (range.collapsed) {
          blockquote.innerHTML = '<p>Citação...</p>';
        } else {
          blockquote.appendChild(range.extractContents());
        }

        range.insertNode(blockquote);
        range.selectNodeContents(blockquote);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      updateContent();
    };

    const togglePreview = () => {
      setIsPreview(!isPreview);
    };

    const ToolbarButton = ({
      onClick,
      icon: Icon,
      isActive = false,
      title,
    }: {
      onClick: () => void;
      icon: any;
      isActive?: boolean;
      title: string;
    }) => (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`
        p-2 rounded-md border transition-all duration-200
        ${
          isActive
            ? 'bg-brand-primary text-white border-brand-primary'
            : 'bg-theme-secondary-bg text-theme-tertiary border-theme-secondary hover:bg-interactive-hover hover:text-brand-primary'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      >
        <Icon className="w-4 h-4" />
      </button>
    );

    const HeadingButton = ({
      level,
      onClick,
    }: {
      level: number;
      onClick: () => void;
    }) => (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="px-3 py-1 text-sm bg-theme-secondary-bg text-theme-tertiary border border-theme-secondary rounded hover:bg-interactive-hover hover:text-brand-primary transition-all"
      >
        H{level}
      </button>
    );

    return (
      <div ref={ref} className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-theme-tertiary">
              {label}
            </label>
            <button
              type="button"
              onClick={togglePreview}
              className="p-1 text-theme-tertiary hover:text-brand-primary transition-colors"
              title={isPreview ? 'Editar' : 'Visualizar'}
            >
              {isPreview ? (
                <FiEdit3 className="w-4 h-4" />
              ) : (
                <FiEye className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        <div className={`rich-text-editor ${error ? 'error' : ''}`}>
          {/* Toolbar */}
          {!isPreview && (
            <div className="toolbar bg-theme-secondary-bg border border-theme-secondary border-b-0 rounded-t-lg p-3 flex flex-wrap gap-2">
              {/* Headings */}
              <div className="flex gap-1">
                <HeadingButton level={1} onClick={() => insertHeading(1)} />
                <HeadingButton level={2} onClick={() => insertHeading(2)} />
                <HeadingButton level={3} onClick={() => insertHeading(3)} />
              </div>

              <div className="w-px h-6 bg-theme-secondary"></div>

              {/* Format */}
              <div className="flex gap-1">
                <ToolbarButton
                  onClick={() => handleCommand('bold')}
                  icon={FiBold}
                  isActive={isActive.bold}
                  title="Negrito (Ctrl+B)"
                />
                <ToolbarButton
                  onClick={() => handleCommand('italic')}
                  icon={FiItalic}
                  isActive={isActive.italic}
                  title="Itálico (Ctrl+I)"
                />
                <ToolbarButton
                  onClick={() => handleCommand('underline')}
                  icon={FiUnderline}
                  isActive={isActive.underline}
                  title="Sublinhado (Ctrl+U)"
                />
              </div>

              <div className="w-px h-6 bg-theme-secondary"></div>

              {/* Lists */}
              <div className="flex gap-1">
                <ToolbarButton
                  onClick={() => handleCommand('insertUnorderedList')}
                  icon={FiList}
                  title="Lista com marcadores"
                />
                <ToolbarButton
                  onClick={() => handleCommand('insertOrderedList')}
                  icon={FiType}
                  title="Lista numerada"
                />
              </div>

              <div className="w-px h-6 bg-theme-secondary"></div>

              {/* Alignment */}
              <div className="flex gap-1">
                <ToolbarButton
                  onClick={() => handleCommand('justifyLeft')}
                  icon={FiAlignLeft}
                  title="Alinhar à esquerda"
                />
                <ToolbarButton
                  onClick={() => handleCommand('justifyCenter')}
                  icon={FiAlignCenter}
                  title="Centralizar"
                />
                <ToolbarButton
                  onClick={() => handleCommand('justifyRight')}
                  icon={FiAlignRight}
                  title="Alinhar à direita"
                />
              </div>

              <div className="w-px h-6 bg-theme-secondary"></div>

              {/* Other */}
              <div className="flex gap-1">
                <ToolbarButton
                  onClick={insertLink}
                  icon={FiLink}
                  title="Inserir link"
                />
                <ToolbarButton
                  onClick={insertBlockquote}
                  icon={FiCode}
                  title="Citação"
                />
              </div>
            </div>
          )}

          {/* Editor / Preview */}
          {isPreview ? (
            <div
              className="preview-content border border-theme-secondary rounded-lg p-4 bg-theme-primary-bg text-theme-primary"
              style={{ minHeight: height }}
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <div
              ref={editorRef}
              contentEditable={!disabled}
              onInput={handleInput}
              onKeyUp={handleKeyUp}
              onMouseUp={updateButtonStates}
              className={`
              editor-content border border-theme-secondary ${
                !isPreview ? 'border-t-0' : ''
              } rounded-b-lg p-4
              bg-theme-primary-bg text-theme-primary
              focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-inset
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-text'}
            `}
              style={{
                minHeight: height,
                fontSize: '14px',
                lineHeight: '1.6',
              }}
              suppressContentEditableWarning={true}
              data-placeholder={placeholder}
            />
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        <style jsx>{`
          .editor-content:empty::before {
            content: attr(data-placeholder);
            color: rgb(var(--theme-tertiary));
            font-style: normal;
            pointer-events: none;
          }

          .editor-content h1,
          .preview-content h1 {
            font-size: 1.5em;
            font-weight: 600;
            margin: 16px 0 8px 0;
            color: rgb(var(--theme-primary));
          }

          .editor-content h2,
          .preview-content h2 {
            font-size: 1.25em;
            font-weight: 600;
            margin: 16px 0 8px 0;
            color: rgb(var(--theme-primary));
          }

          .editor-content h3,
          .preview-content h3 {
            font-size: 1.1em;
            font-weight: 600;
            margin: 16px 0 8px 0;
            color: rgb(var(--theme-primary));
          }

          .editor-content p,
          .preview-content p {
            margin: 8px 0;
          }

          .editor-content ul,
          .editor-content ol,
          .preview-content ul,
          .preview-content ol {
            margin: 8px 0;
            padding-left: 1.5em;
          }

          .editor-content li,
          .preview-content li {
            margin: 4px 0;
          }

          .editor-content blockquote,
          .preview-content blockquote {
            border-left: 4px solid rgb(var(--brand-primary));
            margin: 16px 0;
            padding-left: 16px;
            font-style: italic;
            color: rgb(var(--theme-secondary));
            background-color: rgba(var(--brand-primary-rgb), 0.05);
            border-radius: 0 4px 4px 0;
            padding: 12px 16px;
          }

          .editor-content a,
          .preview-content a {
            color: rgb(var(--brand-primary));
            text-decoration: underline;
          }

          .editor-content a:hover,
          .preview-content a:hover {
            opacity: 0.8;
          }

          .rich-text-editor.error .toolbar,
          .rich-text-editor.error .editor-content,
          .rich-text-editor.error .preview-content {
            border-color: #ef4444;
          }
        `}</style>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
