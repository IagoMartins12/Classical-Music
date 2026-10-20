'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PiCheck,
  PiDownloadSimple,
  PiMagnifyingGlass,
  PiPencilSimple,
  PiWarning,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Badge, Chip } from '@/app/components/ui/Badge';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import {
  FILTROS_OBRAS,
  OBRAS,
  formatar,
  type GrupoNav,
  type ItemNav,
} from './dados';

/**
 * Peças comuns aos três esboços. O que muda entre eles é a casca e a
 * composição do painel; o vocabulário (barras, estado, tabela) é um só,
 * como seria no painel de verdade.
 */

// ---------------------------------------------------------------------------
// Barras: uma série, ouro. O último dia (hoje) em ouro cheio, os outros no
// ouro a meia força — a única ênfase do gráfico.
// ---------------------------------------------------------------------------

export function Barras({
  dados,
  altura = 120,
  rotulo,
}: {
  dados: { dia: string; valor: number }[];
  altura?: number;
  rotulo: string;
}) {
  const maximo = Math.max(...dados.map((d) => d.valor));
  const media = Math.round(
    dados.reduce((s, d) => s + d.valor, 0) / dados.length
  );

  return (
    <figure className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={`${rotulo}: de ${dados[0].valor} a ${dados[dados.length - 1].valor}, média de ${media} por dia`}
        className="relative flex items-end gap-[3px]"
        style={{ height: altura }}
      >
        {/* Linha da média: dá escala sem eixo. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 border-t border-dashed border-linha-forte"
          style={{ bottom: (media / maximo) * altura }}
        />
        {dados.map((d, i) => (
          <span
            key={d.dia}
            title={`${d.dia}: ${d.valor}`}
            className={cx(
              'flex-1 rounded-t-[3px]',
              i === dados.length - 1 ? 'bg-ouro' : 'bg-ouro/35'
            )}
            style={{ height: `${(d.valor / maximo) * 100}%` }}
          />
        ))}
      </div>
      <figcaption className="flex justify-between t-legenda t-dado">
        <span>{dados[0].dia}</span>
        <span>média {media}/dia</span>
        <span>hoje</span>
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Estado de sistema: sem ponto verde. "Ok" é o normal e não pede cor; só o
// que precisa de alguém ganha o tom de atenção (cor de estado no momento
// específico, Decisões do produto).
// ---------------------------------------------------------------------------

export function Estado({ estado }: { estado: 'ok' | 'atencao' }) {
  return estado === 'ok' ? (
    <Icon
      de={PiCheck}
      tamanho="p"
      rotulo="Normal"
      className="text-texto-fraco"
    />
  ) : (
    <Icon
      de={PiWarning}
      tamanho="p"
      rotulo="Pede atenção"
      className="text-atencao"
    />
  );
}

/** Contagem de pendência na navegação: número, sem bolha colorida. */
export function Pendentes({
  n,
  forte = false,
}: {
  n?: number;
  forte?: boolean;
}) {
  if (!n) return null;
  return (
    <span
      className={cx(
        't-dado ml-auto min-w-6 rounded-full px-1.5 text-center text-xs leading-5',
        forte ? 'tint-ouro text-ouro-na-tinta' : 'text-texto-fraco'
      )}
    >
      {n}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Módulo de exemplo: Obras. Tabela de verdade no computador; no telefone cada
// linha vira bloco (sem rolagem lateral).
// ---------------------------------------------------------------------------

export function ModuloObras({ titulo = 'Obras' }: { titulo?: string }) {
  const [filtro, setFiltro] = useState('todas');
  const [marcadas, setMarcadas] = useState<string[]>([]);

  const alternar = (id: string) =>
    setMarcadas((m) =>
      m.includes(id) ? m.filter((x) => x !== id) : [...m, id]
    );

  return (
    <Stack gap={6}>
      <Inline extremos quebra gap={4} alinhar="fim">
        <Stack gap={1}>
          <Text papel="subtitulo" as="h1">
            {titulo}
          </Text>
          <Text papel="legenda" as="p">
            <span className="t-dado">{formatar(207_890)}</span> no catálogo ·{' '}
            <span className="t-dado">{formatar(19_478)}</span> verificadas
          </Text>
        </Stack>
        <Inline gap={2}>
          <Button tamanho="p" icone={PiDownloadSimple}>
            Exportar
          </Button>
        </Inline>
      </Inline>

      <Stack gap={3}>
        <label className="relative block max-w-md">
          <span className="sr-only">Buscar obra, compositor ou catálogo</span>
          <Icon
            de={PiMagnifyingGlass}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-texto-fraco"
          />
          <input
            type="search"
            placeholder="Buscar obra, compositor ou catálogo"
            className="input-classical w-full !pl-11"
          />
        </label>
        <Inline gap={2} quebra>
          {FILTROS_OBRAS.map((f) => (
            <Chip
              key={f.id}
              selecionado={filtro === f.id}
              onClick={() => setFiltro(f.id)}
            >
              {f.rotulo}
              <span className="t-dado ml-2 text-xs opacity-70">
                {formatar(f.total)}
              </span>
            </Chip>
          ))}
        </Inline>
      </Stack>

      {marcadas.length > 0 && (
        <Inline
          extremos
          quebra
          className="sticky top-2 z-elevado rounded-controle bg-sup-2 px-4 py-2 shadow-[var(--sombra-1)]"
        >
          <Text papel="rotulo">
            <span className="t-dado">{marcadas.length}</span>{' '}
            {marcadas.length === 1 ? 'obra selecionada' : 'obras selecionadas'}
          </Text>
          <Inline gap={2}>
            <Button
              tamanho="p"
              variante="fantasma"
              onClick={() => setMarcadas([])}
            >
              Limpar
            </Button>
            <Button tamanho="p" variante="primario">
              Verificar
            </Button>
          </Inline>
        </Inline>
      )}

      <div className="sup-1 overflow-hidden p-0">
        <table className="w-full border-collapse text-left max-md:block">
          <thead className="max-md:hidden">
            <tr className="t-legenda">
              <th className="w-10 py-3 pl-4 font-normal">
                <span className="sr-only">Selecionar</span>
              </th>
              <th className="py-3 pr-4 font-normal">Obra</th>
              <th className="py-3 pr-4 font-normal">Catálogo</th>
              <th className="py-3 pr-4 font-normal">Ano</th>
              <th className="py-3 pr-4 text-right font-normal">Partituras</th>
              <th className="py-3 pr-4 text-right font-normal">Favoritos</th>
              <th className="py-3 pr-4 font-normal">Estado</th>
              <th className="py-3 pr-4">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="max-md:block">
            {OBRAS.map((o) => {
              const marcada = marcadas.includes(o.id);
              return (
                <tr
                  key={o.id}
                  className={cx(
                    'border-t border-linha transition-colors duration-[var(--t-resposta)] ease-saida',
                    'max-md:grid max-md:grid-cols-[auto_1fr_auto] max-md:gap-x-3 max-md:gap-y-1 max-md:px-4 max-md:py-3',
                    marcada
                      ? 'bg-[var(--interactive-hover)]'
                      : 'hover:bg-[var(--interactive-hover)]'
                  )}
                >
                  <td className="py-3 pl-4 align-middle max-md:row-span-3 max-md:p-0 max-md:pt-1">
                    <input
                      type="checkbox"
                      checked={marcada}
                      onChange={() => alternar(o.id)}
                      aria-label={`Selecionar ${o.titulo}`}
                      className="h-4 w-4 accent-[var(--ouro)]"
                    />
                  </td>
                  <td className="py-3 pr-4 max-md:p-0">
                    <span className="flex items-center gap-1.5 font-display text-[1.0625rem] leading-snug text-texto">
                      {o.titulo}
                      {o.verificada && (
                        <SeloVerificada className="h-4 w-4 shrink-0 text-verificado" />
                      )}
                    </span>
                    <span className="t-legenda">{o.compositor}</span>
                  </td>
                  <td className="t-dado py-3 pr-4 text-sm text-texto-suave max-md:col-start-2 max-md:p-0 max-md:text-xs">
                    {o.catalogo}
                    <span className="md:hidden"> · {o.ano}</span>
                  </td>
                  <td className="t-dado py-3 pr-4 text-sm text-texto-suave max-md:hidden">
                    {o.ano}
                  </td>
                  <td className="t-dado py-3 pr-4 text-right text-sm max-md:hidden">
                    {o.partituras}
                  </td>
                  <td className="t-dado py-3 pr-4 text-right text-sm max-md:hidden">
                    {formatar(o.favoritos)}
                  </td>
                  <td className="py-3 pr-4 max-md:col-start-2 max-md:p-0">
                    {o.pendente ? (
                      <Badge estado="ouro">Envio pendente</Badge>
                    ) : (
                      <span className="t-legenda max-md:hidden">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-2 text-right max-md:col-start-3 max-md:row-start-1 max-md:p-0">
                    <Button
                      tamanho="p"
                      variante="fantasma"
                      icone={PiPencilSimple}
                      rotulo={`Editar ${o.titulo}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Inline extremos className="border-t border-linha px-4 py-3">
          <Text papel="legenda" as="p">
            1–8 de <span className="t-dado">{formatar(207_890)}</span>
          </Text>
          <Inline gap={2}>
            <Button tamanho="p" variante="fantasma" disabled>
              Anterior
            </Button>
            <Button tamanho="p" variante="fantasma">
              Próxima
            </Button>
          </Inline>
        </Inline>
      </div>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Qualquer outro módulo: o esboço mostra onde ele mora, não o conteúdo — cada
// um é redesenhado na passagem módulo a módulo.
// ---------------------------------------------------------------------------

export function ModuloAindaNao({
  grupo,
  item,
}: {
  grupo: GrupoNav;
  item: ItemNav;
}) {
  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <Text papel="subtitulo" as="h1">
          {item.rotulo}
        </Text>
        <Text papel="legenda" as="p">
          {grupo.rotulo} · <span className="t-dado">{item.rota}</span>
        </Text>
      </Stack>
      <div className="rounded-card bg-sup-2 p-6">
        <Stack gap={3} className="medida-texto">
          <Text papel="corpo">{item.resumo}.</Text>
          <Text papel="rotulo" tom="suave" as="p">
            {item.semPagina
              ? 'O painel de hoje aponta para este endereço, mas a página não existe. Fica no menu para decidirmos se ela nasce ou sai.'
              : 'O conteúdo deste módulo entra na passagem módulo a módulo. O esboço mostra só onde ele mora; abra Painel ou Obras para ver a composição.'}
          </Text>
        </Stack>
      </div>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Troca entre esboços. Ferramenta de quem compara, não parte da proposta.
// ---------------------------------------------------------------------------

export function TrocaDeEsboco({ atual }: { atual: 'a' | 'b' | 'c' }) {
  return (
    <nav
      aria-label="Trocar de esboço"
      className="fixed bottom-4 right-4 z-aviso flex items-center gap-1 rounded-full sup-alta !rounded-full p-1 text-sm max-lg:bottom-20"
    >
      <Link
        href="/esbocos-admin"
        className="px-3 py-1.5 text-texto-fraco hover:text-texto"
      >
        Esboços
      </Link>
      {(['a', 'b', 'c'] as const).map((e) => (
        <Link
          key={e}
          href={`/esbocos-admin/${e}`}
          aria-current={e === atual ? 'page' : undefined}
          className={cx(
            'grid h-8 w-8 place-items-center rounded-full font-medium uppercase',
            e === atual
              ? 'fill-ouro text-sobre-ouro'
              : 'text-texto-suave hover:text-texto'
          )}
        >
          {e}
        </Link>
      ))}
    </nav>
  );
}
