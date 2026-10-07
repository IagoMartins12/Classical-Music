'use client';

import Link from 'next/link';
import { PiArrowSquareOut, PiCalendarBlank, PiTicket } from 'react-icons/pi';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { HistoricoDoRegistro } from '@/app/components/Admin/painel/Trilha';
import { dataCurta, dataHora } from '@/app/components/Admin/painel/formatos';
import { adminKeys, useAdminQuery } from '@/app/hooks/admin/query';
import {
  NOME_DO_ESTADO_DO_EVENTO,
  getEventoImportado,
} from '@/app/requests/admin/blog';

/**
 * A ficha de um evento da agenda que entrou por scraper: quando, onde, quem
 * toca, de que página veio e o que o painel fez com ele. Abre da lista de
 * eventos importados e de cada evento de uma rodada.
 */
export function FichaEvento({
  eventoId,
  aoFechar,
}: {
  eventoId: string;
  aoFechar: () => void;
}) {
  const q = useAdminQuery(
    adminKeys.list('scrapers', { evento: eventoId }),
    () => getEventoImportado(eventoId)
  );
  const e = q.data;

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo={e?.title ?? 'Evento'}
      descricao={
        e
          ? [e.venue?.name, dataCurta(e.startDate), e.startTime]
              .filter(Boolean)
              .join(' · ')
          : undefined
      }
      largura="m"
      rodape={
        <Link
          href="/blog/calendar"
          target="_blank"
          className={classesDeBotao('secundario', 'p')}
        >
          <Icon de={PiCalendarBlank} tamanho="pp" /> Ver a agenda
        </Link>
      }
    >
      {!e ? (
        q.error ? (
          <Text papel="rotulo" tom="erro" as="p">
            {q.error}
          </Text>
        ) : (
          <Row.Skeleton repetir={6} />
        )
      ) : (
        <Stack gap={6}>
          {e.subtitle && (
            <Text papel="rotulo" tom="suave" as="p">
              {e.subtitle}
            </Text>
          )}
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Info rotulo="Estado">
              {NOME_DO_ESTADO_DO_EVENTO[e.status] ?? e.status}
            </Info>
            <Info rotulo="Casa">
              {[e.venue?.name, e.venue?.city].filter(Boolean).join(', ') || '—'}
            </Info>
            <Info rotulo="Data">
              {dataCurta(e.startDate)}
              {e.startTime ? `, ${e.startTime}` : ''}
              {e.endDate ? ` até ${dataCurta(e.endDate)}` : ''}
            </Info>
            <Info rotulo="Sala">{e.room ?? '—'}</Info>
            <Info rotulo="Regência">{e.conductor ?? '—'}</Info>
            <Info rotulo="Conjunto">{e.ensemble ?? '—'}</Info>
            {e.soloists.length > 0 && (
              <Info rotulo="Solistas">{e.soloists.join(', ')}</Info>
            )}
            <Info rotulo="Ingressos">
              {e.isFree ? 'Gratuito' : (e.ticketInfo ?? '—')}
            </Info>
            <Info rotulo="Importado em">{dataHora(e.createdAt)}</Info>
            <Info rotulo="Atualizado em">{dataHora(e.updatedAt)}</Info>
          </dl>

          {e.description && (
            <Text papel="corpo" as="p" className="medida-texto">
              {e.description}
            </Text>
          )}

          <Inline gap={4} quebra>
            {e.externalUrl && (
              <a
                href={e.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="t-rotulo inline-flex items-center gap-1.5 text-ouro-texto underline-offset-4 hover:underline"
              >
                <Icon de={PiArrowSquareOut} tamanho="pp" /> Página de origem
              </a>
            )}
            {e.ticketUrl && (
              <a
                href={e.ticketUrl}
                target="_blank"
                rel="noreferrer"
                className="t-rotulo inline-flex items-center gap-1.5 text-ouro-texto underline-offset-4 hover:underline"
              >
                <Icon de={PiTicket} tamanho="pp" /> Compra de ingressos
              </a>
            )}
          </Inline>

          <Stack gap={2}>
            <Text papel="secao" as="h3">
              No painel
            </Text>
            <HistoricoDoRegistro entityId={e.id} />
          </Stack>
        </Stack>
      )}
    </Sheet>
  );
}

function Info({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="t-legenda">{rotulo}</dt>
      <dd className="text-sm text-texto">{children}</dd>
    </div>
  );
}
