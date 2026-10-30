'use client';

import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiEye,
  PiPencilSimple,
  PiPlus,
  PiSealCheck,
  PiSealCheckFill,
} from 'react-icons/pi';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Stack } from '@/app/components/ui/Layout';
import { Selecao } from '@/app/components/ui/Selecao';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import {
  Cadastro,
  type CadastroAberto,
} from '@/app/components/Admin/painel/Cadastros';
import { Escolher, type Opcao } from '@/app/components/Admin/painel/Escolher';
import {
  FiltroData,
  FiltroIntervalo,
  FiltroSelecao,
  MaisFiltros,
  fimDoDia,
  inicioDoDia,
  numeroOuNada,
  simNao,
} from '@/app/components/Admin/painel/Filtros';
import {
  Colunas,
  Pizza,
  colunasPorMes,
} from '@/app/components/Admin/painel/Graficos';
import { Numeros, rolarAte } from '@/app/components/Admin/painel/Numeros';
import { Recolhivel } from '@/app/components/Admin/painel/Recolhivel';
import { BarraDeSelecao, Busca } from '@/app/components/Admin/painel/Controles';
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
  useAtualizarObra,
  useEpocas,
  useListasDeCadastro,
  useObras,
  useResumoObras,
  useVerificarObras,
} from '@/app/hooks/admin/useCatalogo';
import {
  TIPOS_DE_OBRA,
  buscarCompositores,
  type FiltrosObras,
  type Obra,
} from '@/app/requests/admin/catalogo';

/**
 * Obras: curadoria do catálogo — verificar, corrigir, remover.
 *
 * A tela antiga abria com um ícone gigante, um título em degradê e quatro
 * cards com números que a API não mede (média de favoritos por obra,
 * "+12,4%" escrito no código). Aqui o topo diz o que importa para quem cura:
 * quantas obras há e quantas estão verificadas. A lista mostra o selo de
 * verificada — que a tela antiga não tinha como mostrar, porque o
 * mapeamento descartava o campo — e verifica em lote.
 */

type Recorte =
  | 'todas'
  | 'verificadas'
  | 'nao-verificadas'
  | 'com-partitura'
  | 'sem-partitura';

