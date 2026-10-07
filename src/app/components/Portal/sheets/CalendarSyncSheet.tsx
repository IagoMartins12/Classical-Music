'use client';

// No celular e no computador — como a agenda do blog, mas pessoal (04/10):
// assinar (o calendário do aparelho busca as aulas sozinho, com as
// remarcações e cancelamentos) ou baixar um arquivo `.ics` com o período.
//
// O link de assinatura é um segredo: só aparece quando é gerado. Quem o
// perdeu gera outro, e o anterior para de funcionar.

import { useState } from 'react';
import { PiCopy, PiDownloadSimple, PiGoogleLogo } from 'react-icons/pi';
import toast from 'react-hot-toast';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  errorText,
  portalKeys,
  useCalendarFeed,
  usePortalMutation,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import { addDays, ago, startOfDay, today } from '../format';
import { Block, Options } from '../pieces';
import type { SheetProps } from '../PortalProvider';

export default function CalendarSyncSheet({ onClose }: SheetProps) {
  const feed = useCalendarFeed();
  const [link, setLink] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [months, setMonths] = useState(3);
  const [downloading, setDownloading] = useState(false);

  const rotate = usePortalMutation(() => api.rotateCalendarFeed(), {
    invalidate: [portalKeys.feed],
    onSuccess: (r) => setLink(`${window.location.origin}${r.path}`),
  });
  const revoke = usePortalMutation(() => api.revokeCalendarFeed(), {
    success:
      'Assinatura desligada. O calendário do aparelho para de receber as aulas.',
    invalidate: [portalKeys.feed],
    onSuccess: () => (setLink(null), setRevoking(false)),
  });

  const webcal = link?.replace(/^https?:/, 'webcal:');
  const google = webcal
    ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`
    : null;

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copiado.');
    } catch {
      toast.error('Não deu para copiar. Selecione o link e copie.');
    }
  };

  const download = async () => {
    setDownloading(true);
    try {
      await api.downloadIcs({
        from: startOfDay(today()).toISOString(),
        to: startOfDay(addDays(today(), months * 30)).toISOString(),
      });
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setDownloading(false);
    }
  };

  const active = feed.data?.active;

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo="No seu calendário"
      descricao="Assine para as aulas aparecerem sozinhas no calendário do celular ou do computador — com as remarcações e cancelamentos. Ou baixe um arquivo com o período."
      largura="m"
    >
      <div className="flex flex-col gap-8">
        <Block title="Assinar">
          {link ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-texto-suave">
                Este link mostra suas aulas a quem o tiver. Ele só aparece
                agora; guarde-o no calendário e não compartilhe.
              </p>
              <input
                readOnly
                value={link}
                aria-label="Link de assinatura"
                onFocus={(e) => e.currentTarget.select()}
                className="input-classical t-dado w-full text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <a href={webcal} className={classesDeBotao('primario', 'm')}>
                  Abrir no calendário do aparelho
                </a>
                {google && (
                  <a
                    href={google}
                    target="_blank"
                    rel="noreferrer"
                    className={classesDeBotao('secundario', 'm')}
                  >
                    <Icon de={PiGoogleLogo} tamanho="p" /> Google Agenda
                  </a>
                )}
                <Button variante="fantasma" icone={PiCopy} onClick={copy}>
                  Copiar link
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-texto-suave">
                {active
                  ? `A assinatura está ligada${feed.data?.lastUsedAt ? ` — o calendário buscou as aulas ${ago(feed.data.lastUsedAt)}` : ''}. Para ver o link de novo, gere outro: o anterior para de funcionar.`
                  : 'Gera um link só seu, que o Google Agenda, o Calendário da Apple e o Outlook sabem assinar.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variante="primario"
                  carregando={rotate.isPending}
                  onClick={() => rotate.mutate(undefined)}
                >
                  {active ? 'Gerar novo link' : 'Gerar link de assinatura'}
                </Button>
                {active && (
                  <Button variante="fantasma" onClick={() => setRevoking(true)}>
                    Desligar assinatura
                  </Button>
                )}
              </div>
            </div>
          )}
        </Block>

        <Block title="Baixar">
          <div className="flex flex-col gap-4">
            <Options
              label="Período, a partir de hoje"
              value={months}
              onChange={setMonths}
              options={[1, 3, 6, 12].map((m) => ({
                value: m,
                label: m === 1 ? '1 mês' : m === 12 ? '1 ano' : `${m} meses`,
              }))}
            />
            <Button
              icone={PiDownloadSimple}
              carregando={downloading}
              onClick={download}
              className="w-fit"
            >
              Baixar arquivo .ics
            </Button>
            <p className="t-legenda">
              O arquivo é uma cópia: o que mudar depois não chega a ele. Para
              acompanhar as mudanças, assine.
            </p>
          </div>
        </Block>
      </div>

      <ConfirmModal
        isOpen={revoking}
        onClose={() => setRevoking(false)}
        onConfirm={() => revoke.mutate(undefined)}
        isLoading={revoke.isPending}
        type="warning"
        title="Desligar a assinatura?"
        message="O link atual para de funcionar e o calendário do aparelho deixa de receber as aulas. As que já estão lá ficam até o calendário atualizar."
        confirmText="Desligar"
        cancelText="Voltar"
      />
    </Sheet>
  );
}
