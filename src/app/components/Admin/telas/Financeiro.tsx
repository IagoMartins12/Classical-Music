'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiCaretLeft,
  PiCaretRight,
  PiDownloadSimple,
  PiPlus,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Erro, Vazio } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import { Proporcoes } from '@/app/components/Admin/painel/Graficos';
import {
  dataCurta,
  moeda,
  numero,
  porcento,
} from '@/app/components/Admin/painel/formatos';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import {
  useApagarLancamento,
  useApagarMeta,
  useCorrigirLancamento,
  useCriarLancamento,
  useCriarMeta,
  useLancamentos,
  useMetas,
  usePausarLancamento,
  useResumoFinanceiro,
} from '@/app/hooks/admin/useFinanceiro';
import {
  CATEGORIAS_DE_CUSTO,
  CATEGORIAS_DE_ENTRADA,
  exportarFinanceiro,
  type Direcao,
  type Forma,
  type Lancamento,
  type MetricaDeMeta,
  type Meta,
  type Moeda,
} from '@/app/requests/admin/financeiro';

/**
 * Financeiro: o que o projeto gasta, o que entra e quando ele se paga.
 *
 * A receita de assinatura vem sozinha (pagamentos aprovados e assinaturas em
 * vigor); aqui se lançam os custos e as entradas manuais (patrocínio, edital,
 * doação, prêmio), cada um único, parcelado ou recorrente. Dinheiro em
 * centavos, moeda e cotação guardadas por lançamento.
 */

const NOME_DO_MES = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const MES_CURTO = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit',
  timeZone: 'UTC',
});

const chaveDoMes = (data: Date) =>
  `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, '0')}`;
const dataDoMes = (chave: string) => {
  const [ano, mes] = chave.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1, 1));
};
const somarMeses = (chave: string, n: number) => {
  const d = dataDoMes(chave);
  return chaveDoMes(
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1))
  );
};

const reais = (centavos: number | null | undefined) =>
  centavos === null || centavos === undefined ? '—' : moeda(centavos / 100);

const FORMAS: Record<Forma, string> = {
  ONCE: 'Único',
  INSTALLMENTS: 'Parcelado',
  RECURRING: 'Recorrente',
};

const METRICAS: Record<MetricaDeMeta, string> = {
  MRR: 'Receita mensal (MRR)',
  SUBSCRIBERS: 'Assinantes pagantes',
  TEACHERS: 'Professores ativos',
};

const nomeDaCategoria = (categoria: string) =>
  [...CATEGORIAS_DE_CUSTO, ...CATEGORIAS_DE_ENTRADA].find(
    ([valor]) => valor === categoria
  )?.[1] ?? categoria;

/** "1.234,56" ou "1234.56" para centavos; `null` se não for um valor. */
export function centavosDe(texto: string): number | null {
  const limpo = texto.trim().replace(/\s/g, '');
  if (!limpo) return null;
  const normal = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo;
  const valor = Number(normal);
  return Number.isFinite(valor) && valor > 0 ? Math.round(valor * 100) : null;
}