export default function Obras() {
  const [busca, setBusca] = useState('');
  const [recorte, setRecorte] = useState<Recorte>('todas');
  const [epoca, setEpoca] = useState('');
  const [tipo, setTipo] = useState('');
  const [ordem, setOrdem] = useState<'createdAt' | 'title'>('createdAt');
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const navegar = useNavegar();
  const [cadastro, setCadastro] = useState<CadastroAberto | null>(null);
  // Filtros avançados
  const [compositor, setCompositor] = useState<Opcao | null>(null);
  const [instrumento, setInstrumento] = useState('');
  const [minFav, setMinFav] = useState('');
  const [maxFav, setMaxFav] = useState('');
  const [minQuerem, setMinQuerem] = useState('');
  const [maxQuerem, setMaxQuerem] = useState('');
  const [minAprenderam, setMinAprenderam] = useState('');
  const [maxAprenderam, setMaxAprenderam] = useState('');
  const [minPartituras, setMinPartituras] = useState('');
  const [video, setVideo] = useState('');
  const [origem, setOrigem] = useState('');
  const [desde, setDesde] = useState('');
  const [ate, setAte] = useState('');
  // Preenchimento do cadastro: o quadro de Qualidade chega aqui já filtrado.
  const [tom, setTom] = useState('');
  const [ano, setAno] = useState('');
  const [instrumentacao, setInstrumentacao] = useState('');
  const [midia, setMidia] = useState('');
  // Um número de outra tela chega aqui já filtrado (`?recorte=com-partitura`,
  // `?compositor=<id>&nome=<nome>`).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get('compositor');
    if (c) setCompositor({ id: c, rotulo: q.get('nome') ?? 'Compositor' });
    const sn = (k: string) =>
      q.get(k) === 'true' ? 'sim' : q.get(k) === 'false' ? 'nao' : '';
    setTom(sn('hasTone'));
    setAno(sn('hasYear'));
    setInstrumentacao(sn('hasInstrumentation'));
    setMidia(sn('hasMedia'));
    const r = q.get('recorte');
    if (
      r &&
      [
        'verificadas',
        'nao-verificadas',
        'com-partitura',
        'sem-partitura',
      ].includes(r)
    ) {
      setRecorte(r as Recorte);
    }
  }, []);
  const textos = [
    tom,
    ano,
    instrumentacao,
    midia,
    instrumento,
    minFav,
    maxFav,
    minQuerem,
    maxQuerem,
    minAprenderam,
    maxAprenderam,
    minPartituras,
    video,
    origem,
    desde,
    ate,
  ];
  const ativos = textos.filter(Boolean).length + (compositor ? 1 : 0);
  const limparAvancados = () => {
    setCompositor(null);
    [
      setTom,
      setAno,
      setInstrumentacao,
      setMidia,
      setInstrumento,
      setMinFav,
      setMaxFav,
      setMinQuerem,
      setMaxQuerem,
      setMinAprenderam,
      setMaxAprenderam,
      setMinPartituras,
      setVideo,
      setOrigem,
      setDesde,
      setAte,
    ].forEach((f) => f(''));
  };

  const filtros: FiltrosObras = {
    search: busca,
    isVerified:
      recorte === 'verificadas'
        ? true
        : recorte === 'nao-verificadas'
          ? false
          : undefined,
    hasScore:
      recorte === 'com-partitura'
        ? true
        : recorte === 'sem-partitura'
          ? false
          : undefined,
    epochId: epoca || undefined,
    workType: tipo || undefined,
    composerId: compositor?.id,
    instrumentId: instrumento || undefined,
    minFavorites: numeroOuNada(minFav),
    maxFavorites: numeroOuNada(maxFav),
    minWantToLearn: numeroOuNada(minQuerem),
    maxWantToLearn: numeroOuNada(maxQuerem),
    minLearned: numeroOuNada(minAprenderam),
    maxLearned: numeroOuNada(maxAprenderam),
    minScores: numeroOuNada(minPartituras),
    hasVideo: simNao(video),
    hasTone: simNao(tom),
    hasYear: simNao(ano),
    hasInstrumentation: simNao(instrumentacao),
    hasMedia: simNao(midia),
    isCustom:
      origem === 'comunidade'
        ? true
        : origem === 'importada'
          ? false
          : undefined,
    createdFrom: inicioDoDia(desde),
    createdTo: fimDoDia(ate),
    sortBy: ordem,
  };

  const lista = useObras(filtros);
  const epocas = useEpocas();
  const listas = useListasDeCadastro();
  const verificar = useVerificarObras();
  const atualizar = useAtualizarObra();

  const alternarVerificacao = async (o: Obra) => {
    try {
      await atualizar.mutateAsync([o.id, { isVerified: !o.isVerified }]);
      toast.success(
        o.isVerified ? 'Verificação retirada.' : `“${o.title}” verificada.`
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  const emLote = async (v: boolean) => {
    try {
      const r = await verificar.mutateAsync([marcadas, v]);
      toast.success(
        `${numero(r.updated)} ${r.updated === 1 ? 'obra' : 'obras'} ${v ? 'verificadas' : 'sem verificação'}.`
      );
      setMarcadas([]);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível verificar.'
      );
    }
  };

  const colunas: Coluna<Obra>[] = [
    {
      id: 'obra',
      titulo: 'Obra',
      principal: true,
      celula: (o) => (
        <span className="flex min-w-0 flex-col">
          <span className="flex min-w-0 items-center gap-1.5 font-display text-[1.0625rem] leading-snug text-texto">
            <span className="truncate">{o.title}</span>
            {o.isVerified && (
              <SeloVerificada className="h-4 w-4 shrink-0 text-verificado" />
            )}
          </span>
          <span className="t-legenda truncate">
            {o.composer?.name ?? 'Sem compositor'}
          </span>
        </span>
      ),
    },
    {
      id: 'catalogo',
      titulo: 'Catálogo',
      celula: (o) => (
        <span className="t-dado text-sm text-texto-suave">
          {o.opOrCatalog ?? '—'}
        </span>
      ),
    },
    {
      id: 'epoca',
      titulo: 'Época',
      soNoComputador: true,
      celula: (o) => <span className="text-sm">{o.epoch?.name ?? '—'}</span>,
    },
    {
      id: 'tipo',
      titulo: 'Tipo',
      soNoComputador: true,
      celula: (o) => (
        <span className="text-sm">
          {TIPOS_DE_OBRA[o.workType] ?? o.workType}
        </span>
      ),
    },
    {
      id: 'favoritos',
      titulo: 'Favoritos',
      alinhar: 'fim',
      celula: (o) => numero(o.counts?.favorites ?? 0),
    },
    {
      id: 'partituras',
      titulo: 'Partituras',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (o) => numero(o.counts?.scores ?? 0),
    },
    {
      id: 'desde',
      titulo: 'Entrou',
      soNoComputador: true,
      celula: (o) => (
        <span className="t-dado text-sm">{dataCurta(o.createdAt)}</span>
      ),
    },
  ];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Obras"
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
            onClick={() => setCadastro({ tipo: 'work', id: null })}
          >
            Nova obra
          </Button>
        }
      />

      <ResumoDoCatalogo
        aoFiltrar={(f) => {
          limparAvancados();
          setBusca('');
          setEpoca('');
          setTipo('');
          setRecorte(f.recorte ?? 'todas');
          if (f.video) setVideo(f.video);
          if (f.origem) setOrigem(f.origem);
          if (f.tipo) setTipo(f.tipo);
          if (f.epoca) setEpoca(f.epoca);
          rolarAte('obras-lista');
        }}
      />

      <Stack gap={3} id="obras-lista" className="scroll-mt-6">
        <Busca
          valor={busca}
          aoMudar={setBusca}
          rotulo="Buscar obra pelo título"
          placeholder="Título da obra"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <div className="faixa-de-chips flex flex-wrap items-center gap-2">
            <Chip
              selecionado={recorte === 'todas'}
              onClick={() => setRecorte('todas')}
            >
              Todas
            </Chip>
            <Chip
              selecionado={recorte === 'nao-verificadas'}
              onClick={() => setRecorte('nao-verificadas')}
            >
              Não verificadas
            </Chip>
            <Chip
              selecionado={recorte === 'verificadas'}
              onClick={() => setRecorte('verificadas')}
            >
              Verificadas
            </Chip>
            <Chip
              selecionado={recorte === 'com-partitura'}
              onClick={() => setRecorte('com-partitura')}
            >
              Com partitura
            </Chip>
            <Chip
              selecionado={recorte === 'sem-partitura'}
              onClick={() => setRecorte('sem-partitura')}
            >
              Sem partitura
            </Chip>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:ml-auto sm:flex sm:w-auto sm:flex-wrap max-sm:[&>*:last-child:nth-child(odd)]:col-span-2">
            <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
              <label htmlFor="obr-epoca" className="sr-only">
                Época
              </label>
              <Selecao
                id="obr-epoca"
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
              <label htmlFor="obr-tipo" className="sr-only">
                Tipo de obra
              </label>
              <Selecao
                id="obr-tipo"
                valor={tipo}
                aoMudar={setTipo}
                opcoes={[
                  { value: '', label: 'Todos os tipos' },
                  ...Object.entries(TIPOS_DE_OBRA).map(([value, label]) => ({
                    value,
                    label,
                  })),
                ]}
              />
            </div>
            <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
              <label htmlFor="obr-ordem" className="sr-only">
                Ordenar
              </label>
              <Selecao
                id="obr-ordem"
                valor={ordem}
                aoMudar={(v) => setOrdem(v as 'createdAt' | 'title')}
                opcoes={[
                  { value: 'createdAt', label: 'Mais recentes' },
                  { value: 'title', label: 'Título' },
                ]}
              />
            </div>
          </div>
        </div>
        <MaisFiltros ativos={ativos} aoLimpar={limparAvancados}>
          <Escolher
            rotulo="Compositor"
            valor={compositor}
            aoMudar={setCompositor}
            buscar={buscarCompositores}
            placeholder="Nome do compositor"
          />
          <FiltroSelecao
            rotulo="Instrumento"
            valor={instrumento}
            aoMudar={setInstrumento}
            opcoes={(listas.data?.instruments ?? []).map((i) => ({
              value: i.id,
              label: i.name,
            }))}
          />
          <FiltroIntervalo
            rotulo="Favoritos"
            min={minFav}
            max={maxFav}
            aoMudarMin={setMinFav}
            aoMudarMax={setMaxFav}
          />
          <FiltroIntervalo
            rotulo="Querem aprender"
            min={minQuerem}
            max={maxQuerem}
            aoMudarMin={setMinQuerem}
            aoMudarMax={setMaxQuerem}
          />
          <FiltroIntervalo
            rotulo="Aprenderam"
            min={minAprenderam}
            max={maxAprenderam}
            aoMudarMin={setMinAprenderam}
            aoMudarMax={setMaxAprenderam}
          />
          <FiltroIntervalo
            rotulo="Partituras (mínimo)"
            min={minPartituras}
            max=""
            aoMudarMin={setMinPartituras}
            aoMudarMax={() => undefined}
          />
          {(
            [
              ['Tonalidade', tom, setTom, 'tonalidade'],
              ['Ano de composição', ano, setAno, 'ano'],
              [
                'Instrumentação',
                instrumentacao,
                setInstrumentacao,
                'instrumentação',
              ],
              ['Gravação ou vídeo', midia, setMidia, 'gravação ou vídeo'],
            ] as const
          ).map(([rotulo, valor, mudar, nome]) => (
            <FiltroSelecao
              key={rotulo}
              rotulo={rotulo}
              valor={valor}
              aoMudar={mudar}
              opcoes={[
                { value: 'sim', label: `Com ${nome}` },
                { value: 'nao', label: `Sem ${nome}` },
              ]}
            />
          ))}
          <FiltroSelecao
            rotulo="Vídeo"
            valor={video}
            aoMudar={setVideo}
            opcoes={[
              { value: 'sim', label: 'Com vídeo' },
              { value: 'nao', label: 'Sem vídeo' },
            ]}
          />
          <FiltroSelecao
            rotulo="Origem"
            valor={origem}
            aoMudar={setOrigem}
            todos="Qualquer"
            opcoes={[
              { value: 'comunidade', label: 'Cadastrada pela comunidade' },
              { value: 'importada', label: 'Importada (IMSLP)' },
            ]}
          />
          <FiltroData rotulo="Entrou de" valor={desde} aoMudar={setDesde} />
          <FiltroData rotulo="Entrou até" valor={ate} aoMudar={setAte} />
        </MaisFiltros>
      </Stack>

      <BarraDeSelecao
        quantidade={marcadas.length}
        singular="obra selecionada"
        plural="obras selecionadas"
        aoLimpar={() => setMarcadas([])}
      >
        <Button
          tamanho="p"
          onClick={() => emLote(false)}
          carregando={verificar.isPending}
        >
          Retirar verificação
        </Button>
        <Button
          tamanho="p"
          variante="primario"
          onClick={() => emLote(true)}
          carregando={verificar.isPending}
        >
          Verificar
        </Button>
      </BarraDeSelecao>

      <Tabela
        rotulo="Obras"
        colunas={colunas}
        linhas={lista.items}
        chave={(o) => o.id}
        carregando={lista.loading}
        aoClicar={(o) => navegar.obra(o.id, o)}
        selecionadas={marcadas}
        aoSelecionar={setMarcadas}
        rotuloSelecao={(o) => `Selecionar ${o.title}`}
        acoes={(o) => (
          <>
            <AcaoDaLinha
              rotulo={`Ver “${o.title}” no site`}
              icone={PiEye}
              href={`/works/${o.id}`}
            />
            <AcaoDaLinha
              rotulo={`Editar o cadastro de “${o.title}”`}
              icone={PiPencilSimple}
              onClick={() => setCadastro({ tipo: 'work', id: o.id })}
            />
            <AcaoDaLinha
              rotulo={o.isVerified ? 'Retirar a verificação' : 'Verificar'}
              icone={o.isVerified ? PiSealCheckFill : PiSealCheck}
              onClick={() => alternarVerificacao(o)}
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
            titulo="Nenhuma obra neste recorte"
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

      <Cadastro aberto={cadastro} aoFechar={() => setCadastro(null)} />
    </Stack>
  );
}

const PCT = (parte: number, todo: number) =>
  todo > 0 ? porcento((parte / todo) * 100) : '—';

/** O retrato do catálogo inteiro, sem filtro. Fecha e fica fechado. */
interface FiltroDoResumo {
  recorte?: Recorte;
  tipo?: string;
  epoca?: string;
  video?: string;
  origem?: string;
}

function ResumoDoCatalogo({
  aoFiltrar,
}: {
  /** Cada número filtra a lista embaixo pelo recorte que ele conta. */
  aoFiltrar: (f: FiltroDoResumo) => void;
}) {
  const { data: r, loading } = useResumoObras();
  const navegar = useNavegar();

  return (
    <Recolhivel
      chave="obras"
      titulo="O catálogo"
      resumo={
        r
          ? `${numero(r.total)} obras · ${PCT(r.verificadas, r.total)} verificadas · ${PCT(r.comPartitura, r.total)} com partitura`
          : undefined
      }
    >
      <Numeros
        carregando={loading}
        colunas={5}
        itens={[
          {
            id: 'total',
            rotulo: 'Obras',
            aoClicar: () => aoFiltrar({}),
            valor: numero(r?.total),
            nota: r ? `${numero(r.novas30)} novas em 30 dias` : undefined,
          },
          {
            id: 'verificadas',
            rotulo: 'Verificadas',
            aoClicar: () => aoFiltrar({ recorte: 'verificadas' }),
            valor: r ? PCT(r.verificadas, r.total) : '—',
            nota: r ? `${numero(r.verificadas)} obras` : undefined,
          },
          {
            id: 'partitura',
            rotulo: 'Com partitura',
            aoClicar: () => aoFiltrar({ recorte: 'com-partitura' }),
            valor: r ? PCT(r.comPartitura, r.total) : '—',
            nota: r ? `${numero(r.semPartitura)} sem nenhuma` : undefined,
          },
          {
            id: 'video',
            rotulo: 'Com vídeo',
            aoClicar: () => aoFiltrar({ video: 'sim' }),
            valor: r ? PCT(r.comVideo, r.total) : '—',
            nota: r ? `${numero(r.comVideo)} obras` : undefined,
          },
          {
            id: 'comunidade',
            rotulo: 'Da comunidade',
            aoClicar: () => aoFiltrar({ origem: 'comunidade' }),
            valor: numero(r?.comunidade),
            nota: 'cadastradas por usuários',
          },
        ]}
      />
      {r && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {(
            [
              [
                'Mais favoritadas',
                r.maisFavoritadas,
                ['favorito', 'favoritos'],
                'favoritos',
              ],
              [
                'Mais querem aprender',
                r.maisQueridas,
                ['pessoa', 'pessoas'],
                'quero-aprender',
              ],
              [
                'Mais aprendidas',
                r.maisAprendidas,
                ['pessoa', 'pessoas'],
                'aprendidas',
              ],
            ] as const
          ).map(([titulo, lista, unidade, uso]) => (
            <Stack gap={3} key={titulo}>
              <Text papel="rotulo" as="h3" className="font-medium">
                {titulo}
              </Text>
              {lista.length === 0 ? (
                <Text papel="legenda" as="p">
                  Ninguém ainda.
                </Text>
              ) : (
                <ol className="flex flex-col">
                  {lista.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-baseline gap-3 border-b border-linha py-2 last:border-0"
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <Elo
                          onClick={() => navegar.obra(o.id)}
                          className="truncate font-display text-[1rem]"
                        >
                          {o.title}
                        </Elo>
                        {o.composer && (
                          <span className="t-legenda truncate">
                            {o.composer}
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        title="Ver quem"
                        onClick={() =>
                          navegar.pessoasDaObra(o.id, o.title, uso)
                        }
                        className="t-legenda t-dado shrink-0 underline decoration-linha-forte underline-offset-4 hover:text-texto hover:decoration-ouro"
                      >
                        {numero(o.n)} {o.n === 1 ? unidade[0] : unidade[1]}
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </Stack>
          ))}
        </div>
      )}
      {r && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Por tipo
            </Text>
            <Pizza
              titulo="Obras por tipo"
              dados={Object.entries(r.porTipo).map(([k, v]) => ({
                rotulo: TIPOS_DE_OBRA[k] ?? k,
                valor: v,
                id: k,
              }))}
              rotuloOutras="Outros tipos"
              aoClicar={(p) => p.id && aoFiltrar({ tipo: p.id })}
            />
          </Stack>
          <Stack gap={3}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Por época
            </Text>
            <Pizza
              titulo="Obras por época"
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
              Cadastradas por mês
            </Text>
            <Colunas
              titulo="Obras cadastradas por mês"
              dados={colunasPorMes(r.novasPorMes ?? [])}
              altura={140}
            />
          </Stack>
        </div>
      )}
    </Recolhivel>
  );
}
