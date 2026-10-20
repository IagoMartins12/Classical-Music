'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiCopy,
  PiImage,
  PiPause,
  PiPencilSimple,
  PiPlay,
  PiPlus,
  PiTrash,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { FormularioDeAnuncio } from '@/app/components/Admin/Ads/FormularioDeAnuncio';
import { MidiaDoAnuncio } from '@/app/components/Admin/Ads/MidiaDoAnuncio';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Selecao } from '@/app/components/ui/Selecao';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Busca, Segmentos } from '@/app/components/Admin/painel/Controles';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import { Tabela, type Coluna } from '@/app/components/Admin/painel/Tabela';
import { HistoricoDoRegistro } from '@/app/components/Admin/painel/Trilha';
import {
  dataCurta,
  numero,
  porcento,
} from '@/app/components/Admin/painel/formatos';
import {
  adminKeys,
  useAdminInfinite,
  useAdminMutation,
  useAdminQuery,
  useInvalidateAdmin,
} from '@/app/hooks/admin/query';
import type { Advertisement } from '@/app/hooks/admin/useAds';
import {
  deleteAdRequest,
  getAdsOverview,
  listAds,
  updateAdRequest,
} from '@/app/requests/admin/ads';

/**
 * Anúncios: campanhas de anunciantes (escolas, lojas, luthiers) no site.
 *
 * O detalhe mostra o desempenho que a API mede — impressões, cliques e CTR.
 * O modal de estatísticas antigo tinha gráfico diário, páginas e países,
 * todos vazios: a API não guarda por dia nem por origem, e a tela dizia
 * "sem dados" em cinco lugares. Aqui só aparece o que existe.
 *
 * Criar, editar, duplicar e trocar a mídia continuam nos formulários
 * próprios (a checagem de conflito de posição mora neles). Apagar e pausar
 * pedem confirmação do sistema — antes era a caixa do navegador.
 */

type Filtro = 'todos' | 'ACTIVE' | 'PAUSED' | 'SCHEDULED' | 'DRAFT' | 'EXPIRED';

const ESTADOS: Record<string, string> = {
  ACTIVE: 'No ar',
  PAUSED: 'Pausado',
  SCHEDULED: 'Agendado',
  DRAFT: 'Rascunho',
  EXPIRED: 'Terminou',
};

const POSICOES: Record<string, string> = {
  HEADER: 'Topo',
  SIDEBAR_LEFT: 'Lateral esquerda',
  SIDEBAR_RIGHT: 'Lateral direita',
  CONTENT_TOP: 'Antes do conteúdo',
  CONTENT_BOTTOM: 'Depois do conteúdo',
  BETWEEN_CONTENT: 'No meio do conteúdo',
  FOOTER: 'Rodapé',
  MODAL: 'Janela',
};

const TIPOS: Record<string, string> = {
  BANNER: 'Banner',
  VIDEO: 'Vídeo',
  CARD: 'Card',
  SIDEBAR: 'Lateral',
  NATIVE: 'Nativo',
  POPUP: 'Janela',
};

function Estado({ a }: { a: Advertisement }) {
  if (a.status === 'ACTIVE') return <span className="text-sm">No ar</span>;
  if (a.status === 'SCHEDULED') return <Badge estado="ouro">Agendado</Badge>;
  return <Badge>{ESTADOS[a.status] ?? a.status}</Badge>;
}

const TOCA = ['anuncios', 'auditoria'];

