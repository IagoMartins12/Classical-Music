// components/Modal/index.tsx
'use client';

import React, {
  useEffect,
  useId,
  useRef,
  useImperativeHandle,
  forwardRef,
  useLayoutEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { PiX } from 'react-icons/pi';
import ConfirmationModal from './ConfirmationModal';
import { useModalConfirmation } from '@/app/hooks/useModalConfirmation';
import { Button } from '@/app/components/ui/Button';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  preventBodyScroll?: boolean;

  // PROPS SIMPLES DE CONFIRMAÇÃO (TODAS OPCIONAIS)
  confirmOnClose?: boolean; // Se true, ativa o sistema de confirmação
  hasChanges?: boolean; // Detectou mudanças no form
  isProcessing?: boolean; // Tem processo rodando
  processName?: string; // Nome do processo
  withouVerification?: boolean;
  setPr?: boolean;
  middlePosition?: boolean;
  minHeight?: boolean | null;
}

export interface ModalRef {
  scrollToTop: () => void;
}

const FOCAVEIS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Diálogos abertos, do mais antigo ao de cima.
const pilha: number[] = [];
let contadorDeModais = 0;

// CONTADOR GLOBAL SIMPLES
let openModalCount = 0;
let savedScrollY = 0;

const lockBodyScroll = () => {
  if (openModalCount === 0) {
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }
  openModalCount++;
};

