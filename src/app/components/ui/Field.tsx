'use client';

import { Children, Fragment, isValidElement, useId } from 'react';
import type { ChangeEvent, ReactElement, Ref } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cx } from './cx';
import { Selecao } from './Selecao';
import type { OpcaoSelecao } from './Selecao';

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

/**
 * A aparência vem de `.input-classical` (`globals.css`), a mesma dos 377
 * campos antigos: um lugar só decide como um campo se parece. `pl-4` vence o
 * recuo de 3rem que a classe guarda para campo com ícone.
 */
const BASE_CONTROLE = 'input-classical w-full pl-4';

interface BaseProps {
  label: ReactNode;
  ajuda?: string;
  erro?: string;
  /** Esconde o rótulo da tela, mantendo-o para leitor. Use com parcimônia. */
  rotuloOculto?: boolean;
  /** Classes da moldura (o `div` que junta rótulo, campo e mensagens). */
  className?: string;
  /** Classes do próprio campo — altura de um `textarea`, largura fixa. */
  classeCampo?: string;
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
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    /** Reaches the `<input>` (React 19 passes `ref` as a prop). */
    ref?: Ref<HTMLInputElement>;
  };

export function Field({
  label,
  ajuda,
  erro,
  rotuloOculto,
  className,
  classeCampo,
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
        className={cx(BASE_CONTROLE, classeCampo)}
        {...resto}
      />
    </Moldura>
  );
}

type AreaProps = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
    ref?: Ref<HTMLTextAreaElement>;
  };

Field.Area = function FieldArea({
  label,
  ajuda,
  erro,
  rotuloOculto,
  className,
  classeCampo,
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
        className={cx(BASE_CONTROLE, 'resize-y', classeCampo)}
        {...resto}
      />
    </Moldura>
  );
};

type SelecaoProps = BaseProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
    children: ReactNode;
  };

/** Texto de um nó React, para o rótulo de uma `<option>` escrita à mão. */
function textoDe(no: ReactNode): string {
  if (no === null || no === undefined || typeof no === 'boolean') return '';
  if (typeof no === 'string' || typeof no === 'number') return String(no);
  if (Array.isArray(no)) return no.map(textoDe).join('');
  if (isValidElement(no))
    return textoDe((no.props as { children?: ReactNode }).children);
  return '';
}

/** As `<option>` dos filhos — escritas à mão, em `.map(...)` ou em fragmento. */
function opcoesDe(filhos: ReactNode): OpcaoSelecao[] {
  const saida: OpcaoSelecao[] = [];
  Children.toArray(filhos).forEach((filho) => {
    if (!isValidElement(filho)) return;
    const el = filho as ReactElement<{
      value?: string | number;
      disabled?: boolean;
      children?: ReactNode;
    }>;
    if (el.type === Fragment) {
      saida.push(...opcoesDe(el.props.children));
    } else if (el.type === 'option') {
      const rotulo = textoDe(el.props.children);
      saida.push({
        value: String(el.props.value ?? rotulo),
        label: rotulo,
        disabled: el.props.disabled,
      });
    } else if (el.type === 'optgroup') {
      saida.push(...opcoesDe(el.props.children));
    }
  });
  return saida;
}

/**
 * Seleção com rótulo. As opções continuam vindo como `<option>` filhos — é o
 * que as telas já escrevem —, mas quem desenha é o `Selecao` do sistema.
 */
Field.Selecao = function FieldSelecao({
  label,
  ajuda,
  erro,
  rotuloOculto,
  className,
  classeCampo,
  children,
  ...resto
}: SelecaoProps) {
  const id = useId();
  // Um `id` vindo de fora vence: senão o `<label htmlFor>` apontaria para
  // um campo que não existe.
  const idCampo = resto.id ?? `${id}-campo`;
  const idAjuda = `${id}-ajuda`;
  const idErro = `${id}-erro`;
  const opcoes = opcoesDe(children);
  const valor = String(
    resto.value ?? resto.defaultValue ?? opcoes[0]?.value ?? ''
  );

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
      <Selecao
        id={idCampo}
        name={resto.name}
        opcoes={opcoes}
        valor={valor}
        aoMudar={(novo) =>
          resto.onChange?.({
            target: { value: novo, name: resto.name ?? '' },
            currentTarget: { value: novo, name: resto.name ?? '' },
          } as unknown as ChangeEvent<HTMLSelectElement>)
        }
        disabled={resto.disabled}
        invalido={!!erro}
        aria-describedby={erro ? idErro : ajuda ? idAjuda : undefined}
        className={classeCampo}
      />
    </Moldura>
  );
};
