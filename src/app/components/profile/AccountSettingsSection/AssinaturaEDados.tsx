'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PiCreditCard, PiDownloadSimple } from 'react-icons/pi';
import { useTranslation } from '@/app/context/TranslationContext';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Skeleton } from '@/app/components/ui/Skeleton';
import ConfirmModal from '@/app/components/ConfirmModal';
import LocalizedLink from '@/app/components/LocalizedLink';
import { profileApi } from '@/app/libs/api/profile';
import {
  cancelSubscriptionRequest,
  getCurrentSubscription,
  openBillingPortalRequest,
  reactivateSubscriptionRequest,
} from '@/app/requests/billing';

/**
 * Assinatura e dados pessoais, nas Configurações da Conta.
 *
 * Os dois existiam na API e não tinham tela: não havia onde cancelar uma
 * assinatura paga nem como exportar os próprios dados — e os Termos e a
 * Política prometem as duas coisas (CDC: cancelar a qualquer momento; LGPD,
 * art. 18: portabilidade).
 */
type Atual = Awaited<ReturnType<typeof getCurrentSubscription>>;

const PLANO: Record<string, string> = {
  FREE: 'Free',
  PLUS: 'Plus',
  MENTOR: 'Mentor',
  MAESTRO: 'Maestro',
};

const R = {
  pt: {
    assinatura: 'Assinatura',
    plano: 'Plano',
    gratuito: 'Você está no plano gratuito.',
    verPlanos: 'Ver planos',
    teste: (d: number) =>
      `Período de teste: ${d} ${d === 1 ? 'dia restante' : 'dias restantes'}.`,
    renova: (d: string) => `Renova em ${d}.`,
    cancelada: (d: string) =>
      `Cancelada. O acesso continua até ${d}; depois, a conta volta ao plano gratuito, com o seu histórico.`,
    gerenciar: 'Gerenciar pagamento',
    gerenciarAjuda:
      'Cartão, faturas e dados de cobrança, no portal seguro da Stripe.',
    cancelar: 'Cancelar assinatura',
    reativar: 'Reativar assinatura',
    confirmarTitulo: 'Cancelar a assinatura?',
    confirmarTexto:
      'O acesso aos recursos do plano continua até o fim do período já pago. Depois, a conta volta ao plano gratuito, mantendo o seu histórico e o seu progresso.',
    confirmarBotao: 'Cancelar assinatura',
    manter: 'Manter',
    canceladaOk: 'Assinatura cancelada.',
    reativadaOk: 'Assinatura reativada.',
    erro: 'Não foi possível concluir. Tente de novo em instantes.',
    dados: 'Seus dados',
    dadosTexto:
      'Baixe num arquivo tudo o que é seu no Opus Atlas: conta, perfil, estudos, anotações, envios e histórico. O arquivo não inclui senha, registros administrativos nem notas privadas de professores.',
    exportar: 'Exportar meus dados',
    exportado: 'Arquivo baixado.',
    limite:
      'Você já exportou 3 vezes na última hora. Tente de novo mais tarde.',
  },
  en: {
    assinatura: 'Subscription',
    plano: 'Plan',
    gratuito: 'You are on the free plan.',
    verPlanos: 'See plans',
    teste: (d: number) =>
      `Free trial: ${d} ${d === 1 ? 'day left' : 'days left'}.`,
    renova: (d: string) => `Renews on ${d}.`,
    cancelada: (d: string) =>
      `Cancelled. Access continues until ${d}; then the account returns to the free plan, keeping your history.`,
    gerenciar: 'Manage payment',
    gerenciarAjuda:
      'Card, invoices and billing details, on Stripe’s secure portal.',
    cancelar: 'Cancel subscription',
    reativar: 'Reactivate subscription',
    confirmarTitulo: 'Cancel the subscription?',
    confirmarTexto:
      'You keep the plan’s features until the end of the period already paid. Then the account returns to the free plan, keeping your history and progress.',
    confirmarBotao: 'Cancel subscription',
    manter: 'Keep',
    canceladaOk: 'Subscription cancelled.',
    reativadaOk: 'Subscription reactivated.',
    erro: 'Could not complete. Please try again shortly.',
    dados: 'Your data',
    dadosTexto:
      'Download a file with everything that is yours on Opus Atlas: account, profile, study, annotations, uploads and history. It does not include your password, administrative logs or teachers’ private notes.',
    exportar: 'Export my data',
    exportado: 'File downloaded.',
    limite:
      'You have already exported 3 times in the last hour. Please try again later.',
  },
};

