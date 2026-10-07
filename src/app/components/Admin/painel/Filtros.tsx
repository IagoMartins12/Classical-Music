'use client';

import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { PiFunnel, PiX } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Selecao } from '@/app/components/ui/Selecao';

/**
 * Filtros avançados das listas do painel.
 *
 * Os filtros de uso diário ficam à vista (busca, recortes em chips); o resto
 * mora atrás de "Mais filtros", que diz quantos estão ligados — com o painel
 * fechado, a lista filtrada não pode parecer a lista inteira. "Limpar" desliga
 * só os daqui.
 *
 * Cada campo tem rótulo visível: com seis seletores lado a lado, o texto
 * dentro do seletor ("Todos") não diz de quê.
 */
export function MaisFiltros({
  ativos,
  aoLimpar,
  children,
}: {
  /** Quantos filtros daqui estão ligados. */
  ativos: number;
  aoLimpar: () => void;
  children: ReactNode;
}) {
  const id = useId();
  const [aberto, setAberto] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          tamanho="p"
          variante={aberto ? 'secundario' : 'fantasma'}
          icone={PiFunnel}
          aria-expanded={aberto}
          aria-controls={id}
          onClick={() => setAberto((a) => !a)}
        >
          {ativos > 0 ? `Mais filtros (${ativos})` : 'Mais filtros'}
        </Button>
        {ativos > 0 && (
          <Button tamanho="p" variante="texto" icone={PiX} onClick={aoLimpar}>
            Limpar filtros
          </Button>
        )}
      </div>
      {aberto && (
        <div
          id={id}
          className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-card bg-sup-2 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {children}
        </div>
      )}
    </div>
  );
}

function Rotulo({ para, children }: { para: string; children: ReactNode }) {
  return (
    <label htmlFor={para} className="t-legenda">
      {children}
    </label>
  );
}

export function FiltroSelecao({
  rotulo,
  valor,
  aoMudar,
  opcoes,
  todos = 'Todos',
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  opcoes: { value: string; label: string }[];
  /** O texto da opção vazia. */
  todos?: string;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Rotulo para={id}>{rotulo}</Rotulo>
      <Selecao
        id={id}
        valor={valor}
        aoMudar={aoMudar}
        opcoes={[{ value: '', label: todos }, ...opcoes]}
      />
    </div>
  );
}

// A mesma moldura dos campos do sistema (`Field`).
const CAMPO = 'input-classical w-full pl-4';

export function FiltroData({
  rotulo,
  valor,
  aoMudar,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Rotulo para={id}>{rotulo}</Rotulo>
      <input
        id={id}
        type="date"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className={CAMPO}
      />
    </div>
  );
}

export function FiltroTexto({
  rotulo,
  valor,
  aoMudar,
  placeholder,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Rotulo para={id}>{rotulo}</Rotulo>
      <input
        id={id}
        type="text"
        value={valor}
        placeholder={placeholder}
        onChange={(e) => aoMudar(e.target.value)}
        className={CAMPO}
      />
    </div>
  );
}

/** Um intervalo numérico "de … até …" num campo só de rótulo. */
export function FiltroIntervalo({
  rotulo,
  min,
  max,
  aoMudarMin,
  aoMudarMax,
}: {
  rotulo: string;
  min: string;
  max: string;
  aoMudarMin: (v: string) => void;
  aoMudarMax: (v: string) => void;
}) {
  const id = useId();
  return (
    <fieldset className="flex min-w-0 flex-col gap-1">
      <legend className="t-legenda mb-1">{rotulo}</legend>
      <div className="flex items-center gap-2">
        <label htmlFor={`${id}-min`} className="sr-only">
          {rotulo}: mínimo
        </label>
        <input
          id={`${id}-min`}
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="mín."
          value={min}
          onChange={(e) => aoMudarMin(e.target.value)}
          className={`${CAMPO} t-dado`}
        />
        <span className="t-legenda" aria-hidden="true">
          a
        </span>
        <label htmlFor={`${id}-max`} className="sr-only">
          {rotulo}: máximo
        </label>
        <input
          id={`${id}-max`}
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="máx."
          value={max}
          onChange={(e) => aoMudarMax(e.target.value)}
          className={`${CAMPO} t-dado`}
        />
      </div>
    </fieldset>
  );
}

/** Sim / não / tanto faz, como seletor. */
export const SIM_NAO = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
];

export const simNao = (v: string): boolean | undefined =>
  v === 'sim' ? true : v === 'nao' ? false : undefined;

/** Número digitado no filtro, ou nada. */
export const numeroOuNada = (v: string): number | undefined => {
  const n = Number(v);
  return v.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** A data do campo (AAAA-MM-DD) como início ou fim do dia, em ISO. */
export const inicioDoDia = (v: string) =>
  v ? new Date(`${v}T00:00:00`).toISOString() : undefined;
export const fimDoDia = (v: string) =>
  v ? new Date(`${v}T23:59:59.999`).toISOString() : undefined;

/** O valor só depois que a pessoa para de mexer (para texto que vira consulta). */
export function useAtrasado<T>(valor: T, ms = 400): T {
  const [atrasado, setAtrasado] = useState(valor);
  useEffect(() => {
    const t = window.setTimeout(() => setAtrasado(valor), ms);
    return () => window.clearTimeout(t);
  }, [valor, ms]);
  return atrasado;
}
