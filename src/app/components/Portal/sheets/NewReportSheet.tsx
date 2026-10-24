'use client';

// Gerar relatório — o servidor monta com os números do período; o professor
// escreve a mensagem e decide: só para ele (acompanhamento) ou compartilhado
// com o aluno. O "só seu" pode ser compartilhado depois.

import { useEffect, useState } from 'react';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  usePortalMutation,
  useTeacherDashboard,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import type {
  ReportPeriod,
  ReportSection,
  ReportVisibility,
} from '@/app/requests/portal/api';
import { firstName, monthName, today } from '../format';
import { Options, ScreenLoading } from '../pieces';
import {
  NextPiecesPicker,
  TipsEditor,
  type PieceChoice,
} from '../report/PedagogicalFields';
import type { SheetProps } from '../PortalProvider';

export const SECTION_LABEL: Record<ReportSection, string> = {
  overview: 'Visão geral',
  attendance: 'Presença e pontualidade',
  evolution: 'Mês a mês',
  assignments: 'Tarefas',
  insights: 'Pontos fortes e desafios',
  repertoire: 'Repertório',
  engagement: 'Engajamento',
  recommendations: 'Sugestões de obra',
  comparison: 'Comparação com o período anterior',
  skills: 'Evolução por habilidade',
};
const DEFAULT_SECTIONS: ReportSection[] = [
  'overview',
  'attendance',
  'evolution',
  'assignments',
  'insights',
  'repertoire',
];

export default function NewReportSheet({
  request,
  onClose,
  open,
  closeAll,
}: SheetProps<{ type: 'new-report'; studentId?: string }>) {
  const dashboard = useTeacherDashboard();
  const students = dashboard.data?.students ?? [];
  const [studentId, setStudentId] = useState(request.studentId ?? '');
  const [period, setPeriod] = useState<ReportPeriod>('1month');
  const [sections, setSections] = useState<Set<ReportSection>>(
    new Set(DEFAULT_SECTIONS)
  );
  const [message, setMessage] = useState('');
  const [visibility, setVisibility] = useState<ReportVisibility>('SHARED');
  const [comments, setComments] = useState(true);
  const maestro = dashboard.data?.plan?.name === 'MAESTRO';
  const [pieces, setPieces] = useState<PieceChoice[]>([]);
  const [tips, setTips] = useState<string[]>([]);

  // Maestro: a evolução por habilidade entra por padrão.
  useEffect(() => {
    if (maestro) setSections((set) => new Set(set).add('skills'));
  }, [maestro]);

  // Trocar de aluno descarta o que foi escolhido para o anterior.
  useEffect(() => {
    setPieces([]);
    setTips([]);
  }, [studentId]);

  useEffect(() => {
    if (!studentId && students.length === 1)
      setStudentId(students[0].studentId);
  }, [studentId, students]);

  const name = firstName(
    students.find((s) => s.studentId === studentId)?.name ?? ''
  );
  const label: Record<ReportPeriod, string> = {
    '1month': 'Último mês',
    '3months': 'Últimos 3 meses',
    '6months': 'Semestre',
    '1year': 'Último ano',
    all: 'Desde o começo',
  };
  const title = `${period === '1month' ? `Relatório de ${monthName(today())}` : label[period]} — ${name}`;

  const create = usePortalMutation(
    () =>
      api.createReport({
        studentId,
        title,
        teacherMessage: message.trim() || undefined,
        period,
        sections: [...sections],
        allowComments: comments,
        visibility,
        ...(maestro
          ? {
              nextPieces: pieces.map((p) => ({
                workId: p.workId,
                note: p.note.trim() || undefined,
              })),
              tips: tips.map((t) => t.trim()).filter(Boolean),
            }
          : {}),
      }),
    {
      success:
        visibility === 'SHARED'
          ? `Relatório compartilhado com ${name}.`
          : 'Relatório guardado só para você.',
      onSuccess: (r) => (closeAll(), open({ type: 'report', id: r.id })),
    }
  );

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo="Gerar relatório"
      descricao="O servidor monta o relatório com os números do período; você escreve a mensagem e decide quem vê."
      largura="m"
      rodape={
        <>
          <Button variante="fantasma" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variante="primario"
            disabled={!studentId || sections.size === 0}
            carregando={create.isPending}
            onClick={() => create.mutate(undefined)}
          >
            {visibility === 'SHARED'
              ? `Compartilhar com ${name || 'o aluno'}`
              : 'Guardar só para mim'}
          </Button>
        </>
      }
    >
      {dashboard.isPending ? (
        <ScreenLoading rows={3} />
      ) : (
        <div className="flex flex-col gap-6">
          <Field.Selecao
            label="Aluno"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="">Escolha o aluno</option>
            {students.map((s) => (
              <option key={s.studentId} value={s.studentId}>
                {s.name}
              </option>
            ))}
          </Field.Selecao>
          <Options
            label="Período"
            value={period}
            onChange={setPeriod}
            options={(Object.keys(label) as ReportPeriod[]).map((p) => ({
              value: p,
              label: label[p],
            }))}
          />
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2 font-medium text-texto">
              O que entra
            </legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SECTION_LABEL) as ReportSection[])
                .filter((s) => s !== 'skills' || maestro)
                .map((s) => (
                  <Chip
                    key={s}
                    selecionado={sections.has(s)}
                    onClick={() =>
                      setSections((set) => {
                        const next = new Set(set);
                        if (next.has(s)) next.delete(s);
                        else next.add(s);
                        return next;
                      })
                    }
                  >
                    {SECTION_LABEL[s]}
                  </Chip>
                ))}
            </div>
            {!maestro && (
              <p className="t-legenda mt-2">
                No Maestro o relatório também traz a evolução por habilidade, as
                próximas peças, as suas dicas e o PDF.{' '}
                <button
                  type="button"
                  onClick={() => open({ type: 'upgrade' })}
                  className="underline underline-offset-2 hover:text-texto"
                >
                  Ver o Maestro
                </button>
              </p>
            )}
          </fieldset>
          {maestro && studentId && (
            <>
              <NextPiecesPicker
                studentId={studentId}
                name={name}
                value={pieces}
                onChange={setPieces}
              />
              <TipsEditor
                studentId={studentId}
                period={period}
                name={name}
                value={tips}
                onChange={setTips}
              />
            </>
          )}
          <Options
            label="Quem vê"
            value={visibility}
            onChange={setVisibility}
            options={[
              { value: 'SHARED', label: `${name || 'O aluno'} e você` },
              { value: 'TEACHER_ONLY', label: 'Só você' },
            ]}
          />
          {visibility === 'TEACHER_ONLY' && (
            <p className="t-legenda -mt-3">
              Fica como acompanhamento seu. Dá para compartilhar depois, com o
              mesmo conteúdo.
            </p>
          )}
          <Field.Area
            label={
              visibility === 'SHARED'
                ? `Mensagem para ${name || 'o aluno'}`
                : 'Anotação'
            }
            rows={3}
            value={message}
            maxLength={5000}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="O que você quer que fique deste período."
          />
          {visibility === 'SHARED' && (
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <span className="t-rotulo font-medium text-texto">
                {name || 'O aluno'} pode comentar
              </span>
              <input
                type="checkbox"
                checked={comments}
                onChange={(e) => setComments(e.target.checked)}
                className="h-5 w-5 accent-[var(--ouro)]"
              />
            </label>
          )}
        </div>
      )}
    </Sheet>
  );
}
