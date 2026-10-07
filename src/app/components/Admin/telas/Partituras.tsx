'use client';

import { useNavegar } from '@/app/components/Admin/painel/Navegador';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  PiEye,
  PiEyeSlash,
  PiFilePdf,
  PiPencilSimple,
  PiPlus,
  PiTrash,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge, Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import {
  Cadastro,
  type CadastroAberto,
} from '@/app/components/Admin/painel/Cadastros';
import { BarraDeSelecao, Busca } from '@/app/components/Admin/painel/Controles';
import { Escolher, type Opcao } from '@/app/components/Admin/painel/Escolher';
import {
  FiltroData,
  FiltroSelecao,
  MaisFiltros,
  fimDoDia,
  inicioDoDia,
  simNao,
} from '@/app/components/Admin/painel/Filtros';
import {
  Colunas,
  Pizza,
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
  useApagarPartitura,
  useAtualizarPartitura,
  usePartituras,
  useResumoPartituras,
} from '@/app/hooks/admin/useCatalogo';
import {
  ORIGENS,
  TIPOS_DE_PARTITURA,
  buscarCompositores,
  buscarObras,
  type FiltrosPartituras,
  type Partitura,
} from '@/app/requests/admin/catalogo';

/**
 * Partituras: o arquivo de cada obra — título, se está no ar, de onde veio.
 *
 * Desativar tira a partitura do site sem apagar (a retenção automática de
 * denúncia grave faz o mesmo); remover apaga o registro e o arquivo, e fica
 * no histórico de envios e na auditoria. Na linha: abrir o arquivo, editar o
 * cadastro e ligar/desligar sem abrir nada. Em lote: ligar, desligar,
 * remover.
 */

type Recorte = 'todas' | 'ativas' | 'desativadas';

