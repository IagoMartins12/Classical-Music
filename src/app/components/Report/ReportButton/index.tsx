// app/components/Report/ReportButton.tsx
'use client';

import { useState } from 'react';
import { FiFlag } from 'react-icons/fi';
import ReportModal from '../ReportModal';
import { useTranslation } from '@/app/context/TranslationContext';

interface ReportButtonProps {
  entityType: 'composer' | 'work' | 'score';
  entityId: string;
  entityName: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'minimal';
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
  className = '',
}: ReportButtonProps) {
  const { t } = useTranslation({ sections: ['pages/workId'] });
  const [showModal, setShowModal] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Botão principal */}
        <button
          onClick={() => {
            setShowModal(true);
          }}
          className={`
                ${sizeClasses[size]}
                ${
                  variant === 'minimal'
                    ? 'bg-transparent border-2 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-theme-primary'
                    : 'bg-interactive-hover border border-theme-primary text-theme-primary hover:bg-brand-primary/20 hover:border-brand-primary hover:text-brand-primary'
                }
                rounded-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group
              `}
          title={t('report_button_reportar')}
        >
          <FiFlag
            className={`${iconSizes[size]} group-hover:rotate-12 transition-transform duration-300`}
          />
        </button>
      </div>

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