export default function Anuncios() {
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busca, setBusca] = useState('');
  const [posicao, setPosicao] = useState('');
  const [aberto, setAberto] = useState<Advertisement | null>(null);
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Advertisement | null>(null);
  const [clonando, setClonando] = useState<Advertisement | null>(null);
  const [midia, setMidia] = useState<Advertisement | null>(null);
  const invalidar = useInvalidateAdmin();

  const filtros = {
    status: filtro === 'todos' ? undefined : filtro,
    search: busca || undefined,
    placement: posicao || undefined,
  };
  const lista = useAdminInfinite<Advertisement>(
    adminKeys.list('anuncios', filtros),
    async (cursor) => {
      const pagina = Number(cursor ?? 1);
      const r = await listAds(pagina, filtros);
      return {
        items: r.ads,
        total: r.pagination.total,
        nextCursor: pagina < r.pagination.pages ? String(pagina + 1) : null,
      };
    }
  );
  const visao = useAdminQuery(
    adminKeys.list('anuncios', 'visao'),
    getAdsOverview
  );
  const v = visao.data;

  const recarregar = () => {
    void invalidar('anuncios');
    void invalidar('auditoria');
  };

  const colunas: Coluna<Advertisement>[] = [
    {
      id: 'anuncio',
      titulo: 'Anúncio',
      principal: true,
      celula: (a) => (
        <span className="flex min-w-0 items-center gap-3">
          {a.thumbnailUrl || a.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- miniatura de 48px, de qualquer origem
            <img
              src={a.thumbnailUrl || a.imageUrl}
              alt=""
              className="h-9 w-12 shrink-0 rounded-[6px] object-cover"
            />
          ) : (
            <span
              className="h-9 w-12 shrink-0 rounded-[6px] bg-sup-2"
              aria-hidden="true"
            />
          )}
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[0.9375rem] text-texto">
              {a.title}
            </span>
            <span className="t-legenda truncate">{a.advertiserName}</span>
          </span>
        </span>
      ),
    },
    {
      id: 'posicao',
      titulo: 'Onde',
      soNoComputador: true,
      celula: (a) => (
        <span className="text-sm">{POSICOES[a.placement] ?? a.placement}</span>
      ),
    },
    { id: 'estado', titulo: 'Estado', celula: (a) => <Estado a={a} /> },
    {
      id: 'periodo',
      titulo: 'Período',
      soNoComputador: true,
      celula: (a) => (
        <span className="t-dado text-sm">
          {a.startDate ? dataCurta(a.startDate) : '—'} –{' '}
          {a.endDate ? dataCurta(a.endDate) : 'sem fim'}
        </span>
      ),
    },
    {
      id: 'impressoes',
      titulo: 'Impressões',
      alinhar: 'fim',
      celula: (a) => numero(a.totalImpressions ?? 0),
    },
    {
      id: 'ctr',
      titulo: 'CTR',
      alinhar: 'fim',
      celula: (a) => (a.totalImpressions ? porcento(a.ctr ?? 0) : '—'),
    },
  ];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Anúncios"
        descricao="Campanhas de anunciantes no site"
        acoes={
          <Button
            tamanho="p"
            variante="primario"
            icone={PiPlus}
            onClick={() => setCriando(true)}
          >
            Novo anúncio
          </Button>
        }
      />

      <Numeros
        carregando={visao.loading}
        itens={[
          {
            id: 'noar',
            rotulo: 'No ar',
            aoClicar: () => setFiltro('ACTIVE'),
            valor: numero(v?.activeAds),
            nota: v ? `de ${numero(v.totalAds)} anúncios` : undefined,
          },
          {
            id: 'pausados',
            rotulo: 'Pausados',
            valor: numero(v?.pausedAds),
            aoClicar: () => setFiltro('PAUSED'),
          },
          {
            id: 'impressoes',
            rotulo: 'Impressões',
            aoClicar: () => setFiltro('todos'),
            valor: numero(v?.impressions30d),
            nota: 'últimos 30 dias',
          },
          {
            id: 'ctr',
            rotulo: 'CTR médio',
            aoClicar: () => setFiltro('todos'),
            valor: v?.impressions30d ? porcento(v.avgCTR) : '—',
            nota: v ? `${numero(v.clicks30d)} cliques` : undefined,
          },
        ]}
      />

      <Stack gap={3}>
        <Segmentos<Filtro>
          rotulo="Estado do anúncio"
          valor={filtro}
          aoMudar={setFiltro}
          opcoes={[
            { valor: 'todos', rotulo: 'Todos' },
            { valor: 'ACTIVE', rotulo: 'No ar' },
            { valor: 'SCHEDULED', rotulo: 'Agendados' },
            { valor: 'PAUSED', rotulo: 'Pausados' },
            { valor: 'DRAFT', rotulo: 'Rascunhos' },
            { valor: 'EXPIRED', rotulo: 'Terminaram' },
          ]}
        />
        <div className="flex flex-wrap items-end gap-2">
          <Busca
            valor={busca}
            aoMudar={setBusca}
            rotulo="Buscar anúncio"
            placeholder="Título ou anunciante"
          />
          <div className="w-52">
            <label htmlFor="ad-posicao" className="sr-only">
              Posição
            </label>
            <Selecao
              id="ad-posicao"
              valor={posicao}
              aoMudar={setPosicao}
              opcoes={[
                { value: '', label: 'Qualquer posição' },
                ...Object.entries(POSICOES).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
            />
          </div>
        </div>
      </Stack>

      <Tabela
        rotulo="Anúncios"
        colunas={colunas}
        linhas={lista.items}
        chave={(a) => a.id}
        carregando={lista.loading}
        aoClicar={setAberto}
        erro={
          lista.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              {lista.error}
            </Text>
          ) : undefined
        }
        vazio={
          <Vazio
            titulo="Nenhum anúncio aqui"
            descricao="Troque o filtro ou crie um anúncio."
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

      <DetalheAnuncio
        anuncio={aberto}
        aoFechar={() => setAberto(null)}
        aoEditar={(a) => {
          setAberto(null);
          setEditando(a);
        }}
        aoClonar={(a) => {
          setAberto(null);
          setClonando(a);
        }}
        aoMidia={(a) => {
          setAberto(null);
          setMidia(a);
        }}
      />

      {criando && (
        <FormularioDeAnuncio
          modo="criar"
          anuncio={null}
          aoFechar={() => setCriando(false)}
          aoSalvar={() => {
            setCriando(false);
            recarregar();
            toast.success('Rascunho criado. Falta a imagem: abra o anúncio.');
          }}
        />
      )}
      {editando && (
        <FormularioDeAnuncio
          modo="editar"
          anuncio={editando as unknown as Record<string, unknown>}
          aoFechar={() => setEditando(null)}
          aoSalvar={() => {
            setEditando(null);
            recarregar();
            toast.success('Anúncio salvo.');
          }}
        />
      )}
      {clonando && (
        <FormularioDeAnuncio
          modo="clonar"
          anuncio={clonando as unknown as Record<string, unknown>}
          aoFechar={() => setClonando(null)}
          aoSalvar={() => {
            setClonando(null);
            recarregar();
            toast.success('Cópia criada como rascunho.');
          }}
        />
      )}
      {midia && (
        <MidiaDoAnuncio
          anuncio={midia}
          aoFechar={() => setMidia(null)}
          aoMudar={() => {
            setMidia(null);
            recarregar();
          }}
        />
      )}
    </Stack>
  );
}

