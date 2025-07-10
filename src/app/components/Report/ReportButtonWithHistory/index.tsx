// app/components/Report/ReportButtonWithHistory.tsx - Botão com acesso ao histórico
'use client';

import { useState } from 'react';
import { FiFlag, FiClock } from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import ReportModal from '../ReportModal';
import ReportHistoryModal from '../ReportHistoryModal';

interface ReportButtonWithHistoryProps {
  entityType: 'composer' | 'work' | 'score';
  entityId: string;
  entityName: string;
  isAdmin?: boolean;
  hasReports?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ReportButtonWithHistory({
  entityType,
  entityId,
  entityName,
  isAdmin = false,
  hasReports = false,
  variant = 'ghost',
  size = 'md',
  className = '',
}: ReportButtonWithHistoryProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button
          variant={variant}
          size={size}
          leftIcon={<FiFlag />}
          onClick={() => setShowReportModal(true)}
        >
          Reportar
        </Button>

        {isAdmin && hasReports && (
          <Button
            variant="ghost"
            size={size}
            leftIcon={<FiClock />}
            onClick={() => setShowHistoryModal(true)}
            title="Ver histórico de reports"
          >
            Ver histórico de reports
          </Button>
        )}
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        entityType={entityType}
        entityId={entityId}
        entityName={entityName}
      />

      {isAdmin && (
        <ReportHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          entityType={entityType}
          entityId={entityId}
          entityName={entityName}
        />
      )}
    </>
  );
}
