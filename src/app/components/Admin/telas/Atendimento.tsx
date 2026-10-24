'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowSquareOut } from 'react-icons/pi';
import { Badge } from '@/app/components/ui/Badge';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Busca, Segmentos } from '@/app/components/Admin/painel/Controles';
import { dataHora, relativo } from '@/app/components/Admin/painel/formatos';
import { errorMessage } from '@/app/hooks/admin/query';
import {
  useAtendimento,
  useAtualizarChamado,
} from '@/app/hooks/admin/useAtendimento';
import type {
  Chamado,
  SituacaoDoChamado,
} from '@/app/requests/admin/atendimento';

/**
 * Atendimento: as mensagens do formulário de contato.
 *
 * **Prioritário primeiro.** Entre as abertas, quem tem plano pago (Plus,
 * Mentor, Maestro, ou o Plus dado pelo professor) vem antes; dentro de cada
 * grupo, a mais antiga antes. O prazo prometido na página de contato: até 1
 * dia útil para quem assina, até 3 no plano grátis. A resposta é por e-mail
 * (o botão abre o cliente de e-mail com o assunto pronto); aqui fica o
 * andamento.
 */

const SITUACAO: Record<SituacaoDoChamado, string> = {
  open: 'Aberto',
  answered: 'Respondido',
  closed: 'Encerrado',
};
const PLANO: Record<string, string> = {
  FREE: 'Free',
  PLUS: 'Plus',
  MENTOR: 'Mentor',
  MAESTRO: 'Maestro',
};
const DIA_UTIL_MS = 24 * 60 * 60 * 1000;

/** Passou do prazo prometido (1 dia útil pago, 3 no Free), contando corrido. */
const atrasado = (c: Chamado) =>
  c.status === 'open' &&
  Date.now() - new Date(c.createdAt).getTime() >
    (c.prioritySupport ? 1 : 3) * DIA_UTIL_MS;

export default function Atendimento() {
  const [status, setStatus] = useState<SituacaoDoChamado | 'all'>('open');
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState<Chamado | null>(null);
  const fila = useAtendimento(status, busca);
  const contagens = fila.extra as
    | { open: number; answered: number; closed: number; priorityOpen: number }
    | undefined;

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Atendimento"
        descricao="As mensagens do formulário de contato. Abertas: as de quem tem plano pago primeiro, e dentro de cada grupo a mais antiga primeiro. Prazo: 1 dia útil para quem assina, 3 no plano grátis."
        aoAtualizar={fila.refetch}
        atualizando={fila.fetching}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmentos
          rotulo="Situação dos chamados"
          valor={status}
          aoMudar={(v) => setStatus(v as SituacaoDoChamado | 'all')}
          opcoes={[
            {
              valor: 'open',
              rotulo: contagens?.priorityOpen
                ? `Abertos (${contagens.priorityOpen} prioritários)`
                : 'Abertos',
              contagem: contagens?.open,
            },
            {
              valor: 'answered',
              rotulo: 'Respondidos',
              contagem: contagens?.answered,
            },
            {
              valor: 'closed',
              rotulo: 'Encerrados',
              contagem: contagens?.closed,
            },
            { valor: 'all', rotulo: 'Todos' },
          ]}
        />
        <Busca
          valor={busca}
          aoMudar={setBusca}
          placeholder="Nome, e-mail, assunto ou protocolo"
          rotulo="Buscar chamados"
          className="w-full sm:w-72"
        />
      </div>

      {fila.error ? (
        <Text papel="rotulo" tom="erro" as="p">
          {fila.error}
        </Text>
      ) : fila.loading ? (
        <Row.Skeleton repetir={6} />
      ) : fila.items.length === 0 ? (
        <Vazio
          titulo="Nenhum chamado aqui"
          descricao="Quando alguém escrever pelo formulário de contato, a mensagem aparece nesta fila."
        />
      ) : (
        <Row.Lista>
          {fila.items.map((c) => (
            <Row
              key={c.id}
              clicavel
              onClick={() => setAberto(c)}
              titulo={
                <span className="flex flex-wrap items-center gap-2">
                  {c.subject}
                  {c.prioritySupport && (
                    <Badge estado="ouro">Prioritário</Badge>
                  )}
                  {atrasado(c) && (
                    <Badge estado="atencao">Passou do prazo</Badge>
                  )}
                </span>
              }
              detalhe={`${c.name} · ${c.email} · ${PLANO[c.plan] ?? c.plan} · ${relativo(c.createdAt)}`}
              valor={
                <Badge estado={c.status === 'open' ? 'neutro' : 'ok'}>
                  {SITUACAO[c.status]}
                </Badge>
              }
            />
          ))}
        </Row.Lista>
      )}
      {fila.hasMore && (
        <Button
          variante="texto"
          className="self-start"
          carregando={fila.loadingMore}
          onClick={fila.loadMore}
        >
          Ver mais
        </Button>
      )}

      <Detalhe chamado={aberto} aoFechar={() => setAberto(null)} />
    </Stack>
  );
}

