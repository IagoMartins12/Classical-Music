'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiCopy,
  PiPaperPlaneTilt,
  PiPencilSimple,
  PiPlus,
  PiTestTube,
  PiTrash,
  PiX,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { EditorDeCampanha } from '@/app/components/Admin/Newsletter/EditorDeCampanha';
import { EnvioDeTeste } from '@/app/components/Admin/Newsletter/EnvioDeTeste';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Busca, Segmentos } from '@/app/components/Admin/painel/Controles';
import { Proporcoes } from '@/app/components/Admin/painel/Graficos';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import { Tabela, type Coluna } from '@/app/components/Admin/painel/Tabela';
import { HistoricoDoRegistro } from '@/app/components/Admin/painel/Trilha';
import {
  dataCurta,
  dataHora,
  numero,
  porcento,
} from '@/app/components/Admin/painel/formatos';
import { useInvalidateAdmin } from '@/app/hooks/admin/query';
import {
  useApagarCampanha,
  useCampanhas,
  useCancelarCampanha,
  useDuplicarCampanha,
  useEnviarCampanha,
  useEstatisticasNews,
} from '@/app/hooks/admin/useNewsletterPainel';
import {
  getCampanha,
  type Campanha,
  type EstadoCampanha,
} from '@/app/requests/admin/newsletterPainel';

/**
 * Campanhas: criar, testar, agendar, enviar — e ver como foram recebidas.
 *
 * **O detalhe mostra o que foi medido.** O modal de estatísticas antigo
 * desenhava a curva de aberturas e cliques ao longo do tempo com
 * `Math.random()` — e sorteava até os descadastros. A API guarda os totais
 * de cada campanha (enviados, entregues, abertos, cliques, devolvidos,
 * spam, descadastros), e é isso que o funil mostra.
 *
 * Criar e editar usam o mesmo formulário (havia dois, com campos
 * diferentes para a mesma campanha).
 */

type Filtro = 'todas' | EstadoCampanha;

const ESTADOS: Record<EstadoCampanha, string> = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendada',
  SENDING: 'Enviando',
  SENT: 'Enviada',
  PAUSED: 'Pausada',
  CANCELLED: 'Cancelada',
  FAILED: 'Falhou',
};

function Estado({ c }: { c: Campanha }) {
  if (c.status === 'SENT') return <span className="text-sm">Enviada</span>;
  if (c.status === 'FAILED') return <Badge estado="erro">Falhou</Badge>;
  if (c.status === 'SCHEDULED') return <Badge estado="ouro">Agendada</Badge>;
  if (c.status === 'SENDING') return <Badge estado="ouro">Enviando</Badge>;
  return <Badge>{ESTADOS[c.status]}</Badge>;
}

const taxa = (parte: number, total: number) =>
  total > 0 ? Math.round((parte / total) * 1000) / 10 : null;

