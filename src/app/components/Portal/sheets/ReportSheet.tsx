'use client';

// O relatório — o retrato do período, a mensagem do professor e a conversa
// (o aluno comenta; o professor lê). O "só seu" pode virar compartilhado.

import { useState } from 'react';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { PiFilePdf } from 'react-icons/pi';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  errorText,
  portalKeys,
  usePortalMutation,
  useReport,
  useReportComments,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import { ago, dayOf, firstName, shortDateYear } from '../format';
import { ReportView } from '../report/ReportView';
import {
  Avatar,
  Block,
  ScreenError,
  ScreenLoading,
  WorkCited,
} from '../pieces';
import type { SheetProps } from '../PortalProvider';

export default function ReportSheet({
  request,
  role,
  onClose,
  closeAll,
}: SheetProps<{ type: 'report'; id: string }>) {
  const report = useReport(request.id);
  const r = report.data;
  const shared = r?.visibility === 'SHARED';
  const comments = useReportComments(request.id, Boolean(r) && shared);
  const [text, setText] = useState('');
  const [stopping, setStopping] = useState(false);
  const student = r ? firstName(api.nameOf(r.student)) : '';

  const publish = usePortalMutation(() => api.publishReport(request.id), {
    success: `Relatório compartilhado. ${student} recebeu o aviso.`,
    invalidate: [['portal', 'reports'], portalKeys.report(request.id)],
  });
  const stop = usePortalMutation(() => api.revokeReport(request.id), {
    success: 'Compartilhamento desfeito. O relatório continua com você.',
    onSuccess: closeAll,
  });
  const pdf = usePortalMutation(
    () => api.downloadReportPdf(request.id, r?.title ?? 'relatorio'),
    { invalidate: [] }
  );
  const comment = usePortalMutation(
    () => api.addReportComment(request.id, { content: text.trim() }),
    {
      success: 'Comentário enviado.',
      invalidate: [portalKeys.comments(request.id)],
      onSuccess: () => setText(''),
    }
  );

  const footer =
    r && role === 'teacher' ? (
      shared ? (
        r.isActive ? (
          <Button variante="fantasma" onClick={() => setStopping(true)}>
            Parar de compartilhar
          </Button>
        ) : undefined
      ) : (
        <Button
          variante="primario"
          carregando={publish.isPending}
          onClick={() => publish.mutate(undefined)}
        >
          Compartilhar com {student}
        </Button>
      )
    ) : undefined;

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo={r?.title ?? 'Relatório'}
      descricao={
        r
          ? `${role === 'teacher' ? api.nameOf(r.student) : `De ${api.nameOf(r.teacher)}`} · ${shortDateYear(dayOf(r.periodStart))} a ${shortDateYear(dayOf(r.periodEnd))}`
          : undefined
      }
      largura="g"
      rodape={footer}
    >
      {report.isPending ? (
        <ScreenLoading rows={4} label="Carregando o relatório" />
      ) : report.error || !r ? (
        <ScreenError message={errorText(report.error)} />
      ) : (
        <div className="flex flex-col gap-12">
          {role === 'teacher' && (
            <span className="flex flex-wrap items-center gap-3">
              {shared ? (
                <Badge estado="neutro">Compartilhado</Badge>
              ) : (
                <Badge estado="ouro">Só seu</Badge>
              )}
              <span className="t-legenda">
                {shared
                  ? r.lastViewedAt
                    ? `${student} viu ${ago(r.lastViewedAt)}`
                    : `${student} ainda não viu`
                  : `${student} não vê este relatório até você compartilhar.`}
              </span>
            </span>
          )}
          {r.teacherMessage && (
            <blockquote className="flex flex-col gap-3 rounded-card bg-sup-2 p-6">
              <p className="whitespace-pre-line font-display text-xl leading-snug text-texto">
                &ldquo;{r.teacherMessage}&rdquo;
              </p>
              <footer className="t-legenda">{api.nameOf(r.teacher)}</footer>
            </blockquote>
          )}
          <ReportView
            data={r.reportData}
            approvedPieces={Boolean(r.nextPieces?.length)}
            period={
              r.periodLabel ||
              `${shortDateYear(dayOf(r.periodStart))} a ${shortDateYear(dayOf(r.periodEnd))}`
            }
          />

          {r.nextPieces && r.nextPieces.length > 0 && (
            <Block title="Para estudar a seguir">
              <ul className="flex flex-col gap-4">
                {r.nextPieces.map((p) => (
                  <li key={p.workId} className="flex flex-col gap-1">
                    <WorkCited
                      work={{
                        id: p.workId,
                        title: p.title,
                        composer: { name: p.composer },
                      }}
                      compact
                    />
                    {p.note && (
                      <span className="text-[0.9375rem] text-texto-suave">
                        {p.note}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {r.tips.length > 0 && (
            <Block title={`Dicas de ${firstName(api.nameOf(r.teacher))}`}>
              <ol className="flex flex-col gap-3">
                {r.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-[0.9375rem]">
                    <span className="t-dado text-ouro-texto">{i + 1}</span>
                    <span className="text-texto-suave">{tip}</span>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {(r.nextPieces?.length || r.tips.length || hasSkills(r)) && (
            <div>
              <Button
                variante="secundario"
                tamanho="p"
                carregando={pdf.isPending}
                onClick={() => pdf.mutate(undefined)}
              >
                <Icon de={PiFilePdf} />
                Baixar em PDF
              </Button>
            </div>
          )}

          {shared && (
            <Block
              title={`Conversa${comments.data ? ` · ${comments.data.total}` : ''}`}
            >
              {comments.data && comments.data.comments.length > 0 ? (
                <ul className="flex flex-col gap-4">
                  {comments.data.comments.map((c) => {
                    const who = [
                      c.student.user.firstName,
                      c.student.user.lastName,
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <li key={c.id} className="flex gap-3">
                        <Avatar
                          name={who}
                          image={c.student.user.image}
                          size="p"
                        />
                        <span className="flex flex-col gap-1">
                          <span className="text-sm">
                            <span className="font-medium">{who}</span>{' '}
                            <span className="t-legenda">
                              · {ago(c.createdAt)}
                            </span>
                          </span>
                          <span className="whitespace-pre-line text-[0.9375rem] text-texto-suave">
                            {c.content}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-texto-fraco">
                  {role === 'teacher'
                    ? `Quando ${student} comentar, aparece aqui.`
                    : 'Nenhum comentário ainda.'}
                </p>
              )}
              {role === 'student' && r.allowComments && (
                <div className="flex items-end gap-2">
                  <Field.Area
                    label="Comentar"
                    rotuloOculto
                    rows={2}
                    value={text}
                    maxLength={2000}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="O que você achou, o que quer perguntar"
                    className="flex-1"
                  />
                  <Button
                    disabled={text.trim().length < 2}
                    carregando={comment.isPending}
                    onClick={() => comment.mutate(undefined)}
                  >
                    Enviar
                  </Button>
                </div>
              )}
            </Block>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={stopping}
        onClose={() => setStopping(false)}
        onConfirm={() => stop.mutate(undefined)}
        isLoading={stop.isPending}
        type="warning"
        title="Parar de compartilhar?"
        message={`${student} deixa de ver o relatório. Ele continua na sua lista.`}
        confirmText="Parar de compartilhar"
        cancelText="Voltar"
      />
    </Sheet>
  );
}

/**
 * O PDF é do Maestro: aparece quando o relatório tem o que só ele gera
 * (habilidades, peças aprovadas ou dicas).
 */
function hasSkills(r: api.ReportDetail) {
  const data = r.reportData as {
    skills?: unknown;
    report?: { skills?: unknown };
  } | null;
  return Boolean(data?.skills ?? data?.report?.skills);
}
