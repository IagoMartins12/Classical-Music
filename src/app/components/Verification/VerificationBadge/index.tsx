// app/components/Verification/VerificationBadge.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { useTranslation } from '@/app/hooks/useTranslation';

interface VerificationBadgeProps {
  verified?: boolean;
  title?: 'Compositor' | 'Peça';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'badge' | 'text';
  className?: string;
  /** Desenha também ao montar já verificada (a página da obra ou do compositor). */
  desenharAoEntrar?: boolean;
}

export default function VerificationBadge({
  verified,
  title = 'Compositor',
  size = 'md',
  variant = 'icon',
  className = '',
  desenharAoEntrar = false,
}: VerificationBadgeProps) {
  const { t } = useTranslation({ sections: ['pages/workId'] });

  // Nos cards, o selo se desenha só quando a verificação acontece com a tela
  // aberta (de não verificada para verificada). No título da página da obra
  // ou do compositor (`desenharAoEntrar`), ele também se desenha ao chegar,
  // depois de o card virar a página (`.selo-entrada` no `globals.css`).
  const antes = useRef(verified);
  const [desenhar, setDesenhar] = useState(
    Boolean(desenharAoEntrar && verified)
  );
  useEffect(() => {
    if (verified && antes.current === false) setDesenhar(true);
    antes.current = verified;
  }, [verified]);

  if (!verified) return null;

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6 md:w-8 md:h-8',
  };

  // `span`, e não `div`: o selo entra dentro de um título (ver `SeloNoTitulo`).
  if (variant === 'icon') {
    return (
      <span
        className={`inline-flex shrink-0 align-middle text-verificado ${className}`}
        title={t('verification_badge_verificado')}
      >
        <SeloVerificada
          desenhar={desenhar}
          className={`${iconSizeClasses[size]} ${desenharAoEntrar ? 'selo-entrada' : ''}`}
        />
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-sup-2 ${className}`}
      >
        <SeloVerificada
          desenhar={desenhar}
          className={`${iconSizeClasses[size]} text-verificado`}
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
          className={`${iconSizeClasses[size]} text-verificado`}
        />
        <span className="hidden md:block md:text-sm font-medium">
          {verifiedText}
        </span>
      </div>
    );
  }

  return null;
}

/**
 * O título com o selo colado na última palavra.
 *
 * Com o selo ao lado do `h1` num flex, um título que quebra em duas linhas
 * ocupa a largura inteira e empurra o selo para a borda — longe do nome, no
 * telefone. Aqui ele segue o texto: a última palavra e o selo não se separam
 * na quebra.
 */
export function SeloNoTitulo({
  texto,
  verified,
  title,
}: {
  texto: string;
  verified?: boolean;
  title?: 'Compositor' | 'Peça';
}) {
  const partes = texto.trim().split(/\s+/);
  const ultima = partes.pop() ?? '';
  return (
    <>
      {partes.length > 0 && `${partes.join(' ')} `}
      <span className="whitespace-nowrap">
        {ultima}
        <VerificationBadge
          verified={verified}
          size="xl"
          variant="icon"
          title={title}
          className="ml-2 -translate-y-[0.08em]"
          desenharAoEntrar
        />
      </span>
    </>
  );
}
