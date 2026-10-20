'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stack } from '@/app/components/ui/Layout';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho, Secao } from '@/app/components/Admin/painel/Cabecalho';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import {
  Colunas,
  Proporcoes,
  colunasPorDia,
} from '@/app/components/Admin/painel/Graficos';
import { Numeros, rolarAte } from '@/app/components/Admin/painel/Numeros';
import { numero, porcento } from '@/app/components/Admin/painel/formatos';
import {
  useAnaliseUsuarios,
  useAtividade,
  useContribuidores,
  useInsightsDaArea,
  useMaisAnotadas,
  useMetricasCatalogo,
  useObrasPorEpoca,
  usePanorama,
} from '@/app/hooks/admin/usePainel';
import type { PeriodoAnalise } from '@/app/requests/admin/painel';

/**
 * Uso da plataforma: quem chega, quem volta, o que usam.
 *
 * Junta duas telas do painel antigo que respondiam à mesma pergunta —
 * "Análise de usuários" (`/admin/users`) e "Analytics" (`/admin/analytics`)
 * — com números que agora vêm todos medidos: a série diária de cadastros, o
 * retorno por coorte (o insight de audiência, com a evidência mês a mês), o
 * perfil de quem se cadastrou, a biblioteca e o catálogo.
 */

const PERIODOS: { valor: PeriodoAnalise; rotulo: string; dias: number }[] = [
  { valor: '7d', rotulo: '7 dias', dias: 7 },
  { valor: '30d', rotulo: '30 dias', dias: 30 },
  { valor: '90d', rotulo: '90 dias', dias: 90 },
  { valor: '1y', rotulo: '1 ano', dias: 365 },
];

const TIPOS: Record<string, string> = {
  MUSIC_STUDENT: 'Estudantes de música',
  CASUAL_USER: 'Ouvintes',
  PROFESSIONAL: 'Profissionais',
  TEACHER: 'Professores',
  UNSET: 'Não informaram',
};

interface Coorte {
  mes: string;
  cadastros: number;
  retornaram: number;
  taxa: number | null;
}