export default function Financeiro() {
  const [mes, setMes] = useState(() => chaveDoMes(new Date()));
  const resumo = useResumoFinanceiro(mes);
  const [direcao, setDirecao] = useState<Direcao>('COST');
  const lancamentos = useLancamentos(direcao);
  const metas = useMetas();
  const [formulario, setFormulario] = useState<{
    lancamento: Lancamento | null;
  } | null>(null);
  const [novaMeta, setNovaMeta] = useState(false);
  const [apagando, setApagando] = useState<Lancamento | null>(null);
  const apagar = useApagarLancamento();
  const pausar = usePausarLancamento();
  const [exportando, setExportando] = useState(false);

  const r = resumo.data;
  const ehMesAtual = mes === chaveDoMes(new Date());

  const exportar = async () => {
    setExportando(true);
    try {
      const ano = mes.slice(0, 4);
      await exportarFinanceiro(`${ano}-01`, `${ano}-12`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível exportar.'
      );
    } finally {
      setExportando(false);
    }
  };

  const confirmarApagar = async () => {
    if (!apagando) return;
    try {
      await apagar.mutateAsync([apagando.id]);
      toast.success('Lançamento apagado.');
      setApagando(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível apagar.');
    }
  };

  const alternarPausa = async (item: Lancamento) => {
    try {
      await pausar.mutateAsync([item.id, !item.pausedAt]);
      toast.success(
        item.pausedAt ? 'Retomado.' : 'Pausado: nada é contado dali em diante.'
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível pausar.');
    }
  };

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Financeiro"
        descricao="O que o projeto gasta, o que entra e quando ele se paga. A receita de assinatura vem sozinha; aqui você lança os custos e as entradas manuais."
        aoAtualizar={resumo.refetch}
        atualizando={resumo.fetching}
        acoes={
          <Button
            tamanho="p"
            variante="fantasma"
            icone={PiDownloadSimple}
            carregando={exportando}
            onClick={() => void exportar()}
          >
            Exportar {mes.slice(0, 4)} em CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiCaretLeft}
          rotulo="Mês anterior"
          onClick={() => setMes(somarMeses(mes, -1))}
        />
        <Text
          papel="subtitulo"
          as="h2"
          className="min-w-40 text-center capitalize"
        >
          {NOME_DO_MES.format(dataDoMes(mes))}
        </Text>
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiCaretRight}
          rotulo="Próximo mês"
          onClick={() => setMes(somarMeses(mes, 1))}
        />
        {!ehMesAtual && (
          <Button
            tamanho="p"
            variante="fantasma"
            onClick={() => setMes(chaveDoMes(new Date()))}
          >
            Voltar a este mês
          </Button>
        )}
      </div>

      {resumo.error ? (
        <Erro
          titulo="Não foi possível calcular o mês"
          descricao={resumo.error}
          acao={
            <Button tamanho="p" onClick={() => void resumo.refetch()}>
              Tentar de novo
            </Button>
          }
        />
      ) : (
        <>
          <Numeros
            carregando={resumo.loading}
            itens={[
              {
                id: 'receita',
                rotulo: 'Receita no mês (caixa)',
                valor: reais(r?.income.grossCents),
                nota: `${reais(r?.income.subscriptionCashCents)} de assinaturas · ${reais(r?.income.manualCents)} manuais. Bruta: a taxa do Stripe ainda não é descontada.`,
              },
              {
                id: 'custos',
                rotulo: 'Custos no mês',
                valor: reais(r?.costs.totalCents),
                nota: `${reais(r?.costs.realizedCents)} já pagos · ${reais(r?.costs.plannedCents)} previstos`,
              },
              {
                id: 'resultado',
                rotulo: 'Resultado do mês',
                valor: reais(r?.resultCents),
                tom: r && r.resultCents < 0 ? 'atencao' : undefined,
              },
              {
                id: 'mrr',
                rotulo: 'Receita mensal (MRR)',
                valor: reais(r?.accrual.mrrCents),
                nota: `${numero(r?.subscribers.active)} assinantes pagantes · a anual vale 1/12 por mês${r?.accrual.isCurrentMonth ? '' : ' (o MRR de hoje)'}`,
              },
            ]}
          />

          {r && <Equilibrio resumo={r} />}
        </>
      )}

      <Metas
        carregando={metas.loading}
        metas={metas.data?.items ?? []}
        aoCriar={() => setNovaMeta(true)}
      />

      <Stack gap={4}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmentos<Direcao>
            rotulo="Tipo de lançamento"
            valor={direcao}
            aoMudar={setDirecao}
            opcoes={[
              { valor: 'COST', rotulo: 'Custos' },
              { valor: 'INCOME', rotulo: 'Entradas manuais' },
            ]}
          />
          <Button
            tamanho="p"
            icone={PiPlus}
            onClick={() => setFormulario({ lancamento: null })}
          >
            {direcao === 'COST' ? 'Lançar custo' : 'Lançar entrada'}
          </Button>
        </div>

        {lancamentos.error ? (
          <Erro
            titulo="Não foi possível carregar os lançamentos"
            descricao={lancamentos.error}
          />
        ) : lancamentos.loading ? (
          <Row.Skeleton repetir={4} />
        ) : (lancamentos.data?.items.length ?? 0) === 0 ? (
          <Vazio
            titulo={
              direcao === 'COST'
                ? 'Nenhum custo lançado'
                : 'Nenhuma entrada manual lançada'
            }
            descricao={
              direcao === 'COST'
                ? 'Servidor, banco, IA, domínio, e-mail: lance o que o projeto paga para ver quando ele se paga.'
                : 'Patrocínio, edital, doação ou prêmio. A receita de assinatura não se lança: ela vem dos pagamentos.'
            }
          />
        ) : (
          <Stack gap={1}>
            {lancamentos.data?.items.map((item) => (
              <Row
                key={item.id}
                clicavel
                onClick={() => setFormulario({ lancamento: item })}
                titulo={item.name}
                detalhe={descreve(item)}
                depois={<Selos item={item} />}
              />
            ))}
          </Stack>
        )}
      </Stack>

      {r && r.costs.byCategory.length > 0 && (
        <Stack gap={3}>
          <Text papel="titulo" as="h2">
            Custos do mês por categoria
          </Text>
          <Proporcoes
            titulo="Custos por categoria"
            formatar={(n) => reais(n)}
            dados={r.costs.byCategory.map((c) => ({
              rotulo: nomeDaCategoria(c.category),
              valor: c.cents,
            }))}
          />
        </Stack>
      )}

      {r && <Projecao resumo={r} />}

      <Sheet
        aberto={formulario !== null}
        aoFechar={() => setFormulario(null)}
        titulo={
          formulario?.lancamento
            ? 'Lançamento'
            : direcao === 'COST'
              ? 'Lançar custo'
              : 'Lançar entrada'
        }
        largura="g"
      >
        {formulario && (
          <FormularioDeLancamento
            key={formulario.lancamento?.id ?? 'novo'}
            direcao={formulario.lancamento?.direction ?? direcao}
            lancamento={formulario.lancamento}
            aoSalvar={() => setFormulario(null)}
            aoPausar={alternarPausa}
            aoApagar={(item) => {
              setFormulario(null);
              setApagando(item);
            }}
          />
        )}
      </Sheet>

      <Sheet
        aberto={novaMeta}
        aoFechar={() => setNovaMeta(false)}
        titulo="Nova meta"
        largura="p"
      >
        {novaMeta && <FormularioDeMeta aoSalvar={() => setNovaMeta(false)} />}
      </Sheet>

      <ConfirmModal
        isOpen={apagando !== null}
        onClose={() => setApagando(null)}
        onConfirm={confirmarApagar}
        type="warning"
        title="Apagar este lançamento?"
        message="Ele some do histórico e dos meses anteriores. Para um recorrente que só acabou, prefira pausar: assim o passado fica."
        confirmText="Apagar"
        cancelText="Voltar"
        isLoading={apagar.isPending}
        acaoPerigosa
      />
    </Stack>
  );
}

