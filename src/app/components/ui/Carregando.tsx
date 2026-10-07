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

/**
 * Título e linha de apoio; com `acao`, o botão principal à direita.
 *
 * `centro` é a abertura das páginas públicas (obras, compositores, FAQ,
 * termos…): o ícone, o título grande em serifa e duas linhas de apoio, com o
 * mesmo respiro — assim o conteúdo abaixo nasce na altura em que vai ficar.
 */
export function EsqueletoCabecalho({
  centro = false,
  acao = false,
}: {
  centro?: boolean;
  acao?: boolean;
}) {
  if (centro) {
    return (
      <Stack gap={6} alinhar="centro" className="py-10 md:py-16">
        <Skeleton forma="bloco" className="h-14 w-14 rounded-2xl" />
        <Skeleton forma="bloco" className="h-10 w-[34rem] max-w-full md:h-14" />
        <Stack gap={3} alinhar="centro" className="w-full">
          <Skeleton className="h-4 w-[36rem] max-w-full" />
          <Skeleton className="h-4 w-[24rem] max-w-[80%]" />
        </Stack>
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

/**
 * O card "Busca e Filtros" das listagens: título, campo de busca, os
 * seletores (lado a lado a partir do tablet) e a contagem de resultados.
 */
export function EsqueletoBusca({
  seletores = 0,
  alternarVista = true,
}: {
  seletores?: number;
  alternarVista?: boolean;
}) {
  return (
    <Card>
      <Stack gap={6}>
        <Stack gap={2}>
          <Skeleton forma="bloco" className="h-5 w-36" />
          <Skeleton className="w-60 max-w-full" />
        </Stack>
        <div className="flex flex-col gap-4 md:flex-row">
          <Skeleton forma="bloco" className="h-12 w-full md:flex-1" />
          {Array.from({ length: seletores }, (_, i) => (
            <Skeleton key={i} forma="bloco" className="h-12 w-full md:w-60" />
          ))}
        </div>
        <Inline extremos gap={4}>
          <Skeleton className="w-40" />
          {alternarVista && (
            <Inline gap={2}>
              <Skeleton forma="bloco" className="h-8 w-8" />
              <Skeleton forma="bloco" className="h-8 w-8" />
            </Inline>
          )}
        </Inline>
      </Stack>
    </Card>
  );
}

// As mesmas colunas da `SequentialGrid` com `cols={4}`: o card de verdade
// entra exatamente onde o esqueleto estava.
const GRADE_CATALOGO =
  'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

/** A grade de obras, com a anatomia do `WorkCard`. */
export function EsqueletoObras({ quantos = 8 }: { quantos?: number }) {
  return (
    <div className={GRADE_CATALOGO}>
      {Array.from({ length: quantos }, (_, i) => (
        <Card key={i} densidade="larga" className="flex flex-col">
          <Stack gap={3}>
            <Skeleton className="h-5 w-[80%]" />
            <Skeleton className="w-[45%]" />
          </Stack>
          <div className="my-6 border-t border-linha" />
          <Stack gap={4} className="flex-1">
            <Skeleton className="w-[40%]" />
            <Skeleton className="w-[30%]" />
            <Skeleton className="w-[45%]" />
            <Skeleton className="mt-2 w-20" />
          </Stack>
          <Skeleton forma="bloco" className="mt-6 h-11 w-full" />
        </Card>
      ))}
    </div>
  );
}

/** A grade de compositores, com a anatomia do `ComposerCard`. */
export function EsqueletoCompositores({ quantos = 8 }: { quantos?: number }) {
  return (
    <div className={GRADE_CATALOGO}>
      {Array.from({ length: quantos }, (_, i) => (
        <Card key={i} densidade="larga">
          <Stack gap={4} alinhar="centro">
            <Skeleton forma="circulo" className="h-24 w-24 md:h-28 md:w-28" />
            <Stack gap={3} alinhar="centro" className="w-full">
              <Skeleton forma="bloco" className="h-5 w-32" />
              <Skeleton className="w-28" />
              <Skeleton className="w-24" />
              <Skeleton className="w-20" />
            </Stack>
            <Inline gap={6}>
              <Skeleton className="w-16" />
              <Skeleton className="w-12" />
            </Inline>
            <div className="w-full border-t border-linha pt-4">
              <Skeleton className="mx-auto w-24" />
            </div>
          </Stack>
        </Card>
      ))}
    </div>
  );
}

/**
 * Faixas largas, uma embaixo da outra: o ícone, o título com a linha de
 * apoio e, à direita, um número (instrumentos) ou a seta de abrir (as
 * sanfonas da história da música e da FAQ).
 */
export function EsqueletoFaixas({
  quantos = 6,
  icone = 'pequeno',
  lado = 'seta',
}: {
  quantos?: number;
  icone?: 'grande' | 'pequeno';
  lado?: 'numero' | 'seta';
}) {
  return (
    <Stack gap={icone === 'grande' ? 8 : 6}>
      {Array.from({ length: quantos }, (_, i) => (
        <Card key={i}>
          <Inline gap={icone === 'grande' ? 6 : 4}>
            {icone === 'grande' ? (
              <Skeleton
                forma="bloco"
                className="h-16 w-16 shrink-0 rounded-2xl md:h-20 md:w-20"
              />
            ) : (
              <Skeleton forma="bloco" className="h-6 w-6 shrink-0" />
            )}
            <Stack gap={2} className="min-w-0 flex-1">
              <Skeleton
                forma="bloco"
                className={
                  icone === 'grande' ? 'h-6 w-40' : 'h-5 w-[min(28rem,70%)]'
                }
              />
              <Skeleton className="w-[min(16rem,55%)]" />
              {icone === 'grande' && <Skeleton className="w-20" />}
            </Stack>
            {lado === 'numero' ? (
              <Stack gap={2} alinhar="centro" className="shrink-0">
                <Skeleton forma="bloco" className="h-6 w-16" />
                <Skeleton className="w-10" />
              </Stack>
            ) : (
              <Skeleton className="hidden w-20 shrink-0 sm:block" />
            )}
          </Inline>
        </Card>
      ))}
    </Stack>
  );
}

/** Índice por letra (gêneros): o cabeçalho da letra e a grade de verbetes. */
export function EsqueletoIndice({ letras = 2 }: { letras?: number }) {
  return (
    <Stack gap={6}>
      {Array.from({ length: letras }, (_, l) => (
        <Card key={l}>
          <Stack gap={6}>
            <Inline gap={3}>
              <Skeleton forma="bloco" className="h-6 w-6" />
              <Stack gap={2}>
                <Skeleton forma="bloco" className="h-4 w-16" />
                <Skeleton className="w-20" />
              </Stack>
            </Inline>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: l === 0 ? 14 : 8 }, (_, i) => (
                <Skeleton key={i} forma="bloco" className="h-11 w-full" />
              ))}
            </div>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

/** Fileira de fichas (categorias da FAQ). */
export function EsqueletoFichas({ quantos = 8 }: { quantos?: number }) {
  return (
    <Inline quebra gap={2} className="justify-center">
      {Array.from({ length: quantos }, (_, i) => (
        <Skeleton
          key={i}
          forma="bloco"
          className={cx(
            'h-8',
            i % 3 === 0 ? 'w-24' : i % 3 === 1 ? 'w-20' : 'w-16'
          )}
        />
      ))}
    </Inline>
  );
}

/**
 * A home, a tela inteira: o mosaico de abertura (um destaque grande e dois
 * menores ao lado), os retratos de "Compositores populares", o card do
 * compositor em destaque, as épocas e as últimas adições — a mesma ordem da
 * página, para nada pular quando ela chega.
 */
function TituloDeSecao({ acao = false }: { acao?: boolean }) {
  return (
    <Inline extremos gap={4}>
      <Stack gap={2}>
        <Skeleton forma="bloco" className="h-7 w-64 max-w-full" />
        <Skeleton className="w-72 max-w-full" />
      </Stack>
      {acao && <Skeleton forma="bloco" className="hidden h-10 w-44 sm:block" />}
    </Inline>
  );
}

export function EsqueletoInicio() {
  return (
    <div className="flex min-h-[100svh] flex-col gap-12">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton
          forma="bloco"
          className="h-[60svh] min-h-80 w-full rounded-2xl lg:col-span-2 lg:h-[28rem]"
        />
        <div className="hidden grid-rows-2 gap-4 lg:grid">
          <Skeleton forma="bloco" className="h-full w-full rounded-2xl" />
          <Skeleton forma="bloco" className="h-full w-full rounded-2xl" />
        </div>
      </div>
      <Stack gap={6}>
        <TituloDeSecao acao />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card
              key={i}
              densidade="compacta"
              className={cx(i > 1 && 'hidden lg:block')}
            >
              <Stack gap={3}>
                <Skeleton forma="bloco" className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="w-[50%]" />
              </Stack>
            </Card>
          ))}
        </div>
      </Stack>
      <Card densidade="larga">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Stack gap={4} alinhar="centro">
            <Skeleton
              forma="bloco"
              className="h-48 w-48 rounded-3xl lg:h-72 lg:w-72"
            />
            <Skeleton forma="bloco" className="h-7 w-40" />
            <Skeleton className="w-28" />
          </Stack>
          <Stack gap={4} className="lg:col-span-2">
            <Skeleton forma="bloco" className="h-6 w-48" />
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className={i === 4 ? 'w-[60%]' : 'w-full'} />
            ))}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton forma="bloco" className="h-16 w-full" />
              <Skeleton forma="bloco" className="h-16 w-full" />
            </div>
          </Stack>
        </div>
      </Card>
      <Stack gap={6}>
        <TituloDeSecao />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton
              key={i}
              forma="bloco"
              className="h-28 w-full rounded-2xl"
            />
          ))}
        </div>
      </Stack>
      <Stack gap={6}>
        <TituloDeSecao acao />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i}>
              <Inline gap={4}>
                <Skeleton forma="circulo" className="h-14 w-14 shrink-0" />
                <Stack gap={2} className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-[70%]" />
                  <Skeleton className="w-[45%]" />
                </Stack>
              </Inline>
            </Card>
          ))}
        </div>
      </Stack>
    </div>
  );
}

