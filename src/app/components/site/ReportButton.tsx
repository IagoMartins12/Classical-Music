'use client';

import { useState } from 'react';
import { PiFlag } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/Button';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { COMMON } from '@/app/conteudo/site/common';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { reportContent } from '@/app/requests/moderation';
import { useLoginModal } from '@/app/stores/authStore';

/**
 * "Reportar", visible next to Share on the composer and work pages. Same
 * reasons and endpoint as the moderation flow; "Other" requires details.
 * Visitors sign in first: a report carries the name of who sent it.
 */
export function ReportButton({
  entityType,
  entityId,
  name,
}: {
  entityType: 'composer' | 'work' | 'score';
  entityId: string;
  name: string;
}) {
  const copy = COMMON[useRouteLanguage().language].report;
  const { isAuthenticated } = useAuth();
  const { open: openLogin } = useLoginModal();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const needsDetails = reason === 'other';
  const ready = !!reason && (!needsDetails || details.trim().length > 0);

  const close = () => {
    setOpen(false);
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
    <>
      <Button
        icone={PiFlag}
        onClick={() => (isAuthenticated ? setOpen(true) : openLogin())}
      >
        {copy.action}
      </Button>
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
    </>
  );
}