export function AssinaturaEDados() {
  const { language } = useTranslation({ sections: ['pages/profile'] });
  const idioma = language === 'en' ? 'en' : 'pt';
  const r = R[idioma];
  const [atual, setAtual] = useState<Atual | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState<
    null | 'portal' | 'cancelar' | 'reativar' | 'exportar'
  >(null);
  const [confirmar, setConfirmar] = useState(false);

  const data = (iso?: string | null) =>
    iso
      ? new Intl.DateTimeFormat(idioma === 'pt' ? 'pt-BR' : 'en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(iso))
      : '';

  const carregar = () =>
    getCurrentSubscription()
      .then(setAtual)
      .catch(() => setAtual(null))
      .finally(() => setCarregando(false));

  useEffect(() => {
    carregar();
  }, []);

  const plano = atual?.plan;
  const pago = plano && plano.type !== 'FREE';
  const cancelada =
    (atual?.subscription as { status?: string } | null | undefined)?.status ===
    'CANCELLED';

  async function abrirPortal() {
    setOcupado('portal');
    try {
      const { url } = await openBillingPortalRequest();
      window.location.href = url;
    } catch {
      toast.error(r.erro);
      setOcupado(null);
    }
  }

  async function cancelar() {
    setOcupado('cancelar');
    try {
      await cancelSubscriptionRequest();
      toast.success(r.canceladaOk);
      setConfirmar(false);
      await carregar();
    } catch {
      toast.error(r.erro);
    } finally {
      setOcupado(null);
    }
  }

  async function reativar() {
    setOcupado('reativar');
    try {
      await reactivateSubscriptionRequest();
      toast.success(r.reativadaOk);
      await carregar();
    } catch {
      toast.error(r.erro);
    } finally {
      setOcupado(null);
    }
  }

  async function exportar() {
    setOcupado('exportar');
    try {
      const dados = await profileApi.exportarDados();
      const arquivo = new Blob([JSON.stringify(dados, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(arquivo);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opus-atlas-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(r.exportado);
    } catch (e) {
      const status = (e as { status?: number }).status;
      toast.error(status === 429 ? r.limite : r.erro);
    } finally {
      setOcupado(null);
    }
  }

  return (
    <>
      <Card nivel={2}>
        <Stack gap={4}>
          <Inline gap={3}>
            <PiCreditCard
              aria-hidden="true"
              className="h-5 w-5 text-ouro-texto"
            />
            <h3 className="text-lg font-semibold text-texto">{r.assinatura}</h3>
          </Inline>

          {carregando ? (
            <Stack gap={2}>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="w-64" />
            </Stack>
          ) : !pago ? (
            <Inline extremos quebra gap={4}>
              <p className="text-texto-suave">{r.gratuito}</p>
              <LocalizedLink
                href="/pricing"
                className="font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[3px] hover:decoration-ouro"
              >
                {r.verPlanos}
              </LocalizedLink>
            </Inline>
          ) : (
            <Stack gap={4}>
              <div>
                <p className="text-texto">
                  {r.plano}{' '}
                  <strong className="font-semibold">{PLANO[plano.type]}</strong>
                </p>
                <p className="mt-1 text-sm text-texto-suave">
                  {cancelada
                    ? r.cancelada(data(plano.expiresAt))
                    : plano.isTrialActive
                      ? r.teste(plano.trialDaysRemaining)
                      : plano.expiresAt
                        ? r.renova(data(plano.expiresAt))
                        : null}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  icone={PiCreditCard}
                  onClick={abrirPortal}
                  carregando={ocupado === 'portal'}
                  disabled={ocupado !== null}
                >
                  {r.gerenciar}
                </Button>
                {cancelada ? (
                  <Button
                    variante="primario"
                    onClick={reativar}
                    carregando={ocupado === 'reativar'}
                    disabled={ocupado !== null}
                  >
                    {r.reativar}
                  </Button>
                ) : (
                  <Button
                    variante="fantasma"
                    onClick={() => setConfirmar(true)}
                    disabled={ocupado !== null}
                  >
                    {r.cancelar}
                  </Button>
                )}
              </div>
              <p className="text-sm text-texto-fraco">{r.gerenciarAjuda}</p>
            </Stack>
          )}
        </Stack>
      </Card>

      <Card nivel={2}>
        <Stack gap={4}>
          <Inline gap={3}>
            <PiDownloadSimple
              aria-hidden="true"
              className="h-5 w-5 text-ouro-texto"
            />
            <h3 className="text-lg font-semibold text-texto">{r.dados}</h3>
          </Inline>
          <p className="medida-texto text-texto-suave">{r.dadosTexto}</p>
          <div>
            <Button
              icone={PiDownloadSimple}
              onClick={exportar}
              carregando={ocupado === 'exportar'}
              disabled={ocupado !== null}
            >
              {r.exportar}
            </Button>
          </div>
        </Stack>
      </Card>

      <ConfirmModal
        isOpen={confirmar}
        onClose={() => setConfirmar(false)}
        onConfirm={cancelar}
        type="warning"
        title={r.confirmarTitulo}
        message={r.confirmarTexto}
        confirmText={r.confirmarBotao}
        cancelText={r.manter}
        isLoading={ocupado === 'cancelar'}
      />
    </>
  );
}
