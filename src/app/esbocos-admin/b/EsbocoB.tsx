'use client';

import { useEffect, useState } from 'react';
import { GiGrandPiano } from 'react-icons/gi';
import { PiDotsThreeOutline, PiSignOut } from 'react-icons/pi';
import LocalizedLink from '@/app/components/LocalizedLink';
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
  TOTAL_PENDENTES,
  acharItem,
  formatar,
  type GrupoNav,
} from '../dados';
import {
  Barras,
  Estado,
  ModuloAindaNao,
  ModuloObras,
  Pendentes,
  TrocaDeEsboco,
} from '../pecas';

/**
 * Esboço B — Trilho e fila.
 *
 * Duas colunas de navegação: o trilho, com os nove assuntos em ícone, e ao
 * lado as páginas do assunto escolhido. Cada assunto vira um lugar próprio,
 * com poucas páginas à vista de cada vez — em vez de 37 itens numa coluna só.
 *
 * O painel é uma fila de trabalho: o que pede alguém vem primeiro, grande, com
 * a ação ao lado. Os números ficam numa coluna de "pulso" à direita, para
 * consultar, não para admirar.
 *
 * No telefone o trilho vira barra embaixo (quatro assuntos e "Mais").
 */

const NO_TELEFONE = ['geral', 'catalogo', 'moderacao', 'blog'];

