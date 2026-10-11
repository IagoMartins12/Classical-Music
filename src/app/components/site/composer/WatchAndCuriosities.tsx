import { cx } from '@/app/components/ui/cx';
import type { ComposerCopy } from '@/app/conteudo/site/composer';
import type { Contribution, Curiosity } from '@/app/requests/contributions';
import { LiteYouTube } from '../LiteYouTube';
import { ContributionCredit } from '../contribute/ContributionCredit';
import { ComposerCuriosities } from './ComposerCuriosities';

/**
 * "Para ver" and "Curiosidades" side by side; curiosities alone fill the row.
 * A composer with none invites the first one instead of padding the space.
 */
export function WatchAndCuriosities({
  composerId,
  videoId,
  videoCredit,
  title,
  name,
  curiosities,
  copy,
}: {
  composerId: string;
  videoId: string | null;
  /** Who suggested the video, when someone did. */
  videoCredit: Contribution | null;
  title: string;
  name: string;
  curiosities: Curiosity[];
  copy: ComposerCopy;
}) {
  const both = !!videoId;
  return (
    <div
      className={cx(
        'mt-20 grid grid-cols-1 gap-10',
        both && 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14'
      )}
    >
      {videoId && (
        <section className="flex flex-col gap-6">
          <h2 className="t-titulo max-sm:!text-[1.75rem]">{copy.watch}</h2>
          <div className="flex flex-col gap-2">
            <LiteYouTube id={videoId} title={title} />
            {videoCredit && (
              <ContributionCredit contribution={videoCredit} name={title} />
            )}
          </div>
        </section>
      )}
      <ComposerCuriosities
        composerId={composerId}
        name={name}
        initial={curiosities}
        heading={copy.curiosities}
        wide={!both}
      />
    </div>
  );
}
