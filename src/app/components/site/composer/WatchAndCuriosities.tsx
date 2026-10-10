import { PiLightbulb } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import type { ComposerCopy } from '@/app/conteudo/site/composer';
import { LiteYouTube } from '../LiteYouTube';

/**
 * "Para ver" and "Curiosidades" side by side; curiosities alone fill the row.
 * A composer with none says so instead of padding the space.
 */
export function WatchAndCuriosities({
  videoId,
  title,
  name,
  curiosities,
  copy,
}: {
  videoId: string | null;
  title: string;
  name: string;
  curiosities: string[];
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
          <div className={both ? undefined : 'max-w-4xl'}>
            <LiteYouTube id={videoId} title={title} />
          </div>
        </section>
      )}
      <section className="flex flex-col gap-6">
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{copy.curiosities}</h2>
        {curiosities.length ? (
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
        ) : (
          <p className="t-corpo rounded-card bg-sup-2 p-6 text-texto-suave">
            {copy.noCuriosities(name)}
          </p>
        )}
      </section>
    </div>
  );
}
