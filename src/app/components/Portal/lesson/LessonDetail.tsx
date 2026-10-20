'use client';

// components/Portal/lesson/LessonDetail.tsx — o detalhe de uma aula
//
// Um conteúdo só para os dois lugares onde a aula abre: o painel lateral das
// telas de aula e calendário no computador (como no esboço C) e a folha no
// tablet e no telefone. As ações moram em `LessonActions`, que cada lugar
// põe onde cabe (rodapé da folha, pé do painel).

import { useState } from 'react';
import { PiEnvelopeSimple, PiWarning } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Text } from '@/app/components/ui/Text';
import {
  useLessons,
  usePortalMutation,
  usePractice,
  useRepertoire,
} from '@/app/hooks/portal/query';
import { useLearningModalStore } from '@/app/stores/useLearningModalStore';
import * as api from '@/app/requests/portal/api';
import type { Lesson, Role } from '@/app/requests/portal/api';
import {
  addDays,
  dayOf,
  duration,
  firstName,
  shortDate,
  today,
} from '../format';
import {
  Avatar,
  Block,
  BulletList,
  LessonStatusLabel,
  PracticeWeek,
  WorkCited,
  lessonState,
} from '../pieces';
import type { SheetRequest } from '../PortalProvider';
import { counterpartOf, recurrenceLabel } from './lessonText';

type Open = (request: SheetRequest) => void;

export function LessonDetail({
  lesson,
  role,
  open,
}: {
  lesson: Lesson;
  role: Role;
  open: Open;
}) {
  const other = counterpartOf(lesson, role);
  const state = lessonState(lesson);
  const series = recurrenceLabel(lesson);
  const works = lesson.works ?? [];
  const composers = (lesson.composers ?? []).filter(
    (c) => !works.some((w) => w.composer?.id === c.id)
  );

  // As colunas seguem a largura do próprio detalhe, não a da janela: no
  // painel ao lado (360px) ele fica numa coluna só.
  return (
    <div className="@container flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {role === 'teacher' ? (
          <button
            type="button"
            onClick={() =>
              open({ type: 'student', studentId: lesson.student.id })
            }
            className="group/pessoa flex items-center gap-3 text-left"
          >
            <Avatar name={other.name} image={other.user.image} />
            <span className="flex flex-col">
              <span className="font-medium text-texto underline decoration-transparent underline-offset-4 transition-colors group-hover/pessoa:decoration-ouro">
                {other.name}
              </span>
              <span className="t-legenda">Abrir a ficha</span>
            </span>
          </button>
        ) : (
          <span className="flex items-center gap-3">
            <Avatar name={other.name} image={other.user.image} />
            <span className="flex flex-col">
              <span className="font-medium text-texto">{other.name}</span>
              <span className="t-legenda">Professor</span>
            </span>
          </span>
        )}
        <span className="flex flex-wrap items-center gap-3">
          {series && <span className="t-legenda">{series}</span>}
          {role === 'teacher' && state === 'scheduled' && (
            <Button
              tamanho="p"
              icone={PiEnvelopeSimple}
              onClick={() =>
                open({ type: 'announce', studentIds: [lesson.student.id] })
              }
            >
              Avisar {firstName(other.name)}
            </Button>
          )}
          <LessonStatusLabel lesson={lesson} role={role} />
        </span>
      </div>

      {role === 'teacher' && state === 'scheduled' && (
        <Preparation lesson={lesson} />
      )}

      {role === 'teacher' && state === 'pending-outcome' && (
        <p className="flex items-start gap-3 rounded-controle bg-sup-2 p-4 text-sm text-texto-suave">
          <Icon
            de={PiWarning}
            tamanho="p"
            className="mt-0.5 shrink-0 text-ouro-texto"
          />
          Esta aula passou e ainda não tem desfecho. Fechar leva um minuto e
          manda o resumo para {firstName(other.name)}.
        </p>
      )}

      {(works.length > 0 ||
        composers.length > 0 ||
        lesson.objectives.length > 0) && (
        <div className="grid gap-8 @lg:grid-cols-2">
          {(works.length > 0 || composers.length > 0) && (
            <Block title="Repertório">
              <Repertoire lesson={lesson} role={role} />
            </Block>
          )}
          {lesson.objectives.length > 0 && (
            <Block title="Objetivos">
              <BulletList items={lesson.objectives} />
            </Block>
          )}
        </div>
      )}

      {lesson.description && (
        <Block title="Sobre a aula">
          <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-texto-suave">
            {lesson.description}
          </p>
        </Block>
      )}
      {lesson.lessonSummary && (
        <Block title="Como foi">
          <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-texto-suave">
            {lesson.lessonSummary}
          </p>
        </Block>
      )}
      {lesson.skillsWorked.length > 0 && (
        <Block title="O que foi trabalhado">
          <BulletList items={lesson.skillsWorked} />
        </Block>
      )}
      {lesson.nextLessonPrep && (
        <Block title="Para a próxima aula">
          <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-texto-suave">
            {lesson.nextLessonPrep}
          </p>
        </Block>
      )}
      {lesson.homework && (
        <Block title="Tarefa">
          <p className="whitespace-pre-line text-[0.9375rem] text-texto-suave">
            {lesson.homework}
          </p>
        </Block>
      )}
      {lesson.publicNotes && (
        <Block title="Recado">
          <p className="whitespace-pre-line text-[0.9375rem] text-texto-suave">
            {lesson.publicNotes}
          </p>
        </Block>
      )}
      {lesson.studentFeedback && (
        <Block
          title={
            role === 'teacher'
              ? `O que ${firstName(other.name)} achou`
              : 'O que você achou'
          }
        >
          <p className="whitespace-pre-line text-[0.9375rem] text-texto-suave">
            {lesson.studentFeedback}
          </p>
        </Block>
      )}
      {role === 'teacher' && lesson.teacherNotes && (
        <Block title="Nota só sua">
          <p className="whitespace-pre-line rounded-controle bg-sup-2 p-4 text-[0.9375rem] leading-relaxed text-texto-suave">
            {lesson.teacherNotes}
          </p>
        </Block>
      )}
      {lesson.cancelReason && (
        <Text papel="rotulo" tom="suave" as="p">
          Cancelada: {lesson.cancelReason}
        </Text>
      )}
    </div>
  );
}

