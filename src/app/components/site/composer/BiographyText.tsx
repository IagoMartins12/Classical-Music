import { PiSparkle } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';

const URL_PATTERN = /(https?:\/\/[^\s)]+)/g;

/** Bare URLs in the text become short links named after their host. */
function withLinks(paragraph: string) {
  return paragraph.split(URL_PATTERN).map((part, i) => {
    if (i % 2 === 0) return part;
    let host = part;
    try {
      host = new URL(part).hostname.replace(/^www\./, '');
    } catch {}
    return (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ouro-texto underline underline-offset-4"
      >
        {host}
      </a>
    );
  });
}

/** The biography, in paragraphs, opening with a drop cap. */
export function BiographyText({
  text,
  aiNote,
}: {
  text: string;
  aiNote: string | null;
}) {
  const paragraphs = text
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="flex flex-col gap-4">
      {paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className={cx(
            't-corpo max-w-[62ch] break-words',
            i === 0 && 'drop-cap'
          )}
        >
          {withLinks(paragraph)}
        </p>
      ))}
      {aiNote && (
        <p className="inline-flex items-center gap-2 t-legenda">
          <Icon de={PiSparkle} tamanho="pp" /> {aiNote}
        </p>
      )}
    </div>
  );
}
