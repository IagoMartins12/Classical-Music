import Link from 'next/link';
import { MdHome, MdChevronRight } from 'react-icons/md';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center flex-wrap gap-2 text-sm">
        <li>
          <Link
            href="/blog"
            className="flex items-center text-theme-tertiary hover:text-brand-primary transition-colors"
          >
            <MdHome className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <MdChevronRight className="w-4 h-4 text-theme-tertiary" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-theme-tertiary hover:text-brand-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-theme-primary font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
