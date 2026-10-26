import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocalizedLink from '@/app/components/LocalizedLink';
import {
  PranchaDoAno,
  TextoDoCartao,
} from '@/app/components/site/personal/PranchaDoAno';
import { classesDeBotao } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
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
    // Sempre noturna, como dentro do site (`.noite`).
    <main className="noite min-h-dvh bg-fundo px-4 py-16 sm:py-24">
      <div className="mx-auto flex max-w-[28rem] flex-col gap-16">
        <h1 className="font-display text-[clamp(2rem,7vw,2.75rem)] leading-tight text-balance">
          {copy.share.title(retro.firstName)}
        </h1>

        {retro.cards.map((card, i) => (
          <section key={`${card.kind}-${i}`} className="flex flex-col gap-7">
            <PranchaDoAno
              card={card}
              chave={`publica-${i}`}
              idioma={retro.language}
            />
            <TextoDoCartao card={card} idioma={retro.language} />
          </section>
        ))}

        <LocalizedLink
          href="/pricing#plus"
          className={cx(classesDeBotao('primario', 'm'), 'w-full')}
        >
          {copy.share.cta}
        </LocalizedLink>
      </div>
    </main>
  );
}
