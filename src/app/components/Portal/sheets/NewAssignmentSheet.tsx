'use client';

// Nova tarefa — a tarefa nasce de uma aula (a API deriva o aluno dela), então
// a folha pede o aluno e a aula. As obras vêm da aula; o passo a passo vira a
// lista que o aluno marca.

import { useEffect, useMemo, useState } from 'react';
import { PiPlus, PiTrash } from 'react-icons/pi';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  useLessons,
  usePortalMutation,
  useTeacherDashboard,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import {
  addDays,
  dayOf,
  firstName,
  shortDate,
  today,
  toInstant,
} from '../format';
import { TYPE_LABEL } from '../assignment/assignmentText';
import { Options, ScreenLoading } from '../pieces';
import type { SheetProps } from '../PortalProvider';

export default function NewAssignmentSheet({
  request,
  onClose,
  closeAll,
}: SheetProps<{
  type: 'new-assignment';
  studentId?: string;
  lessonId?: string;
}>) {
  const dashboard = useTeacherDashboard();
  const students = dashboard.data?.students ?? [];
  const [studentId, setStudentId] = useState(request.studentId ?? '');
  const [lessonId, setLessonId] = useState(request.lessonId ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<api.AssignmentType>('practice');
  const [priority, setPriority] = useState<api.AssignmentPriority>('medium');
  const [due, setDue] = useState(addDays(today(), 7));
  const [minutes, setMinutes] = useState(20);
  const [steps, setSteps] = useState<string[]>(['']);
  const [works, setWorks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!studentId && students.length === 1)
      setStudentId(students[0].studentId);
  }, [studentId, students]);

  const lessons = useLessons(
    { as: 'teacher', studentId, order: 'desc', limit: 12 },
    Boolean(studentId)
  );
  const options = useMemo(
    () => (lessons.data?.items ?? []).filter((l) => l.status !== 'CANCELLED'),
    [lessons.data]
  );
  const lesson = options.find((l) => l.id === lessonId);

  // A aula mais recente que já aconteceu é a escolha natural.
  useEffect(() => {
    if (!lessonId && options.length) {
      const past = options.find(
        (l) => new Date(l.scheduledAt).getTime() <= Date.now()
      );
      setLessonId((past ?? options[0]).id);
    }
  }, [lessonId, options]);
  useEffect(() => setWorks(new Set(lesson?.worksIds ?? [])), [lesson]);

  const name = firstName(
    students.find((s) => s.studentId === studentId)?.name ?? ''
  );
  const save = usePortalMutation(
    () =>
      api.createAssignment({
        lessonId,
        title: title.trim(),
        description: description.trim() || title.trim(),
        type,
        priority,
        dueDate: toInstant(due, '23:59'),
        estimatedTime: minutes || undefined,
        worksIds: [...works],
        practiceGoals: steps.map((s) => s.trim()).filter(Boolean),
      }),
    { success: `Tarefa passada para ${name}.`, onSuccess: closeAll }
  );

  const valid = Boolean(lessonId) && title.trim().length >= 2 && due > today();

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo="Nova tarefa"
      descricao="O aluno recebe o aviso e vê a tarefa no painel dele."
      largura="m"
      rodape={
        <>
          <Button variante="fantasma" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variante="primario"
            disabled={!valid}
            carregando={save.isPending}
            onClick={() => save.mutate(undefined)}
          >
            Passar tarefa
          </Button>
        </>
      }
    >
      {dashboard.isPending ? (
        <ScreenLoading rows={3} />
      ) : students.length === 0 ? (
        <p className="rounded-controle bg-sup-2 p-4 text-sm text-texto-suave">
          Tarefa se passa para aluno com convite aceito. Convide pela tela de
          Alunos.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field.Selecao
              label="Para"
              value={studentId}
              onChange={(e) => (setStudentId(e.target.value), setLessonId(''))}
            >
              <option value="">Escolha o aluno</option>
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.name}
                </option>
              ))}
            </Field.Selecao>
            <Field.Selecao
              label="Da aula"
              value={lessonId}
              disabled={!studentId || options.length === 0}
              onChange={(e) => setLessonId(e.target.value)}
              ajuda={
                studentId && !lessons.isPending && options.length === 0
                  ? `${name} ainda não tem aula: marque uma antes.`
                  : undefined
              }
            >
              {options.map((l) => (
                <option key={l.id} value={l.id}>
                  {shortDate(dayOf(l.scheduledAt))} · {l.title}
                </option>
              ))}
            </Field.Selecao>
          </div>
          <Field
            label="O que fazer"
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Noturno — compassos 13 a 20 com pedal"
          />
          <Options
            label="Tipo"
            value={type}
            onChange={setType}
            options={(Object.keys(TYPE_LABEL) as api.AssignmentType[]).map(
              (t) => ({ value: t, label: TYPE_LABEL[t] })
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Até"
              type="date"
              min={addDays(today(), 1)}
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
            <Field
              label="Minutos por dia"
              type="number"
              min={5}
              max={600}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </div>
          <Options
            label="Prioridade"
            value={priority}
            onChange={setPriority}
            options={[
              { value: 'low', label: 'Baixa' },
              { value: 'medium', label: 'Média' },
              { value: 'high', label: 'Alta' },
            ]}
          />
          {lesson?.works && lesson.works.length > 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="t-rotulo mb-2 font-medium text-texto">
                Obras da aula
              </legend>
              <div className="flex flex-wrap gap-2">
                {lesson.works.map((w) => (
                  <Chip
                    key={w.id}
                    selecionado={works.has(w.id)}
                    onClick={() =>
                      setWorks((set) => {
                        const next = new Set(set);
                        if (next.has(w.id)) next.delete(w.id);
                        else next.add(w.id);
                        return next;
                      })
                    }
                  >
                    {w.title}
                  </Chip>
                ))}
              </div>
            </fieldset>
          )}
          <Field.Area
            label="Como fazer"
            rows={3}
            value={description}
            maxLength={5000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mãos separadas, metrônomo a 60."
          />
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2 font-medium text-texto">
              Passo a passo
            </legend>
            {steps.map((step, i) => (
              <div key={i} className="flex items-end gap-2">
                <Field
                  label={`Passo ${i + 1}`}
                  rotuloOculto
                  className="flex-1"
                  value={step}
                  maxLength={300}
                  placeholder={`Passo ${i + 1}`}
                  onChange={(e) =>
                    setSteps((list) =>
                      list.map((x, k) => (k === i ? e.target.value : x))
                    )
                  }
                />
                {steps.length > 1 && (
                  <Button
                    variante="fantasma"
                    icone={PiTrash}
                    rotulo={`Tirar o passo ${i + 1}`}
                    onClick={() =>
                      setSteps((list) => list.filter((_, k) => k !== i))
                    }
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSteps((list) => [...list, ''])}
              className="inline-flex min-h-9 w-fit items-center gap-1.5 text-sm font-medium text-ouro-texto"
            >
              <Icon de={PiPlus} tamanho="p" /> Mais um passo
            </button>
          </fieldset>
        </div>
      )}
    </Sheet>
  );
}
