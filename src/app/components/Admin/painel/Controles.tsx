'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PiMagnifyingGlass, PiX } from 'react-icons/pi';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';

/**
 * Busca do painel: espera a pessoa parar de digitar (350ms) antes de avisar.
 * Sem isso, cada letra virava uma chamada à API — em "Beethoven", nove.
 */
export function Busca({
  valor,
  aoMudar,
  placeholder,
  rotulo,
  className,
}: {
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder: string;
  rotulo: string;
  className?: string;
}) {
  const [texto, setTexto] = useState(valor);
  const primeira = useRef(true);

  useEffect(() => setTexto(valor), [valor]);

  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (texto !== valor) aoMudar(texto);
    }, 350);
    return () => clearTimeout(t);
    // `valor` e `aoMudar` de fora não reiniciam a espera.
  }, [texto]);

  return (
    <label className={cx('relative block w-full max-w-md', className)}>
      <span className="sr-only">{rotulo}</span>
      <Icon
        de={PiMagnifyingGlass}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-texto-fraco"
      />
      <input
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={placeholder}
        className="input-classical w-full !pl-11 !pr-11"
      />
      {texto && (
        <button
          type="button"
          onClick={() => {
            setTexto('');
            aoMudar('');
          }}
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-controle text-texto-fraco hover:text-texto"
        >
          <Icon de={PiX} />
          <span className="sr-only">Limpar busca</span>
        </button>
      )}
    </label>
  );
}

/** Escolha entre poucas opções que trocam o recorte da tela (período, estado). */
export function Segmentos<T extends string | number>({
  opcoes,
  valor,
  aoMudar,
  rotulo,
  className,
}: {
  opcoes: { valor: T; rotulo: ReactNode; contagem?: number | null }[];
  valor: T;
  aoMudar: (valor: T) => void;
  rotulo: string;
  className?: string;
}) {
  return (
    <Abas rotulo={rotulo} className={cx('w-fit max-w-full', className)}>
      {opcoes.map((o) => (
        <Aba
          key={String(o.valor)}
          ativa={o.valor === valor}
          onClick={() => aoMudar(o.valor)}
        >
          {o.rotulo}
          {o.contagem !== undefined && o.contagem !== null && (
            <span className="t-dado ml-1.5 text-xs opacity-70">
              {o.contagem.toLocaleString('pt-BR')}
            </span>
          )}
        </Aba>
      ))}
    </Abas>
  );
}

export const PERIODOS = [
  { valor: 7, rotulo: '7 dias' },
  { valor: 30, rotulo: '30 dias' },
  { valor: 90, rotulo: '90 dias' },
  { valor: 365, rotulo: '1 ano' },
] as const;

/**
 * A barra das ações em lote: aparece quando há algo selecionado, e fica
 * presa no topo enquanto a lista rola.
 */
export function BarraDeSelecao({
  quantidade,
  singular,
  plural,
  aoLimpar,
  children,
}: {
  quantidade: number;
  singular: string;
  plural: string;
  aoLimpar: () => void;
  children: ReactNode;
}) {
  if (quantidade === 0) return null;
  return (
    <Inline
      extremos
      quebra
      gap={3}
      className="sticky top-16 z-elevado rounded-controle bg-sup-2 px-4 py-2 shadow-[var(--sombra-1)]"
    >
      <Text papel="rotulo" aria-live="polite">
        <span className="t-dado">{quantidade}</span>{' '}
        {quantidade === 1 ? singular : plural}
      </Text>
      <Inline
        gap={2}
        quebra
        className="max-sm:w-full max-sm:[&>*]:min-w-[30%] max-sm:[&>*]:flex-1"
      >
        <Button tamanho="p" variante="fantasma" onClick={aoLimpar}>
          Limpar seleção
        </Button>
        {children}
      </Inline>
    </Inline>
  );
}
