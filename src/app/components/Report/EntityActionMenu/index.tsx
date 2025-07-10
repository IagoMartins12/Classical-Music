// app/components/Common/EntityActionMenu.tsx - Menu de ações para entidades
'use client';

import { useState } from 'react';
import {
  FiMoreHorizontal,
  FiFlag,
  FiEye,
  FiEdit,
  FiTrash2,
  FiShield,
} from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import ReportButton from '@/app/components/Report/ReportButton';
import VerificationModal from '@/app/components/Verification/VerificationModal';

interface EntityActionMenuProps {
  entityType: 'composer' | 'work' | 'score';
  entityId: string;
  entityName: string;
  isVerified?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export default function EntityActionMenu({
  entityType,
  entityId,
  entityName,
  isVerified = false,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  onView,
}: EntityActionMenuProps) {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [currentVerificationStatus, setCurrentVerificationStatus] =
    useState(isVerified);

  const isAdmin = session?.user?.role === 2;

  const handleVerificationChange = (verified: boolean) => {
    setCurrentVerificationStatus(verified);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary transition-all"
          title="Mais ações"
        >
          <FiMoreHorizontal className="w-5 h-5" />
        </button>

        {showMenu && (
          <>
            {/* Overlay para fechar o menu */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu dropdown */}
            <div className="absolute right-0 top-full mt-2 bg-theme-elevated border border-theme-primary rounded-lg shadow-theme-medium z-20 min-w-48">
              <div className="py-2">
                {onView && (
                  <button
                    onClick={() => {
                      onView();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-theme-primary hover:bg-theme-secondary transition-colors flex items-center space-x-2"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>Visualizar</span>
                  </button>
                )}

                {canEdit && onEdit && (
                  <button
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-theme-primary hover:bg-theme-secondary transition-colors flex items-center space-x-2"
                  >
                    <FiEdit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                )}

                {/* Verificação (apenas para compositores e admins) */}
                {isAdmin && entityType === 'composer' && (
                  <button
                    onClick={() => {
                      setShowVerificationModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-theme-primary hover:bg-theme-secondary transition-colors flex items-center space-x-2"
                  >
                    <FiShield className="w-4 h-4" />
                    <span>
                      {currentVerificationStatus
                        ? 'Remover verificação'
                        : 'Verificar'}
                    </span>
                  </button>
                )}

                {/* Reportar */}
                <div className="px-4 py-2">
                  <ReportButton
                    entityType={entityType}
                    entityId={entityId}
                    entityName={entityName}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-accent-red hover:bg-accent-red/10"
                  />
                </div>

                {canDelete && onDelete && (
                  <>
                    <div className="border-t border-theme-secondary my-1" />
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-accent-red hover:bg-accent-red/10 transition-colors flex items-center space-x-2"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Deletar</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de verificação */}
      {isAdmin && entityType === 'composer' && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          composerId={entityId}
          composerName={entityName}
          currentVerificationStatus={currentVerificationStatus}
          onVerificationChange={handleVerificationChange}
        />
      )}
    </>
  );
}
