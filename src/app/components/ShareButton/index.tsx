// components/ShareButton.tsx - Componente reutilizável de compartilhamento
'use client';

import { useState } from 'react';
import { FiShare2, FiCopy, FiExternalLink, FiCheck, FiX } from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaTelegram, FaFacebook } from 'react-icons/fa';

interface ShareButtonProps {
  url?: string;
  title: string;
  description?: string;
  variant?: 'default' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ShareButton({
  url,
  title,
  description,
  variant = 'default',
  size = 'md',
  className = '',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // URL atual se não fornecida
  const shareUrl =
    url || (typeof window !== 'undefined' ? window.location.href : '');

  // Definir tamanhos
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar URL:', error);
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description || '');

    let shareLink = '';

    switch (platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }

    setIsOpen(false);
  };

  // Usar Web Share API se disponível
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
        return;
      } catch (error) {
        console.log('Erro no share nativo:', error);
      }
    }

    // Fallback para o menu personalizado
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botão principal */}
      <button
        onClick={handleNativeShare}
        className={`
          ${sizeClasses[size]}
          ${
            variant === 'minimal'
              ? 'bg-transparent border-2 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-theme-primary'
              : 'bg-interactive-hover border border-theme-primary text-theme-primary hover:bg-brand-primary/20 hover:border-brand-primary hover:text-brand-primary'
          }
          rounded-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group
        `}
        title="Compartilhar"
      >
        <FiShare2
          className={`${iconSizes[size]} group-hover:rotate-12 transition-transform duration-300`}
        />
      </button>

      {/* Menu de compartilhamento */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 bg-theme-elevated border border-theme-primary rounded-2xl shadow-theme-glow p-4 z-50 min-w-64 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-theme-primary">
                Compartilhar
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-interactive-hover rounded-lg flex items-center justify-center text-theme-tertiary hover:text-theme-primary transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Título da página */}
            <div className="mb-4 p-3 bg-gradient-card rounded-xl border border-theme-secondary">
              <h4 className="font-medium text-theme-primary text-sm mb-1">
                {title}
              </h4>
              {description && (
                <p className="text-theme-secondary text-xs line-clamp-2">
                  {description}
                </p>
              )}
            </div>

            {/* Copiar URL */}
            <div className="mb-4">
              <label className="text-sm font-medium text-theme-secondary mb-2 block">
                Copiar Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 input-classical text-sm py-2"
                />
                <button
                  onClick={handleCopy}
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                    ${
                      copied
                        ? 'bg-accent-green text-theme-primary'
                        : 'bg-interactive-hover border border-theme-primary text-theme-primary hover:bg-brand-primary/20'
                    }
                  `}
                >
                  {copied ? (
                    <FiCheck className="w-5 h-5" />
                  ) : (
                    <FiCopy className="w-5 h-5" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-accent-green text-xs mt-1 flex items-center">
                  <FiCheck className="w-3 h-3 mr-1" />
                  Link copiado!
                </p>
              )}
            </div>

            {/* Plataformas de compartilhamento */}
            <div>
              <label className="text-sm font-medium text-theme-secondary mb-3 block">
                Compartilhar em
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center space-x-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 hover:bg-green-500/20 transition-all duration-300 group"
                >
                  <FaWhatsapp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center space-x-3 p-3 bg-blue-400/10 border border-blue-400/30 rounded-xl text-blue-400 hover:bg-blue-400/20 transition-all duration-300 group"
                >
                  <FaTwitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Twitter</span>
                </button>

                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center space-x-3 p-3 bg-blue-600/10 border border-blue-600/30 rounded-xl text-blue-600 hover:bg-blue-600/20 transition-all duration-300 group"
                >
                  <FaFacebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Facebook</span>
                </button>

                <button
                  onClick={() => handleShare('telegram')}
                  className="flex items-center space-x-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-500 hover:bg-blue-500/20 transition-all duration-300 group"
                >
                  <FaTelegram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Telegram</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
