'use client';

import { useNavegar } from '@/app/components/Admin/painel/Navegador';
import {
  Papel,
  PERFIS,
  NIVEIS,
} from '@/app/components/Admin/fichas/FichaUsuario';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { PiDownloadSimple } from 'react-icons/pi';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Stack } from '@/app/components/ui/Layout';
import { Selecao } from '@/app/components/ui/Selecao';
import { Text } from '@/app/components/ui/Text';
import { Avatar } from '@/app/components/Admin/painel/Avatar';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Busca } from '@/app/components/Admin/painel/Controles';
import {
  FiltroData,
  FiltroSelecao,
  MaisFiltros,
  SIM_NAO,
  fimDoDia,
  inicioDoDia,
  simNao,
} from '@/app/components/Admin/painel/Filtros';
import { Proporcoes } from '@/app/components/Admin/painel/Graficos';
import { Numeros, rolarAte } from '@/app/components/Admin/painel/Numeros';
import { Recolhivel } from '@/app/components/Admin/painel/Recolhivel';
import { Tabela, type Coluna } from '@/app/components/Admin/painel/Tabela';
import {
  PLANOS,
  dataCurta,
  numero,
  porcento,
  relativo,
} from '@/app/components/Admin/painel/formatos';
import type { AdminUser } from '@/app/requests/admin/users';
import { useResumoUsuarios, useUsuarios } from '@/app/hooks/admin/usePainel';
import {
  exportAdminUsers,
  type UserListFilters,
} from '@/app/requests/admin/users';

/**
 * Usuários: as contas, quem é professor, quem administra.
 *
 * **O que saiu.** O menu antigo tinha "Anotadores", "Contribuidores" e
 * "Usuários ativos" como páginas — links para esta lista com parâmetros que a
 * API não aceita e ignorava: os três mostravam a lista inteira. Também saiu a
 * "pontuação de envios", que a API não calcula mais. O que ficou são os
 * filtros que existem (perfil, professor, papel) e as ordens que a API faz.
 *
 * O detalhe abre ao lado: os números da conta, o plano que ela tem hoje, e o
 * que o painel já fez com ela (a trilha, filtrada pela conta).
 */

type Recorte = 'todos' | 'professores' | 'admins';