/**
 * "Antes desta aula": o que o professor pediu na última aula, a prática do
 * aluno na semana. É o que ele precisava abrir três telas para ver.
 */
function Preparation({ lesson }: { lesson: Lesson }) {
  const studentId = lesson.student.id;
  const last = useLessons({
    as: 'teacher',
    studentId,
    status: 'COMPLETED',
    order: 'desc',
    limit: 1,
  });
  const from = addDays(today(), -6);
  const practice = usePractice({ studentId, from });
  const previous = last.data?.items[0];
  const days = practice.data?.days ?? [];
  const total = practice.data?.totalMinutes ?? 0;
  if (!previous?.nextLessonPrep && !days.length) return null;

  return (
    <Block title="Antes desta aula">
      <div className="grid gap-4 rounded-card bg-sup-2 p-5 @lg:grid-cols-[minmax(0,1fr)_200px]">
        <div className="flex flex-col gap-3">
          {previous?.nextLessonPrep ? (
            <>
              <Text papel="legenda" as="p">
                Na última aula ({shortDate(dayOf(previous.scheduledAt))}) você
                pediu
              </Text>
              <p className="font-display text-lg leading-snug text-texto">
                &ldquo;{previous.nextLessonPrep}&rdquo;
              </p>
            </>
          ) : (
            <Text papel="legenda" as="p">
              A última aula não deixou nada pedido para esta.
            </Text>
          )}
        </div>
        {days.length > 0 && (
          <div className="flex flex-col gap-2">
            <Text papel="legenda" as="p">
              Prática: {duration(total)} em 7 dias
            </Text>
            <PracticeWeek
              days={days}
              goal={practice.data?.weeklyGoalMinutes ?? null}
              height={64}
            />
          </div>
        )}
      </div>
    </Block>
  );
}

