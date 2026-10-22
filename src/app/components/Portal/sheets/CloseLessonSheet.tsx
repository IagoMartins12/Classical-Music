'use client';

// Fechar a aula em um minuto — a regra do portal: aula que passou e continua
// agendada aparece em destaque até o professor dar o desfecho. Concluir
// (presente), registrar falta (`studentPresent: false` vira NO_SHOW) ou
// registrar que foi cancelada; e, se quiser, já passar a tarefa.

import { useState } from 'react';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  errorText,
  useLesson,
  usePortalMutation,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import { addDays, firstName, today, toInstant } from '../format';
import { counterpartOf, lessonTitle } from '../lesson/lessonText';
import {
  Options,
  Rating,
  ScreenError,
  ScreenLoading,
  SkillRatings,
} from '../pieces';
import type { SheetProps } from '../PortalProvider';

type Outcome = 'present' | 'absent' | 'cancelled';

export default function CloseLessonSheet({
  request,
  onClose,
  closeAll,
}: SheetProps<{ type: 'close'; id: string }>) {
  const { data: lesson, isPending, error } = useLesson(request.id);
  if (isPending || error || !lesson)
    return (
      <Sheet aberto aoFechar={onClose} titulo="Fechar a aula" largura="m">
        {isPending ? (
          <ScreenLoading rows={3} />
        ) : (
          <ScreenError message={errorText(error)} />
        )}
      </Sheet>
    );
  return <CloseForm lesson={lesson} onClose={onClose} closeAll={closeAll} />;
}

