'use client';

import { useState, type ReactNode } from 'react';
import {
  PiCheckCircle,
  PiInfo,
  PiSpinnerGap,
  PiWarningCircle,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { EDIT } from '@/app/conteudo/site/edit';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';

/**
 * The sheet of the upload creation flows (composer, work, score, bulk
 * works). The system `Sheet`, plus what the legacy modal did that the
 * sheet does not: closing with unsaved changes asks first, and nothing
 * closes while a save is running.
 */
export function FormSheet({
  aberto,
  aoFechar,
  titulo,
  descricao,
  sujo = false,
  ocupado = false,
  rodape,
  children,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  /** Something was typed or changed: closing asks first. */
  sujo?: boolean;
  /** A save is running: closing waits. */
  ocupado?: boolean;
  rodape: ReactNode;
  children: ReactNode;
}) {
  const { language } = useRouteLanguage();
  const copy = EDIT[language];
  const [saindo, setSaindo] = useState(false);

  const pedirFechar = () => {
    if (ocupado) return;
    if (sujo) setSaindo(true);
    else aoFechar();
  };

  return (
    <>
      <Sheet
        aberto={aberto}
        aoFechar={pedirFechar}
        titulo={titulo}
        descricao={descricao}
        largura="g"
        rodape={rodape}
      >
        <div className="flex flex-col">{children}</div>
      </Sheet>
      <ConfirmModal
        isOpen={saindo}
        onClose={() => setSaindo(false)}
        onConfirm={() => {
          setSaindo(false);
          aoFechar();
        }}
        type="warning"
        title={copy.leaveTitle}
        message={copy.leaveText}
        confirmText={copy.leaveConfirm}
        cancelText={copy.keepEditing}
      />
    </>
  );
}

/** A titled group of fields inside a `FormSheet`, two columns from `sm`. */
export function FormBlock({
  titulo,
  nota,
  acoes,
  children,
  className,
}: {
  titulo: string;
  nota?: ReactNode;
  /** Buttons beside the title (generate, translate…). */
  acoes?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        'flex flex-col gap-5 border-t border-[var(--linha)] py-7 first:border-t-0 first:pt-0',
        className
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="t-subtitulo">{titulo}</h3>
          {nota && <p className="t-legenda">{nota}</p>}
        </div>
        {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

const TONS = {
  info: { icone: PiInfo, cor: 'text-ouro-texto' },
  ok: { icone: PiCheckCircle, cor: 'text-ouro-texto' },
  erro: { icone: PiWarningCircle, cor: 'text-erro' },
  carregando: { icone: PiSpinnerGap, cor: 'text-texto-suave animate-spin' },
} as const;

/**
 * A notice inside a form (duplicate found, data imported, checking…). The
 * system surface; the state shows only in the icon's color, never in a
 * tinted background.
 */
export function Aviso({
  tom = 'info',
  titulo,
  children,
  className,
}: {
  tom?: keyof typeof TONS;
  titulo?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const t = TONS[tom];
  return (
    <div
      role={tom === 'erro' ? 'alert' : 'status'}
      className={cx(
        'flex items-start gap-3 rounded-controle bg-sup-2 px-4 py-3 sm:col-span-2',
        className
      )}
    >
      <Icon de={t.icone} tamanho="p" className={cx('mt-0.5 shrink-0', t.cor)} />
      <div className="flex min-w-0 flex-col gap-1 text-[0.9375rem]">
        {titulo && <span className="font-medium text-texto">{titulo}</span>}
        {children && <div className="text-texto-suave">{children}</div>}
      </div>
    </div>
  );
}
