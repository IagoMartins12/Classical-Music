'use client';

import { useState } from 'react';
import Image from '@/app/components/SmartImage';
import { cx } from '@/app/components/ui/cx';

/** IMSLP's "no composer photo available" file, stored as the portrait of thousands. */
const PLACEHOLDER = /nocomposerphotoavailable/i;

/**
 * A composer portrait. Without a photo (or when it fails to load) it shows
 * the initial in Garamond, never a hole or a generic silhouette.
 */
export function Portrait({
  name,
  src,
  sizes = '160px',
  priority = false,
  className,
}: {
  name: string;
  src?: string | null;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const photo = src && !PLACEHOLDER.test(src) ? src : null;
  return (
    <span className={cx('relative block overflow-hidden bg-sup-2', className)}>
      {photo && !broken ? (
        <Image
          src={photo}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setBroken(true)}
          className="object-cover object-top"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center font-display text-[2.5em] text-texto-fraco"
        >
          {name.trim().charAt(0)}
        </span>
      )}
    </span>
  );
}