export default function Campanhas() {
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [busca, setBusca] = useState('');
  const [aberta, setAberta] = useState<Campanha | null>(null);
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Campanha | null>(null);
  const [testando, setTestando] = useState<Campanha | null>(null);
  const invalidar = useInvalidateAdmin();

  // A visão geral manda para cá com `?nova=1`.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('nova'))
      setCriando(true);
  }, []);

  const lista = useCampanhas({
    status: filtro === 'todas' ? undefined : filtro,
    search: busca,
  });
  const stats = useEstatisticasNews();
  const porEstado = stats.data?.campaignsByStatus ?? {};

  const colunas: Coluna<Campanha>[] = [
    {
      id: 'nome',
      titulo: 'Campanha',
      principal: true,
      celula: (c) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[0.9375rem] text-texto">{c.name}</span>
          <span className="t-legenda truncate">{c.subject}</span>
        </span>
      ),
    },
    { id: 'estado', titulo: 'Estado', celula: (c) => <Estado c={c} /> },
    {
      id: 'quando',
      titulo: 'Quando',
      celula: (c) => (
        <span className="t-dado text-sm">
          {c.sentAt
            ? dataCurta(c.sentAt)
            : c.scheduledAt
              ? `para ${dataCurta(c.scheduledAt)}`
              : '—'}
        </span>
      ),
    },
    {
      id: 'para',
      titulo: 'Destinatários',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (c) => numero(c.emailsSent || c.totalSubscribers),
    },
    {
      id: 'abertura',
      titulo: 'Abertura',
      alinhar: 'fim',
      celula: (c) =>
        c.emailsDelivered
          ? porcento(taxa(c.emailsOpened, c.emailsDelivered))
          : '—',
    },
    {
      id: 'clique',
      titulo: 'Clique',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (c) =>
        c.emailsOpened ? porcento(taxa(c.emailsClicked, c.emailsOpened)) : '—',
    },
  ];

  const aoSalvar = () => {
    setCriando(false);
    setEditando(null);
    toast.success('Campanha salva.');
    void invalidar('newsletter');
    void invalidar('auditoria');
  };

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Campanhas"
        descricao="Criar, testar, agendar e enviar"
        acoes={
          <Button
            tamanho="p"
            variante="primario"
            icone={PiPlus}
            onClick={() => setCriando(true)}
          >
            Nova campanha
          </Button>
        }
      />

      <Stack gap={3}>
        <Segmentos<Filtro>
          rotulo="Estado da campanha"
          valor={filtro}
          aoMudar={setFiltro}
          opcoes={[
            { valor: 'todas', rotulo: 'Todas' },
            {
              valor: 'DRAFT',
              rotulo: 'Rascunhos',
              contagem: porEstado.DRAFT || null,
            },
            {
              valor: 'SCHEDULED',
              rotulo: 'Agendadas',
              contagem: porEstado.SCHEDULED || null,
            },
            { valor: 'SENT', rotulo: 'Enviadas' },
            {
              valor: 'FAILED',
              rotulo: 'Falharam',
              contagem: porEstado.FAILED || null,
            },
            { valor: 'CANCELLED', rotulo: 'Canceladas' },
          ]}
        />
        <Busca
          valor={busca}
          aoMudar={setBusca}
          rotulo="Buscar campanha"
          placeholder="Nome ou assunto"
        />
      </Stack>

      <Tabela
        rotulo="Campanhas"
        colunas={colunas}
        linhas={lista.items}
        chave={(c) => c.id}
        carregando={lista.loading}
        aoClicar={setAberta}
        erro={
          lista.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              {lista.error}
            </Text>
          ) : undefined
        }
        vazio={
          <Vazio
            titulo="Nenhuma campanha aqui"
            descricao="Uma campanha é um e-mail para os assinantes: escolha o modelo, o público e quando enviar."
            acao={
              <Button
                tamanho="p"
                variante="primario"
                onClick={() => setCriando(true)}
              >
                Criar campanha
              </Button>
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

      <DetalheCampanha
        campanha={aberta}
        aoFechar={() => setAberta(null)}
        aoEditar={async (c) => {
          // A lista não traz o conteúdo do e-mail; o formulário precisa dele.
          try {
            const completa = await getCampanha(c.id);
            setAberta(null);
            setEditando(completa);
          } catch (e) {
            toast.error(
              e instanceof Error
                ? e.message
                : 'Não foi possível abrir a campanha.'
            );
          }
        }}
        aoTestar={(c) => setTestando(c)}
      />

      {(criando || editando) && (
        <EditorDeCampanha
          campanha={(editando as Record<string, unknown> | null) ?? null}
          aoFechar={() => {
            setCriando(false);
            setEditando(null);
          }}
          aoSalvar={() => aoSalvar()}
        />
      )}

      {testando && (
        <EnvioDeTeste
          campanha={testando}
          aoFechar={() => setTestando(null)}
          aoEnviar={() => void invalidar('newsletter')}
        />
      )}
    </Stack>
  );
}

