import type { ReactNode } from 'react';
import { Card } from './Card';
import { cx } from './cx';
import { Inline, Stack } from './Layout';
import { AreaCarregando, Skeleton } from './Skeleton';

/**
 * As telas de carregamento, montadas com as peças do sistema.
 *
 * Havia 39 `loading.tsx` desenhados à mão — 11 mil linhas, 38 delas
 * `'use client'`, com blocos pulsando em loop, bolhas desfocadas, notas
 * voando e ícones de verdade dentro do esqueleto. Aqui ficam seis formas de
 * página (listagem, detalhe, formulário, painel, calendário, leitura), e cada
 * `loading.tsx` só escolhe a sua. Nada disto roda no navegador.
 *
 * **O que um esqueleto promete:** a forma da página que vai chegar, no mesmo
 * contêiner, para nada pular quando o conteúdo entra. Só superfície — nenhuma
 * cor, nenhum ícone, nenhuma animação além do brilho do `.loading-skeleton`,
 * que para com `prefers-reduced-motion`.
 */

/** A página: contêiner de seção e o anúncio para leitor de tela. */
export function EsqueletoPagina({
  rotulo = 'Carregando',
  children,
}: {
  rotulo?: string;
  children: ReactNode;
}) {
  return (
    <AreaCarregando rotulo={rotulo}>
      <div className="section-wrap">
        <Stack gap={8}>{children}</Stack>
      </div>
    </AreaCarregando>
  );
}

/** Título e linha de apoio; com `acao`, o botão principal à direita. */
export function EsqueletoCabecalho({
  centro = false,
  acao = false,
}: {
  centro?: boolean;
  acao?: boolean;
}) {
  if (centro) {
    return (
      <Stack gap={3} alinhar="centro" className="py-8">
        <Skeleton forma="bloco" className="h-10 w-80 max-w-full" />
        <Skeleton className="h-4 w-[30rem] max-w-full" />
      </Stack>
    );
  }
  return (
    <Inline extremos quebra gap={4}>
      <Stack gap={3} className="min-w-0 flex-1">
        <Skeleton forma="bloco" className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </Stack>
      {acao && <Skeleton forma="bloco" className="h-11 w-40" />}
    </Inline>
  );
}

const COLUNAS_NUMEROS = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
} as const;

/** A fileira de números do topo (total, pendentes, concluídas…). */
export function EsqueletoNumeros({ quantos = 4 }: { quantos?: 2 | 3 | 4 }) {
  return (
    <div className={cx('grid gap-4', COLUNAS_NUMEROS[quantos])}>
      {Array.from({ length: quantos }, (_, i) => (
        <Card key={i} densidade="compacta">
          <Stack gap={3}>
            <Skeleton className="w-24" />
            <Skeleton forma="bloco" className="h-7 w-16" />
          </Stack>
        </Card>
      ))}
    </div>
  );
}

/** Busca e filtros. */
export function EsqueletoControles({ filtros = 2 }: { filtros?: number }) {
  return (
    <Card densidade="compacta">
      <Inline quebra gap={3}>
        <Skeleton forma="bloco" className="h-11 min-w-60 flex-1" />
        {Array.from({ length: filtros }, (_, i) => (
          <Skeleton key={i} forma="bloco" className="h-11 w-44" />
        ))}
      </Inline>
    </Card>
  );
}

const COLUNAS_GRADE = {
  1: '',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
} as const;

/** Grade de cards, com o esqueleto do próprio `Card`. */
export function EsqueletoGrade({
  colunas = 3,
  quantos = 6,
}: {
  colunas?: 1 | 2 | 3 | 4;
  quantos?: number;
}) {
  return (
    <div className={cx('grid grid-cols-1 gap-6', COLUNAS_GRADE[colunas])}>
      <Card.Skeleton repetir={quantos} />
    </div>
  );
}

/** Lista de linhas: marcador, duas linhas de texto e um selo. */
export function EsqueletoLista({ quantos = 6 }: { quantos?: number }) {
  return (
    <Stack gap={3}>
      {Array.from({ length: quantos }, (_, i) => (
        <Card key={i} densidade="compacta">
          <Inline gap={4}>
            <Skeleton forma="circulo" className="h-10 w-10 shrink-0" />
            <Stack gap={2} className="min-w-0 flex-1">
              <Skeleton className="h-4 w-[55%]" />
              <Skeleton className="w-[35%]" />
            </Stack>
            <Skeleton forma="bloco" className="hidden h-6 w-20 sm:block" />
          </Inline>
        </Card>
      ))}
    </Stack>
  );
}

