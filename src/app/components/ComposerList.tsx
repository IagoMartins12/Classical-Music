import { Stack } from '@/app/components/ui/Layout';
type Composer = {
  id: number;
  name: string;
  epoch: string;
};

type Props = {
  composers: Composer[];
  onSelect: (id: number) => void;
};

export default function ComposerList({ composers, onSelect }: Props) {
  return (
    <Stack gap={2} className="p-4">
      <h2 className="text-xl font-semibold">Compositores encontrados</h2>
      <Stack gap={2} as="ul">
        {composers.map((composer) => (
          <li
            key={composer.id}
            className="cursor-pointer p-2 rounded hover:bg-gray-100"
            onClick={() => onSelect(composer.id)}
          >
            <strong>{composer.name}</strong> — {composer.epoch}
          </li>
        ))}
      </Stack>
    </Stack>
  );
}
