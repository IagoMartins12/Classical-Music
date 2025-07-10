// app/components/Common/VerificationIndicator.tsx - Indicador compacto para listas
'use client';

import { FiShield, FiCheck } from 'react-icons/fi';

interface VerificationIndicatorProps {
  verified: boolean;
  className?: string;
}

export default function VerificationIndicator({
  verified,
  className = '',
}: VerificationIndicatorProps) {
  if (!verified) return null;

  return (
    <div
      className={`inline-flex items-center px-2 py-1 bg-accent-blue/10 text-accent-blue rounded-full text-xs font-medium ${className}`}
      title="Verificado"
    >
      <FiCheck className="w-3 h-3 mr-1" />
      Verificado
    </div>
  );
}
