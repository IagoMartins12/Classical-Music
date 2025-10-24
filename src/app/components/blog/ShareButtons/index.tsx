'use client';

import { useState, useEffect } from 'react';
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaTelegram,
  FaEnvelope,
  FaLink,
  FaCheck,
} from 'react-icons/fa';

interface ShareButtonsProps {
  // Permite receber URL e título como props (opcional)
  url?: string;
  title?: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps = {}) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Estados para URL e título
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentTitle, setCurrentTitle] = useState('Artigo');

  useEffect(() => {
    // Marca como montado
    setMounted(true);

    // Define URL e título após montagem (client-side only)
    if (typeof window !== 'undefined') {
      setCurrentUrl(url || window.location.href);
      setCurrentTitle(title || document.title || 'Artigo');
    }
  }, [url, title]);

  const copyToClipboard = async () => {
    if (!mounted || !currentUrl) return;

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  // Não renderiza links até estar montado no cliente
  // Isso evita divergências de hidratação
  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-theme-tertiary font-medium">
          Compartilhar:
        </span>
        <div className="flex items-center gap-2">
          {/* Placeholder com mesma estrutura mas sem URLs dinâmicas */}
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="p-2 rounded-lg bg-theme-elevated opacity-50 animate-pulse"
            >
              <div className="w-5 h-5 bg-theme-tertiary/20 rounded" />
            </div>
          ))}
          <div className="p-2 rounded-lg bg-theme-elevated opacity-50 animate-pulse">
            <div className="w-5 h-5 bg-theme-tertiary/20 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Links de compartilhamento
  const shareLinks = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}`,
      color: '#1877F2',
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        currentUrl
      )}&text=${encodeURIComponent(currentTitle)}`,
      color: '#1DA1F2',
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        currentUrl
      )}`,
      color: '#0A66C2',
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        currentTitle + ' ' + currentUrl
      )}`,
      color: '#25D366',
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      url: `https://t.me/share/url?url=${encodeURIComponent(
        currentUrl
      )}&text=${encodeURIComponent(currentTitle)}`,
      color: '#0088CC',
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      url: `mailto:?subject=${encodeURIComponent(
        currentTitle
      )}&body=${encodeURIComponent(currentUrl)}`,
      color: '#EA4335',
    },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-theme-tertiary font-medium">
        Compartilhar:
      </span>

      {/* Social Share Buttons */}
      <div className="flex items-center gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-theme-elevated hover:bg-theme-classical transition-all group"
            title={`Compartilhar no ${link.name}`}
            style={
              {
                '--hover-color': link.color,
              } as React.CSSProperties
            }
          >
            <link.icon
              className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors"
              style={
                {
                  '--icon-color': link.color,
                } as React.CSSProperties
              }
            />
          </a>
        ))}

        {/* Copy Link Button */}
        <button
          onClick={copyToClipboard}
          className="p-2 rounded-lg bg-theme-elevated hover:bg-theme-classical transition-all group relative"
          title="Copiar link"
        >
          {copied ? (
            <FaCheck className="w-5 h-5 text-green-500" />
          ) : (
            <FaLink className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
          )}
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-green-500 text-white text-xs rounded whitespace-nowrap">
              Link copiado!
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
