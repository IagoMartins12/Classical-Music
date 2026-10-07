'use client';

import { useEffect, useMemo, useState } from 'react';
import { PiCaretDown, PiMagnifyingGlass, PiX } from 'react-icons/pi';
import LocalizedLink from '@/app/components/LocalizedLink';
import type { Central } from '@/app/conteudo/ajuda/tipos';
import type { Bloco, Idioma } from '@/app/conteudo/legal/tipos';
import { CONTATO, mailto } from '@/app/utils/contato';
import { Blocos } from './Blocos';
import { cx } from './cx';

/**
 * As três páginas de ajuda — Central de Ajuda, Perguntas frequentes e Suporte
 * — com um vocabulário só: busca, grupos com índice, itens que abrem no lugar
 * e o contato no fim. Cada item tem endereço próprio (`/faq#cancelar`), e o
 * endereço abre o item.
 *
 * Antes, eram três páginas de cards iguais (ícone, título, texto) que abriam
 * modais — e a ajuda e o suporte repetiam as mesmas categorias.
 */
export type QualCentral = 'help' | 'faq' | 'support';

const ROTULOS = {
  pt: {
    paginas: 'Ajuda',
    aba: {
      help: 'Como usar',
      faq: 'Perguntas frequentes',
      support: 'Suporte',
    } as Record<QualCentral, string>,
    buscar: {
      help: 'Buscar na ajuda',
      faq: 'Buscar nas perguntas',
      support: 'Descreva o problema',
    } as Record<QualCentral, string>,
    limpar: 'Limpar busca',
    grupos: 'Assuntos',
    nada: (b: string) => `Nada encontrado para “${b}”.`,
    nadaAjuda: 'Tente outras palavras ou fale com a gente.',
    resultados: (n: number) => `${n} ${n === 1 ? 'resultado' : 'resultados'}`,
    naoAchou: 'Não encontrou o que procurava?',
    escreva: 'Escreva para',
    ou: 'ou use o',
    formulario: 'formulário de contato',
  },
  en: {
    paginas: 'Help',
    aba: { help: 'How to', faq: 'FAQ', support: 'Support' } as Record<
      QualCentral,
      string
    >,
    buscar: {
      help: 'Search help',
      faq: 'Search questions',
      support: 'Describe the problem',
    } as Record<QualCentral, string>,
    limpar: 'Clear search',
    grupos: 'Topics',
    nada: (b: string) => `Nothing found for “${b}”.`,
    nadaAjuda: 'Try other words or get in touch.',
    resultados: (n: number) => `${n} ${n === 1 ? 'result' : 'results'}`,
    naoAchou: 'Did not find what you were looking for?',
    escreva: 'Write to',
    ou: 'or use the',
    formulario: 'contact form',
  },
} as const;

/** Sem acento e em minúsculas: "anotação" acha "anotacao". */
const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\*\*|\[|\]\([^)]*\)/g, '')
    .toLowerCase();

const textoDos = (blocos: Bloco[]) =>
  blocos
    .map((b) =>
      typeof b === 'string'
        ? b
        : 'lista' in b
          ? b.lista.join(' ')
          : 'nota' in b
            ? b.nota
            : [...b.tabela.cabecalho, ...b.tabela.linhas.flat()].join(' ')
    )
    .join(' ');

