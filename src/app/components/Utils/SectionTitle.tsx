// app/components/Utils/SectionTitle.tsx - Updated with theme system
import Link from 'next/link';
import { FiArrowRight, FiUsers } from 'react-icons/fi';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
  icon?: React.ReactNode;
  accent?: 'gold' | 'purple' | 'blue' | 'green';
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  linkText,
  linkHref,
  icon = <FiUsers className="w-6 h-6" />,
  accent = 'gold',
}) => {
  const getAccentClasses = () => {
    switch (accent) {
      case 'purple':
        return 'from-accent-purple to-accent-blue';
      case 'blue':
        return 'from-accent-blue to-accent-purple';
      case 'green':
        return 'from-accent-green to-accent-blue';
      default:
        return 'from-brand-primary to-brand-secondary';
    }
  };

  return (
    <div className="">
      {/* Main Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          {/* Icon with gradient background */}
          <div
            className={`w-12 h-12 bg-gradient-to-br ${getAccentClasses()} rounded-xl flex items-center justify-center shadow-theme-glow icon-glow`}
          >
            <div className="text-theme-primary">{icon}</div>
          </div>

          {/* Title and subtitle */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-brand classical-title">
              {title}
            </h2>
            {subtitle && (
              <p className="text-theme-secondary classical-subtitle mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Link */}
        {linkHref && (
          <Link
            href={linkHref}
            className="inline-flex items-center px-6 py-3 bg-theme-elevated border border-theme-primary rounded-xl text-theme-primary hover:text-brand-primary hover:border-brand-primary hover:bg-interactive-hover hover:scale-105 transition-all duration-300 group shadow-theme-sm hover:shadow-theme-md font-medium"
          >
            {linkText}
            <FiArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Decorative line */}
      <div className="relative">
        <div className="h-px bg-border-secondary"></div>
        <div
          className={`absolute left-0 top-0 w-20 h-px bg-gradient-to-r ${getAccentClasses()}`}
        ></div>
      </div>
    </div>
  );
};

export default SectionTitle;
