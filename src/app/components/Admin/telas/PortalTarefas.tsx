'use client';

import { useEffect, useState } from 'react';
import { PiX } from 'react-icons/pi';
import { Chip } from '@/app/components/ui/Badge';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Busca, Segmentos } from '@/app/components/Admin/painel/Controles';
import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';
import { Tabela, type Coluna } from '@/app/components/Admin/painel/Tabela';
import { dataCurta, numero } from '@/app/components/Admin/painel/formatos';
import { adminKeys, useAdminInfinite } from '@/app/hooks/admin/query';
import {
  NOME_DA_SITUACAO,
  getTarefasDoPortal,
  type FiltroDeTarefas,
  type TarefaDoPortal,
} from '@/app/requests/admin/portal';

/**
 * As tarefas do portal: em vigor (abertas e no prazo), atrasadas e
 * concluídas. Cada tarefa abre a ficha (com a aula de onde saiu); aluno e
 * professor abrem a conta. Chega filtrada pela URL (`?situacao=`,
 * `?aluno=&nome=`, `?professor=&nome=`).
 */

type Situacao = '' | 'em-vigor' | 'atrasadas' | 'concluidas';

export default function PortalTarefas() {
  const navegar = useNavegar();
  const [situacao, setSituacao] = useState<Situacao>('em-vigor');
  const [busca, setBusca] = useState('');
  const [pessoa, setPessoa] = useState<{
    papel: 'professor' | 'aluno';
    id: string;
    nome: string;
  } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const s = q.get('situacao');
    if (s === 'em-vigor' || s === 'atrasadas' || s === 'concluidas') {
      setSituacao(s);
    }
    const nome = q.get('nome') ?? '';
    const prof = q.get('professor');
    const aluno = q.get('aluno');
    if (prof) setPessoa({ papel: 'professor', id: prof, nome });
    else if (aluno) setPessoa({ papel: 'aluno', id: aluno, nome });
    if ((prof || aluno) && !s) setSituacao('');
  }, []);

  const filtro: FiltroDeTarefas = {
    situacao: situacao || undefined,
    search: busca || undefined,
    teacherId: pessoa?.papel === 'professor' ? pessoa.id : undefined,
    studentId: pessoa?.papel === 'aluno' ? pessoa.id : undefined,
  };
  const lista = useAdminInfinite<TarefaDoPortal>(
    adminKeys.list('portal', { tarefas: filtro }),
    async (cursor) => {
      const pagina = cursor ? Number(cursor) : 1;
      const r = await getTarefasDoPortal(filtro, pagina);
      return {
        items: r.items,
        total: r.pagination.total,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    }
  );

  const colunas: Coluna<TarefaDoPortal>[] = [
    {
      id: 'tarefa',
      titulo: 'Tarefa',
      principal: true,
      celula: (t) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[0.9375rem] text-texto">
            {t.titulo}
          </span>
          <span className="t-legenda truncate">da aula {t.aula.titulo}</span>
        </span>
      ),
    },
    {
      id: 'aluno',
      titulo: 'Aluno',
      celula: (t) =>
        t.aluno.userId ? (
          <Elo
            onClick={() => navegar.usuario(t.aluno.userId!)}
            className="text-sm"
          >
            {t.aluno.nome}
          </Elo>
        ) : (
          '—'
        ),
    },
    {
      id: 'professor',
      titulo: 'Professor',
      soNoComputador: true,
      celula: (t) =>
        t.professor.userId ? (
          <Elo
            onClick={() => navegar.usuario(t.professor.userId!)}
            className="text-sm"
          >
            {t.professor.nome}
          </Elo>
        ) : (
          '—'
        ),
    },
    {
      id: 'prazo',
      titulo: 'Prazo',
      celula: (t) => (
        <span className="t-dado text-sm">
          {t.prazo ? dataCurta(t.prazo) : 'sem prazo'}
        </span>
      ),
    },
    {
      id: 'situacao',
      titulo: 'Situação',
      celula: (t) => (
        <span className="text-sm">
          {t.concluida
            ? `Concluída${t.concluidaEm ? ` em ${dataCurta(t.concluidaEm)}` : ''}`
            : t.atrasada
              ? 'Atrasada'
              : (NOME_DA_SITUACAO[t.status] ?? t.status)}
          {!t.concluida && t.progresso !== null
            ? ` · ${Math.round(t.progresso)}%`
            : ''}
        </span>
      ),
    },
  ];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Tarefas"
        descricao="O que os professores passaram e o que os alunos entregaram"
      />

      <Stack gap={3}>
        <Busca
          valor={busca}
          aoMudar={setBusca}
          rotulo="Buscar tarefa"
          placeholder="Título da tarefa"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Segmentos
            rotulo="Situação"
            valor={situacao}
            aoMudar={setSituacao}
            opcoes={[
              { valor: 'em-vigor', rotulo: 'Em vigor' },
              { valor: 'atrasadas', rotulo: 'Atrasadas' },
              { valor: 'concluidas', rotulo: 'Concluídas' },
              { valor: '', rotulo: 'Todas' },
            ]}
          />
          {pessoa && (
            <Chip selecionado onClick={() => setPessoa(null)}>
              {pessoa.papel === 'professor' ? 'Professor' : 'Aluno'}:{' '}
              {pessoa.nome || 'escolhido'}
              <Icon de={PiX} tamanho="pp" className="ml-1.5" />
            </Chip>
          )}
          <Text papel="legenda" as="span" className="t-dado sm:ml-auto">
            {lista.total !== null ? `${numero(lista.total)} tarefas` : ''}
          </Text>
        </div>
      </Stack>

      <Tabela
        rotulo="Tarefas do portal"
        colunas={colunas}
        linhas={lista.items}
        chave={(t) => t.id}
        carregando={lista.loading}
        aoClicar={(t) => navegar.tarefa(t.id)}
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
            Nenhuma tarefa com esses filtros.
          </Text>
        }
      />
    </Stack>
  );
}
