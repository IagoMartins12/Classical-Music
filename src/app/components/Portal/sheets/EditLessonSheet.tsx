'use client';

// Editar a aula — o conteúdo (assunto, lugar, objetivos, repertório com a
// partitura, preparação, notas). Data, hora e duração mudam pelo "Remarcar",
// que passa pela verificação de agenda. Só aula ainda agendada se edita.

import { useState } from 'react';
import { PiTrash } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { CampoDeFichas } from '@/app/components/ui/CampoDeFichas';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  errorText,
  portalKeys,
  useLesson,
  usePortalMutation,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import { firstName } from '../format';
import { counterpartOf, lessonTitle } from '../lesson/lessonText';
import { WorkPicker, type PickedWork } from '../catalog/WorkPicker';
import { ScorePick } from '../catalog/ScorePick';
import { ScreenError, ScreenLoading, WorkCited } from '../pieces';
import type { SheetProps } from '../PortalProvider';

export default function EditLessonSheet({
  request,
  onClose,
}: SheetProps<{ type: 'edit-lesson'; id: string }>) {
  const lesson = useLesson(request.id);
  if (lesson.isPending || lesson.error || !lesson.data)
    return (
      <Sheet aberto aoFechar={onClose} titulo="Editar aula" largura="g">
        {lesson.isPending ? (
          <ScreenLoading rows={3} />
        ) : (
          <ScreenError
            message={errorText(lesson.error)}
            onRetry={() => lesson.refetch()}
          />
        )}
      </Sheet>
    );
  return <Form lesson={lesson.data} onClose={onClose} />;
}