export function EsbocoB() {
  const [vista, setVista] = useState('painel');
  const [mais, setMais] = useState(false);
  const { grupo, item } = acharItem(vista);
  const [grupoAberto, setGrupoAberto] = useState<string>(grupo.id);
  const aberto = NAVEGACAO.find((g) => g.id === grupoAberto) ?? grupo;

  const ir = (id: string) => {
    const achado = acharItem(id);
    setVista(id);
    setGrupoAberto(achado.grupo.id);
    setMais(false);
  };

  // `?vista=obras` abre direto numa tela: dá para mandar o link de uma delas.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('vista');
    if (v) ir(v);
  }, []);

  const escolherGrupo = (g: GrupoNav) => {
    setGrupoAberto(g.id);
    ir(g.itens[0].id);
  };

  return (
    <div className="flex min-h-dvh bg-fundo text-texto">
      {/* Trilho */}
      <nav
        aria-label="Assuntos"
        className="sticky top-0 hidden h-dvh w-[76px] shrink-0 flex-col items-center gap-1 border-r border-linha fundo-sup-2 py-4 md:flex"
      >
        <GiGrandPiano
          className="mb-4 h-7 w-7 text-ouro-texto"
          aria-label="Opus Atlas"
        />
        {NAVEGACAO.map((g) => (
          <BotaoTrilho
            key={g.id}
            grupo={g}
            ativo={g.id === aberto.id}
            onClick={() => escolherGrupo(g)}
          />
        ))}
        <div className="mt-auto flex flex-col items-center gap-2">
          <ThemeToggle variant="compact" />
          <span
            className="grid h-9 w-9 place-items-center rounded-full tint-ouro text-sm font-medium text-ouro-na-tinta"
            title="Iago Martins"
          >
            I
          </span>
        </div>
      </nav>

      {/* As páginas do assunto */}
      <aside
        aria-label={aberto.rotulo}
        className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col gap-4 border-r border-linha px-3 py-5 lg:flex"
      >
        <Text papel="subtitulo" as="h2" className="px-3">
          {aberto.rotulo}
        </Text>
        <ul className="flex flex-col gap-0.5">
          {aberto.itens.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                aria-current={vista === i.id ? 'page' : undefined}
                onClick={() => ir(i.id)}
                className={cx(
                  'flex min-h-9 w-full items-center gap-2 rounded-controle px-3 text-left text-sm',
                  'transition-colors duration-[var(--t-toque)] ease-saida',
                  vista === i.id
                    ? 'bg-sup-2 font-medium text-texto'
                    : 'text-texto-suave hover:bg-[var(--interactive-hover)] hover:text-texto',
                  i.semPagina && 'text-texto-fraco'
                )}
              >
                <span className="flex-1">{i.rotulo}</span>
                <Pendentes n={i.pendentes} forte />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center gap-2 px-3">
          <LocalizedLink href="/" className="t-legenda flex-1 hover:text-texto">
            Ver o site
          </LocalizedLink>
          <Button
            variante="fantasma"
            tamanho="p"
            icone={PiSignOut}
            rotulo="Sair"
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        {/* Abaixo de 1024px a coluna do assunto vira faixa rolável no topo */}
        <div className="sticky top-0 z-barra border-b border-linha bg-fundo lg:hidden">
          <div className="flex items-center gap-3 px-4 pt-3 md:hidden">
            <GiGrandPiano
              className="h-6 w-6 text-ouro-texto"
              aria-hidden="true"
            />
            <span className="font-display text-lg">{aberto.rotulo}</span>
            <span className="ml-auto">
              <ThemeToggle variant="compact" />
            </span>
          </div>
          <div className="classical-scrollbar-mini flex gap-1 overflow-x-auto px-3 py-2">
            {aberto.itens.map((i) => (
              <button
                key={i.id}
                type="button"
                aria-current={vista === i.id ? 'page' : undefined}
                onClick={() => ir(i.id)}
                className={cx(
                  'flex min-h-[var(--alvo)] shrink-0 items-center gap-2 whitespace-nowrap rounded-controle px-3 text-sm',
                  vista === i.id
                    ? 'bg-sup-2 font-medium text-texto'
                    : 'text-texto-suave'
                )}
              >
                {i.rotulo}
                <Pendentes n={i.pendentes} forte />
              </button>
            ))}
          </div>
        </div>

        <main className="w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10">
          {vista === 'painel' ? (
            <PainelB ir={ir} />
          ) : vista === 'obras' ? (
            <ModuloObras />
          ) : (
            <ModuloAindaNao grupo={grupo} item={item} />
          )}
        </main>
      </div>

      {/* Telefone: barra de baixo */}
      <nav
        aria-label="Assuntos"
        className="fixed inset-x-0 bottom-0 z-barra flex border-t border-linha bg-fundo px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {NAVEGACAO.filter((g) => NO_TELEFONE.includes(g.id)).map((g) => (
          <BotaoBarra
            key={g.id}
            rotulo={g.id === 'geral' ? 'Início' : g.rotulo}
            icone={g.icone}
            ativo={aberto.id === g.id}
            pendentes={g.itens.some((i) => i.pendentes)}
            onClick={() => escolherGrupo(g)}
          />
        ))}
        <BotaoBarra
          rotulo="Mais"
          icone={PiDotsThreeOutline}
          ativo={!NO_TELEFONE.includes(aberto.id)}
          onClick={() => setMais(true)}
        />
      </nav>

      <Sheet
        aberto={mais}
        aoFechar={() => setMais(false)}
        titulo="Mais assuntos"
        largura="p"
      >
        <ul className="flex flex-col">
          {NAVEGACAO.filter((g) => !NO_TELEFONE.includes(g.id)).map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => escolherGrupo(g)}
                className="flex min-h-[var(--alvo)] w-full items-center gap-3 rounded-controle px-2 text-left hover:bg-[var(--interactive-hover)]"
              >
                <Icon de={g.icone} tamanho="m" className="text-texto-fraco" />
                <span className="flex-1">{g.rotulo}</span>
                <span className="t-legenda">{g.itens.length}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <TrocaDeEsboco atual="b" />
    </div>
  );
}

function BotaoTrilho({
  grupo,
  ativo,
  onClick,
}: {
  grupo: GrupoNav;
  ativo: boolean;
  onClick: () => void;
}) {
  const pendentes = grupo.itens.reduce((s, i) => s + (i.pendentes ?? 0), 0);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={ativo ? 'true' : undefined}
      title={grupo.rotulo}
      className={cx(
        'group relative grid h-11 w-11 place-items-center rounded-controle',
        'transition-colors duration-[var(--t-toque)] ease-saida',
        ativo
          ? 'tint-ouro text-ouro-na-tinta'
          : 'text-texto-fraco hover:bg-[var(--interactive-hover)] hover:text-texto'
      )}
    >
      <Icon de={grupo.icone} tamanho="m" />
      <span className="sr-only">{grupo.rotulo}</span>
      {pendentes > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ouro"
        />
      )}
      {/* Nome ao passar: o trilho só tem ícone, e ícone sozinho não se lê */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-controle sup-alta !rounded-controle px-2.5 py-1 text-sm text-texto opacity-0 transition-opacity duration-[var(--t-resposta)] group-hover:opacity-100 group-focus-visible:opacity-100 z-menu"
      >
        {grupo.rotulo}
      </span>
    </button>
  );
}

