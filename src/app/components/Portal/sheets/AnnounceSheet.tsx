'use client';

// Enviar aviso — o professor escolhe para quem e por onde; a preferência de
// cada aluno decide se o e-mail sai de fato (quem desligou o e-mail daquele
// tipo de aviso recebe só no portal). SMS ainda não tem envio: aparece como
// "em breve", sem fingir.

import { useMemo, useState } from 'react';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  usePortalMutation,
  useTeacherDashboard,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import { addDays, plural, toInstant, today } from '../format';
import { ScreenLoading } from '../pieces';
import type { SheetProps } from '../PortalProvider';

export default function AnnounceSheet({
  request,
  onClose,
  closeAll,
}: SheetProps<{ type: 'announce'; studentIds?: string[] }>) {
  const dashboard = useTeacherDashboard();
  const students = useMemo(
    () => dashboard.data?.students ?? [],
    [dashboard.data]
  );
  const [chosen, setChosen] = useState<Set<string>>(
    () => new Set(request.studentIds ?? [])
  );
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(true);
  const [later, setLater] = useState(false);
  const [when, setWhen] = useState({ day: addDays(today(), 1), time: '08:00' });

  const all =
    students.length > 0 && students.every((s) => chosen.has(s.studentId));
  const toggle = (id: string) =>
    setChosen((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const send = usePortalMutation(
    () =>
      api.sendAnnouncement({
        studentIds: [...chosen],
        title: title.trim(),
        message: message.trim(),
        channels: { email },
        sendAt: later ? toInstant(when.day, when.time) : undefined,
      }),
    {
      success: (r) =>
        r.scheduledFor
          ? `Aviso agendado para ${r.delivered} ${plural(r.delivered, 'aluno', 'alunos')}.`
          : `Aviso enviado para ${r.delivered} ${plural(r.delivered, 'aluno', 'alunos')}.`,
      invalidate: [['portal', 'notifications']],
      onSuccess: closeAll,
    }
  );

  const valid =
    chosen.size > 0 && title.trim().length >= 2 && message.trim().length >= 2;

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo="Enviar aviso"
      descricao="Chega no portal de cada aluno. O e-mail sai só para quem aceita esse tipo de aviso."
      largura="m"
      rodape={
        <>
          <Button variante="fantasma" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variante="primario"
            disabled={!valid}
            carregando={send.isPending}
            onClick={() => send.mutate(undefined)}
          >
            {later ? 'Agendar' : 'Enviar'}
          </Button>
        </>
      }
    >
      {dashboard.isPending ? (
        <ScreenLoading rows={3} />
      ) : (
        <div className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2 flex w-full items-center justify-between font-medium text-texto">
              Para quem
              {students.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setChosen(
                      all
                        ? new Set()
                        : new Set(students.map((s) => s.studentId))
                    )
                  }
                  className="text-sm font-medium text-ouro-texto"
                >
                  {all ? 'Nenhum' : 'Todos'}
                </button>
              )}
            </legend>
            {students.length === 0 ? (
              <p className="text-sm text-texto-fraco">
                Nenhum aluno com convite aceito.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {students.map((s) => (
                  <Chip
                    key={s.studentId}
                    selecionado={chosen.has(s.studentId)}
                    onClick={() => toggle(s.studentId)}
                  >
                    {s.name}
                  </Chip>
                ))}
              </div>
            )}
          </fieldset>
          <Field
            label="Assunto"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Field.Area
            label="Mensagem"
            rows={4}
            value={message}
            maxLength={2000}
            onChange={(e) => setMessage(e.target.value)}
          />
          <fieldset className="flex flex-col gap-3 rounded-controle bg-sup-2 p-4">
            <legend className="sr-only">Por onde</legend>
            <label className="flex cursor-pointer items-center justify-between gap-4 text-[0.9375rem]">
              <span className="flex flex-col">
                <span className="font-medium text-texto">
                  Também por e-mail
                </span>
                <span className="t-legenda">
                  Respeita a escolha de cada aluno e o horário de silêncio dele.
                </span>
              </span>
              <input
                type="checkbox"
                checked={email}
                onChange={(e) => setEmail(e.target.checked)}
                className="h-5 w-5 accent-[var(--ouro)]"
              />
            </label>
            <span className="flex items-center justify-between gap-4 text-[0.9375rem] text-texto-fraco">
              <span>Por SMS</span>
              <span className="t-legenda">Em breve</span>
            </span>
          </fieldset>
          <label className="flex cursor-pointer items-center gap-3 text-[0.9375rem] text-texto-suave">
            <input
              type="checkbox"
              checked={later}
              onChange={(e) => setLater(e.target.checked)}
              className="h-5 w-5 accent-[var(--ouro)]"
            />
            Agendar o envio
          </label>
          {later && (
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Dia"
                type="date"
                min={today()}
                value={when.day}
                onChange={(e) =>
                  setWhen((w) => ({ ...w, day: e.target.value }))
                }
              />
              <Field
                label="Hora"
                type="time"
                step={900}
                value={when.time}
                onChange={(e) =>
                  setWhen((w) => ({ ...w, time: e.target.value }))
                }
              />
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
