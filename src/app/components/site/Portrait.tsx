'use client';

import { useState } from 'react';
import Image from '@/app/components/SmartImage';
import { cx } from '@/app/components/ui/cx';

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
  return (
    <span className={cx('relative block overflow-hidden bg-sup-2', className)}>
      {src && !broken ? (
        <Image
          src={src}
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