function Detalhe({
  chamado,
  aoFechar,
}: {
  chamado: Chamado | null;
  aoFechar: () => void;
}) {
  const atualizar = useAtualizarChamado();
  const [nota, setNota] = useState('');
  const [anterior, setAnterior] = useState<string | null>(null);
  if (chamado && chamado.id !== anterior) {
    setAnterior(chamado.id);
    setNota(chamado.note ?? '');
  }

  const mudar = async (status?: SituacaoDoChamado) => {
    if (!chamado) return;
    try {
      await atualizar.mutateAsync([chamado.id, { status, note: nota }]);
      toast.success(
        status ? `Chamado ${SITUACAO[status].toLowerCase()}.` : 'Nota salva.'
      );
      aoFechar();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const responder = chamado
    ? `mailto:${chamado.email}?subject=${encodeURIComponent(`Re: [${chamado.ticketId}] ${chamado.subject}`)}`
    : '#';

  return (
    <Sheet
      aberto={!!chamado}
      aoFechar={aoFechar}
      titulo={chamado?.subject ?? ''}
      descricao={
        chamado
          ? `${chamado.ticketId} · ${dataHora(chamado.createdAt)}`
          : undefined
      }
      largura="m"
      rodape={
        chamado ? (
          <div className="flex w-full flex-wrap justify-end gap-2">
            <Button
              variante="fantasma"
              onClick={() => void mudar()}
              carregando={atualizar.isPending}
            >
              Salvar nota
            </Button>
            {chamado.status !== 'closed' && (
              <Button
                onClick={() => void mudar('closed')}
                disabled={atualizar.isPending}
              >
                Encerrar
              </Button>
            )}
            {chamado.status === 'open' && (
              <Button
                variante="primario"
                onClick={() => void mudar('answered')}
                disabled={atualizar.isPending}
              >
                Marcar como respondido
              </Button>
            )}
          </div>
        ) : undefined
      }
    >
      {chamado && (
        <Stack gap={4}>
          <div className="flex flex-wrap gap-2">
            {chamado.prioritySupport && (
              <Badge estado="ouro">Prioritário</Badge>
            )}
            <Badge>{PLANO[chamado.plan] ?? chamado.plan}</Badge>
            <Badge>{chamado.category}</Badge>
            <Badge>Urgência: {chamado.priority}</Badge>
            <Badge>{chamado.language === 'en' ? 'Inglês' : 'Português'}</Badge>
          </div>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="t-legenda">De</dt>
              <dd>{chamado.name}</dd>
            </div>
            <div>
              <dt className="t-legenda">E-mail</dt>
              <dd className="break-all">{chamado.email}</dd>
            </div>
          </dl>
          <p className="whitespace-pre-wrap rounded-controle bg-sup-2 p-4 text-[0.9375rem] leading-relaxed">
            {chamado.message}
          </p>
          <a href={responder} className={classesDeBotao('secundario', 'p')}>
            <PiArrowSquareOut aria-hidden="true" /> Responder por e-mail
          </a>
          <Field.Area
            label="Nota interna"
            ajuda="Só a equipe vê."
            rows={4}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
          {chamado.answeredAt && (
            <Text papel="legenda" as="p">
              Respondido {relativo(chamado.answeredAt)}.
            </Text>
          )}
        </Stack>
      )}
    </Sheet>
  );
}