/**
 * As obras da aula. Para o aluno, cada obra fora da biblioteca leva ao modal
 * de "quero aprender / já aprendi" que o site já tem; para o professor, diz
 * se a obra está na biblioteca do aluno.
 */
function Repertoire({ lesson, role }: { lesson: Lesson; role: Role }) {
  const works = lesson.works ?? [];
  const composers = (lesson.composers ?? []).filter(
    (c) => !works.some((w) => w.composer?.id === c.id)
  );
  const library = useRepertoire(
    role === 'teacher' ? lesson.student.id : undefined,
    works.length > 0
  );
  const openLearning = useLearningModalStore((s) => s.openModal);
  const student = firstName(counterpartOf(lesson, 'teacher').name);

  const where = (workId: string) => {
    const r = library.data;
    if (!r) return null;
    if (r.learned.some((x) => x.work.id === workId)) return 'já aprendeu';
    if (r.wantToLearn.some((x) => x.work.id === workId)) return 'quer aprender';
    if (r.studying.some((x) => x.work.id === workId)) return 'estudando';
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      {works.map((w) => {
        const place = where(w.id);
        return (
          <div key={w.id} className="flex flex-col gap-1.5">
            <WorkCited work={w} />
            {role === 'teacher' ? (
              library.data && (
                <span className="t-legenda">
                  {place
                    ? `Na biblioteca de ${student}: ${place}`
                    : `Fora da biblioteca de ${student}`}
                </span>
              )
            ) : place && place !== 'estudando' ? (
              <span className="t-legenda">
                Na sua biblioteca:{' '}
                {place === 'já aprendeu' ? 'já aprendi' : 'quero aprender'}
              </span>
            ) : (
              <span className="flex flex-wrap gap-x-4 gap-y-1 [&>button]:whitespace-nowrap">
                <Button
                  variante="texto"
                  onClick={() =>
                    openLearning({
                      workId: w.id,
                      workTitle: w.title,
                      composerName: w.composer?.name ?? '',
                      type: 'want-to-learn',
                    })
                  }
                >
                  Quero aprender
                </Button>
                <Button
                  variante="texto"
                  onClick={() =>
                    openLearning({
                      workId: w.id,
                      workTitle: w.title,
                      composerName: w.composer?.name ?? '',
                      type: 'learned',
                    })
                  }
                >
                  Já aprendi
                </Button>
              </span>
            )}
          </div>
        );
      })}
      {composers.map((c) => (
        <span key={c.id} className="flex flex-col">
          <span className="font-display text-lg leading-snug text-texto">
            {c.name}
          </span>
          <span className="t-legenda">Compositor da aula</span>
        </span>
      ))}
    </div>
  );
}

