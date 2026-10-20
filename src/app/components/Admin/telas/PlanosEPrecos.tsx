'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiCheck,
  PiClockCounterClockwise,
  PiPencilSimple,
  PiWarning,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import {
  PLANOS,
  dataHora,
  moeda,
  numero,
} from '@/app/components/Admin/painel/formatos';
import {
  adminKeys,
  useAdminMutation,
  useAdminQuery,
} from '@/app/hooks/admin/query';
import { apiFetch } from '@/app/libs/api/client';
import {
  enviarPrecoAoStripe,
  getPrecosNoStripe,
  listPlanPricingRequest,
  seedDefaultPlanPrices,
  setPlanPricingRequest,
  trazerPrecoDoStripe,
  type PrecoNoStripe,
} from '@/app/requests/admin/billing';

/**
 * Planos e preços: a tabela que a página de planos mostra.
 *
 * **Preço não é sobrescrito**: cada mudança cria uma versão nova e aposenta
 * a anterior (a API guarda o histórico do que foi cobrado). O mensal é
 * digitado; o anual sai dele e do desconto — a prévia mostra o valor antes de
 * salvar. Só há mensal e anual: trimestral e semestral saíram em 01/10, porque
 * o Stripe nunca os vendeu.
 *
 * **Painel e Stripe andam juntos, nos dois sentidos.** Salvar um preço cria
 * o Price novo no Stripe, faz dele o padrão do produto e arquiva o anterior
 * (quem já assina continua no preço antigo); se o Stripe recusar, nada é
 * salvo. Preço trocado no painel do Stripe volta sozinho pelo webhook e vira
 * uma versão nova aqui. Cada plano mostra se o que está escrito é o que é
 * cobrado e, quando não é, deixa escolher qual lado vale: "Enviar ao Stripe"
 * ou "Trazer do Stripe".
 */

interface Preco {
  id: string;
  planType: string;
  monthlyPrice: number;
  yearlyPrice: number | null;
  yearlyDiscount: number;
  trialDays: number;
  description: string | null;
  displayOrder: number;
  createdAt: string;
  origin?: 'painel' | 'stripe' | null;
}

interface Edicao {
  planType: string;
  monthlyPrice: string;
  yearlyDiscount: string;
  trialDays: string;
  description: string;
}

const periodo = (mensal: number, meses: number, desconto: number) =>
  Math.round(mensal * meses * (1 - desconto / 100) * 100) / 100;

