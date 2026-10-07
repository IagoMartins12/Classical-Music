'use client';

import { useState } from 'react';
import {
  PiCaretDown,
  PiFunnelSimple,
  PiRows,
  PiSquaresFour,
} from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Abas, Aba } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { FAMOSOS, formatar } from './dados';
import { EPOCAS_HISTORIA } from './epocas-dados';
import { INSTRUMENTOS } from './instrumentos-dados';
import {
  FILTROS_OBRAS,
  LISTA_COMPOSITORES,
  LISTA_OBRAS,
  PAISES_FILTRO,
  TOTAIS,
} from './listas-dados';
import {
  CampoDeBusca,
  CartaoCompositor,
  DetalheEpoca,
  DetalheInstrumento,
  LinhaObra,
  type Epoca,
  type Instrumento,
} from './paginas-comum';
import { Ficha, anos } from './pecas';

/**
 * C — as listagens como telas de aplicativo: a busca fica presa no topo, os
 * filtros são fichas que abrem uma folha (no telefone é a folha de baixo), a
 * lista é enxuta e "carregar mais" no fim. História e instrumentos são grades
 * de cartões que abrem o detalhe em folha.
 */

const C = 'c' as const;

function BarraDeFiltros({
  fichas,
  contagem,
  aoAbrir,
}: {
  fichas: { nome: string; valor?: string }[];
  contagem: number;
  aoAbrir: () => void;
}) {
  return (
    <div className="sticky top-16 z-elevado -mx-4 flex flex-col gap-3 bg-fundo px-4 py-3">
      <div className="faixa-rola flex gap-2 overflow-x-auto">
        <Button tamanho="p" icone={PiFunnelSimple} onClick={aoAbrir}>
          Filtros{contagem ? ` · ${contagem}` : ''}
        </Button>
        {fichas.map((f) => (
          <button
            key={f.nome}
            type="button"
            onClick={aoAbrir}
            className={cx(
              'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[0.875rem]',
              f.valor
                ? 'tint-ouro text-ouro-na-tinta'
                : 'bg-sup-2 text-texto-suave'
            )}
          >
            {f.valor ?? f.nome}
            <Icon de={PiCaretDown} tamanho="pp" />
          </button>
        ))}
      </div>
    </div>
  );
}