function BotaoBarra({
  rotulo,
  icone,
  ativo,
  pendentes,
  onClick,
}: {
  rotulo: string;
  icone: GrupoNav['icone'];
  ativo: boolean;
  pendentes?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={ativo ? 'true' : undefined}
      className={cx(
        'relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.8125rem]',
        ativo ? 'text-ouro-texto' : 'text-texto-fraco'
      )}
    >
      <Icon de={icone} tamanho="m" />
      {rotulo}
      {pendentes && (
        <span
          aria-hidden="true"
          className="absolute right-[30%] top-2 h-1.5 w-1.5 rounded-full bg-ouro"
        />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// O painel como fila de trabalho.
// ---------------------------------------------------------------------------

function PainelB({ ir }: { ir: (id: string) => void }) {
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Stack gap={8}>
        <Stack gap={1}>
          <Text papel="subtitulo" as="h1">
            Hoje
          </Text>
          <Text papel="rotulo" tom="suave" as="p">
            {TOTAL_PENDENTES} itens esperam alguém. Os dois em destaque não
            deveriam esperar mais.
          </Text>
        </Stack>

        <section aria-labelledby="b-fila">
          <h2 id="b-fila" className="sr-only">
            A fazer
          </h2>
          <ul className="flex flex-col gap-2">
            {ATENCAO.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-3 rounded-card bg-sup-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-5"
              >
                <span
                  className={cx(
                    't-dado w-14 shrink-0 text-[2rem] leading-none',
                    a.urgente ? 'text-atencao' : 'text-texto'
                  )}
                >
                  {a.n}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[0.9375rem] font-medium">
                    {a.curto}
                  </span>
                  <span className="t-legenda">{a.detalhe}</span>
                </span>
                <Button
                  tamanho="p"
                  variante={a.id === 'fila' ? 'primario' : 'secundario'}
                  onClick={() => ir(a.id)}
                >
                  {a.acao}
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="b-atividade" className="flex flex-col gap-3">
          <Inline extremos>
            <Text papel="secao" as="h2" id="b-atividade">
              O que aconteceu
            </Text>
            <Button
              variante="texto"
              tamanho="p"
              onClick={() => ir('auditoria')}
            >
              Auditoria
            </Button>
          </Inline>
          <ol className="relative flex flex-col">
            {ATIVIDADE.map((a) => (
              <li
                key={a.id}
                className="grid grid-cols-[88px_1fr] gap-4 py-2.5 max-sm:grid-cols-1 max-sm:gap-0.5"
              >
                <span className="t-legenda t-dado">{a.quando}</span>
                <span className="t-rotulo text-texto-suave">
                  <span className="font-medium text-texto">{a.quem}</span>{' '}
                  {a.oque} <span className="text-texto">{a.alvo}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </Stack>

      {/* Pulso: consulta rápida, sempre à direita no computador */}
      <aside
        aria-label="Pulso da plataforma"
        className="flex flex-col gap-6 xl:sticky xl:top-8 xl:self-start"
      >
        <section className="sup-1 flex flex-col gap-4 p-5">
          <Text papel="secao" as="h2">
            Semana
          </Text>
          <dl className="flex flex-col">
            {NUMEROS.map((n) => (
              <div
                key={n.id}
                className="flex items-baseline gap-3 border-b border-linha py-2 last:border-0"
              >
                <dt className="t-rotulo flex-1 text-texto-suave">{n.rotulo}</dt>
                <dd className="flex flex-col items-end">
                  <span className="t-dado text-texto">{formatar(n.valor)}</span>
                  <span className="t-legenda">{n.variacao}</span>
                </dd>
              </div>
            ))}
          </dl>
          <Barras
            dados={ANOTACOES_14_DIAS}
            altura={72}
            rotulo="Anotações por dia"
          />
        </section>

        <section className="flex flex-col gap-2 px-1">
          <Text papel="secao" as="h2">
            Sistema
          </Text>
          <ul className="flex flex-col">
            {SISTEMA.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-2">
                <Estado estado={s.estado} />
                <span className="t-rotulo flex-1">{s.rotulo}</span>
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
        </section>
      </aside>
    </div>
  );
}
