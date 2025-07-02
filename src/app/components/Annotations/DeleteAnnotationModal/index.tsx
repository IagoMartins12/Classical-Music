// components/Annotations/DeleteAnnotationModal.tsx - NOVO COMPONENTE
'use client';

import { FiTrash2, FiAlertTriangle, FiLoader } from 'react-icons/fi';
import Modal from '../../Modal';
import Button from '../../Common/Button';

interface DeleteAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  annotationTitle: string;
  isDeleting?: boolean;
}

export default function DeleteAnnotationModal({
  isOpen,
  onClose,
  onConfirm,
  annotationTitle,
  isDeleting = false,
}: DeleteAnnotationModalProps) {
  const handleConfirm = async () => {
    if (!isDeleting) {
      await onConfirm();
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
      showCloseButton={!isDeleting}
      className="overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-accent-red/20 bg-gradient-to-r from-accent-red/5 to-accent-red/10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-red to-accent-red/80 flex items-center justify-center shadow-lg">
            <FiTrash2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-accent-red classical-title">
              Deletar Anotação
            </h2>
            <p className="text-sm text-theme-secondary">
              Esta ação não pode ser desfeita
            </p>
          </div>
        </div>
      </div>

      {/* Warning Section */}
      <div className="px-6 py-4 bg-gradient-to-r from-accent-red/5 to-transparent border-b border-theme-secondary">
        <div className="flex flex-col items-start space-x-3">
          <div className="items-center flex flex-col gap-2 justify-center">
            <div className="w-full flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-red/20 to-accent-red/10 flex items-center justify-center border border-accent-red/30">
                <FiAlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <h3 className="font-semibold text-theme-primary mb-2">
              Você está prestes a deletar esta anotação:
            </h3>
          </div>
          <div className="flex-1">
            <div className="p-3 bg-theme-elevated rounded-xl border border-theme-primary/20">
              <p className="font-medium text-theme-primary mb-1">
                &quot;{annotationTitle}&quot;
              </p>
              <p className="text-sm text-theme-tertiary">
                Esta anotação será permanentemente removida, incluindo todos os
                votos e respostas associadas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Section */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {/* Warning Messages */}
          <div className="space-y-2 flex flex-col  items-center">
            <div className="flex items-center space-x-2 text-sm text-accent-red">
              <div className="w-1.5 h-1.5 bg-accent-red rounded-full"></div>
              <span>Todos os votos úteis serão perdidos</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-accent-red">
              <div className="w-1.5 h-1.5 bg-accent-red rounded-full"></div>
              <span>Todas as respostas serão deletadas</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-accent-red">
              <div className="w-1.5 h-1.5 bg-accent-red rounded-full"></div>
              <span>Esta ação é irreversível</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-theme-secondary bg-theme-elevated/50 flex items-center justify-between">
        <div className="flex items-center justify-between w-full space-x-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="delete"
            onClick={handleConfirm}
            disabled={isDeleting}
            isLoading={isDeleting}
            leftIcon={isDeleting ? <FiLoader /> : <FiTrash2 />}
            className={` ${
              !isDeleting
                ? 'shadow-lg hover:shadow-xl transform hover:scale-105'
                : ''
            }`}
          >
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
