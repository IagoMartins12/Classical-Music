export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatGrowthRate = (
  rate: number
): {
  formatted: string;
  color: string;
  isPositive: boolean;
} => {
  const isPositive = rate >= 0;
  const color = isPositive ? 'text-accent-green' : 'text-accent-red';
  const formatted = `${isPositive ? '+' : ''}${rate.toFixed(1)}%`;

  return { formatted, color, isPositive };
};

export const getQualityColor = (quality: string): string => {
  switch (quality) {
    case 'high':
      return 'text-accent-green';
    case 'medium':
      return 'text-accent-amber';
    case 'low':
      return 'text-accent-red';
    default:
      return 'text-theme-tertiary';
  }
};

export const getQualityLabel = (quality: string): string => {
  switch (quality) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Média';
    case 'low':
      return 'Baixa';
    default:
      return 'Desconhecida';
  }
};
