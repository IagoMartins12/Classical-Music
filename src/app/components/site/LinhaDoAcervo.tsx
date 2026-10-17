import { PiBooks } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { TextoRico } from '@/app/components/ui/TextoRico';

/**
 * One line under a hero's lead with the archive's size, the numbers in bold
 * (for-teachers, pricing; about-us shows faces instead). Without the numbers
 * (no API), nothing.
 */
export function LinhaDoAcervo({ texto }: { texto: string | null }) {
  if (!texto) return null;
  return (
    <p
      className="entra mt-6 flex max-w-[56ch] items-start gap-2.5 text-[0.9375rem] text-texto-suave"
      style={{ ['--i' as string]: 3 }}
    >
      <Icon de={PiBooks} className="mt-0.5 shrink-0 text-ouro-texto" />
      <span>
        <TextoRico texto={texto} />
      </span>
    </p>
  );
}
