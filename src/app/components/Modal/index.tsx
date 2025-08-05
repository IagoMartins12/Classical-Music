// components/Modal/index.tsx
'use client';

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import ConfirmationModal from './ConfirmationModal';
import { useModalConfirmation } from '@/app/hooks/useModalConfirmation';
import useIsMobile from '@/app/hooks/useIsMobile';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  preventBodyScroll?: boolean;

  // 🎯 PROPS SIMPLES DE CONFIRMAÇÃO (TODAS OPCIONAIS)
  confirmOnClose?: boolean; // Se true, ativa o sistema de confirmação
  hasChanges?: boolean; // Detectou mudanças no form
  isProcessing?: boolean; // Tem processo rodando
  processName?: string; // Nome do processo
  withouVerification?: boolean;
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
      className = '',
      preventBodyScroll = true,
      // Confirmação
      confirmOnClose = false,
      hasChanges = false,
      isProcessing = false,
      withouVerification = false,
      processName,
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const isMobile = useIsMobile();
    // 🎯 SÓ USA CONFIRMAÇÃO SE HABILITADA
    const {
      requestClose,
      showConfirmation,
      isConfirming,
      confirmationConfig,
      handleConfirmClose,
      handleCancelClose,
    } = useModalConfirmation({
      enabled: confirmOnClose,
      hasUnsavedChanges: hasChanges,
      hasOngoingProcess: isProcessing,
      processName,
      withouVerification: withouVerification,
    });

    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
    };

    // Prevenção de scroll
    useLayoutEffect(() => {
      if (!preventBodyScroll || !isOpen) return;

      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        const body = document.body;
        const scrollY = parseInt(body.style.top || '0') * -1;
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }, [isOpen, preventBodyScroll]);

    useImperativeHandle(ref, () => ({
      scrollToTop: () => {
        if (contentRef.current) {
          contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
    }));

    // 🎯 FECHAMENTO INTELIGENTE
    const handleClose = () => {
      if (confirmOnClose) {
        requestClose(onClose); // Vai mostrar confirmação se necessário
      } else {
        onClose(); // Fecha direto
      }
    };

    // ESC key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          handleClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen]);

    if (!isOpen) return null;

    const modalContent = (
      <>
        {/* Modal Principal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 ">
          <div
            className="fixed inset-0 modal-overlay animate-fade-in"
            onClick={handleClose}
          />

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
                    onClick={handleClose}
                    className="p-2 text-theme-tertiary hover:text-brand-primary hover:bg-interactive-hover rounded-lg transition-all"
                    aria-label="Fechar modal"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
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

        {/* Modal de Confirmação */}
        {confirmOnClose && (
          <ConfirmationModal
            isOpen={showConfirmation}
            config={confirmationConfig}
            onConfirm={handleConfirmClose}
            onCancel={handleCancelClose}
            isLoading={isConfirming}
          />
        )}
      </>
    );

    return typeof window !== 'undefined'
      ? createPortal(modalContent, document.body)
      : null;
  }
);

Modal.displayName = 'Modal';
export default Modal;
