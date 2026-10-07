'use client';

import { useNavegar } from '@/app/components/Admin/painel/Navegador';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiEye,
  PiPencilSimple,
  PiPlus,
  PiSealCheck,
  PiSealCheckFill,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge, Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Selecao } from '@/app/components/ui/Selecao';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import {
  Cadastro,
  type CadastroAberto,
} from '@/app/components/Admin/painel/Cadastros';
import { BarraDeSelecao, Busca } from '@/app/components/Admin/painel/Controles';
import {
  FiltroData,
  FiltroIntervalo,
  FiltroSelecao,
  FiltroTexto,
  MaisFiltros,
  SIM_NAO,
  fimDoDia,
  inicioDoDia,
  numeroOuNada,
  simNao,
} from '@/app/components/Admin/painel/Filtros';
import {
  Colunas,
  Pizza,
  Proporcoes,
  colunasPorMes,
} from '@/app/components/Admin/painel/Graficos';
import { Numeros, rolarAte } from '@/app/components/Admin/painel/Numeros';
import { Recolhivel } from '@/app/components/Admin/painel/Recolhivel';
import {
  AcaoDaLinha,
  Tabela,
  type Coluna,
} from '@/app/components/Admin/painel/Tabela';
import {
  dataCurta,
  numero,
  porcento,
} from '@/app/components/Admin/painel/formatos';
import {
  useAtualizarCompositor,
  useCompositores,
  useEpocas,
  useResumoCompositores,
  useVerificarCompositores,
} from '@/app/hooks/admin/useCatalogo';
import {
  QUALIDADES,
  type Compositor,
  type FiltrosCompositores,
} from '@/app/requests/admin/catalogo';

/**
 * Compositores: o cadastro, a verificação e a qualidade dos dados.
 *
 * O topo diz onde o cadastro está fraco (sem biografia, sem retrato, sem
 * obra) e fecha para quem só veio editar. Criar e editar o cadastro usam o
 * formulário da comunidade (`Cadastro`); aqui ficam a verificação, a nota, a
 * qualidade e a remoção. Na linha, ícones para ver no site, editar e
 * verificar sem abrir nada.
 */

type Recorte = 'todos' | 'verificados' | 'nao-verificados';

const TOM_QUALIDADE = {
  high: 'neutro',
  medium: 'neutro',
  low: 'atencao',
} as const;

