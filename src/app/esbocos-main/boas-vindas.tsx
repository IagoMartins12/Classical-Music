'use client';

import { useEffect, useRef, useState } from 'react';
import {
  PiArrowLeft,
  PiArrowRight,
  PiBookOpenText,
  PiChalkboardTeacher,
  PiCheck,
  PiHeadphones,
  PiMagnifyingGlass,
  PiStudent,
  PiX,
  PiBookmarkSimple,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { FAMOSOS } from './dados';
import { Medalha, Retrato, retratoDe } from './pecas';

/**
 * As boas-vindas (06/10, refeitas): tela cheia, cinco passos curtos e, à
 * direita, a estante da pessoa se montando ao vivo — cada resposta aparece
 * lá na hora. Pular está sempre à mão; tudo muda depois, no perfil.
 *
 * O que cada passo guarda (API): instrumentos e tempo de estudo
 * (`UserInstrument`), objetivos (preferências), compositores favoritos
 * (`FavoriteComposer`), obras escolhidas (`WantToLearn`).
 */

const INSTRUMENTOS = [
  'Piano',
  'Violino',
  'Violoncelo',
  'Violão',
  'Flauta',
  'Canto',
  'Órgão',
  'Viola',
  'Clarinete',
  'Outro',
];
const TEMPOS = ['Começando', '1 a 3 anos', '3 a 10 anos', 'Mais de 10 anos'];
const OBJETIVOS = [
  {
    id: 'sozinho',
    rotulo: 'Estudar sozinho',
    detalhe: 'Achar a partitura, guardar e acompanhar',
    icone: PiBookOpenText,
  },
  {
    id: 'professor',
    rotulo: 'Tenho professor',
    detalhe: 'Aulas e tarefas pelo portal',
    icone: PiStudent,
  },
  {
    id: 'ensino',
    rotulo: 'Dou aula',
    detalhe: 'Alunos, agenda e repertório',
    icone: PiChalkboardTeacher,
  },
  {
    id: 'partituras',
    rotulo: 'Só partituras',
    detalhe: 'Baixar e ir tocar',
    icone: PiMagnifyingGlass,
  },
  {
    id: 'ouvir',
    rotulo: 'Ouvir e conhecer',
    detalhe: 'Descobrir obras e compositores',
    icone: PiHeadphones,
  },
];
const SUGESTOES: Record<
  string,
  { obra: string; compositor: string; porque: string }[]
> = {
  Piano: [
    {
      obra: 'Prelúdio em mi menor, Op. 28 nº 4',
      compositor: 'Chopin',
      porque: 'Dois minutos, uma melodia e acordes.',
    },
    {
      obra: 'Prelúdio em dó maior, BWV 846',
      compositor: 'Bach',
      porque: 'Arpejos que cabem na mão.',
    },
    {
      obra: 'Kinderszenen, Op. 15 — Träumerei',
      compositor: 'Schumann',
      porque: 'A peça mais bonita para começar.',
    },
  ],
  Violino: [
    {
      obra: 'Concerto em lá menor, RV 356',
      compositor: 'Vivaldi',
      porque: 'O concerto que todo violinista toca cedo.',
    },
    {
      obra: '24 Prelúdios em todos os tons',
      compositor: 'Baillot',
      porque: 'Curtos, um por tonalidade.',
    },
    {
      obra: 'Partita nº 2 — Sarabanda',
      compositor: 'Bach',
      porque: 'Bach sozinho, devagar.',
    },
  ],
};

export function BoasVindasFinal({
  aberto,
  aoFechar,
}: {
  aberto: boolean;
  aoFechar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [passo, setPasso] = useState(0);
  const [instrumentos, setInstrumentos] = useState<string[]>(['Piano']);
  const [tempo, setTempo] = useState('1 a 3 anos');
  const [objetivos, setObjetivos] = useState<string[]>(['sozinho']);
  const [compositores, setCompositores] = useState<string[]>(['Chopin']);
  const [estante, setEstante] = useState<string[]>([]);
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) {
      setPasso(0);
      d.showModal();
    }
    if (!aberto && d.open) d.close();
  }, [aberto]);
  useEffect(() => {
    titulo.current?.focus();
  }, [passo]);

  const alternar = (l: string[], v: string, set: (x: string[]) => void) =>
    set(l.includes(v) ? l.filter((x) => x !== v) : [...l, v]);
  const sugestoes = SUGESTOES[instrumentos[0]] ?? SUGESTOES.Piano;
  const passos = [
    'Instrumento',
    'Objetivo',
    'Compositores',
    'Primeira estante',
  ];
  const fim = passo === 4;

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      aria-label="Boas-vindas"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-fundo p-0 text-texto backdrop:bg-[var(--veu-foto)]"
    >
      <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <header className="flex items-center gap-4 px-5 py-4 lg:col-span-2 lg:px-10">
          <span className="font-display text-[1.25rem] text-ouro-texto">
            Opus Atlas
          </span>
          {!fim && (
            <ol
              aria-label="Passos"
              className="mx-auto hidden max-w-md flex-1 grid-cols-4 gap-2 sm:grid"
            >
              {passos.map((p, i) => (
                <li key={p} className="flex flex-col gap-1.5">
                  <span
                    className={cx(
                      'h-[3px] rounded-full transition-colors duration-[var(--t-entrada)]',
                      i <= passo ? 'bg-[var(--ouro)]' : 'bg-[var(--linha)]'
                    )}
                  />
                  <span
                    className={cx('t-legenda', i === passo && '!text-texto')}
                  >
                    {p}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {!fim && (
            <span className="t-legenda mx-auto sm:hidden">
              {passo + 1} de 4
            </span>
          )}
          <Button
            variante="fantasma"
            tamanho="p"
            icone={PiX}
            rotulo="Fechar as boas-vindas"
            onClick={aoFechar}
            className="ml-auto"
          />
        </header>

        <main
          key={passo}
          className="boas-vindas-passo flex min-h-0 flex-col gap-8 overflow-y-auto px-5 py-6 lg:px-10 lg:py-10"
        >
          {passo === 0 && (
            <>
              <div className="flex flex-col gap-3">
                <h2
                  ref={titulo}
                  tabIndex={-1}
                  className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight outline-none"
                >
                  Bem-vinda, Marina. O que você toca?
                </h2>
                <p className="t-corpo text-texto-suave">
                  Pode marcar mais de um. Isso filtra partituras, coleções e o
                  que sugerimos.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {INSTRUMENTOS.map((i) => {
                  const sel = instrumentos.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => alternar(instrumentos, i, setInstrumentos)}
                      className={cx(
                        'relative flex min-h-20 items-end rounded-card p-4 text-left font-display text-[1.25rem] transition-colors duration-[var(--t-toque)]',
                        sel
                          ? 'tint-ouro text-ouro-na-tinta'
                          : 'bg-sup-2 hover:text-ouro-texto'
                      )}
                    >
                      {i}
                      {sel && (
                        <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full fill-ouro text-sobre-ouro">
                          <Icon de={PiCheck} tamanho="pp" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <fieldset className="flex flex-col gap-3">
                <legend className="t-rotulo mb-3">
                  Há quanto tempo você estuda{' '}
                  {instrumentos[0]?.toLowerCase() ?? 'música'}?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {TEMPOS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={tempo === t}
                      onClick={() => setTempo(t)}
                      className={cx(
                        'inline-flex min-h-11 items-center rounded-full px-5',
                        tempo === t
                          ? 'tint-ouro text-ouro-na-tinta'
                          : 'bg-sup-2 text-texto-suave'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {passo === 1 && (
            <>
              <div className="flex flex-col gap-3">
                <h2
                  ref={titulo}
                  tabIndex={-1}
                  className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight outline-none"
                >
                  Para que você veio?
                </h2>
                <p className="t-corpo text-texto-suave">
                  Marque o que servir. Quem dá aula ganha o caminho do portal.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {OBJETIVOS.map((o) => {
                  const sel = objetivos.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => alternar(objetivos, o.id, setObjetivos)}
                      className={cx(
                        'flex items-start gap-4 rounded-card p-4 text-left transition-colors',
                        sel
                          ? 'tint-ouro'
                          : 'bg-sup-2 hover:bg-[var(--interactive-hover)]'
                      )}
                    >
                      <Icon
                        de={o.icone}
                        tamanho="g"
                        className={
                          sel ? 'text-ouro-na-tinta' : 'text-texto-suave'
                        }
                      />
                      <span className="flex flex-col">
                        <span
                          className={cx(
                            'font-medium',
                            sel && 'text-ouro-na-tinta'
                          )}
                        >
                          {o.rotulo}
                        </span>
                        <span className="t-rotulo text-texto-suave">
                          {o.detalhe}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {passo === 2 && (
            <>
              <div className="flex flex-col gap-3">
                <h2
                  ref={titulo}
                  tabIndex={-1}
                  className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight outline-none"
                >
                  De quem você gosta?
                </h2>
                <p className="t-corpo text-texto-suave">
                  Eles entram nos seus favoritos; as obras deles para{' '}
                  {instrumentos[0]?.toLowerCase()} aparecem primeiro.
                </p>
              </div>
              <label className="c-busca flex items-center gap-2 rounded-full bg-[var(--campo)] px-4">
                <Icon
                  de={PiMagnifyingGlass}
                  tamanho="p"
                  className="text-texto-fraco"
                />
                <span className="sr-only">Buscar compositor</span>
                <input
                  type="search"
                  placeholder="Buscar um compositor"
                  className="min-h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-texto-fraco"
                />
              </label>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                {FAMOSOS.slice(0, 12).map((c) => {
                  const sel = compositores.includes(c.nome);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={sel}
                      onClick={() =>
                        alternar(compositores, c.nome, setCompositores)
                      }
                      className="group flex flex-col items-center gap-2"
                    >
                      <span className="relative">
                        <Retrato
                          nome={c.nome}
                          src={c.retrato}
                          sizes="88px"
                          className={cx(
                            'h-20 w-20 rounded-full transition-[box-shadow,opacity]',
                            sel
                              ? 'ring-2 ring-[var(--ouro)] ring-offset-2 ring-offset-[var(--fundo)]'
                              : 'opacity-75 group-hover:opacity-100'
                          )}
                        />
                        {sel && (
                          <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full fill-ouro text-sobre-ouro">
                            <Icon de={PiCheck} tamanho="pp" />
                          </span>
                        )}
                      </span>
                      <span
                        className={cx(
                          'text-[0.875rem]',
                          sel ? 'text-texto' : 'text-texto-suave'
                        )}
                      >
                        {c.nome}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {passo === 3 && (
            <>
              <div className="flex flex-col gap-3">
                <h2
                  ref={titulo}
                  tabIndex={-1}
                  className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight outline-none"
                >
                  Sua primeira estante
                </h2>
                <p className="t-corpo text-texto-suave">
                  Pelo que você contou, três obras para{' '}
                  {instrumentos[0]?.toLowerCase()}. Toque em “Quero estudar” nas
                  que quiser — dá para escolher a partitura depois.
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {sugestoes.map((s) => {
                  const sel = estante.includes(s.obra);
                  return (
                    <li
                      key={s.obra}
                      className="flex flex-wrap items-center gap-4 rounded-card bg-sup-2 p-4"
                    >
                      <Retrato
                        nome={s.compositor}
                        src={retratoDe(s.compositor)}
                        sizes="56px"
                        className="h-14 w-14 shrink-0 rounded-full"
                      />
                      <span className="flex min-w-[12rem] flex-1 flex-col">
                        <span className="font-display text-[1.25rem] leading-snug">
                          {s.obra}
                        </span>
                        <span className="t-rotulo text-texto-suave">
                          {s.compositor} · {s.porque}
                        </span>
                      </span>
                      <Button
                        variante={sel ? 'primario' : 'secundario'}
                        icone={sel ? PiCheck : PiBookmarkSimple}
                        aria-pressed={sel}
                        onClick={() => alternar(estante, s.obra, setEstante)}
                        className="max-sm:w-full"
                      >
                        {sel ? 'Na estante' : 'Quero estudar'}
                      </Button>
                    </li>
                  );
                })}
              </ul>
              <label className="flex min-h-10 items-center gap-3 t-rotulo">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-[var(--ouro)]"
                />
                Quero a newsletter mensal: uma obra, um compositor e os
                concertos do mês.
              </label>
            </>
          )}

          {fim && (
            <div className="m-auto flex max-w-lg flex-col items-center gap-6 text-center">
              <span className="grid h-24 w-24 place-items-center rounded-full tint-ouro text-ouro-na-tinta">
                <Medalha desenhar className="h-14 w-14" />
              </span>
              <h2
                ref={titulo}
                tabIndex={-1}
                className="font-display text-[clamp(2rem,4vw,3rem)] leading-tight outline-none"
              >
                Sua estante está pronta
              </h2>
              <p className="t-corpo text-texto-suave">
                Primeira conquista:{' '}
                <span className="text-ouro-texto">
                  Primeira estante · +50 XP
                </span>
                .{' '}
                {estante.length
                  ? `${estante.length} obra${estante.length > 1 ? 's' : ''} esperando você.`
                  : 'Ela começa vazia — guarde a primeira obra quando quiser.'}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variante="primario" onClick={aoFechar}>
                  Abrir minha estante
                </Button>
                <Button onClick={aoFechar}>Explorar o acervo</Button>
              </div>
              {objetivos.includes('ensino') && (
                <p className="t-rotulo text-texto-suave">
                  Você marcou que dá aula: o portal de aulas é do plano Mentor.
                  Seus alunos entram de graça.
                </p>
              )}
            </div>
          )}
        </main>

        {/* A prévia: a estante se monta com as respostas. */}
        <aside
          aria-label="Prévia da sua estante"
          className="row-span-1 hidden min-h-0 flex-col gap-5 overflow-hidden bg-sup-2 p-10 lg:row-span-2 lg:row-start-2 lg:col-start-2 lg:flex"
        >
          <span className="t-legenda">Sua estante, até agora</span>
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--fundo)] font-display text-[1.5rem] text-ouro-texto">
              M
            </span>
            <span className="flex flex-col">
              <span className="font-display text-[1.375rem]">
                Marina Duarte
              </span>
              <span className="t-rotulo text-texto-suave">
                {instrumentos.join(', ') || 'Instrumento?'} ·{' '}
                {tempo.toLowerCase()}
              </span>
            </span>
          </div>
          {objetivos.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {objetivos.map((o) => (
                <span
                  key={o}
                  className="rounded-full bg-[var(--fundo)] px-3 py-1 text-[0.8125rem]"
                >
                  {OBJETIVOS.find((x) => x.id === o)?.rotulo}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <span className="t-legenda">Compositores favoritos</span>
            <div className="flex flex-wrap gap-2">
              {compositores.length ? (
                compositores.map((n) => (
                  <Retrato
                    key={n}
                    nome={n}
                    src={retratoDe(n)}
                    sizes="40px"
                    className="h-10 w-10 rounded-full"
                  />
                ))
              ) : (
                <span className="t-rotulo text-texto-fraco">Nenhum ainda</span>
              )}
            </div>
          </div>
          <div className="flex min-h-0 flex-col gap-2">
            <span className="t-legenda">Quero estudar</span>
            <ul className="flex flex-col gap-2">
              {estante.length ? (
                estante.map((o) => (
                  <li
                    key={o}
                    className="boas-vindas-passo flex items-center gap-2 rounded-controle bg-[var(--fundo)] px-3 py-2 t-rotulo"
                  >
                    <Icon
                      de={PiBookmarkSimple}
                      tamanho="p"
                      className="text-ouro-texto"
                    />
                    {o}
                  </li>
                ))
              ) : (
                <li className="rounded-controle border border-dashed border-[var(--linha-forte)] px-3 py-4 text-center t-rotulo text-texto-fraco">
                  As obras que você escolher aparecem aqui
                </li>
              )}
            </ul>
          </div>
        </aside>

        {!fim && (
          <footer className="flex items-center justify-between gap-3 border-t border-[var(--linha)] px-5 py-4 lg:col-start-1 lg:px-10">
            <Button
              variante="fantasma"
              onClick={aoFechar}
              className="whitespace-nowrap max-sm:px-2"
            >
              Pular por agora
            </Button>
            <div className="flex items-center gap-2">
              {passo > 0 && (
                <>
                  <Button
                    icone={PiArrowLeft}
                    rotulo="Voltar"
                    onClick={() => setPasso(passo - 1)}
                    className="sm:hidden"
                  />
                  <Button
                    icone={PiArrowLeft}
                    onClick={() => setPasso(passo - 1)}
                    className="max-sm:hidden"
                  >
                    Voltar
                  </Button>
                </>
              )}
              <Button variante="primario" onClick={() => setPasso(passo + 1)}>
                {passo === 3 ? 'Concluir' : 'Continuar'}{' '}
                <Icon de={PiArrowRight} tamanho="p" />
              </Button>
            </div>
          </footer>
        )}
      </div>
    </dialog>
  );
}