export function CentralDeAjuda({
  qual,
  central,
  idioma,
}: {
  qual: QualCentral;
  central: Central;
  idioma: Idioma;
}) {
  const r = ROTULOS[idioma];
  const [busca, setBusca] = useState('');
  const [abertos, setAbertos] = useState<Set<string>>(new Set());

  // O endereço com âncora (`/faq#cancelar`) abre o item e rola até ele.
  useEffect(() => {
    const abrirDoEndereco = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      if (central.grupos.some((g) => g.itens.some((i) => i.id === id))) {
        setAbertos((a) => new Set(a).add(id));
        requestAnimationFrame(() =>
          document.getElementById(id)?.scrollIntoView({ block: 'start' })
        );
      }
    };
    abrirDoEndereco();
    window.addEventListener('hashchange', abrirDoEndereco);
    return () => window.removeEventListener('hashchange', abrirDoEndereco);
  }, [central]);

  const termos = normalizar(busca.trim()).split(/\s+/).filter(Boolean);
  const grupos = useMemo(() => {
    if (!termos.length) return central.grupos;
    return central.grupos
      .map((g) => ({
        ...g,
        itens: g.itens.filter((i) => {
          const alvo = normalizar(
            `${g.titulo} ${i.titulo} ${textoDos(i.blocos)}`
          );
          return termos.every((t) => alvo.includes(t));
        }),
      }))
      .filter((g) => g.itens.length > 0);
  }, [central, busca]);
  const total = grupos.reduce((n, g) => n + g.itens.length, 0);
  const buscando = termos.length > 0;

  const alternar = (id: string, aberto: boolean) =>
    setAbertos((a) => {
      const n = new Set(a);
      if (aberto) n.add(id);
      else n.delete(id);
      return n;
    });

  return (
    <div className="section-wrap pb-20 pt-8 md:pt-12">
      <nav aria-label={r.paginas} className="mb-10 md:mb-14">
        <ul className="flex flex-wrap gap-1 sm:gap-2">
          {(['help', 'faq', 'support'] as QualCentral[]).map((q) => (
            <li key={q}>
              <LocalizedLink
                href={`/${q}`}
                aria-current={q === qual ? 'page' : undefined}
                className={cx(
                  'inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 text-[0.8125rem] font-medium sm:px-4 sm:text-sm transition-colors duration-[var(--t-toque)]',
                  q === qual
                    ? 'bg-sup-2 text-ouro-texto'
                    : 'text-texto-fraco hover:text-texto'
                )}
              >
                {r.aba[q]}
              </LocalizedLink>
            </li>
          ))}
        </ul>
      </nav>

      <header className="max-w-[var(--largura-texto)]">
        <h1 className="classical-title text-4xl leading-[1.1] text-texto md:text-[3.25rem]">
          {central.titulo}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-texto-suave">
          {central.abertura}
        </p>
      </header>

      <div
        role="search"
        className="relative mt-10 max-w-[var(--largura-texto)]"
      >
        <PiMagnifyingGlass
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-texto-fraco"
        />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={r.buscar[qual]}
          aria-label={r.buscar[qual]}
          enterKeyHint="search"
          className="input-classical w-full !pl-12 !pr-12 [&::-webkit-search-cancel-button]:hidden"
        />
        {busca && (
          <button
            type="button"
            onClick={() => setBusca('')}
            aria-label={r.limpar}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-controle text-texto-fraco hover:text-texto"
          >
            <PiX aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-texto-fraco">
        {buscando && total > 0 ? r.resultados(total) : ''}
      </p>

      <div className="mt-8 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        <aside className="hidden lg:block">
          <nav aria-label={r.grupos} className="sticky top-28">
            <p className="mb-4 text-sm font-semibold text-texto">{r.grupos}</p>
            <ul className="flex flex-col gap-1">
              {grupos.map((g) => (
                <li key={g.id}>
                  <a
                    href={`#grupo-${g.id}`}
                    className="flex items-baseline justify-between gap-3 rounded-controle py-1.5 text-sm text-texto-fraco transition-colors duration-[var(--t-toque)] hover:text-texto"
                  >
                    <span>{g.titulo}</span>
                    <span className="tabular-nums text-xs">
                      {g.itens.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 max-w-[var(--largura-texto)]">
          {total === 0 ? (
            <div className="rounded-card bg-sup-2 p-8">
              <p className="text-lg text-texto">{r.nada(busca.trim())}</p>
              <p className="mt-2 text-texto-suave">{r.nadaAjuda}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-14">
              {grupos.map((g) => (
                <section
                  key={g.id}
                  id={`grupo-${g.id}`}
                  aria-labelledby={`grupo-${g.id}-titulo`}
                  className="scroll-mt-28"
                >
                  <h2
                    id={`grupo-${g.id}-titulo`}
                    className="classical-title text-2xl text-texto md:text-[1.75rem]"
                  >
                    {g.titulo}
                  </h2>
                  <ul className="mt-5 flex flex-col divide-y divide-linha border-y border-linha">
                    {g.itens.map((i) => {
                      const aberto = buscando || abertos.has(i.id);
                      return (
                        <li key={i.id} id={i.id} className="scroll-mt-28">
                          <details
                            open={aberto}
                            onToggle={(e) =>
                              alternar(
                                i.id,
                                (e.target as HTMLDetailsElement).open
                              )
                            }
                            className="group"
                          >
                            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-[1.0625rem] font-medium text-texto transition-colors duration-[var(--t-toque)] hover:text-ouro-texto [&::-webkit-details-marker]:hidden">
                              {i.titulo}
                              <PiCaretDown
                                aria-hidden="true"
                                className="h-4 w-4 shrink-0 text-texto-fraco transition-transform duration-[var(--t-resposta)] ease-saida group-open:rotate-180"
                              />
                            </summary>
                            <div className="flex flex-col gap-4 pb-6 pr-2 text-[1.0625rem] leading-[1.75] text-texto-suave">
                              <Blocos blocos={i.blocos} />
                            </div>
                          </details>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <aside className="mt-20 rounded-card bg-sup-2 p-6 md:p-8">
            <h2 className="classical-title text-2xl text-texto">
              {r.naoAchou}
            </h2>
            <p className="mt-3 text-[1.0625rem] leading-relaxed text-texto-suave">
              {r.escreva}{' '}
              <a
                href={mailto('suporte')}
                className="font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[3px] hover:decoration-ouro"
              >
                {CONTATO.suporte}
              </a>{' '}
              {r.ou}{' '}
              <LocalizedLink
                href="/contact"
                className="font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[3px] hover:decoration-ouro"
              >
                {r.formulario}
              </LocalizedLink>
              .
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
