import type { ReactNode } from 'react';
import { PageHeader } from '@/app/components/Portal/pieces';
import { cx } from '@/app/components/ui/cx';
import { PersonalNav } from './PersonalNav';
import {
  ProgressButton,
  ProgressPanel,
  type AchievementCategory,
} from './ProgressPanel';

/**
 * The frame of every personal page: the tabs between them, the title in the
 * portal's cascading style, and the progress panel beside the content (behind
 * a button on phones).
 */
export function PersonalPage({
  title,
  description,
  actions,
  category,
  progress = true,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  category?: AchievementCategory;
  /** The progress panel beside the content; off where the page is the progress. */
  progress?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <PersonalNav />
      <div
        className={cx(
          'section-wrap grid grid-cols-1 gap-10 py-10',
          progress &&
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
                {progress && <ProgressButton category={category} />}
              </>
            }
          />
          {children}
        </div>
        {progress && (
          <aside className="max-lg:hidden lg:sticky lg:top-24 lg:self-start">
            <ProgressPanel category={category} />
          </aside>
        )}
      </div>
    </div>
  );
}
