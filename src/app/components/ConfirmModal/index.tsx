// components/ConfirmModal/index.tsx
'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { PiInfo, PiQuestion, PiTrash, PiWarning } from 'react-icons/pi';
import Modal from '@/app/components/Modal';
import { Button } from '@/app/components/ui/Button';
import { Inline, Stack } from '@/app/components/ui/Layout';

/**
 * A confirmação do sistema — o único formato de "tem certeza?".
 *
 * Um ícone grande, o título, a mensagem, e as ações à direita. Sem ícone
 * dentro do botão (era um segundo ícone, pequeno, repetindo o grande) e sem a
 * linha de subtítulo que repetia a mensagem. Cor só onde ela diz algo:
 * apagar pinta de vermelho o ícone e o botão; o resto fica no ouro.
 */

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: ReactNode;
  type?: 'danger' | 'warning' | 'info' | 'question';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  /** Conteúdo a mais entre a mensagem e as ações (lista, aviso). */
  children?: ReactNode;
  /** Só avisa: sem botão de confirmar (ex.: local com eventos não se apaga). */
  semConfirmar?: boolean;
  /** Bloqueia só o confirmar (ex.: enquanto confere o que vai junto). */
  confirmarBloqueado?: boolean;
  /** Botão vermelho mesmo sem ser `danger` (descartar alterações). */
  acaoPerigosa?: boolean;
}

const TIPO = {
  danger: { icone: PiTrash, tom: 'text-erro', acao: 'Deletar' },
  warning: { icone: PiWarning, tom: 'text-ouro-texto', acao: 'Continuar' },
  info: { icone: PiInfo, tom: 'text-ouro-texto', acao: 'OK' },
  question: { icone: PiQuestion, tom: 'text-ouro-texto', acao: 'Sim' },
} as const;

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'question',
  confirmText,
  cancelText = 'Cancelar',
  isLoading = false,
  children,
  semConfirmar = false,
  confirmarBloqueado = false,
  acaoPerigosa = type === 'danger',
}: ConfirmModalProps) {
  const [processando, setProcessando] = useState(false);
  const ocupado = isLoading || processando;
  const { icone: Icone, tom, acao } = TIPO[type];

  const confirmar = async () => {
    setProcessando(true);
    try {
      await onConfirm();
    } finally {
      setProcessando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!ocupado) onClose();
      }}
      closeOnOverlayClick={!ocupado}
      maxWidth="md"
      showCloseButton={false}
    >
      <Stack gap={6}>
        <Inline gap={4} alinhar="inicio">
          <span
            aria-hidden="true"
            className={`fundo-sup-2 grid h-12 w-12 shrink-0 place-items-center rounded-full ${tom}`}
          >
            <Icone className="h-6 w-6" />
          </span>
          <Stack gap={2} className="min-w-0 pt-1">
            <h2 className="t-subtitulo">{title}</h2>
            <div className="t-corpo text-texto-suave">{message}</div>
          </Stack>
        </Inline>

        {children}

        {/* Lado a lado quando cabem; quando o rótulo é longo, cada botão
            ocupa a linha inteira, um embaixo do outro — nunca um quebrado e
            o outro não. No telefone, a ação fica em cima, perto do polegar. */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap">
          <Button
            variante="secundario"
            onClick={onClose}
            disabled={ocupado}
            className="w-full text-sm sm:w-auto sm:flex-1 sm:whitespace-nowrap"
          >
            {cancelText}
          </Button>
          {!semConfirmar && (
            <Button
              variante={acaoPerigosa ? 'perigo' : 'primario'}
              onClick={confirmar}
              carregando={ocupado}
              disabled={confirmarBloqueado}
              className="w-full text-sm sm:w-auto sm:flex-1 sm:whitespace-nowrap"
            >
              {confirmText || acao}
            </Button>
          )}
        </div>
      </Stack>
    </Modal>
  );
}

// Hook para usar o modal de confirmação de forma mais simples
export const useConfirmModal = () => {
  const [modalProps, setModalProps] = useState<ConfirmModalProps | null>(null);

  const confirm = (props: Omit<ConfirmModalProps, 'isOpen' | 'onClose'>) => {
    return new Promise<boolean>((resolve) => {
      setModalProps({
        ...props,
        isOpen: true,
        onClose: () => {
          setModalProps(null);
          resolve(false);
        },
        onConfirm: async () => {
          try {
            await props.onConfirm();
            setModalProps(null);
            resolve(true);
          } catch (error) {
            console.error('Erro na confirmação:', error);
            setModalProps(null);
            resolve(false);
          }
        },
      });
    });
  };

  const ConfirmModalComponent = modalProps ? (
    <ConfirmModal {...modalProps} />
  ) : null;

  return {
    confirm,
    ConfirmModalComponent,
  };
};
