'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PiArrowDown,
  PiArrowUp,
  PiFileText,
  PiGlobeSimple,
  PiLockSimple,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiPencilSimple,
  PiPlus,
  PiShareNetwork,
  PiStar,
  PiTrash,
  PiUser,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import { Abas, Aba } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { rota, type EsbocoId } from './dados';
import {
  COLECOES_FINAL,
  ROTULO_COLECAO,
  type ColecaoFinal,
  type ItemDeColecao,
  type TipoColecao,
} from './final-dados';
import { Coracao } from './coracao';
import { Retrato, Rostos, retratoDe, useEsboco } from './pecas';

/**
 * Coleções (modelo novo, 06/10): listas feitas por quem tem e-mail
 * confirmado. Cada coleção tem um tipo só — obras, compositores ou
 * partituras, escolhido ao criar e fixo depois —, e cada item uma nota
 * opcional. A coleção é pública ou só sua; qualquer pessoa favorita uma
 * pública; só a equipe põe uma coleção na home.
 *
 * API a criar: `Collection { kind (WORK | COMPOSER | SCORE), title,
 * description, ownerId, isPublic, featuredOnHome, favoritesCount }`,
 * `CollectionItem { collectionId, refId, note, position }` (o `kind` mora na
 * coleção; a API recusa item de outro tipo), `CollectionFavorite`.
 */

const ICONE_ITEM = {
  obra: PiMusicNotes,
  compositor: PiUser,
  partitura: PiFileText,
} as const;

function tituloDoItem(i: ItemDeColecao) {
  return i.tipo === 'compositor' ? i.nome : i.titulo;
}
function detalheDoItem(i: ItemDeColecao) {
  if (i.tipo === 'obra')
    return `${i.compositor}${i.detalhe ? ` · ${i.detalhe}` : ''}`;
  if (i.tipo === 'partitura')
    return `${i.obra}, ${i.compositor}${i.paginas ? ` · ${i.paginas} pág.` : ''}`;
  return i.detalhe ?? '';
}

// ---------------------------------------------------------------------------
// Página da coleção (esboço A)
// ---------------------------------------------------------------------------

