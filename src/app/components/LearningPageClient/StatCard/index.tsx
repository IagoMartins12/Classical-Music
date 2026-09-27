// app/learning/components/StatCard.tsx - Com Sistema de Animação
import { AnimatedCard } from '../../animation/AnimatedComponents';
import { Text } from '@/app/components/ui/Text';

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
    brand: 'fill-ouro',
    blue: 'bg-aviso',
    green: 'bg-ok',
    purple: 'fill-ouro',
  };

  return (
    <AnimatedCard hover="scale" className="classical-card p-6 text-center">
      <div
        className={`w-12 h-12 bg-gradient-to-br ${
          colorClasses[color as keyof typeof colorClasses]
        } rounded-xl flex items-center justify-center mx-auto mb-3`}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold text-theme-primary mb-1">{value}</div>
      <Text papel="rotulo" tom="fraco" as="div">
        {title}
      </Text>
      {subtitle && (
        <Text papel="legenda" tom="fraco" as="div" className="mt-1">
          {subtitle}
        </Text>
      )}
    </AnimatedCard>
  );
};
