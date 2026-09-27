// app/components/Utils/SectionTitle.tsx - Updated with theme system
import Link from 'next/link';
import { PiArrowRight, PiUsers } from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';

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
  icon = <PiUsers className="w-6 h-6" />,
  accent = 'gold',
}) => {
  const getAccentClasses = () => {
    switch (accent) {
      case 'purple':
        return '';
      case 'blue':
        return '';
      case 'green':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="">
      {/* Main Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Inline gap={4}>
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
        </Inline>

        {/* Action Link */}
        {linkHref && (
          <Link
            href={linkHref}
            className="flex justify-center items-center px-6 py-3 bg-theme-elevated rounded-xl text-theme-primary hover:scale-105 transition-all duration-300 group font-medium"
          >
            {linkText}
            <PiArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Decorative line */}
      <div className="relative">
        <div className="h-px"></div>
        <div
          className={`absolute left-0 top-0 w-20 h-px bg-gradient-to-r ${getAccentClasses()}`}
        ></div>
      </div>
    </div>
  );
};

export default SectionTitle;
