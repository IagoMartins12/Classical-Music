'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PiArrowLeft, PiArrowRight, PiShareNetwork } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { formatar, rota, type EsbocoId } from './dados';
import {
  ArtigosLigados,
  BotoesDeEstudo,
  FichaTecnica,
  Multimidia,
  QuemEstuda,
  useEstudoDaObra,
} from './fichas';
import { fichaCompositor, fichaObra, type QualFicha } from './fichas-dados';
import { AnotacoesFinal } from './anotacoes-final';
import {
  ConviteParaCompletar,
  useContribuir,
  type TipoContribuicao,
} from './contribuir';
import { Coracao } from './coracao';
import {
  PartituraNaLateral,
  PartiturasFinal,
  type Alvo,
} from './partituras-final';
import { Retrato, linkTexto, useEsboco } from './pecas';

/**
 * A obra consolidada (06/10): o esqueleto do A; as partituras como o IMSLP as
 * agrupa; as anotações com o modelo inteiro. Seção sem dado some (a obra
 * típica não tem ano, gravação nem anotação). Ao clicar numa partitura, a
 * coluna ao lado da lista (a da ficha) mostra a página dela, fixa, como no
 * esboço C — com a volta para a ficha. No telefone, abre a folha.
 */
export function ObraFinal({ q, esboco }: { q: QualFicha; esboco: EsbocoId }) {
  const o = fichaObra(q);
  const c = fichaCompositor(q);
  const estudo = useEstudoDaObra(o);
  const contribuir = useContribuir('esta obra');
  const { compartilhar } = useEsboco();
  const titulo = `${o.titulo}${o.catalogo ? `, ${o.catalogo}` : ''}`;
  const subtitulo = [
    o.instrumentacao,
    o.ano,
    o.dedicatoria && `dedicada a ${o.dedicatoria}`,
  ]
    .filter(Boolean)
    .join(' · ');
  const mapa: Record<string, TipoContribuicao> = {
    'ano de composição': 'dado',
    nível: 'dado',
    gravação: 'video',
    videoaula: 'video',
  };
  const falta = o.falta.map((f) => ({ rotulo: f, tipo: mapa[f] ?? 'dado' }));
  const telaComp = q === 'completa' ? 'compositor' : 'compositor-tipico';
  const [escolhida, setEscolhida] = useState<Alvo | null>(null);

  return (
    <article className="section-wrap py-10 md:py-14">
      <nav
        aria-label="Caminho"
        className="t-rotulo mb-8 flex items-center gap-2 text-texto-fraco"
      >
        <Link
          href={rota(esboco, telaComp)}
          className={cx('flex items-center gap-2', linkTexto)}
        >
          <Retrato
            nome={o.compositor.nomeCompleto}
            src={o.compositor.retrato}
            sizes="32px"
            className="h-7 w-7 rounded-full"
          />
          {o.compositor.nomeCompleto}
        </Link>
      </nav>

      <header className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
        <div className="flex flex-col gap-5">
          <h1
            data-vira={`obra-${o.id}`}
            className="font-display text-[clamp(2.5rem,6.5vw,5.25rem)] leading-[0.98] tracking-[-0.02em]"
          >
            {o.titulo}
            {o.catalogo && (
              <span className="text-texto-suave">, {o.catalogo}</span>
            )}
          </h1>
          <p className="t-corpo max-w-[60ch] text-texto-suave">{subtitulo}</p>
        </div>
        <div className="flex flex-col gap-3">
          <BotoesDeEstudo estudo={estudo} />
          <div className="flex flex-wrap items-center gap-2">
            <Coracao rotulo={titulo} className="!h-11 !w-11 bg-sup-2" />
            <Button
              icone={PiShareNetwork}
              onClick={() =>
                compartilhar({
                  titulo: `${titulo} — ${o.compositor.nomeCompleto}`,
                  url: `https://opusatlas.com.br/works/${o.id}`,
                  imagem: o.compositor.retrato ?? undefined,
                })
              }
            >
              Compartilhar
            </Button>
          </div>
          <QuemEstuda obra={o} />
        </div>
      </header>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="t-subtitulo">Ouvir e assistir</h2>
        <Multimidia midia={o.midia} />
      </section>

      <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        {escolhida ? (
          <aside className="flex min-w-0 flex-col gap-4 max-lg:hidden lg:sticky lg:top-28 lg:self-start">
            <button
              type="button"
              onClick={() => setEscolhida(null)}
              className={cx(
                'inline-flex min-h-10 items-center gap-2 self-start t-rotulo text-texto-suave',
                linkTexto
              )}
            >
              <Icon de={PiArrowLeft} tamanho="p" /> Ver a ficha da obra
            </button>
            <PartituraNaLateral
              alvo={escolhida}
              aoEstudar={(t) => estudo.abrir('estudar', t)}
            />
          </aside>
        ) : (
          <aside className="flex min-w-0 flex-col gap-8">
            <h2 className="t-subtitulo">Ficha</h2>
            <FichaTecnica obra={o} />
            <ConviteParaCompletar
              falta={falta}
              alvo="esta obra"
              contribuir={contribuir}
            />
          </aside>
        )}
        <section className="flex min-w-0 flex-col gap-6">
          <h2 className="t-titulo">Partituras</h2>
          <PartiturasFinal
            obra={titulo}
            estado={o.imslp}
            aoEstudar={(t) => estudo.abrir('estudar', t)}
            escolhida={escolhida}
            aoEscolher={setEscolhida}
          />
        </section>
      </div>

      <div className="mt-20">
        <AnotacoesFinal
          movimentos={(o.movimentos ?? []).map(
            (m, i) => `${i + 1}. ${m.titulo}`
          )}
          vazia={q === 'tipica'}
        />
      </div>

      {o.artigos.length > 0 && (
        <section className="mt-20 flex flex-col gap-6">
          <h2 className="t-titulo">Para ler</h2>
          <ArtigosLigados artigos={o.artigos} esboco={esboco} />
        </section>
      )}

      <section className="mt-20 flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="t-titulo">Mais de {o.compositor.nome}</h2>
          <Link
            href={rota(esboco, telaComp)}
            className={cx(
              'inline-flex items-center gap-1.5 t-rotulo text-ouro-texto',
              linkTexto
            )}
          >
            Todas as {formatar(c.obras)} <Icon de={PiArrowRight} tamanho="pp" />
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {c.destaques
            .filter((d) => d.id !== o.id)
            .slice(0, 4)
            .map((d) => (
              <li key={d.id} className="relative">
                <Coracao
                  rotulo={d.titulo}
                  className="absolute right-2 top-2 z-elevado"
                />
                <Link
                  href={rota(esboco, q === 'completa' ? 'obra' : 'obra-tipica')}
                  className="group flex h-full flex-col gap-1 rounded-card bg-sup-2 p-5 pr-12"
                >
                  <span className="font-display text-[1.1875rem] leading-snug group-hover:text-ouro-texto">
                    {d.titulo}
                  </span>
                  <span className="t-rotulo text-texto-suave">{d.detalhe}</span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
      {estudo.folhas}
      {contribuir.folhas}
    </article>
  );
}
