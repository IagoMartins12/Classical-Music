'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiCalendarBlank, PiClipboardText } from 'react-icons/pi';
import { Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Avatar } from '@/app/components/Admin/painel/Avatar';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Busca } from '@/app/components/Admin/painel/Controles';
import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';
import {
  AcaoDaLinha,
  Tabela,
  type Coluna,
} from '@/app/components/Admin/painel/Tabela';
import { dataCurta, numero } from '@/app/components/Admin/painel/formatos';
import { adminKeys, useAdminInfinite } from '@/app/hooks/admin/query';
import {
  getAlunosDoPortal,
  getProfessoresDoPortal,
  type AlunoDoPortal,
  type PessoaDoPortal,
  type ProfessorDoPortal,
} from '@/app/requests/admin/portal';

/**
 * Professores e alunos do portal de estudo. Cada pessoa abre a conta (a
 * ficha do usuário); as ações da linha levam às aulas e às tarefas dela, já
 * filtradas. Escola, quando existir, entra aqui como mais um recorte.
 */

const urlCom = (base: string, papel: string, p: PessoaDoPortal) =>
  `${base}?${papel}=${p.id}&nome=${encodeURIComponent(p.nome ?? '')}`;

function Pessoa({ p }: { p: PessoaDoPortal }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar nome={p.nome ?? '?'} imagem={p.imagem} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[0.9375rem] text-texto">
          {p.nome ?? 'Conta sem nome'}
        </span>
        <span className="t-legenda truncate">{p.email}</span>
      </span>
    </span>
  );
}

function useLista<T>(
  chave: string,
  busca: string,
  buscar: (
    busca: string,
    page: number
  ) => Promise<{
    items: T[];
    pagination: { total: number; totalPages: number };
  }>
) {
  return useAdminInfinite<T>(
    adminKeys.list('portal', { [chave]: busca }),
    async (cursor) => {
      const pagina = cursor ? Number(cursor) : 1;
      const r = await buscar(busca, pagina);
      return {
        items: r.items,
        total: r.pagination.total,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    }
  );
}

export function PortalProfessores() {
  const navegar = useNavegar();
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const lista = useLista<ProfessorDoPortal>(
    'professores',
    busca,
    getProfessoresDoPortal
  );

  const colunas: Coluna<ProfessorDoPortal>[] = [
    {
      id: 'quem',
      titulo: 'Professor',
      principal: true,
      celula: (p) => <Pessoa p={p} />,
    },
    {
      id: 'estado',
      titulo: 'Estado',
      celula: (p) => (
        <span className="text-sm">
          {p.status === 'ACTIVE'
            ? 'Ativo'
            : p.status === 'PENDING'
              ? 'Aguardando'
              : 'Inativo'}
          {p.verificado ? ' · verificado' : ''}
        </span>
      ),
    },
    {
      id: 'alunos',
      titulo: 'Alunos ativos',
      alinhar: 'fim',
      celula: (p) => (
        <span className="t-dado text-sm">{numero(p.alunosAtivos)}</span>
      ),
    },
    {
      id: 'aulas',
      titulo: 'Aulas em 30 dias',
      alinhar: 'fim',
      celula: (p) => (
        <span className="t-dado text-sm">{numero(p.aulas30Dias)}</span>
      ),
    },
    {
      id: 'proximas',
      titulo: 'Próximas',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (p) => (
        <span className="t-dado text-sm">{numero(p.proximasAulas)}</span>
      ),
    },
  ];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Professores"
        descricao="Quem dá aula no portal, com alunos e agenda"
      />
      <Busca
        valor={busca}
        aoMudar={setBusca}
        rotulo="Buscar professor"
        placeholder="Nome, usuário ou e-mail"
      />
      <Tabela
        rotulo="Professores do portal"
        colunas={colunas}
        linhas={lista.items}
        chave={(p) => p.id}
        carregando={lista.loading}
        aoClicar={(p) => p.userId && navegar.usuario(p.userId)}
        acoes={(p) => (
          <>
            <AcaoDaLinha
              rotulo={`Aulas de ${p.nome}`}
              icone={PiCalendarBlank}
              onClick={() =>
                router.push(urlCom('/admin/study/lessons', 'professor', p))
              }
            />
            <AcaoDaLinha
              rotulo={`Tarefas passadas por ${p.nome}`}
              icone={PiClipboardText}
              onClick={() =>
                router.push(urlCom('/admin/study/assignments', 'professor', p))
              }
            />
          </>
        )}
        maisItens={lista.hasMore}
        carregandoMais={lista.loadingMore}
        aoCarregarMais={lista.loadMore}
        rodape={
          lista.total !== null
            ? `${numero(lista.total)} professores`
            : undefined
        }
        erro={
          lista.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              {lista.error}
            </Text>
          ) : undefined
        }
        vazio={
          <Text papel="rotulo" tom="suave" as="p" className="px-5 py-6">
            Nenhum professor encontrado.
          </Text>
        }
      />
    </Stack>
  );
}

