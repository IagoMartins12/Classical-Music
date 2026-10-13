'use client';

import { useState } from 'react';
import { PiPlay } from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Icon } from '@/app/components/ui/Icon';

/**
 * A YouTube video that costs nothing until it is played: the thumbnail and a
 * play button in place of the ~1 MB iframe, which loads on click.
 */
export function LiteYouTube({
  id,
  title,
  priority = false,
}: {
  id: string;
  title: string;
  /** The poster is the page's largest image above the fold. */
  priority?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-card bg-sup-2">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0"
          aria-label={title}
        >
          <Image
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={priority}
            className="object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-veu-foto to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full fill-ouro text-sobre-ouro shadow-[var(--sombra-2)] transition-transform duration-[var(--t-toque)] group-hover:scale-105 motion-reduce:transition-none">
            <Icon de={PiPlay} tamanho="g" />
          </span>
        </button>
      )}
    </div>
  );
}