function Form({
  lesson,
  onClose,
}: {
  lesson: api.Lesson;
  onClose: () => void;
}) {
  const student = firstName(counterpartOf(lesson, 'teacher').name);
  const scoreOf = (workId: string) => {
    const s = (lesson.workScores ?? []).find((x) => x.work?.id === workId);
    return s
      ? {
          id: s.id,
          title: s.title,
          source: s.source as 'IMSLP',
          type: s.type,
          downloadUrl: s.downloadUrl,
        }
      : null;
  };
  const [title, setTitle] = useState(lesson.title);
  const [location, setLocation] = useState(lesson.location ?? '');
  const [description, setDescription] = useState(lesson.description ?? '');
  const [objectives, setObjectives] = useState(lesson.objectives);
  const [topics, setTopics] = useState(lesson.topics);
  const [techniques, setTechniques] = useState(lesson.techniques);
  const [works, setWorks] = useState<PickedWork[]>(() =>
    (lesson.works ?? []).map((w) => ({
      work: {
        id: w.id,
        title: w.title,
        composer: {
          id: w.composer?.id ?? '',
          name: w.composer?.fullName?.trim() || w.composer?.name || '',
        },
      },
      score: scoreOf(w.id),
    }))
  );
  const [composers, setComposers] = useState(() =>
    (lesson.composers ?? []).map((c) => ({ id: c.id, name: c.name }))
  );
  const [prep, setPrep] = useState(lesson.publicNotes ?? '');
  const [homework, setHomework] = useState(lesson.homework ?? '');
  const [privateNote, setPrivateNote] = useState(lesson.teacherNotes ?? '');

  const save = usePortalMutation(
    () =>
      api.updateLesson(lesson.id, {
        title: title.trim() || 'Aula',
        location: location.trim() || undefined,
        description: description.trim(),
        objectives,
        topics,
        techniques,
        worksIds: works.map((w) => w.work.id),
        workScoreIds: works.flatMap((w) => (w.score ? [w.score.id] : [])),
        composerIds: [
          ...new Set([
            ...composers.map((c) => c.id),
            ...works.map((w) => w.work.composer.id).filter(Boolean),
          ]),
        ],
        publicNotes: prep.trim(),
        homework: homework.trim(),
        teacherNotes: privateNote.trim(),
      }),
    {
      success: `Aula atualizada. ${student} recebeu o aviso.`,
      invalidate: [
        portalKeys.lesson(lesson.id),
        ['portal', 'lessons'],
        ['portal', 'calendar'],
        ['portal', 'dashboard'],
      ],
      onSuccess: onClose,
    }
  );

  const pick = (p: PickedWork) =>
    setWorks((l) => (l.some((w) => w.work.id === p.work.id) ? l : [...l, p]));

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo="Editar aula"
      descricao={`${lessonTitle(lesson).subtitle} · com ${student}. Para mudar dia, hora ou duração, use Remarcar.`}
      largura="g"
      rodape={
        <>
          <Button variante="fantasma" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variante="primario"
            carregando={save.isPending}
            onClick={() => save.mutate(undefined)}
          >
            Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Assunto"
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Field
            label="Onde"
            value={location}
            maxLength={300}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Estúdio, Online — link, endereço"
          />
        </div>
        <CampoDeFichas
          rotulo="Objetivos"
          valores={objectives}
          aoMudar={setObjectives}
          ajuda={`Enter ou vírgula para acrescentar. ${student} vê.`}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <CampoDeFichas
            rotulo="Tópicos"
            valores={topics}
            aoMudar={setTopics}
          />
          <CampoDeFichas
            rotulo="Técnicas"
            valores={techniques}
            aoMudar={setTechniques}
          />
        </div>

        <section className="flex flex-col gap-4">
          <h3 className="t-rotulo font-medium text-texto">Repertório</h3>
          {works.length > 0 && (
            <ul className="flex flex-col">
              {works.map((w) => (
                <li
                  key={w.work.id}
                  className="flex items-start justify-between gap-3 border-b border-linha py-4 last:border-0"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-3">
                    <WorkCited work={w.work} />
                    <ScorePick
                      work={w.work}
                      score={w.score}
                      onChange={(score) =>
                        setWorks((l) =>
                          l.map((x) =>
                            x.work.id === w.work.id ? { ...x, score } : x
                          )
                        )
                      }
                    />
                  </span>
                  <Button
                    variante="fantasma"
                    icone={PiTrash}
                    rotulo={`Tirar ${w.work.title}`}
                    onClick={() =>
                      setWorks((l) => l.filter((x) => x.work.id !== w.work.id))
                    }
                  />
                </li>
              ))}
            </ul>
          )}
          {composers.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="t-legenda">Compositores da aula</span>
              {composers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    setComposers((l) => l.filter((x) => x.id !== c.id))
                  }
                  aria-label={`Tirar ${c.name}`}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full bg-sup-2 px-3.5 font-display text-[0.9375rem]"
                >
                  {c.name}{' '}
                  <Icon
                    de={PiTrash}
                    tamanho="pp"
                    className="text-texto-fraco"
                  />
                </button>
              ))}
            </div>
          )}
          <div className="rounded-card bg-sup-2 p-4">
            <WorkPicker
              onPick={pick}
              onPickComposer={(c) =>
                setComposers((l) =>
                  l.some((x) => x.id === c.id) ? l : [...l, c]
                )
              }
              selectedIds={works.map((w) => w.work.id)}
            />
          </div>
        </section>

        <Field.Area
          label="Sobre a aula"
          rows={2}
          value={description}
          maxLength={2000}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Field.Area
          label={`Para ${student} ler antes`}
          rows={2}
          value={prep}
          maxLength={5000}
          onChange={(e) => setPrep(e.target.value)}
        />
        <Field.Area
          label="Tarefa de casa"
          rows={2}
          value={homework}
          maxLength={5000}
          onChange={(e) => setHomework(e.target.value)}
        />
        <Field.Area
          label="Nota só sua"
          rows={2}
          value={privateNote}
          maxLength={5000}
          onChange={(e) => setPrivateNote(e.target.value)}
          ajuda="Não aparece para o aluno."
        />
      </div>
    </Sheet>
  );
}