/** A faixa de abas (Todos, Compositores, Obras…) das páginas por pessoa. */
function Abas({ quantas }: { quantas: number }) {
  return (
    <div className="flex gap-1 overflow-hidden rounded-xl bg-theme-secondary p-1">
      {Array.from({ length: quantas }, (_, i) => (
        <Skeleton
          key={i}
          forma="bloco"
          className={cx('h-9 shrink-0', i === 0 ? 'w-28' : 'w-32')}
        />
      ))}
    </div>
  );
}

/**
 * O card de controles de favoritos, anotações e envios: as abas e, ao lado
 * (ou embaixo, com `abasEmCima`), a busca e os botões. Em envios, os botões
 * de criar ficam à esquerda da linha de baixo.
 */
export function EsqueletoControlesComAbas({
  abas = 4,
  abasEmCima = false,
  criar = 0,
}: {
  abas?: number;
  abasEmCima?: boolean;
  criar?: number;
}) {
  const busca = (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Skeleton forma="bloco" className="h-11 w-full sm:w-80" />
      <Skeleton forma="bloco" className="h-11 w-full sm:w-36" />
      <Skeleton forma="bloco" className="hidden h-11 w-20 md:block" />
    </div>
  );
  return (
    <Card>
      {abasEmCima ? (
        <Stack gap={4}>
          <Abas quantas={abas} />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Inline quebra gap={2}>
              {Array.from({ length: criar }, (_, i) => (
                <Skeleton key={i} forma="bloco" className="h-11 w-40" />
              ))}
            </Inline>
            {busca}
          </div>
        </Stack>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Abas quantas={abas} />
          {busca}
        </div>
      )}
    </Card>
  );
}

