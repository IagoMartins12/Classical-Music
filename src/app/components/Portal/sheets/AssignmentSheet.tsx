'use client';

// A tarefa — quem passou dá retorno (ou lembra o aluno); quem faz marca o
// andamento, anexa a gravação e entrega. A porcentagem é o andamento que o
// aluno marca (o "% de entrega" pedido em 04/10).

import { useEffect, useRef, useState } from 'react';
import { PiMicrophone, PiPencilSimple, PiTrash } from 'react-icons/pi';
import toast from 'react-hot-toast';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import {
  errorText,
  portalKeys,
  useAssignment,
  usePortalMutation,
} from '@/app/hooks/portal/query';
import { useQueryClient } from '@tanstack/react-query';
import * as api from '@/app/requests/portal/api';
import {
  ago,
  dayOf,
  duration,
  firstName,
  longDate,
  shortDate,
  today,
  toInstant,
} from '../format';
import {
  assignmentState,
  priorityLabel,
  typeLabel,
} from '../assignment/assignmentText';
import {
  Avatar,
  Block,
  BulletList,
  ProgressBar,
  Rating,
  ScreenError,
  ScreenLoading,
} from '../pieces';
import type { SheetProps } from '../PortalProvider';

export default function AssignmentSheet({
  request,
  role,
  onClose,
  closeAll,
  open,
}: SheetProps<{ type: 'assignment'; id: string }>) {
  const query = useAssignment(request.id);
  const a = query.data;
  if (query.isPending || query.error || !a)
    return (
      <Sheet aberto aoFechar={onClose} titulo="Tarefa" largura="g">
        {query.isPending ? (
          <ScreenLoading rows={3} />
        ) : (
          <ScreenError
            message={errorText(query.error)}
            onRetry={() => query.refetch()}
          />
        )}
      </Sheet>
    );
  return (
    <Body a={a} role={role} onClose={onClose} closeAll={closeAll} open={open} />
  );
}

