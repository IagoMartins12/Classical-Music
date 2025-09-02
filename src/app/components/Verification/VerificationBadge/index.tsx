// app/components/Verification/VerificationBadge.tsx
'use client';

import { MdVerified } from 'react-icons/md';
import { useTranslation } from '@/app/hooks/useTranslation';

interface VerificationBadgeProps {
  verified?: boolean;
  title?: 'Compositor' | 'Peça';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'badge' | 'text';
  className?: string;
}

export default function VerificationBadge({
  verified,
  title = 'Compositor',
  size = 'md',
  variant = 'icon',
  className = '',
}: VerificationBadgeProps) {
  const { t } = useTranslation({ sections: ['pages/workId'] });

  if (!verified) return null;

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (variant === 'icon') {
    return (
      <div
        className={`${sizeClasses[size]}${className} self-end mb-2`}
        title={t('verification_badge_verificado')}
      >
        <MdVerified className={`${iconSizeClasses[size]}`} />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-1 bg-accent-blue/10 text-accent-blue rounded-full border border-accent-blue/30 ${className}`}
      >
        <MdVerified className={`${iconSizeClasses[size]}`} />
        <span className="text-xs font-medium">
          {t('verification_badge_verificado')}
        </span>
      </div>
    );
  }

  if (variant === 'text') {
    const verifiedText =
      title === 'Compositor'
        ? t('verification_badge_compositor_verificado')
        : t('verification_badge_peca_verificada');

    return (
      <div
        className={`inline-flex items-center space-x-1 text-accent-blue ${className}`}
      >
        <MdVerified className={`${iconSizeClasses[size]}`} />
        <span className="hidden md:block md:text-sm font-medium">
          {verifiedText}
        </span>
      </div>
    );
  }

  return null;
}
