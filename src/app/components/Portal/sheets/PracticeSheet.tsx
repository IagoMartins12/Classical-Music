'use client';

// Diário de prática — o aluno diz quanto estudou (ou usa o cronômetro) e o
// quê: uma obra do próprio repertório ou um assunto. Os professores veem a
// semana antes da aula.

import { useEffect, useMemo, useState } from 'react';
import { PiPause, PiPlay } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  portalKeys,
  usePortalMutation,
  useRepertoire,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import { addDays, duration, today, toInstant } from '../format';
import { Options } from '../pieces';
import type { SheetProps } from '../PortalProvider';

const TOPICS = ['Escalas', 'Técnica', 'Leitura', 'Teoria'];

export default function PracticeSheet({ onClose, closeAll }: SheetProps) {
  const repertoire = useRepertoire();
  const [minutes, setMinutes] = useState(30);
  const [what, setWhat] = useState<string>('');
  const [note, setNote] = useState('');
  const [day, setDay] = useState(today());
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

  const total = seconds >= 60 ? Math.round(seconds / 60) : minutes;
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
          disabled={!what}
          onClick={() => (setRunning(false), save.mutate(undefined))}
        >
          Salvar {duration(total)}
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
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
        {seconds < 60 && (
          <Options
            label="Ou diga quanto tempo"
            value={minutes}
            onChange={setMinutes}
            options={[15, 30, 45, 60, 90, 120].map((m) => ({
              value: m,
              label: duration(m),
            }))}
          />
        )}
        <Options
          label="O que estudou"
          value={what}
          onChange={setWhat}
          options={[
            ...works.map((w) => ({ value: `work:${w.id}`, label: w.title })),
            ...TOPICS.map((t) => ({ value: `topic:${t}`, label: t })),
          ]}
        />
        <Options
          label="Quando"
          value={day}
          onChange={setDay}
          options={[
            { value: today(), label: 'Hoje' },
            { value: addDays(today(), -1), label: 'Ontem' },
          ]}
        />
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
