// app/components/Report/VerificationButton.tsx
'use client';

import { FiShield } from 'react-icons/fi';
import { useTranslation } from '@/app/hooks/useTranslation';

interface VerificationButtonProps {
  entityType: 'composer' | 'work';
  variant?: 'primary' | 'secondary' | 'ghost' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function VerificationButton({
  entityType,
  variant = 'ghost',
  size = 'md',
  showLabel = true,
  className = '',
  onClick,
}: VerificationButtonProps) {
  const { t } = useTranslation({ sections: ['pages/workId'] });

  const titleKey =
    entityType === 'composer'
      ? 'verification_button_verificar_compositor'
      : 'verification_button_verificar_obra';

  const sizeClasses = {
    sm: showLabel ? 'h-8 px-3' : 'w-8 h-8',
    md: showLabel ? 'h-10 px-4' : 'w-10 h-10',
    lg: showLabel ? 'h-12 px-3 md:px-5' : 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botão principal */}
      <button
        onClick={onClick}
        className={`
          ${sizeClasses[size]}
          ${
            variant === 'minimal'
              ? 'bg-transparent border-2 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-theme-primary'
              : 'bg-interactive-hover border border-theme-primary text-theme-primary hover:bg-brand-primary/20 hover:border-brand-primary hover:text-brand-primary'
          }
          rounded-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group gap-2
        `}
        title={t(titleKey)}
      >
        <FiShield
          className={`${iconSizes[size]} group-hover:rotate-12 transition-transform duration-300`}
        />
        {showLabel && (
          <span className="hidden sm:block text-sm font-medium">
            {t('verification_button_verificar')}
          </span>
        )}
      </button>
    </div>
  );
}
