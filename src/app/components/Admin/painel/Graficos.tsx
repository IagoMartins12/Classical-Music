'use client';

import { useState } from 'react';
import { cx } from '@/app/components/ui/cx';

/**
 * Os gráficos do painel: colunas no tempo, barras de proporção e a pizza
 * (parte do todo, poucas fatias). Uma série por gráfico, sempre ouro — a paleta do produto é
 * contida, e com uma série só o título já diz o que está plotado (sem
 * legenda).
 *
 * Regras de marca (skill de visualização): coluna com no máximo 24px de
 * largura e ponta arredondada de 4px, quadrada na base; 2px de ar entre
 * colunas vizinhas; grade de 1px contínua e recessiva; texto sempre na cor
 * de texto, nunca no ouro da barra. O período atual em ouro cheio, os outros
 * no ouro a 40% — a única ênfase. Cada coluna mostra o valor ao passar o
 * cursor (o alvo é a faixa inteira, não só a barra), e uma tabela invisível
 * na tela entrega os mesmos números ao leitor de tela.
 */

export interface Ponto {
  rotulo: string;
  /** O rótulo curto do eixo; sem ele, usa `rotulo`. */
  eixo?: string;
  valor: number;
  /** O registro por trás do ponto (a época, o tipo), para o clique filtrar. */
  id?: string;
}

/**
 * Uma série diária em colunas: até 90 dias, uma por dia; mais que isso, uma
 * por semana (365 colunas de 2px não se leem nem se apontam com o dedo).
 */
export function colunasPorDia<T extends { dia: string }>(
  serie: T[],
  valor: (d: T) => number
): Ponto[] {
  const dia = (d: string) => new Date(`${d}T12:00:00`);
  if (serie.length <= 90) {
    return serie.map((d) => ({
      rotulo: dia(d.dia).toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      }),
      eixo: `${d.dia.slice(8, 10)}/${d.dia.slice(5, 7)}`,
      valor: valor(d),
    }));
  }
  const semanas: Ponto[] = [];
  for (let i = 0; i < serie.length; i += 7) {
    const bloco = serie.slice(i, i + 7);
    const de = dia(bloco[0].dia);
    const ate = dia(bloco[bloco.length - 1].dia);
    const curta = (d: Date) =>
      d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    semanas.push({
      rotulo: `${curta(de)} a ${curta(ate)}`,
      eixo: `${bloco[0].dia.slice(8, 10)}/${bloco[0].dia.slice(5, 7)}`,
      valor: bloco.reduce((s, d) => s + valor(d), 0),
    });
  }
  return semanas;
}