const unlockBodyScroll = () => {
  openModalCount = Math.max(0, openModalCount - 1);

  if (openModalCount === 0) {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, savedScrollY);
  }
};

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
      preventBodyScroll = true,
      // Confirmação
      confirmOnClose = false,
      hasChanges = false,
      isProcessing = false,
      withouVerification = false,
      processName,
      setPr,
      middlePosition,
      minHeight,
    },
    ref
  ) => {
    const idTitulo = `${useId()}-titulo`;
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const isLargeModal = [
      'lg',
      'xl',
      '2xl',
      '3xl',
      '4xl',
      '5xl',
      '6xl',
    ].includes(maxWidth);

    // SÓ USA CONFIRMAÇÃO SE HABILITADA
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

    // CORREÇÃO: Usar contador global
    useLayoutEffect(() => {
      if (!isOpen || !preventBodyScroll) return;

      lockBodyScroll();

      return () => {
        unlockBodyScroll();
      };
    }, [isOpen, preventBodyScroll]);

    useImperativeHandle(ref, () => ({
      scrollToTop: () => {
        if (contentRef.current) {
          contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
    }));

    // FECHAMENTO INTELIGENTE
    const handleClose = () => {
      if (confirmOnClose) {
        requestClose(onClose); // Vai mostrar confirmação se necessário
      } else {
        if (onClose) {
          onClose(); // Fecha direto
        }
      }
    };

    // Só o diálogo de cima responde ao Esc e prende o foco: a confirmação de
    // fechar é outro Modal por cima deste, e antes um Esc fechava os dois.
    const [idPilha] = useState(() => ++contadorDeModais);
    // O Esc usa sempre o fechamento atual: capturado na abertura, ele via o
    // formulário ainda sem alterações e fechava sem pedir confirmação.
    const fecharAtual = useRef(handleClose);
    fecharAtual.current = handleClose;
    const noTopo = () => pilha[pilha.length - 1] === idPilha;

    useEffect(() => {
      if (!isOpen) return;
      pilha.push(idPilha);
      // Quem abriu recebe o foco de volta ao fechar; sem isto, quem navega
      // por teclado volta ao topo da página.
      const origem = document.activeElement as HTMLElement | null;
      // O foco vai para o próprio diálogo, não para o primeiro botão: o leitor
      // anuncia o título e nenhum anel aparece no X para quem usa mouse.
      modalRef.current?.focus({ preventScroll: true });

      const aoTeclar = (e: KeyboardEvent) => {
        if (!noTopo() || !modalRef.current) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          fecharAtual.current();
          return;
        }
        if (e.key !== 'Tab') return;
        const itens = [
          ...modalRef.current.querySelectorAll<HTMLElement>(FOCAVEIS),
        ].filter((el) => el.offsetParent !== null);
        if (!itens.length) return;
        const [a, z] = [itens[0], itens[itens.length - 1]];
        const ativo = document.activeElement;
        if (ativo === modalRef.current) {
          e.preventDefault();
          (e.shiftKey ? z : a).focus();
        } else if (e.shiftKey && ativo === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && ativo === z) {
          e.preventDefault();
          a.focus();
        }
      };
      document.addEventListener('keydown', aoTeclar);

      return () => {
        document.removeEventListener('keydown', aoTeclar);
        const k = pilha.lastIndexOf(idPilha);
        if (k >= 0) pilha.splice(k, 1);
        origem?.focus?.({ preventScroll: true });
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // ── Arraste da alça, no telefone ──────────────────────────────────────
    // Para baixo: fecha (em tela cheia, primeiro volta ao tamanho normal —
    // um arraste só fecharia um formulário longo por um toque errado). Para
    // cima: o modal grande ocupa a tela inteira; o pequeno só cede e volta.
    const [arrasto, setArrasto] = useState<number | null>(null);
    const [telaCheia, setTelaCheia] = useState(false);
    const [saindo, setSaindo] = useState(false);
    const gesto = useRef({ y: 0, t: 0 });
    const podeExpandir = isLargeModal;

    useEffect(() => {
      if (!isOpen) {
        setTelaCheia(false);
        setArrasto(null);
        setSaindo(false);
      }
    }, [isOpen]);

    const aoPegar = (e: React.PointerEvent<HTMLDivElement>) => {
      if (window.matchMedia('(min-width: 640px)').matches) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      gesto.current = { y: e.clientY, t: performance.now() };
      setArrasto(0);
    };

    const aoArrastar = (e: React.PointerEvent<HTMLDivElement>) => {
      if (arrasto === null) return;
      const dy = e.clientY - gesto.current.y;
      // Para cima a folha resiste: é só o sinal de que ela responde.
      setArrasto(dy < 0 ? dy * (podeExpandir && !telaCheia ? 0.35 : 0.15) : dy);
    };

    const aoSoltar = (e: React.PointerEvent<HTMLDivElement>) => {
      if (arrasto === null) return;
      const dy = e.clientY - gesto.current.y;
      const velocidade = dy / Math.max(1, performance.now() - gesto.current.t);
      const altura = modalRef.current?.offsetHeight ?? 600;
      const desceu = dy > Math.min(160, altura * 0.25) || velocidade > 0.6;
      const subiu = dy < -60 || velocidade < -0.6;

      if (desceu && telaCheia) {
        setTelaCheia(false);
      } else if (desceu) {
        if (confirmOnClose) {
          // Com alterações por salvar, o arraste pede a mesma confirmação
          // do X: a folha volta e a pergunta aparece.
          handleClose();
        } else {
          setSaindo(true);
          setArrasto(altura);
          window.setTimeout(() => onClose?.(), 200);
          return;
        }
      } else if (subiu && podeExpandir) {
        setTelaCheia(true);
      }
      setArrasto(null);
    };

    if (!isOpen) return null;

    const temCabecalho = !!title || showCloseButton;

    const modalContent = (
      <>
        {/* No telefone, a folha presa embaixo; a partir de 640px, no centro. */}
        <div className="fixed inset-0 z-dialogo flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="folha-veu fixed inset-0"
            aria-hidden="true"
            onClick={closeOnOverlayClick ? handleClose : undefined}
          />
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? idTitulo : undefined}
            style={
              arrasto !== null
                ? { transform: `translateY(${arrasto}px)` }
                : undefined
            }
            className={`folha sup-alta relative flex w-full flex-col overflow-hidden outline-none
          ${
            telaCheia
              ? 'h-[100dvh] max-h-[100dvh] rounded-none pt-[env(safe-area-inset-top)]'
              : 'max-h-[92dvh] rounded-b-none'
          }
          sm:h-auto sm:max-h-[90vh] sm:rounded-folha sm:pt-0
          ${
            arrasto !== null && !saindo
              ? 'transition-none'
              : 'transition-[transform,max-height,height,border-radius] duration-[var(--t-entrada)] ease-saida motion-reduce:transition-none'
          }
          ${isLargeModal && !middlePosition ? '' : 'sm:w-11/12'}
          ${maxWidthClasses[maxWidth]} ${setPr ? '!pr-1' : ''} ${className}`}
          >
            {/* A alça: no telefone, arrastar para baixo fecha e, no modal
                grande, para cima ocupa a tela. A faixa é maior que a barra
                para o dedo acertar; o X continua sendo o caminho acessível. */}
            <div
              aria-hidden="true"
              onPointerDown={aoPegar}
              onPointerMove={aoArrastar}
              onPointerUp={aoSoltar}
              onPointerCancel={aoSoltar}
              className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing sm:hidden"
            >
              <span className="h-1 w-10 rounded-full bg-linha-forte" />
            </div>

            {temCabecalho && (
              <div
                className={`flex shrink-0 items-start gap-3 px-5 pt-4 sm:px-6 sm:pt-6 ${
                  title ? 'border-b border-linha pb-4' : 'pb-0'
                }`}
              >
                {title && (
                  <h2 id={idTitulo} className="t-subtitulo flex-1">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <Button
                    variante="fantasma"
                    icone={PiX}
                    rotulo="Fechar"
                    onClick={handleClose}
                    // Caixa visível de 32px, mesmo ícone; a faixa invisível do
                    // `after` completa os 44px de alvo para o dedo.
                    className="relative -mr-1 -mt-1 ml-auto h-8 w-8 !min-h-8 after:absolute after:-inset-1.5 after:content-['']"
                  />
                )}
              </div>
            )}

            <div
              ref={contentRef}
              className={`classical-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden pt-4 ${
                minHeight ? 'min-h-[30rem]' : ''
              } ${
                temCabecalho
                  ? 'px-4 pb-4 md:px-6 md:pb-10 lg:pb-8'
                  : 'p-4 md:p-6'
              }`}
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
