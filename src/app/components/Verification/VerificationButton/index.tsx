// app/components/Report/VerificationButton.tsx
'use client';

import { FiShield } from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import { useTranslation } from '@/app/hooks/useTranslation';

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
  const { t } = useTranslation({ sections: ['pages/workId'] });

  const titleKey =
    entityType === 'composer'
      ? 'verification_button_verificar_compositor'
      : 'verification_button_verificar_obra';

  return (
    <>
      <Button
        variant={variant}
        size={size}
        leftIcon={<FiShield />}
        onClick={onClick}
        className={'flex items-center justify-center'}
        title={t(titleKey)}
      >
        {showLabel && t('verification_button_verificar')}
      </Button>
    </>
  );
}
