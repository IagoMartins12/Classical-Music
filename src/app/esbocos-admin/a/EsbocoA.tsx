'use client';

import { useEffect, useState } from 'react';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiArrowSquareOut,
  PiArrowsClockwise,
  PiCaretDown,
  PiList,
  PiSignOut,
  PiWarning,
} from 'react-icons/pi';
import LocalizedLink from '@/app/components/LocalizedLink';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
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
import { BotaoIrPara, Paleta, usePaleta } from '../paleta';

/**
 * Esboço A — Índice lateral.
 *
 * A casca que o ROADMAP já prevê para o painel ("janela inteira, lateral
 * fixa"): uma coluna à esquerda com os nove assuntos, sempre à vista, e o
 * conteúdo ocupando o resto da janela. É o formato mais previsível dos três —
 * quem já usou qualquer painel sabe onde está.
 */

export function EsbocoA() {
  const [vista, setVista] = useState('painel');
  const [menu, setMenu] = useState(false);
  const paleta = usePaleta();
  const { grupo, item } = acharItem(vista);

  const ir = (id: string) => {
    setVista(id);
    setMenu(false);
  };

  // `?vista=obras` abre direto numa tela: dá para mandar o link de uma delas.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('vista');
    if (v) ir(v);
  }, []);

  return (
    <div className="flex min-h-dvh bg-fundo text-texto">
      {/* Lateral fixa no computador */}
      <aside className="sticky top-0 hidden h-dvh w-[272px] shrink-0 flex-col border-r border-linha fundo-sup-2 lg:flex">
        <Lateral vista={vista} ir={ir} abrirPaleta={paleta.abrir} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra do conteúdo: onde estou */}
        <header className="sticky top-0 z-barra flex min-h-14 items-center gap-3 border-b border-linha bg-fundo px-4 sm:px-6 lg:px-10">
          <Button
            variante="fantasma"
            tamanho="p"
            icone={PiList}
            rotulo="Abrir menu"
            onClick={() => setMenu(true)}
            className="lg:hidden"
          />
          <nav
            aria-label="Você está em"
            className="t-rotulo flex min-w-0 items-center gap-2"
          >
            <span className="text-texto-fraco">{grupo.rotulo}</span>
            <span className="text-texto-fraco" aria-hidden="true">
              /
            </span>
            <span className="truncate font-medium text-texto">
              {item.rotulo}
            </span>
          </nav>
          <span className="ml-auto t-legenda max-sm:hidden">
            terça, 29 de setembro
          </span>
        </header>

        <main className="w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
          {vista === 'painel' ? (
            <PainelA ir={ir} />
          ) : vista === 'obras' ? (
            <ModuloObras />
          ) : (
            <ModuloAindaNao grupo={grupo} item={item} />
          )}
        </main>
      </div>

      {/* Telefone e tablet: a mesma lateral, numa folha */}
      <Sheet
        aberto={menu}
        aoFechar={() => setMenu(false)}
        titulo="Painel"
        largura="p"
      >
        <Lateral
          vista={vista}
          ir={ir}
          abrirPaleta={() => {
            setMenu(false);
            paleta.abrir();
          }}
          naFolha
        />
      </Sheet>

      <Paleta aberta={paleta.aberta} aoFechar={paleta.fechar} aoEscolher={ir} />
      <TrocaDeEsboco atual="a" />
    </div>
  );
}