/**
 * Uma seção das páginas por pessoa: o ícone, o título com a contagem e, com
 * `acao`, o botão à direita; embaixo, a grade de três cards.
 */
export function EsqueletoSecaoCartoes({
  quantos = 3,
  acao = false,
}: {
  quantos?: number;
  acao?: boolean;
}) {
  return (
    <Stack gap={6}>
      <Inline extremos gap={4}>
        <Inline gap={3}>
          <Skeleton forma="bloco" className="h-10 w-10 shrink-0 rounded-xl" />
          <Stack gap={2}>
            <Skeleton forma="bloco" className="h-7 w-48" />
            <Skeleton className="w-24" />
          </Stack>
        </Inline>
        {acao && <Skeleton forma="bloco" className="h-10 w-28" />}
      </Inline>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: quantos }, (_, i) => (
          <Card key={i}>
            <Stack gap={4}>
              <Inline gap={4}>
                <Skeleton forma="circulo" className="h-16 w-16 shrink-0" />
                <Stack gap={2} className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-[70%]" />
                  <Skeleton className="w-[50%]" />
                  <Skeleton className="w-[35%]" />
                </Stack>
              </Inline>
              <div className="border-t border-linha pt-4">
                <Skeleton className="ml-auto w-24" />
              </div>
            </Stack>
          </Card>
        ))}
      </div>
    </Stack>
  );
}

