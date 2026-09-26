// app/components/Common/QuickReportButton.tsx - Componente rápido para botões pequenos
'use client';

import { useState } from 'react';
import { PiFlag } from 'react-icons/pi';
import ReportModal from '@/app/components/Report/ReportModal';

interface QuickReportButtonProps {
  entityType: 'composer' | 'work' | 'score';
  entityId: string;
  entityName: string;
  className?: string;
}

export default function QuickReportButton({
  entityType,
  entityId,
  entityName,
  className = '',
}: QuickReportButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`p-2 rounded-lg text-theme-tertiary hover:text-accent-red hover:bg-accent-red/10 transition-all ${className}`}
        title="Reportar"
      >
        <PiFlag className="w-4 h-4" />
      </button>

      <ReportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        entityType={entityType}
        entityId={entityId}
        entityName={entityName}
      />
    </>
  );
}