export default function Usuarios() {
  const [busca, setBusca] = useState('');
  const [recorte, setRecorte] = useState<Recorte>('todos');
  const [perfil, setPerfil] = useState('');
  const [ordem, setOrdem] = useState('createdAt');
  const [nivel, setNivel] = useState('');
  const [plano, setPlano] = useState('');
  const [atividade, setAtividade] = useState('');
  const [email, setEmail] = useState('');
  const [cadastro, setCadastro] = useState('');
  const [publico, setPublico] = useState('');
  const [desde, setDesde] = useState('');
  const [ate, setAte] = useState('');
  // Um número de outra tela chega aqui já filtrado (`?atividade=30d`,
  // `?plano=PLUS`). Lido depois de montar, para o HTML do servidor bater.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const a = q.get('atividade');
    if (a && ['7d', '30d', 'inactive90', 'never'].includes(a)) setAtividade(a);
    if (q.get('cadastro') === 'sim') setCadastro('sim');
    const r = q.get('recorte');
    if (r === 'professores' || r === 'admins') setRecorte(r);
    const p = q.get('plano');
    if (p && ['FREE', 'PLUS', 'MENTOR', 'MAESTRO'].includes(p)) setPlano(p);
  }, []);
  const avancados = [
    nivel,
    plano,
    atividade,
    email,
    cadastro,
    publico,
    desde,
    ate,
  ];
  const limparAvancados = () => {
    setNivel('');
    setPlano('');
    setAtividade('');
    setEmail('');
    setCadastro('');
    setPublico('');
    setDesde('');
    setAte('');
  };
  const navegar = useNavegar();
  const [exportando, setExportando] = useState(false);

  const filtros: UserListFilters = {
    search: busca || undefined,
    userType: perfil || undefined,
    isTeacher: recorte === 'professores' ? true : undefined,
    role: recorte === 'admins' ? 2 : undefined,
    experienceLevel: nivel || undefined,
    plan: (plano || undefined) as UserListFilters['plan'],
    activity: (atividade || undefined) as UserListFilters['activity'],
    emailVerified: simNao(email),
    onboardingCompleted: simNao(cadastro),
    profilePublic: simNao(publico),
    createdFrom: inicioDoDia(desde),
    createdTo: fimDoDia(ate),
    sortBy: ordem as UserListFilters['sortBy'],
    sortOrder: ordem === 'name' || ordem === 'email' ? 'asc' : 'desc',
  };

  const lista = useUsuarios(filtros);

  const exportar = async () => {
    setExportando(true);
    try {
      await exportAdminUsers(
        filtros,
        `usuarios-${new Date().toISOString().slice(0, 10)}.csv`
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível exportar.'
      );
    } finally {
      setExportando(false);
    }
  };

  const colunas: Coluna<AdminUser>[] = [
    {
      id: 'pessoa',
      titulo: 'Pessoa',
      principal: true,
      celula: (u) => (
        <span className="flex min-w-0 items-center gap-3">
          <Avatar nome={u.name || u.email} imagem={u.image} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[0.9375rem] text-texto">
              {u.name || u.username || 'Sem nome'}
            </span>
            <span className="t-legenda truncate">{u.email}</span>
          </span>
        </span>
      ),
    },
    {
      id: 'perfil',
      titulo: 'Perfil',
      soNoComputador: true,
      celula: (u) =>
        u.userType ? (
          PERFIS[u.userType]
        ) : (
          <span className="t-legenda">não informou</span>
        ),
    },
    { id: 'papel', titulo: 'Papel', celula: (u) => <Papel u={u} /> },
    {
      id: 'anotacoes',
      titulo: 'Anotações',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (u) => numero(u.annotationsCount),
    },
    {
      id: 'envios',
      titulo: 'Envios',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (u) => numero(u.uploadsCount),
    },
    {
      id: 'acesso',
      titulo: 'Último acesso',
      celula: (u) => (
        <span className="text-sm">
          {u.lastSeen ? (
            relativo(u.lastSeen)
          ) : (
            <span className="t-legenda">nunca</span>
          )}
        </span>
      ),
    },
    {
      id: 'desde',
      titulo: 'Desde',
      soNoComputador: true,
      celula: (u) => (
        <span className="t-dado text-sm">{dataCurta(u.createdAt)}</span>
      ),
    },
  ];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Usuários"
        descricao={
          lista.total !== null
            ? `${numero(lista.total)} contas neste recorte`
            : undefined
        }
        acoes={
          <Button
            tamanho="p"
            icone={PiDownloadSimple}
            onClick={exportar}
            carregando={exportando}
          >
            Exportar CSV
          </Button>
        }
      />

      <ResumoDaBase
        aoFiltrar={(f) => {
          limparAvancados();
          setRecorte('todos');
          setBusca('');
          if (f.atividade) setAtividade(f.atividade);
          if (f.email) setEmail(f.email);
          if (f.cadastro) setCadastro(f.cadastro);
          if (f.plano) setPlano(f.plano);
          rolarAte('usuarios-lista');
        }}
      />

      <Stack gap={3} id="usuarios-lista" className="scroll-mt-6">
        <Busca
          valor={busca}
          aoMudar={setBusca}
          rotulo="Buscar por nome, e-mail ou usuário"
          placeholder="Nome, e-mail ou usuário"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            selecionado={recorte === 'todos'}
            onClick={() => setRecorte('todos')}
          >
            Todas as contas
          </Chip>
          <Chip
            selecionado={recorte === 'professores'}
            onClick={() => setRecorte('professores')}
          >
            Professores
          </Chip>
          <Chip
            selecionado={recorte === 'admins'}
            onClick={() => setRecorte('admins')}
          >
            Administradores
          </Chip>
          <div className="ml-auto flex flex-wrap gap-2">
            <div className="w-52">
              <label htmlFor="usu-perfil" className="sr-only">
                Perfil
              </label>
              <Selecao
                id="usu-perfil"
                valor={perfil}
                aoMudar={setPerfil}
                opcoes={[
                  { value: '', label: 'Todos os perfis' },
                  ...Object.entries(PERFIS).map(([value, label]) => ({
                    value,
                    label,
                  })),
                ]}
              />
            </div>
            <div className="w-52">
              <label htmlFor="usu-ordem" className="sr-only">
                Ordenar por
              </label>
              <Selecao
                id="usu-ordem"
                valor={ordem}
                aoMudar={setOrdem}
                opcoes={[
                  { value: 'createdAt', label: 'Mais recentes' },
                  { value: 'lastSeen', label: 'Último acesso' },
                  { value: 'name', label: 'Nome' },
                  { value: 'email', label: 'E-mail' },
                ]}
              />
            </div>
          </div>
        </div>
        <MaisFiltros
          ativos={avancados.filter(Boolean).length}
          aoLimpar={limparAvancados}
        >
          <FiltroSelecao
            rotulo="Nível"
            valor={nivel}
            aoMudar={setNivel}
            opcoes={Object.entries(NIVEIS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <FiltroSelecao
            rotulo="Plano hoje"
            valor={plano}
            aoMudar={setPlano}
            opcoes={[
              { value: 'FREE', label: 'Free (sem assinatura)' },
              { value: 'PLUS', label: 'Plus' },
              { value: 'MENTOR', label: 'Mentor' },
              { value: 'MAESTRO', label: 'Maestro' },
            ]}
          />
          <FiltroSelecao
            rotulo="Último acesso"
            valor={atividade}
            aoMudar={setAtividade}
            todos="Qualquer"
            opcoes={[
              { value: '7d', label: 'Nos últimos 7 dias' },
              { value: '30d', label: 'Nos últimos 30 dias' },
              { value: 'inactive90', label: 'Há mais de 90 dias' },
              { value: 'never', label: 'Nunca entrou' },
            ]}
          />
          <FiltroSelecao
            rotulo="E-mail confirmado"
            valor={email}
            aoMudar={setEmail}
            opcoes={SIM_NAO}
          />
          <FiltroSelecao
            rotulo="Cadastro inicial concluído"
            valor={cadastro}
            aoMudar={setCadastro}
            opcoes={SIM_NAO}
          />
          <FiltroSelecao
            rotulo="Perfil público"
            valor={publico}
            aoMudar={setPublico}
            opcoes={SIM_NAO}
          />
          <FiltroData
            rotulo="Conta criada de"
            valor={desde}
            aoMudar={setDesde}
          />
          <FiltroData rotulo="Conta criada até" valor={ate} aoMudar={setAte} />
        </MaisFiltros>
      </Stack>

      <Tabela
        rotulo="Usuários"
        colunas={colunas}
        linhas={lista.items}
        chave={(u) => u.id}
        carregando={lista.loading}
        aoClicar={(u) => navegar.usuario(u.id)}
        erro={
          lista.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              {lista.error}
            </Text>
          ) : undefined
        }
        vazio={
          <Vazio
            titulo="Ninguém neste recorte"
            descricao={
              busca
                ? `Nenhuma conta com “${busca}”.`
                : 'Troque o filtro para ver outras contas.'
            }
          />
        }
        rodape={
          lista.total !== null
            ? `${numero(lista.items.length)} de ${numero(lista.total)}`
            : undefined
        }
        maisItens={lista.hasMore}
        carregandoMais={lista.loadingMore}
        aoCarregarMais={lista.loadMore}
      />
    </Stack>
  );
}