/**
 * O perfil: a coluna das abas à esquerda e o conteúdo da aba (um
 * formulário) à direita. Sem cabeçalho de página — o perfil não tem.
 */
export function EsqueletoPerfil() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      <Card nivel={2} densidade="compacta">
        <Stack gap={1}>
          {Array.from({ length: 6 }, (_, i) => (
            <Inline key={i} gap={3} className="px-3 py-2.5">
              <Skeleton forma="bloco" className="h-5 w-5 shrink-0" />
              <Skeleton className="w-28" />
            </Inline>
          ))}
        </Stack>
      </Card>
      <Card nivel={2} className="lg:col-span-3">
        <Stack gap={6}>
          <Stack gap={2}>
            <Skeleton forma="bloco" className="h-6 w-48" />
            <Skeleton className="w-72 max-w-full" />
          </Stack>
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
    </div>
  );
}

/**
 * A ficha de edição (compositor, obra, partitura enviados): a trilha, o card
 * do cabeçalho — título, dados em grade e a coluna das ações — e os blocos
 * de texto abaixo. A mesma forma da página de detalhe.
 */
export function EsqueletoFicha() {
  return (
    <>
      <Inline gap={2}>
        <Skeleton className="w-20" />
        <Skeleton className="w-3" />
        <Skeleton className="w-24" />
        <Skeleton className="w-3" />
        <Skeleton className="w-32" />
      </Inline>
      <Card densidade="larga">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <Stack gap={6} className="lg:col-span-3">
            <Stack gap={3}>
              <Skeleton forma="bloco" className="h-10 w-[70%] md:h-12" />
              <Skeleton className="h-4 w-48" />
            </Stack>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Stack key={i} gap={2}>
                  <Skeleton className="w-20" />
                  <Skeleton className="h-4 w-28" />
                </Stack>
              ))}
            </div>
          </Stack>
          <Stack gap={3}>
            <Skeleton forma="bloco" className="h-11 w-full" />
            <Skeleton forma="bloco" className="h-11 w-full" />
            <Skeleton forma="bloco" className="h-11 w-full" />
          </Stack>
        </div>
      </Card>
      <BlocoDeTexto linhas={4} />
    </>
  );
}

/** O histórico de envios: a linha do tempo, um marco e um card por evento. */
export function EsqueletoLinhaDoTempo({ quantos = 5 }: { quantos?: number }) {
  return (
    <Stack gap={6}>
      {Array.from({ length: quantos }, (_, i) => (
        <Inline key={i} gap={4} alinhar="inicio">
          <Skeleton forma="circulo" className="mt-4 h-10 w-10 shrink-0" />
          <Card className="min-w-0 flex-1">
            <Stack gap={3}>
              <Inline extremos gap={4}>
                <Skeleton className="h-4 w-[50%]" />
                <Skeleton className="w-20" />
              </Inline>
              <Skeleton className="w-[70%]" />
              <Skeleton className="w-[40%]" />
            </Stack>
          </Card>
        </Inline>
      ))}
    </Stack>
  );
}

/**
 * Números centrados, com o ícone em cima (aulas de aluno e de professor). No
 * telefone a fileira rola de lado, como a de verdade.
 */
export function EsqueletoNumerosCentro({ quantos = 4 }: { quantos?: number }) {
  return (
    <div className="overflow-hidden">
      <div
        className="grid auto-cols-[minmax(220px,1fr)] grid-flow-col gap-6 sm:grid-flow-row sm:auto-cols-auto"
        style={{ gridTemplateColumns: `repeat(${quantos}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: quantos }, (_, i) => (
          <Card key={i} densidade="compacta">
            <Stack gap={3} alinhar="centro">
              <Skeleton forma="bloco" className="h-12 w-12 rounded-xl" />
              <Skeleton forma="bloco" className="h-7 w-12" />
              <Skeleton className="w-24" />
            </Stack>
          </Card>
        ))}
      </div>
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
