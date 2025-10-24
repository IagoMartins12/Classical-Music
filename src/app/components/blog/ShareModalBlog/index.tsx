// components/blog/ShareModal.tsx - Modal de Compartilhamento
'use client';

import { useState } from 'react';
import Modal from '@/app/components/Modal';
import {
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
  FaLink,
  FaCheck,
} from 'react-icons/fa';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export function ShareModalBlog({
  isOpen,
  onClose,
  title,
  url,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        window.open(
          `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
          '_blank'
        );
      },
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          '_blank',
          'width=600,height=400'
        );
      },
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
          '_blank',
          'width=600,height=400'
        );
      },
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
          '_blank',
          'width=600,height=400'
        );
      },
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`;
      },
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compartilhar Artigo"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Grid de Botões de Compartilhamento */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.name}
                onClick={option.action}
                className={`${option.color} text-white p-4 rounded-lg transition-all transform hover:scale-105 shadow-md flex flex-col items-center justify-center space-y-2`}
              >
                <Icon className="w-8 h-8" />
                <span className="text-sm font-medium">{option.name}</span>
              </button>
            );
          })}
        </div>

        {/* Copiar Link */}
        <div className="pt-4 border-t border-theme-secondary">
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Ou copie o link:
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 input-classical-2 text-sm"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-brand-primary text-white hover:opacity-90'
              }`}
            >
              {copied ? (
                <div className="flex items-center space-x-2">
                  <FaCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Copiado!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <FaLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Copiar</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