export default function PlanosEPrecos() {
  const precos = useAdminQuery(
    adminKeys.list('receita', 'precos'),
    async () => (await listPlanPricingRequest()) as Preco[]
  );
  const salvar = useAdminMutation(
    (dados: Record<string, unknown>) => setPlanPricingRequest(dados),
    ['receita', 'assinaturas', 'auditoria']
  );
  const semear = useAdminMutation(
    () => seedDefaultPlanPrices(),
    ['receita', 'auditoria']
  );
  const [editando, setEditando] = useState<Edicao | null>(null);
  const [historico, setHistorico] = useState<string | null>(null);
  const [confirmarPadrao, setConfirmarPadrao] = useState(false);
  const noStripe = useAdminQuery(
    adminKeys.list('receita', 'precos-stripe'),
    getPrecosNoStripe
  );
  const enviar = useAdminMutation(
    (plano: string) => enviarPrecoAoStripe(plano),
    ['receita', 'auditoria']
  );
  const trazer = useAdminMutation(
    (plano: string) => trazerPrecoDoStripe(plano),
    ['receita', 'assinaturas', 'auditoria']
  );
  // Qual lado vale é decisão com efeito na cobrança: confirma antes.
  const [acertando, setAcertando] = useState<{
    plano: string;
    sentido: 'enviar' | 'trazer';
  } | null>(null);
  const stripeDo = (plano: string) =>
    noStripe.data?.planos.find((x) => x.planType === plano);
  const desvio = acertando ? stripeDo(acertando.plano) : undefined;

  const lista = (precos.data ?? []).sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Planos e preços"
        descricao="A tabela que a página de planos mostra"
      />

      {noStripe.data && !noStripe.data.configurado && (
        <div role="note" className="flex gap-3 rounded-card bg-sup-2 px-5 py-4">
          <Icon
            de={PiWarning}
            tamanho="m"
            className="mt-0.5 shrink-0 text-atencao"
          />
          <Text papel="rotulo" as="p" className="medida-texto">
            Este ambiente não tem chave do Stripe: o preço salvo aqui fica só no
            painel e não muda cobrança nenhuma.
          </Text>
        </div>
      )}

      {precos.loading ? (
        <Row.Lista>
          <Row.Skeleton repetir={3} />
        </Row.Lista>
      ) : precos.error ? (
        <Text papel="rotulo" tom="erro" as="p">
          {precos.error}
        </Text>
      ) : lista.length === 0 ? (
        <Vazio
          titulo="Nenhum preço cadastrado"
          descricao="Sem preço, a página de planos cai nos valores fixos do site e o checkout recusa. Grave os preços padrão (Plus 19,90, Mentor 39,90, Maestro 79,90) e ajuste depois."
          acao={
            <Button
              tamanho="p"
              variante="primario"
              onClick={() => setConfirmarPadrao(true)}
            >
              Gravar os preços padrão
            </Button>
          }
        />
      ) : (
        <div className="sup-1 overflow-hidden !p-0">
          <table className="w-full text-left max-md:block">
            <thead className="max-md:hidden">
              <tr className="t-legenda">
                <th className="px-5 py-3 font-normal">Plano</th>
                <th className="px-4 py-3 text-right font-normal">Mensal</th>
                <th className="px-4 py-3 text-right font-normal">Anual</th>
                <th className="px-4 py-3 text-right font-normal">Teste</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="max-md:block">
              {lista.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-linha max-md:flex max-md:flex-wrap max-md:gap-x-4 max-md:gap-y-1 max-md:px-5 max-md:py-3"
                >
                  <td className="px-5 py-4 max-md:w-full max-md:p-0">
                    <span className="flex flex-col">
                      <span className="font-display text-[1.125rem] text-texto">
                        {PLANOS[p.planType] ?? p.planType}
                      </span>
                      {p.description && (
                        <span className="t-legenda">{p.description}</span>
                      )}
                      <EstadoNoStripe
                        estado={stripeDo(p.planType)}
                        carregando={noStripe.loading}
                        aoEnviar={() =>
                          setAcertando({ plano: p.planType, sentido: 'enviar' })
                        }
                        aoTrazer={() =>
                          setAcertando({ plano: p.planType, sentido: 'trazer' })
                        }
                      />
                    </span>
                  </td>
                  <td className="t-dado px-4 py-4 text-right text-texto max-md:p-0">
                    <span className="t-legenda md:hidden">Mensal </span>
                    {moeda(p.monthlyPrice)}
                  </td>
                  <td className="t-dado px-4 py-4 text-right text-sm text-texto max-md:p-0">
                    <span className="t-legenda md:hidden">Anual </span>
                    {moeda(p.yearlyPrice)}{' '}
                    <span className="t-legenda">
                      −{p.yearlyDiscount.toLocaleString('pt-BR')}%
                    </span>
                  </td>
                  <td className="t-dado whitespace-nowrap px-4 py-4 text-right text-sm max-md:p-0">
                    <span className="t-legenda md:hidden">Teste </span>
                    {p.trialDays ? `${p.trialDays} dias` : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right max-md:w-full max-md:p-0 max-md:pt-2">
                    <span className="inline-flex gap-1">
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiClockCounterClockwise}
                        rotulo={`Histórico de preços do ${PLANOS[p.planType]}`}
                        onClick={() => setHistorico(p.planType)}
                      />
                      <Button
                        tamanho="p"
                        icone={PiPencilSimple}
                        onClick={() =>
                          setEditando({
                            planType: p.planType,
                            monthlyPrice: String(p.monthlyPrice),
                            yearlyDiscount: String(p.yearlyDiscount),
                            trialDays: String(p.trialDays),
                            description: p.description ?? '',
                          })
                        }
                      >
                        Mudar preço
                      </Button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditorDePreco
        edicao={editando}
        aoFechar={() => setEditando(null)}
        aoSalvar={async (dados) => {
          try {
            await salvar.mutateAsync([dados]);
            toast.success(
              noStripe.data?.configurado
                ? 'Preço salvo aqui e no Stripe. A versão anterior fica no histórico.'
                : 'Preço salvo. A versão anterior fica no histórico.'
            );
            setEditando(null);
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : 'Não foi possível salvar.'
            );
          }
        }}
        salvando={salvar.isPending}
      />

      <Historico plano={historico} aoFechar={() => setHistorico(null)} />

      <ConfirmModal
        isOpen={!!acertando}
        onClose={() => setAcertando(null)}
        onConfirm={async () => {
          if (!acertando) return;
          try {
            if (acertando.sentido === 'enviar') {
              await enviar.mutateAsync([acertando.plano]);
              toast.success('O Stripe passou a cobrar o preço do painel.');
            } else {
              const r = await trazer.mutateAsync([acertando.plano]);
              if (r.adotado) toast.success('O painel ficou igual ao Stripe.');
              else toast(r.motivo);
            }
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : 'Não foi possível acertar.'
            );
          }
          setAcertando(null);
        }}
        type="question"
        title={
          acertando?.sentido === 'enviar'
            ? `Enviar o preço do ${PLANOS[acertando.plano] ?? ''} ao Stripe?`
            : `Trazer do Stripe o preço do ${PLANOS[acertando?.plano ?? ''] ?? ''}?`
        }
        message={
          acertando?.sentido === 'enviar'
            ? `O Stripe passa a cobrar ${moeda(desvio?.painel?.monthly)} por mês e ${moeda(desvio?.painel?.yearly)} por ano de quem assinar daqui em diante. O preço antigo é arquivado; quem já assina continua nele.`
            : `O painel passa a mostrar ${moeda(desvio?.stripe.monthly?.valor)} por mês e ${moeda(desvio?.stripe.yearly?.valor)} por ano, que é o que o Stripe cobra hoje. A versão atual vai para o histórico.`
        }
        confirmText={acertando?.sentido === 'enviar' ? 'Enviar' : 'Trazer'}
        cancelText="Voltar"
        isLoading={enviar.isPending || trazer.isPending}
      />

      <ConfirmModal
        isOpen={confirmarPadrao}
        onClose={() => setConfirmarPadrao(false)}
        onConfirm={async () => {
          try {
            await semear.mutateAsync([]);
            toast.success('Preços padrão gravados.');
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : 'Não foi possível gravar.'
            );
          }
          setConfirmarPadrao(false);
        }}
        type="question"
        title="Gravar os preços padrão?"
        message="Plus 19,90, Mentor 39,90 e Maestro 79,90 por mês, anual com cerca de 16% de desconto. Os valores derivados podem sair alguns centavos diferentes do Stripe."
        confirmText="Gravar"
        cancelText="Voltar"
        isLoading={semear.isPending}
      />
    </Stack>
  );
}

