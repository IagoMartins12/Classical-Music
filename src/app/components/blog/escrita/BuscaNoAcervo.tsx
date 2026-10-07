'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { PiCheck, PiMagnifyingGlass, PiMusicNotes } from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Icon } from '@/app/components/ui/Icon';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { cx } from '@/app/components/ui/cx';
import { findComposers, searchWorks } from '@/app/requests/catalog-search';

/**
 * Busca de compositor ou de obra do acervo, para os diálogos do editor e o
 * "Neste artigo" da escrita.
 *
 * **Os resultados ficam no fluxo, não flutuando.** Os campos de busca do
 * site abrem uma lista `absolute`; dentro de uma folha (que rola) ela era
 * cortada pela própria folha — o diálogo do cartão de compositor mostrava
 * só o campo. Aqui a lista ocupa o espaço dela, com retrato e datas, e a
 * folha cresce para mostrá-la.
 *
 * Compositor: sem termo, os mais conhecidos. Obra: com `compositorId`, só as
 * obras dele (com ou sem termo); sem, a busca geral a partir de 2 letras.
 */

export interface ItemDoAcervo {
  id: string;
  nome: string;
  detalhe: string | null;
  retrato: string | null;
  /** Nas obras: o compositor (para o cartão e o filtro). */
  compositor?: { id: string; nome: string };
}

const ano = (data?: string | null) => data?.match(/\d{4}/)?.[0] ?? null;