export default function Partituras() {
  const [busca, setBusca] = useState('');
  const [recorte, setRecorte] = useState<Recorte>('todas');
  const navegar = useNavegar();
  const [cadastro, setCadastro] = useState<CadastroAberto | null>(null);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [apagandoLote, setApagandoLote] = useState(false);
  const [emLote, setEmLote] = useState(false);
  // Filtros avançados
  const [obra, setObra] = useState<Opcao | null>(null);
  const [compositor, setCompositor] = useState<Opcao | null>(null);
  const [tipo, setTipo] = useState('');
  const [origem, setOrigem] = useState('');
  const [arquivo, setArquivo] = useState('');
  const [desde, setDesde] = useState('');
  const [ate, setAte] = useState('');
  // A ficha do compositor manda para cá já filtrado
  // (`?compositor=<id>&nome=<nome>`).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get('compositor');
    if (c) setCompositor({ id: c, rotulo: q.get('nome') ?? 'Compositor' });
  }, []);
  const ativos =
    [tipo, origem, arquivo, desde, ate].filter(Boolean).length +
    (obra ? 1 : 0) +
    (compositor ? 1 : 0);
  const limparAvancados = () => {
    setObra(null);
    setCompositor(null);
    [setTipo, setOrigem, setArquivo, setDesde, setAte].forEach((f) => f(''));
  };

  const filtros: FiltrosPartituras = {
    search: busca,
    isActive:
      recorte === 'ativas'
        ? true
        : recorte === 'desativadas'
          ? false
          : undefined,
    workId: obra?.id,
    composerId: compositor?.id,
    type: tipo || undefined,
    source: origem || undefined,
    hasFile: simNao(arquivo),
    createdFrom: inicioDoDia(desde),
    createdTo: fimDoDia(ate),
  };

  const lista = usePartituras(filtros);
  const atualizar = useAtualizarPartitura();
  const apagar = useApagarPartitura();

  const alternar = async (p: Partitura) => {
    try {
      await atualizar.mutateAsync([p.id, { isActive: !p.isActive }]);
      toast.success(p.isActive ? 'Partitura desativada.' : 'Partitura no ar.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  // Em lote, uma chamada por partitura: a API não tem rota de lote para
  // partitura. O resultado diz quantas deram certo.
  const loteDe = async (
    acao: (id: string) => Promise<unknown>,
    feito: string
  ) => {
    setEmLote(true);
    let ok = 0;
    for (const id of marcadas) {
      try {
        await acao(id);
        ok++;
      } catch {
        // conta abaixo
      }
    }
    setEmLote(false);
    const falhas = marcadas.length - ok;
    if (falhas)
      toast.error(`${numero(ok)} ${feito}; ${numero(falhas)} falharam.`);
    else toast.success(`${numero(ok)} ${feito}.`);
    setMarcadas([]);
  };

  const colunas: Coluna<Partitura>[] = [
    {
      id: 'titulo',
      titulo: 'Partitura',
      principal: true,
      celula: (p) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[0.9375rem] text-texto">
            {p.title}
          </span>
          <span className="t-legenda truncate">
            <span className="font-display text-[0.9375rem]">
              {p.work?.title ?? 'Obra removida'}
            </span>
            {p.work?.composer ? ` · ${p.work.composer.name}` : ''}
          </span>
        </span>
      ),
    },
    {
      id: 'tipo',
      titulo: 'Tipo',
      celula: (p) => (
        <span className="text-sm">{TIPOS_DE_PARTITURA[p.type] ?? p.type}</span>
      ),
    },
    {
      id: 'origem',
      titulo: 'Origem',
      soNoComputador: true,
      celula: (p) => (
        <span className="text-sm">{ORIGENS[p.source] ?? p.source}</span>
      ),
    },
    {
      id: 'estado',
      titulo: 'No ar',
      celula: (p) =>
        p.isActive ? (
          <span className="text-sm">sim</span>
        ) : (
          <Badge>Desativada</Badge>
        ),
    },
    {
      id: 'desde',
      titulo: 'Entrou',
      soNoComputador: true,
      celula: (p) => (
        <span className="t-dado text-sm">{dataCurta(p.createdAt)}</span>
      ),
    },
  ];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Partituras"
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
            onClick={() => setCadastro({ tipo: 'score', id: null })}
          >
            Nova partitura
          </Button>
        }
      />

      <ResumoDasPartituras
        aoFiltrar={(r, extra) => {
          limparAvancados();
          setBusca('');
          setRecorte(r);
          if (extra?.tipo) setTipo(extra.tipo);
          if (extra?.origem) setOrigem(extra.origem);
          rolarAte('partituras-lista');
        }}
      />

      <Stack gap={3} id="partituras-lista" className="scroll-mt-6">
        <Busca
          valor={busca}
          aoMudar={setBusca}
          rotulo="Buscar partitura pelo título"
          placeholder="Título da partitura"
        />
        <div className="flex flex-wrap gap-2">
          <Chip
            selecionado={recorte === 'todas'}
            onClick={() => setRecorte('todas')}
          >
            Todas
          </Chip>
          <Chip
            selecionado={recorte === 'ativas'}
            onClick={() => setRecorte('ativas')}
          >
            No ar
          </Chip>
          <Chip
            selecionado={recorte === 'desativadas'}
            onClick={() => setRecorte('desativadas')}
          >
            Desativadas
          </Chip>
        </div>
        <MaisFiltros ativos={ativos} aoLimpar={limparAvancados}>
          <Escolher
            rotulo="Obra"
            valor={obra}
            aoMudar={setObra}
            buscar={buscarObras}
            placeholder="Título da obra"
          />
          <Escolher
            rotulo="Compositor"
            valor={compositor}
            aoMudar={setCompositor}
            buscar={buscarCompositores}
            placeholder="Nome do compositor"
          />
          <FiltroSelecao
            rotulo="Tipo"
            valor={tipo}
            aoMudar={setTipo}
            opcoes={Object.entries(TIPOS_DE_PARTITURA).map(
              ([value, label]) => ({
                value,
                label,
              })
            )}
          />
          <FiltroSelecao
            rotulo="Origem"
            valor={origem}
            aoMudar={setOrigem}
            todos="Qualquer"
            opcoes={Object.entries(ORIGENS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <FiltroSelecao
            rotulo="Arquivo"
            valor={arquivo}
            aoMudar={setArquivo}
            opcoes={[
              { value: 'sim', label: 'Com arquivo para baixar' },
              { value: 'nao', label: 'Sem arquivo' },
            ]}
          />
          <FiltroData rotulo="Entrou de" valor={desde} aoMudar={setDesde} />
          <FiltroData rotulo="Entrou até" valor={ate} aoMudar={setAte} />
        </MaisFiltros>
      </Stack>

      <BarraDeSelecao
        quantidade={marcadas.length}
        singular="partitura selecionada"
        plural="partituras selecionadas"
        aoLimpar={() => setMarcadas([])}
      >
        <Button
          tamanho="p"
          variante="perigo"
          icone={PiTrash}
          onClick={() => setApagandoLote(true)}
          disabled={emLote}
        >
          Remover
        </Button>
        <Button
          tamanho="p"
          onClick={() =>
            loteDe(
              (id) => atualizar.mutateAsync([id, { isActive: false }]),
              'desativadas'
            )
          }
          carregando={emLote}
        >
          Desativar
        </Button>
        <Button
          tamanho="p"
          variante="primario"
          onClick={() =>
            loteDe(
              (id) => atualizar.mutateAsync([id, { isActive: true }]),
              'no ar'
            )
          }
          carregando={emLote}
        >
          Pôr no ar
        </Button>
      </BarraDeSelecao>

      <Tabela
        rotulo="Partituras"
        colunas={colunas}
        linhas={lista.items}
        chave={(p) => p.id}
        carregando={lista.loading}
        aoClicar={(p) => navegar.partitura(p.id)}
        selecionadas={marcadas}
        aoSelecionar={setMarcadas}
        rotuloSelecao={(p) => `Selecionar ${p.title}`}
        acoes={(p) => (
          <>
            {p.downloadUrl && (
              <AcaoDaLinha
                rotulo="Abrir o arquivo"
                icone={PiFilePdf}
                href={p.downloadUrl}
              />
            )}
            <AcaoDaLinha
              rotulo={`Editar “${p.title}”`}
              icone={PiPencilSimple}
              onClick={() => navegar.partitura(p.id)}
            />
            <AcaoDaLinha
              rotulo={p.isActive ? 'Desativar' : 'Pôr no ar'}
              icone={p.isActive ? PiEye : PiEyeSlash}
              onClick={() => alternar(p)}
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
            titulo="Nenhuma partitura neste recorte"
            descricao={
              busca
                ? `Nenhum título com “${busca}”.`
                : 'Troque o filtro para ver outras.'
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
        isOpen={apagandoLote}
        onClose={() => setApagandoLote(false)}
        onConfirm={async () => {
          await loteDe((id) => apagar.mutateAsync([id]), 'removidas');
          setApagandoLote(false);
        }}
        type="danger"
        title={`Remover ${marcadas.length} partituras?`}
        message="Os registros e os arquivos saem do armazenamento. Quem tinha a partitura escolhida no estudo fica sem ela. Não dá para desfazer."
        confirmText="Remover"
        cancelText="Voltar"
        isLoading={emLote}
      />

      <Cadastro aberto={cadastro} aoFechar={() => setCadastro(null)} />
    </Stack>
  );
}

const PCT = (parte: number, todo: number) =>
  todo > 0 ? porcento((parte / todo) * 100) : '—';

function ResumoDasPartituras({
  aoFiltrar,
}: {
  /** Os números e as fatias filtram a lista embaixo. */
  aoFiltrar: (r: Recorte, extra?: { tipo?: string; origem?: string }) => void;
}) {
  const { data: r, loading } = useResumoPartituras();
  const navegar = useNavegar();
  const router = useRouter();
  const [favoritas, setFavoritas] = useState(false);
  return (
    <Recolhivel
      chave="partituras"
      titulo="O acervo"
      resumo={
        r
          ? `${numero(r.total)} partituras · ${numero(r.inativas)} desativadas`
          : undefined
      }
    >
      <Numeros
        carregando={loading}
        colunas={4}
        itens={[
          {
            id: 'total',
            rotulo: 'Partituras',
            aoClicar: () => aoFiltrar('todas'),
            valor: numero(r?.total),
            nota: r ? `${numero(r.novas30)} novas em 30 dias` : undefined,
          },
          {
            id: 'ativas',
            rotulo: 'No ar',
            aoClicar: () => aoFiltrar('ativas'),
            valor: r ? PCT(r.ativas, r.total) : '—',
            nota: r ? `${numero(r.inativas)} desativadas` : undefined,
          },
          {
            id: 'obras',
            rotulo: 'Obras com partitura',
            aoClicar: () => router.push('/admin/works?recorte=com-partitura'),
            valor: numero(r?.obrasComPartitura),
          },
          {
            id: 'favoritas',
            rotulo: 'Favoritadas',
            aoClicar: () => setFavoritas(true),
            valor: numero(r?.favoritadas),
            nota: 'vezes, somando todas',
          },
        ]}
      />
      {r && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Por tipo
            </Text>
            <Pizza
              titulo="Partituras por tipo"
              dados={Object.entries(r.porTipo).map(([k, v]) => ({
                rotulo: TIPOS_DE_PARTITURA[k] ?? k,
                valor: v,
                id: k,
              }))}
              rotuloOutras="Outros tipos"
              aoClicar={(p) => p.id && aoFiltrar('todas', { tipo: p.id })}
            />
          </Stack>
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Por origem
            </Text>
            <Pizza
              titulo="Partituras por origem"
              dados={Object.entries(r.porOrigem).map(([k, v]) => ({
                rotulo: ORIGENS[k] ?? k,
                valor: v,
                id: k,
              }))}
              rotuloOutras="Outras origens"
              aoClicar={(p) => p.id && aoFiltrar('todas', { origem: p.id })}
            />
          </Stack>
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Novas por mês
            </Text>
            <Colunas
              titulo="Partituras novas por mês"
              dados={colunasPorMes(r.novasPorMes ?? [])}
              altura={140}
            />
          </Stack>
        </div>
      )}
      <Sheet
        aberto={favoritas}
        aoFechar={() => setFavoritas(false)}
        titulo="Mais favoritadas"
        descricao={
          r ? `${numero(r.favoritadas)} favoritos no total` : undefined
        }
        largura="m"
      >
        {!r?.maisFavoritadas?.length ? (
          <Text papel="rotulo" tom="suave" as="p">
            Nenhuma partitura favoritada ainda.
          </Text>
        ) : (
          <ul className="flex flex-col">
            {r.maisFavoritadas.map((p) => (
              <li key={p.id} className="border-b border-linha last:border-0">
                <button
                  type="button"
                  onClick={() => navegar.partitura(p.id)}
                  className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center gap-3 rounded-controle px-2 py-2 text-left transition-colors hover:bg-[var(--interactive-hover)]"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[0.9375rem] text-texto">
                      {p.titulo}
                    </span>
                    <span className="t-legenda truncate">
                      {[p.obra, p.compositor].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className="t-legenda t-dado shrink-0">
                    {numero(p.favoritos)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </Recolhivel>
  );
}
