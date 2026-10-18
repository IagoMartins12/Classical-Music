'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PiArrowDown, PiArrowUp, PiCreditCard } from 'react-icons/pi';
import { Confirmar } from '@/app/[lang]/(main)/pricing/ConfirmarAssinatura';
import { buscarPrecos } from '@/app/[lang]/(main)/pricing/buscarPrecos';
import {
  formatarPreco,
  type PlanoPago,
  type Precos,
} from '@/app/[lang]/(main)/pricing/precos';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { Icon } from '@/app/components/ui/Icon';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { cx } from '@/app/components/ui/cx';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { PLANOS } from '@/app/conteudo/planos';
import { BillingPeriod, PlanType } from '@/app/libs/subscriptionConstants';
import {
  cancelSubscriptionRequest,
  createSubscriptionRequest,
  getCurrentSubscription,
  openBillingPortalRequest,
  reactivateSubscriptionRequest,
  upgradeSubscriptionRequest,
} from '@/app/requests/billing';

type Plano = 'FREE' | PlanoPago;
const ORDEM: Plano[] = ['FREE', 'PLUS', 'MENTOR', 'MAESTRO'];

type Registro = {
  status?: string;
  billingPeriod?: 'MONTHLY' | 'YEARLY';
  endDate?: string | null;
  metadata?: { pendingDowngrade?: Plano } | null;
};

const T = {
  pt: {
    titulo: 'Sua assinatura',
    atual: 'Plano atual',
    teste: (d: number) =>
      `Período de teste: ${d} ${d === 1 ? 'dia restante' : 'dias restantes'}.`,
    renova: (d: string) => `Renova em ${d}.`,
    cancelada: (d: string) =>
      `Cancelada. O acesso continua até ${d}; depois, a conta volta ao Free, com o seu histórico.`,
    atrasada: (d: string) =>
      `Pagamento recusado. Atualize o cartão em “Pagamento e faturas” até ${d}; sem pagamento, a assinatura é encerrada e a conta volta ao Free.`,
    agendado: (p: string, d: string) => `Muda para o ${p} em ${d}.`,
    gratis: 'O plano gratuito: ler, ouvir e organizar o estudo.',
    seu: 'Seu plano',
    agendadoRotulo: 'Agendado',
    subir: (p: string) => `Mudar para o ${p}`,
    descer: (p: string) => `Mudar para o ${p}`,
    porMes: '/mês',
    porAno: '/ano',
    semPreco: 'Preço indisponível',
    upgradeTitulo: (p: string) => `Ir para o ${p}?`,
    upgradeTexto:
      'Você vai para o pagamento seguro da Stripe. O plano novo começa assim que o pagamento for confirmado.',
    upgradeOk: 'Ir para o pagamento',
    downgradeTitulo: (p: string) => `Mudar para o ${p}?`,
    downgradeTexto: (atual: string, d: string) =>
      `Nada muda até ${d || 'o fim do ciclo atual'}: você continua no ${atual} até lá. Depois, a conta passa para o plano escolhido.`,
    downgradeOk: 'Agendar a mudança',
    gerenciar: 'Pagamento e faturas',
    gerenciarAjuda:
      'Cartão, faturas e dados de cobrança ficam no portal seguro da Stripe.',
    cancelar: 'Cancelar assinatura',
    reativar: 'Reativar assinatura',
    cancelarTitulo: 'Cancelar a assinatura?',
    cancelarTexto:
      'O acesso aos recursos do plano continua até o fim do período já pago. Depois, a conta volta ao Free, mantendo o seu histórico e o seu progresso.',
    manter: 'Manter',
    voltar: 'Voltar',
    canceladaOk: 'Assinatura cancelada.',
    reativadaOk: 'Assinatura reativada.',
    erro: 'Não foi possível concluir. Tente de novo em instantes.',
  },
  en: {
    titulo: 'Your subscription',
    atual: 'Current plan',
    teste: (d: number) =>
      `Free trial: ${d} ${d === 1 ? 'day left' : 'days left'}.`,
    renova: (d: string) => `Renews on ${d}.`,
    cancelada: (d: string) =>
      `Cancelled. Access continues until ${d}; then the account returns to Free, keeping your history.`,
    atrasada: (d: string) =>
      `Payment declined. Update your card in “Payment and invoices” by ${d}; without payment, the subscription ends and the account returns to Free.`,
    agendado: (p: string, d: string) => `Moves to ${p} on ${d}.`,
    gratis: 'The free plan: read, listen and organize your practice.',
    seu: 'Your plan',
    agendadoRotulo: 'Scheduled',
    subir: (p: string) => `Switch to ${p}`,
    descer: (p: string) => `Switch to ${p}`,
    porMes: '/mo',
    porAno: '/yr',
    semPreco: 'Price unavailable',
    upgradeTitulo: (p: string) => `Move to ${p}?`,
    upgradeTexto:
      'You will go to Stripe’s secure checkout. The new plan starts as soon as the payment is confirmed.',
    upgradeOk: 'Go to payment',
    downgradeTitulo: (p: string) => `Switch to ${p}?`,
    downgradeTexto: (atual: string, d: string) =>
      `Nothing changes until ${d || 'the end of the current cycle'}: you keep ${atual} until then. After that, the account moves to the plan you chose.`,
    downgradeOk: 'Schedule the change',
    gerenciar: 'Payment and invoices',
    gerenciarAjuda:
      'Card, invoices and billing details live on Stripe’s secure portal.',
    cancelar: 'Cancel subscription',
    reativar: 'Reactivate subscription',
    cancelarTitulo: 'Cancel the subscription?',
    cancelarTexto:
      'You keep the plan’s features until the end of the period already paid. Then the account returns to Free, keeping your history and progress.',
    manter: 'Keep',
    voltar: 'Back',
    canceladaOk: 'Subscription cancelled.',
    reativadaOk: 'Subscription reactivated.',
    erro: 'Could not complete. Please try again shortly.',
  },
};

