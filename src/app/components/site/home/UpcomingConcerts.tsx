'use client';

import {
  BotaoDoEvento,
  ProvedorDeEventos,
} from '@/app/components/blog/site/DetalheDoEvento';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import type { HomeCopy } from '@/app/conteudo/site/home';
import type { CalendarEventData } from '@/app/requests/calendar-requests';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { diaDoMes, horaDoEvento, mesCurto } from '@/app/utils/blog/formatos';
import { SectionHeading } from '../SectionHeading';

/**
 * The next concerts, beside the curiosities: date-led rows. A row opens the
 * event's details in the same sheet as the blog's calendar.
 */
export function UpcomingConcerts({
  copy,
  language,
  events,
}: {
  copy: HomeCopy['concerts'];
  language: Idioma;
  events: CalendarEventData[];
}) {
  return (
    <ProvedorDeEventos idioma={language}>
      <div className="flex flex-col gap-6">
        <SectionHeading
          title={copy.title}
          action={{ label: copy.agenda, href: rotasDoBlog.agenda(language) }}
        />
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="group relative flex items-center gap-5 rounded-card bg-sup-2 p-4"
            >
              <span className="flex w-14 shrink-0 flex-col items-center">
                <span className="font-display text-[2.25rem] leading-none text-ouro-texto">
                  {diaDoMes(event.start, event.timeZone)}
                </span>
                <span className="t-legenda">
                  {mesCurto(event.start, language, event.timeZone)}
                </span>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <BotaoDoEvento
                  evento={event}
                  className="font-medium leading-snug group-hover:text-ouro-texto"
                >
                  {event.title}
                </BotaoDoEvento>
                <span className="t-rotulo text-texto-suave">
                  {[
                    event.venue.name,
                    event.venue.city !== 'N/A' && event.venue.city,
                    horaDoEvento(
                      event.start,
                      language,
                      event.timeZone,
                      event.allDay
                    ),
                    event.isFree && copy.free,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ProvedorDeEventos>
  );
}
