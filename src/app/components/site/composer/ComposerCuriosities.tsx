'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiFlag,
  PiLightbulb,
  PiLockSimple,
  PiPlus,
  PiTrash,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { CONTRIBUTE } from '@/app/conteudo/site/contribute';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSignInGate } from '@/app/hooks/useSignInGate';
import {
  type Curiosity,
  fetchCuriosities,
  removeCuriosity,
} from '@/app/requests/contributions';
import { ReportSheet } from '../ReportButton';
import { useContribute } from '../contribute/Contribute';

/**
 * The composer's curiosities: the editorial ones and what people shared,
 * with who shared it. Painted from the server; a signed-in visitor
 * refetches to also see their own held ones. "Acrescentar" opens the
 * contribution sheet on its curiosity tab.
 */
export function ComposerCuriosities({
  composerId,
  name,
  initial,
  heading,
  wide,
}: {
  composerId: string;
  name: string;
  initial: Curiosity[];
  heading: string;
  /** Alone in the row: two columns from tablet up. */
  wide: boolean;
}) {
  const { language } = useRouteLanguage();
  const copy = CONTRIBUTE[language].curiosities;
  const { isAuthenticated } = useAuth();
  const allowed = useSignInGate();
  const client = useQueryClient();
  const key = ['curiosities', composerId, language];
  const { data: list = initial } = useQuery({
    queryKey: key,
    queryFn: () => fetchCuriosities(composerId, language),
    initialData: initial,
    // The server copy may be an hour old: signed in, fetch the live list.
    initialDataUpdatedAt: 0,
    enabled: isAuthenticated,
  });
  const { open } = useContribute();
  const [reporting, setReporting] = useState<Curiosity | null>(null);

  const update = (next: (current: Curiosity[]) => Curiosity[]) =>
    client.setQueryData<Curiosity[]>(key, (current) => next(current ?? list));

  const remove = async (curiosity: Curiosity) => {
    const result = await removeCuriosity(curiosity.id).catch(() => null);
    if (!result?.ok) return toast.error(CONTRIBUTE[language].failed);
    update((current) => current.filter((c) => c.id !== curiosity.id));
    toast.success(copy.removed);
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{heading}</h2>
        {list.length > 0 && (
          <Button
            variante="fantasma"
            tamanho="p"
            icone={PiPlus}
            onClick={() => open('curiosity')}
          >
            {copy.add}
          </Button>
        )}
      </div>
      {list.length ? (
        <ul className={cx('grid grid-cols-1 gap-3', wide && 'md:grid-cols-2')}>
          {list.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-3 rounded-card bg-sup-2 p-4"
            >
              <Icon
                de={PiLightbulb}
                tamanho="m"
                className="mt-0.5 shrink-0 text-ouro-texto"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="t-rotulo">{c.text}</span>
                {c.source === 'USER' && (c.author || c.mine) && (
                  <span className="t-legenda flex flex-wrap items-center gap-x-2">
                    {c.mine
                      ? c.author
                        ? copy.you
                        : copy.youUnsigned
                      : copy.by(c.author?.name ?? '')}
                    {c.held && (
                      <Icon
                        de={PiLockSimple}
                        tamanho="pp"
                        rotulo={copy.held}
                        className="text-texto-fraco"
                      />
                    )}
                  </span>
                )}
              </div>
              {c.source === 'USER' &&
                (c.mine ? (
                  <Button
                    tamanho="p"
                    variante="fantasma"
                    icone={PiTrash}
                    rotulo={copy.remove}
                    onClick={() => void remove(c)}
                  />
                ) : (
                  <Button
                    tamanho="p"
                    variante="fantasma"
                    icone={PiFlag}
                    rotulo={copy.report}
                    onClick={() => allowed('report') && setReporting(c)}
                  />
                ))}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-card bg-sup-2 p-6">
          <p className="t-corpo text-texto-suave">{copy.first(name)}</p>
          <Button
            variante="secundario"
            icone={PiPlus}
            onClick={() => open('curiosity')}
          >
            {copy.add}
          </Button>
        </div>
      )}
      <ReportSheet
        entityType="curiosity"
        entityId={reporting?.id ?? ''}
        name={reporting?.text.slice(0, 60) ?? ''}
        open={!!reporting}
        onClose={() => setReporting(null)}
      />
    </section>
  );
}