export default function UsoDaPlataforma() {
  const router = useRouter();
  const [periodo, setPeriodo] = useState<PeriodoAnalise>('30d');
  const dias = PERIODOS.find((p) => p.valor === periodo)!.dias;

  const usuarios = useAnaliseUsuarios(periodo);
  const panorama = usePanorama();
  const atividade = useAtividade(dias);
  const audiencia = useInsightsDaArea('audience');
  const catalogo = useMetricasCatalogo();
  const epocas = useObrasPorEpoca();
  const anotadas = useMaisAnotadas();
  const contribuidores = useContribuidores();

  const u = usuarios.data;
  const o = panorama.data;
  const c = catalogo.data;
  const rotulo = PERIODOS.find((p) => p.valor === periodo)!.rotulo;

  const coortes = (audiencia.data?.insights.find(
    (i) => i.code === 'audience.retention_cohorts'
  )?.evidence ?? []) as Coorte[];

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Uso da plataforma"
        descricao="Quem chega, quem volta e o que usam"
        atualizadoEm={usuarios.updatedAt}
        acoes={
          <Segmentos
            rotulo="Período"
            opcoes={PERIODOS.map(({ valor, rotulo }) => ({ valor, rotulo }))}
            valor={periodo}
            aoMudar={setPeriodo}
          />
        }
      />

      <Numeros
        carregando={usuarios.loading || panorama.loading}
        itens={[
          {
            id: 'contas',
            rotulo: 'Contas',
            valor: numero(u?.total),
            aoClicar: () => router.push('/admin/users'),
          },
          {
            id: 'novas',
            rotulo: `Novas em ${rotulo}`,
            aoClicar: () => rolarAte('uso-cadastros'),
            valor: numero(u?.newInPeriod),
            nota:
              u?.growthRate === null || !u
                ? 'sem período anterior'
                : `${u.growthRate >= 0 ? '+' : ''}${porcento(u.growthRate)} sobre o anterior`,
          },
          {
            id: 'ativas',
            rotulo: `Ativas em ${rotulo}`,
            aoClicar: () =>
              router.push(`/admin/users?atividade=${dias <= 7 ? '7d' : '30d'}`),
            valor: numero(u?.activeInPeriod),
            nota: u
              ? `${porcento(u.total ? (u.activeInPeriod / u.total) * 100 : null, 0)} da base`
              : undefined,
          },
          {
            id: 'professores',
            rotulo: 'Professores',
            aoClicar: () => router.push('/admin/users?recorte=professores'),
            valor: numero(u?.teachers),
          },
          {
            id: 'onboarding',
            rotulo: 'Cadastro concluído',
            aoClicar: () => router.push('/admin/users?cadastro=sim'),
            valor: o
              ? porcento(
                  o.usuarios.total
                    ? (o.usuarios.onboardingConcluido / o.usuarios.total) * 100
                    : null,
                  0
                )
              : '—',
            nota: o
              ? `${numero(o.usuarios.onboardingConcluido)} contas`
              : undefined,
          },
          {
            id: 'aprendidas',
            rotulo: 'Obras aprendidas',
            aoClicar: () => rolarAte('uso-biblioteca'),
            valor: numero(o?.biblioteca.conclusoes),
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section
          aria-labelledby="uso-cadastros"
          className="sup-1 flex flex-col gap-4 p-5 md:p-6"
        >
          <Stack gap={1}>
            <Text papel="secao" as="h2" id="uso-cadastros">
              Cadastros no período
            </Text>
            <Text papel="legenda" as="p">
              {atividade.data
                ? `${numero(atividade.data.totais.cadastros)} nos últimos ${atividade.data.dias} dias${atividade.data.dias > 90 ? ', por semana' : ''}`
                : ' '}
            </Text>
          </Stack>
          {atividade.loading || !atividade.data ? (
            <Skeleton forma="bloco" className="h-46 w-full" />
          ) : (
            <Colunas
              titulo="Cadastros por dia"
              linhaMedia
              dados={colunasPorDia(atividade.data.serie, (d) => d.cadastros)}
            />
          )}
        </section>

        <Secao
          titulo="Quem volta"
          id="uso-coortes"
          detalhe="voltaram depois do primeiro dia"
        >
          {audiencia.loading ? (
            <Skeleton forma="bloco" className="h-40 w-full" />
          ) : coortes.length === 0 ? (
            <Text papel="rotulo" tom="suave" as="p">
              Ainda não há cadastros suficientes para ler retorno por mês.
            </Text>
          ) : (
            <Proporcoes
              titulo="Retorno por mês de cadastro"
              formatar={(n) => porcento(n, 0)}
              dados={coortes
                .slice(-6)
                .reverse()
                .map((k) => ({
                  rotulo: new Date(`${k.mes}-15T12:00:00`).toLocaleDateString(
                    'pt-BR',
                    { month: 'long', year: 'numeric' }
                  ),
                  valor: k.taxa ?? 0,
                }))}
              nota={(_, i) => {
                const k = coortes.slice(-6).reverse()[i];
                return `${numero(k.retornaram)} de ${numero(k.cadastros)} cadastros`;
              }}
            />
          )}
        </Secao>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Secao titulo="Quem se cadastra" id="uso-perfil">
          {u ? (
            <Proporcoes
              titulo="Contas por perfil declarado"
              dados={Object.entries(u.byUserType)
                .sort((a, b) => b[1] - a[1])
                .map(([tipo, n]) => ({
                  rotulo: TIPOS[tipo] ?? tipo,
                  valor: n,
                }))}
            />
          ) : (
            <Skeleton forma="bloco" className="h-40 w-full" />
          )}
        </Secao>

        <Secao titulo="Biblioteca" id="uso-biblioteca">
          <Lista
            carregando={panorama.loading}
            linhas={[
              ['Favoritos', o?.biblioteca.favoritos],
              ['Querem aprender', o?.biblioteca.intencoes],
              ['Já aprenderam', o?.biblioteca.conclusoes],
              ['Anotações', o?.biblioteca.anotacoes],
            ]}
          />
        </Secao>

        <Secao titulo="Catálogo" id="uso-catalogo">
          <Lista
            carregando={catalogo.loading}
            linhas={[
              [
                'Compositores',
                c?.totals.composers,
                c
                  ? `${porcento(c.coverage.composersVerifiedRate)} verificados`
                  : undefined,
              ],
              [
                'Obras',
                c?.totals.works,
                c
                  ? `${porcento(c.coverage.worksVerifiedRate)} verificadas`
                  : undefined,
              ],
              ['Partituras ativas', c?.totals.activeScores],
            ]}
          />
        </Secao>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Secao titulo="Obras por época" id="uso-epocas">
          {epocas.data ? (
            <Proporcoes
              titulo="Obras por época"
              dados={[...epocas.data]
                .sort((a, b) => b.works - a.works)
                .slice(0, 8)
                .map((e) => ({ rotulo: e.name, valor: e.works }))}
            />
          ) : (
            <Skeleton forma="bloco" className="h-40 w-full" />
          )}
        </Secao>

        <Secao titulo="Mais anotadas" id="uso-anotadas">
          <ol className="flex flex-col">
            {(anotadas.data ?? []).slice(0, 8).map((w) => (
              <li
                key={w.id}
                className="flex items-baseline gap-3 border-b border-linha py-2.5 last:border-0"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-display text-[1.0625rem] text-texto">
                    {w.title}
                  </span>
                  <span className="t-legenda truncate">{w.composer?.name}</span>
                </span>
                <span className="t-dado text-sm text-texto-suave">
                  {numero(w.annotationsCount)}
                </span>
              </li>
            ))}
            {anotadas.data?.length === 0 && (
              <Text papel="rotulo" tom="suave" as="p">
                Nenhuma obra anotada ainda.
              </Text>
            )}
          </ol>
        </Secao>

        <Secao
          titulo="Quem mais contribui"
          id="uso-contribuidores"
          atalho={
            <Link
              href="/admin/uploads"
              className="t-rotulo text-ouro-texto hover:underline underline-offset-4"
            >
              Ver envios
            </Link>
          }
        >
          <ol className="flex flex-col">
            {(contribuidores.data ?? []).slice(0, 8).map((p) => (
              <li
                key={p.userId}
                className="flex items-baseline gap-3 border-b border-linha py-2.5 last:border-0"
              >
                <span className="flex-1 truncate text-sm text-texto">
                  {p.name || 'Conta sem nome'}
                </span>
                <span className="t-dado text-sm text-texto-suave">
                  {numero(p.contributions)}
                </span>
              </li>
            ))}
            {contribuidores.data?.length === 0 && (
              <Text papel="rotulo" tom="suave" as="p">
                Ninguém enviou nada ainda.
              </Text>
            )}
          </ol>
        </Secao>
      </div>
    </Stack>
  );
}

function Lista({
  linhas,
  carregando,
}: {
  linhas: [string, number | undefined, string?][];
  carregando: boolean;
}) {
  return (
    <dl className="flex flex-col">
      {linhas.map(([rotulo, valor, nota]) => (
        <div
          key={rotulo}
          className="flex items-baseline gap-3 border-b border-linha py-2.5 last:border-0"
        >
          <dt className="flex flex-1 flex-col">
            <span className="t-rotulo text-texto-suave">{rotulo}</span>
            {nota && <span className="t-legenda">{nota}</span>}
          </dt>
          <dd className="t-dado text-texto">
            {carregando ? '…' : numero(valor)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
