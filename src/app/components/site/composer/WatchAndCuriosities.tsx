import { PiLightbulb } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import type { ComposerCopy } from '@/app/conteudo/site/composer';
import { LiteYouTube } from '../LiteYouTube';

/** "Para ver" and "Curiosidades" side by side; either one alone fills the row. */
export function WatchAndCuriosities({
  videoId,
  title,
  curiosities,
  copy,
}: {
  videoId: string | null;
  title: string;
  curiosities: string[];
  copy: ComposerCopy;
}) {
  if (!videoId && !curiosities.length) return null;
  const both = !!videoId && curiosities.length > 0;
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
          <div className={both ? undefined : 'max-w-4xl'}>
            <LiteYouTube id={videoId} title={title} />
          </div>
        </section>
      )}
      {curiosities.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="t-titulo max-sm:!text-[1.75rem]">
            {copy.curiosities}
          </h2>
          <ul
            className={cx('grid grid-cols-1 gap-3', !both && 'md:grid-cols-2')}
          >
            {curiosities.map((text) => (
              <li
                key={text}
                className="flex items-start gap-3 rounded-card bg-sup-2 p-4"
              >
                <Icon
                  de={PiLightbulb}
                  tamanho="m"
                  className="mt-0.5 text-ouro-texto"
                />
                <span className="t-rotulo">{text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