export function BuscaNoAcervo({
  tipo,
  rotulo,
  compositorId,
  selecionados = [],
  aoEscolher,
  autoFocus,
  className,
}: {
  tipo: 'compositor' | 'obra';
  rotulo: string;
  compositorId?: string | null;
  /** Os ids já escolhidos aparecem marcados. */
  selecionados?: string[];
  aoEscolher: (item: ItemDoAcervo) => void;
  autoFocus?: boolean;
  className?: string;
}) {
  const id = useId();
  const [termo, setTermo] = useState('');
  const [itens, setItens] = useState<ItemDoAcervo[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState(false);
  const ultima = useRef(0);

  useEffect(() => {
    const q = termo.trim();
    const n = ++ultima.current;
    if (tipo === 'obra' && !compositorId && q.length < 2) {
      setItens(null);
      return;
    }
    setBuscando(true);
    setErro(false);
    const espera = window.setTimeout(
      async () => {
        try {
          const lista: ItemDoAcervo[] =
            tipo === 'compositor'
              ? (await findComposers(q, 8)).map((c) => ({
                  id: c.id,
                  nome: c.fullName || c.name,
                  detalhe:
                    [
                      [ano(c.birthDate), ano(c.deathDate)]
                        .filter(Boolean)
                        .join('–'),
                      c.epochName,
                    ]
                      .filter(Boolean)
                      .join(' · ') || null,
                  retrato: c.portraitUrl ?? null,
                }))
              : (
                  await searchWorks({
                    q,
                    limit: 12,
                    composerId: compositorId ?? undefined,
                  })
                ).works.map((w) => ({
                  id: w.id,
                  nome: w.title,
                  detalhe:
                    [
                      w.opOrCatalog,
                      compositorId
                        ? null
                        : w.composer.fullName || w.composer.name,
                    ]
                      .filter(Boolean)
                      .join(' · ') || null,
                  retrato: null,
                  compositor: {
                    id: w.composer.id,
                    nome: w.composer.fullName || w.composer.name,
                  },
                }));
          if (n === ultima.current) setItens(lista);
        } catch {
          if (n === ultima.current) {
            setErro(true);
            setItens([]);
          }
        } finally {
          if (n === ultima.current) setBuscando(false);
        }
      },
      q ? 280 : 0
    );
    return () => window.clearTimeout(espera);
  }, [termo, tipo, compositorId]);

  const dica =
    tipo === 'compositor'
      ? 'Nome do compositor'
      : compositorId
        ? 'Filtrar as obras dele pelo título'
        : 'Título da obra (2 letras ou mais)';

  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={`${id}-campo`} className="text-sm font-medium text-texto">
        {rotulo}
      </label>
      <div className="relative">
        <Icon
          de={PiMagnifyingGlass}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-texto-fraco"
        />
        <input
          id={`${id}-campo`}
          type="search"
          autoComplete="off"
          autoFocus={autoFocus}
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder={dica}
          aria-controls={`${id}-lista`}
          className="input-classical w-full !pl-11"
        />
      </div>

      <div id={`${id}-lista`} aria-live="polite" aria-busy={buscando}>
        {buscando && !itens?.length ? (
          <div className="flex flex-col gap-1.5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-controle" />
            ))}
          </div>
        ) : erro ? (
          <p className="t-legenda text-erro">
            Não deu para buscar agora. Tente de novo.
          </p>
        ) : itens && itens.length === 0 ? (
          <p className="t-legenda">Nada com esse nome no acervo.</p>
        ) : itens ? (
          <ul className="flex max-h-[19rem] flex-col gap-0.5 overflow-y-auto rounded-controle classical-scrollbar pr-1">
            {itens.map((item) => {
              const marcado = selecionados.includes(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => aoEscolher(item)}
                    aria-pressed={marcado}
                    className={cx(
                      'flex w-full items-center gap-3 rounded-controle p-2 pr-3 text-left transition-colors duration-[var(--t-toque)]',
                      marcado
                        ? 'bg-sup-2'
                        : 'hover:bg-[var(--interactive-hover)]'
                    )}
                  >
                    {tipo === 'compositor' ? (
                      item.retrato ? (
                        <Image
                          src={item.retrato}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 shrink-0 rounded-full bg-sup-2 object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sup-2 font-display text-lg text-texto-suave"
                        >
                          {item.nome.charAt(0)}
                        </span>
                      )
                    ) : (
                      <span
                        aria-hidden="true"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-controle bg-sup-2 text-texto-fraco"
                      >
                        <Icon de={PiMusicNotes} />
                      </span>
                    )}
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[0.9375rem] text-texto">
                        {item.nome}
                      </span>
                      {item.detalhe && (
                        <span className="t-legenda truncate">
                          {item.detalhe}
                        </span>
                      )}
                    </span>
                    {marcado && (
                      <Icon de={PiCheck} className="shrink-0 text-ouro-texto" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/** O item escolhido, no lugar da busca, com o botão de trocar. */
export function ItemEscolhido({
  rotulo,
  item,
  aoTrocar,
}: {
  rotulo: string;
  item: ItemDoAcervo;
  aoTrocar: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-texto">{rotulo}</span>
      <div className="flex items-center gap-3 rounded-controle bg-sup-2 p-2 pr-2">
        {item.retrato ? (
          <Image
            src={item.retrato}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-fundo font-display text-lg text-texto-suave"
          >
            {item.nome.charAt(0)}
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[0.9375rem] text-texto">
            {item.nome}
          </span>
          {item.detalhe && (
            <span className="t-legenda truncate">{item.detalhe}</span>
          )}
        </span>
        <button
          type="button"
          onClick={aoTrocar}
          className="min-h-9 shrink-0 rounded-controle px-3 text-sm font-medium text-ouro-texto hover:bg-[var(--interactive-hover)]"
        >
          Trocar
        </button>
      </div>
    </div>
  );
}

/**
 * Escolher uma obra: primeiro o compositor (a lista de obras fica só com as
 * dele), ou a busca geral pelo título. Escolhida, a obra aparece com
 * "Trocar".
 */
export function EscolhaDeObra({
  obra,
  aoEscolher,
}: {
  obra: ItemDoAcervo | null;
  aoEscolher: (obra: ItemDoAcervo | null) => void;
}) {
  const [compositor, setCompositor] = useState<ItemDoAcervo | null>(null);
  const [geral, setGeral] = useState(false);

  if (obra) {
    return (
      <ItemEscolhido
        rotulo="Obra"
        item={obra}
        aoTrocar={() => aoEscolher(null)}
      />
    );
  }

  if (!compositor && !geral) {
    return (
      <div className="flex flex-col gap-2">
        <BuscaNoAcervo
          tipo="compositor"
          rotulo="Compositor da obra"
          aoEscolher={setCompositor}
          autoFocus
        />
        <button
          type="button"
          onClick={() => setGeral(true)}
          className="self-start text-sm font-medium text-ouro-texto underline-offset-4 hover:underline"
        >
          Buscar a obra pelo título, sem escolher o compositor
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {compositor && (
        <ItemEscolhido
          rotulo="Compositor"
          item={compositor}
          aoTrocar={() => setCompositor(null)}
        />
      )}
      <BuscaNoAcervo
        tipo="obra"
        rotulo={compositor ? `Obras de ${compositor.nome}` : 'Obra'}
        compositorId={compositor?.id}
        aoEscolher={(o) =>
          aoEscolher(
            compositor
              ? {
                  ...o,
                  compositor: { id: compositor.id, nome: compositor.nome },
                }
              : o
          )
        }
        autoFocus
      />
      {geral && !compositor && (
        <button
          type="button"
          onClick={() => setGeral(false)}
          className="self-start text-sm font-medium text-ouro-texto underline-offset-4 hover:underline"
        >
          Escolher o compositor primeiro
        </button>
      )}
    </div>
  );
}
