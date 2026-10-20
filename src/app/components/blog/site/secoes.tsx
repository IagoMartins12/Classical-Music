import Link from 'next/link';
import { PiArrowRight } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { BLOG, rotuloDoTipo, type Idioma } from '@/app/conteudo/blog';
import type { CalendarEventData } from '@/app/requests/calendar-requests';
import type {
  CategoriaDoBlog,
  ResumoDeArtigo,
} from '@/app/requests/blog/leitura';
import {
  diaDaSemana,
  diaDoMes,
  horaDoEvento,
  mesCurto,
} from '@/app/utils/blog/formatos';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { Capa } from './Capa';
import { BotaoDoEvento } from './DetalheDoEvento';
import { Cartao } from './cartoes';
import { LINK, Meta, TituloDeSecao, TituloLink } from './pecas';
import { nomeDeArtigo } from '@/app/components/ui/nomeDeArtigo';

/**
 * Seções da página inicial do blog.
 */

/**
 * A agenda da semana, como no esboço A: a data grande à esquerda, o
 * programa, a casa e a hora. O dono escolheu esta forma para a junção com o
 * C (30/09).
 */
export function AgendaDaSemana({
  eventos,
  idioma,
  className,
}: {
  eventos: CalendarEventData[];
  idioma: Idioma;
  className?: string;
}) {
  const t = BLOG[idioma].agenda;

  return (
    <section
      aria-labelledby="agenda-da-semana"
      className={cx('rounded-card bg-sup-2 p-6', className)}
    >
      <h2 id="agenda-da-semana" className="t-subtitulo">
        {t.semana}
      </h2>
      {eventos.length === 0 ? (
        <p className="t-rotulo mt-3 text-texto-suave">{t.semEventosSemana}</p>
      ) : (
        <ul className="mt-2">
          {eventos.map((e) => {
            const fuso = e.timeZone;
            return (
              <li
                key={e.id}
                className="group relative grid grid-cols-[3rem_minmax(0,1fr)] gap-4 border-b border-linha py-4 last:border-b-0"
              >
                <time
                  dateTime={e.start.toISOString()}
                  className="flex flex-col leading-none"
                >
                  <span className="font-display text-[2rem] leading-none">
                    {diaDoMes(e.start, fuso)}
                  </span>
                  <span className="t-dado mt-1 text-[0.8125rem] text-texto-fraco">
                    {mesCurto(e.start, idioma, fuso)}
                  </span>
                </time>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="text-[0.9375rem] font-medium leading-snug">
                    <BotaoDoEvento
                      evento={e}
                      className="group-hover:text-ouro-texto"
                    >
                      {e.title}
                    </BotaoDoEvento>
                  </p>
                  <p className="t-legenda">
                    {[
                      e.venue.name,
                      e.venue.city !== 'N/A' ? e.venue.city : null,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  <p className="t-legenda flex flex-wrap gap-x-3">
                    <span>
                      {diaDaSemana(e.start, idioma, fuso)}
                      {horaDoEvento(e.start, idioma, fuso, e.allDay) && (
                        <span className="t-dado">
                          {' '}
                          {horaDoEvento(e.start, idioma, fuso, e.allDay)}
                        </span>
                      )}
                    </span>
                    <span>{rotuloDoTipo(idioma, e.type)}</span>
                    {e.isFree && <span>{t.gratuito}</span>}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Link href={rotasDoBlog.agenda(idioma)} className={cx(LINK, 'mt-4')}>
        {t.completa}
        <Icon de={PiArrowRight} tamanho="pp" />
      </Link>
    </section>
  );
}

/**
 * Uma categoria em destaque: o artigo mais recente grande, os seguintes em
 * linha ao lado (a composição de "Instrumentos" no esboço C).
 */
export function DestaqueDaCategoria({
  categoria,
  artigos,
  idioma,
}: {
  categoria: CategoriaDoBlog;
  artigos: ResumoDeArtigo[];
  idioma: Idioma;
}) {
  const [primeiro, ...resto] = artigos;
  const id = `categoria-${categoria.slug}`;

  return (
    <section aria-labelledby={id}>
      <TituloDeSecao
        id={id}
        href={rotasDoBlog.categoria(categoria.slug, idioma)}
        rotuloDoLink={BLOG[idioma].inicio.verCategoria}
      >
        {categoria.nome}
      </TituloDeSecao>
      <div className="mt-6 grid gap-x-10 gap-y-6 xl:grid-cols-12">
        <Cartao
          artigo={primeiro}
          idioma={idioma}
          proporcao="aspect-[16/10]"
          sizes="(min-width: 1280px) 520px, (min-width: 1024px) 700px, 100vw"
          comResumo
          className="xl:col-span-7"
        />
        <ul className="xl:col-span-5">
          {resto.map((artigo) => (
            <li
              key={artigo.id}
              data-vira={nomeDeArtigo(artigo.slug)}
              className="relative grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-5 border-b border-linha py-5 first:pt-0 last:border-b-0"
            >
              <Capa
                src={artigo.capa}
                alt=""
                inicial={artigo.titulo}
                sizes="104px"
                className="aspect-[4/3] rounded-controle"
              />
              <div className="flex min-w-0 flex-col gap-1.5">
                <Meta artigo={artigo} idioma={idioma} />
                <TituloLink
                  artigo={artigo}
                  idioma={idioma}
                  className="text-[1.375rem] leading-[1.15]"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
