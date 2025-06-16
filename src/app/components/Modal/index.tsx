// components/ui/Modal.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 modal-overlay animate-fade-in"
        onClick={handleOverlayClick}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${maxWidthClasses[maxWidth]} 
          modal-content classical-scrollbar classical-card animate-fade-in-scale
          shadow-theme-large border-theme-accent
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 pb-4">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-theme-primary classical-title"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  p-2 text-theme-tertiary hover:text-brand-primary 
                  hover:bg-interactive-hover rounded-lg transition-all
                  focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50
                "
                aria-label="Fechar modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={title || showCloseButton ? 'px-6 pb-6' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>
  );

  // Render portal
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};

export default Modal;
