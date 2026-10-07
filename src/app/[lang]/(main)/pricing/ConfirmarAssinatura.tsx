'use client';

import { useState } from 'react';
import { PiArrowRight } from 'react-icons/pi';
import toast from 'react-hot-toast';
import Modal from '@/app/components/Modal';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { PLANOS } from '@/app/conteudo/planos';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { BillingPeriod, PlanType } from '@/app/libs/subscriptionConstants';
import { validateCouponRequest } from '@/app/requests/billing';
import { formatarPreco, type PlanoPago, type Precos } from './precos';

/** Confirmação antes do Stripe: o resumo, o cupom e o botão de pagar. */
export function Confirmar({
  idioma,
  plano,
  anual,
  precos,
  pagarNoStripe,
  aoFechar,
}: {
  idioma: Idioma;
  plano: PlanoPago;
  anual: boolean;
  precos: Precos;
  pagarNoStripe: (
    plano: PlanType,
    periodo: BillingPeriod,
    cupom?: string
  ) => Promise<void>;
  aoFechar: () => void;
}) {
  const c = PLANOS[idioma].confirmar;
  const nome = PLANOS[idioma].planos[plano].nome;
  const p = precos[plano]!;
  const periodo = anual ? BillingPeriod.YEARLY : BillingPeriod.MONTHLY;
  const cheio = anual && p.anual ? p.anual.total : p.mensal;

  const [codigo, setCodigo] = useState('');
  const [conferindo, setConferindo] = useState(false);
  const [indo, setIndo] = useState(false);
  const [cupom, setCupom] = useState<{
    code: string;
    discount: number;
    finalPrice: number;
  } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function aplicar() {
    if (!codigo.trim()) return;
    setConferindo(true);
    setErro(null);
    try {
      const r = await validateCouponRequest(
        codigo.trim(),
        plano as PlanType,
        periodo
      );
      if (r.valid && r.pricing && r.coupon) {
        setCupom({
          code: r.coupon.code,
          discount: r.pricing.discount,
          finalPrice: r.pricing.finalPrice,
        });
      } else {
        setCupom(null);
        setErro(r.error || c.erroCupom);
      }
    } catch (e) {
      setCupom(null);
      setErro(e instanceof Error ? e.message : c.erroCupom);
    } finally {
      setConferindo(false);
    }
  }

  async function pagar() {
    setIndo(true);
    try {
      await pagarNoStripe(plano as PlanType, periodo, cupom?.code);
    } catch (e) {
      toast.error(
        e instanceof Error && e.message ? e.message : c.erroPagamento
      );
      setIndo(false);
    }
  }

  const linhas: [string, string][] = [
    [
      c.periodo,
      anual ? PLANOS[idioma].periodo.anual : PLANOS[idioma].periodo.mensal,
    ],
  ];
  if (cupom) {
    linhas.push([c.original, formatarPreco(cheio, idioma)]);
    linhas.push([c.desconto, `− ${formatarPreco(cupom.discount, idioma)}`]);
  }

  return (
    <Modal
      isOpen
      onClose={aoFechar}
      title={c.titulo(nome)}
      maxWidth="md"
      showCloseButton
    >
      <div className="flex flex-col gap-6">
        <dl className="flex flex-col">
          {linhas.map(([rotulo, valor]) => (
            <div
              key={rotulo}
              className="flex items-baseline justify-between gap-4 border-b border-linha py-3 text-[0.9375rem]"
            >
              <dt className="text-texto-suave">{rotulo}</dt>
              <dd className="tabular-nums text-texto">{valor}</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 pt-4">
            <dt className="font-semibold text-texto">{c.total}</dt>
            <dd className="classical-title text-3xl tabular-nums text-texto">
              {formatarPreco(cupom ? cupom.finalPrice : cheio, idioma)}
            </dd>
          </div>
        </dl>

        {/* Campo e botão empilhados: lado a lado, a ajuda e o erro embaixo
            do campo desalinham o botão. */}
        <form
          className="flex flex-col items-start gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            aplicar();
          }}
        >
          <div className="w-full">
            <Field
              label={c.cupom}
              ajuda={cupom ? undefined : c.cupomAjuda}
              erro={erro ?? undefined}
              value={codigo}
              autoComplete="off"
              onChange={(e) => {
                setCodigo(e.target.value.toUpperCase());
                setCupom(null);
                setErro(null);
              }}
            />
          </div>
          <Button
            type="submit"
            tamanho="p"
            carregando={conferindo}
            disabled={!codigo.trim()}
          >
            {c.aplicar}
          </Button>
        </form>

        <p className="text-sm leading-relaxed text-texto-fraco">{c.nota}</p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variante="fantasma" onClick={aoFechar} disabled={indo}>
            {c.cancelar}
          </Button>
          <Button variante="primario" onClick={pagar} carregando={indo}>
            {c.pagar}
            <PiArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
