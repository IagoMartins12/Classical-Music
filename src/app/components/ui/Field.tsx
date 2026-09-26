'use client';

import { useId } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cx } from './cx';

/**
 * Campo de formulário: rótulo, ajuda, erro e foco, juntos e sempre.
 *
 * **A combinação `block font-medium mb-2 text-sm text-theme-primary` aparece
 * 222 vezes** no front. É o rótulo de campo reinventado 222 vezes, e cada uma
 * decide por conta própria se tem texto de ajuda, se mostra erro e como.
 *
 * Aqui os quatro vêm juntos, e o `aria-describedby` liga ajuda e erro ao campo
 * sem ninguém precisar lembrar: quem usa leitor de tela ouve o rótulo, a ajuda
 * e, quando existe, o erro.
 *
 * O campo é o único lugar **mais escuro que o fundo**: é onde se escreve, não
 * onde se lê.
 */

const BASE_CONTROLE = cx(
  'w-full rounded-controle border border-linha bg-fundo px-3.5 text-[0.9375rem] text-texto',
  'min-h-[var(--alvo)] py-2.5',
  'placeholder:text-texto-fraco',
  'transition-[border-color,box-shadow] duration-[var(--t-resposta)] ease-saida motion-reduce:transition-none',
  'disabled:cursor-not-allowed disabled:opacity-50'
);

interface BaseProps {
  label: string;
  ajuda?: string;
  erro?: string;
  /** Esconde o rótulo da tela, mantendo-o para leitor. Use com parcimônia. */
  rotuloOculto?: boolean;
  className?: string;
}

function Moldura({
  label,
  ajuda,
  erro,
  rotuloOculto,
  idCampo,
  idAjuda,
  idErro,
  className,
  children,
}: BaseProps & {
  idCampo: string;
  idAjuda: string;
  idErro: string;
  children: ReactNode;
}) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label
        htmlFor={idCampo}
        className={cx(
          't-rotulo font-medium text-texto',
          rotuloOculto && 'sr-only'
        )}
      >
        {label}
      </label>

      {children}

      {ajuda && !erro && (
        <span id={idAjuda} className="t-legenda">
          {ajuda}
        </span>
      )}

      {/* Sempre no DOM, vazio quando não há erro: uma região viva só anuncia
          o que muda depois de existir. Montada junto com o erro, o leitor de
          tela não diria nada. */}
      <span
        id={idErro}
        aria-live="polite"
        className="t-legenda text-erro empty:hidden"
      >
        {erro}
      </span>
    </div>
  );
}

type FieldProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;

export function Field({
  label,
  ajuda,
  erro,
  rotuloOculto,
  className,
  ...resto
}: FieldProps) {
  const id = useId();
  // Um `id` vindo de fora vence: senão o `<label htmlFor>` apontaria para
  // um campo que não existe.
  const idCampo = resto.id ?? `${id}-campo`;
  const idAjuda = `${id}-ajuda`;
  const idErro = `${id}-erro`;

  return (
    <Moldura
      label={label}
      ajuda={ajuda}
      erro={erro}
      rotuloOculto={rotuloOculto}
      idCampo={idCampo}
      idAjuda={idAjuda}
      idErro={idErro}
      className={className}
    >
      <input
        id={idCampo}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? idErro : ajuda ? idAjuda : undefined}
        className={cx(BASE_CONTROLE, erro && 'border-erro')}
        {...resto}
      />
    </Moldura>
  );
}

type AreaProps = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;

Field.Area = function FieldArea({
  label,
  ajuda,
  erro,
  rotuloOculto,
  className,
  ...resto
}: AreaProps) {
  const id = useId();
  // Um `id` vindo de fora vence: senão o `<label htmlFor>` apontaria para
  // um campo que não existe.
  const idCampo = resto.id ?? `${id}-campo`;
  const idAjuda = `${id}-ajuda`;
  const idErro = `${id}-erro`;

  return (
    <Moldura
      label={label}
      ajuda={ajuda}
      erro={erro}
      rotuloOculto={rotuloOculto}
      idCampo={idCampo}
      idAjuda={idAjuda}
      idErro={idErro}
      className={className}
    >
      <textarea
        id={idCampo}
        rows={4}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? idErro : ajuda ? idAjuda : undefined}
        className={cx(BASE_CONTROLE, 'resize-y', erro && 'border-erro')}
        {...resto}
      />
    </Moldura>
  );
};

type SelecaoProps = BaseProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
    children: ReactNode;
  };

Field.Selecao = function FieldSelecao({
  label,
  ajuda,
  erro,
  rotuloOculto,
  className,
  children,
  ...resto
}: SelecaoProps) {
  const id = useId();
  // Um `id` vindo de fora vence: senão o `<label htmlFor>` apontaria para
  // um campo que não existe.
  const idCampo = resto.id ?? `${id}-campo`;
  const idAjuda = `${id}-ajuda`;
  const idErro = `${id}-erro`;

  return (
    <Moldura
      label={label}
      ajuda={ajuda}
      erro={erro}
      rotuloOculto={rotuloOculto}
      idCampo={idCampo}
      idAjuda={idAjuda}
      idErro={idErro}
      className={className}
    >
      <select
        id={idCampo}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? idErro : ajuda ? idAjuda : undefined}
        className={cx(BASE_CONTROLE, erro && 'border-erro')}
        {...resto}
      >
        {children}
      </select>
    </Moldura>
  );
};
