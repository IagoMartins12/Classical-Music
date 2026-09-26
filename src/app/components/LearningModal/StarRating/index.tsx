import { PiStar, PiStarFill } from 'react-icons/pi';
import { Inline, Stack } from '@/app/components/ui/Layout';

const StarRating = ({
  value,
  onChange,
  label,
  labels = [],
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  labels?: string[];
}) => (
  <Stack gap={2} className="h-full justify-center">
    <span className="block text-sm font-medium text-theme-secondary">
      {label}
    </span>
    <Inline gap={1}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 rounded"
        >
          {star <= value ? (
            <PiStarFill
              className={`w-6 h-6 transition-colors ${
                star <= value
                  ? 'fill-current text-accent-amber'
                  : 'text-theme-tertiary hover:text-accent-amber'
              }`}
            />
          ) : (
            <PiStar
              className={`w-6 h-6 transition-colors ${
                star <= value
                  ? 'fill-current text-accent-amber'
                  : 'text-theme-tertiary hover:text-accent-amber'
              }`}
            />
          )}
        </button>
      ))}
      {labels[value - 1] && (
        <span className="ml-2 text-sm font-medium text-theme-secondary">
          {labels[value - 1]}
        </span>
      )}
    </Inline>
  </Stack>
);

export default StarRating;
