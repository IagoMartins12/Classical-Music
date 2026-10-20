'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho, Secao } from '@/app/components/Admin/painel/Cabecalho';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import { Pizza } from '@/app/components/Admin/painel/Graficos';
import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import {
  dataCurta,
  dataHora,
  numero,
  porcento,
} from '@/app/components/Admin/painel/formatos';
import { adminKeys, useAdminQuery } from '@/app/hooks/admin/query';
import {
  NOME_DA_SITUACAO,
  NOME_DO_ESTADO_DA_AULA,
  getAulasDoPortal,
  getTarefasDoPortal,
  getVisaoDoPortal,
  type EstadoDaAula,
} from '@/app/requests/admin/portal';

/**
 * Portal de estudo — visão geral: o que acontece entre professores e alunos.
 *
 * Os números levam às listas (aulas, tarefas, professores, alunos) já
 * filtradas; as fatias também. Só leitura: o painel acompanha, quem dá aula
 * é o portal. Quando houver escolas parceiras, elas entram como mais um
 * recorte destas mesmas telas (a escola é o conjunto dos professores dela).
 */

const PERIODOS = [
  { valor: 7, rotulo: '7 dias' },
  { valor: 30, rotulo: '30 dias' },
  { valor: 90, rotulo: '3 meses' },
  { valor: 365, rotulo: '1 ano' },
];

