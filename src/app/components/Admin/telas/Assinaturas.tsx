'use client';

import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Selecao } from '@/app/components/ui/Selecao';
import { Sheet } from '@/app/components/ui/Sheet';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho, Secao } from '@/app/components/Admin/painel/Cabecalho';
import {
  Busca,
  PERIODOS,
  Segmentos,
} from '@/app/components/Admin/painel/Controles';
import { Colunas, Proporcoes } from '@/app/components/Admin/painel/Graficos';
import { Numeros, rolarAte } from '@/app/components/Admin/painel/Numeros';
import { Tabela, type Coluna } from '@/app/components/Admin/painel/Tabela';
import {
  PERIODOS_COBRANCA,
  PLANOS,
  data,
  dataCurta,
  moeda,
  numero,
  porcento,
  relativo,
  variacao,
} from '@/app/components/Admin/painel/formatos';
import {
  useAssinatura,
  useAssinaturas,
  usePanoramaAssinaturas,
} from '@/app/hooks/admin/usePainel';
import type {
  EstadoAssinatura,
  LinhaAssinatura,
  PeriodoCobranca,
  Plano,
} from '@/app/requests/admin/painel';

/**
 * Assinaturas: quem paga, quanto entra e quem vai embora.
 *
 * **Página nova (29/09/2026).** O menu antigo apontava para cá e a rota
 * respondia 404. Tudo sai de `Payment` e `Subscription` no banco, sem
 * estimativa: a receita recorrente é a soma dos preços gravados nas
 * assinaturas que renovam; as que não têm preço gravado aparecem contadas.
 *
 * Só leitura: cancelar, reembolsar e trocar de plano continuam no Stripe —
 * uma escrita aqui que não passasse por ele deixaria banco e cartão
 * discordando.
 */

const ESTADOS: { valor: EstadoAssinatura; rotulo: string }[] = [
  { valor: 'ativas', rotulo: 'Ativas' },
  { valor: 'teste', rotulo: 'Em teste' },
  { valor: 'atraso', rotulo: 'Em atraso' },
  { valor: 'vao-sair', rotulo: 'Vão sair' },
  { valor: 'nao-renovaram', rotulo: 'Não renovaram' },
  { valor: 'expiradas', rotulo: 'Expiradas' },
  { valor: 'pendentes', rotulo: 'Checkout aberto' },
  { valor: 'todas', rotulo: 'Todas' },
];

const METODOS: Record<string, string> = {
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  PIX: 'PIX',
  BOLETO: 'Boleto',
  MERCADO_PAGO_WALLET: 'Carteira Mercado Pago',
  DESCONHECIDO: 'Não informado',
};

const HISTORICO: Record<string, string> = {
  CREATED: 'Assinou',
  UPGRADED: 'Subiu de plano',
  DOWNGRADED: 'Desceu de plano',
  CANCELLED: 'Cancelou',
  REACTIVATED: 'Reativou',
  RENEWED: 'Renovou',
  EXPIRED: 'Expirou',
};

const STATUS: Record<string, string> = {
  ACTIVE: 'ativa',
  TRIAL: 'em teste',
  PAST_DUE: 'em atraso',
  CANCELLED: 'cancelada',
  EXPIRED: 'expirada',
  PENDING: 'checkout aberto',
};

const PAGAMENTO: Record<string, string> = {
  APPROVED: 'Pago',
  PENDING: 'Aguardando',
  REJECTED: 'Recusado',
  REFUNDED: 'Reembolsado',
  CANCELLED: 'Cancelado',
  IN_PROCESS: 'Processando',
};

export function SeloEstado({
  linha,
}: {
  linha: Pick<LinhaAssinatura, 'estado' | 'fim'>;
}) {
  switch (linha.estado) {
    case 'teste':
      return <Badge estado="ouro">Em teste</Badge>;
    case 'atraso':
      return <Badge estado="atencao">Em atraso</Badge>;
    case 'vao-sair':
      return <Badge>Sai em {data(linha.fim)}</Badge>;
    case 'expiradas':
      return <Badge>Expirada</Badge>;
    case 'pendentes':
      return <Badge>Checkout aberto</Badge>;
    default:
      return <Badge>Ativa</Badge>;
  }
}