function FolhaDeFiltros({
  aberta,
  aoFechar,
  grupos,
  resultado,
}: {
  aberta: boolean;
  aoFechar: () => void;
  grupos: { titulo: string; itens: string[]; ativo?: string }[];
  resultado: string;
}) {
  return (
    <Sheet
      aberto={aberta}
      aoFechar={aoFechar}
      titulo="Filtros"
      largura="m"
      rodape={
        <div className="flex items-center justify-between gap-3">
          <Button variante="fantasma">Limpar</Button>
          <Button variante="primario" onClick={aoFechar}>
            {resultado}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {grupos.map((g) => (
          <fieldset key={g.titulo} className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2 font-medium">{g.titulo}</legend>
            <div className="flex flex-wrap gap-2">
              {g.itens.map((i) => (
                <Ficha key={i} ativa={g.ativo === i}>
                  {i}
                </Ficha>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </Sheet>
  );
}

export function CompositoresC() {
  const [filtros, setFiltros] = useState(false);
  const [grade, setGrade] = useState(false);
  return (
    <div className="section-wrap flex flex-col gap-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="t-titulo">Compositores</h1>
        <span className="t-dado text-[0.875rem] text-texto-suave">
          {formatar(TOTAIS.compositores)}
        </span>
      </div>
      <CampoDeBusca id="c-busca-compositores" placeholder="Buscar compositor" />
      <BarraDeFiltros
        fichas={[
          { nome: 'Época', valor: 'Romântico' },
          { nome: 'País' },
          { nome: 'Mais procurados' },
        ]}
        contagem={1}
        aoAbrir={() => setFiltros(true)}
      />
      <div className="flex items-center justify-between">
        <span className="t-rotulo text-texto-suave">
          {formatar(10365)} românticos
        </span>
        <span className="flex gap-1">
          <Button
            tamanho="p"
            variante={grade ? 'fantasma' : 'secundario'}
            icone={PiRows}
            rotulo="Lista"
            onClick={() => setGrade(false)}
          />
          <Button
            tamanho="p"
            variante={grade ? 'secundario' : 'fantasma'}
            icone={PiSquaresFour}
            rotulo="Grade"
            onClick={() => setGrade(true)}
          />
        </span>
      </div>
      {grade ? (
        <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-5 lg:grid-cols-7">
          {LISTA_COMPOSITORES.map((c) => (
            <li key={c.id}>
              <CartaoCompositor c={c} esboco={C} forma="circulo" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--linha)]">
          {LISTA_COMPOSITORES.map((c) => (
            <li key={c.id}>
              <CartaoCompositor c={c} esboco={C} forma="linha" />
            </li>
          ))}
        </ul>
      )}
      <Button className="self-center">Carregar mais</Button>
      <FolhaDeFiltros
        aberta={filtros}
        aoFechar={() => setFiltros(false)}
        resultado={`Ver ${formatar(10365)} compositores`}
        grupos={[
          {
            titulo: 'Época',
            itens: FILTROS_OBRAS.epocas.map((e) => e.nome),
            ativo: 'Romântico',
          },
          { titulo: 'País', itens: PAISES_FILTRO },
          {
            titulo: 'Ordem',
            itens: ['Mais procurados', 'A–Z', 'Nascimento'],
            ativo: 'Mais procurados',
          },
          {
            titulo: 'Só com',
            itens: ['Retrato', 'Biografia', 'Obras com gravação'],
          },
        ]}
      />
    </div>
  );
}

export function ObrasC() {
  const [filtros, setFiltros] = useState(false);
  const [recorte, setRecorte] = useState<'tudo' | 'partitura' | 'gravacao'>(
    'tudo'
  );
  const lista = LISTA_OBRAS.filter(
    (o) =>
      recorte === 'tudo' ||
      (recorte === 'partitura' ? o.partituras : o.midia?.length)
  );
  return (
    <div className="section-wrap flex flex-col gap-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="t-titulo">Obras</h1>
        <span className="t-dado text-[0.875rem] text-texto-suave">
          {formatar(TOTAIS.obras)}
        </span>
      </div>
      <CampoDeBusca
        id="c-busca-obras"
        placeholder="Título, opus ou compositor"
      />
      <BarraDeFiltros
        fichas={[
          { nome: 'Instrumento', valor: 'Piano' },
          { nome: 'Época' },
          { nome: 'Gênero' },
          { nome: 'Compositor' },
          { nome: 'Categoria' },
        ]}
        contagem={1}
        aoAbrir={() => setFiltros(true)}
      />
      <Abas rotulo="Recorte">
        <Aba ativa={recorte === 'tudo'} onClick={() => setRecorte('tudo')}>
          Tudo
        </Aba>
        <Aba
          ativa={recorte === 'partitura'}
          onClick={() => setRecorte('partitura')}
        >
          Com partitura guardada
        </Aba>
        <Aba
          ativa={recorte === 'gravacao'}
          onClick={() => setRecorte('gravacao')}
        >
          Com gravação
        </Aba>
      </Abas>
      <ul className="flex flex-col divide-y divide-[var(--linha)]">
        {lista.map((o) => (
          <li key={o.id}>
            <LinhaObra o={o} esboco={C} />
          </li>
        ))}
      </ul>
      <Button className="self-center">Carregar mais</Button>
      <FolhaDeFiltros
        aberta={filtros}
        aoFechar={() => setFiltros(false)}
        resultado={`Ver ${formatar(108822)} obras`}
        grupos={[
          {
            titulo: 'Instrumento',
            itens: FILTROS_OBRAS.instrumentos.map((i) => i.nome),
            ativo: 'Piano',
          },
          { titulo: 'Época', itens: FILTROS_OBRAS.epocas.map((e) => e.nome) },
          { titulo: 'Gênero', itens: FILTROS_OBRAS.generos },
          { titulo: 'Categoria', itens: FILTROS_OBRAS.categorias },
        ]}
      />
    </div>
  );
}

export function HistoriaC() {
  const [aba, setAba] = useState<'epocas' | 'linha'>('epocas');
  const [aberta, setAberta] = useState<Epoca | null>(null);
  const linha = [...FAMOSOS].sort((a, b) => a.nasc - b.nasc);
  return (
    <div className="section-wrap flex flex-col gap-6 py-8">
      <h1 className="t-titulo">História da música</h1>
      <Abas rotulo="Ver por">
        <Aba ativa={aba === 'epocas'} onClick={() => setAba('epocas')}>
          Épocas
        </Aba>
        <Aba ativa={aba === 'linha'} onClick={() => setAba('linha')}>
          Linha do tempo
        </Aba>
      </Abas>
      {aba === 'epocas' ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EPOCAS_HISTORIA.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => setAberta(e)}
                className="group flex w-full flex-col overflow-hidden rounded-card bg-sup-2 text-left"
              >
                <span className="relative aspect-[16/9]">
                  <Image
                    src={e.imagem}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </span>
                <span className="flex flex-col gap-1 p-4">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-[1.5rem] group-hover:text-ouro-texto">
                      {e.nome}
                    </span>
                    <span className="t-dado text-[0.75rem] text-texto-fraco">
                      {e.periodo.replace('-', '–')}
                    </span>
                  </span>
                  <span className="t-rotulo line-clamp-2 text-texto-suave">
                    {e.descricao}
                  </span>
                  <span className="t-legenda mt-1">
                    {formatar(e.compositores)} compositores ·{' '}
                    {formatar(e.obras)} obras
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ol className="flex flex-col divide-y divide-[var(--linha)]">
          {linha.map((c) => (
            <li key={c.id}>
              <CartaoCompositor
                c={{
                  id: c.id,
                  nome: c.nome,
                  nomeCompleto: c.nomeCompleto,
                  nasc: c.nasc,
                  morte: c.morte,
                  pais: c.pais,
                  epoca: anos(c.nasc, c.morte),
                  obras: c.obras ?? 0,
                  retrato: c.retrato,
                  verificado: c.verificado,
                  ficha: c.nome === 'Chopin' ? 'completa' : 'tipica',
                }}
                esboco={C}
                forma="linha"
              />
            </li>
          ))}
        </ol>
      )}
      <Sheet
        aberto={!!aberta}
        aoFechar={() => setAberta(null)}
        titulo={aberta?.nome ?? ''}
        descricao={aberta?.periodo.replace('-', '–')}
        largura="g"
      >
        {aberta && <DetalheEpoca e={aberta} esboco={C} compacto />}
      </Sheet>
    </div>
  );
}

export function InstrumentosC() {
  const [aberto, setAberto] = useState<Instrumento | null>(null);
  return (
    <div className="section-wrap flex flex-col gap-6 py-8">
      <h1 className="t-titulo">Instrumentos</h1>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {INSTRUMENTOS.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              onClick={() => setAberto(i)}
              className="group flex h-full w-full flex-col gap-2 rounded-card bg-sup-2 p-5 text-left"
            >
              <span className="t-dado text-[0.75rem] text-ouro-texto">
                {i.periodo}
              </span>
              <span className="font-display text-[1.75rem] leading-none group-hover:text-ouro-texto">
                {i.nome}
              </span>
              <span className="t-rotulo text-texto-suave">{i.familia}</span>
              <span className="t-legenda mt-auto">
                {formatar(i.obras)} obras
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Sheet
        aberto={!!aberto}
        aoFechar={() => setAberto(null)}
        titulo={aberto?.nome ?? ''}
        descricao={aberto ? `${aberto.familia} · ${aberto.periodo}` : undefined}
        largura="g"
      >
        {aberto && <DetalheInstrumento i={aberto} esboco={C} />}
      </Sheet>
    </div>
  );
}
