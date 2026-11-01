import Link from '@/app/components/LocalizedLink';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { LEARN } from '@/app/conteudo/site/learn';
import { getStartingPieces } from '@/app/requests/catalog-lists';

/**
 * "Where to start playing": the house's pieces by level, on an instrument or
 * an era page. `listKey` is the page's key; with no list, nothing shows.
 */
export async function StartingPieces({
  listKey,
  language,
}: {
  listKey: string;
  language: Idioma;
}) {
  const levels = await getStartingPieces(listKey);
  if (!levels.length) return null;
  const t = LEARN[language].instruments;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{t.play}</h2>
        <p className="t-corpo text-texto-suave">{t.playText}</p>
      </div>
      {levels.map((level) => (
        <div key={level.tier} className="flex flex-col gap-3">
          <h3 className="t-subtitulo">{t.levels[level.tier]}</h3>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {level.pieces.map((piece) => (
              <li key={piece.id}>
                <Link
                  href={`/works/${piece.id}`}
                  className="group flex h-full flex-col gap-1 rounded-card bg-sup-2 p-5"
                >
                  <span className="font-display text-[1.25rem] leading-snug group-hover:text-ouro-texto">
                    {(language === 'en'
                      ? piece.popularNameEn || piece.popularName
                      : piece.popularName) || piece.title}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {piece.composer}
                  </span>
                  <span className="t-rotulo mt-1">
                    {language === 'en' ? piece.whyEn : piece.why}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
