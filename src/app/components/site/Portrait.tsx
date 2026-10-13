import Image from '@/app/components/SmartImage';
import { cx } from '@/app/components/ui/cx';

/** IMSLP's "no composer photo available" file, stored as the portrait of thousands. */
const PLACEHOLDER = /nocomposerphotoavailable/i;

/**
 * A composer portrait. Without a photo, or when it fails to load, the initial
 * in Garamond shows — never a hole or a generic silhouette.
 *
 * A server component: the initial is always drawn underneath, and a photo
 * that fails is hidden by `RetratosQueFalham` (one listener for the page),
 * so a list of composers no longer hydrates one island per picture.
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
  const photo = src && !PLACEHOLDER.test(src) ? src : null;
  return (
    <span className={cx('relative block overflow-hidden bg-sup-2', className)}>
      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center font-display text-[2.5em] text-texto-fraco"
      >
        {name.trim().charAt(0)}
      </span>
      {photo && (
        <Image
          src={photo}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          data-retrato=""
          className="object-cover object-top"
        />
      )}
    </span>
  );
}
