// app/components/Common/EntityActionMenu.tsx - Menu de ações para entidades
'use client';

import { useState } from 'react';
import {
  PiDotsThree,
  PiEye,
  PiNotePencil,
  PiShield,
  PiTrash,
} from 'react-icons/pi';
import { useSession } from '@/app/libs/session';
import ReportButton from '@/app/components/Report/ReportButton';
import VerificationModal from '@/app/components/Verification/VerificationModal';
import { Inline } from '@/app/components/ui/Layout';

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
          className="p-2 rounded-lg text-theme-tertiary transition-all"
          title="Mais ações"
        >
          <PiDotsThree className="w-5 h-5" />
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
                  <Inline
                    as="button"
                    gap={2}
                    onClick={() => {
                      onView();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-theme-primary transition-colors"
                  >
                    <PiEye className="w-4 h-4" />
                    <span>Visualizar</span>
                  </Inline>
                )}

                {canEdit && onEdit && (
                  <Inline
                    as="button"
                    gap={2}
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-theme-primary transition-colors"
                  >
                    <PiNotePencil className="w-4 h-4" />
                    <span>Editar</span>
                  </Inline>
                )}

                {/* Verificação (apenas para compositores e admins) */}
                {isAdmin && entityType === 'composer' && (
                  <Inline
                    as="button"
                    gap={2}
                    onClick={() => {
                      setShowVerificationModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-theme-primary transition-colors"
                  >
                    <PiShield className="w-4 h-4" />
                    <span>
                      {currentVerificationStatus
                        ? 'Remover verificação'
                        : 'Verificar'}
                    </span>
                  </Inline>
                )}

                {/* Reportar */}
                <div className="px-4 py-2">
                  <ReportButton
                    entityType={entityType}
                    entityId={entityId}
                    entityName={entityName}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  />
                </div>

                {canDelete && onDelete && (
                  <>
                    <div className="border-t border-theme-secondary my-1" />
                    <Inline
                      as="button"
                      gap={2}
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm transition-colors"
                    >
                      <PiTrash className="w-4 h-4" />
                      <span>Deletar</span>
                    </Inline>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de verificação */}
      {(isAdmin && entityType === 'composer') ||
        (entityType === 'work' && (
          <VerificationModal
            isOpen={showVerificationModal}
            onClose={() => setShowVerificationModal(false)}
            currentItem={entityType}
            itemId={entityId}
            composerName={entityName}
            currentVerificationStatus={currentVerificationStatus}
            onVerificationChange={handleVerificationChange}
          />
        ))}
    </>
  );
}
