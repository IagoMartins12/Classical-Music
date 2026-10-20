import Link from '@/app/components/LocalizedLink';
import { cx } from '@/app/components/ui/cx';

/** A header link with the gold underline that grows from the middle. */
export function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'group relative flex min-h-[var(--alvo)] items-center rounded-controle px-3 text-[0.9375rem] font-medium transition-colors duration-[var(--t-toque)]',
        active ? 'text-ouro-texto' : 'text-texto-suave hover:text-texto'
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className={cx(
          'absolute inset-x-3 bottom-2 h-px bg-ouro transition-transform duration-300 ease-saida motion-reduce:transition-none',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        )}
      />
    </Link>
  );
}
