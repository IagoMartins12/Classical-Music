// app/learning/components/StatCard.tsx
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  color = 'brand',
}: StatCardProps) => {
  const colorClasses = {
    brand: 'from-brand-primary to-brand-secondary',
    blue: 'from-accent-blue to-accent-purple',
    green: 'from-accent-green to-accent-blue',
    purple: 'from-accent-purple to-accent-red',
  };

  return (
    <div className="classical-card p-6 text-center group hover:scale-105 transition-transform">
      <div
        className={`w-12 h-12 bg-gradient-to-br ${
          colorClasses[color as keyof typeof colorClasses]
        } rounded-xl flex items-center justify-center mx-auto mb-3`}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold text-theme-primary mb-1">{value}</div>
      <div className="text-sm text-theme-tertiary">{title}</div>
      {subtitle && (
        <div className="text-xs text-theme-tertiary mt-1">{subtitle}</div>
      )}
    </div>
  );
};
