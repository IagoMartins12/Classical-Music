import { cx } from '@/app/components/ui/cx';

/**
 * The Opus Atlas symbol: the grand piano under the atlas sky. It is a
 * single-colour SVG used as a mask (`.marca` in globals.css), so it takes the
 * theme's gold by itself — plain gold on night, the darker gold on cream.
 */
export function BrandSeal({
  className,
  reveal = false,
}: {
  className?: string;
  reveal?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label="Opus Atlas"
      className={cx('marca marca-simbolo', reveal && 'seal-reveal', className)}
    />
  );
}