export default function Compositores() {
  const [busca, setBusca] = useState('');
  const [recorte, setRecorte] = useState<Recorte>('todos');
  const [qualidade, setQualidade] = useState('');
  const [epoca, setEpoca] = useState('');
  const [ordem, setOrdem] = useState<'createdAt' | 'name' | 'birthYear'>(
    'name'
  );
  // Filtros avançados
  const [minObras, setMinObras] = useState('');
  const [maxObras, setMaxObras] = useState('');
  const [bio, setBio] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [retrato, setRetrato] = useState('');
  const [datas, setDatas] = useState('');
  const [origem, setOrigem] = useState('');
  const [nacionalidade, setNacionalidade] = useState('');
  const [desde, setDesde] = useState('');
  const [ate, setAte] = useState('');
  const avancados = [
    minObras,
    maxObras,
    bio,
    bioEn,
    retrato,
    datas,
    origem,
    nacionalidade,
    desde,
    ate,
  ];
  const limparAvancados = () => {
    [
      setMinObras,
      setMaxObras,
      setBio,
      setBioEn,
      setRetrato,
      setDatas,
      setOrigem,
      setNacionalidade,
      setDesde,
      setAte,
    ].forEach((f) => f(''));
  };

  const [marcados, setMarcados] = useState<string[]>([]);
  const navegar = useNavegar();
  const [cadastro, setCadastro] = useState<CadastroAberto | null>(null);
  const [nota, setNota] = useState('');
  const [loteAberto, setLoteAberto] = useState<boolean | null>(null);

  const filtros: FiltrosCompositores = {
    search: busca,
    isVerified:
      recorte === 'verificados'
        ? true
        : recorte === 'nao-verificados'
          ? false
          : undefined,
    dataQuality: qualidade || undefined,
    epochId: epoca || undefined,
    minWorks: numeroOuNada(minObras),
    maxWorks: numeroOuNada(maxObras),
    hasBio: simNao(bio),
    hasBioEn: simNao(bioEn),
    hasPortrait: simNao(retrato),
    hasDates: simNao(datas),
    isCustom:
      origem === 'comunidade'
        ? true
        : origem === 'importado'
          ? false
          : undefined,
    nationality: nacionalidade || undefined,
    createdFrom: inicioDoDia(desde),
    createdTo: fimDoDia(ate),
    sortBy: ordem,
  };

  const lista = useCompositores(filtros);
  const epocas = useEpocas();
  const verificar = useVerificarCompositores();
  const atualizar = useAtualizarCompositor();

  const emLote = async () => {
    if (loteAberto === null) return;
    try {
      const r = await verificar.mutateAsync([marcados, loteAberto, nota]);
      toast.success(
        `${numero(r.updated)} ${r.updated === 1 ? 'compositor' : 'compositores'} ${loteAberto ? 'verificados' : 'sem verificação'}.`
      );
      setMarcados([]);
      setLoteAberto(null);
      setNota('');
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível verificar.'
      );
    }
  };

  // Verificar pela linha: sem nota ao verificar; retirar pede o motivo, então
  // abre o detalhe, onde a nota é escrita.
  const alternarVerificacao = async (c: Compositor) => {
    if (c.isVerified) {
      navegar.compositor(c.id, c);
      return;
    }
    try {
      await atualizar.mutateAsync([c.id, { isVerified: true }]);
      toast.success(`${c.name} verificado.`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível verificar.'
      );
    }
  };

  const colunas: Coluna<Compositor>[] = [
    {
      id: 'nome',
      titulo: 'Compositor',
      principal: true,
      celula: (c) => (
        <span className="flex min-w-0 items-center gap-3">
          {c.portraitUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- miniatura de 32px, de qualquer origem
            <img
              src={c.portraitUrl}
              alt=""
              loading="lazy"
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sup-2 font-display text-texto-suave">
              {c.name.charAt(0)}
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <span className="flex min-w-0 items-center gap-1.5 font-display text-[1.0625rem] leading-snug text-texto">
              <span className="truncate">{c.name}</span>
              {c.isVerified && (
                <SeloVerificada className="h-4 w-4 shrink-0 text-verificado" />
              )}
            </span>
            <span className="t-legenda truncate">
              {[
                c.fullName && c.fullName !== c.name ? c.fullName : null,
                [c.birthDate, c.deathDate].filter(Boolean).join('–') || null,
                c.nationality,
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </span>
        </span>
      ),
    },
    {
      id: 'epoca',
      titulo: 'Época',
      celula: (c) => <span className="text-sm">{c.epochName ?? '—'}</span>,
    },
    {
      id: 'obras',
      titulo: 'Obras',
      alinhar: 'fim',
      celula: (c) => numero(c.worksCount ?? 0),
    },
    {
      id: 'qualidade',
      titulo: 'Dados',
      soNoComputador: true,
      celula: (c) =>
        c.dataQuality ? (
          <Badge estado={TOM_QUALIDADE[c.dataQuality]}>
            {QUALIDADES[c.dataQuality]}
          </Badge>
        ) : (
          <span className="t-legenda">não avaliado</span>
        ),
    },
    {
      id: 'desde',
      titulo: 'Entrou',
      soNoComputador: true,
      celula: (c) => (
        <span className="t-dado text-sm">{dataCurta(c.createdAt)}</span>
      ),
    },
  ];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Compositores"
        descricao={
          lista.total !== null
            ? `${numero(lista.total)} neste recorte`
            : undefined
        }
        acoes={
          <Button
            tamanho="p"
            variante="primario"
            icone={PiPlus}
            onClick={() => setCadastro({ tipo: 'composer', id: null })}
          >
            Novo compositor
          </Button>
        }
      />

      <ResumoDoCadastro
        aoFiltrar={(f) => {
          limparAvancados();
          setBusca('');
          setQualidade('');
          setEpoca('');
          setRecorte(f.recorte ?? 'todos');
          if (f.bio) setBio(f.bio);
          if (f.retrato) setRetrato(f.retrato);
          if (f.datas) setDatas(f.datas);
          if (f.maxObras) setMaxObras(f.maxObras);
          if (f.origem) setOrigem(f.origem);
          if (f.epoca) setEpoca(f.epoca);
          if (f.nacionalidade) setNacionalidade(f.nacionalidade);
          rolarAte('compositores-lista');
        }}
      />

      <Stack gap={3} id="compositores-lista" className="scroll-mt-6">
        <Busca
          valor={busca}
          aoMudar={setBusca}
          rotulo="Buscar compositor"
          placeholder="Nome do compositor"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            selecionado={recorte === 'todos'}
            onClick={() => setRecorte('todos')}
          >
            Todos
          </Chip>
          <Chip
            selecionado={recorte === 'nao-verificados'}
            onClick={() => setRecorte('nao-verificados')}
          >
            Não verificados
          </Chip>
          <Chip
            selecionado={recorte === 'verificados'}
            onClick={() => setRecorte('verificados')}
          >
            Verificados
          </Chip>
          <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
            <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
              <label htmlFor="cmp-qualidade" className="sr-only">
                Qualidade dos dados
              </label>
              <Selecao
                id="cmp-qualidade"
                valor={qualidade}
                aoMudar={setQualidade}
                opcoes={[
                  { value: '', label: 'Qualquer qualidade' },
                  ...Object.entries(QUALIDADES).map(([value, label]) => ({
                    value,
                    label: `Dados: ${label.toLowerCase()}`,
                  })),
                ]}
              />
            </div>
            <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
              <label htmlFor="cmp-epoca" className="sr-only">
                Época
              </label>
              <Selecao
                id="cmp-epoca"
                valor={epoca}
                aoMudar={setEpoca}
                opcoes={[
                  { value: '', label: 'Todas as épocas' },
                  ...(epocas.data ?? []).map((e) => ({
                    value: e.id,
                    label: e.name,
                  })),
                ]}
              />
            </div>
            <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
              <label htmlFor="cmp-ordem" className="sr-only">
                Ordenar
              </label>
              <Selecao
                id="cmp-ordem"
                valor={ordem}
                aoMudar={(v) => setOrdem(v as typeof ordem)}
                opcoes={[
                  { value: 'name', label: 'Nome' },
                  { value: 'birthYear', label: 'Nascimento' },
                  { value: 'createdAt', label: 'Mais recentes' },
                ]}
              />
            </div>
          </div>
        </div>
        <MaisFiltros
          ativos={avancados.filter(Boolean).length}
          aoLimpar={limparAvancados}
        >
          <FiltroIntervalo
            rotulo="Obras no catálogo"
            min={minObras}
            max={maxObras}
            aoMudarMin={setMinObras}
            aoMudarMax={setMaxObras}
          />
          <FiltroSelecao
            rotulo="Biografia em português"
            valor={bio}
            aoMudar={setBio}
            opcoes={SIM_NAO}
          />
          <FiltroSelecao
            rotulo="Biografia em inglês"
            valor={bioEn}
            aoMudar={setBioEn}
            opcoes={SIM_NAO}
          />
          <FiltroSelecao
            rotulo="Retrato"
            valor={retrato}
            aoMudar={setRetrato}
            opcoes={[
              { value: 'sim', label: 'Com retrato' },
              { value: 'nao', label: 'Sem retrato' },
            ]}
          />
          <FiltroSelecao
            rotulo="Nascimento e morte"
            valor={datas}
            aoMudar={setDatas}
            opcoes={[
              { value: 'sim', label: 'Com as duas datas' },
              { value: 'nao', label: 'Falta alguma data' },
            ]}
          />
          <FiltroSelecao
            rotulo="Origem"
            valor={origem}
            aoMudar={setOrigem}
            todos="Qualquer"
            opcoes={[
              { value: 'comunidade', label: 'Cadastrado pela comunidade' },
              { value: 'importado', label: 'Importado (IMSLP)' },
            ]}
          />
          <FiltroTexto
            rotulo="Nacionalidade"
            valor={nacionalidade}
            aoMudar={setNacionalidade}
            placeholder="Ex.: German"
          />
          <FiltroData rotulo="Entrou de" valor={desde} aoMudar={setDesde} />
          <FiltroData rotulo="Entrou até" valor={ate} aoMudar={setAte} />
        </MaisFiltros>
      </Stack>

      <BarraDeSelecao
        quantidade={marcados.length}
        singular="compositor selecionado"
        plural="compositores selecionados"
        aoLimpar={() => setMarcados([])}
      >
        <Button tamanho="p" onClick={() => setLoteAberto(false)}>
          Retirar verificação
        </Button>
        <Button
          tamanho="p"
          variante="primario"
          onClick={() => setLoteAberto(true)}
        >
          Verificar
        </Button>
      </BarraDeSelecao>

      <Tabela
        rotulo="Compositores"
        colunas={colunas}
        linhas={lista.items}
        chave={(c) => c.id}
        carregando={lista.loading}
        aoClicar={(c) => navegar.compositor(c.id, c)}
        selecionadas={marcados}
        aoSelecionar={setMarcados}
        rotuloSelecao={(c) => `Selecionar ${c.name}`}
        acoes={(c) => (
          <>
            <AcaoDaLinha
              rotulo={`Ver ${c.name} no site`}
              icone={PiEye}
              href={`/composer/${c.id}`}
            />
            <AcaoDaLinha
              rotulo={`Editar o cadastro de ${c.name}`}
              icone={PiPencilSimple}
              onClick={() => setCadastro({ tipo: 'composer', id: c.id })}
            />
            <AcaoDaLinha
              rotulo={c.isVerified ? 'Retirar a verificação' : 'Verificar'}
              icone={c.isVerified ? PiSealCheckFill : PiSealCheck}
              onClick={() => alternarVerificacao(c)}
            />
          </>
        )}
        erro={
          lista.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              {lista.error}
            </Text>
          ) : undefined
        }
        vazio={
          <Vazio
            titulo="Nenhum compositor neste recorte"
            descricao={
              busca
                ? `Ninguém com “${busca}”.`
                : 'Troque o filtro para ver outros.'
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

      <ConfirmModal
        isOpen={loteAberto !== null}
        onClose={() => {
          setLoteAberto(null);
          setNota('');
        }}
        onConfirm={emLote}
        type="question"
        title={
          loteAberto
            ? `Verificar ${marcados.length} compositores?`
            : `Retirar a verificação de ${marcados.length}?`
        }
        message={
          loteAberto
            ? 'O selo aparece nos compositores e nas obras deles.'
            : 'O selo some. A nota fica registrada — é o que explica a decisão depois.'
        }
        confirmText={loteAberto ? 'Verificar' : 'Retirar'}
        cancelText="Voltar"
        isLoading={verificar.isPending}
        confirmarBloqueado={loteAberto === false && nota.trim().length < 3}
      >
        <Field.Area
          label={loteAberto ? 'Nota (opcional)' : 'Motivo'}
          ajuda={
            loteAberto
              ? 'Fonte ou critério usado na conferência.'
              : 'Obrigatório ao retirar a verificação.'
          }
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          rows={2}
        />
      </ConfirmModal>

      <Cadastro aberto={cadastro} aoFechar={() => setCadastro(null)} />
    </Stack>
  );
}

const PCT = (parte: number, todo: number) =>
  todo > 0 ? porcento((parte / todo) * 100) : '—';

/** O retrato do cadastro inteiro, sem filtro. Fecha e fica fechado. */
interface FiltroDoResumo {
  recorte?: Recorte;
  epoca?: string;
  nacionalidade?: string;
  bio?: string;
  retrato?: string;
  datas?: string;
  maxObras?: string;
  origem?: string;
}

function ResumoDoCadastro({
  aoFiltrar,
}: {
  /** Cada número filtra a lista embaixo pelo recorte que ele conta. */
  aoFiltrar: (f: FiltroDoResumo) => void;
}) {
  const { data: r, loading } = useResumoCompositores();

  return (
    <Recolhivel
      chave="compositores"
      titulo="O cadastro"
      resumo={
        r
          ? `${numero(r.total)} compositores · ${PCT(r.verificados, r.total)} verificados · ${numero(r.semObras)} sem obra`
          : undefined
      }
    >
      <Numeros
        carregando={loading}
        colunas={6}
        itens={[
          {
            id: 'total',
            rotulo: 'Compositores',
            aoClicar: () => aoFiltrar({}),
            valor: numero(r?.total),
            nota: r ? `${numero(r.novos30)} novos em 30 dias` : undefined,
          },
          {
            id: 'verificados',
            rotulo: 'Verificados',
            aoClicar: () => aoFiltrar({ recorte: 'verificados' }),
            valor: r ? PCT(r.verificados, r.total) : '—',
            nota: r ? `${numero(r.verificados)} compositores` : undefined,
          },
          {
            id: 'bio',
            rotulo: 'Com biografia',
            aoClicar: () => aoFiltrar({ bio: 'sim' }),
            valor: r ? PCT(r.comBio, r.total) : '—',
            nota: r ? `${PCT(r.comBioEn, r.total)} em inglês` : undefined,
          },
          {
            id: 'retrato',
            rotulo: 'Com retrato',
            aoClicar: () => aoFiltrar({ retrato: 'sim' }),
            valor: r ? PCT(r.comRetrato, r.total) : '—',
            nota: r ? `${numero(r.comRetrato)} com foto de verdade` : undefined,
          },
          {
            id: 'datas',
            rotulo: 'Com as duas datas',
            aoClicar: () => aoFiltrar({ datas: 'sim' }),
            valor: r ? PCT(r.comDatas, r.total) : '—',
            nota: 'nascimento e morte',
          },
          {
            id: 'sem-obra',
            rotulo: 'Sem obra',
            aoClicar: () => aoFiltrar({ maxObras: '0' }),
            valor: numero(r?.semObras),
            nota: r
              ? `${numero(r.comunidade)} vieram da comunidade`
              : undefined,
          },
        ]}
      />
      {r && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Qualidade dos dados
            </Text>
            <Proporcoes
              titulo="Compositores por qualidade dos dados"
              dados={[
                { rotulo: 'Alta', valor: r.porQualidade.high ?? 0 },
                { rotulo: 'Média', valor: r.porQualidade.medium ?? 0 },
                { rotulo: 'Baixa', valor: r.porQualidade.low ?? 0 },
                {
                  rotulo: 'Não avaliado',
                  valor:
                    (r.porQualidade.none ?? 0) + (r.porQualidade.null ?? 0),
                },
              ]}
            />
          </Stack>
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Mais obras no catálogo
            </Text>
            <Proporcoes
              titulo="Compositores com mais obras"
              dados={r.maisObras.map((c) => ({
                rotulo: c.name,
                valor: c.works,
              }))}
            />
          </Stack>
        </div>
      )}
      {r && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Por época
            </Text>
            <Pizza
              titulo="Compositores por época"
              dados={(r.porEpoca ?? []).map((e) => ({
                rotulo: e.nome,
                valor: e.n,
                id: e.id,
              }))}
              rotuloOutras="Outras épocas"
              aoClicar={(p) => p.id && aoFiltrar({ epoca: p.id })}
            />
          </Stack>
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Nacionalidades mais comuns
            </Text>
            <Proporcoes
              titulo="Compositores por nacionalidade"
              dados={(r.porNacionalidade ?? []).slice(0, 8).map((n) => ({
                rotulo: n.nome,
                valor: n.n,
              }))}
              base={r.total}
            />
          </Stack>
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Cadastrados por mês
            </Text>
            <Colunas
              titulo="Compositores cadastrados por mês"
              dados={colunasPorMes(r.novosPorMes ?? [])}
              altura={140}
            />
          </Stack>
        </div>
      )}
    </Recolhivel>
  );
}
