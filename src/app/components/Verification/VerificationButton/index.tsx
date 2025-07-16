// app/components/Report/VerificationButton.tsx
'use client';

import { FiShield } from 'react-icons/fi';
import Button from '@/app/components/Common/Button';

interface VerificationButtonProps {
  entityType: 'composer' | 'work';
  variant?: 'primary' | 'secondary' | 'ghost';
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
  onClick,
}: VerificationButtonProps) {
  return (
    <>
      <Button
        variant={variant}
        size={size}
        leftIcon={<FiShield />}
        onClick={onClick}
        className={'flex items-center justify-center'}
        title={`Verificar ${entityType === 'composer' ? 'compositor' : 'obra'}`}
      >
        {showLabel && 'Verificar'}
      </Button>
    </>
  );
}
