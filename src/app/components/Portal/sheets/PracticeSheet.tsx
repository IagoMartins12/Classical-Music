'use client';

// Diário de prática — o aluno diz quanto estudou (ou usa o cronômetro) e o
// quê: uma obra do próprio repertório ou um assunto. Os professores veem a
// semana antes da aula.

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { PiPause, PiPlay } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import SimpleWorkSearchInput from '@/app/components/SimpleWorkSearchInput';
import {
  portalKeys,
  usePortalMutation,
  useRepertoire,
} from '@/app/hooks/portal/query';
import { listWorks } from '@/app/requests/catalog-lists';
import * as api from '@/app/requests/portal/api';
import { addDays, duration, today, toInstant } from '../format';
import { Options } from '../pieces';
import type { SheetProps } from '../PortalProvider';

const TOPICS = ['Escalas', 'Técnica', 'Leitura', 'Teoria'];
/** The chips that open a picker instead of choosing a value. */
const SEARCH = 'search';
const OTHER_DAY = 'other';
type Mode = 'timer' | 'manual';

export default function PracticeSheet({ onClose, closeAll }: SheetProps) {
  const repertoire = useRepertoire();
  const [minutes, setMinutes] = useState(30);
  const [what, setWhat] = useState<string>('');
  const [note, setNote] = useState('');
  const [day, setDay] = useState(today());
  // One way to say how long: the stopwatch or the typed time, never both.
  const [mode, setMode] = useState<Mode>('manual');
  const [searching, setSearching] = useState(false);
  // Works picked by search: they join the chips and stay chosen.
  const [picked, setPicked] = useState<{ id: string; title: string }[]>([]);
  const [otherDay, setOtherDay] = useState(false);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  // O que está estudando primeiro, depois o que quer aprender; até seis.
  const works = useMemo(() => {
    const r = repertoire.data;
    if (!r) return [];
    const seen = new Set<string>();
    return [
      ...r.studying.map((s) => s.work),
      ...r.wantToLearn.map((w) => w.work),
    ]
      .filter((w) => !seen.has(w.id) && seen.add(w.id))
      .slice(0, 6);
  }, [repertoire.data]);

  useEffect(() => {
    if (!what) setWhat(works[0] ? `work:${works[0].id}` : `topic:${TOPICS[0]}`);
  }, [what, works]);

  // The search box opens on suggestions: the works the teacher put in the
  // lessons, then the ones the student wants to learn; with neither, the
  // most popular works of the catalog.
  const own = useMemo(() => {
    const r = repertoire.data;
    if (!r) return [];
    const seen = new Set<string>();
    return [
      ...r.studying
        .filter((s) => s.lessonId || s.assignmentId)
        .map((s) => s.work),
      ...r.wantToLearn.map((w) => w.work),
    ]
      .filter((w) => !seen.has(w.id) && seen.add(w.id))
      .map((w) => ({
        id: w.id,
        title: w.title,
        composer: {
          id: w.composer?.id,
          name: w.composer?.name ?? '',
          fullName: w.composer?.fullName ?? w.composer?.name ?? '',
        },
      }));
  }, [repertoire.data]);
  const popular = useQuery({
    queryKey: ['practice', 'popular-works'],
    queryFn: () => listWorks({ page: 1, sort: 'featured' }),
    enabled: searching && !repertoire.isLoading && own.length === 0,
    staleTime: 60 * 60_000,
  });
  const suggestions = useMemo(
    () =>
      own.length
        ? own
        : (popular.data?.works ?? []).slice(0, 8).map((w) => ({
            id: w.id,
            title: w.title,
            composer: {
              id: w.composer.id,
              name: w.composer.name,
              fullName: w.composer.fullName ?? w.composer.name,
            },
          })),
    [own, popular.data]
  );

  const total =
    mode === 'timer' ? Math.max(1, Math.round(seconds / 60)) : minutes;
  const save = usePortalMutation(
    () =>
      api.logPractice({
        minutes: Math.min(600, total),
        // Prática de hoje fica com a hora de agora; de ontem, ao meio-dia.
        practicedAt:
          day === today() ? new Date().toISOString() : toInstant(day, '12:00'),
        ...(what.startsWith('work:')
          ? { workId: what.slice(5) }
          : { topic: what.slice(6) }),
        note: note.trim() || undefined,
      }),
    {
      success: `${duration(total)} de prática registrados. Seus professores veem antes da aula.`,
      invalidate: [['portal', 'practice'], portalKeys.dashboard('student')],
      onSuccess: closeAll,
    }
  );

  const timer = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo="Registrar prática"
      descricao="Seus professores veem a semana de estudo antes da aula."
      largura="p"
      rodape={
        <Button
          variante="primario"
          carregando={save.isPending}
          disabled={!what || (mode === 'timer' && seconds === 0)}
          onClick={() => (setRunning(false), save.mutate(undefined))}
        >
          Salvar {duration(total)}
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <Options<Mode>
          label="Quanto tempo"
          value={mode}
          onChange={(m) => {
            setMode(m);
            if (m === 'manual') setRunning(false);
          }}
          options={[
            { value: 'manual', label: 'Informar o tempo' },
            { value: 'timer', label: 'Cronômetro' },
          ]}
        />
        {mode === 'timer' ? (
          <div className="flex items-center justify-between gap-4 rounded-card bg-sup-2 p-4">
            <span className="flex flex-col">
              <span className="t-legenda">Cronômetro</span>
              <span className="t-dado text-3xl text-texto" aria-live="off">
                {timer}
              </span>
            </span>
            <Button
              variante={running ? 'secundario' : 'primario'}
              icone={running ? PiPause : PiPlay}
              onClick={() => setRunning((r) => !r)}
            >
              {running ? 'Pausar' : seconds ? 'Continuar' : 'Começar'}
            </Button>
          </div>
        ) : (
          <Options
            label="Quanto você praticou"
            value={minutes}
            onChange={setMinutes}
            options={[15, 30, 45, 60, 90, 120].map((m) => ({
              value: m,
              label: duration(m),
            }))}
          />
        )}
        <div className="flex flex-col gap-3">
          <Options
            label="O que estudou"
            value={searching ? SEARCH : what}
            onChange={(v) => {
              if (v === SEARCH) setSearching(true);
              else {
                setSearching(false);
                setWhat(v);
              }
            }}
            options={[
              ...works.map((w) => ({ value: `work:${w.id}`, label: w.title })),
              ...picked
                .filter((p) => !works.some((w) => w.id === p.id))
                .map((p) => ({ value: `work:${p.id}`, label: p.title })),
              ...TOPICS.map((t) => ({ value: `topic:${t}`, label: t })),
              { value: SEARCH, label: 'Outra obra…' },
            ]}
          />
          {searching && (
            <SimpleWorkSearchInput
              selectedWork=""
              userSuggestions={suggestions}
              loadingUserSuggestions={popular.isLoading}
              placeholder="Buscar obra ou compositor"
              onWorkSelect={(id, data) => {
                if (!id) return;
                const title = (data as { title?: string } | null)?.title ?? id;
                setPicked((p) =>
                  p.some((x) => x.id === id) ? p : [...p, { id, title }]
                );
                setWhat(`work:${id}`);
                setSearching(false);
              }}
            />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <Options
            label="Quando"
            value={otherDay ? OTHER_DAY : day}
            onChange={(v) => {
              if (v === OTHER_DAY) setOtherDay(true);
              else {
                setOtherDay(false);
                setDay(v);
              }
            }}
            options={[
              { value: today(), label: 'Hoje' },
              { value: addDays(today(), -1), label: 'Ontem' },
              { value: OTHER_DAY, label: 'Outra data…' },
            ]}
          />
          {otherDay && (
            <Field
              label="Dia da prática"
              type="date"
              value={day}
              max={today()}
              onChange={(e) => e.target.value && setDay(e.target.value)}
            />
          )}
        </div>
        <Field.Area
          label="Como foi"
          rows={2}
          value={note}
          maxLength={500}
          onChange={(e) => setNote(e.target.value)}
          placeholder="O que travou, o que saiu."
        />
      </div>
    </Sheet>
  );
}