function Lateral({
  vista,
  ir,
  abrirPaleta,
  naFolha = false,
}: {
  vista: string;
  ir: (id: string) => void;
  abrirPaleta: () => void;
  naFolha?: boolean;
}) {
  const grupoAtivo = acharItem(vista).grupo.id;
  const [abertos, setAbertos] = useState<string[]>([
    'geral',
    'moderacao',
    'catalogo',
  ]);
  const alternar = (id: string) =>
    setAbertos((a) =>
      a.includes(id) ? a.filter((x) => x !== id) : [...a, id]
    );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!naFolha && (
        <div className="flex items-center gap-2.5 px-5 pb-4 pt-5">
          <GiGrandPiano
            className="h-7 w-7 text-ouro-texto"
            aria-hidden="true"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg">Opus Atlas</span>
            <span className="t-legenda">Painel administrativo</span>
          </span>
        </div>
      )}

      <div className={cx('pb-3', naFolha ? 'px-0' : 'px-4')}>
        <BotaoIrPara onClick={abrirPaleta} />
      </div>

      <nav
        aria-label="Painel"
        className={cx(
          'classical-scrollbar-mini flex-1 overflow-y-auto pb-4',
          naFolha ? 'px-0' : 'px-3'
        )}
      >
        <ul className="flex flex-col gap-1">
          {NAVEGACAO.map((g) => {
            const aberto = abertos.includes(g.id) || g.id === grupoAtivo;
            const pendentes = g.itens.reduce(
              (s, i) => s + (i.pendentes ?? 0),
              0
            );
            const soUm = g.itens.length === 1;

            if (soUm) {
              const i = g.itens[0];
              return (
                <li key={g.id}>
                  <ItemLateral ativo={vista === i.id} onClick={() => ir(i.id)}>
                    <Icon de={g.icone} className="text-texto-fraco" />
                    {i.rotulo}
                  </ItemLateral>
                </li>
              );
            }

            return (
              <li key={g.id}>
                <button
                  type="button"
                  aria-expanded={aberto}
                  onClick={() => alternar(g.id)}
                  className="flex min-h-9 w-full items-center gap-3 rounded-controle px-3 text-left text-sm text-texto-suave hover:text-texto [@media(pointer:coarse)]:min-h-[var(--alvo)]"
                >
                  <Icon de={g.icone} className="text-texto-fraco" />
                  <span className="flex-1">{g.rotulo}</span>
                  {!aberto && <Pendentes n={pendentes} />}
                  <Icon
                    de={PiCaretDown}
                    tamanho="pp"
                    className={cx(
                      'text-texto-fraco transition-transform duration-[var(--t-resposta)] ease-saida',
                      !aberto && '-rotate-90'
                    )}
                  />
                </button>
                {aberto && (
                  <ul className="flex flex-col pb-2 pl-7">
                    {g.itens.map((i) => (
                      <li key={i.id}>
                        <ItemLateral
                          ativo={vista === i.id}
                          onClick={() => ir(i.id)}
                        >
                          <span
                            className={cx(
                              'flex-1',
                              i.semPagina && 'text-texto-fraco'
                            )}
                          >
                            {i.rotulo}
                          </span>
                          <Pendentes n={i.pendentes} forte />
                        </ItemLateral>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Conta: quem está usando, voltar ao site, tema, sair */}
      <div
        className={cx(
          'flex items-center gap-3 border-t border-linha py-3',
          naFolha ? 'px-0' : 'px-4'
        )}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full tint-ouro font-medium text-ouro-na-tinta">
          I
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-medium">Iago Martins</span>
          <LocalizedLink
            href="/"
            className="t-legenda inline-flex items-center gap-1 hover:text-texto"
          >
            Ver o site <Icon de={PiArrowSquareOut} tamanho="pp" />
          </LocalizedLink>
        </span>
        <ThemeToggle variant="compact" />
        <Button
          variante="fantasma"
          tamanho="p"
          icone={PiSignOut}
          rotulo="Sair"
        />
      </div>
    </div>
  );
}

function ItemLateral({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-current={ativo ? 'page' : undefined}
      onClick={onClick}
      className={cx(
        'flex min-h-9 w-full items-center gap-3 rounded-controle px-3 text-left text-sm',
        'transition-colors duration-[var(--t-toque)] ease-saida [@media(pointer:coarse)]:min-h-[var(--alvo)]',
        ativo
          ? 'fundo-sup-1 font-medium text-texto shadow-[var(--sombra-1)]'
          : 'text-texto-suave hover:bg-[var(--interactive-hover)] hover:text-texto'
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// O painel: uma mesa de trabalho. Em cima, o que pede alguém; ao lado, se a
// casa está de pé; embaixo, os números para quem quer ler a semana.
// ---------------------------------------------------------------------------

function PainelA({ ir }: { ir: (id: string) => void }) {
  return (
    <Stack gap={8}>
      <Inline extremos quebra gap={4} alinhar="fim">
        <Stack gap={1}>
          <Text papel="subtitulo" as="h1">
            Painel
          </Text>
          <Text papel="legenda" as="p">
            Atualizado há 2 min
          </Text>
        </Stack>
        <Button tamanho="p" variante="fantasma" icone={PiArrowsClockwise}>
          Atualizar
        </Button>
      </Inline>

      {/* Números: uma superfície, seis células. Nada de card por número. */}
      <dl className="sup-1 grid grid-cols-2 overflow-hidden p-0 sm:grid-cols-3 xl:grid-cols-6">
        {NUMEROS.map((n, i) => (
          <div
            key={n.id}
            className={cx(
              'flex flex-col gap-1 px-5 py-4',
              'border-linha max-sm:[&:nth-child(n+3)]:border-t sm:max-xl:[&:nth-child(n+4)]:border-t',
              i % 2 === 1 && 'max-sm:border-l',
              i % 3 !== 0 && 'sm:max-xl:border-l',
              i > 0 && 'xl:border-l'
            )}
          >
            <dt className="t-legenda">{n.rotulo}</dt>
            <dd className="t-dado text-[1.5rem] leading-tight text-texto">
              {formatar(n.valor)}
            </dd>
            <dd className="t-legenda">{n.variacao}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-8 xl:grid-cols-[3fr_2fr]">
        <section aria-labelledby="a-atencao" className="flex flex-col gap-3">
          <Text papel="secao" as="h2" id="a-atencao">
            Pede atenção
          </Text>
          <Row.Lista>
            {ATENCAO.map((a) => (
              <Row
                key={a.id}
                antes={
                  <span className="grid h-8 w-8 shrink-0 place-items-center">
                    {a.urgente ? (
                      <Icon
                        de={PiWarning}
                        tamanho="m"
                        className="text-atencao"
                        rotulo="Urgente"
                      />
                    ) : (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-texto-fraco"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                }
                titulo={a.titulo}
                detalhe={a.detalhe}
                depois={
                  <Button variante="texto" tamanho="p" onClick={() => ir(a.id)}>
                    {a.acao}
                  </Button>
                }
              />
            ))}
          </Row.Lista>
        </section>

        <section aria-labelledby="a-sistema" className="flex flex-col gap-3">
          <Inline extremos>
            <Text papel="secao" as="h2" id="a-sistema">
              Sistema
            </Text>
            <Button variante="texto" tamanho="p" onClick={() => ir('saude')}>
              Ver saúde
            </Button>
          </Inline>
          <Row.Lista>
            {SISTEMA.map((s) => (
              <Row
                key={s.id}
                antes={
                  <span className="grid h-8 w-8 place-items-center">
                    <Estado estado={s.estado} />
                  </span>
                }
                titulo={s.rotulo}
                detalhe={s.detalhe}
                valor={s.valor}
              />
            ))}
          </Row.Lista>
        </section>
      </div>

      <div className="grid gap-8 xl:grid-cols-[3fr_2fr]">
        <section
          aria-labelledby="a-anotacoes"
          className="sup-1 flex flex-col gap-4 p-5 md:p-6"
        >
          <Inline extremos alinhar="base">
            <Text papel="secao" as="h2" id="a-anotacoes">
              Anotações por dia
            </Text>
            <Text papel="legenda" as="span">
              últimos 14 dias
            </Text>
          </Inline>
          <Barras
            dados={ANOTACOES_14_DIAS}
            altura={160}
            rotulo="Anotações por dia"
          />
        </section>

        <section aria-labelledby="a-atividade" className="flex flex-col gap-3">
          <Inline extremos>
            <Text papel="secao" as="h2" id="a-atividade">
              Atividade
            </Text>
            <Button
              variante="texto"
              tamanho="p"
              onClick={() => ir('auditoria')}
            >
              Auditoria completa
            </Button>
          </Inline>
          <ul className="flex flex-col">
            {ATIVIDADE.map((a) => (
              <li
                key={a.id}
                className="flex gap-3 border-b border-linha py-2.5 last:border-0"
              >
                <span className="t-rotulo min-w-0 flex-1 text-texto-suave">
                  <span className="font-medium text-texto">{a.quem}</span>{' '}
                  {a.oque} <span className="text-texto">{a.alvo}</span>
                </span>
                <span className="t-legenda t-dado shrink-0">{a.quando}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Stack>
  );
}
