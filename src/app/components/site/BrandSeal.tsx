import NextImage from 'next/image';
import { cx } from '@/app/components/ui/cx';

/** The Opus Atlas engraved seal (the logo with its own transparency). */
export function BrandSeal({
  className,
  reveal = false,
  priority = false,
  sizes = '(max-width: 768px) 30vw, 140px',
}: {
  className?: string;
  reveal?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <span className={cx('block', reveal && 'seal-reveal', className)}>
      <NextImage
        src="/brand/opus-atlas-seal.webp"
        alt="Opus Atlas"
        width={721}
        height={735}
        priority={priority}
        sizes={sizes}
        className="brand-seal h-auto w-full"
      />
    </span>
  );
}