const planoEPeriodo = (plano: Plano, periodo: PeriodoCobranca | null) =>
  `${PLANOS[plano] ?? plano}${periodo ? ` · ${PERIODOS_COBRANCA[periodo]}` : ''}`;

export default function Assinaturas() {
  const navegar = useNavegar();
  const [dias, setDias] = useState<number>(30);
  const [estado, setEstado] = useState<EstadoAssinatura>('ativas');
  const [plano, setPlano] = useState<Plano | ''>('');
  const [periodo, setPeriodo] = useState<PeriodoCobranca | ''>('');
  const [busca, setBusca] = useState('');
  const [aberta, setAberta] = useState<string | null>(null);

  // O painel manda para cá com `?estado=atraso`.
  useEffect(() => {
    const e = new URLSearchParams(window.location.search).get('estado');
    if (e && ESTADOS.some((x) => x.valor === e))
      setEstado(e as EstadoAssinatura);
  }, []);

  const panorama = usePanoramaAssinaturas(dias);
  const lista = useAssinaturas({
    estado,
    plano: plano || undefined,
    periodo: periodo || undefined,
    busca,
  });

  const p = panorama.data;
  const delta = p
    ? variacao(p.receita.periodo, p.receita.periodoAnterior)
    : null;
  const rotuloJanela =
    PERIODOS.find((x) => x.valor === dias)?.rotulo ?? `${dias} dias`;

  const colunas: Coluna<LinhaAssinatura>[] = [
    {
      id: 'pessoa',
      titulo: 'Quem assina',
      principal: true,
      celula: (l) => (
        <span className="flex min-w-0 flex-col">
          {l.usuario.id ? (
            <Elo
              onClick={() => navegar.usuario(l.usuario.id!)}
              className="truncate text-[0.9375rem]"
            >
              {l.usuario.nome}
            </Elo>
          ) : (
            <span className="truncate text-[0.9375rem] text-texto-suave">
              {l.usuario.nome}
            </span>
          )}
          <span className="t-legenda truncate">{l.usuario.email}</span>
        </span>
      ),
    },
    {
      id: 'plano',
      titulo: 'Plano',
      celula: (l) => planoEPeriodo(l.plano, l.periodo),
    },
    { id: 'estado', titulo: 'Estado', celula: (l) => <SeloEstado linha={l} /> },
    {
      id: 'inicio',
      titulo: 'Desde',
      soNoComputador: true,
      celula: (l) => (
        <span className="t-dado text-sm">{dataCurta(l.inicio)}</span>
      ),
    },
    {
      id: 'fim',
      titulo: 'Renova ou vence',
      celula: (l) => (
        <span className="t-dado text-sm">
          {l.estado === 'teste' ? dataCurta(l.fimDoTeste) : dataCurta(l.fim)}
        </span>
      ),
    },
    {
      id: 'preco',
      titulo: 'Preço',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (l) => moeda(l.preco),
    },
    {
      id: 'pago',
      titulo: 'Total pago',
      alinhar: 'fim',
      celula: (l) => moeda(l.totalPago),
    },
  ];

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Assinaturas"
        descricao="Quem paga, quanto entra e quem vai embora"
        atualizadoEm={panorama.updatedAt}
        acoes={
          <Segmentos
            rotulo="Período dos números"
            opcoes={PERIODOS.map((x) => ({
              valor: x.valor as number,
              rotulo: x.rotulo,
            }))}
            valor={dias}
            aoMudar={setDias}
          />
        }
      />

      <Numeros
        carregando={panorama.loading}
        itens={[
          {
            id: 'receita',
            rotulo: `Receita em ${rotuloJanela}`,
            aoClicar: () => rolarAte('ass-meses'),
            valor: moeda(p?.receita.periodo),
            nota:
              delta === null
                ? 'sem período anterior para comparar'
                : `${delta >= 0 ? '+' : ''}${porcento(delta)} sobre o anterior`,
          },
          {
            id: 'mrr',
            rotulo: 'Recorrente mensal',
            aoClicar: () => rolarAte('ass-planos'),
            valor: moeda(p?.recorrente.mensal),
            nota: p
              ? p.recorrente.semPreco
                ? `${numero(p.recorrente.semPreco)} sem preço gravado`
                : `${moeda(p.recorrente.anualizado, 0)} por ano`
              : undefined,
            tom: p?.recorrente.semPreco ? 'atencao' : undefined,
          },
          {
            id: 'vivas',
            rotulo: 'Assinantes pagos',
            aoClicar: () => {
              setEstado('ativas');
              rolarAte('ass-lista');
            },
            valor: numero(p?.assinantes.vivas),
            nota: p
              ? `${numero(p.assinantes.teste)} em teste · ${numero(p.assinantes.atraso)} em atraso`
              : undefined,
          },
          {
            id: 'ticket',
            rotulo: 'Ticket médio',
            aoClicar: () => rolarAte('ass-planos'),
            valor: moeda(p?.receita.ticketMedio),
            nota: p
              ? `${numero(p.receita.pagamentos)} ${p.receita.pagamentos === 1 ? 'pagamento' : 'pagamentos'}`
              : undefined,
          },
          {
            id: 'cancelaram',
            rotulo: 'Cancelaram',
            aoClicar: () => {
              setEstado('vao-sair');
              rolarAte('ass-lista');
            },
            valor: numero(p?.movimento.cancelaram),
            nota: p
              ? p.movimento.taxaCancelamento.valor === null
                ? 'sem base para taxa'
                : `${porcento(p.movimento.taxaCancelamento.valor)} de ${numero(p.movimento.taxaCancelamento.base)}`
              : undefined,
            tom:
              (p?.movimento.taxaCancelamento.valor ?? 0) >= 5
                ? 'atencao'
                : undefined,
          },
          {
            id: 'nao-renovaram',
            rotulo: 'Não renovaram',
            aoClicar: () => {
              setEstado('nao-renovaram');
              rolarAte('ass-lista');
            },
            valor: numero(p?.movimento.naoRenovaram),
            nota: 'venceu e não voltou',
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section
          aria-labelledby="ass-meses"
          className="sup-1 flex flex-col gap-4 p-5 md:p-6"
        >
          <Inline extremos alinhar="base" quebra>
            <Text papel="secao" as="h2" id="ass-meses">
              Receita por mês
            </Text>
            <Text papel="legenda" as="span">
              {p
                ? `${moeda(p.receita.total, 0)} desde o início · ${numero(p.receita.pagamentosTotal)} ${p.receita.pagamentosTotal === 1 ? 'pagamento' : 'pagamentos'}`
                : ' '}
            </Text>
          </Inline>
          {panorama.loading || !p ? (
            <Skeleton forma="bloco" className="h-46 w-full" />
          ) : (
            <Colunas
              titulo="Receita por mês nos últimos 12 meses"
              formatar={(n) => moeda(n)}
              dados={p.receita.porMes.map((m) => {
                const d = new Date(`${m.mes}-15T12:00:00`);
                return {
                  rotulo: `${d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · ${m.pagamentos} ${m.pagamentos === 1 ? 'pagamento' : 'pagamentos'}`,
                  eixo: d
                    .toLocaleDateString('pt-BR', { month: 'short' })
                    .replace('.', ''),
                  valor: m.valor,
                };
              })}
            />
          )}
        </section>

        <Secao titulo="Por plano" id="ass-planos">
          {panorama.loading || !p ? (
            <Stack gap={3}>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </Stack>
          ) : (
            <Proporcoes
              titulo="Assinantes pagos por plano"
              dados={p.assinantes.porPlano.map((x) => ({
                rotulo: PLANOS[x.plano],
                valor: x.total,
              }))}
              nota={(_, i) => {
                const x = p.assinantes.porPlano[i];
                const mrr =
                  p.recorrente.porPlano.find((r) => r.plano === x.plano)
                    ?.mensal ?? 0;
                return `${numero(x.mensal)} mensais · ${numero(x.anual)} anuais · ${moeda(mrr, 0)}/mês`;
              }}
            />
          )}
        </Secao>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Secao titulo="Movimento" id="ass-movimento" detalhe={rotuloJanela}>
          <dl className="flex flex-col">
            {[
              ['Assinaram', p?.movimento.novos],
              ['Cancelaram', p?.movimento.cancelaram],
              ['Expiraram', p?.movimento.expiraram],
              ['Cancelaram e ainda têm acesso', p?.movimento.vaoSair],
              ['Checkouts abandonados', p?.movimento.checkoutsAbandonados],
              [
                'Testes que terminam em 7 dias',
                p?.movimento.testesVencendo7Dias,
              ],
            ].map(([rotulo, valor]) => (
              <div
                key={rotulo as string}
                className="flex items-baseline gap-3 border-b border-linha py-2.5 last:border-0"
              >
                <dt className="t-rotulo flex-1 text-texto-suave">{rotulo}</dt>
                <dd className="t-dado text-texto">
                  {panorama.loading ? '…' : numero(valor as number)}
                </dd>
              </div>
            ))}
          </dl>
        </Secao>

        <Secao titulo="Como pagam" id="ass-metodos" detalhe={rotuloJanela}>
          {p && p.receita.porMetodo.length > 0 ? (
            <Stack gap={4}>
              <Proporcoes
                titulo="Receita por forma de pagamento"
                formatar={(n) => moeda(n, 0)}
                dados={p.receita.porMetodo.map((m) => ({
                  rotulo: METODOS[m.metodo] ?? m.metodo,
                  valor: m.valor,
                }))}
              />
              <Text papel="legenda" as="p">
                {moeda(p.receita.descontos)} em descontos de cupom ·{' '}
                {moeda(p.receita.reembolsos.valor)} reembolsados em{' '}
                {numero(p.receita.reembolsos.quantidade)} pagamentos
              </Text>
            </Stack>
          ) : (
            <Text papel="rotulo" tom="suave" as="p">
              {panorama.loading
                ? 'Carregando…'
                : 'Nenhum pagamento no período.'}
            </Text>
          )}
        </Secao>

        <Secao
          titulo="Não renovaram"
          id="ass-sairam"
          atalho={
            <Button
              variante="texto"
              tamanho="p"
              onClick={() => setEstado('nao-renovaram')}
            >
              Ver todos
            </Button>
          }
        >
          {p && p.naoRenovaramRecentes.length > 0 ? (
            <ul className="flex flex-col">
              {p.naoRenovaramRecentes.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => setAberta(n.id)}
                    className="flex w-full items-baseline gap-3 border-b border-linha py-2.5 text-left last:border-0 hover:text-texto"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm text-texto">
                        {n.usuario.nome}
                      </span>
                      <span className="t-legenda">
                        {planoEPeriodo(n.plano, n.periodo)} · venceu{' '}
                        {relativo(n.venceuEm)}
                      </span>
                    </span>
                    <span className="t-dado text-sm text-texto-suave">
                      {moeda(n.totalPago, 0)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Text papel="rotulo" tom="suave" as="p">
              {panorama.loading
                ? 'Carregando…'
                : 'Ninguém deixou vencer sem voltar.'}
            </Text>
          )}
        </Secao>
      </div>

      <Secao titulo="Todas as assinaturas" id="ass-lista">
        <Stack gap={3}>
          <Segmentos
            rotulo="Estado da assinatura"
            opcoes={ESTADOS}
            valor={estado}
            aoMudar={setEstado}
          />
          <div className="flex flex-wrap items-end gap-3">
            <Busca
              valor={busca}
              aoMudar={setBusca}
              rotulo="Buscar por nome ou e-mail"
              placeholder="Nome ou e-mail"
            />
            <div className="w-44">
              <label htmlFor="ass-plano" className="sr-only">
                Plano
              </label>
              <Selecao
                id="ass-plano"
                valor={plano}
                aoMudar={(v) => setPlano(v as Plano | '')}
                opcoes={[
                  { value: '', label: 'Todos os planos' },
                  { value: 'PLUS', label: 'Plus' },
                  { value: 'MENTOR', label: 'Mentor' },
                  { value: 'MAESTRO', label: 'Maestro' },
                ]}
              />
            </div>
            <div className="w-44">
              <label htmlFor="ass-periodo" className="sr-only">
                Período de cobrança
              </label>
              <Selecao
                id="ass-periodo"
                valor={periodo}
                aoMudar={(v) => setPeriodo(v as PeriodoCobranca | '')}
                opcoes={[
                  { value: '', label: 'Mensal e anual' },
                  { value: 'MONTHLY', label: 'Mensal' },
                  { value: 'YEARLY', label: 'Anual' },
                ]}
              />
            </div>
          </div>
        </Stack>

        <Tabela
          rotulo="Assinaturas"
          colunas={colunas}
          linhas={lista.items}
          chave={(l) => l.id}
          carregando={lista.loading}
          aoClicar={(l) => setAberta(l.id)}
          erro={
            lista.error ? (
              <Text papel="rotulo" tom="erro" as="p">
                {lista.error}
              </Text>
            ) : undefined
          }
          vazio={
            <Vazio
              titulo="Nenhuma assinatura aqui"
              descricao={
                busca
                  ? `Ninguém com “${busca}” neste recorte.`
                  : 'Troque o estado ou o plano para ver outras.'
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
      </Secao>

      <DetalheAssinatura id={aberta} aoFechar={() => setAberta(null)} />
    </Stack>
  );
}

function DetalheAssinatura({
  id,
  aoFechar,
}: {
  id: string | null;
  aoFechar: () => void;
}) {
  const { data: d, loading, error } = useAssinatura(id);
  const navegar = useNavegar();
  const router = useRouter();

  return (
    <Sheet
      aberto={!!id}
      aoFechar={aoFechar}
      rodape={
        d?.usuario.id ? (
          <Button tamanho="p" onClick={() => navegar.usuario(d.usuario.id!)}>
            Abrir a conta
          </Button>
        ) : undefined
      }
      titulo={d ? d.usuario.nome : 'Assinatura'}
      descricao={
        d
          ? d.usuario.desde
            ? `${d.usuario.email ?? ''} · conta desde ${data(d.usuario.desde)}`
            : 'O registro financeiro fica, sem a pessoa (RN-6).'
          : undefined
      }
      largura="g"
    >
      {loading || !d ? (
        error ? (
          <Text papel="rotulo" tom="erro" as="p">
            {error}
          </Text>
        ) : (
          <Row.Skeleton repetir={4} />
        )
      ) : (
        <Stack gap={6}>
          <Numeros
            colunas={4}
            itens={[
              {
                id: 'plano',
                rotulo: 'Plano',
                valor: (
                  <span className="font-sans text-lg">
                    {planoEPeriodo(d.plano, d.periodo)}
                  </span>
                ),
              },
              {
                id: 'estado',
                rotulo: 'Estado',
                valor: <SeloEstado linha={d} />,
              },
              {
                id: 'preco',
                rotulo: 'Preço',
                aoClicar: () => router.push('/admin/plans/pricing'),
                valor: moeda(d.preco),
                nota: d.renovaSozinha ? 'renova sozinha' : 'não renova',
              },
              {
                id: 'pago',
                rotulo: 'Total pago',
                aoClicar: () => rolarAte('ass-pagamentos'),
                valor: moeda(d.totalPago),
                nota: `${d.pagamentos.length} ${d.pagamentos.length === 1 ? 'pagamento' : 'pagamentos'}`,
              },
            ]}
          />

          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
            <Info rotulo="Início">{data(d.inicio)}</Info>
            <Info
              rotulo={d.estado === 'teste' ? 'Fim do teste' : 'Renova ou vence'}
            >
              {d.estado === 'teste' ? data(d.fimDoTeste) : data(d.fim)}
            </Info>
            <Info rotulo="Cancelada em">{data(d.canceladaEm)}</Info>
            <Info rotulo="Cupom">{d.cupom ? `${d.cupom.code}` : '—'}</Info>
            <Info rotulo="Assinatura no Stripe" dado>
              {d.stripe.assinatura ?? '—'}
            </Info>
            <Info rotulo="Cliente no Stripe" dado>
              {d.stripe.cliente ?? '—'}
            </Info>
          </dl>

          <Stack gap={2}>
            <Text papel="secao" as="h3" id="ass-pagamentos">
              Pagamentos
            </Text>
            {d.pagamentos.length === 0 ? (
              <Text papel="rotulo" tom="suave" as="p">
                Nenhum pagamento registrado.
              </Text>
            ) : (
              <ul className="flex flex-col divide-y divide-linha rounded-controle bg-sup-2">
                {d.pagamentos.map((pg) => (
                  <li
                    key={pg.id}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-2.5"
                  >
                    <span className="t-dado w-28 text-sm text-texto-suave">
                      {data(pg.paidAt ?? pg.createdAt)}
                    </span>
                    <span className="flex-1 text-sm">
                      {PAGAMENTO[pg.status] ?? pg.status}
                      {pg.paymentMethod ? (
                        <span className="text-texto-fraco">
                          {' '}
                          · {METODOS[pg.paymentMethod] ?? pg.paymentMethod}
                        </span>
                      ) : null}
                      {pg.discountAmount ? (
                        <span className="text-texto-fraco">
                          {' '}
                          · desconto de {moeda(pg.discountAmount)}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={
                        pg.status === 'REJECTED'
                          ? 't-dado text-sm text-erro'
                          : 't-dado text-sm text-texto'
                      }
                    >
                      {moeda(pg.finalAmount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Stack>

          {d.historico.length > 0 && (
            <Stack gap={2}>
              <Text papel="secao" as="h3">
                Histórico
              </Text>
              <ol className="flex flex-col">
                {d.historico.map((h) => (
                  <li
                    key={h.id}
                    className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-linha py-2.5 text-sm last:border-0"
                  >
                    <span className="t-dado text-texto-fraco">
                      {data(h.em)}
                    </span>
                    <span>
                      {HISTORICO[h.acao] ?? h.acao}
                      {h.de && h.para && h.de !== h.para
                        ? ` · ${PLANOS[h.de]} → ${PLANOS[h.para]}`
                        : ''}
                      {h.motivo ? (
                        <span className="text-texto-fraco"> · {h.motivo}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
            </Stack>
          )}

          {d.outrasAssinaturas.length > 0 && (
            <Stack gap={2}>
              <Text papel="secao" as="h3">
                Outras assinaturas desta pessoa
              </Text>
              <ul className="flex flex-col">
                {d.outrasAssinaturas.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-baseline gap-4 border-b border-linha py-2 text-sm last:border-0"
                  >
                    <span className="flex-1">
                      {planoEPeriodo(o.planType, o.billingPeriod)}
                    </span>
                    <span className="t-dado text-texto-fraco">
                      {data(o.startDate)} –{' '}
                      {o.endDate ? data(o.endDate) : 'hoje'}
                    </span>
                    <span className="t-legenda w-24 text-right">
                      {STATUS[o.status] ?? o.status}
                    </span>
                  </li>
                ))}
              </ul>
            </Stack>
          )}
        </Stack>
      )}
    </Sheet>
  );
}

function Info({
  rotulo,
  children,
  dado = false,
}: {
  rotulo: string;
  children: React.ReactNode;
  dado?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="t-legenda">{rotulo}</dt>
      <dd
        className={
          dado ? 't-dado break-all text-sm text-texto' : 'text-sm text-texto'
        }
      >
        {children}
      </dd>
    </div>
  );
}
