import Image from '@/app/components/SmartImage';
import Link from '@/app/components/LocalizedLink';
import { Carrossel } from '@/app/components/blog/site/Carrossel';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { ERAS, eraYears } from '@/app/conteudo/site/eras';
import type { HomeCopy } from '@/app/conteudo/site/home';
import { SectionHeading } from '../SectionHeading';

interface EraCard {
  key: string;
  href: string;
  image: string;
  years: string;
  name: string;
  tagline: string;
}

/** "Explore por período": the seven eras plus "All", as image cards. */
export function ErasCarousel({
  copy,
  language,
}: {
  copy: HomeCopy['eras'];
  language: Idioma;
}) {
  const cards: EraCard[] = [
    {
      key: 'all',
      href: '/composers',
      image: '/eras/all.webp',
      years: eraYears(
        { ...ERAS[0], span: { from: ERAS[0].span.from, to: null } },
        language
      ),
      name: copy.allName,
      tagline: copy.allTagline,
    },
    ...ERAS.map((era) => ({
      key: era.key,
      href: `/music-history#${era.key}`,
      image: era.image,
      years: eraYears(era, language),
      name: era.name[language],
      tagline: era.tagline[language],
    })),
  ];

  return (
    <section className="py-12">
      <Carrossel
        sempre
        idioma={language}
        rotulo={copy.title}
        largura="minmax(14rem,16.5rem)"
        cabecalho={
          <SectionHeading
            title={copy.title}
            action={{ label: copy.history, href: '/music-history' }}
          />
        }
      >
        {cards.map((card) => (
          <div key={card.key} role="listitem" className="snap-start">
            <Link
              href={card.href}
              className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-card p-5"
            >
              <Image
                src={card.image}
                alt=""
                fill
                sizes="264px"
                className="object-cover transition-transform duration-700 ease-[var(--saida)] group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-veu-foto via-veu-foto/45 to-transparent" />
              <span className="relative flex flex-col gap-1.5 text-sobre-foto">
                <span className="t-dado text-[0.8125rem] opacity-90">
                  {card.years}
                </span>
                <span className="font-display text-[1.875rem] leading-none">
                  {card.name}
                </span>
                <span className="text-[0.875rem] leading-snug opacity-90">
                  {card.tagline}
                </span>
              </span>
            </Link>
          </div>
        ))}
      </Carrossel>
    </section>
  );
}
