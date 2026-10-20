'use client';

import { useEffect, useRef, useState } from 'react';
import { GiGrandPiano } from 'react-icons/gi';
import { PiCaretDown, PiList, PiMagnifyingGlass } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import {
  ANOTACOES_14_DIAS,
  ATENCAO,
  ATIVIDADE,
  NAVEGACAO,
  NUMEROS,
  SISTEMA,
  acharItem,
  formatar,
} from '../dados';
import {
  Barras,
  Estado,
  ModuloAindaNao,
  ModuloObras,
  Pendentes,
  TrocaDeEsboco,
} from '../pecas';
import { Paleta, usePaleta } from '../paleta';

/**
 * Esboço C — Topo editorial.
 *
 * A casca da (main): a barra do site no topo (`navbar-classical`), o conteúdo
 * em 1.280px (`section-wrap`), títulos em Garamond. O painel deixa de ser
 * outro produto e passa a ser uma seção do Opus Atlas.
 *
 * Sem lateral: os assuntos abrem um menu com cada página e uma linha dizendo
 * o que mora ali — quem abre o painel uma vez por semana acha sem decorar.
 * Quem usa todo dia vai pelo ⌘K.
 *
 * O painel se lê como um boletim: uma frase conta a semana, e embaixo três
 * colunas com o detalhe.
 */

const NO_TOPO = NAVEGACAO.filter((g) => g.id !== 'geral');

