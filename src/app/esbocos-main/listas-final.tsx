'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  PiCaretDown,
  PiFunnelSimple,
  PiRows,
  PiSquaresFour,
  PiSpotifyLogo,
  PiWaveform,
  PiYoutubeLogo,
  PiX,
} from 'react-icons/pi';
import { Abas, Aba } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { BUSCA_EXEMPLO, formatar, rota, type EsbocoId } from './dados';
import {
  FILTROS_OBRAS,
  LISTA_COMPOSITORES,
  LISTA_OBRAS,
  PAISES_FILTRO,
  TOTAIS,
  type ItemCompositor,
  type ItemObra,
} from './listas-dados';
import { Coracao } from './coracao';
import { CampoDeBusca, Paginacao } from './paginas-comum';
import { Ficha, Retrato, linkTexto, retratoDe } from './pecas';

/**
 * As listagens consolidadas (06/10, esboço A): título de capa, busca larga,
 * os filtros principais à vista e o resto em "Mais filtros", ordem e modo de
 * vista. No telefone, a lista do esboço C (linha com retrato), sempre.
 * Todo cartão tem o coração.
 */

function Cabeca({ titulo, frase }: { titulo: string; frase: string }) {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="entra font-display text-[clamp(3rem,8vw,6rem)] leading-[0.95] tracking-[-0.02em]">
        {titulo}
      </h1>
      <p
        className="t-corpo entra max-w-[56ch] text-texto-suave"
        style={{ ['--i' as string]: 1 }}
      >
        {frase}
      </p>
    </header>
  );
}

function Seletor({
  rotulo,
  valor,
  opcoes,
  aoMudar,
}: {
  rotulo: string;
  valor: string;
  opcoes: string[];
  aoMudar: (v: string) => void;
}) {
  const ativo = valor !== opcoes[0];
  return (
    <label
      className={cx(
        'relative inline-flex min-h-10 items-center rounded-full pl-4 pr-2 text-[0.9375rem]',
        ativo ? 'tint-ouro text-ouro-na-tinta' : 'bg-sup-2 text-texto-suave'
      )}
    >
      <span className="sr-only">{rotulo}</span>
      <span aria-hidden="true" className="mr-1 text-texto-fraco">
        {rotulo}:
      </span>
      <select
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className="min-h-10 cursor-pointer appearance-none bg-transparent pr-6 outline-none"
      >
        {opcoes.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <Icon
        de={PiCaretDown}
        tamanho="pp"
        className="pointer-events-none absolute right-3"
      />
    </label>
  );
}

function BarraDeResultado({
  contagem,
  ordem,
  opcoesOrdem,
  aoOrdenar,
  grade,
  aoGrade,
}: {
  contagem: ReactNode;
  ordem: string;
  opcoesOrdem: string[];
  aoOrdenar: (v: string) => void;
  grade: boolean;
  aoGrade: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--linha)] pb-4">
      <p className="t-rotulo text-texto-suave">{contagem}</p>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 t-rotulo text-texto-suave">
          Ordem
          <select
            value={ordem}
            onChange={(e) => aoOrdenar(e.target.value)}
            className="input-classical min-h-10 rounded-full px-4 text-[0.9375rem]"
          >
            {opcoesOrdem.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <span
          className="flex gap-1 max-sm:hidden"
          role="group"
          aria-label="Modo de vista"
        >
          <Button
            tamanho="p"
            variante={grade ? 'secundario' : 'fantasma'}
            icone={PiSquaresFour}
            rotulo="Grade"
            aria-pressed={grade}
            onClick={() => aoGrade(true)}
          />
          <Button
            tamanho="p"
            variante={grade ? 'fantasma' : 'secundario'}
            icone={PiRows}
            rotulo="Lista"
            aria-pressed={!grade}
            onClick={() => aoGrade(false)}
          />
        </span>
      </div>
    </div>
  );
}

