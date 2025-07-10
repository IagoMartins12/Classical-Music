// app/components/Report/ReportButton.tsx
'use client';

import { useState } from 'react';
import { FiFlag } from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import ReportModal from '../ReportModal';

interface ReportButtonProps {
  entityType: 'composer' | 'work' | 'score';
  entityId: string;
  entityName: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function ReportButton({
  entityType,
  entityId,
  entityName,
  variant = 'ghost',
  size = 'md',
  showLabel = true,
  className = '',
}: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        leftIcon={<FiFlag />}
        onClick={() => setShowModal(true)}
        className={className}
        title={`Reportar ${
          entityType === 'composer'
            ? 'compositor'
            : entityType === 'work'
            ? 'obra'
            : 'partitura'
        }`}
      >
        {showLabel && 'Reportar'}
      </Button>

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
