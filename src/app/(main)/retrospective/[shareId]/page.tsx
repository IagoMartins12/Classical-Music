import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocalizedLink from '@/app/components/LocalizedLink';
import { RETROSPECTIVE } from '@/app/conteudo/site/retrospective';
import { sharedRetrospective } from '@/app/requests/retrospective';
import { SITE_URL } from '@/app/utils/seoAlternates';

/**
 * A retrospectiva compartilhada (`/retrospective/<id>`): os cartões em
 * sequência, no idioma em que foram gerados, e o convite para fazer a sua.
 * Fora do índice — é de uma pessoa, não do acervo.
 */
interface Props {
  params: Promise<{ shareId: string }>;
}

export const revalidate = 300;

const buscar = (shareId: string) =>
  sharedRetrospective(shareId).catch(() => null);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = await params;
  const retro = await buscar(shareId);
  if (!retro) return { robots: { index: false } };

  const titulo = RETROSPECTIVE[retro.language].share.title(retro.firstName);
  const imagem = `${SITE_URL}/og/retro/${shareId}`;
  return {
    title: titulo,
    robots: { index: false, follow: true },
    openGraph: {
      title: titulo,
      images: [{ url: imagem, width: 1080, height: 1920 }],
    },
    twitter: { card: 'summary_large_image', title: titulo, images: [imagem] },
  };
}

export default async function SharedRetrospectivePage({ params }: Props) {
  const { shareId } = await params;
  const retro = await buscar(shareId);
  if (!retro) notFound();

  const copy = RETROSPECTIVE[retro.language];

  return (
    <main className="bg-[#14110d] px-4 py-16 text-[#f3ece0] sm:py-24">
      <div className="mx-auto flex max-w-[28rem] flex-col gap-6">
        <h1 className="font-display text-[clamp(2rem,7vw,2.75rem)] leading-tight">
          {copy.share.title(retro.firstName)}
        </h1>

        {retro.cards.map((card, i) => (
          <section
            key={`${card.kind}-${i}`}
            className="flex aspect-[9/16] flex-col justify-center gap-5 rounded-[1.5rem] bg-white/[0.04] px-7"
          >
            <span className="text-[0.8125rem] uppercase tracking-[0.2em] text-[#d4af37]">
              {card.eyebrow}
            </span>
            {card.value && (
              <span className="font-display text-[clamp(4rem,22vw,6.5rem)] leading-none text-[#d4af37]">
                {card.value}
              </span>
            )}
            <h2 className="font-display text-[clamp(1.875rem,8vw,2.5rem)] leading-[1.08]">
              {card.title}
            </h2>
            {card.detail && (
              <p className="text-[1.0625rem] text-[#f3ece0]/75">
                {card.detail}
              </p>
            )}
            {card.list && card.list.length > 0 && (
              <ol className="flex flex-col gap-2 pt-2">
                {card.list.map((item, n) => (
                  <li key={item} className="flex gap-3 text-[1.0625rem]">
                    <span className="text-[#d4af37]">{n + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}

        <LocalizedLink
          href="/pricing"
          className="mt-4 rounded-full bg-[#d4af37] px-6 py-3.5 text-center font-medium text-[#14110d] hover:bg-[#e0bf4f]"
        >
          {copy.share.cta}
        </LocalizedLink>
      </div>
    </main>
  );
}
