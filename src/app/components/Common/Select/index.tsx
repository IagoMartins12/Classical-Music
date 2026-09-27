// components/ui/Select.tsx - VERSÃO CORRIGIDA SEM HYDRATION MISMATCH
'use client';

import React, { forwardRef, useId, useMemo } from 'react';
import { PiWarningCircle } from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';
import { Selecao } from '@/app/components/ui/Selecao';

interface SelectOption {
  value: string;
  label: string;
  key?: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'defaultValue'
> {
  label?: React.ReactNode;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  defaultValue?: string;
  /** Ícone à esquerda, dentro do campo. */
  icone?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder,
      className = '',
      containerClassName = '',
      id,
      value,
      defaultValue,
      icone,
      ...props
    },
    ref
  ) => {
    // 🔥 USAR useId PARA ID ESTÁVEL E CONSISTENTE (SSR SAFE)
    const selectId = useId();
    const finalId = id || selectId;

    // 🔥 MEMOIZAR OPÇÕES PARA EVITAR RE-RENDERS
    const memoizedOptions = useMemo(() => options, [options]);

    // 🔥 RESOLVER defaultValue DE FORMA ESTÁVEL E MEMOIZADA
    const resolvedDefaultValue = useMemo(() => {
      if (!defaultValue || (value !== undefined && value !== '')) {
        return undefined;
      }

      // Tentar encontrar por value exato primeiro
      const optionByValue = memoizedOptions.find(
        (option) => option.value === defaultValue
      );
      if (optionByValue) {
        return optionByValue.value;
      }

      // Depois tentar por label (case-insensitive)
      const optionByLabel = memoizedOptions.find(
        (option) => option.label.toLowerCase() === defaultValue.toLowerCase()
      );
      if (optionByLabel) {
        return optionByLabel.value;
      }

      // Por último, busca parcial no label
      const optionByPartialLabel = memoizedOptions.find((option) =>
        option.label.toLowerCase().includes(defaultValue.toLowerCase())
      );
      if (optionByPartialLabel) {
        return optionByPartialLabel.value;
      }

      return undefined;
    }, [defaultValue, memoizedOptions, value]);

    // 🔥 DETERMINAR VALUE FINAL DE FORMA ESTÁVEL
    const finalValue = value !== undefined ? value : resolvedDefaultValue;

    return (
      <div className={`relative ${containerClassName}`}>
        {label && (
          <label
            htmlFor={finalId}
            className="block t-rotulo font-medium text-texto mb-2"
          >
            {label}
          </label>
        )}

        {/* O select do sistema, no lugar do `<select>` nativo (cuja lista o
            sistema operacional desenha e não aceita estilo). A API continua a
            mesma: o `onChange` recebe `{ target: { value, name } }`, que é o
            que as 228 telas leem, e o `ref` foca o botão. */}
        <Selecao
          ref={ref as unknown as React.Ref<HTMLButtonElement>}
          id={finalId}
          name={props.name}
          opcoes={memoizedOptions}
          valor={String(finalValue ?? '')}
          aoMudar={(novo) =>
            props.onChange?.({
              target: { value: novo, name: props.name ?? '' },
              currentTarget: { value: novo, name: props.name ?? '' },
            } as unknown as React.ChangeEvent<HTMLSelectElement>)
          }
          placeholder={placeholder}
          icone={icone}
          disabled={props.disabled}
          invalido={!!error || props['aria-invalid'] === true}
          // Sem `label`, o nome vem do placeholder ou, sem ele, da primeira
          // opção ("Todos os períodos"): na home e em `/composers` o select
          // era usado sem rótulo nenhum. Um `aria-label` explícito vence.
          aria-label={
            props['aria-label'] ??
            (label ? undefined : placeholder || memoizedOptions[0]?.label)
          }
          aria-describedby={
            props['aria-describedby'] ?? (error ? `${finalId}-erro` : undefined)
          }
          onBlur={
            props.onBlur as unknown as React.FocusEventHandler<HTMLButtonElement>
          }
          onFocus={
            props.onFocus as unknown as React.FocusEventHandler<HTMLButtonElement>
          }
          className={className}
        />

        {/* Mensagem de erro */}
        {error && (
          <Inline
            as="p"
            id={`${finalId}-erro`}
            gap={2}
            className="text-erro t-rotulo font-medium mt-1"
          >
            <PiWarningCircle className="w-4 h-4" />
            <span>{error}</span>
          </Inline>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
