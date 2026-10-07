'use client';

import { useMemo, useState } from 'react';
import {
  PiCheckCircle,
  PiFlag,
  PiGlobeSimple,
  PiLockSimple,
  PiNotePencil,
  PiPencilSimple,
  PiThumbsDown,
  PiThumbsUp,
  PiTrash,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/Button';
import { CampoDeFichas } from '@/app/components/ui/CampoDeFichas';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import {
  ALCANCES,
  ANOTACOES_NOTURNO,
  CATEGORIAS_ANOTACAO,
  type AnotacaoRica,
  type CategoriaAnotacao,
} from './final-dados';
import { Ficha, linkTexto, useEsboco } from './pecas';

/**
 * Anotações de obra (`WorkAnnotation`): não é um campo de texto — é uma nota
 * de margem com lugar (compassos, movimento, página), tipo, nível e quem
 * escreveu. A lista filtra e ordena; cada nota recebe "útil"; a sua pode ser
 * editada; qualquer uma pode ser denunciada.
 */

const rotuloCategoria = (c: CategoriaAnotacao) =>
  CATEGORIAS_ANOTACAO.find((x) => x.id === c)?.rotulo ?? c;

function onde(a: AnotacaoRica) {
  const partes: string[] = [];
  if (a.alcance === 'SPECIFIC_MEASURE' && a.compassos)
    partes.push(
      a.compassos[0] === a.compassos[1]
        ? `Compasso ${a.compassos[0]}`
        : `Compassos ${a.compassos[0]}–${a.compassos[1]}`
    );
  if (a.alcance === 'ENTIRE_WORK') partes.push('Obra inteira');
  if (a.secao) partes.push(a.secao);
  if (a.movimento) partes.push(a.movimento);
  if (a.pagina) partes.push(`pág. ${a.pagina}`);
  if (a.mao) partes.push(a.mao === 'ambas' ? 'duas mãos' : `mão ${a.mao}`);
  return partes.join(' · ');
}

export function CartaoAnotacao({ a }: { a: AnotacaoRica }) {
  const { logado, abrirEntrar } = useEsboco();
  const [voto, setVoto] = useState<'util' | 'nao' | null>(null);
  const [aberta, setAberta] = useState(false);
  const longa = a.texto.length > 180;
  const votar = (v: 'util' | 'nao') =>
    logado ? setVoto(voto === v ? null : v) : abrirEntrar();

  return (
    <li className="flex flex-col gap-3 rounded-card bg-sup-2 p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex min-h-6 items-center rounded-full bg-[var(--fundo)] px-2.5 text-[0.75rem] text-texto-suave">
          {rotuloCategoria(a.categoria)}
        </span>
        <span className="t-legenda">{onde(a)}</span>
        <span className="t-legenda ml-auto">{a.nivel}</span>
      </div>
      <h3 className="font-display text-[1.3125rem] leading-snug">{a.titulo}</h3>
      <p className="t-rotulo text-texto-suave">
        {longa && !aberta ? `${a.texto.slice(0, 180)}…` : a.texto}{' '}
        {longa && (
          <button
            type="button"
            onClick={() => setAberta(!aberta)}
            className={cx('text-ouro-texto', linkTexto)}
          >
            {aberta ? 'ver menos' : 'ver mais'}
          </button>
        )}
      </p>
      {a.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {a.tags.map((t) => (
            <span key={t} className="t-dado text-[0.75rem] text-texto-fraco">
              #{t}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--linha)] pt-3">
        <span className="flex min-w-0 items-center gap-2 t-rotulo">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--fundo)] font-display text-ouro-texto">
            {a.autor.nome[0]}
          </span>
          <span className="truncate">{a.minha ? 'Você' : a.autor.nome}</span>
          <span className="text-texto-fraco">· {a.autor.papel}</span>
          {a.autor.verificado && (
            <Icon
              de={PiCheckCircle}
              tamanho="pp"
              rotulo="Autor verificado"
              className="text-verificado"
            />
          )}
          <span className="text-texto-fraco">· {a.quando}</span>
          {!a.publica && (
            <Icon
              de={PiLockSimple}
              tamanho="pp"
              rotulo="Só você vê"
              className="text-texto-fraco"
            />
          )}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-pressed={voto === 'util'}
            onClick={() => votar('util')}
            className={cx(
              'inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[0.8125rem]',
              voto === 'util'
                ? 'tint-ouro text-ouro-na-tinta'
                : 'text-texto-suave hover:bg-[var(--fundo)]'
            )}
          >
            <Icon de={PiThumbsUp} tamanho="p" /> Útil ·{' '}
            {a.uteis + (voto === 'util' ? 1 : 0)}
          </button>
          <button
            type="button"
            aria-pressed={voto === 'nao'}
            onClick={() => votar('nao')}
            aria-label="Não foi útil"
            className={cx(
              'grid h-9 w-9 place-items-center rounded-full',
              voto === 'nao'
                ? 'text-texto'
                : 'text-texto-fraco hover:bg-[var(--fundo)]'
            )}
          >
            <Icon de={PiThumbsDown} tamanho="p" />
          </button>
          {a.minha ? (
            <>
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiPencilSimple}
                rotulo="Editar sua anotação"
              />
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiTrash}
                rotulo="Apagar sua anotação"
              />
            </>
          ) : (
            <Button
              tamanho="p"
              variante="fantasma"
              icone={PiFlag}
              rotulo="Denunciar anotação"
              onClick={() =>
                logado ? toast('Abre a denúncia') : abrirEntrar()
              }
            />
          )}
        </span>
      </div>
    </li>
  );
}

function FolhaDeAnotacao({
  aberta,
  aoFechar,
  movimentos,
}: {
  aberta: boolean;
  aoFechar: () => void;
  movimentos: string[];
}) {
  const [categoria, setCategoria] = useState<CategoriaAnotacao>('TECHNIQUE');
  const [alcance, setAlcance] =
    useState<(typeof ALCANCES)[number]['id']>('SPECIFIC_MEASURE');
  const [mao, setMao] = useState('direita');
  const [tags, setTags] = useState<string[]>([]);
  const [publica, setPublica] = useState(true);
  const campo =
    'input-classical min-h-[var(--alvo)] w-full rounded-controle px-4 text-base';

  return (
    <Sheet
      aberto={aberta}
      aoFechar={aoFechar}
      titulo="Nova anotação"
      descricao="Uma nota de margem: onde, o quê e para quem."
      largura="g"
      rodape={
        <div className="flex items-center justify-between gap-3">
          <label className="flex min-h-10 items-center gap-2 t-rotulo">
            <input
              type="checkbox"
              checked={publica}
              onChange={(e) => setPublica(e.target.checked)}
              className="h-4 w-4 accent-[var(--ouro)]"
            />
            <Icon de={publica ? PiGlobeSimple : PiLockSimple} tamanho="p" />
            {publica ? 'Pública' : 'Só você vê'}
          </label>
          <div className="flex gap-2">
            <Button variante="fantasma" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button
              variante="primario"
              onClick={() => {
                aoFechar();
                toast.success(
                  publica ? 'Anotação publicada' : 'Anotação guardada'
                );
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="t-rotulo">Título</span>
            <input
              className={campo}
              placeholder="Ex.: Dedilhado da fioritura do compasso 16"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="t-rotulo">Anotação</span>
            <textarea
              rows={6}
              className={cx(campo, 'py-3')}
              placeholder="O que você descobriu, e como chegou nisso."
            />
          </label>
          <CampoDeFichas
            rotulo="Tags"
            valores={tags}
            aoMudar={setTags}
            placeholder="pedal, rubato…"
            ajuda="Enter ou vírgula para acrescentar."
          />
        </div>
        <div className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">Tipo</legend>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIAS_ANOTACAO.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={categoria === c.id}
                  onClick={() => setCategoria(c.id)}
                  className={cx(
                    'flex flex-col items-start gap-0.5 rounded-controle p-3 text-left',
                    categoria === c.id
                      ? 'tint-ouro'
                      : 'bg-sup-2 hover:bg-[var(--interactive-hover)]'
                  )}
                >
                  <span
                    className={cx(
                      'text-[0.875rem] font-medium',
                      categoria === c.id && 'text-ouro-na-tinta'
                    )}
                  >
                    {c.rotulo}
                  </span>
                  <span className="t-legenda line-clamp-1">{c.detalhe}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">Onde</legend>
            <div className="flex flex-wrap gap-2">
              {ALCANCES.map((x) => (
                <Ficha
                  key={x.id}
                  ativa={alcance === x.id}
                  onClick={() => setAlcance(x.id)}
                >
                  {x.rotulo}
                </Ficha>
              ))}
            </div>
            {alcance === 'SPECIFIC_MEASURE' && (
              <div className="grid grid-cols-3 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="t-legenda">Do compasso</span>
                  <input inputMode="numeric" className={campo} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="t-legenda">Até</span>
                  <input inputMode="numeric" className={campo} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="t-legenda">Página</span>
                  <input inputMode="numeric" className={campo} />
                </label>
              </div>
            )}
            {alcance !== 'ENTIRE_WORK' && movimentos.length > 0 && (
              <label className="flex flex-col gap-1">
                <span className="t-legenda">Movimento</span>
                <select className={campo}>
                  {movimentos.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
            )}
            {alcance === 'SECTION' && (
              <label className="flex flex-col gap-1">
                <span className="t-legenda">Seção</span>
                <input className={campo} placeholder="Exposição, coda…" />
              </label>
            )}
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">Mão</legend>
            <div className="flex flex-wrap gap-2">
              {['esquerda', 'direita', 'ambas', 'não se aplica'].map((m) => (
                <Ficha key={m} ativa={mao === m} onClick={() => setMao(m)}>
                  {m}
                </Ficha>
              ))}
            </div>
          </fieldset>
          <label className="flex flex-col gap-1">
            <span className="t-rotulo">Para que nível</span>
            <select className={campo}>
              {[
                'Todos os níveis',
                'Iniciante',
                'Intermediário',
                'Avançado',
              ].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </Sheet>
  );
}

export function AnotacoesFinal({
  movimentos,
  vazia = false,
}: {
  movimentos: string[];
  vazia?: boolean;
}) {
  const { logado, abrirEntrar } = useEsboco();
  const [categoria, setCategoria] = useState<CategoriaAnotacao | 'todas'>(
    'todas'
  );
  const [alcance, setAlcance] = useState('todos');
  const [ordem, setOrdem] = useState('Mais úteis');
  const [nova, setNova] = useState(false);

  const base = vazia ? [] : ANOTACOES_NOTURNO;
  const lista = useMemo(() => {
    let l = base.filter(
      (a) =>
        (categoria === 'todas' || a.categoria === categoria) &&
        (alcance === 'todos' || a.alcance === alcance)
    );
    if (ordem === 'Mais úteis') l = [...l].sort((a, b) => b.uteis - a.uteis);
    return l;
  }, [base, categoria, alcance, ordem]);

  const contagem = (c: CategoriaAnotacao) =>
    base.filter((a) => a.categoria === c).length;
  const selecao = 'input-classical min-h-10 rounded-full px-4 text-[0.9375rem]';

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="t-titulo">Anotações de quem toca</h2>
          <span className="t-rotulo text-texto-suave">
            {base.length
              ? `${base.length} anotações públicas · dedilhados, interpretação, contexto`
              : 'Nenhuma ainda'}
          </span>
        </div>
        <Button
          variante="primario"
          icone={PiNotePencil}
          onClick={() => (logado ? setNova(true) : abrirEntrar())}
        >
          Escrever uma anotação
        </Button>
      </div>
      <div className="faixa-rola -mx-4 flex gap-2 overflow-x-auto px-4">
        <Ficha
          ativa={categoria === 'todas'}
          onClick={() => setCategoria('todas')}
        >
          Todas
        </Ficha>
        {CATEGORIAS_ANOTACAO.filter((c) => contagem(c.id)).map((c) => (
          <Ficha
            key={c.id}
            ativa={categoria === c.id}
            onClick={() => setCategoria(c.id)}
          >
            {c.rotulo} · {contagem(c.id)}
          </Ficha>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 t-rotulo text-texto-suave">
          Onde
          <select
            value={alcance}
            onChange={(e) => setAlcance(e.target.value)}
            className={selecao}
          >
            <option value="todos">Qualquer lugar</option>
            {ALCANCES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 t-rotulo text-texto-suave">
          Ordem
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            className={selecao}
          >
            {['Mais úteis', 'Mais recentes', 'Por compasso'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      </div>
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {lista.map((a) => (
          <CartaoAnotacao key={a.id} a={a} />
        ))}
      </ul>
      {!lista.length && (
        <p className="t-rotulo text-texto-suave">
          {base.length
            ? 'Nenhuma anotação com esses filtros.'
            : 'Ninguém anotou esta obra ainda. Um dedilhado, uma armadilha, um conselho — a primeira anotação vale XP.'}
        </p>
      )}
      <FolhaDeAnotacao
        aberta={nova}
        aoFechar={() => setNova(false)}
        movimentos={movimentos}
      />
    </section>
  );
}
