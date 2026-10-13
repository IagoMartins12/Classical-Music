import Image from '@/app/components/SmartImage';
import { cx } from '@/app/components/ui/cx';
import { isOptimizableImageSrc } from '@/app/utils/imageHosts';

/** IMSLP's "no composer photo available" file, stored as the portrait of thousands. */
const PLACEHOLDER = /nocomposerphotoavailable/i;

/** The widths the browser picked for a 264px card at 1x, 2x and 3x. */
const CARTAO = [384, 640, 828];

/**
 * The card's copy of the photo, already in the browser cache, as an
 * `image-set` background: the page shows it at once while its own, larger
 * copy loads, instead of an empty frame mid-transition.
 */
const fundoDoCartao = (src: string) =>
  isOptimizableImageSrc(src)
    ? `image-set(${CARTAO.map(
        (w, i) =>
          `url("/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75") ${i + 1}x`
      ).join(', ')})`
    : `url("${src}")`;

/**
 * A composer portrait. Without a photo, or when it fails to load, the initial
 * in Garamond shows — never a hole or a generic silhouette.
 *
 * A server component: a photo that fails is marked by `RetratosQueFalham`
 * (one listener for the page), and only then does the initial after it show
 * (`globals.css`). While the photo loads, the surface stays plain: drawing
 * the initial under it flashed the letters before every portrait.
 */
export function Portrait({
  name,
  src,
  sizes = '160px',
  priority = false,
  fromCard = false,
  className,
}: {
  name: string;
  src?: string | null;
  sizes?: string;
  priority?: boolean;
  /** Arrived from a composer card (`ComposerCard`): start from its photo. */
  fromCard?: boolean;
  className?: string;
}) {
  const photo = src && !PLACEHOLDER.test(src) ? src : null;
  return (
    <span
      className={cx(
        'relative block overflow-hidden bg-sup-2 bg-cover bg-top',
        className
      )}
      style={
        photo && fromCard
          ? { backgroundImage: fundoDoCartao(photo) }
          : undefined
      }
    >
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
      <span
        aria-hidden="true"
        className="retrato-inicial absolute inset-0 grid place-items-center font-display text-[2.5em] text-texto-fraco"
      >
        {name.trim().charAt(0)}
      </span>
    </span>
  );
}