/** As ações da aula, por papel e situação. */
export function LessonActions({
  lesson,
  role,
  open,
  onDone,
}: {
  lesson: Lesson;
  role: Role;
  open: Open;
  /** Depois de cancelar ou avisar (fecha a folha). */
  onDone?: () => void;
}) {
  const state = lessonState(lesson);
  const other = counterpartOf(lesson, role);
  const [cancel, setCancel] = useState(false);
  const [notice, setNotice] = useState<'absence' | 'reschedule' | null>(null);
  const [reason, setReason] = useState('');
  const [series, setSeries] = useState(false);

  const cancelMutation = usePortalMutation(
    () =>
      api.cancelLesson(lesson.id, {
        reason: reason.trim(),
        cancelSeries: series || undefined,
      }),
    {
      success: `Aula cancelada. ${firstName(other.name)} recebeu o aviso.`,
      onSuccess: () => {
        setCancel(false);
        onDone?.();
      },
    }
  );
  const noticeMutation = usePortalMutation(
    (type: 'absence' | 'reschedule') =>
      api.sendStudentNotice(lesson.id, {
        type,
        message: reason.trim() || undefined,
      }),
    {
      success: (_r, type) =>
        type === 'absence'
          ? `${firstName(other.name)} recebeu o aviso. A aula continua marcada até a resposta.`
          : `Pedido enviado. ${firstName(other.name)} responde por aqui.`,
      onSuccess: () => {
        setNotice(null);
        onDone?.();
      },
    }
  );

  const buttons =
    role === 'teacher' ? (
      state === 'pending-outcome' ? (
        <Button
          variante="primario"
          onClick={() => open({ type: 'close', id: lesson.id })}
        >
          Fechar aula
        </Button>
      ) : state === 'scheduled' ? (
        <>
          <Button
            variante="fantasma"
            onClick={() => (setReason(''), setCancel(true))}
          >
            Cancelar aula
          </Button>
          <Button onClick={() => open({ type: 'edit-lesson', id: lesson.id })}>
            Editar
          </Button>
          <Button onClick={() => open({ type: 'reschedule', id: lesson.id })}>
            Remarcar
          </Button>
        </>
      ) : null
    ) : state === 'scheduled' ? (
      <>
        <Button
          variante="fantasma"
          onClick={() => (setReason(''), setNotice('absence'))}
        >
          Avisar que vou faltar
        </Button>
        <Button onClick={() => (setReason(''), setNotice('reschedule'))}>
          Pedir outro horário
        </Button>
      </>
    ) : state === 'completed' && !lesson.studentFeedback ? (
      <Button onClick={() => open({ type: 'feedback', id: lesson.id })}>
        Contar como foi
      </Button>
    ) : null;

  return (
    <>
      {buttons}
      <ConfirmModal
        isOpen={cancel}
        onClose={() => setCancel(false)}
        onConfirm={() => cancelMutation.mutate(undefined)}
        isLoading={cancelMutation.isPending}
        confirmarBloqueado={reason.trim().length < 3}
        type="warning"
        title="Cancelar esta aula?"
        message={`${firstName(other.name)} recebe o aviso com o motivo. A aula fica no histórico como cancelada — aula não se apaga.`}
        confirmText="Cancelar aula"
        cancelText="Voltar"
      >
        <div className="flex flex-col gap-4">
          <Field.Area
            label="Motivo"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
          />
          {lesson.isRecurring && (
            <label className="flex cursor-pointer items-start gap-3 text-sm text-texto-suave">
              <input
                type="checkbox"
                checked={series}
                onChange={(e) => setSeries(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ouro)]"
              />
              Cancelar também as próximas aulas desta série
            </label>
          )}
        </div>
      </ConfirmModal>
      <ConfirmModal
        isOpen={notice !== null}
        onClose={() => setNotice(null)}
        onConfirm={() => {
          if (notice) noticeMutation.mutate(notice);
        }}
        isLoading={noticeMutation.isPending}
        type="question"
        title={
          notice === 'absence'
            ? 'Avisar que você vai faltar?'
            : 'Pedir outro horário?'
        }
        message={
          notice === 'absence'
            ? `${other.name} recebe o aviso e decide se remarca. A aula não muda até lá.`
            : `${other.name} recebe o pedido e propõe um novo horário. A aula continua marcada até lá.`
        }
        confirmText={notice === 'absence' ? 'Avisar' : 'Pedir'}
        cancelText="Voltar"
      >
        <Field.Area
          label="Recado (opcional)"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={2000}
          placeholder={
            notice === 'reschedule'
              ? 'Que dias e horários servem para você?'
              : undefined
          }
        />
      </ConfirmModal>
    </>
  );
}