type Pedido =
  | { tipo: 'confirmar'; plano: PlanoPago }
  | { tipo: 'subir'; plano: PlanoPago }
  | { tipo: 'descer'; plano: PlanoPago }
  | { tipo: 'cancelar' };

/**
 * Manage the subscription from the profile: the current plan and its state,
 * monthly or yearly, and every plan with the right move — a higher one goes
 * to Stripe's checkout (the plan starts when the payment confirms), a lower
 * one is scheduled for the end of the cycle, Free is cancelling. Payment
 * details stay in Stripe's portal.
 */
export function GerenciarAssinatura({ idioma }: { idioma: Idioma }) {
  const t = T[idioma];
  const c = PLANOS[idioma];
  const [atual, setAtual] = useState<Awaited<
    ReturnType<typeof getCurrentSubscription>
  > | null>(null);
  const [precos, setPrecos] = useState<Precos | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [anual, setAnual] = useState(false);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const carregar = useCallback(
    () =>
      Promise.all([
        getCurrentSubscription().catch(() => null),
        buscarPrecos().catch(() => null),
      ]).then(([a, p]) => {
        setAtual(a);
        setPrecos(p);
        const registro = a?.subscription as Registro | null | undefined;
        if (registro?.billingPeriod === 'YEARLY') setAnual(true);
        setCarregando(false);
      }),
    []
  );

  useEffect(() => {
    void carregar();
    // Back from Stripe (checkout or portal) the browser may restore this
    // page from its cache as it was — busy. Start fresh instead.
    const aoVoltar = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      setOcupado(null);
      setPedido(null);
      void carregar();
    };
    window.addEventListener('pageshow', aoVoltar);
    return () => window.removeEventListener('pageshow', aoVoltar);
  }, [carregar]);

  const data = (iso?: string | null) =>
    iso
      ? new Intl.DateTimeFormat(idioma === 'pt' ? 'pt-BR' : 'en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(iso))
      : '';

  if (carregando)
    return (
      <Card nivel={2}>
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-4 w-32" />
          <Skeleton forma="bloco" className="h-10 w-48" />
          {ORDEM.map((p) => (
            <Skeleton key={p} forma="bloco" className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );

  const plano = (atual?.plan?.type ?? 'FREE') as Plano;
  const registro = atual?.subscription as Registro | null | undefined;
  const cancelada = registro?.status === 'CANCELLED';
  const atrasada = registro?.status === 'PAST_DUE';
  const agendado = registro?.metadata?.pendingDowngrade;
  const fim = data(atual?.plan?.expiresAt ?? registro?.endDate);
  const nome = (p: Plano) => c.planos[p].nome;
  const periodo = anual ? BillingPeriod.YEARLY : BillingPeriod.MONTHLY;
  const desconto = Math.max(
    0,
    ...(['PLUS', 'MENTOR', 'MAESTRO'] as PlanoPago[]).map(
      (p) => precos?.[p]?.anual?.pct ?? 0
    )
  );

  const situacao = cancelada
    ? t.cancelada(fim)
    : atrasada
      ? t.atrasada(fim)
      : agendado
        ? t.agendado(nome(agendado), fim)
        : atual?.plan?.isTrialActive
          ? t.teste(atual.plan.trialDaysRemaining)
          : plano !== 'FREE' && fim
            ? t.renova(fim)
            : t.gratis;

  const preco = (p: PlanoPago) => {
    const d = precos?.[p];
    if (!d) return t.semPreco;
    if (anual && d.anual)
      return `${formatarPreco(d.anual.total, idioma)}${t.porAno}`;
    return `${formatarPreco(d.mensal, idioma)}${t.porMes}`;
  };

  async function irParaPagamento(url?: string) {
    if (url) window.location.href = url;
    else {
      setOcupado(null);
      toast.error(t.erro);
    }
  }

  // Free → paid: the same confirmation (with coupon) as the plans page.
  async function assinar(p: PlanType, per: BillingPeriod, cupom?: string) {
    const r = await createSubscriptionRequest(p, per, cupom);
    await irParaPagamento(r.payment?.checkoutUrl);
  }

  async function confirmarPedido() {
    if (!pedido) return;
    setOcupado(pedido.tipo);
    try {
      if (pedido.tipo === 'subir') {
        const r = await upgradeSubscriptionRequest(
          pedido.plano as PlanType,
          periodo
        );
        await irParaPagamento(r.payment?.checkoutUrl);
        return;
      }
      if (pedido.tipo === 'descer') {
        const r = await upgradeSubscriptionRequest(
          pedido.plano as PlanType,
          periodo
        );
        toast.success(r.message);
      } else if (pedido.tipo === 'cancelar') {
        await cancelSubscriptionRequest();
        toast.success(t.canceladaOk);
      }
      setPedido(null);
      await carregar();
    } catch (e) {
      toast.error((e as Error).message || t.erro);
    } finally {
      setOcupado((o) => (o === 'subir' ? o : null));
    }
  }

  async function reativar() {
    setOcupado('reativar');
    try {
      await reactivateSubscriptionRequest();
      toast.success(t.reativadaOk);
      await carregar();
    } catch {
      toast.error(t.erro);
    } finally {
      setOcupado(null);
    }
  }

  async function abrirPortal() {
    setOcupado('portal');
    try {
      const { url } = await openBillingPortalRequest();
      window.location.href = url;
    } catch {
      toast.error(t.erro);
      setOcupado(null);
    }
  }

  const acao = (p: Plano) => {
    if (p === plano)
      return (
        <span className="inline-flex min-h-9 items-center rounded-lg tint-ouro px-3 text-sm font-medium text-ouro-na-tinta">
          {t.seu}
        </span>
      );
    if (p === agendado)
      return (
        <span className="t-rotulo text-texto-suave">{t.agendadoRotulo}</span>
      );
    const acima = ORDEM.indexOf(p) > ORDEM.indexOf(plano);
    if (p === 'FREE') {
      if (cancelada) return null;
      return (
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiArrowDown}
          onClick={() => setPedido({ tipo: 'cancelar' })}
          disabled={ocupado !== null}
        >
          {t.descer(nome(p))}
        </Button>
      );
    }
    if (!precos?.[p]) return null;
    return (
      <Button
        tamanho="p"
        variante={acima ? 'secundario' : 'fantasma'}
        icone={acima ? PiArrowUp : PiArrowDown}
        onClick={() =>
          setPedido(
            plano === 'FREE'
              ? { tipo: 'confirmar', plano: p }
              : { tipo: acima ? 'subir' : 'descer', plano: p }
          )
        }
        disabled={ocupado !== null || cancelada}
      >
        {acima ? t.subir(nome(p)) : t.descer(nome(p))}
      </Button>
    );
  };

  return (
    <>
      <Card nivel={2}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="t-rotulo text-texto-suave">{t.atual}</span>
              <span className="font-display text-[2rem] leading-none text-texto">
                {nome(plano)}
              </span>
              <span className="t-rotulo mt-1 text-texto-suave">{situacao}</span>
            </div>
            <Abas rotulo={c.periodo.rotulo}>
              <Aba ativa={!anual} onClick={() => setAnual(false)}>
                {c.periodo.mensal}
              </Aba>
              <Aba ativa={anual} onClick={() => setAnual(true)}>
                {c.periodo.anual}
                {desconto > 0 && (
                  <span className="ml-1.5 text-ouro-texto">
                    · {c.periodo.ate(desconto)}
                  </span>
                )}
              </Aba>
            </Abas>
          </div>

          <ul className="flex flex-col divide-y divide-[var(--linha)]">
            {ORDEM.map((p) => (
              <li
                key={p}
                className={cx(
                  'flex flex-wrap items-center gap-x-6 gap-y-3 py-4',
                  p === plano && 'relative'
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-baseline gap-3">
                    <span className="font-display text-[1.375rem] leading-tight text-texto">
                      {nome(p)}
                    </span>
                    {p !== 'FREE' && (
                      <span className="t-dado text-[0.875rem] text-texto-suave">
                        {preco(p)}
                      </span>
                    )}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {c.planos[p].paraQuem}
                  </span>
                </div>
                {acao(p)}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t border-[var(--linha)] pt-5 sm:flex-row sm:flex-wrap sm:items-center">
            {plano !== 'FREE' && (
              <Button
                icone={PiCreditCard}
                onClick={() => void abrirPortal()}
                carregando={ocupado === 'portal'}
                disabled={ocupado !== null}
              >
                {t.gerenciar}
              </Button>
            )}
            {plano !== 'FREE' &&
              (cancelada ? (
                <Button
                  variante="primario"
                  onClick={() => void reativar()}
                  carregando={ocupado === 'reativar'}
                  disabled={ocupado !== null}
                >
                  {t.reativar}
                </Button>
              ) : (
                <Button
                  variante="fantasma"
                  onClick={() => setPedido({ tipo: 'cancelar' })}
                  disabled={ocupado !== null}
                >
                  {t.cancelar}
                </Button>
              ))}
            <p className="t-legenda flex items-center gap-1.5 sm:ml-auto">
              <Icon de={PiCreditCard} tamanho="pp" />
              {t.gerenciarAjuda}
            </p>
          </div>
        </div>
      </Card>

      {pedido?.tipo === 'confirmar' && precos && (
        <Confirmar
          idioma={idioma}
          plano={pedido.plano}
          anual={anual}
          precos={precos}
          pagarNoStripe={assinar}
          aoFechar={() => setPedido(null)}
        />
      )}

      <ConfirmModal
        isOpen={pedido?.tipo === 'subir' || pedido?.tipo === 'descer'}
        onClose={() => setPedido(null)}
        onConfirm={() => void confirmarPedido()}
        type={pedido?.tipo === 'subir' ? 'info' : 'warning'}
        title={
          pedido?.tipo === 'subir'
            ? t.upgradeTitulo(nome(pedido.plano))
            : pedido?.tipo === 'descer'
              ? t.downgradeTitulo(nome(pedido.plano))
              : ''
        }
        message={
          pedido?.tipo === 'subir'
            ? t.upgradeTexto
            : t.downgradeTexto(nome(plano), fim)
        }
        confirmText={pedido?.tipo === 'subir' ? t.upgradeOk : t.downgradeOk}
        cancelText={t.voltar}
        isLoading={ocupado === 'subir' || ocupado === 'descer'}
      />

      <ConfirmModal
        isOpen={pedido?.tipo === 'cancelar'}
        onClose={() => setPedido(null)}
        onConfirm={() => void confirmarPedido()}
        type="warning"
        title={t.cancelarTitulo}
        message={t.cancelarTexto}
        confirmText={t.cancelar}
        cancelText={t.manter}
        isLoading={ocupado === 'cancelar'}
      />
    </>
  );
}
