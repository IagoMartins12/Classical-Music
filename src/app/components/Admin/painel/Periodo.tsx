'use client';

import { useId } from 'react';
import { Selecao } from '@/app/components/ui/Selecao';
import { Segmentos } from './Controles';

/**
 * O período de uma tela: os quatro mais usados à vista, o resto num seletor
 * ao lado — oito botões numa faixa quebram a linha do cabeçalho no telefone
 * e empurram as ações para baixo. "Escolher datas" abre dois campos de data.
 */

export type Periodo =
  | { tipo: 'dias'; dias: number }
  | { tipo: 'sempre' }
  | { tipo: 'intervalo'; de: string; ate: string };

const ATALHOS = [
  { valor: '1', rotulo: 'Hoje' },
  { valor: '7', rotulo: '7 dias' },
  { valor: '30', rotulo: '30 dias' },
  { valor: '90', rotulo: '3 meses' },
];

const OUTROS = [
  { value: '180', label: '6 meses' },
  { value: '365', label: '1 ano' },
  { value: 'sempre', label: 'Desde sempre' },
  { value: 'intervalo', label: 'Escolher datas…' },
];

const chave = (p: Periodo) =>
  p.tipo === 'dias'
    ? String(p.dias)
    : p.tipo === 'sempre'
      ? 'sempre'
      : 'intervalo';

/** De quando a quando, em ISO, para a API. `de` nulo: desde o início. */
export function janelaDo(p: Periodo): {
  de: string | null;
  ate: string | null;
} {
  if (p.tipo === 'sempre') return { de: null, ate: null };
  if (p.tipo === 'intervalo') {
    return {
      de: p.de ? new Date(`${p.de}T00:00:00`).toISOString() : null,
      ate: p.ate ? new Date(`${p.ate}T23:59:59.999`).toISOString() : null,
    };
  }
  // "Hoje" é desde a meia-noite; "7 dias" são hoje e os seis anteriores.
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (p.dias - 1));
  return { de: d.toISOString(), ate: null };
}

/** "nos últimos 30 dias", "hoje", "desde o início", "de 01/09 a 15/09". */
export function nomeDoPeriodo(p: Periodo): string {
  if (p.tipo === 'sempre') return 'desde o início';
  if (p.tipo === 'intervalo') {
    const f = (v: string) =>
      v ? new Date(`${v}T12:00:00`).toLocaleDateString('pt-BR') : '…';
    return `de ${f(p.de)} a ${f(p.ate)}`;
  }
  if (p.dias === 1) return 'hoje';
  const nomes: Record<number, string> = {
    90: 'nos últimos 3 meses',
    180: 'nos últimos 6 meses',
    365: 'no último ano',
  };
  return nomes[p.dias] ?? `nos últimos ${p.dias} dias`;
}

export function SeletorDePeriodo({
  valor,
  aoMudar,
}: {
  valor: Periodo;
  aoMudar: (p: Periodo) => void;
}) {
  const id = useId();
  const k = chave(valor);
  const noAtalho = ATALHOS.some((a) => a.valor === k);

  const escolher = (v: string) => {
    if (v === 'sempre') aoMudar({ tipo: 'sempre' });
    else if (v === 'intervalo') {
      const hoje = new Date().toISOString().slice(0, 10);
      const mes = new Date(Date.now() - 30 * 86_400_000)
        .toISOString()
        .slice(0, 10);
      aoMudar({ tipo: 'intervalo', de: mes, ate: hoje });
    } else if (v) aoMudar({ tipo: 'dias', dias: Number(v) });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmentos
        rotulo="Período"
        opcoes={ATALHOS}
        valor={noAtalho ? k : ''}
        aoMudar={escolher}
      />
      <div className="w-40">
        <label htmlFor={`${id}-outro`} className="sr-only">
          Outro período
        </label>
        <Selecao
          id={`${id}-outro`}
          valor={noAtalho ? '' : k}
          aoMudar={escolher}
          opcoes={[{ value: '', label: 'Outro período' }, ...OUTROS]}
        />
      </div>
      {valor.tipo === 'intervalo' && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`${id}-de`} className="sr-only">
            De
          </label>
          <input
            id={`${id}-de`}
            type="date"
            value={valor.de}
            max={valor.ate || undefined}
            onChange={(e) => aoMudar({ ...valor, de: e.target.value })}
            className="input-classical w-40 pl-3"
          />
          <span className="t-legenda" aria-hidden="true">
            a
          </span>
          <label htmlFor={`${id}-ate`} className="sr-only">
            Até
          </label>
          <input
            id={`${id}-ate`}
            type="date"
            value={valor.ate}
            min={valor.de || undefined}
            onChange={(e) => aoMudar({ ...valor, ate: e.target.value })}
            className="input-classical w-40 pl-3"
          />
        </div>
      )}
    </div>
  );
}
