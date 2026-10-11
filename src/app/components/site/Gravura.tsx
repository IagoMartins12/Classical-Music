import Image from '@/app/components/SmartImage';
import { cx } from '@/app/components/ui/cx';

/**
 * A public-domain engraving redrawn in gold line (`public/illustrations`,
 * credits beside them): what fills the right side of the editorial pages
 * (/about-us, /pricing, /for-teachers), in the same hand as the instrument
 * drawings. Decorative unless it says something the text does not.
 */
export function Gravura({
  src,
  width,
  height,
  alt = '',
  className,
}: {
  src: string;
  width: number;
  height: number;
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      sizes="(min-width: 1024px) 40vw, 0px"
      className={cx(
        'entra hidden h-auto w-full select-none lg:block',
        className
      )}
      style={{ ['--i' as string]: 2 }}
    />
  );
}
