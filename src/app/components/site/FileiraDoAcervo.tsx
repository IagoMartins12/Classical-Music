import type { IconType } from 'react-icons';
import Image from '@/app/components/SmartImage';
import { Icon } from '@/app/components/ui/Icon';
import { TextoRico } from '@/app/components/ui/TextoRico';
import { cx } from '@/app/components/ui/cx';

export type ItemDaFileira =
  | { chave: string; foto: string; nome: string }
  | { chave: string; icone: IconType; nome: string };

/**
 * A short row of overlapping discs and one line beside it, under a hero's
 * lead: about-us shows composers' faces; for-teachers, the instruments
 * people teach; pricing, what is free. The line can carry live numbers in
 * bold (`**200k+**`).
 */
export function FileiraDoAcervo({
  rotulo,
  itens,
  legenda,
  className,
}: {
  rotulo: string;
  itens: ItemDaFileira[];
  legenda?: string | null;
  className?: string;
}) {
  if (!itens.length) return null;
  return (
    <div
      className={cx('entra mt-6 flex items-center gap-3', className)}
      style={{ ['--i' as string]: 3 }}
    >
      <ul aria-label={rotulo} className="flex shrink-0 [&>li+li]:-ml-2.5">
        {itens.slice(0, 5).map((item) => (
          <li
            key={item.chave}
            className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-sup-2 text-ouro-texto ring-2 ring-[var(--fundo)]"
          >
            {'foto' in item ? (
              <Image
                src={item.foto}
                alt={item.nome}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <Icon de={item.icone} tamanho="p" rotulo={item.nome} />
            )}
          </li>
        ))}
      </ul>
      {legenda && (
        <p className="text-sm text-texto-suave">
          <TextoRico texto={legenda} />
        </p>
      )}
    </div>
  );
}