export function EsbocoC() {
  const [vista, setVista] = useState('painel');
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [folha, setFolha] = useState(false);
  const paleta = usePaleta();
  const barra = useRef<HTMLElement>(null);
  const { grupo, item } = acharItem(vista);

  const ir = (id: string) => {
    setVista(id);
    setMenuAberto(null);
    setFolha(false);
    window.scrollTo({ top: 0 });
  };

  // `?vista=obras` abre direto numa tela: dá para mandar o link de uma delas.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('vista');
    if (v) ir(v);
  }, []);

  // Fecha o menu ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!menuAberto) return;
    const fora = (e: MouseEvent) => {
      if (!barra.current?.contains(e.target as Node)) setMenuAberto(null);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenuAberto(null);
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [menuAberto]);

  const menu = NO_TOPO.find((g) => g.id === menuAberto);

  return (
    <div className="min-h-dvh bg-fundo text-texto">
      <header ref={barra} className="navbar-classical sticky top-0 z-barra">
        <div className="section-wrap-nav flex items-center gap-6 !py-3">
          <button
            type="button"
            onClick={() => ir('painel')}
            className="flex shrink-0 items-center gap-3"
          >
            <GiGrandPiano
              className="h-8 w-8 text-ouro-texto"
              aria-hidden="true"
            />
            <span className="font-display text-xl">Opus Atlas</span>
            <span className="h-5 w-px bg-linha-forte" aria-hidden="true" />
            <span className="text-sm text-texto-suave">Painel</span>
          </button>

          <nav
            aria-label="Assuntos do painel"
            className="hidden flex-1 items-center gap-1 xl:flex"
          >
            {NO_TOPO.map((g) => {
              const pendentes = g.itens.reduce(
                (s, i) => s + (i.pendentes ?? 0),
                0
              );
              const aqui = grupo.id === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-expanded={menuAberto === g.id}
                  onClick={() =>
                    setMenuAberto((m) => (m === g.id ? null : g.id))
                  }
                  className={cx(
                    'flex min-h-9 items-center gap-1.5 rounded-controle px-2.5 text-sm',
                    'transition-colors duration-[var(--t-toque)] ease-saida',
                    aqui || menuAberto === g.id
                      ? 'text-ouro-texto'
                      : 'text-texto-suave hover:text-texto'
                  )}
                >
                  {g.rotulo}
                  {pendentes > 0 && (
                    <span className="t-dado text-xs text-ouro-texto">
                      {pendentes}
                    </span>
                  )}
                  <Icon
                    de={PiCaretDown}
                    tamanho="pp"
                    className={cx(
                      'transition-transform duration-[var(--t-resposta)] ease-saida',
                      menuAberto === g.id && 'rotate-180'
                    )}
                  />
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiMagnifyingGlass}
              onClick={paleta.abrir}
              className="max-sm:hidden"
            >
              Ir para{' '}
              <kbd className="t-dado ml-1 text-xs text-texto-fraco">⌘K</kbd>
            </Button>
            <ThemeToggle variant="navbar" />
            <span
              className="grid h-9 w-9 place-items-center rounded-full tint-ouro text-sm font-medium text-ouro-na-tinta max-sm:hidden"
              title="Iago Martins"
            >
              I
            </span>
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiList}
              rotulo="Abrir menu"
              onClick={() => setFolha(true)}
              className="xl:hidden"
            />
          </div>
        </div>

        {/* O menu do assunto: cada página com o que mora nela */}
        {menu && (
          <div className="absolute inset-x-0 top-full z-menu hidden xl:block">
            <div className="section-wrap-nav !pt-2">
              <div className="sup-alta ml-[236px] grid max-w-3xl grid-cols-2 gap-1 p-3">
                {menu.itens.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => ir(i.id)}
                    className={cx(
                      'flex flex-col gap-0.5 rounded-controle px-3 py-2.5 text-left',
                      'transition-colors duration-[var(--t-toque)] ease-saida hover:bg-[var(--interactive-hover)]',
                      vista === i.id && 'bg-sup-2'
                    )}
                  >
                    <span className="flex items-center gap-2 text-[0.9375rem] font-medium">
                      {i.rotulo}
                      <Pendentes n={i.pendentes} forte />
                    </span>
                    <span className="t-legenda">{i.resumo}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="section-wrap">
        {vista === 'painel' ? (
          <PainelC ir={ir} />
        ) : (
          <Stack gap={6}>
            <nav aria-label="Você está em" className="t-legenda">
              <button
                type="button"
                onClick={() => ir('painel')}
                className="hover:text-texto"
              >
                Painel
              </button>{' '}
              / {grupo.rotulo}
            </nav>
            {vista === 'obras' ? (
              <ModuloObras />
            ) : (
              <ModuloAindaNao grupo={grupo} item={item} />
            )}
          </Stack>
        )}
      </main>

      <Sheet
        aberto={folha}
        aoFechar={() => setFolha(false)}
        titulo="Painel"
        largura="p"
      >
        <Stack gap={6}>
          {NO_TOPO.map((g) => (
            <section key={g.id} className="flex flex-col gap-1">
              <Text papel="rotulo" tom="fraco" as="h3" className="px-2">
                {g.rotulo}
              </Text>
              {g.itens.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => ir(i.id)}
                  className={cx(
                    'flex min-h-[var(--alvo)] items-center gap-2 rounded-controle px-2 text-left',
                    vista === i.id
                      ? 'bg-sup-2 font-medium'
                      : 'hover:bg-[var(--interactive-hover)]'
                  )}
                >
                  <span className="flex-1">{i.rotulo}</span>
                  <Pendentes n={i.pendentes} forte />
                </button>
              ))}
            </section>
          ))}
        </Stack>
      </Sheet>

      <Paleta aberta={paleta.aberta} aoFechar={paleta.fechar} aoEscolher={ir} />
      <TrocaDeEsboco atual="c" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// O painel como boletim.
// ---------------------------------------------------------------------------

function PainelC({ ir }: { ir: (id: string) => void }) {
  const urgentes = ATENCAO.filter((a) => a.urgente);

  return (
    <Stack gap={12}>
      <Stack gap={4} className="pt-4">
        <Text papel="legenda" as="p" className="t-dado">
          terça-feira, 29 de setembro · atualizado há 2 min
        </Text>
        <Text papel="titulo" as="h1">
          Painel
        </Text>
        <p className="t-corpo medida-texto text-texto-suave">
          Na última semana,{' '}
          <strong className="font-medium text-texto">38 pessoas</strong> criaram
          conta e foram feitas{' '}
          <strong className="font-medium text-texto">640 anotações</strong>, 18%
          acima da semana anterior.{' '}
          <strong className="font-medium text-texto">14 envios</strong> esperam
          moderação — o mais antigo há dois dias — e a fila de e-mail tem duas
          falhas.
        </p>
        <Inline gap={2} quebra className="pt-2">
          {urgentes.map((a) => (
            <Button
              key={a.id}
              tamanho="m"
              variante={a.id === 'fila' ? 'primario' : 'secundario'}
              onClick={() => ir(a.id)}
            >
              {a.acao}
            </Button>
          ))}
        </Inline>
      </Stack>

      {/* Três colunas de boletim, separadas por fio, sem card */}
      <div className="grid gap-10 border-t border-linha pt-8 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-linha">
        <section
          aria-labelledby="c-atencao"
          className="flex flex-col gap-4 lg:pr-8"
        >
          <Text papel="subtitulo" as="h2" id="c-atencao">
            Pede atenção
          </Text>
          <ul className="flex flex-col">
            {ATENCAO.map((a) => (
              <li
                key={a.id}
                className="border-b border-linha py-3 last:border-0"
              >
                <button
                  type="button"
                  onClick={() => ir(a.id)}
                  className="group flex w-full flex-col gap-0.5 text-left"
                >
                  <span className="flex items-baseline gap-2">
                    <span
                      className={cx(
                        't-dado',
                        a.urgente ? 'text-atencao' : 'text-texto-fraco'
                      )}
                    >
                      {a.n}
                    </span>
                    <span className="text-[0.9375rem] group-hover:text-ouro-texto">
                      {a.curto}
                    </span>
                  </span>
                  <span className="t-legenda">{a.detalhe}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="c-acervo"
          className="flex flex-col gap-4 lg:px-8"
        >
          <Text papel="subtitulo" as="h2" id="c-acervo">
            O acervo
          </Text>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
            {NUMEROS.map((n) => (
              <div key={n.id} className="flex flex-col">
                <dt className="t-legenda">{n.rotulo}</dt>
                <dd className="font-display text-[1.75rem] leading-tight tabular-nums">
                  {formatar(n.valor)}
                </dd>
                <dd className="t-legenda">{n.variacao}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          aria-labelledby="c-casa"
          className="flex flex-col gap-4 lg:pl-8"
        >
          <Text papel="subtitulo" as="h2" id="c-casa">
            A casa
          </Text>
          <ul className="flex flex-col">
            {SISTEMA.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 border-b border-linha py-3 last:border-0"
              >
                <Estado estado={s.estado} />
                <span className="flex flex-1 flex-col">
                  <span className="text-[0.9375rem]">{s.rotulo}</span>
                  <span className="t-legenda">{s.detalhe}</span>
                </span>
                <span
                  className={cx(
                    't-dado text-sm',
                    s.estado === 'atencao' ? 'text-atencao' : 'text-texto-suave'
                  )}
                >
                  {s.valor}
                </span>
              </li>
            ))}
          </ul>
          <Button
            variante="texto"
            tamanho="p"
            onClick={() => ir('saude')}
            className="self-start"
          >
            Ver a saúde do sistema
          </Button>
        </section>
      </div>

      <div className="grid gap-10 border-t border-linha pt-8 lg:grid-cols-[2fr_1fr] lg:gap-16">
        <section aria-labelledby="c-anotacoes" className="flex flex-col gap-4">
          <Inline extremos alinhar="base">
            <Text papel="subtitulo" as="h2" id="c-anotacoes">
              Anotações por dia
            </Text>
            <Text papel="legenda" as="span">
              últimos 14 dias
            </Text>
          </Inline>
          <Barras
            dados={ANOTACOES_14_DIAS}
            altura={200}
            rotulo="Anotações por dia"
          />
        </section>

        <section aria-labelledby="c-diario" className="flex flex-col gap-4">
          <Text papel="subtitulo" as="h2" id="c-diario">
            Diário
          </Text>
          <ol className="flex flex-col gap-3">
            {ATIVIDADE.map((a) => (
              <li key={a.id} className="flex flex-col">
                <span className="t-rotulo text-texto-suave">
                  <span className="text-texto">{a.quem}</span> {a.oque}{' '}
                  <em className="font-display text-[1.0625rem] not-italic text-texto">
                    {a.alvo}
                  </em>
                </span>
                <span className="t-legenda">{a.quando}</span>
              </li>
            ))}
          </ol>
          <Button
            variante="texto"
            tamanho="p"
            onClick={() => ir('auditoria')}
            className="self-start"
          >
            Auditoria completa
          </Button>
        </section>
      </div>
    </Stack>
  );
}
