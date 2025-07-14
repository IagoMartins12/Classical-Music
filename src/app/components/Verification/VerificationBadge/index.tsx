// app/components/Verification/VerificationBadge.tsx
'use client';

import { FiCheck } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';

interface VerificationBadgeProps {
  verified: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'badge' | 'text';
  className?: string;
}

export default function VerificationBadge({
  verified,
  size = 'md',
  variant = 'icon',
  className = '',
}: VerificationBadgeProps) {
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
      <div className={`${sizeClasses[size]}${className}`} title="Verificado">
        <MdVerified className={iconSizeClasses[size]} />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-1 bg-accent-blue/10 text-accent-blue rounded-full border border-accent-blue/30 ${className}`}
      >
        <MdVerified className={iconSizeClasses[size]} />
        <span className="text-xs font-medium">Verificado</span>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div
        className={`inline-flex items-center space-x-1 text-accent-blue ${className}`}
      >
        <MdVerified className={iconSizeClasses[size]} />
        <span className="text-sm font-medium">Verificado</span>
      </div>
    );
  }

  return null;
}
