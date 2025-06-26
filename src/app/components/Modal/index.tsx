// components/ui/Modal.tsx - Versão com scroll suave exposto
'use client';

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
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

export interface ModalRef {
  scrollToTop: () => void;
}

const Modal = forwardRef<ModalRef, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      maxWidth = 'md',
      showCloseButton = true,
      closeOnOverlayClick = true,
      className = '',
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
    };

    // Expor função de scroll para o componente pai
    useImperativeHandle(ref, () => ({
      scrollToTop: () => {
        if (contentRef.current) {
          contentRef.current.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      },
    }));

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
      onClose();
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
          modal-content !overflow-hidden classical-card animate-fade-in-scale
          shadow-theme-large border-theme-accent max-h-[90vh]
          ${className}
        `}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 pb-4 border-b border-theme-secondary">
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

          {/* Content - Scrollable */}
          <div
            ref={contentRef}
            className={`
            overflow-y-auto  classical-scrollbar pt-4  flex-1
            ${title || showCloseButton ? 'px-6 pb-6' : 'p-6'}
          `}
            style={{ maxHeight: 'calc(90vh - 100px)' }}
          >
            {children}
          </div>
        </div>
      </div>
    );

    // Render portal
    return typeof window !== 'undefined'
      ? createPortal(modalContent, document.body)
      : null;
  }
);

Modal.displayName = 'Modal';

export default Modal;
