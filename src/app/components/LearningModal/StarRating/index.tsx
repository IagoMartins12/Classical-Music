import { PiStar, PiStarFill } from 'react-icons/pi';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

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
    <Text papel="rotulo" tom="suave" className="block font-medium">
      {label}
    </Text>
    <Inline gap={1}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ouro focus:ring-opacity-50 rounded"
        >
          {star <= value ? (
            <PiStarFill
              className={`w-6 h-6 transition-colors ${
                star <= value
                  ? 'fill-current text-atencao'
                  : 'text-theme-tertiary hover:text-atencao'
              }`}
            />
          ) : (
            <PiStar
              className={`w-6 h-6 transition-colors ${
                star <= value
                  ? 'fill-current text-atencao'
                  : 'text-theme-tertiary hover:text-atencao'
              }`}
            />
          )}
        </button>
      ))}
      {labels[value - 1] && (
        <Text papel="rotulo" tom="suave" className="ml-2 font-medium">
          {labels[value - 1]}
        </Text>
      )}
    </Inline>
  </Stack>
);

export default StarRating;
