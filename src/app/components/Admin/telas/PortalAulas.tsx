'use client';

import { useEffect, useState } from 'react';
import { PiX } from 'react-icons/pi';
import { Chip } from '@/app/components/ui/Badge';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Busca, Segmentos } from '@/app/components/Admin/painel/Controles';
import { FiltroSelecao } from '@/app/components/Admin/painel/Filtros';
import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';
import { Tabela, type Coluna } from '@/app/components/Admin/painel/Tabela';
import { dataHora, numero } from '@/app/components/Admin/painel/formatos';
import { adminKeys, useAdminInfinite } from '@/app/hooks/admin/query';
import {
  NOME_DO_ESTADO_DA_AULA,
  NOME_DO_TIPO_DE_AULA,
  getAulasDoPortal,
  type AulaDoPortal,
  type FiltroDeAulas,
} from '@/app/requests/admin/portal';

/**
 * As aulas do portal: as que vêm, as que passaram e as que passaram sem
 * desfecho (seguem "agendadas" depois da hora). Filtra por estado, título,
 * professor e aluno; cada aula abre a ficha, cada pessoa abre a conta.
 * Chega filtrada pela URL (`?quando=`, `?estado=`, `?professor=&nome=`,
 * `?aluno=&nome=`), que é como a visão geral e as listas de pessoas trazem
 * para cá.
 */

type Quando = '' | 'proximas' | 'passadas' | 'sem-desfecho';

export default function PortalAulas() {
  const navegar = useNavegar();
  const [quando, setQuando] = useState<Quando>('proximas');
  const [estado, setEstado] = useState('');
  const [busca, setBusca] = useState('');
  const [pessoa, setPessoa] = useState<{
    papel: 'professor' | 'aluno';
    id: string;
    nome: string;
  } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const w = q.get('quando');
    if (w === 'proximas' || w === 'passadas' || w === 'sem-desfecho') {
      setQuando(w);
    }
    const e = q.get('estado');
    if (e) setEstado(e);
    const nome = q.get('nome') ?? '';
    const prof = q.get('professor');
    const aluno = q.get('aluno');
    if (prof) setPessoa({ papel: 'professor', id: prof, nome });
    else if (aluno) setPessoa({ papel: 'aluno', id: aluno, nome });
    if (prof || aluno) setQuando('');
  }, []);

  const filtro: FiltroDeAulas = {
    quando: quando || undefined,
    status: estado || undefined,
    search: busca || undefined,
    teacherId: pessoa?.papel === 'professor' ? pessoa.id : undefined,
    studentId: pessoa?.papel === 'aluno' ? pessoa.id : undefined,
  };
  const lista = useAdminInfinite<AulaDoPortal>(
    adminKeys.list('portal', { aulas: filtro }),
    async (cursor) => {
      const pagina = cursor ? Number(cursor) : 1;
      const r = await getAulasDoPortal(filtro, pagina);
      return {
        items: r.items,
        total: r.pagination.total,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    }
  );

  const colunas: Coluna<AulaDoPortal>[] = [
    {
      id: 'aula',
      titulo: 'Aula',
      principal: true,
      celula: (a) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[0.9375rem] text-texto">
            {a.titulo}
          </span>
          <span className="t-legenda truncate">
            {NOME_DO_TIPO_DE_AULA[a.tipo] ?? a.tipo} · {a.duracao} min
            {a.recorrente ? ' · recorrente' : ''}
          </span>
        </span>
      ),
    },
    {
      id: 'quando',
      titulo: 'Quando',
      celula: (a) => (
        <span className="t-dado text-sm">{dataHora(a.quando)}</span>
      ),
    },
    {
      id: 'professor',
      titulo: 'Professor',
      celula: (a) =>
        a.professor.userId ? (
          <Elo
            onClick={() => navegar.usuario(a.professor.userId!)}
            className="text-sm"
          >
            {a.professor.nome}
          </Elo>
        ) : (
          '—'
        ),
    },
    {
      id: 'aluno',
      titulo: 'Aluno',
      celula: (a) =>
        a.aluno.userId ? (
          <Elo
            onClick={() => navegar.usuario(a.aluno.userId!)}
            className="text-sm"
          >
            {a.aluno.nome}
          </Elo>
        ) : (
          '—'
        ),
    },
    {
      id: 'estado',
      titulo: 'Estado',
      celula: (a) => {
        const semDesfecho =
          a.status === 'SCHEDULED' && new Date(a.quando) < new Date();
        return (
          <span className="text-sm">
            {semDesfecho
              ? 'Sem desfecho'
              : (NOME_DO_ESTADO_DA_AULA[a.status] ?? a.status)}
          </span>
        );
      },
    },
    {
      id: 'tarefas',
      titulo: 'Tarefas',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (a) => (
        <span className="t-dado text-sm">{numero(a.tarefas)}</span>
      ),
    },
  ];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Aulas"
        descricao="As aulas marcadas no portal, por professor e aluno"
      />

      <Stack gap={3}>
        <Busca
          valor={busca}
          aoMudar={setBusca}
          rotulo="Buscar aula"
          placeholder="Título da aula"
        />
        <div className="flex flex-wrap items-end gap-3">
          <Segmentos
            rotulo="Quando"
            valor={quando}
            aoMudar={setQuando}
            opcoes={[
              { valor: 'proximas', rotulo: 'Próximas' },
              { valor: 'passadas', rotulo: 'Passadas' },
              { valor: 'sem-desfecho', rotulo: 'Sem desfecho' },
              { valor: '', rotulo: 'Todas' },
            ]}
          />
          <div className="w-full sm:w-52">
            <FiltroSelecao
              rotulo="Estado"
              valor={estado}
              aoMudar={setEstado}
              opcoes={Object.entries(NOME_DO_ESTADO_DA_AULA).map(
                ([value, label]) => ({ value, label })
              )}
            />
          </div>
          {pessoa && (
            <Chip selecionado onClick={() => setPessoa(null)}>
              {pessoa.papel === 'professor' ? 'Professor' : 'Aluno'}:{' '}
              {pessoa.nome || 'escolhido'}
              <Icon de={PiX} tamanho="pp" className="ml-1.5" />
            </Chip>
          )}
          <Text papel="legenda" as="span" className="t-dado sm:ml-auto">
            {lista.total !== null ? `${numero(lista.total)} aulas` : ''}
          </Text>
        </div>
      </Stack>

      <Tabela
        rotulo="Aulas do portal"
        colunas={colunas}
        linhas={lista.items}
        chave={(a) => a.id}
        carregando={lista.loading}
        aoClicar={(a) => navegar.aula(a.id)}
        maisItens={lista.hasMore}
        carregandoMais={lista.loadingMore}
        aoCarregarMais={lista.loadMore}
        erro={
          lista.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              {lista.error}
            </Text>
          ) : undefined
        }
        vazio={
          <Text papel="rotulo" tom="suave" as="p" className="px-5 py-6">
            Nenhuma aula com esses filtros.
          </Text>
        }
      />
    </Stack>
  );
}
