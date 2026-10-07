import Link from 'next/link';
import { Revelar } from '@/app/components/ui/Revelar';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import type { HomeCopy } from '@/app/conteudo/site/home';
import type { CalendarEventData } from '@/app/requests/calendar-requests';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { diaDoMes, horaDoEvento, mesCurto } from '@/app/utils/blog/formatos';
import { SectionHeading } from '../SectionHeading';

/** The next concerts from the blog calendar, as date-led rows. */
export function UpcomingConcerts({
  copy,
  language,
  events,
}: {
  copy: HomeCopy['concerts'];
  language: Idioma;
  events: CalendarEventData[];
}) {
  if (!events.length) return null;
  const agenda = rotasDoBlog.agenda(language);
  return (
    <Revelar as="section" className="section-wrap flex flex-col gap-6 py-12">
      <SectionHeading
        title={copy.title}
        action={{ label: copy.agenda, href: agenda }}
      />
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              href={agenda}
              className="group flex h-full items-center gap-5 rounded-card bg-sup-2 p-4"
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
                <span className="font-medium leading-snug group-hover:text-ouro-texto">
                  {event.title}
                </span>
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
            </Link>
          </li>
        ))}
      </ul>
    </Revelar>
  );
}
