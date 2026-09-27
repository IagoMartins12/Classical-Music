// app/components/Verification/VerificationBadge.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
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

  // O selo se desenha só quando a verificação acontece com a tela aberta
  // (de não verificada para verificada). Ao abrir uma página de obra já
  // verificada, ele aparece pronto.
  const antes = useRef(verified);
  const [desenhar, setDesenhar] = useState(false);
  useEffect(() => {
    if (verified && antes.current === false) setDesenhar(true);
    antes.current = verified;
  }, [verified]);

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
        <SeloVerificada
          desenhar={desenhar}
          className={`${iconSizeClasses[size]}`}
        />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-sup-2 ${className}`}
      >
        <SeloVerificada
          desenhar={desenhar}
          className={`${iconSizeClasses[size]}`}
        />
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
      <div className={`inline-flex items-center space-x-1 ${className}`}>
        <SeloVerificada
          desenhar={desenhar}
          className={`${iconSizeClasses[size]}`}
        />
        <span className="hidden md:block md:text-sm font-medium">
          {verifiedText}
        </span>
      </div>
    );
  }

  return null;
}
