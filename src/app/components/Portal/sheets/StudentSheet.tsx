'use client';

// A ficha do aluno, por cima de onde a pessoa está: os números, a prática da
// semana e as próximas aulas. A página do aluno tem o resto.

import Link from 'next/link';
import { useMemo } from 'react';
import { PiArrowRight, PiCalendarPlus } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  useLessons,
  usePractice,
  useTeacherDashboard,
} from '@/app/hooks/portal/query';
import {
  addDays,
  dayOf,
  duration,
  shortDateYear,
  timeRange,
  today,
  when,
} from '../format';
import { Block, PracticeWeek, ScreenLoading } from '../pieces';
import type { SheetProps } from '../PortalProvider';

const LEVEL: Record<string, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

export default function StudentSheet({
  request,
  onClose,
  open,
  closeAll,
}: SheetProps<{ type: 'student'; studentId: string }>) {
  const { studentId } = request;
  const dashboard = useTeacherDashboard();
  const student = dashboard.data?.students.find(
    (s) => s.studentId === studentId
  );
  const from = useMemo(() => addDays(today(), -6), []);
  const practice = usePractice({ studentId, from });
  const now = useMemo(() => new Date().toISOString(), []);
  const upcoming = useLessons({
    as: 'teacher',
    studentId,
    status: 'SCHEDULED',
    from: now,
    order: 'asc',
    limit: 3,
  });

  const title = student?.name ?? 'Aluno';
  const facts = [
    student?.level && LEVEL[student.level],
    student?.mainInstrument,
    student && `desde ${shortDateYear(dayOf(student.relationshipStart))}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo={title}
      descricao={facts || undefined}
      largura="g"
      rodape={
        <>
          <Link
            href={`/teacher/students/${studentId}`}
            onClick={closeAll}
            className="mr-auto inline-flex min-h-[var(--alvo)] items-center gap-1.5 text-sm font-medium text-ouro-texto"
          >
            Página do aluno <Icon de={PiArrowRight} tamanho="p" />
          </Link>
          <Button
            variante="primario"
            icone={PiCalendarPlus}
            onClick={() => open({ type: 'schedule', studentId })}
          >
            Marcar aula
          </Button>
        </>
      }
    >
      {dashboard.isPending ? (
        <ScreenLoading rows={3} />
      ) : (
        <div className="flex flex-col gap-8">
          <dl className="grid grid-cols-3 gap-4">
            {[
              ['Aulas', String(student?.totalLessons ?? 0)],
              [
                'Prática, 7 dias',
                duration(
                  practice.data?.totalMinutes ?? student?.practiceMinutes7d ?? 0
                ),
              ],
              [
                'Última aula',
                student?.lastLessonAt ? when(dayOf(student.lastLessonAt)) : '—',
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1">
                <dt className="t-legenda">{label}</dt>
                <dd className="t-dado text-2xl text-texto first-letter:uppercase">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="grid gap-8 sm:grid-cols-2">
            <Block title="Prática da semana">
              {practice.data && practice.data.days.length ? (
                <PracticeWeek
                  days={practice.data.days}
                  goal={practice.data.weeklyGoalMinutes}
                  height={80}
                />
              ) : (
                <p className="text-sm text-texto-fraco">
                  Nenhuma prática registrada nos últimos 7 dias.
                </p>
              )}
            </Block>
            <Block title="Próximas aulas">
              {upcoming.data && upcoming.data.items.length ? (
                <ul className="flex flex-col">
                  {upcoming.data.items.map((l) => (
                    <Row
                      as="li"
                      key={l.id}
                      clicavel
                      onClick={() => open({ type: 'lesson', id: l.id })}
                      className="border-b border-linha last:border-0"
                      antes={
                        <span className="t-dado w-24 text-sm text-texto-suave first-letter:uppercase">
                          {when(dayOf(l.scheduledAt))}
                        </span>
                      }
                      titulo={l.title}
                      detalhe={`${timeRange(l.scheduledAt, l.duration)}${l.location ? ` · ${l.location}` : ''}`}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-texto-fraco">
                  Nenhuma aula marcada.
                </p>
              )}
            </Block>
          </div>
        </div>
      )}
    </Sheet>
  );
}