export function ColecaoFinalPagina({ esboco }: { esboco: EsbocoId }) {
  const c = COLECOES_FINAL[0];
  const { compartilhar } = useEsboco();
  const [editor, setEditor] = useState(false);
  return (
    <div className="section-wrap flex flex-col gap-12 py-12">
      <header className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[clamp(2.75rem,7vw,5rem)] leading-[0.95]">
            {c.titulo}
          </h1>
          <p className="t-corpo max-w-[56ch] text-texto-suave">{c.descricao}</p>
          <span className="inline-flex items-center gap-2 t-rotulo text-texto-suave">
            <Icon de={ICONE_ITEM[c.tipo]} tamanho="p" />
            {ROTULO_COLECAO[c.tipo].plural} ·{' '}
            {c.publica ? 'pública' : 'só você vê'} · por{' '}
            <span className="text-texto">{c.autor.nome}</span> · atualizada{' '}
            {c.atualizada}
          </span>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <Rostos nomes={c.rostos} tamanho="h-12 w-12" />
          <div className="flex flex-wrap gap-2">
            <Coracao rotulo={c.titulo} className="!h-11 !w-11 bg-sup-2" />
            <Button
              icone={PiShareNetwork}
              onClick={() =>
                compartilhar({
                  titulo: `${c.titulo} — uma coleção do Opus Atlas`,
                  url: 'https://opusatlas.com.br/colecoes/comecar-no-piano',
                })
              }
            >
              Compartilhar
            </Button>
            <Button icone={PiPencilSimple} onClick={() => setEditor(true)}>
              Editar
            </Button>
          </div>
          <span className="t-legenda">
            {c.favoritos} pessoas favoritaram · {c.itens.length}{' '}
            {ROTULO_COLECAO[c.tipo].plural.toLowerCase()}
          </span>
        </div>
      </header>
      <ol className="flex flex-col divide-y divide-[var(--linha)]">
        {c.itens.map((i, k) => (
          <li
            key={k}
            className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-4 py-5"
          >
            <span className="font-display text-[1.75rem] leading-none text-texto-fraco">
              {k + 1}
            </span>
            <Link
              href={rota(
                esboco,
                i.tipo === 'compositor' ? 'compositor' : 'obra'
              )}
              className="group flex min-w-0 items-start gap-4"
            >
              {i.tipo === 'compositor' ? (
                <Retrato
                  nome={i.nome}
                  src={retratoDe(i.nome)}
                  sizes="48px"
                  className="h-12 w-12 shrink-0 rounded-full"
                />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-controle bg-sup-2 text-texto-suave">
                  <Icon de={ICONE_ITEM[i.tipo]} tamanho="m" />
                </span>
              )}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-display text-[1.375rem] leading-snug group-hover:text-ouro-texto">
                  {tituloDoItem(i)}
                </span>
                <span className="t-rotulo text-texto-suave">
                  {detalheDoItem(i)}
                </span>
                {i.nota && (
                  <span className="mt-1 font-display text-[1.0625rem] italic text-texto-suave">
                    “{i.nota}”
                  </span>
                )}
              </span>
            </Link>
            <Coracao rotulo={tituloDoItem(i)} />
          </li>
        ))}
      </ol>
      <EditorDeColecao
        aberto={editor}
        aoFechar={() => setEditor(false)}
        colecao={c}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Minhas coleções (página pessoal)
// ---------------------------------------------------------------------------

export function MinhasColecoes({ esboco }: { esboco: EsbocoId }) {
  const { verificado } = useEsboco();
  const [aba, setAba] = useState<'minhas' | 'favoritas'>('minhas');
  const [editor, setEditor] = useState<ColecaoFinal | 'nova' | null>(null);
  const minhas = COLECOES_FINAL.filter((c) => c.autor.nome === 'Marina Duarte');
  const favoritas = COLECOES_FINAL.filter(
    (c) => c.autor.nome !== 'Marina Duarte'
  );
  const lista = aba === 'minhas' ? minhas : favoritas;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Abas rotulo="Coleções">
          <Aba ativa={aba === 'minhas'} onClick={() => setAba('minhas')}>
            Minhas · {minhas.length}
          </Aba>
          <Aba ativa={aba === 'favoritas'} onClick={() => setAba('favoritas')}>
            Favoritas · {favoritas.length}
          </Aba>
        </Abas>
        <Button
          variante="primario"
          icone={PiPlus}
          onClick={() =>
            verificado
              ? setEditor('nova')
              : toast('Confirme seu e-mail para criar coleções')
          }
        >
          Nova coleção
        </Button>
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {lista.map((c) => (
          <li
            key={c.id}
            className="flex flex-col gap-4 rounded-card bg-sup-2 p-5"
          >
            <div className="flex items-start gap-4">
              <Rostos
                nomes={c.rostos.filter((n) => retratoDe(n))}
                tamanho="h-10 w-10"
              />
              <span className="ml-auto inline-flex items-center gap-1.5 t-legenda">
                <Icon de={ICONE_ITEM[c.tipo]} tamanho="pp" />
                {ROTULO_COLECAO[c.tipo].plural}
                <span aria-hidden="true">·</span>
                <Icon
                  de={c.publica ? PiGlobeSimple : PiLockSimple}
                  tamanho="pp"
                />
                {c.publica ? 'Pública' : 'Só você vê'}
              </span>
            </div>
            <Link
              href={rota(esboco, 'colecao')}
              className="group flex flex-col gap-1"
            >
              <span className="font-display text-[1.375rem] leading-snug group-hover:text-ouro-texto">
                {c.titulo}
              </span>
              <span className="t-rotulo line-clamp-2 text-texto-suave">
                {c.descricao}
              </span>
            </Link>
            <div className="flex items-center justify-between gap-3">
              <span className="t-legenda">
                {c.autor.nome} · {c.favoritos} favoritaram · atualizada{' '}
                {c.atualizada}
              </span>
              {aba === 'minhas' ? (
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiPencilSimple}
                  rotulo="Editar coleção"
                  onClick={() => setEditor(c)}
                />
              ) : (
                <Coracao rotulo={c.titulo} inicial />
              )}
            </div>
          </li>
        ))}
      </ul>
      <EditorDeColecao
        aberto={!!editor}
        aoFechar={() => setEditor(null)}
        colecao={editor === 'nova' ? null : editor}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

const SUGESTOES: ItemDeColecao[] = [
  {
    tipo: 'obra',
    titulo: 'Noturnos, Op. 9',
    compositor: 'Chopin',
    detalhe: 'Piano · 116 partituras',
  },
  {
    tipo: 'obra',
    titulo: 'Clair de lune',
    compositor: 'Debussy',
    detalhe: 'Piano',
  },
  { tipo: 'compositor', nome: 'Debussy', detalhe: '1862–1918 · França' },
  {
    tipo: 'compositor',
    nome: 'Clara Schumann',
    detalhe: '1819–1896 · Alemanha',
  },
  {
    tipo: 'partitura',
    titulo: 'Partitura completa — versão 7',
    obra: 'Noturnos, Op. 9',
    compositor: 'Chopin',
    paginas: 25,
  },
  {
    tipo: 'partitura',
    titulo: 'Edição Mikuli (Schirmer, 1894)',
    obra: 'Prelúdios, Op. 28',
    compositor: 'Chopin',
    paginas: 41,
  },
];

const TIPOS_COLECAO: { id: TipoColecao; texto: string }[] = [
  { id: 'obra', texto: 'Um repertório, um recital, um tema.' },
  { id: 'compositor', texto: 'Uma escola, um país, uma geração.' },
  { id: 'partitura', texto: 'As edições que você indica para estudar.' },
];

function EditorDeColecao({
  aberto,
  aoFechar,
  colecao,
}: {
  aberto: boolean;
  aoFechar: () => void;
  colecao: ColecaoFinal | null;
}) {
  const [itens, setItens] = useState<ItemDeColecao[]>(
    colecao?.itens.slice(0, 4) ?? []
  );
  const [publica, setPublica] = useState(colecao?.publica ?? true);
  const [tipo, setTipo] = useState<TipoColecao>(colecao?.tipo ?? 'obra');
  const campo =
    'input-classical min-h-[var(--alvo)] w-full rounded-controle px-4 text-base';
  const mover = (k: number, d: -1 | 1) =>
    setItens((l) => {
      const n = [...l];
      const [x] = n.splice(k, 1);
      n.splice(k + d, 0, x);
      return n;
    });

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={colecao ? 'Editar coleção' : 'Nova coleção'}
      descricao="Um tipo por coleção — obras, compositores ou partituras —, na ordem que você quiser, cada item com uma nota sua."
      largura="g"
      rodape={
        <div className="flex flex-wrap items-center justify-between gap-3">
          {colecao ? (
            <Button variante="perigo" tamanho="p" icone={PiTrash}>
              Apagar
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variante="fantasma" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button
              variante="primario"
              onClick={() => {
                aoFechar();
                toast.success('Coleção salva');
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">O que vai nela</legend>
            {colecao ? (
              <span className="inline-flex items-center gap-2 t-rotulo text-texto-suave">
                <Icon de={ICONE_ITEM[tipo]} tamanho="p" />
                {ROTULO_COLECAO[tipo].plural} — o tipo não muda depois de
                criada.
              </span>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {TIPOS_COLECAO.map((t) => (
                  <label
                    key={t.id}
                    className={cx(
                      'flex cursor-pointer items-start gap-3 rounded-controle p-3',
                      tipo === t.id ? 'tint-ouro' : 'bg-sup-2'
                    )}
                  >
                    <input
                      type="radio"
                      name="tipo-colecao"
                      checked={tipo === t.id}
                      disabled={itens.length > 0 && tipo !== t.id}
                      onChange={() => setTipo(t.id)}
                      className="mt-1 accent-[var(--ouro)]"
                    />
                    <span className="flex flex-col">
                      <span
                        className={cx(
                          'inline-flex items-center gap-2 font-medium',
                          tipo === t.id && 'text-ouro-na-tinta'
                        )}
                      >
                        <Icon de={ICONE_ITEM[t.id]} tamanho="p" />
                        {ROTULO_COLECAO[t.id].plural}
                      </span>
                      <span className="t-legenda">{t.texto}</span>
                    </span>
                  </label>
                ))}
                {itens.length > 0 && (
                  <span className="t-legenda">
                    Para trocar o tipo, tire os itens primeiro.
                  </span>
                )}
              </div>
            )}
          </fieldset>
          <label className="flex flex-col gap-1.5">
            <span className="t-rotulo">Nome</span>
            <input
              className={campo}
              defaultValue={colecao?.titulo}
              placeholder="Ex.: Recital de dezembro"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="t-rotulo">Descrição</span>
            <textarea
              rows={3}
              className={cx(campo, 'py-3')}
              defaultValue={colecao?.descricao}
            />
          </label>
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">Quem vê</legend>
            {[
              {
                v: true,
                t: 'Pública',
                d: 'Aparece no seu perfil e na busca; qualquer pessoa pode favoritar.',
                i: PiGlobeSimple,
              },
              {
                v: false,
                t: 'Só você',
                d: 'Fica na sua estante; ninguém mais vê.',
                i: PiLockSimple,
              },
            ].map((o) => (
              <label
                key={o.t}
                className={cx(
                  'flex cursor-pointer items-start gap-3 rounded-controle p-3',
                  publica === o.v ? 'tint-ouro' : 'bg-sup-2'
                )}
              >
                <input
                  type="radio"
                  name="visibilidade"
                  checked={publica === o.v}
                  onChange={() => setPublica(o.v)}
                  className="mt-1 accent-[var(--ouro)]"
                />
                <span className="flex flex-col">
                  <span
                    className={cx(
                      'inline-flex items-center gap-2 font-medium',
                      publica === o.v && 'text-ouro-na-tinta'
                    )}
                  >
                    <Icon de={o.i} tamanho="p" />
                    {o.t}
                  </span>
                  <span className="t-legenda">{o.d}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="flex items-start gap-3 rounded-controle bg-sup-2 p-3 opacity-70">
            <Icon de={PiStar} tamanho="p" className="mt-0.5 text-texto-fraco" />
            <span className="t-legenda">
              Destacar na home — só a equipe do Opus Atlas. Coleções públicas
              bem favoritadas são candidatas.
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="t-rotulo">
              Acrescentar {ROTULO_COLECAO[tipo].plural.toLowerCase()}
            </span>
            <label className="c-busca flex items-center gap-2 rounded-full bg-[var(--campo)] px-4">
              <Icon
                de={PiMagnifyingGlass}
                tamanho="p"
                className="text-texto-fraco"
              />
              <span className="sr-only">Buscar no acervo</span>
              <input
                type="search"
                placeholder={`Buscar ${ROTULO_COLECAO[tipo].singular}…`}
                className="min-h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-texto-fraco"
              />
            </label>
            <ul className="flex flex-col gap-1">
              {SUGESTOES.filter((s) => s.tipo === tipo).map((s) => (
                <li key={tituloDoItem(s)}>
                  <button
                    type="button"
                    onClick={() => setItens((l) => [...l, s])}
                    className="flex w-full items-center gap-3 rounded-controle px-3 py-2 text-left hover:bg-sup-2"
                  >
                    <Icon de={PiPlus} tamanho="p" className="text-ouro-texto" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{tituloDoItem(s)}</span>
                      <span className="t-legenda truncate">
                        {detalheDoItem(s)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <span className="t-rotulo">Na coleção · {itens.length}</span>
            <ol className="flex flex-col gap-2">
              {itens.map((i, k) => (
                <li
                  key={k}
                  className="flex flex-col gap-2 rounded-controle bg-sup-2 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      de={ICONE_ITEM[i.tipo]}
                      tamanho="p"
                      className="shrink-0 text-texto-fraco"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {tituloDoItem(i)}
                    </span>
                    <Button
                      tamanho="p"
                      variante="fantasma"
                      icone={PiArrowUp}
                      rotulo="Subir"
                      disabled={k === 0}
                      onClick={() => mover(k, -1)}
                    />
                    <Button
                      tamanho="p"
                      variante="fantasma"
                      icone={PiArrowDown}
                      rotulo="Descer"
                      disabled={k === itens.length - 1}
                      onClick={() => mover(k, 1)}
                    />
                    <Button
                      tamanho="p"
                      variante="fantasma"
                      icone={PiTrash}
                      rotulo="Tirar da coleção"
                      onClick={() =>
                        setItens((l) => l.filter((_, j) => j !== k))
                      }
                    />
                  </div>
                  <input
                    aria-label={`Nota para ${tituloDoItem(i)}`}
                    defaultValue={i.nota}
                    placeholder="Uma nota sua (opcional)"
                    className="min-h-9 rounded-controle bg-[var(--campo)] px-3 text-[0.875rem] outline-none"
                  />
                </li>
              ))}
            </ol>
            {!itens.length && (
              <span className="t-rotulo text-texto-suave">
                Busque acima e toque em + para acrescentar.
              </span>
            )}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