function descreve(item: Lancamento) {
  const partes: string[] = [nomeDaCategoria(item.category)];
  if (item.counterparty) partes.push(item.counterparty);
  if (item.kind === 'RECURRING') {
    partes.push(
      `${reais(item.monthlyCents)} por mês${item.intervalMonths && item.intervalMonths > 1 ? ` (cobra a cada ${item.intervalMonths} meses)` : ''}`
    );
  } else if (item.kind === 'INSTALLMENTS') {
    partes.push(
      `${item.installments}x · faltam ${item.remainingInstallments ?? 0}`
    );
  } else {
    partes.push(dataCurta(item.startDate));
  }
  return partes.join(' · ');
}

function Selos({ item }: { item: Lancamento }) {
  const total =
    item.totalBrlCents !== null
      ? reais(item.totalBrlCents)
      : reais(item.monthlyCents);
  return (
    <span className="flex flex-wrap items-center justify-end gap-1.5">
      <Badge>{FORMAS[item.kind]}</Badge>
      {item.state === 'paused' && <Badge estado="atencao">Pausado</Badge>}
      {item.state === 'done' && item.kind !== 'ONCE' && (
        <Badge>Concluído</Badge>
      )}
      <span className="t-dado text-sm">{total}</span>
    </span>
  );
}

