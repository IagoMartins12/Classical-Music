'use client';

import { useState } from 'react';
import { PiWarning } from 'react-icons/pi';
import { fimDoDia } from '@/app/components/Admin/Modals/UserEditModal';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  atualizarConviteProfessor,
  atualizarPlanoConcedido,
  type ConviteProfessor,
} from '@/app/requests/admin/painel';

type Plano = 'MENTOR' | 'MAESTRO';

const hoje = () => new Date().toISOString().slice(0, 10);

/** `YYYY-MM-DD` no horário de Brasília, para o campo de data. */
const paraCampo = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
      }).format(new Date(iso))
    : '';

type Props =
  | {
      modo: 'convite';
      usuarioId: string;
      convite: ConviteProfessor;
      aoFechar: () => void;
      aoSalvar: () => void;
    }
  | {
      modo: 'plano';
      usuarioId: string;
      /** Plano concedido em vigor; nulo concede um novo. */
      plano: { planType: string; endDate: string | null } | null;
      aoFechar: () => void;
      aoSalvar: () => void;
    };

/**
 * O que a equipe ajusta depois do convite de professor, no mesmo desenho do
 * `UserEditModal`:
 *
 * - **convite sem resposta**: o plano oferecido, o vencimento do plano e a
 *   validade do convite. O link já enviado passa a valer o novo; "reenviar"
 *   manda outro e-mail, com links novos.
 * - **plano concedido**: trocar Mentor ↔ Maestro e o vencimento (ou conceder
 *   um, se não houver). Plano pago pelo Stripe não aparece aqui: ele muda
 *   pela própria assinatura.
 */
export default function ConviteEPlanoModal(props: Props) {
  const inicial =
    props.modo === 'convite'
      ? {
          plano: (props.convite.planType ?? 'MENTOR') as Plano,
          vencimento: paraCampo(props.convite.planExpiresAt),
        }
      : {
          plano: (props.plano?.planType === 'MAESTRO'
            ? 'MAESTRO'
            : 'MENTOR') as Plano,
          vencimento: paraCampo(props.plano?.endDate ?? null),
        };
  const [plano, setPlano] = useState<Plano>(inicial.plano);
  const [vencimento, setVencimento] = useState(inicial.vencimento);
  const [validade, setValidade] = useState(
    props.modo === 'convite' ? paraCampo(props.convite.inviteExpiresAt) : ''
  );
  const [reenviar, setReenviar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const conviteVencido =
    props.modo === 'convite' &&
    props.convite.expired &&
    validade === paraCampo(props.convite.inviteExpiresAt);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      const vence = vencimento ? fimDoDia(vencimento) : null;
      if (props.modo === 'convite') {
        await atualizarConviteProfessor(props.usuarioId, {
          planType: plano,
          planExpiresAt: vence,
          inviteExpiresAt:
            validade && validade !== paraCampo(props.convite.inviteExpiresAt)
              ? fimDoDia(validade)
              : undefined,
          resend: reenviar || undefined,
        });
      } else {
        await atualizarPlanoConcedido(props.usuarioId, {
          planType: plano,
          expiresAt: vence,
        });
      }
      props.aoSalvar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Sheet
      aberto
      aoFechar={props.aoFechar}
      titulo={
        props.modo === 'convite'
          ? 'Convite de professor'
          : props.plano
            ? 'Plano concedido'
            : 'Conceder plano'
      }
      descricao={
        props.modo === 'convite'
          ? 'Ainda sem resposta. O link já enviado passa a valer o que for salvo aqui.'
          : 'Concedido pela equipe, sem cobrança. Ao vencer, a conta volta ao Free.'
      }
      largura="m"
      rodape={
        <>
          <Button
            tamanho="p"
            variante="fantasma"
            onClick={props.aoFechar}
            disabled={salvando}
          >
            Cancelar
          </Button>
          <Button
            tamanho="p"
            variante="primario"
            onClick={salvar}
            carregando={salvando}
            disabled={conviteVencido && !reenviar}
          >
            {reenviar ? 'Salvar e reenviar' : 'Salvar'}
          </Button>
        </>
      }
    >
      <Stack gap={6}>
        {erro && (
          <Inline
            gap={2}
            alinhar="inicio"
            className="rounded-controle bg-sup-2 p-4 text-erro"
          >
            <PiWarning aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{erro}</span>
          </Inline>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field.Selecao
            label="Plano do professor"
            ajuda="Define quantos alunos ele pode ter."
            value={plano}
            onChange={(e) => setPlano(e.target.value as Plano)}
          >
            <option value="MENTOR">Mentor (até 7 alunos)</option>
            <option value="MAESTRO">Maestro (alunos ilimitados)</option>
          </Field.Selecao>
          <Field
            type="date"
            label="Vencimento do plano"
            ajuda="Em branco: sem vencimento."
            min={hoje()}
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
          />
          {props.modo === 'convite' && (
            <Field
              type="date"
              label="Validade do convite"
              ajuda={
                props.convite.expired
                  ? 'O convite venceu: escolha uma data nova para reabri-lo.'
                  : 'Até quando os links do e-mail valem.'
              }
              min={hoje()}
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
            />
          )}
        </div>

        {props.modo === 'convite' && (
          <label className="flex cursor-pointer items-start gap-3 rounded-controle bg-sup-2 px-4 py-3">
            <input
              type="checkbox"
              checked={reenviar}
              onChange={(e) => setReenviar(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--ouro)]"
            />
            <span>
              <span className="block font-medium text-texto">
                Reenviar o convite
              </span>
              <span className="block text-sm text-texto-suave">
                Sai outro e-mail com links novos; os antigos deixam de valer.
              </span>
            </span>
          </label>
        )}
      </Stack>
    </Sheet>
  );
}