/** Um bloco de texto corrido dentro de um card. */
function BlocoDeTexto({ linhas = 4 }: { linhas?: number }) {
  return (
    <Card>
      <Stack gap={4}>
        <Skeleton forma="bloco" className="h-6 w-1/2" />
        <Stack gap={3}>
          {Array.from({ length: linhas }, (_, i) => (
            <Skeleton
              key={i}
              className={i === linhas - 1 ? 'w-[60%]' : 'w-full'}
            />
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

/** Conteúdo em dois terços e coluna lateral. */
export function EsqueletoDetalhe({ blocos = 2 }: { blocos?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Stack gap={6} className="lg:col-span-2">
        {Array.from({ length: blocos }, (_, i) => (
          <BlocoDeTexto key={i} linhas={i === 0 ? 5 : 3} />
        ))}
      </Stack>
      <Stack gap={6}>
        <BlocoDeTexto linhas={3} />
        <Card densidade="compacta">
          <Stack gap={3}>
            <Skeleton forma="bloco" className="h-11 w-full" />
            <Skeleton forma="bloco" className="h-11 w-full" />
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}

/** Seções de formulário: rótulo e campo, em duas colunas. */
export function EsqueletoFormulario({
  secoes = 2,
  campos = 4,
}: {
  secoes?: number;
  campos?: number;
}) {
  return (
    <Stack gap={6}>
      {Array.from({ length: secoes }, (_, s) => (
        <Card key={s}>
          <Stack gap={6}>
            <Skeleton forma="bloco" className="h-6 w-48" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {Array.from({ length: campos }, (_, c) => (
                <Stack key={c} gap={2}>
                  <Skeleton className="w-28" />
                  <Skeleton forma="bloco" className="h-11 w-full" />
                </Stack>
              ))}
            </div>
          </Stack>
        </Card>
      ))}
      <Inline gap={3} className="justify-end">
        <Skeleton forma="bloco" className="h-11 w-28" />
        <Skeleton forma="bloco" className="h-11 w-36" />
      </Inline>
    </Stack>
  );
}

/** Painel inicial: números, a lista principal e a coluna de atalhos. */
export function EsqueletoPainel() {
  return (
    <>
      <EsqueletoNumeros quantos={4} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EsqueletoLista quantos={4} />
        </div>
        <BlocoDeTexto linhas={4} />
      </div>
    </>
  );
}

/** Calendário do mês: navegação, dias da semana e 35 células. */
export function EsqueletoCalendario() {
  return (
    <Card>
      <Stack gap={6}>
        <Inline extremos gap={4}>
          <Skeleton forma="bloco" className="h-7 w-44" />
          <Inline gap={2}>
            <Skeleton forma="bloco" className="h-10 w-10" />
            <Skeleton forma="bloco" className="h-10 w-10" />
          </Inline>
        </Inline>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={`d${i}`} className="mx-auto w-8" />
          ))}
          {Array.from({ length: 35 }, (_, i) => (
            <Skeleton key={i} forma="bloco" className="h-16 sm:h-24" />
          ))}
        </div>
      </Stack>
    </Card>
  );
}

/** Página de leitura: abertura e seções de texto. */
export function EsqueletoLeitura({ secoes = 3 }: { secoes?: number }) {
  return (
    <div className="mx-auto w-full max-w-[var(--largura-texto)]">
      <Stack gap={6}>
        {Array.from({ length: secoes }, (_, i) => (
          <BlocoDeTexto key={i} linhas={i === 0 ? 6 : 4} />
        ))}
      </Stack>
    </div>
  );
}

/** Página de aviso curta (confirmação, descadastro): um card no centro. */
export function EsqueletoAviso() {
  return (
    <div className="mx-auto w-full max-w-md py-16">
      <Card densidade="larga">
        <Stack gap={4} alinhar="centro">
          <Skeleton forma="circulo" className="h-14 w-14" />
          <Skeleton forma="bloco" className="h-6 w-56 max-w-full" />
          <Skeleton className="w-64 max-w-full" />
          <Skeleton forma="bloco" className="mt-2 h-11 w-40" />
        </Stack>
      </Card>
    </div>
  );
}