function Body({
  a,
  role,
  onClose,
  closeAll,
  open,
}: {
  a: api.Assignment;
  role: api.Role;
  onClose: () => void;
  closeAll: () => void;
  open: SheetProps['open'];
}) {
  const client = useQueryClient();
  const state = assignmentState(a);
  const student = api.nameOf(a.student);
  const teacher = api.nameOf(a.lesson.teacher);
  const [progress, setProgress] = useState(a.progress ?? 0);
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: a.title,
    description: a.description ?? '',
    due: a.dueDate ? dayOf(a.dueDate) : '',
    minutes: a.estimatedTime ?? 0,
  });
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => setProgress(a.progress ?? 0), [a.progress]);

  const saveProgress = usePortalMutation(
    () =>
      api.updateAssignmentProgress(a.id, {
        progress,
        studentNotes: note.trim() || undefined,
      }),
    {
      success: `Andamento salvo: ${progress}%.`,
    }
  );
  const complete = usePortalMutation(
    () =>
      api.completeAssignment(a.id, { studentNotes: note.trim() || undefined }),
    {
      success: `Tarefa entregue. ${firstName(teacher)} vai dar retorno.`,
      onSuccess: closeAll,
    }
  );
  const giveFeedback = usePortalMutation(
    () =>
      api.giveAssignmentFeedback(a.id, { feedback: feedback.trim(), rating }),
    {
      success: `Retorno enviado para ${firstName(student)}.`,
      onSuccess: closeAll,
    }
  );
  const remind = usePortalMutation(
    () =>
      api.sendAnnouncement({
        studentIds: [a.student.id],
        title: `Lembrete: ${a.title}`,
        message: a.dueDate
          ? `A tarefa "${a.title}" vence ${longDate(dayOf(a.dueDate))}. Marque o andamento ou entregue pelo portal.`
          : `Não esqueça da tarefa "${a.title}". Marque o andamento ou entregue pelo portal.`,
      }),
    {
      success: `${firstName(student)} recebeu um lembrete.`,
      invalidate: [['portal', 'notifications']],
    }
  );
  const edit = usePortalMutation(
    () =>
      api.updateAssignment(a.id, {
        title: draft.title.trim(),
        description: draft.description.trim() || draft.title.trim(),
        dueDate: draft.due ? toInstant(draft.due, '23:59') : null,
        estimatedTime: draft.minutes || undefined,
      }),
    {
      success: `Tarefa atualizada. ${firstName(student)} recebeu o aviso.`,
      onSuccess: () => setEditing(false),
    }
  );
  const remove = usePortalMutation(() => api.deleteAssignment(a.id), {
    success: 'Tarefa apagada.',
    onSuccess: closeAll,
  });

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await api.submitAssignmentFile(a.id, file, note);
      toast.success('Gravação enviada.');
      setFile(null);
      await client.invalidateQueries({ queryKey: portalKeys.assignment(a.id) });
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setUploading(false);
    }
  };

  const footer =
    role === 'teacher' ? (
      <>
        <Button
          variante="fantasma"
          icone={PiTrash}
          rotulo="Apagar a tarefa"
          onClick={() => setRemoving(true)}
        />
        {editing ? (
          <>
            <Button variante="fantasma" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button
              variante="primario"
              disabled={draft.title.trim().length < 2}
              carregando={edit.isPending}
              onClick={() => edit.mutate(undefined)}
            >
              Salvar
            </Button>
          </>
        ) : !a.isCompleted ? (
          <Button
            variante="fantasma"
            icone={PiPencilSimple}
            onClick={() => setEditing(true)}
          >
            Editar
          </Button>
        ) : null}
        {editing ? null : state === 'awaiting' ? (
          <Button
            variante="primario"
            disabled={feedback.trim().length < 2}
            carregando={giveFeedback.isPending}
            onClick={() => giveFeedback.mutate(undefined)}
          >
            Enviar retorno
          </Button>
        ) : state === 'open' || state === 'overdue' ? (
          <Button
            carregando={remind.isPending}
            onClick={() => remind.mutate(undefined)}
          >
            Lembrar {firstName(student)}
          </Button>
        ) : null}
      </>
    ) : state === 'open' || state === 'overdue' ? (
      <>
        <Button
          variante="fantasma"
          carregando={saveProgress.isPending}
          onClick={() => saveProgress.mutate(undefined)}
        >
          Salvar andamento
        </Button>
        <Button
          variante="primario"
          carregando={complete.isPending}
          onClick={() => complete.mutate(undefined)}
        >
          Entregar
        </Button>
      </>
    ) : undefined;

  const facts = [
    typeLabel(a.type),
    `prioridade ${priorityLabel(a.priority)}`,
    a.dueDate ? `prazo ${longDate(dayOf(a.dueDate))}` : 'sem prazo',
  ].join(' · ');

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo={a.title}
      descricao={facts}
      largura="g"
      rodape={footer}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <Avatar
              name={role === 'teacher' ? student : teacher}
              image={
                (role === 'teacher' ? a.student : a.lesson.teacher).user.image
              }
            />
            <span className="flex flex-col">
              <span className="font-medium">
                {role === 'teacher' ? student : `Passada por ${teacher}`}
              </span>
              <button
                type="button"
                onClick={() => open({ type: 'lesson', id: a.lesson.id })}
                className="t-legenda w-fit hover:text-ouro-texto"
              >
                Da aula de {shortDate(dayOf(a.lesson.scheduledAt))}
              </button>
            </span>
          </span>
          {state === 'awaiting' ? (
            <Badge estado="ouro">
              {role === 'teacher' ? 'Esperando seu retorno' : 'Entregue'}
            </Badge>
          ) : state === 'overdue' ? (
            <Badge estado="atencao">Atrasada</Badge>
          ) : (
            <span className="t-legenda">
              {state === 'done' ? 'Concluída' : 'Em andamento'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ProgressBar
            value={
              role === 'student' && !a.isCompleted
                ? progress
                : (a.progress ?? (a.isCompleted ? 100 : 0))
            }
            label="Andamento"
            className="flex-1"
          />
          <span className="t-dado w-12 text-right text-sm text-texto-suave">
            {role === 'student' && !a.isCompleted
              ? progress
              : (a.progress ?? (a.isCompleted ? 100 : 0))}
            %
          </span>
        </div>

        {editing ? (
          <div className="flex flex-col gap-4 rounded-card bg-sup-2 p-4">
            <Field
              label="O que fazer"
              value={draft.title}
              maxLength={200}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Até"
                type="date"
                min={today()}
                value={draft.due}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, due: e.target.value }))
                }
              />
              <Field
                label="Minutos por dia"
                type="number"
                min={0}
                max={600}
                step={5}
                value={draft.minutes}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, minutes: Number(e.target.value) }))
                }
              />
            </div>
            <Field.Area
              label="Como fazer"
              rows={3}
              value={draft.description}
              maxLength={5000}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
            />
          </div>
        ) : (
          a.description && (
            <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-texto-suave">
              {a.description}
            </p>
          )
        )}

        {(a.practiceGoals.length > 0 || a.estimatedTime) && (
          <div className="grid gap-8 sm:grid-cols-2">
            {a.practiceGoals.length > 0 && (
              <Block title="Passo a passo">
                <BulletList items={a.practiceGoals} />
              </Block>
            )}
            {a.estimatedTime ? (
              <Block title="Tempo sugerido">
                <span className="t-dado text-texto">
                  {duration(a.estimatedTime)} por dia
                </span>
              </Block>
            ) : null}
          </div>
        )}

        {a.submissions.entries.length > 0 && (
          <Block title="Entregas">
            <ul className="flex flex-col gap-3">
              {a.submissions.entries.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-2 rounded-card bg-sup-2 p-4"
                >
                  {s.url && s.kind === 'audio' && (
                    <audio
                      controls
                      preload="none"
                      src={s.url}
                      className="w-full"
                    />
                  )}
                  {s.url && s.kind === 'video' && (
                    <video
                      controls
                      preload="none"
                      src={s.url}
                      className="w-full rounded-controle"
                    />
                  )}
                  {s.note && (
                    <p className="whitespace-pre-line text-[0.9375rem] text-texto-suave">
                      {s.note}
                    </p>
                  )}
                  <span className="t-legenda">
                    Enviado {ago(s.submittedAt)}
                  </span>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {role === 'student' && !a.isCompleted && (
          <div className="flex flex-col gap-6">
            <label className="flex flex-col gap-3">
              <span className="flex justify-between">
                <span className="t-rotulo font-medium text-texto">
                  Quanto já está pronto
                </span>
                <span className="t-dado text-ouro-texto">{progress}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="accent-[var(--ouro)]"
              />
            </label>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className={cx(
                  'flex flex-col items-center gap-2 rounded-card border border-dashed p-6 text-center text-sm transition-colors',
                  file
                    ? 'border-ouro/60 text-texto'
                    : 'border-linha-forte text-texto-suave hover:border-ouro/60 hover:text-ouro-texto'
                )}
              >
                <Icon de={PiMicrophone} tamanho="g" />
                {file ? file.name : 'Anexar gravação de áudio ou vídeo'}
                <span className="t-legenda">
                  Até 500 MB · seu professor ouve aqui mesmo
                </span>
              </button>
              <input
                ref={fileInput}
                type="file"
                className="sr-only"
                accept="audio/*,video/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <Button
                  className="self-start"
                  carregando={uploading}
                  onClick={upload}
                >
                  Enviar a gravação
                </Button>
              )}
            </div>
            <Field.Area
              label="Recado"
              rows={2}
              value={note}
              maxLength={2000}
              onChange={(e) => setNote(e.target.value)}
              placeholder="O que travou, o que você quer perguntar."
            />
          </div>
        )}

        {a.studentNotes && role === 'teacher' && (
          <Block title={`O que ${firstName(student)} disse`}>
            <p className="whitespace-pre-line text-[0.9375rem] text-texto-suave">
              {a.studentNotes}
            </p>
          </Block>
        )}

        {role === 'teacher' && state === 'awaiting' && (
          <div className="flex flex-col gap-6">
            <Rating
              label="Avaliação"
              value={rating}
              onChange={setRating}
              ends={['Refazer', 'Pronta']}
            />
            <Field.Area
              label="Retorno"
              rows={4}
              value={feedback}
              maxLength={5000}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={`O que ${firstName(student)} deve ouvir na própria gravação.`}
            />
          </div>
        )}

        {a.teacherFeedback && (
          <Block title={`Retorno de ${firstName(teacher)}`}>
            <p className="font-display text-xl leading-snug text-texto">
              &ldquo;{a.teacherFeedback}&rdquo;
            </p>
            {a.teacherRating ? (
              <span
                className="flex gap-1"
                aria-label={`Avaliação ${a.teacherRating} de 5`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={cx(
                      'h-2.5 w-2.5 rounded-full',
                      n <= (a.teacherRating ?? 0)
                        ? 'bg-ouro'
                        : 'border border-linha-forte'
                    )}
                  />
                ))}
              </span>
            ) : null}
          </Block>
        )}
      </div>

      <ConfirmModal
        isOpen={removing}
        onClose={() => setRemoving(false)}
        onConfirm={() => remove.mutate(undefined)}
        isLoading={remove.isPending}
        type="danger"
        title="Apagar esta tarefa?"
        message={`${firstName(student)} deixa de ver a tarefa, e as entregas dela vão junto. Não dá para desfazer.`}
        confirmText="Apagar"
        cancelText="Voltar"
      />
    </Sheet>
  );
}