function Equilibrio({
  resumo,
}: {
  resumo: NonNullable<ReturnType<typeof useResumoFinanceiro>['data']>;
}) {
  const e = resumo.breakEven;
  const fixo = resumo.fixedMonthlyCostCents;

  return (
    <div className="flex flex-col gap-3 rounded-card bg-sup-2 p-5">
      <Text papel="subtitulo" as="h2">
        Ponto de equilíbrio
      </Text>
      {fixo === 0 ? (
        <Text papel="rotulo" as="p">
          Lance os custos recorrentes (servidor, banco, domínio) e aqui aparece
          quanto de receita mensal cobre o custo fixo.
        </Text>
      ) : (
        <>
          <Text papel="corpo" as="p">
            O custo fixo é de <strong>{reais(fixo)}</strong> por mês. A receita
            mensal de hoje cobre{' '}
            <strong>{porcento(e.coveredShare * 100, 0)}</strong> dele
            {e.subscribersNeeded !== null &&
              `; no preço médio atual, são ${numero(e.subscribersNeeded)} assinantes para fechar a conta (hoje ${numero(resumo.subscribers.active)}).`}
            {e.subscribersNeeded === null &&
              '. Sem assinantes pagantes ainda, não há preço médio para dividir.'}
          </Text>
          <span
            role="progressbar"
            aria-valuenow={Math.round(Math.min(1, e.coveredShare) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="block h-2 overflow-hidden rounded-full bg-[var(--linha)]"
          >
            <span
              className="block h-full rounded-full bg-ouro"
              style={{ width: `${Math.min(100, e.coveredShare * 100)}%` }}
            />
          </span>
        </>
      )}
    </div>
  );
}

function Metas({
  metas,
  carregando,
  aoCriar,
}: {
  metas: Meta[];
  carregando: boolean;
  aoCriar: () => void;
}) {
  const apagar = useApagarMeta();
  const mostra = (meta: Meta, valor: number) =>
    meta.metric === 'MRR' ? reais(valor) : numero(valor);

  return (
    <Stack gap={3}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Text papel="titulo" as="h2">
          Metas
        </Text>
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiPlus}
          onClick={aoCriar}
        >
          Nova meta
        </Button>
      </div>
      {carregando ? (
        <Skeleton className="h-20 w-full" />
      ) : metas.length === 0 ? (
        <Text papel="rotulo" as="p">
          Nenhuma meta ainda. Defina uma de receita mensal, de assinantes ou de
          professores, com prazo, e o progresso aparece aqui.
        </Text>
      ) : (
        <ul className="flex flex-col gap-4">
          {metas.map((meta) => (
            <li key={meta.id} className="flex flex-col gap-1.5">
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="t-rotulo flex-1 text-texto">
                  {METRICAS[meta.metric]}
                  {meta.note ? ` · ${meta.note}` : ''}
                </span>
                <span className="t-dado text-sm">
                  {mostra(meta, meta.current)} de {mostra(meta, meta.target)}
                </span>
                <span className="t-legenda">
                  até {dataCurta(meta.deadline)}
                </span>
                {meta.reached && <Badge estado="ok">Atingida</Badge>}
                {meta.overdue && <Badge estado="atencao">Prazo vencido</Badge>}
                <Button
                  tamanho="p"
                  variante="fantasma"
                  onClick={() => void apagar.mutateAsync([meta.id])}
                  disabled={apagar.isPending}
                >
                  Apagar
                </Button>
              </span>
              <span
                role="progressbar"
                aria-valuenow={Math.round(meta.progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="block h-2 overflow-hidden rounded-full bg-[var(--linha)]"
              >
                <span
                  className="block h-full rounded-full bg-ouro"
                  style={{ width: `${meta.progress * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}
    </Stack>
  );
}

function Projecao({
  resumo,
}: {
  resumo: NonNullable<ReturnType<typeof useResumoFinanceiro>['data']>;
}) {
  return (
    <Stack gap={3}>
      <Text papel="titulo" as="h2">
        Próximos 12 meses
      </Text>
      <Text papel="legenda" as="p">
        Os custos recorrentes, as parcelas que faltam, as entradas manuais já
        lançadas e o MRR de hoje, sem crescimento. É o que acontece se nada
        mudar.
      </Text>
      <div className="overflow-x-auto rounded-card border border-linha">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="t-legenda">
            <tr>
              <th className="px-4 py-2 font-medium">Mês</th>
              <th className="px-4 py-2 text-right font-medium">Custos</th>
              <th className="px-4 py-2 text-right font-medium">Entradas</th>
              <th className="px-4 py-2 text-right font-medium">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {resumo.projection.map((p) => (
              <tr key={p.month} className="border-t border-linha">
                <td className="px-4 py-2 capitalize">
                  {MES_CURTO.format(dataDoMes(p.month))}
                </td>
                <td className="t-dado px-4 py-2 text-right">
                  {reais(p.costCents)}
                </td>
                <td className="t-dado px-4 py-2 text-right">
                  {reais(p.manualIncomeCents + p.subscriptionCents)}
                </td>
                <td
                  className={cx(
                    't-dado px-4 py-2 text-right',
                    p.resultCents < 0 && 'text-erro'
                  )}
                >
                  {reais(p.resultCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Stack>
  );
}

const dataDeInput = (iso: string | null | undefined) =>
  iso ? iso.slice(0, 10) : '';

function FormularioDeLancamento({
  direcao,
  lancamento,
  aoSalvar,
  aoPausar,
  aoApagar,
}: {
  direcao: Direcao;
  lancamento: Lancamento | null;
  aoSalvar: () => void;
  aoPausar: (item: Lancamento) => Promise<void>;
  aoApagar: (item: Lancamento) => void;
}) {
  const criar = useCriarLancamento();
  const corrigir = useCorrigirLancamento();
  const categorias =
    direcao === 'COST' ? CATEGORIAS_DE_CUSTO : CATEGORIAS_DE_ENTRADA;

  const [nome, setNome] = useState(lancamento?.name ?? '');
  const [origem, setOrigem] = useState(lancamento?.counterparty ?? '');
  const [categoria, setCategoria] = useState(
    lancamento?.category ?? categorias[0][0]
  );
  const [forma, setForma] = useState<Forma>(lancamento?.kind ?? 'ONCE');
  const [valor, setValor] = useState(
    lancamento
      ? (lancamento.amountCents / 100).toFixed(2).replace('.', ',')
      : ''
  );
  const [moedaEscolhida, setMoeda] = useState<Moeda>(
    lancamento?.currency ?? 'BRL'
  );
  const [cotacao, setCotacao] = useState(
    lancamento && lancamento.currency !== 'BRL' ? String(lancamento.fxRate) : ''
  );
  const [data, setData] = useState(dataDeInput(lancamento?.startDate));
  const [parcelas, setParcelas] = useState(
    String(lancamento?.installments ?? 3)
  );
  const [intervalo, setIntervalo] = useState(
    String(lancamento?.intervalMonths ?? 1)
  );
  const [fim, setFim] = useState(dataDeInput(lancamento?.endDate));
  const [nota, setNota] = useState(lancamento?.note ?? '');
  const [tentou, setTentou] = useState(false);

  const centavos = centavosDe(valor);
  const cotacaoNumero = Number(cotacao.replace(',', '.'));
  const erros = {
    nome: nome.trim().length < 2 ? 'Dê um nome.' : undefined,
    valor: centavos === null ? 'Informe um valor maior que zero.' : undefined,
    data: !data ? 'Informe a data.' : undefined,
    parcelas:
      forma === 'INSTALLMENTS' &&
      !(Number(parcelas) >= 2 && Number(parcelas) <= 120)
        ? 'De 2 a 120 parcelas.'
        : undefined,
    intervalo:
      forma === 'RECURRING' &&
      !(Number(intervalo) >= 1 && Number(intervalo) <= 24)
        ? 'De 1 a 24 meses.'
        : undefined,
    cotacao: cotacao && !(cotacaoNumero > 0) ? 'Cotação inválida.' : undefined,
    fim:
      forma === 'RECURRING' && fim && data && fim < data
        ? 'O fim vem antes do início.'
        : undefined,
  };
  const invalido = Object.values(erros).some(Boolean);
  const ocupado = criar.isPending || corrigir.isPending;

  const salvar = async () => {
    setTentou(true);
    if (invalido || centavos === null) return;
    const corpo = {
      name: nome.trim(),
      counterparty: origem.trim() || undefined,
      category: categoria,
      amountCents: centavos,
      currency: moedaEscolhida,
      fxRate: moedaEscolhida !== 'BRL' && cotacao ? cotacaoNumero : undefined,
      kind: forma,
      startDate: data,
      installments: forma === 'INSTALLMENTS' ? Number(parcelas) : undefined,
      intervalMonths: forma === 'RECURRING' ? Number(intervalo) : undefined,
      endDate: forma === 'RECURRING' && fim ? fim : undefined,
      note: nota.trim() || undefined,
    };
    try {
      if (lancamento) await corrigir.mutateAsync([lancamento.id, corpo]);
      else await criar.mutateAsync([{ direction: direcao, ...corpo }]);
      toast.success(lancamento ? 'Lançamento corrigido.' : 'Lançado.');
      aoSalvar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  const erro = (campo: keyof typeof erros) =>
    tentou ? erros[campo] : undefined;

  return (
    <Stack gap={6}>
      <Field
        label="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        erro={erro('nome')}
        maxLength={120}
      />
      <Field
        label={direcao === 'COST' ? 'Fornecedor' : 'Origem'}
        value={origem}
        onChange={(e) => setOrigem(e.target.value)}
        maxLength={120}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field.Selecao
          label="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {categorias.map(([v, n]) => (
            <option key={v} value={v}>
              {n}
            </option>
          ))}
        </Field.Selecao>
        <Field.Selecao
          label="Forma"
          value={forma}
          onChange={(e) => setForma(e.target.value as Forma)}
        >
          {Object.entries(FORMAS).map(([v, n]) => (
            <option key={v} value={v}>
              {n}
            </option>
          ))}
        </Field.Selecao>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label={
            forma === 'INSTALLMENTS'
              ? 'Valor total'
              : forma === 'RECURRING'
                ? 'Valor de cada cobrança'
                : 'Valor'
          }
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          erro={erro('valor')}
          ajuda="Em reais, ou na moeda escolhida ao lado."
        />
        <Field.Selecao
          label="Moeda"
          value={moedaEscolhida}
          onChange={(e) => setMoeda(e.target.value as Moeda)}
        >
          <option value="BRL">Real (BRL)</option>
          <option value="USD">Dólar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
        </Field.Selecao>
      </div>
      {moedaEscolhida !== 'BRL' && (
        <Field
          label="Cotação em reais (opcional)"
          inputMode="decimal"
          value={cotacao}
          onChange={(e) => setCotacao(e.target.value)}
          erro={erro('cotacao')}
          ajuda="Vazio: usamos a PTAX do Banco Central no dia. Informe para acertar pela fatura do cartão. Fica guardada no lançamento."
        />
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label={
            forma === 'INSTALLMENTS'
              ? 'Primeira parcela'
              : forma === 'RECURRING'
                ? 'Primeira cobrança'
                : 'Data'
          }
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          erro={erro('data')}
        />
        {forma === 'INSTALLMENTS' && (
          <Field
            label="Parcelas"
            inputMode="numeric"
            value={parcelas}
            onChange={(e) => setParcelas(e.target.value)}
            erro={erro('parcelas')}
          />
        )}
        {forma === 'RECURRING' && (
          <Field
            label="Cobra a cada (meses)"
            inputMode="numeric"
            value={intervalo}
            onChange={(e) => setIntervalo(e.target.value)}
            erro={erro('intervalo')}
            ajuda="1 é mensal; 12, anual."
          />
        )}
      </div>
      {forma === 'RECURRING' && (
        <Field
          label="Última cobrança (opcional)"
          type="date"
          value={fim}
          onChange={(e) => setFim(e.target.value)}
          erro={erro('fim')}
          ajuda="Vazio: segue até você pausar."
        />
      )}
      <Field.Area
        label="Observação"
        rows={2}
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        maxLength={500}
      />

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--linha)] pt-5">
        <Button
          variante="primario"
          carregando={ocupado}
          onClick={() => void salvar()}
        >
          {lancamento ? 'Salvar a correção' : 'Lançar'}
        </Button>
        {lancamento?.kind === 'RECURRING' && (
          <Button
            variante="fantasma"
            disabled={ocupado}
            onClick={() => void aoPausar(lancamento)}
          >
            {lancamento.pausedAt ? 'Retomar' : 'Pausar'}
          </Button>
        )}
        {lancamento && (
          <Button
            variante="fantasma"
            className="sm:ml-auto"
            disabled={ocupado}
            onClick={() => aoApagar(lancamento)}
          >
            Apagar
          </Button>
        )}
      </div>
    </Stack>
  );
}

function FormularioDeMeta({ aoSalvar }: { aoSalvar: () => void }) {
  const criar = useCriarMeta();
  const [metrica, setMetrica] = useState<MetricaDeMeta>('MRR');
  const [alvo, setAlvo] = useState('');
  const [prazo, setPrazo] = useState('');
  const [nota, setNota] = useState('');
  const [tentou, setTentou] = useState(false);

  const alvoNumero = useMemo(() => {
    if (metrica === 'MRR') return centavosDe(alvo);
    const n = Number(alvo);
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [alvo, metrica]);

  const salvar = async () => {
    setTentou(true);
    if (alvoNumero === null || !prazo) return;
    try {
      await criar.mutateAsync([
        {
          metric: metrica,
          target: alvoNumero,
          deadline: prazo,
          note: nota.trim() || undefined,
        },
      ]);
      toast.success('Meta criada.');
      aoSalvar();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível criar a meta.'
      );
    }
  };

  return (
    <Stack gap={6}>
      <Field.Selecao
        label="O que medir"
        value={metrica}
        onChange={(e) => setMetrica(e.target.value as MetricaDeMeta)}
      >
        {Object.entries(METRICAS).map(([v, n]) => (
          <option key={v} value={v}>
            {n}
          </option>
        ))}
      </Field.Selecao>
      <Field
        label={metrica === 'MRR' ? 'Meta (R$ por mês)' : 'Meta (quantidade)'}
        inputMode={metrica === 'MRR' ? 'decimal' : 'numeric'}
        value={alvo}
        onChange={(e) => setAlvo(e.target.value)}
        erro={
          tentou && alvoNumero === null
            ? 'Informe um valor maior que zero.'
            : undefined
        }
      />
      <Field
        label="Até quando"
        type="date"
        value={prazo}
        onChange={(e) => setPrazo(e.target.value)}
        erro={tentou && !prazo ? 'Informe o prazo.' : undefined}
      />
      <Field
        label="Nota (opcional)"
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        maxLength={300}
      />
      <div className="border-t border-[var(--linha)] pt-5">
        <Button
          variante="primario"
          carregando={criar.isPending}
          onClick={() => void salvar()}
        >
          Criar a meta
        </Button>
      </div>
    </Stack>
  );
}
