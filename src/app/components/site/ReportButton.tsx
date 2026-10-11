'use client';

import { useSignInGate } from '@/app/hooks/useSignInGate';
import { useState } from 'react';
import { PiFlag } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/Button';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { COMMON } from '@/app/conteudo/site/common';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { reportContent } from '@/app/requests/moderation';

type Target = {
  entityType: 'composer' | 'work' | 'score' | 'annotation';
  entityId: string;
  name: string;
};

/**
 * "Reportar" as a button that opens the report sheet. Visitors sign in
 * first: a report carries the name of who sent it.
 */
export function ReportButton(target: Target) {
  const copy = COMMON[useRouteLanguage().language].report;
  const allowed = useSignInGate();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icone={PiFlag} onClick={() => allowed('report') && setOpen(true)}>
        {copy.action}
      </Button>
      <ReportSheet {...target} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/**
 * The report itself. Same reasons and endpoint as the moderation flow;
 * "Other" requires details. Opened by `ReportButton` or the "More" menu.
 */
export function ReportSheet({
  entityType,
  entityId,
  name,
  open,
  onClose,
}: Target & { open: boolean; onClose: () => void }) {
  const copy = COMMON[useRouteLanguage().language].report;
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const needsDetails = reason === 'other';
  const ready = !!reason && (!needsDetails || details.trim().length > 0);

  const close = () => {
    onClose();
    setReason(null);
    setDetails('');
  };

  const send = async () => {
    if (!reason) return;
    setSending(true);
    const result = await reportContent({
      entityType,
      entityId,
      reason,
      description: details,
    });
    setSending(false);
    if (result.ok) {
      toast.success(copy.sent);
      close();
    } else {
      toast.error(copy.failed);
    }
  };

  return (
    <Sheet
      aberto={open}
      aoFechar={close}
      titulo={copy.title(name)}
      descricao={copy.intro}
      largura="p"
      rodape={
        <div className="flex justify-end gap-2">
          <Button variante="fantasma" onClick={close}>
            {copy.cancel}
          </Button>
          <Button
            variante="primario"
            disabled={!ready || sending}
            onClick={send}
          >
            {copy.send}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="t-rotulo mb-2">{copy.question}</legend>
          {Object.entries(copy.reasons).map(([key, [label, hint]]) => (
            <label
              key={key}
              className={cx(
                'flex min-h-[var(--alvo)] cursor-pointer items-center gap-3 rounded-controle px-3 py-2',
                reason === key ? 'tint-ouro text-ouro-na-tinta' : 'bg-sup-2'
              )}
            >
              <input
                type="radio"
                name="report-reason"
                checked={reason === key}
                onChange={() => setReason(key)}
                className="accent-[var(--ouro)]"
              />
              <span className="flex flex-col">
                <span className="t-rotulo">{label}</span>
                <span className="t-legenda">{hint}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <label className="flex flex-col gap-1.5">
          <span className="t-rotulo">
            {copy.details}{' '}
            <span className="text-texto-fraco">
              {needsDetails ? copy.required : copy.optional}
            </span>
          </span>
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            rows={3}
            maxLength={1000}
            className="input-classical w-full rounded-controle px-4 py-3 text-base"
            placeholder={copy.placeholder}
          />
        </label>
        <p className="t-legenda">{copy.warning}</p>
      </div>
    </Sheet>
  );
}