export function Colunas({
  dados,
  titulo,
  formatar = (n) => n.toLocaleString('pt-BR'),
  altura = 160,
  destacarUltimo = true,
  linhaMedia = false,
}: {
  dados: Ponto[];
  /** Nome do gráfico para leitor de tela e para a tabela. */
  titulo: string;
  formatar?: (n: number) => string;
  altura?: number;
  destacarUltimo?: boolean;
  /** Uma linha na média: dá escala sem desenhar eixo. */
  linhaMedia?: boolean;
}) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const maximo = Math.max(1, ...dados.map((d) => d.valor));
  const media = dados.length
    ? dados.reduce((s, d) => s + d.valor, 0) / dados.length
    : 0;
  // Rótulos do eixo: o primeiro, o do meio e o último — o resto na dica.
  const marcas = new Set([
    0,
    Math.floor((dados.length - 1) / 2),
    dados.length - 1,
  ]);
  const vazio = dados.every((d) => d.valor === 0);

  return (
    <figure className="flex flex-col gap-2">
      <div
        className="relative flex items-end border-b border-linha"
        style={{ height: altura }}
        onMouseLeave={() => setAtivo(null)}
      >
        {vazio && (
          <span className="t-rotulo absolute inset-0 grid place-items-center text-texto-fraco">
            Nada no período
          </span>
        )}
        {linhaMedia && media > 0 && (
          <span
            className="pointer-events-none absolute inset-x-0 border-t border-linha"
            style={{ bottom: (media / maximo) * altura }}
          />
        )}
        {dados.map((d, i) => {
          const atual = destacarUltimo && i === dados.length - 1;
          const h = d.valor > 0 ? Math.max(2, (d.valor / maximo) * altura) : 0;
          return (
            <div
              key={`${d.rotulo}-${i}`}
              className="relative flex h-full flex-1 items-end justify-center px-px"
              onMouseEnter={() => setAtivo(i)}
            >
              <span
                className={cx(
                  'w-full max-w-6 rounded-t-[4px] transition-colors duration-[var(--t-toque)] ease-saida',
                  atual || ativo === i ? 'bg-ouro' : 'bg-ouro/40'
                )}
                style={{ height: h }}
              />
              {ativo === i && (
                <span
                  className="pointer-events-none absolute z-elevado -translate-y-2 whitespace-nowrap rounded-controle sup-alta !rounded-controle px-2.5 py-1.5 text-center shadow-[var(--sombra-2)]"
                  style={{ bottom: h }}
                >
                  <span className="t-legenda block">{d.rotulo}</span>
                  <span className="t-dado block text-sm text-texto">
                    {formatar(d.valor)}
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </div>
      <figcaption className="flex text-texto-fraco" aria-hidden="true">
        {dados.map((d, i) => (
          <span
            key={`${d.rotulo}-${i}`}
            className="t-dado flex-1 text-center text-xs"
          >
            {marcas.has(i) ? (d.eixo ?? d.rotulo) : ''}
          </span>
        ))}
      </figcaption>
      <TabelaInvisivel titulo={titulo} dados={dados} formatar={formatar} />
    </figure>
  );
}

/**
 * Barras de proporção: quanto cada parte pesa no todo (assinantes por
 * plano, receita por método). Rótulo e valor em texto, a barra só mostra a
 * proporção — lida da maior para a menor.
 */
export function Proporcoes({
  dados,
  titulo,
  formatar = (n) => n.toLocaleString('pt-BR'),
  nota,
  base,
}: {
  dados: Ponto[];
  titulo: string;
  formatar?: (n: number) => string;
  /** Segunda informação por linha (ex.: "12 mensais · 3 anuais"). */
  nota?: (p: Ponto, i: number) => string | null;
  /**
   * Quando as linhas não somam um todo ("favoritam", "anotam" — a mesma
   * pessoa conta nas duas), a porcentagem e a barra são sobre esta base.
   */
  base?: number;
}) {
  const maximo = base ?? Math.max(1, ...dados.map((d) => d.valor));
  const total = base ?? dados.reduce((s, d) => s + d.valor, 0);

  return (
    <figure className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3" aria-label={titulo}>
        {dados.map((d, i) => (
          <li key={d.rotulo} className="flex flex-col gap-1.5">
            <span className="flex items-baseline gap-3">
              <span className="t-rotulo flex-1 text-texto">{d.rotulo}</span>
              <span className="t-dado text-sm text-texto">
                {formatar(d.valor)}
              </span>
              <span className="t-dado w-12 text-right text-xs text-texto-fraco">
                {total > 0 ? `${Math.round((d.valor / total) * 100)}%` : '—'}
              </span>
            </span>
            <span
              className="h-2 w-full rounded-full bg-[var(--linha)]"
              aria-hidden="true"
            >
              <span
                className="block h-full rounded-full bg-ouro"
                style={{
                  width: `${Math.min(100, (d.valor / Math.max(1, maximo)) * 100)}%`,
                }}
              />
            </span>
            {nota?.(d, i) && <span className="t-legenda">{nota(d, i)}</span>}
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Uma série mensal (`AAAA-MM`) em colunas, com o mês por extenso na dica. */
export function colunasPorMes(serie: { mes: string; n: number }[]): Ponto[] {
  return serie.map((m) => {
    const d = new Date(`${m.mes}-15T12:00:00`);
    return {
      rotulo: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      eixo: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      valor: m.n,
    };
  });
}

const CORES_DA_PIZZA = [
  'var(--grafico-1)',
  'var(--grafico-2)',
  'var(--grafico-3)',
  'var(--grafico-4)',
];

/** Fatias além destas viram "Outras": mais que isso, a pizza não se lê. */
const MAX_FATIAS = 4;

/** Ponto de uma circunferência, com 0 no alto e sentido horário. */
const ponto = (cx: number, cy: number, r: number, angulo: number) => [
  cx + r * Math.sin(angulo),
  cy - r * Math.cos(angulo),
];

/** O caminho de uma fatia de rosca entre dois ângulos. */
function arco(
  inicio: number,
  fim: number,
  externo: number,
  interno: number
): string {
  const grande = fim - inicio > Math.PI ? 1 : 0;
  const [x1, y1] = ponto(0, 0, externo, inicio);
  const [x2, y2] = ponto(0, 0, externo, fim);
  const [x3, y3] = ponto(0, 0, interno, fim);
  const [x4, y4] = ponto(0, 0, interno, inicio);
  return [
    `M ${x1} ${y1}`,
    `A ${externo} ${externo} 0 ${grande} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${interno} ${interno} 0 ${grande} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
}

/**
 * Pizza (em rosca): parte do todo, de relance.
 *
 * Regras da skill de visualização: no máximo quatro fatias e "Outras" — com
 * mais, a pizza não se lê e o certo é a barra. As cores são o ouro em quatro
 * degraus, da maior fatia para a menor, e um cinza para "Outras": o painel é
 * de uma cor só, e os degraus foram validados como rampa (monótonos, com
 * distância visível entre vizinhos e contraste mínimo com a superfície, nos
 * dois temas). A identidade nunca fica só na cor: a legenda ao lado traz
 * nome, número e porcentagem, e o centro diz o total ou a fatia apontada.
 * Entre as fatias, um respiro de ~1,5°. Tabela invisível para leitor de tela.
 */
export function Pizza({
  dados,
  titulo,
  formatar = (n) => n.toLocaleString('pt-BR'),
  rotuloOutras = 'Outras',
  aoClicar,
}: {
  dados: Ponto[];
  titulo: string;
  formatar?: (n: number) => string;
  rotuloOutras?: string;
  /** Abre o que está por trás da fatia (filtra a lista, por ex.). */
  aoClicar?: (p: Ponto) => void;
}) {
  const [ativa, setAtiva] = useState<number | null>(null);
  const ordenados = [...dados]
    .filter((d) => d.valor > 0)
    .sort((a, b) => b.valor - a.valor);
  const principais = ordenados.slice(0, MAX_FATIAS);
  const resto = ordenados.slice(MAX_FATIAS);
  const fatias: (Ponto & { outras?: boolean })[] = resto.length
    ? [
        ...principais,
        {
          rotulo: `${rotuloOutras} (${resto.length})`,
          valor: resto.reduce((s, d) => s + d.valor, 0),
          outras: true,
        },
      ]
    : principais;
  const total = fatias.reduce((s, d) => s + d.valor, 0);
  const pct = (v: number) =>
    total > 0
      ? `${((v / total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: v / total < 0.1 ? 1 : 0 })}%`
      : '—';

  if (total === 0) {
    return (
      <p className="t-rotulo text-texto-suave">Nada para mostrar ainda.</p>
    );
  }

  const respiro = fatias.length > 1 ? 0.026 : 0;
  let angulo = 0;
  const caminhos = fatias.map((d, i) => {
    const largura = (d.valor / total) * Math.PI * 2;
    const inicio = angulo + respiro / 2;
    const fim = angulo + largura - respiro / 2;
    angulo += largura;
    return {
      d:
        fatias.length === 1
          ? // Uma fatia só: o arco de 360° não se desenha com um `A`.
            arco(0, Math.PI * 2 - 0.0001, 80, 52)
          : arco(inicio, Math.max(inicio + 0.001, fim), 80, 52),
      cor: d.outras
        ? 'var(--grafico-outras)'
        : CORES_DA_PIZZA[i % CORES_DA_PIZZA.length],
    };
  });
  const foco = ativa !== null ? fatias[ativa] : null;

  return (
    <figure className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative h-40 w-40 shrink-0">
        <svg
          viewBox="-84 -84 168 168"
          className="h-full w-full"
          role="img"
          aria-label={titulo}
        >
          {caminhos.map((c, i) => (
            <path
              key={i}
              d={c.d}
              fill={c.cor}
              className={cx(
                'transition-opacity duration-[var(--t-resposta)] ease-saida',
                ativa !== null && ativa !== i && 'opacity-40',
                aoClicar && 'cursor-pointer'
              )}
              onMouseEnter={() => setAtiva(i)}
              onMouseLeave={() => setAtiva(null)}
              onClick={() =>
                aoClicar && !fatias[i].outras && aoClicar(fatias[i])
              }
            />
          ))}
        </svg>
        <span
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
          aria-hidden="true"
        >
          <span className="t-dado text-lg text-texto">
            {foco ? pct(foco.valor) : formatar(total)}
          </span>
          <span className="t-legenda max-w-24 truncate">
            {foco ? foco.rotulo : 'no total'}
          </span>
        </span>
      </div>
      <ul
        className="flex w-full min-w-0 flex-col gap-1.5"
        // Com clique, a legenda é o jeito de chegar à fatia pelo teclado.
        aria-hidden={aoClicar ? undefined : true}
      >
        {fatias.map((d, i) => {
          const conteudo = (
            <>
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ background: caminhos[i].cor }}
              />
              <span className="t-rotulo min-w-0 flex-1 truncate text-texto">
                {d.rotulo}
              </span>
              <span className="t-dado text-sm text-texto">
                {formatar(d.valor)}
              </span>
              <span className="t-dado w-12 text-right text-xs text-texto-fraco">
                {pct(d.valor)}
              </span>
            </>
          );
          const classe = cx(
            '-mx-2 flex items-center gap-2.5 rounded-controle px-2 py-1 text-left transition-colors',
            ativa === i && 'bg-[var(--interactive-hover)]'
          );
          return (
            <li
              key={`${d.rotulo}-${i}`}
              onMouseEnter={() => setAtiva(i)}
              onMouseLeave={() => setAtiva(null)}
            >
              {aoClicar && !d.outras ? (
                <button
                  type="button"
                  className={cx(classe, 'w-[calc(100%+1rem)]')}
                  onFocus={() => setAtiva(i)}
                  onBlur={() => setAtiva(null)}
                  onClick={() => aoClicar(d)}
                >
                  {conteudo}
                </button>
              ) : (
                <span className={classe}>{conteudo}</span>
              )}
            </li>
          );
        })}
      </ul>
      <TabelaInvisivel titulo={titulo} dados={fatias} formatar={formatar} />
    </figure>
  );
}

function TabelaInvisivel({
  titulo,
  dados,
  formatar,
}: {
  titulo: string;
  dados: Ponto[];
  formatar: (n: number) => string;
}) {
  return (
    <table className="sr-only">
      <caption>{titulo}</caption>
      <tbody>
        {dados.map((d, i) => (
          <tr key={`${d.rotulo}-${i}`}>
            <th scope="row">{d.rotulo}</th>
            <td>{formatar(d.valor)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