const PERCENT = (parte: number, todo: number) =>
  todo > 0 ? porcento((parte / todo) * 100) : '—';

/** O topo da tela: a base inteira, sem filtro. Fecha e fica fechada. */
interface FiltroDoResumo {
  atividade?: string;
  email?: string;
  cadastro?: string;
  plano?: string;
}

function ResumoDaBase({
  aoFiltrar,
}: {
  /** Cada número filtra a lista embaixo pelo recorte que ele conta. */
  aoFiltrar: (f: FiltroDoResumo) => void;
}) {
  const router = useRouter();
  const { data: r, loading } = useResumoUsuarios();
  const pagantes = r
    ? Object.values(r.pagantesPorPlano).reduce((a, b) => a + (b ?? 0), 0)
    : 0;

  return (
    <Recolhivel
      chave="usuarios"
      titulo="A base"
      resumo={
        r
          ? `${numero(r.total)} contas · ${numero(r.ativos30)} ativas em 30 dias · ${numero(pagantes)} pagantes`
          : undefined
      }
    >
      <Numeros
        carregando={loading}
        colunas={6}
        itens={[
          {
            id: 'total',
            rotulo: 'Contas',
            aoClicar: () => aoFiltrar({}),
            valor: numero(r?.total),
            nota: r
              ? `${numero(r.novos30)} novas em 30 dias (antes: ${numero(r.novosAnteriores)})`
              : undefined,
          },
          {
            id: 'ativos',
            rotulo: 'Entraram em 7 dias',
            aoClicar: () => aoFiltrar({ atividade: '7d' }),
            valor: numero(r?.ativos7),
            nota: r ? `${numero(r.ativos30)} em 30 dias` : undefined,
          },
          {
            id: 'nunca',
            rotulo: 'Nunca entraram',
            aoClicar: () => aoFiltrar({ atividade: 'never' }),
            valor: numero(r?.nuncaEntraram),
            nota: r
              ? `${PERCENT(r.nuncaEntraram, r.total)} da base`
              : undefined,
          },
          {
            id: 'email',
            rotulo: 'E-mail confirmado',
            aoClicar: () => aoFiltrar({ email: 'sim' }),
            valor: r ? PERCENT(r.emailVerificado, r.total) : '—',
            nota: r ? `${numero(r.emailVerificado)} contas` : undefined,
          },
          {
            id: 'cadastro',
            rotulo: 'Cadastro concluído',
            aoClicar: () => aoFiltrar({ cadastro: 'sim' }),
            valor: r ? PERCENT(r.cadastroConcluido, r.total) : '—',
            nota: r ? `${numero(r.cadastroConcluido)} contas` : undefined,
          },
          {
            id: 'pagantes',
            rotulo: 'Pagantes',
            aoClicar: () => router.push('/admin/plans/subscribers'),
            valor: numero(pagantes),
            nota: r
              ? (['PLUS', 'MENTOR', 'MAESTRO'] as const)
                  .map(
                    (p) => `${numero(r.pagantesPorPlano[p] ?? 0)} ${PLANOS[p]}`
                  )
                  .join(' · ')
              : undefined,
          },
        ]}
      />
      {r && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              O que fazem no site
            </Text>
            <Proporcoes
              titulo="Contas que já usaram cada parte do site"
              base={r.total}
              dados={[
                { rotulo: 'Favoritaram uma obra', valor: r.usam.favoritam },
                { rotulo: 'Marcaram uma aprendida', valor: r.usam.aprenderam },
                { rotulo: 'Escreveram anotação', valor: r.usam.anotam },
                {
                  rotulo: 'Contribuíram com o catálogo',
                  valor: r.usam.contribuem,
                },
              ]}
            />
          </Stack>
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Por nível
            </Text>
            <Proporcoes
              titulo="Contas por nível"
              dados={Object.entries(r.porNivel)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => ({
                  rotulo: NIVEIS[k] ?? 'Não informou',
                  valor: v,
                }))}
            />
          </Stack>
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Por perfil
            </Text>
            <Proporcoes
              titulo="Contas por perfil"
              dados={Object.entries(r.porPerfil)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => ({
                  rotulo: PERFIS[k] ?? 'Não informou',
                  valor: v,
                }))}
            />
          </Stack>
        </div>
      )}
    </Recolhivel>
  );
}