function DetalheCampanha({
  campanha: c,
  aoFechar,
  aoEditar,
  aoTestar,
}: {
  campanha: Campanha | null;
  aoFechar: () => void;
  aoEditar: (c: Campanha) => void;
  aoTestar: (c: Campanha) => void;
}) {
  const enviar = useEnviarCampanha();
  const cancelar = useCancelarCampanha();
  const duplicar = useDuplicarCampanha();
  const apagar = useApagarCampanha();
  const [confirmar, setConfirmar] = useState<
    'enviar' | 'apagar' | 'cancelar' | null
  >(null);

  if (!c)
    return (
      <Sheet aberto={false} aoFechar={aoFechar} titulo="">
        {null}
      </Sheet>
    );

  const editavel = c.status === 'DRAFT' || c.status === 'SCHEDULED';
  const rodar = async (acao: () => Promise<unknown>, ok: string) => {
    try {
      await acao();
      toast.success(ok);
      setConfirmar(null);
      aoFechar();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível concluir.'
      );
      setConfirmar(null);
    }
  };

  const enviados = c.emailsSent;

  return (
    <>
      <Sheet
        aberto
        aoFechar={aoFechar}
        titulo={c.name}
        descricao={`Assunto: ${c.subject}`}
        largura="g"
        rodape={
          <>
            {c.status === 'DRAFT' && (
              <Button
                tamanho="p"
                variante="perigo"
                icone={PiTrash}
                onClick={() => setConfirmar('apagar')}
                className="mr-auto"
              >
                Apagar
              </Button>
            )}
            {c.status === 'SCHEDULED' && (
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiX}
                onClick={() => setConfirmar('cancelar')}
                className="mr-auto"
              >
                Cancelar envio
              </Button>
            )}
            {(c.status === 'SENT' ||
              c.status === 'FAILED' ||
              c.status === 'CANCELLED') && (
              <Button
                tamanho="p"
                icone={PiCopy}
                carregando={duplicar.isPending}
                onClick={() =>
                  rodar(
                    () => duplicar.mutateAsync([c.id]),
                    'Cópia criada como rascunho.'
                  )
                }
              >
                Duplicar
              </Button>
            )}
            {editavel && (
              <>
                <Button
                  tamanho="p"
                  icone={PiPencilSimple}
                  onClick={() => aoEditar(c)}
                >
                  Editar
                </Button>
                <Button
                  tamanho="p"
                  icone={PiTestTube}
                  onClick={() => aoTestar(c)}
                >
                  Enviar teste
                </Button>
                <Button
                  tamanho="p"
                  variante="primario"
                  icone={PiPaperPlaneTilt}
                  onClick={() => setConfirmar('enviar')}
                >
                  Enviar agora
                </Button>
              </>
            )}
          </>
        }
      >
        <Stack gap={6}>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
            <div>
              <dt className="t-legenda">Estado</dt>
              <dd className="pt-0.5">
                <Estado c={c} />
              </dd>
            </div>
            <div>
              <dt className="t-legenda">
                {c.sentAt
                  ? 'Enviada em'
                  : c.scheduledAt
                    ? 'Agendada para'
                    : 'Criada em'}
              </dt>
              <dd className="text-sm">
                {dataHora(c.sentAt ?? c.scheduledAt ?? c.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="t-legenda">Público</dt>
              <dd className="text-sm">
                {c.targetAll === false ? 'Segmento' : 'Todos os ativos'} ·{' '}
                {numero(c.totalSubscribers)}
              </dd>
            </div>
          </dl>

          {editavel && !c.testEmailSent && (
            <Text papel="rotulo" tom="atencao" as="p">
              Nenhum teste enviado ainda. Mande um teste antes de disparar — o
              que chega na caixa de entrada nem sempre é o que a prévia mostra.
            </Text>
          )}

          {enviados > 0 && (
            <>
              <Numeros
                colunas={4}
                itens={[
                  {
                    id: 'entrega',
                    rotulo: 'Entrega',
                    valor: porcento(taxa(c.emailsDelivered, enviados)),
                    nota: `${numero(c.emailsDelivered)} de ${numero(enviados)}`,
                  },
                  {
                    id: 'abertura',
                    rotulo: 'Abertura',
                    valor: porcento(taxa(c.emailsOpened, c.emailsDelivered)),
                    nota: `${numero(c.emailsOpened)} abriram`,
                  },
                  {
                    id: 'clique',
                    rotulo: 'Clique',
                    valor: porcento(taxa(c.emailsClicked, c.emailsOpened)),
                    nota: `${numero(c.emailsClicked)} clicaram`,
                  },
                  {
                    id: 'saidas',
                    rotulo: 'Descadastros',
                    valor: numero(c.emailsUnsubscribed ?? 0),
                    nota: `${numero(c.emailsComplained ?? 0)} marcaram spam`,
                  },
                ]}
              />
              <Proporcoes
                titulo="O caminho do e-mail"
                dados={[
                  { rotulo: 'Enviados', valor: enviados },
                  { rotulo: 'Entregues', valor: c.emailsDelivered },
                  { rotulo: 'Abertos', valor: c.emailsOpened },
                  { rotulo: 'Clicados', valor: c.emailsClicked },
                  { rotulo: 'Devolvidos', valor: c.emailsBounced ?? 0 },
                ]}
              />
            </>
          )}

          <Stack gap={2}>
            <Text papel="secao" as="h3">
              No painel
            </Text>
            <HistoricoDoRegistro entityId={c.id} />
          </Stack>
        </Stack>
      </Sheet>

      <ConfirmModal
        isOpen={confirmar !== null}
        onClose={() => setConfirmar(null)}
        onConfirm={() =>
          confirmar === 'enviar'
            ? rodar(
                () => enviar.mutateAsync([c.id]),
                'Campanha na fila de envio.'
              )
            : confirmar === 'cancelar'
              ? rodar(() => cancelar.mutateAsync([c.id]), 'Envio cancelado.')
              : rodar(() => apagar.mutateAsync([c.id]), 'Campanha apagada.')
        }
        type={confirmar === 'apagar' ? 'danger' : 'question'}
        acaoPerigosa={confirmar === 'apagar'}
        title={
          confirmar === 'enviar'
            ? `Enviar para ${numero(c.totalSubscribers)} assinantes agora?`
            : confirmar === 'cancelar'
              ? 'Cancelar o envio agendado?'
              : 'Apagar este rascunho?'
        }
        message={
          confirmar === 'enviar'
            ? 'O envio não pode ser desfeito. A campanha entra na fila e sai aos poucos.'
            : confirmar === 'cancelar'
              ? 'Ela fica cancelada e não sai. Para enviar depois, duplique e agende a cópia.'
              : 'O rascunho sai da lista.'
        }
        confirmText={
          confirmar === 'enviar'
            ? 'Enviar'
            : confirmar === 'cancelar'
              ? 'Cancelar envio'
              : 'Apagar'
        }
        cancelText="Voltar"
        isLoading={enviar.isPending || cancelar.isPending || apagar.isPending}
      />
    </>
  );
}