/** Se o que está escrito é o que o Stripe cobra; quando não é, os dois acertos. */
function EstadoNoStripe({
  estado,
  carregando,
  aoEnviar,
  aoTrazer,
}: {
  estado: PrecoNoStripe | undefined;
  carregando: boolean;
  aoEnviar: () => void;
  aoTrazer: () => void;
}) {
  if (carregando)
    return <span className="t-legenda">Conferindo o Stripe…</span>;
  // Plano gratuito, ou ambiente sem Stripe: não há o que conferir.
  if (!estado) return null;

  if (estado.emDia) {
    return (
      <span className="t-legenda inline-flex items-center gap-1.5">
        <Icon de={PiCheck} tamanho="pp" /> Igual ao Stripe
      </span>
    );
  }

  const temNoStripe = !!estado.stripe.monthly && !!estado.stripe.yearly;

  return (
    <span className="mt-1 flex flex-col gap-1.5">
      <span className="t-legenda inline-flex items-start gap-1.5 text-atencao">
        <Icon de={PiWarning} tamanho="pp" className="mt-0.5 shrink-0" />
        <span>
          {estado.problema}
          {temNoStripe &&
            ` Lá: ${moeda(estado.stripe.monthly!.valor)}/mês, ${moeda(estado.stripe.yearly!.valor)}/ano.`}
        </span>
      </span>
      <span className="flex flex-wrap gap-1">
        <Button tamanho="p" variante="texto" onClick={aoEnviar}>
          Enviar ao Stripe
        </Button>
        {temNoStripe && (
          <Button tamanho="p" variante="texto" onClick={aoTrazer}>
            Trazer do Stripe
          </Button>
        )}
      </span>
    </span>
  );
}

