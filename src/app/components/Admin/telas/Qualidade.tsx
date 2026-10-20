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