export default function PortalVisao() {
  const router = useRouter();
  const navegar = useNavegar();
  const [dias, setDias] = useState(30);
  const v = useAdminQuery(adminKeys.list('portal', { visao: dias }), () =>
    getVisaoDoPortal(dias)
  );
  const proximas = useAdminQuery(
    adminKeys.list('portal', { proximas: true }),
    () => getAulasDoPortal({ quando: 'proximas' })
  );
  const atrasadas = useAdminQuery(
    adminKeys.list('portal', { atrasadas: true }),
    () => getTarefasDoPortal({ situacao: 'atrasadas' })
  );
  const d = v.data;
  const nomeDoPeriodo =
    dias === 365 ? 'no último ano' : `nos últimos ${dias} dias`;
  const ir = (url: string) => router.push(url);
  const emVigor =
    (d?.tarefas.porStatus.PENDING ?? 0) +
    (d?.tarefas.porStatus.IN_PROGRESS ?? 0);

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Portal de estudo"
        descricao="Aulas, tarefas, professores e alunos"
        acoes={
          <Segmentos
            rotulo="Período"
            valor={dias}
            aoMudar={setDias}
            opcoes={PERIODOS}
          />
        }
      />

      <Numeros
        carregando={v.loading}
        colunas={4}
        itens={[
          {
            id: 'professores',
            rotulo: 'Professores',
            valor: numero(d?.professores.total),
            nota: d
              ? `${numero(d.professores.comAulaNoPeriodo)} deram aula ${nomeDoPeriodo}`
              : undefined,
            aoClicar: () => ir('/admin/study/teachers'),
          },
          {
            id: 'alunos',
            rotulo: 'Alunos',
            valor: numero(d?.alunos.total),
            nota: d
              ? `${numero(d.alunos.comAulaNoPeriodo)} tiveram aula ${nomeDoPeriodo}`
              : undefined,
            aoClicar: () => ir('/admin/study/students'),
          },
          {
            id: 'vinculos',
            rotulo: 'Vínculos ativos',
            valor: numero(d?.vinculos.ativos),
            nota: d?.vinculos.convitesPendentes
              ? `${numero(d.vinculos.convitesPendentes)} convites esperando resposta`
              : 'professor e aluno',
            aoClicar: () => ir('/admin/study/students'),
          },
          {
            id: 'proximas',
            rotulo: 'Aulas nos próximos 7 dias',
            valor: numero(d?.aulas.proximos7Dias),
            aoClicar: () => ir('/admin/study/lessons?quando=proximas'),
          },
          {
            id: 'sem-desfecho',
            rotulo: 'Aulas sem desfecho',
            valor: numero(d?.aulas.semDesfecho),
            nota: 'já passaram e seguem "agendadas"',
            tom: d?.aulas.semDesfecho ? 'atencao' : undefined,
            aoClicar: () => ir('/admin/study/lessons?quando=sem-desfecho'),
          },
          {
            id: 'presenca',
            rotulo: 'Presença',
            valor:
              d?.aulas.presenca !== null && d
                ? porcento(d.aulas.presenca, 0)
                : '—',
            nota: d
              ? d.aulas.presenca === null
                ? 'sem aula com desfecho no período'
                : `das aulas concluídas ou com falta, ${nomeDoPeriodo}`
              : undefined,
            aoClicar: () => ir('/admin/study/lessons?quando=passadas'),
          },
          {
            id: 'em-vigor',
            rotulo: 'Tarefas em vigor',
            valor: numero(emVigor),
            aoClicar: () => ir('/admin/study/assignments?situacao=em-vigor'),
          },
          {
            id: 'atrasadas',
            rotulo: 'Tarefas atrasadas',
            valor: numero(d?.tarefas.atrasadas),
            nota: d
              ? `${numero(d.tarefas.entreguesNoPeriodo)} entregues ${nomeDoPeriodo}`
              : undefined,
            tom: d?.tarefas.atrasadas ? 'atencao' : undefined,
            aoClicar: () => ir('/admin/study/assignments?situacao=atrasadas'),
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Secao
          titulo="Aulas por desfecho"
          id="portal-desfecho"
          detalhe={nomeDoPeriodo}
        >
          {d ? (
            <Pizza
              titulo={`Aulas ${nomeDoPeriodo}, por desfecho`}
              dados={Object.entries(d.aulas.porStatus).map(([k, n]) => ({
                rotulo: NOME_DO_ESTADO_DA_AULA[k as EstadoDaAula] ?? k,
                valor: n ?? 0,
                id: k,
              }))}
              aoClicar={(p) =>
                p.id &&
                ir(`/admin/study/lessons?quando=passadas&estado=${p.id}`)
              }
            />
          ) : (
            <Row.Skeleton repetir={3} />
          )}
        </Secao>
        <Secao titulo="Tarefas por situação" id="portal-tarefas">
          {d ? (
            <Pizza
              titulo="Tarefas por situação"
              dados={Object.entries(d.tarefas.porStatus).map(([k, n]) => ({
                rotulo: NOME_DA_SITUACAO[k] ?? k,
                valor: n,
                id: k,
              }))}
              aoClicar={(p) =>
                ir(
                  `/admin/study/assignments?situacao=${p.id === 'COMPLETED' ? 'concluidas' : p.id === 'OVERDUE' ? 'atrasadas' : 'em-vigor'}`
                )
              }
            />
          ) : (
            <Row.Skeleton repetir={3} />
          )}
        </Secao>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Secao titulo="Próximas aulas" id="portal-proximas">
          {proximas.loading ? (
            <Row.Skeleton repetir={4} />
          ) : !proximas.data?.items.length ? (
            <Text papel="rotulo" tom="suave" as="p">
              Nenhuma aula marcada.
            </Text>
          ) : (
            <ul className="flex flex-col">
              {proximas.data.items.slice(0, 6).map((a) => (
                <li
                  key={a.id}
                  className="flex items-baseline gap-3 border-b border-linha py-2 last:border-0"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <Elo
                      onClick={() => navegar.aula(a.id)}
                      className="truncate text-[0.9375rem]"
                    >
                      {a.titulo}
                    </Elo>
                    <span className="t-legenda truncate">
                      {a.professor.nome} → {a.aluno.nome}
                    </span>
                  </span>
                  <span className="t-legenda t-dado shrink-0">
                    {dataHora(a.quando)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Secao>
        <Secao titulo="Tarefas atrasadas" id="portal-atrasadas">
          {atrasadas.loading ? (
            <Row.Skeleton repetir={4} />
          ) : !atrasadas.data?.items.length ? (
            <Text papel="rotulo" tom="suave" as="p">
              Nenhuma tarefa atrasada.
            </Text>
          ) : (
            <ul className="flex flex-col">
              {atrasadas.data.items.slice(0, 6).map((t) => (
                <li
                  key={t.id}
                  className="flex items-baseline gap-3 border-b border-linha py-2 last:border-0"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <Elo
                      onClick={() => navegar.tarefa(t.id)}
                      className="truncate text-[0.9375rem]"
                    >
                      {t.titulo}
                    </Elo>
                    <span className="t-legenda truncate">
                      {t.aluno.nome} · de {t.professor.nome}
                    </span>
                  </span>
                  <span className="t-legenda t-dado shrink-0">
                    prazo {t.prazo ? dataCurta(t.prazo) : '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Secao>
      </div>
    </Stack>
  );
}
