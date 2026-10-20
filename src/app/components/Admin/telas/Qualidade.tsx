'use client';

import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { Erro } from '@/app/components/ui/Estados';
import { Stack } from '@/app/components/ui/Layout';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Proporcoes } from '@/app/components/Admin/painel/Graficos';
import {
  numero,
  porcento,
  relativo,
} from '@/app/components/Admin/painel/formatos';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import { useQualidade } from '@/app/hooks/admin/useQualidade';

/**
 * Qualidade do acervo: quanto do cadastro está preenchido e confere. É o
 * quadro para olhar antes e depois de cada correção em lote (épocas,
 * instrumentos, retratos) e para ver a biografia crescer.
 */
export default function Qualidade() {
  const q = useQualidade();
  const c = q.data?.composers;
  const w = q.data?.works;

  const parte = (n: number | undefined, total: number | undefined) =>
    total ? (n ?? 0) / total : 0;

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Qualidade do acervo"
        descricao="Quanto do cadastro de compositores e obras está preenchido, e quanto confere com as datas. A contagem é guardada por dez minutos."
        aoAtualizar={q.refetch}
        atualizando={q.fetching}
      />

      {q.error ? (
        <Erro
          titulo="Não foi possível calcular a qualidade"
          descricao={q.error}
          acao={
            <Button tamanho="p" onClick={() => void q.refetch()}>
              Tentar de novo
            </Button>
          }
        />
      ) : (
        <>
          <Numeros
            carregando={q.loading}
            itens={[
              {
                id: 'compositores',
                rotulo: 'Compositores',
                valor: numero(c?.total),
                nota: `${numero(c?.verified)} verificados`,
              },
              {
                id: 'obras',
                rotulo: 'Obras',
                valor: numero(w?.total),
              },
              {
                id: 'epoca',
                rotulo: 'Época de acordo com as datas',
                valor: porcento(
                  parte(c?.epochInAgreement, c?.epochChecked) * 100,
                  1
                ),
                nota: `de ${numero(c?.epochChecked)} com ano de nascimento`,
              },
              {
                id: 'espera',
                rotulo: 'Biografias esperando revisão',
                valor: numero(c?.bioWaitingReview),
                tom: c?.bioWaitingReview ? 'atencao' : undefined,
              },
            ]}
          />

          {q.loading || !c || !w ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <Stack gap={4}>
                <Text papel="titulo" as="h2">
                  Compositores
                </Text>
                <Proporcoes
                  titulo="Preenchimento dos compositores"
                  base={c.total}
                  dados={[
                    { rotulo: 'Com ano de nascimento', valor: c.withBirthYear },
                    { rotulo: 'Com nacionalidade', valor: c.withNationality },
                    { rotulo: 'Com biografia', valor: c.withBio },
                    { rotulo: 'Com retrato', valor: c.withPortrait },
                    { rotulo: 'Verificados', valor: c.verified },
                  ]}
                />
                <VerNaLista
                  itens={[
                    {
                      nome: 'Nacionalidade',
                      tem: c.withNationality,
                      total: c.total,
                      href: '/admin/composers?hasNationality=',
                    },
                    {
                      nome: 'Ano de nascimento',
                      tem: c.withBirthYear,
                      total: c.total,
                      href: '/admin/composers?hasBirthYear=',
                    },
                    {
                      nome: 'Biografia',
                      tem: c.withBio,
                      total: c.total,
                      href: '/admin/composers?hasBio=',
                    },
                    {
                      nome: 'Retrato',
                      tem: c.withPortrait,
                      total: c.total,
                      href: '/admin/composers?hasPortrait=',
                    },
                    {
                      nome: 'Obras no catálogo',
                      tem: c.withWorks,
                      total: c.total,
                      href: '/admin/composers?hasWorks=',
                    },
                  ]}
                />
                <Atencao
                  itens={[
                    {
                      nome: 'Época que não confere com as datas',
                      n: c.epochChecked - c.epochInAgreement,
                      href: '/admin/composers?epochMismatch=true',
                    },
                    {
                      nome: 'Suspeitos de não serem compositores',
                      n: c.suspects,
                      href: '/admin/composers?suspect=true',
                    },
                  ]}
                />
                <Text papel="legenda" as="p">
                  Biografias esperando uma pessoa estão em{' '}
                  <Link
                    href="/admin/biografias"
                    className="text-ouro-texto underline underline-offset-4"
                  >
                    Biografias
                  </Link>
                  .
                </Text>
              </Stack>

              <Stack gap={4}>
                <Text papel="titulo" as="h2">
                  Obras
                </Text>
                <Proporcoes
                  titulo="Preenchimento das obras"
                  base={w.total}
                  dados={[
                    { rotulo: 'Com tonalidade', valor: w.withTone },
                    { rotulo: 'Com ano de composição', valor: w.withYear },
                    {
                      rotulo: 'Com instrumentação',
                      valor: w.withInstrumentation,
                    },
                    { rotulo: 'Com gravação ou vídeo', valor: w.withMedia },
                  ]}
                />
                <VerNaLista
                  itens={[
                    {
                      nome: 'Tonalidade',
                      tem: w.withTone,
                      total: w.total,
                      href: '/admin/works?hasTone=',
                    },
                    {
                      nome: 'Ano de composição',
                      tem: w.withYear,
                      total: w.total,
                      href: '/admin/works?hasYear=',
                    },
                    {
                      nome: 'Instrumentação',
                      tem: w.withInstrumentation,
                      total: w.total,
                      href: '/admin/works?hasInstrumentation=',
                    },
                    {
                      nome: 'Gravação ou vídeo',
                      tem: w.withMedia,
                      total: w.total,
                      href: '/admin/works?hasMedia=',
                    },
                  ]}
                />
              </Stack>
            </div>
          )}

          {q.data && (
            <Text papel="legenda" as="p">
              Calculado {relativo(q.data.generatedAt)}.
            </Text>
          )}
        </>
      )}
    </Stack>
  );
}

const ligacao = 'text-ouro-texto underline underline-offset-4';

/**
 * Cada campo com os dois caminhos: a lista dos que têm e a dos que faltam,
 * já filtrada na tela de compositores ou de obras.
 */
function VerNaLista({
  itens,
}: {
  itens: { nome: string; tem: number; total: number; href: string }[];
}) {
  return (
    <ul className="flex flex-col divide-y divide-[var(--linha)]">
      {itens.map((i) => (
        <li
          key={i.nome}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5"
        >
          <Text papel="rotulo" as="span">
            {i.nome}
          </Text>
          <span className="flex gap-4 text-[0.9375rem]">
            <Link href={`${i.href}true`} className={ligacao}>
              Ver os {numero(i.tem)} que têm
            </Link>
            <Link href={`${i.href}false`} className={ligacao}>
              Ver os {numero(Math.max(i.total - i.tem, 0))} que faltam
            </Link>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Números que pedem olho humano: um só caminho, para a lista do problema. */
function Atencao({
  itens,
}: {
  itens: { nome: string; n: number; href: string }[];
}) {
  return (
    <ul className="flex flex-col divide-y divide-[var(--linha)]">
      {itens.map((i) => (
        <li
          key={i.nome}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5"
        >
          <Text papel="rotulo" as="span">
            {i.nome}
          </Text>
          <Link href={i.href} className={`${ligacao} text-[0.9375rem]`}>
            Ver os {numero(i.n)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