function EditorDePreco({
  edicao,
  aoFechar,
  aoSalvar,
  salvando,
}: {
  edicao: Edicao | null;
  aoFechar: () => void;
  aoSalvar: (dados: Record<string, unknown>) => void;
  salvando: boolean;
}) {
  const [f, setF] = useState<Edicao | null>(edicao);
  useEffect(() => setF(edicao), [edicao]);

  if (!f)
    return (
      <Sheet aberto={false} aoFechar={aoFechar} titulo="">
        {null}
      </Sheet>
    );

  const n = (v: string) => Number(v.replace(',', '.'));
  const mensal = n(f.monthlyPrice);
  const valido =
    mensal > 0 && n(f.yearlyDiscount) >= 0 && n(f.yearlyDiscount) < 100;
  const campo = (k: keyof Edicao) => ({
    value: f[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF({ ...f, [k]: e.target.value }),
  });

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo={`Preço do ${PLANOS[f.planType] ?? f.planType}`}
      descricao="Salvar cria uma versão nova e leva o preço ao Stripe. Quem já assina continua no preço antigo."
      largura="m"
      rodape={
        <>
          <Button tamanho="p" variante="fantasma" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            tamanho="p"
            variante="primario"
            disabled={!valido}
            carregando={salvando}
            onClick={() =>
              aoSalvar({
                planType: f.planType,
                monthlyPrice: mensal,
                yearlyDiscount: n(f.yearlyDiscount),
                trialDays: Math.max(0, Math.round(n(f.trialDays) || 0)),
                description: f.description.trim() || undefined,
              })
            }
          >
            Salvar
          </Button>
        </>
      }
    >
      <Stack gap={4}>
        <Field
          label="Mensal (R$)"
          inputMode="decimal"
          {...campo('monthlyPrice')}
        />
        <Field
          label="Desconto do anual (%)"
          ajuda="Sobre doze mensais. 16,7% equivale a pagar dez meses."
          inputMode="decimal"
          {...campo('yearlyDiscount')}
        />
        <Field
          label="Dias de teste grátis"
          inputMode="numeric"
          {...campo('trialDays')}
        />
        <Field.Area
          label="Descrição na página de planos"
          rows={2}
          {...campo('description')}
        />
        {valido && (
          <dl className="grid grid-cols-2 gap-3 rounded-controle bg-sup-2 p-4">
            <div>
              <dt className="t-legenda">Anual</dt>
              <dd className="t-dado text-texto">
                {moeda(periodo(mensal, 12, n(f.yearlyDiscount)))}
              </dd>
            </div>
            <div>
              <dt className="t-legenda">Equivale por mês</dt>
              <dd className="t-dado text-texto">
                {moeda(periodo(mensal, 12, n(f.yearlyDiscount)) / 12)}
              </dd>
            </div>
          </dl>
        )}
      </Stack>
    </Sheet>
  );
}

function Historico({
  plano,
  aoFechar,
}: {
  plano: string | null;
  aoFechar: () => void;
}) {
  const h = useAdminQuery(
    adminKeys.list('receita', { historico: plano }),
    () =>
      apiFetch<Preco[]>(`/admin/plan-pricing/${plano}/history`, {
        cache: 'no-store',
      }),
    { enabled: !!plano }
  );

  return (
    <Sheet
      aberto={!!plano}
      aoFechar={aoFechar}
      titulo={plano ? `Histórico do ${PLANOS[plano] ?? plano}` : ''}
      largura="m"
    >
      {h.loading ? (
        <Row.Skeleton repetir={3} />
      ) : (
        <ol className="flex flex-col">
          {(h.data ?? []).map((v, i) => (
            <li
              key={v.id}
              className="flex items-baseline gap-3 border-b border-linha py-2.5 last:border-0"
            >
              <span className="t-dado flex-1 text-texto">
                {moeda(v.monthlyPrice)}/mês · {moeda(v.yearlyPrice)}/ano
              </span>
              <span className="t-legenda">
                {v.origin === 'stripe' ? 'veio do Stripe · ' : ''}
                {i === 0 ? 'em vigor desde ' : ''}
                {dataHora(v.createdAt)}
              </span>
            </li>
          ))}
          {h.data?.length === 0 && (
            <Text papel="rotulo" tom="suave" as="p">
              Sem versões anteriores.
            </Text>
          )}
          {h.data && h.data.length > 0 && (
            <Text papel="legenda" as="p" className="pt-3">
              {numero(h.data.length)} versões
            </Text>
          )}
        </ol>
      )}
    </Sheet>
  );
}