function FiltrosAtivos({
  ativos,
  aoLimpar,
}: {
  ativos: { rotulo: string; tirar: () => void }[];
  aoLimpar: () => void;
}) {
  if (!ativos.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {ativos.map((a) => (
        <span
          key={a.rotulo}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full tint-ouro pl-3 pr-1 text-[0.8125rem] text-ouro-na-tinta"
        >
          {a.rotulo}
          <button
            type="button"
            onClick={a.tirar}
            className="grid h-6 w-6 place-items-center rounded-full hover:bg-[var(--interactive-hover)]"
          >
            <Icon de={PiX} tamanho="pp" rotulo={`Tirar o filtro ${a.rotulo}`} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={aoLimpar}
        className={cx('t-rotulo text-texto-suave', linkTexto)}
      >
        Limpar tudo
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compositores
// ---------------------------------------------------------------------------

const EPOCAS = ['Todas as épocas', ...FILTROS_OBRAS.epocas.map((e) => e.nome)];

function CartaoComp({
  c,
  esboco,
  forma,
}: {
  c: ItemCompositor;
  esboco: EsbocoId;
  forma: 'grade' | 'linha';
}) {
  const href = rota(
    esboco,
    c.ficha === 'completa' ? 'compositor' : 'compositor-tipico'
  );
  const vida = c.nasc || c.morte ? `${c.nasc ?? '?'}–${c.morte ?? ''}` : null;
  const detalhe = [vida, c.pais].filter(Boolean).join(' · ') || c.epoca;
  if (forma === 'linha') {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={href}
          className="group flex min-w-0 flex-1 items-center gap-4 py-3"
        >
          <Retrato
            nome={c.nomeCompleto}
            src={c.retrato}
            sizes="56px"
            className="h-14 w-14 shrink-0 rounded-full"
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1.5 truncate font-display text-[1.25rem] group-hover:text-ouro-texto">
              {c.nomeCompleto}
              {c.verificado && (
                <SeloVerificada className="h-4 w-4 shrink-0 text-verificado" />
              )}
            </span>
            <span className="t-rotulo truncate text-texto-suave">
              {detalhe}
            </span>
          </span>
          <span className="t-rotulo text-texto-suave max-md:hidden">
            {c.epoca}
          </span>
          <span className="t-dado w-20 text-right text-[0.8125rem] text-texto-fraco max-sm:hidden">
            {formatar(c.obras)} obras
          </span>
        </Link>
        <Coracao rotulo={c.nome} />
      </div>
    );
  }
  return (
    <div className="relative">
      <Coracao
        rotulo={c.nome}
        sobre
        className="absolute right-2 top-2 z-elevado"
      />
      <Link
        href={href}
        data-vira={`compositor-${c.id}`}
        className="group flex flex-col gap-3"
      >
        <Retrato
          nome={c.nomeCompleto}
          src={c.retrato}
          sizes="(max-width: 1024px) 33vw, 20vw"
          className="aspect-[4/5] w-full rounded-card text-[2rem]"
        />
        <span className="flex flex-col">
          <span className="flex items-center gap-1.5 font-display text-[1.25rem] leading-tight group-hover:text-ouro-texto">
            <span className="truncate">{c.nome}</span>
            {c.verificado && (
              <SeloVerificada className="h-4 w-4 shrink-0 text-verificado" />
            )}
          </span>
          <span className="t-rotulo truncate text-texto-suave">{detalhe}</span>
          <span className="t-dado text-[0.75rem] text-texto-fraco">
            {formatar(c.obras)} obras
          </span>
        </span>
      </Link>
    </div>
  );
}

export function CompositoresFinal({ esboco }: { esboco: EsbocoId }) {
  const [epoca, setEpoca] = useState(EPOCAS[0]);
  const [pais, setPais] = useState('Todos os países');
  const [para, setPara] = useState('Qualquer instrumento');
  const [ordem, setOrdem] = useState('Mais procurados');
  const [grade, setGrade] = useState(true);
  const [mais, setMais] = useState(false);
  const [soRetrato, setSoRetrato] = useState(false);
  const [soBio, setSoBio] = useState(false);
  const ativos = [
    epoca !== EPOCAS[0] && { rotulo: epoca, tirar: () => setEpoca(EPOCAS[0]) },
    pais !== 'Todos os países' && {
      rotulo: pais,
      tirar: () => setPais('Todos os países'),
    },
    para !== 'Qualquer instrumento' && {
      rotulo: `Para ${para.toLowerCase()}`,
      tirar: () => setPara('Qualquer instrumento'),
    },
    soRetrato && { rotulo: 'Com retrato', tirar: () => setSoRetrato(false) },
    soBio && { rotulo: 'Com biografia', tirar: () => setSoBio(false) },
  ].filter(Boolean) as { rotulo: string; tirar: () => void }[];
  const lista = LISTA_COMPOSITORES.filter(
    (c) =>
      (epoca === EPOCAS[0] || c.epoca === epoca) &&
      (pais === 'Todos os países' || c.pais === pais) &&
      (!soRetrato || c.retrato)
  );
  const limpar = () => {
    setEpoca(EPOCAS[0]);
    setPais('Todos os países');
    setPara('Qualquer instrumento');
    setSoRetrato(false);
    setSoBio(false);
  };

  return (
    <div className="section-wrap flex flex-col gap-8 py-12">
      <Cabeca
        titulo="Compositores"
        frase={`${formatar(TOTAIS.compositores)} compositores, da Idade Média a hoje. Procure pelo nome — apelidos e transliterações também valem.`}
      />
      <CampoDeBusca
        id="busca-compositores-final"
        placeholder="Nome, apelido ou transliteração (W. A. Mozart, Tchaikovsky…)"
        grande
      />
      <div className="flex flex-wrap items-center gap-2">
        <Seletor
          rotulo="Época"
          valor={epoca}
          opcoes={EPOCAS}
          aoMudar={setEpoca}
        />
        <Seletor
          rotulo="País"
          valor={pais}
          opcoes={['Todos os países', ...PAISES_FILTRO]}
          aoMudar={setPais}
        />
        <Seletor
          rotulo="Compôs para"
          valor={para}
          opcoes={[
            'Qualquer instrumento',
            ...FILTROS_OBRAS.instrumentos.map((i) => i.nome),
          ]}
          aoMudar={setPara}
        />
        <Button
          tamanho="p"
          icone={PiFunnelSimple}
          onClick={() => setMais(true)}
        >
          Mais filtros
        </Button>
      </div>
      <FiltrosAtivos ativos={ativos} aoLimpar={limpar} />
      <BarraDeResultado
        contagem={
          <>
            <span className="t-dado text-texto">
              {formatar(ativos.length ? 10365 : TOTAIS.compositores)}
            </span>{' '}
            compositores
          </>
        }
        ordem={ordem}
        opcoesOrdem={[
          'Mais procurados',
          'A–Z',
          'Z–A',
          'Nascimento (mais antigos)',
          'Nascimento (mais recentes)',
          'Mais obras no acervo',
        ]}
        aoOrdenar={setOrdem}
        grade={grade}
        aoGrade={setGrade}
      />
      {/* No telefone, sempre a linha (esboço C). */}
      <ul className="flex flex-col divide-y divide-[var(--linha)] sm:hidden">
        {lista.map((c) => (
          <li key={c.id}>
            <CartaoComp c={c} esboco={esboco} forma="linha" />
          </li>
        ))}
      </ul>
      {grade ? (
        <ul className="grid grid-cols-3 gap-x-5 gap-y-10 max-sm:hidden lg:grid-cols-5">
          {lista.map((c) => (
            <li key={c.id}>
              <CartaoComp c={c} esboco={esboco} forma="grade" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--linha)] max-sm:hidden">
          {lista.map((c) => (
            <li key={c.id}>
              <CartaoComp c={c} esboco={esboco} forma="linha" />
            </li>
          ))}
        </ul>
      )}
      <Paginacao total={TOTAIS.compositores} />
      <Sheet
        aberto={mais}
        aoFechar={() => setMais(false)}
        titulo="Filtros"
        largura="m"
        rodape={
          <div className="flex justify-between">
            <Button variante="fantasma" onClick={limpar}>
              Limpar
            </Button>
            <Button variante="primario" onClick={() => setMais(false)}>
              Ver os compositores
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">Época</legend>
            <div className="flex flex-wrap gap-2">
              {EPOCAS.map((e) => (
                <Ficha key={e} ativa={epoca === e} onClick={() => setEpoca(e)}>
                  {e}
                </Ficha>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">País</legend>
            <div className="flex flex-wrap gap-2">
              {['Todos os países', ...PAISES_FILTRO].map((p) => (
                <Ficha key={p} ativa={pais === p} onClick={() => setPais(p)}>
                  {p}
                </Ficha>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">Só com</legend>
            <label className="flex min-h-10 items-center gap-3 t-rotulo">
              <input
                type="checkbox"
                checked={soRetrato}
                onChange={(e) => setSoRetrato(e.target.checked)}
                className="h-4 w-4 accent-[var(--ouro)]"
              />
              Retrato
            </label>
            <label className="flex min-h-10 items-center gap-3 t-rotulo">
              <input
                type="checkbox"
                checked={soBio}
                onChange={(e) => setSoBio(e.target.checked)}
                className="h-4 w-4 accent-[var(--ouro)]"
              />
              Biografia
            </label>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">Nasceu entre</legend>
            <div className="grid grid-cols-2 gap-2">
              <input
                inputMode="numeric"
                aria-label="Ano inicial"
                placeholder="1600"
                className="input-classical min-h-[var(--alvo)] rounded-controle px-4"
              />
              <input
                inputMode="numeric"
                aria-label="Ano final"
                placeholder="1900"
                className="input-classical min-h-[var(--alvo)] rounded-controle px-4"
              />
            </div>
          </fieldset>
        </div>
      </Sheet>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Obras
// ---------------------------------------------------------------------------

const ICONE_MIDIA = {
  spotify: PiSpotifyLogo,
  youtube: PiYoutubeLogo,
  audio: PiWaveform,
} as const;

function LinhaObraF({ o, esboco }: { o: ItemObra; esboco: EsbocoId }) {
  const situacao = o.partituras
    ? `${o.partituras} partituras`
    : 'Partituras no IMSLP';
  return (
    <div className="flex items-center gap-2">
      <Link
        href={rota(esboco, o.ficha === 'completa' ? 'obra' : 'obra-tipica')}
        data-vira={`obra-${o.id}`}
        className="group grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-center gap-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
      >
        <Retrato
          nome={o.compositor}
          src={
            retratoDe(o.compositor) ??
            LISTA_COMPOSITORES.find((c) => c.nome === o.compositor)?.retrato
          }
          sizes="48px"
          className="h-12 w-12 rounded-full"
        />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="font-display text-[1.3125rem] group-hover:text-ouro-texto sm:truncate">
            {o.titulo}
            {o.catalogo && (
              <span className="text-texto-suave">, {o.catalogo}</span>
            )}
          </span>
          <span className="t-rotulo truncate text-texto-suave">
            {[o.compositor, o.instrumentacao, o.ano]
              .filter(Boolean)
              .join(' · ')}
          </span>
          <span className="flex items-center gap-2 t-legenda sm:hidden">
            {situacao}
            {o.midia?.map((m) => (
              <Icon key={m} de={ICONE_MIDIA[m]} tamanho="pp" rotulo={m} />
            ))}
          </span>
        </span>
        <span className="flex flex-col items-end gap-1 max-sm:hidden">
          <span className="t-rotulo whitespace-nowrap text-texto-suave">
            {situacao}
          </span>
          {o.midia?.length ? (
            <span className="flex gap-1.5 text-texto-fraco">
              {o.midia.map((m) => (
                <Icon key={m} de={ICONE_MIDIA[m]} tamanho="pp" rotulo={m} />
              ))}
            </span>
          ) : null}
        </span>
      </Link>
      <Coracao rotulo={o.titulo} />
    </div>
  );
}

function CartaoObraF({ o, esboco }: { o: ItemObra; esboco: EsbocoId }) {
  return (
    <div className="relative h-full">
      <Coracao rotulo={o.titulo} className="absolute right-2 top-2 z-elevado" />
      <Link
        href={rota(esboco, o.ficha === 'completa' ? 'obra' : 'obra-tipica')}
        className="group flex h-full flex-col gap-2 rounded-card bg-sup-2 p-5 pr-12"
      >
        <span className="font-display text-[1.3125rem] leading-snug group-hover:text-ouro-texto">
          {o.titulo}
          {o.catalogo ? `, ${o.catalogo}` : ''}
        </span>
        <span className="t-rotulo text-texto-suave">
          {o.compositor} · {o.instrumentacao}
        </span>
        <span className="t-legenda mt-auto">
          {o.partituras ? `${o.partituras} partituras` : 'Partituras no IMSLP'}
          {o.ano ? ` · ${o.ano}` : ''}
        </span>
      </Link>
    </div>
  );
}

export function ObrasFinal({ esboco }: { esboco: EsbocoId }) {
  const [instrumento, setInstrumento] = useState('Piano');
  const [epoca, setEpoca] = useState('Romântico');
  const [genero, setGenero] = useState('Todos os gêneros');
  const [compositor, setCompositor] = useState('Qualquer compositor');
  const [ordem, setOrdem] = useState('Relevância');
  const [grade, setGrade] = useState(false);
  const [mais, setMais] = useState(false);
  const [tem, setTem] = useState<string[]>([]);
  const alternar = (v: string) =>
    setTem((l) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]));
  const ativos = [
    instrumento !== 'Qualquer instrumento' && {
      rotulo: instrumento,
      tirar: () => setInstrumento('Qualquer instrumento'),
    },
    epoca !== 'Todas as épocas' && {
      rotulo: epoca,
      tirar: () => setEpoca('Todas as épocas'),
    },
    genero !== 'Todos os gêneros' && {
      rotulo: genero,
      tirar: () => setGenero('Todos os gêneros'),
    },
    compositor !== 'Qualquer compositor' && {
      rotulo: compositor,
      tirar: () => setCompositor('Qualquer compositor'),
    },
    ...tem.map((t) => ({ rotulo: t, tirar: () => alternar(t) })),
  ].filter(Boolean) as { rotulo: string; tirar: () => void }[];
  const limpar = () => {
    setInstrumento('Qualquer instrumento');
    setEpoca('Todas as épocas');
    setGenero('Todos os gêneros');
    setCompositor('Qualquer compositor');
    setTem([]);
  };

  return (
    <div className="section-wrap flex flex-col gap-8 py-12">
      <Cabeca
        titulo="Obras"
        frase={`${formatar(TOTAIS.obras)} obras, com as partituras de domínio público para baixar de graça. Comece pelo instrumento que você toca.`}
      />
      <CampoDeBusca
        id="busca-obras-final"
        placeholder="Título, opus ou compositor (Sonata ao luar, BWV 846, Chopin…)"
        grande
      />
      <div className="flex flex-wrap items-center gap-2">
        <Seletor
          rotulo="Instrumento"
          valor={instrumento}
          opcoes={[
            'Qualquer instrumento',
            ...FILTROS_OBRAS.instrumentos.map((i) => i.nome),
          ]}
          aoMudar={setInstrumento}
        />
        <Seletor
          rotulo="Época"
          valor={epoca}
          opcoes={[
            'Todas as épocas',
            ...FILTROS_OBRAS.epocas.map((e) => e.nome),
          ]}
          aoMudar={setEpoca}
        />
        <Seletor
          rotulo="Gênero"
          valor={genero}
          opcoes={['Todos os gêneros', ...FILTROS_OBRAS.generos]}
          aoMudar={setGenero}
        />
        <Seletor
          rotulo="Compositor"
          valor={compositor}
          opcoes={[
            'Qualquer compositor',
            'Chopin',
            'Bach',
            'Beethoven',
            'Mozart',
            'Baillot',
          ]}
          aoMudar={setCompositor}
        />
        <Button
          tamanho="p"
          icone={PiFunnelSimple}
          onClick={() => setMais(true)}
        >
          Mais filtros{tem.length ? ` · ${tem.length}` : ''}
        </Button>
      </div>
      <FiltrosAtivos ativos={ativos} aoLimpar={limpar} />
      <BarraDeResultado
        contagem={
          <>
            <span className="t-dado text-texto">
              {formatar(ativos.length ? 61204 : TOTAIS.obras)}
            </span>{' '}
            obras{ativos.length ? ' com esses filtros' : ''}
          </>
        }
        ordem={ordem}
        opcoesOrdem={[
          'Relevância',
          'Mais estudadas',
          'A–Z',
          'Ano de composição',
          'Mais partituras',
          'Adicionadas há pouco',
        ]}
        aoOrdenar={setOrdem}
        grade={grade}
        aoGrade={setGrade}
      />
      <ul className="flex flex-col divide-y divide-[var(--linha)] sm:hidden">
        {LISTA_OBRAS.map((o) => (
          <li key={o.id}>
            <LinhaObraF o={o} esboco={esboco} />
          </li>
        ))}
      </ul>
      {grade ? (
        <ul className="grid grid-cols-2 gap-3 max-sm:hidden lg:grid-cols-3">
          {LISTA_OBRAS.map((o) => (
            <li key={o.id}>
              <CartaoObraF o={o} esboco={esboco} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--linha)] max-sm:hidden">
          {LISTA_OBRAS.map((o) => (
            <li key={o.id}>
              <LinhaObraF o={o} esboco={esboco} />
            </li>
          ))}
        </ul>
      )}
      <Paginacao total={61204} />
      <Sheet
        aberto={mais}
        aoFechar={() => setMais(false)}
        titulo="Mais filtros"
        largura="m"
        rodape={
          <div className="flex justify-between">
            <Button variante="fantasma" onClick={limpar}>
              Limpar
            </Button>
            <Button variante="primario" onClick={() => setMais(false)}>
              Ver as obras
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">Formação</legend>
            <div className="flex flex-wrap gap-2">
              {FILTROS_OBRAS.categorias.map((c) => (
                <Ficha key={c}>{c}</Ficha>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">Tipo</legend>
            <div className="flex flex-wrap gap-2">
              {['Obra individual', 'Coleção (opus)', 'Movimento'].map((c) => (
                <Ficha key={c}>{c}</Ficha>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">Nível (estimado)</legend>
            <div className="flex flex-wrap gap-2">
              {['Iniciante', 'Intermediário', 'Avançado'].map((c) => (
                <Ficha key={c}>{c}</Ficha>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">Tem</legend>
            {[
              'Partitura guardada',
              'Gravação ou vídeo',
              'Videoaula',
              'Ano de composição',
              'Anotações',
            ].map((t) => (
              <label
                key={t}
                className="flex min-h-10 items-center gap-3 t-rotulo"
              >
                <input
                  type="checkbox"
                  checked={tem.includes(t)}
                  onChange={() => alternar(t)}
                  className="h-4 w-4 accent-[var(--ouro)]"
                />
                {t}
              </label>
            ))}
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">Composta entre</legend>
            <div className="grid grid-cols-2 gap-2">
              <input
                inputMode="numeric"
                aria-label="Ano inicial"
                placeholder="1700"
                className="input-classical min-h-[var(--alvo)] rounded-controle px-4"
              />
              <input
                inputMode="numeric"
                aria-label="Ano final"
                placeholder="1850"
                className="input-classical min-h-[var(--alvo)] rounded-controle px-4"
              />
            </div>
          </fieldset>
        </div>
      </Sheet>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Busca
// ---------------------------------------------------------------------------

export function BuscaFinal({ esboco }: { esboco: EsbocoId }) {
  const b = BUSCA_EXEMPLO;
  const [aba, setAba] = useState('Tudo');
  const contagens: Record<string, number> = {
    Tudo: 618,
    Obras: 612,
    Compositores: 1,
    Partituras: 2140,
    Artigos: 1,
    Coleções: 2,
  };
  return (
    <div className="section-wrap flex flex-col gap-10 py-12">
      <div className="flex max-w-3xl flex-col gap-5">
        <CampoDeBusca
          id="busca-final"
          placeholder="Buscar no Opus Atlas"
          valor={b.termo}
          grande
        />
        <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-tight">
          Resultados para <span className="text-ouro-texto">“{b.termo}”</span>
        </h1>
        <p className="t-rotulo -mt-3 text-texto-suave">
          {formatar(contagens.Tudo)} resultados · também procuramos “nocturne” e
          “notturno”
        </p>
      </div>
      <Abas rotulo="Tipo de resultado">
        {Object.entries(contagens).map(([k, n]) => (
          <Aba key={k} ativa={aba === k} onClick={() => setAba(k)}>
            {k} · {formatar(n)}
          </Aba>
        ))}
      </Abas>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
        <section className="flex flex-col gap-2">
          <h2 className="t-subtitulo">Obras</h2>
          <ul className="flex flex-col divide-y divide-[var(--linha)]">
            {b.obras.map((o) => (
              <li key={o.titulo} className="flex items-center gap-2">
                <Link
                  href={rota(esboco, 'obra')}
                  className="group flex min-w-0 flex-1 items-center gap-4 py-4"
                >
                  <Retrato
                    nome={o.compositor}
                    src={retratoDe(o.compositor)}
                    sizes="48px"
                    className="h-12 w-12 shrink-0 rounded-full"
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-display text-[1.25rem] group-hover:text-ouro-texto">
                      {o.titulo}
                    </span>
                    <span className="t-rotulo text-texto-suave">
                      {o.compositor} · {o.partituras} partituras
                    </span>
                  </span>
                </Link>
                <Coracao rotulo={o.titulo} />
              </li>
            ))}
          </ul>
          <Button variante="texto" className="self-start">
            Ver as 612 obras
          </Button>
        </section>
        <aside className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="t-legenda">Compositor</h2>
            {b.compositores.map((c) => (
              <div
                key={c.nome}
                className="flex items-center gap-2 rounded-card bg-sup-2 p-4"
              >
                <Link
                  href={rota(esboco, 'compositor-tipico')}
                  className="group flex min-w-0 flex-1 items-center gap-3"
                >
                  <Retrato
                    nome={c.nome}
                    sizes="48px"
                    className="h-12 w-12 rounded-full"
                  />
                  <span className="flex flex-col">
                    <span className="font-display text-[1.25rem] group-hover:text-ouro-texto">
                      {c.nome}
                    </span>
                    <span className="t-rotulo text-texto-suave">
                      {c.detalhe}
                    </span>
                  </span>
                </Link>
                <Coracao rotulo={c.nome} />
              </div>
            ))}
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="t-legenda">Gênero</h2>
            {b.generos.map((g) => (
              <Link
                key={g}
                href={rota(esboco, 'obras')}
                className={cx('t-corpo', linkTexto)}
              >
                {g}
              </Link>
            ))}
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="t-legenda">Coleções</h2>
            <Link
              href={rota(esboco, 'colecao')}
              className={cx('font-display text-[1.125rem]', linkTexto)}
            >
              A noite no piano
            </Link>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="t-legenda">No blog</h2>
            {b.artigos.map((a) => (
              <Link
                key={a.titulo}
                href={rota(esboco, 'inicio')}
                className={cx(
                  'font-display text-[1.125rem] leading-snug',
                  linkTexto
                )}
              >
                {a.titulo}
              </Link>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}