function DetalheAnuncio({
  anuncio: a,
  aoFechar,
  aoEditar,
  aoClonar,
  aoMidia,
}: {
  anuncio: Advertisement | null;
  aoFechar: () => void;
  aoEditar: (a: Advertisement) => void;
  aoClonar: (a: Advertisement) => void;
  aoMidia: (a: Advertisement) => void;
}) {
  const mudar = useAdminMutation(
    (id: string, status: string) => updateAdRequest(id, { status }),
    TOCA
  );
  const apagar = useAdminMutation((id: string) => deleteAdRequest(id), TOCA);
  const [apagando, setApagando] = useState(false);

  if (!a)
    return (
      <Sheet aberto={false} aoFechar={aoFechar} titulo="">
        {null}
      </Sheet>
    );

  const rodar = async (acao: () => Promise<unknown>, ok: string) => {
    try {
      await acao();
      toast.success(ok);
      aoFechar();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível concluir.'
      );
    }
  };

  const telas = [
    a.showOnDesktop && 'computador',
    a.showOnTablet && 'tablet',
    a.showOnMobile && 'telefone',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <Sheet
        aberto
        aoFechar={aoFechar}
        titulo={a.title}
        descricao={`${a.advertiserName}${a.advertiserEmail ? ` · ${a.advertiserEmail}` : ''}`}
        largura="g"
        rodape={
          <>
            <Button
              tamanho="p"
              variante="perigo"
              icone={PiTrash}
              onClick={() => setApagando(true)}
              className="mr-auto"
            >
              Apagar
            </Button>
            <Button tamanho="p" icone={PiCopy} onClick={() => aoClonar(a)}>
              Duplicar
            </Button>
            <Button
              tamanho="p"
              icone={PiPencilSimple}
              onClick={() => aoEditar(a)}
            >
              Editar
            </Button>
            {a.status === 'ACTIVE' ? (
              <Button
                tamanho="p"
                icone={PiPause}
                carregando={mudar.isPending}
                onClick={() =>
                  rodar(
                    () => mudar.mutateAsync([a.id, 'PAUSED']),
                    'Anúncio pausado.'
                  )
                }
              >
                Pausar
              </Button>
            ) : a.status === 'PAUSED' || a.status === 'DRAFT' ? (
              <Button
                tamanho="p"
                variante="primario"
                icone={PiPlay}
                carregando={mudar.isPending}
                onClick={() =>
                  rodar(
                    () => mudar.mutateAsync([a.id, 'ACTIVE']),
                    'Anúncio no ar.'
                  )
                }
              >
                Pôr no ar
              </Button>
            ) : null}
          </>
        }
      >
        <Stack gap={6}>
          {(a.imageUrl || a.videoUrl) &&
            (a.videoUrl ? (
              <video
                src={a.videoUrl}
                controls
                className="max-h-72 w-full rounded-controle bg-sup-2"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- prévia da peça
              <img
                src={a.imageUrl}
                alt=""
                className="max-h-72 w-full rounded-controle bg-sup-2 object-contain"
              />
            ))}
          <Numeros
            colunas={3}
            itens={[
              {
                id: 'impressoes',
                rotulo: 'Impressões',
                valor: numero(a.totalImpressions ?? 0),
              },
              {
                id: 'cliques',
                rotulo: 'Cliques',
                valor: numero(a.totalClicks ?? 0),
              },
              {
                id: 'ctr',
                rotulo: 'CTR',
                valor: a.totalImpressions ? porcento(a.ctr ?? 0) : '—',
              },
            ]}
          />
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
            <Info rotulo="Estado">
              <Estado a={a} />
            </Info>
            <Info rotulo="Tipo">{TIPOS[a.type] ?? a.type}</Info>
            <Info rotulo="Onde">{POSICOES[a.placement] ?? a.placement}</Info>
            <Info rotulo="Período">
              {a.startDate ? dataCurta(a.startDate) : '—'} –{' '}
              {a.endDate ? dataCurta(a.endDate) : 'sem fim'}
            </Info>
            <Info rotulo="Aparece no">{telas || 'nenhuma tela'}</Info>
            <Info rotulo="Para quem">
              {a.targetType === 'INSTRUMENT'
                ? `quem toca ${a.instrument?.name ?? 'um instrumento'}`
                : 'todos'}
            </Info>
          </dl>
          {a.targetUrl && (
            <Text papel="rotulo" tom="suave" as="p">
              “{a.ctaText || 'Saiba mais'}” leva para{' '}
              <span className="t-dado break-all text-texto">{a.targetUrl}</span>
            </Text>
          )}
          <Inline gap={2}>
            <Button
              tamanho="p"
              variante="fantasma"
              icone={PiImage}
              onClick={() => aoMidia(a)}
            >
              Trocar imagem ou vídeo
            </Button>
          </Inline>
          <Stack gap={2}>
            <Text papel="secao" as="h3">
              No painel
            </Text>
            <HistoricoDoRegistro entityId={a.id} />
          </Stack>
        </Stack>
      </Sheet>

      <ConfirmModal
        isOpen={apagando}
        onClose={() => setApagando(false)}
        onConfirm={async () => {
          await rodar(() => apagar.mutateAsync([a.id]), 'Anúncio apagado.');
          setApagando(false);
        }}
        type="danger"
        acaoPerigosa
        title="Apagar este anúncio?"
        message={`“${a.title}” sai do site junto com a mídia e os números. Para só tirar do ar, pause.`}
        confirmText="Apagar"
        cancelText="Voltar"
        isLoading={apagar.isPending}
      />
    </>
  );
}

function Info({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="t-legenda">{rotulo}</dt>
      <dd className="text-sm text-texto">{children}</dd>
    </div>
  );
}
