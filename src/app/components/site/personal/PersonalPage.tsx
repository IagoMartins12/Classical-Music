'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { PiTrophy } from 'react-icons/pi';
import { PageHeader } from '@/app/components/Portal/pieces';
import { Button } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { PersonalNav } from './PersonalNav';
import {
  ProgressButton,
  ProgressPanel,
  type AchievementCategory,
} from './ProgressPanel';

const STORAGE_KEY = 'opus-atlas:progress-panel';

/**
 * The frame of every personal page: the tabs between them, the title in the
 * portal's cascading style and, on pages with their own kind of
 * achievements, the progress beside the content. Whether it shows is the
 * person's choice ("Ver/Esconder progresso", kept in the browser); on phones
 * it opens in a sheet.
 */
export function PersonalPage({
  title,
  description,
  actions,
  category,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  /** The page's kind of achievements; without it, no progress panel. */
  category?: AchievementCategory;
  children: ReactNode;
}) {
  const copy = PERSONAL[useRouteLanguage().language].progress;
  const [shown, setShown] = useState(false);
  useEffect(() => {
    try {
      setShown(localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      /* private mode: stays hidden */
    }
  }, []);
  const toggle = () =>
    setShown((v) => {
      try {
        localStorage.setItem(STORAGE_KEY, v ? '0' : '1');
      } catch {
        /* not kept */
      }
      return !v;
    });
  const aside = !!category && shown;

  return (
    <div className="flex flex-col">
      <PersonalNav />
      <div
        className={cx(
          'section-wrap grid grid-cols-1 gap-10 py-10',
          aside &&
            'lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]'
        )}
      >
        <div className="flex min-w-0 flex-col">
          <PageHeader
            title={title}
            description={description}
            actions={
              <>
                {actions}
                {category && (
                  <>
                    <Button
                      tamanho="p"
                      icone={PiTrophy}
                      aria-pressed={shown}
                      onClick={toggle}
                      className="max-lg:hidden"
                    >
                      {shown ? copy.hide : copy.show}
                    </Button>
                    <ProgressButton category={category} />
                  </>
                )}
              </>
            }
          />
          {children}
        </div>
        {aside && (
          <aside className="max-lg:hidden lg:sticky lg:top-24 lg:self-start">
            <ProgressPanel category={category} />
          </aside>
        )}
      </div>
    </div>
  );
}