export function PortalAlunos() {
  const navegar = useNavegar();
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const lista = useLista<AlunoDoPortal>('alunos', busca, getAlunosDoPortal);

  const colunas: Coluna<AlunoDoPortal>[] = [
    {
      id: 'quem',
      titulo: 'Aluno',
      principal: true,
      celula: (a) => <Pessoa p={a} />,
    },
    {
      id: 'professores',
      titulo: 'Professores',
      celula: (a) =>
        a.professores.length === 0 ? (
          <span className="t-legenda">estudo pessoal</span>
        ) : (
          <span className="flex flex-wrap gap-x-2 text-sm">
            {a.professores.map((p) => (
              <Elo
                key={p.id}
                onClick={() => p.userId && navegar.usuario(p.userId)}
              >
                {p.nome}
              </Elo>
            ))}
          </span>
        ),
    },
    {
      id: 'tarefas',
      titulo: 'Tarefas',
      celula: (a) => (
        <span className="t-dado text-sm">
          {numero(a.tarefasAbertas)} abertas
          {a.tarefasAtrasadas
            ? ` · ${numero(a.tarefasAtrasadas)} atrasadas`
            : ''}
          {` · ${numero(a.tarefasConcluidas)} feitas`}
        </span>
      ),
    },
    {
      id: 'ultima',
      titulo: 'Última aula',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (a) => (
        <span className="t-dado text-sm">
          {a.ultimaAula ? dataCurta(a.ultimaAula) : '—'}
        </span>
      ),
    },
  ];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Alunos"
        descricao="Quem estuda no portal, com professores e tarefas"
      />
      <Busca
        valor={busca}
        aoMudar={setBusca}
        rotulo="Buscar aluno"
        placeholder="Nome, usuário ou e-mail"
      />
      <Tabela
        rotulo="Alunos do portal"
        colunas={colunas}
        linhas={lista.items}
        chave={(a) => a.id}
        carregando={lista.loading}
        aoClicar={(a) => a.userId && navegar.usuario(a.userId)}
        acoes={(a) => (
          <>
            <AcaoDaLinha
              rotulo={`Aulas de ${a.nome}`}
              icone={PiCalendarBlank}
              onClick={() =>
                router.push(urlCom('/admin/study/lessons', 'aluno', a))
              }
            />
            <AcaoDaLinha
              rotulo={`Tarefas de ${a.nome}`}
              icone={PiClipboardText}
              onClick={() =>
                router.push(urlCom('/admin/study/assignments', 'aluno', a))
              }
            />
          </>
        )}
        maisItens={lista.hasMore}
        carregandoMais={lista.loadingMore}
        aoCarregarMais={lista.loadMore}
        rodape={
          lista.total !== null ? `${numero(lista.total)} alunos` : undefined
        }
        erro={
          lista.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              {lista.error}
            </Text>
          ) : undefined
        }
        vazio={
          <Text papel="rotulo" tom="suave" as="p" className="px-5 py-6">
            Nenhum aluno encontrado.
          </Text>
        }
      />
    </Stack>
  );
}
