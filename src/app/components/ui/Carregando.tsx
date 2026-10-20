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

/**
 * O perfil (`ProfileView`): a lista das cinco seções numa coluna de 11rem
 * (uma faixa no telefone) e, ao lado, as seções empilhadas — a primeira, dos
 * dados pessoais, com a foto e os campos.
 */
export function EsqueletoPerfil() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[11rem_minmax(0,1fr)]">
      <div className="flex gap-1 overflow-hidden md:flex-col">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton
            key={i}
            forma="bloco"
            className="h-10 w-28 shrink-0 md:w-full"
          />
        ))}
      </div>
      <Stack gap={6}>
        <Card nivel={2}>
          <Stack gap={6}>
            <Skeleton forma="bloco" className="h-6 w-48" />
            <Inline gap={4}>
              <Skeleton forma="circulo" className="h-20 w-20 shrink-0" />
              <Skeleton forma="bloco" className="h-10 w-36" />
            </Inline>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <Stack key={i} gap={2}>
                  <Skeleton className="w-28" />
                  <Skeleton forma="bloco" className="h-11 w-full" />
                </Stack>
              ))}
            </div>
            <Skeleton forma="bloco" className="ml-auto h-11 w-40" />
          </Stack>
        </Card>
        <Card nivel={2}>
          <Stack gap={4}>
            <Skeleton forma="bloco" className="h-6 w-40" />
            <Skeleton forma="bloco" className="h-12 w-full" />
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}

/** O seletor de páginas irmãs (documentos legais, páginas de ajuda). */
function Seletor({ quantos }: { quantos: number }) {
  return (
    <Inline gap={2}>
      {Array.from({ length: quantos }, (_, i) => (
        <Skeleton
          key={i}
          forma="bloco"
          className={cx('h-9 rounded-full', i === 0 ? 'w-32' : 'w-28')}
        />
      ))}
    </Inline>
  );
}

/**
 * Documento de leitura (Termos, Privacidade, Direitos Autorais): o seletor,
 * o índice ao lado, o título, "O essencial" e as primeiras cláusulas.
 */
export function EsqueletoDocumento() {
  return (
    <>
      <Seletor quantos={3} />
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        <Stack gap={3} className="hidden lg:flex">
          <Skeleton className="mb-2 w-24" />
          {Array.from({ length: 9 }, (_, i) => (
            <Skeleton key={i} className={i % 3 === 0 ? 'w-40' : 'w-32'} />
          ))}
        </Stack>
        <Stack gap={8} className="max-w-[var(--largura-texto)]">
          <Stack gap={4}>
            <Skeleton forma="bloco" className="h-12 w-72 max-w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[70%]" />
          </Stack>
          <Skeleton forma="bloco" className="h-56 w-full rounded-card" />
          {Array.from({ length: 2 }, (_, i) => (
            <Stack key={i} gap={3}>
              <Skeleton forma="bloco" className="h-7 w-64 max-w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[55%]" />
            </Stack>
          ))}
        </Stack>
      </div>
    </>
  );
}

/** Página de ajuda (Como usar, FAQ, Suporte): título, busca e grupos de itens. */
export function EsqueletoCentral() {
  return (
    <>
      <Seletor quantos={3} />
      <Stack gap={4} className="max-w-[var(--largura-texto)]">
        <Skeleton forma="bloco" className="h-12 w-80 max-w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </Stack>
      <Skeleton
        forma="bloco"
        className="h-12 w-full max-w-[var(--largura-texto)]"
      />
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        <Stack gap={3} className="hidden lg:flex">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="w-36" />
          ))}
        </Stack>
        <Stack gap={12} className="max-w-[var(--largura-texto)]">
          {Array.from({ length: 2 }, (_, g) => (
            <Stack key={g} gap={4}>
              <Skeleton forma="bloco" className="h-7 w-56" />
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} forma="bloco" className="h-14 w-full" />
              ))}
            </Stack>
          ))}
        </Stack>
      </div>
    </>
  );
}

/**
 * A abertura editorial (Sobre, Planos): a trilha, o título grande alinhado à
 * esquerda em duas ou três linhas, o parágrafo de abertura e, com `acoes`,
 * os dois botões. Mesmos respiros das páginas, para o conteúdo não pular.
 */
export function EsqueletoAbertura({
  linhas = 2,
  acoes = false,
}: {
  linhas?: 1 | 2 | 3;
  acoes?: boolean;
}) {
  return (
    <Stack gap={8} className="pt-10 md:pt-20">
      <Skeleton className="h-3.5 w-32" />
      <Stack gap={3}>
        {Array.from({ length: linhas }, (_, i) => (
          <Skeleton
            key={i}
            forma="bloco"
            className={cx(
              'h-11 max-w-full md:h-16',
              i === linhas - 1 ? 'w-[26rem]' : 'w-[44rem]'
            )}
          />
        ))}
      </Stack>
      <Stack gap={3} className="w-full">
        <Skeleton className="h-4 w-[38rem] max-w-full" />
        <Skeleton className="h-4 w-[30rem] max-w-[85%]" />
      </Stack>
      {acoes && (
        <Inline quebra gap={3}>
          <Skeleton forma="bloco" className="h-11 w-52" />
          <Skeleton forma="bloco" className="h-11 w-44" />
        </Inline>
      )}
    </Stack>
  );
}

/** Entradas de índice: nome à esquerda, texto à direita, divisória entre elas. */
export function EsqueletoVerbetes({ quantos = 3 }: { quantos?: number }) {
  return (
    <div className="mt-16 md:mt-28">
      <Skeleton forma="bloco" className="h-9 w-80 max-w-full" />
      <div className="mt-8 md:mt-12">
        {Array.from({ length: quantos }, (_, i) => (
          <div
            key={i}
            className="grid gap-5 border-t border-linha py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 md:py-14"
          >
            <Stack gap={3}>
              <Skeleton forma="bloco" className="h-9 w-56" />
              <Skeleton className="h-3.5 w-32" />
            </Stack>
            <Stack gap={3}>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[92%]" />
              <Skeleton className="h-4 w-[70%]" />
            </Stack>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A página de planos: o seletor de período e os dois grupos de dois planos. */
export function EsqueletoPlanos() {
  return (
    <Stack gap={8}>
      <Skeleton forma="bloco" className="h-[3.25rem] w-64 rounded-full" />
      <div className="grid gap-12 xl:grid-cols-2 xl:gap-8">
        {[0, 1].map((g) => (
          <Stack key={g} gap={6}>
            <Stack gap={3}>
              <Skeleton forma="bloco" className="h-8 w-48" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </Stack>
            <div className="grid overflow-hidden rounded-card bg-sup-2 md:grid-cols-2">
              {[0, 1].map((p) => (
                <Stack key={p} gap={6} className="p-7 md:p-9">
                  <Skeleton forma="bloco" className="h-8 w-28" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton forma="bloco" className="h-12 w-36" />
                  <Skeleton forma="bloco" className="h-11 w-full" />
                  <Stack gap={3}>
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[75%]" />
                    <Skeleton className="h-4 w-[82%]" />
                  </Stack>
                </Stack>
              ))}
            </div>
          </Stack>
        ))}
      </div>
    </Stack>
  );
}
