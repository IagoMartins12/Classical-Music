'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiDownloadSimple, PiPencilSimple, PiUserMinus } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { EditorDeAssinante } from '@/app/components/Admin/Newsletter/EditorDeAssinante';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Busca, Segmentos } from '@/app/components/Admin/painel/Controles';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import { Tabela, type Coluna } from '@/app/components/Admin/painel/Tabela';
import {
  data,
  dataCurta,
  numero,
  relativo,
} from '@/app/components/Admin/painel/formatos';
import { useInvalidateAdmin } from '@/app/hooks/admin/query';
import {
  useAssinantesNews,
  useDescadastrar,
  useEstatisticasNews,
} from '@/app/hooks/admin/useNewsletterPainel';
import { updateSubscriberRequest } from '@/app/requests/admin/newsletter';
import {
  exportarAssinantesNews,
  type AssinanteNews,
  type EstadoAssinante,
} from '@/app/requests/admin/newsletterPainel';

/**
 * Assinantes da newsletter: quem recebe, quem saiu, quem nunca confirmou.
 *
 * O engajamento é o que a API conta por pessoa — aberturas e cliques — e a
 * última abertura. A classificação "alto, médio, baixo" da tela antiga não
 * tinha medida por trás e saiu.
 */

type Filtro = 'todos' | EstadoAssinante;

const ESTADOS: Record<EstadoAssinante, string> = {
  ACTIVE: 'Ativo',
  PENDING: 'Esperando confirmação',
  UNSUBSCRIBED: 'Saiu',
  BOUNCED: 'E-mail devolvido',
  BLOCKED: 'Bloqueado',
};

const FREQUENCIAS: Record<string, string> = {
  daily: 'diária',
  weekly: 'semanal',
  monthly: 'mensal',
};

const nome = (a: AssinanteNews) =>
  [a.firstName, a.lastName].filter(Boolean).join(' ');

function Estado({ a }: { a: AssinanteNews }) {
  if (a.status === 'ACTIVE') return <span className="text-sm">Ativo</span>;
  if (a.status === 'BOUNCED' || a.status === 'BLOCKED')
    return <Badge estado="atencao">{ESTADOS[a.status]}</Badge>;
  return <Badge>{ESTADOS[a.status]}</Badge>;
}

