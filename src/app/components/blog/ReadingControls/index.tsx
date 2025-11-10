// components/blog/ReadingControls.tsx - ATUALIZADO COM TODOS OS RECURSOS
'use client';

import { useState, useEffect } from 'react';

interface ReadingControlsProps {
  isMobile?: boolean;
  onOpenShareModal?: () => void;
  // onOpenFocusMode?: () => void;
}

export function ReadingControls({
  isMobile = false,
  // onOpenFocusMode,
}: ReadingControlsProps) {
  const [fontSize, setFontSize] = useState(18);
  // const [urlCopied, setUrlCopied] = useState(false);

  useEffect(() => {
    const savedFontSize = localStorage.getItem('article-font-size');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
      applyFontSize(parseInt(savedFontSize));
    }
  }, []);

  const applyFontSize = (size: number) => {
    const articleContent = document.querySelector('.prose');
    if (articleContent) {
      (articleContent as HTMLElement).style.fontSize = `${size}px`;
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(14, Math.min(24, fontSize + delta));
    setFontSize(newSize);
    applyFontSize(newSize);
    localStorage.setItem('article-font-size', newSize.toString());
  };

  // ✅ COPIAR URL
  // const copyUrl = async () => {
  //   const url = window.location.href;
  //   try {
  //     await navigator.clipboard.writeText(url);
  //     setUrlCopied(true);
  //     setTimeout(() => setUrlCopied(false), 2000);
  //   } catch (error) {
  //     console.error('Erro ao copiar URL:', error);
  //   }
  // };

  // const ControlButton = ({
  //   icon: Icon,
  //   label,
  //   onClick,
  //   active = false,
  //   badge,
  // }: {
  //   icon: any;
  //   label: string;
  //   onClick: () => void;
  //   active?: boolean;
  //   badge?: string;
  // }) => (
  //   <button
  //     onClick={onClick}
  //     className={`group relative p-3 rounded-lg transition-all ${
  //       active
  //         ? 'bg-theme-classical text-brand-primary'
  //         : 'bg-theme-elevated hover:bg-theme-classical text-theme-secondary hover:text-brand-primary'
  //     }`}
  //     title={label}
  //     aria-label={label}
  //   >
  //     <Icon className="w-5 h-5" />
  //     {badge && (
  //       <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-brand-primary text-white text-xs rounded-full">
  //         {badge}
  //       </span>
  //     )}
  //     <span className="absolute left-full ml-3 px-3 py-2 bg-theme-elevated border border-theme-secondary rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
  //       {label}
  //     </span>
  //   </button>
  // );

  if (isMobile) {
    return <> </>;
  }

  return (
    <div className="sticky top-24">
      <div className="classical-card max-w-24 p-4 pt-0 ">
        {/* <div className="flex gap-2 justify-between">
          <ControlButton
            icon={FaHeart}
            label="Curtir artigo"
            onClick={handleLike}
            active={isLiked}
          />

          <ControlButton
            icon={FaBookmark}
            label="Salvar para ler depois"
            onClick={handleSave}
            active={isSaved}
          />

          <ControlButton
            icon={FaShareAlt}
            label="Compartilhar"
            onClick={() => onOpenShareModal?.()}
          />
        </div> */}

        {/* <div className="h-px bg-theme-secondary my-2" /> */}

        {/* COPIAR URL */}
        {/* <ControlButton
          icon={urlCopied ? FaCheck : FaLink}
          label={urlCopied ? 'URL Copiada!' : 'Copiar URL'}
          onClick={copyUrl}
          active={urlCopied}
        /> */}

        <div className="h-px bg-theme-secondary my-2" />

        {/* Font Size */}
        <div className="space-y-2">
          {/* <div className="flex items-center justify-between px-3">
            <FaFont className="w-4 h-4 text-theme-tertiary" />
            <span className="text-xs text-theme-tertiary">{fontSize}px</span>
          </div> */}
          <div className="flex items-center justify-center flex-col gap-4">
            <button
              onClick={() => handleFontSizeChange(-2)}
              className="flex-1 w-14 py-2 bg-theme-elevated hover:bg-theme-classical rounded-lg text-xs font-medium transition-all"
              disabled={fontSize <= 14}
            >
              A-
            </button>
            <button
              onClick={() => handleFontSizeChange(2)}
              className="flex-1 w-14 py-2 bg-theme-elevated hover:bg-theme-classical rounded-lg text-xs font-medium transition-all"
              disabled={fontSize >= 24}
            >
              A+
            </button>

            {/* <button
              onClick={() => onOpenFocusMode?.()}
              className="flex-1 w-14 py-2 bg-theme-elevated flex justify-center items-center hover:bg-theme-classical rounded-lg text-xs font-medium transition-all"
              disabled={fontSize >= 24}
            >
              <FaBullseye className="w-4 h-4" />
            </button> */}
          </div>
        </div>

        {/* <div className="h-px bg-theme-secondary my-2" />

        <ControlButton
          icon={FaBullseye}
          label="Modo Foco"
          onClick={() => onOpenFocusMode?.()}
        /> */}
      </div>
    </div>
  );
}
