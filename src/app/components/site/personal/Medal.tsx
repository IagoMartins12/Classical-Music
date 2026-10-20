import { cx } from '@/app/components/ui/cx';

/** The achievement medal from sketch A: ribbon, disc and a check. */
export function Medal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx('engraving', className)}
    >
      <path pathLength={1} d="M11 3l3 8M21 3l-3 8M11 3h10" />
      <circle pathLength={1} cx="16" cy="19" r="9" />
      <path pathLength={1} d="M12.4 19.2l2.5 2.5 4.7-5" />
    </svg>
  );
}