export default function AssinantesNewsletter() {
  const [filtro, setFiltro] = useState<Filtro>('ACTIVE');
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState<AssinanteNews | null>(null);
  const [editando, setEditando] = useState<AssinanteNews | null>(null);
  const [saindo, setSaindo] = useState(false);
  const [exportando, setExportando] = useState(false);
  const invalidar = useInvalidateAdmin();

  const lista = useAssinantesNews({
    status: filtro === 'todos' ? undefined : filtro,
    search: busca,
  });
  const stats = useEstatisticasNews();
  const descadastrar = useDescadastrar();
  const e = stats.data?.subscribersByStatus ?? {};

  const colunas: Coluna<AssinanteNews>[] = [
    {
      id: 'quem',
      titulo: 'Assinante',
      principal: true,
      celula: (a) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[0.9375rem] text-texto">
            {a.email}
          </span>
          {nome(a) && <span className="t-legenda truncate">{nome(a)}</span>}
        </span>
      ),
    },
    { id: 'estado', titulo: 'Estado', celula: (a) => <Estado a={a} /> },
    {
      id: 'freq',
      titulo: 'Recebe',
      soNoComputador: true,
      celula: (a) => (
        <span className="text-sm">
          {a.frequency ? (FREQUENCIAS[a.frequency] ?? a.frequency) : '—'}
        </span>
      ),
    },
    {
      id: 'aberturas',
      titulo: 'Aberturas',
      alinhar: 'fim',
      celula: (a) => numero(a.emailOpenCount),
    },
    {
      id: 'cliques',
      titulo: 'Cliques',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (a) => numero(a.emailClickCount),
    },
    {
      id: 'desde',
      titulo: 'Desde',
      soNoComputador: true,
      celula: (a) => (
        <span className="t-dado text-sm">{dataCurta(a.subscribedAt)}</span>
      ),
    },
  ];

  const exportar = async () => {
    setExportando(true);
    try {
      await exportarAssinantesNews(filtro === 'todos' ? undefined : filtro);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Não foi possível exportar.'
      );
    } finally {
      setExportando(false);
    }
  };

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Assinantes da newsletter"
        descricao="Quem recebe, quem saiu e quem ainda não confirmou"
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

      <Numeros
        carregando={stats.loading}
        itens={[
          {
            id: 'ativos',
            rotulo: 'Ativos',
            valor: numero(e.ACTIVE ?? 0),
            aoClicar: () => setFiltro('ACTIVE'),
          },
          {
            id: 'pendentes',
            rotulo: 'Esperando confirmação',
            aoClicar: () => setFiltro('PENDING'),
            valor: numero(e.PENDING ?? 0),
          },
          {
            id: 'sairam',
            rotulo: 'Saíram',
            aoClicar: () => setFiltro('UNSUBSCRIBED'),
            valor: numero(e.UNSUBSCRIBED ?? 0),
          },
          {
            id: 'devolvidos',
            rotulo: 'Devolvidos ou bloqueados',
            aoClicar: () => setFiltro('BOUNCED'),
            valor: numero((e.BOUNCED ?? 0) + (e.BLOCKED ?? 0)),
            tom: (e.BOUNCED ?? 0) + (e.BLOCKED ?? 0) ? 'atencao' : undefined,
          },
        ]}
      />

      <Stack gap={3}>
        <Segmentos<Filtro>
          rotulo="Estado"
          valor={filtro}
          aoMudar={setFiltro}
          opcoes={[
            { valor: 'ACTIVE', rotulo: 'Ativos' },
            { valor: 'PENDING', rotulo: 'Esperando' },
            { valor: 'UNSUBSCRIBED', rotulo: 'Saíram' },
            { valor: 'BOUNCED', rotulo: 'Devolvidos' },
            { valor: 'todos', rotulo: 'Todos' },
          ]}
        />
        <Busca
          valor={busca}
          aoMudar={setBusca}
          rotulo="Buscar assinante"
          placeholder="E-mail ou nome"
        />
      </Stack>

      <Tabela
        rotulo="Assinantes"
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
            titulo="Ninguém aqui"
            descricao={
              busca ? `Nenhum assinante com “${busca}”.` : 'Troque o estado.'
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

      <Sheet
        aberto={!!aberto}
        aoFechar={() => setAberto(null)}
        titulo={aberto?.email ?? ''}
        descricao={
          aberto
            ? `${nome(aberto) || 'Sem nome'} · assinou em ${data(aberto.subscribedAt)}`
            : undefined
        }
        largura="m"
        rodape={
          aberto ? (
            <>
              {aberto.status !== 'UNSUBSCRIBED' && (
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiUserMinus}
                  onClick={() => setSaindo(true)}
                  className="mr-auto"
                >
                  Descadastrar
                </Button>
              )}
              <Button
                tamanho="p"
                icone={PiPencilSimple}
                onClick={() => setEditando(aberto)}
              >
                Editar
              </Button>
            </>
          ) : undefined
        }
      >
        {aberto && (
          <Stack gap={6}>
            <Numeros
              colunas={3}
              itens={[
                {
                  id: 'estado',
                  rotulo: 'Estado',
                  valor: (
                    <span className="font-sans text-base">
                      <Estado a={aberto} />
                    </span>
                  ),
                },
                {
                  id: 'aberturas',
                  rotulo: 'Aberturas',
                  valor: numero(aberto.emailOpenCount),
                  nota: aberto.lastEmailOpenedAt
                    ? `última ${relativo(aberto.lastEmailOpenedAt)}`
                    : 'nunca abriu',
                },
                {
                  id: 'cliques',
                  rotulo: 'Cliques',
                  valor: numero(aberto.emailClickCount),
                },
              ]}
            />
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="t-legenda">Recebe</dt>
                <dd className="text-sm">
                  {aberto.frequency
                    ? (FREQUENCIAS[aberto.frequency] ?? aberto.frequency)
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="t-legenda">Idioma</dt>
                <dd className="text-sm">
                  {aberto.language === 'en'
                    ? 'inglês'
                    : aberto.language === 'pt'
                      ? 'português'
                      : (aberto.language ?? '—')}
                </dd>
              </div>
              {aberto.unsubscribedAt && (
                <div>
                  <dt className="t-legenda">Saiu em</dt>
                  <dd className="text-sm">{data(aberto.unsubscribedAt)}</dd>
                </div>
              )}
            </dl>
            {aberto.interests?.length > 0 && (
              <Stack gap={2}>
                <Text papel="legenda" as="p">
                  Interesses
                </Text>
                <Inline gap={2} quebra>
                  {aberto.interests.map((i) => (
                    <Badge key={i}>{i}</Badge>
                  ))}
                </Inline>
              </Stack>
            )}
          </Stack>
        )}
      </Sheet>

      {editando && (
        <EditorDeAssinante
          assinante={editando}
          aoFechar={() => setEditando(null)}
          aoSalvar={async (id, dados) => {
            await updateSubscriberRequest(id, dados);
            toast.success('Assinante salvo.');
            setEditando(null);
            setAberto(null);
            void invalidar('newsletter');
            void invalidar('auditoria');
          }}
        />
      )}

      <ConfirmModal
        isOpen={saindo}
        onClose={() => setSaindo(false)}
        onConfirm={async () => {
          if (!aberto) return;
          try {
            await descadastrar.mutateAsync([aberto.id]);
            toast.success('Assinante descadastrado.');
            setAberto(null);
          } catch (err) {
            toast.error(
              err instanceof Error
                ? err.message
                : 'Não foi possível descadastrar.'
            );
          }
          setSaindo(false);
        }}
        type="warning"
        title="Descadastrar este e-mail?"
        message="Ele para de receber a newsletter. A pessoa pode voltar a assinar pelo site."
        confirmText="Descadastrar"
        cancelText="Voltar"
        isLoading={descadastrar.isPending}
      />
    </Stack>
  );
}
