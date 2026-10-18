'use client';

import { GiGrandPiano } from 'react-icons/gi';
import type { ReactNode } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { PiWarningCircle } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';

/** "or": a line, a word, a line — between the form and the Google button. */
export function Divisor({ texto }: { texto: string }) {
  return (
    <div role="separator" className="flex items-center gap-4 t-legenda">
      <span aria-hidden="true" className="h-px flex-1 bg-[var(--linha)]" />
      {texto}
      <span aria-hidden="true" className="h-px flex-1 bg-[var(--linha)]" />
    </div>
  );
}

/**
 * A message inside the sheet: what went wrong (or what to know), one
 * sentence, and the way out. Announced to screen readers as it appears.
 */
export function AvisoDeAuth({
  titulo,
  children,
  acoes,
}: {
  titulo?: ReactNode;
  children: ReactNode;
  acoes?: ReactNode;
}) {
  return (
    <div role="alert" className="flex gap-3 rounded-card bg-sup-2 p-4">
      <Icon
        de={PiWarningCircle}
        tamanho="m"
        className="mt-0.5 shrink-0 text-ouro-texto"
      />
      <div className="flex min-w-0 flex-col gap-1">
        {titulo && <span className="font-medium">{titulo}</span>}
        <span className="t-rotulo text-texto-suave">{children}</span>
        {acoes && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{acoes}</div>
        )}
      </div>
    </div>
  );
}

export function BotaoGoogle({
  children,
  onClick,
  carregando,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  carregando?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      icone={FcGoogle}
      carregando={carregando}
      disabled={disabled}
      onClick={onClick}
      className="w-full"
    >
      {children}
    </Button>
  );
}

/** O piano de cauda que abre o login e o cadastro. */
export function SeloPiano() {
  return (
    <span
      aria-hidden="true"
      className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sup-2 text-ouro-texto"
    >
      <GiGrandPiano className="h-8 w-8" />
    </span>
  );
}