function CloseForm({
  lesson,
  onClose,
  closeAll,
}: {
  lesson: api.Lesson;
  onClose: () => void;
  closeAll: () => void;
}) {
  const student = firstName(counterpartOf(lesson, 'teacher').name);
  const topics = [
    ...lesson.objectives,
    ...(lesson.works ?? []).map((w) => w.title),
  ];

  const [outcome, setOutcome] = useState<Outcome>('present');
  const [punctuality, setPunctuality] = useState<'on_time' | 'late' | 'early'>(
    'on_time'
  );
  const [engagement, setEngagement] = useState(4);
  const [preparation, setPreparation] = useState(3);
  const [worked, setWorked] = useState<Set<string>>(() => new Set(topics));
  const [skills, setSkills] = useState<Partial<Record<api.Skill, number>>>({});
  const [summary, setSummary] = useState('');
  const [nextPrep, setNextPrep] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [reason, setReason] = useState('');
  const [giveTask, setGiveTask] = useState(false);
  const [task, setTask] = useState({
    title: lesson.objectives[0] ?? '',
    description: '',
    due: addDays(today(), 7),
  });

  const toggle = (t: string) =>
    setWorked((s) => {
      const n = new Set(s);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });

  const save = usePortalMutation(
    async () => {
      if (outcome === 'cancelled')
        return api.cancelLesson(lesson.id, { reason: reason.trim() });
      const done = await api.completeLesson(lesson.id, {
        studentPresent: outcome === 'present',
        ...(outcome === 'present'
          ? {
              punctuality,
              engagement,
              preparation,
              skillsWorked: [...worked],
              skillRatings: Object.keys(skills).length ? skills : undefined,
              lessonSummary: summary.trim() || undefined,
              nextLessonPrep: nextPrep.trim() || undefined,
            }
          : {}),
        teacherNotes: privateNote.trim() || undefined,
      });
      if (outcome === 'present' && giveTask && task.title.trim().length >= 2) {
        await api.createAssignment({
          lessonId: lesson.id,
          title: task.title.trim(),
          description: task.description.trim() || task.title.trim(),
          dueDate: toInstant(task.due, '23:59'),
          worksIds: lesson.worksIds,
        });
      }
      return done;
    },
    {
      success:
        outcome === 'present'
          ? `Aula fechada. ${student} recebe o resumo${giveTask ? ' e a tarefa' : ''}.`
          : outcome === 'absent'
            ? `Falta registrada. A presença de ${student} foi atualizada.`
            : 'Aula registrada como cancelada.',
      onSuccess: closeAll,
    }
  );

  const head = lessonTitle(lesson);
  const invalid =
    (outcome === 'cancelled' && reason.trim().length < 3) ||
    (outcome === 'present' && giveTask && task.title.trim().length < 2);

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo={`Fechar a aula de ${student}`}
      descricao={`${head.subtitle} · ${lesson.title}`}
      largura="g"
      rodape={
        <>
          <Button variante="fantasma" onClick={onClose}>
            Depois
          </Button>
          <Button
            variante="primario"
            carregando={save.isPending}
            disabled={invalid}
            onClick={() => save.mutate(undefined)}
          >
            {outcome === 'present'
              ? 'Concluir aula'
              : outcome === 'absent'
                ? 'Registrar falta'
                : 'Registrar cancelamento'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <Options
          label="Aconteceu?"
          value={outcome}
          onChange={setOutcome}
          options={[
            { value: 'present', label: `${student} veio` },
            { value: 'absent', label: 'Faltou' },
            { value: 'cancelled', label: 'Foi cancelada' },
          ]}
        />
        {outcome === 'cancelled' && (
          <Field.Area
            label="Motivo"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
          />
        )}
        {outcome === 'present' && (
          <>
            <Options
              label="Chegou"
              value={punctuality}
              onChange={setPunctuality}
              options={[
                { value: 'on_time', label: 'No horário' },
                { value: 'late', label: 'Atrasado' },
                { value: 'early', label: 'Adiantado' },
              ]}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Rating
                label="Engajamento"
                value={engagement}
                onChange={setEngagement}
                ends={['Disperso', 'Inteiro']}
              />
              <Rating
                label="Preparo"
                value={preparation}
                onChange={setPreparation}
                ends={['Não estudou', 'Pronto']}
              />
            </div>
            {topics.length > 0 && (
              <fieldset className="flex flex-col gap-2">
                <legend className="t-rotulo mb-2 font-medium text-texto">
                  O que vocês trabalharam
                </legend>
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <Chip
                      key={t}
                      selecionado={worked.has(t)}
                      onClick={() => toggle(t)}
                    >
                      {t}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            )}
            <SkillRatings value={skills} onChange={setSkills} />
            <Field.Area
              label="Resumo para o aluno"
              ajuda={`${student} lê isto no painel.`}
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="O que melhorou, o que ainda pede atenção."
            />
            <Field.Area
              label="Para a próxima aula"
              ajuda="Aparece para os dois antes da próxima aula."
              rows={2}
              value={nextPrep}
              onChange={(e) => setNextPrep(e.target.value)}
              placeholder="O que trazer, o que ter estudado."
            />
          </>
        )}
        {outcome !== 'cancelled' && (
          <Field.Area
            label="Nota só sua"
            rows={2}
            value={privateNote}
            onChange={(e) => setPrivateNote(e.target.value)}
            ajuda="Não aparece para o aluno nem na exportação dos dados dele."
          />
        )}
        {outcome === 'present' && (
          <div className="flex flex-col gap-4 rounded-controle bg-sup-2 p-4">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <span className="t-rotulo font-medium text-texto">
                Passar tarefa
              </span>
              <input
                type="checkbox"
                checked={giveTask}
                onChange={(e) => setGiveTask(e.target.checked)}
                className="h-5 w-5 accent-[var(--ouro)]"
              />
            </label>
            {giveTask && (
              <>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_170px]">
                  <Field
                    label="Tarefa"
                    value={task.title}
                    onChange={(e) =>
                      setTask((t) => ({ ...t, title: e.target.value }))
                    }
                    maxLength={200}
                  />
                  <Field
                    label="Até"
                    type="date"
                    min={addDays(today(), 1)}
                    value={task.due}
                    onChange={(e) =>
                      setTask((t) => ({ ...t, due: e.target.value }))
                    }
                  />
                </div>
                <Field.Area
                  label="Como fazer"
                  rows={2}
                  value={task.description}
                  onChange={(e) =>
                    setTask((t) => ({ ...t, description: e.target.value }))
                  }
                  placeholder="Mãos separadas, metrônomo a 60."
                />
              </>
            )}
          </div>
        )}
      </div>
    </Sheet>
  );
}
