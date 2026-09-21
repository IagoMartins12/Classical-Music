// app/requests/calendar-requests.ts — calendário de eventos do blog, pela API (Etapa 6)
//
// Isomórfico. A página lê com ISR e a tag `blog-calendar` (a API revalida
// quando um evento muda); o navegador relê ao trocar de mês ou de filtro, com
// a sessão — e aí o administrador vê também o que não foi publicado. Os
// filtros (locais, cidades, estados) vêm na mesma resposta dos eventos.
import { apiFetch } from '@/app/libs/api/client';
import { BLOG_TAGS } from './blog/articles';

export interface CalendarEventData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  composers: Array<{
    id: string;
    name: string;
    portraitUrl?: string;
  }>;
  imageUrl?: string;
  /** A API não manda o link da página de origem do evento: fica `null`. */
  externalUrl: string | null;
  description?: string;
  ticketUrl?: string;
  isFree: boolean;
}

export interface CalendarFilterOptions {
  venues: Array<{ id: string; name: string; city: string }>;
  cities: string[];
  states: string[];
}

export interface CalendarQuery {
  city?: string;
  state?: string;
  venueId?: string;
  type?: string;
}

interface ApiCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: string;
  venue: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
  } | null;
  composers?: Array<{ id: string; name: string; portraitUrl?: string | null }>;
  imageUrl?: string | null;
  description?: string | null;
  ticketUrl?: string | null;
  isFree: boolean;
  externalUrl?: string | null;
}

interface ApiCalendar {
  events: ApiCalendarEvent[];
  filters?: {
    cities: Array<string | null>;
    states: Array<string | null>;
    venues: Array<{ id: string; name: string; city: string | null }>;
  };
}

function toEvent(event: ApiCalendarEvent): CalendarEventData {
  return {
    id: event.id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    type: event.type,
    venue: {
      id: event.venue?.id ?? '',
      name: event.venue?.name ?? '',
      city: event.venue?.city || 'N/A',
      state: event.venue?.state || 'N/A',
    },
    composers: (event.composers ?? []).map((composer) => ({
      id: composer.id,
      name: composer.name,
      portraitUrl: composer.portraitUrl || undefined,
    })),
    imageUrl: event.imageUrl || undefined,
    externalUrl: event.externalUrl ?? null,
    description: event.description || undefined,
    ticketUrl: event.ticketUrl || undefined,
    isFree: event.isFree,
  };
}

const present = (values: Array<string | null>) =>
  values.filter((value): value is string => !!value);

/**
 * Eventos de um período (a API aceita até 400 dias) e os filtros. `fresh`
 * lê sem cache e com a sessão — o navegador.
 */
export async function loadCalendar(
  start: Date,
  end: Date,
  filters: CalendarQuery = {},
  options: { fresh?: boolean } = {}
): Promise<{ events: CalendarEventData[]; filters: CalendarFilterOptions }> {
  const query = {
    start: start.toISOString(),
    end: end.toISOString(),
    city: filters.city || undefined,
    state: filters.state || undefined,
    venueId: filters.venueId || undefined,
    type: filters.type || undefined,
  };

  const data = options.fresh
    ? await apiFetch<ApiCalendar>('/blog/calendar', {
        query,
        cache: 'no-store',
      })
    : await apiFetch<ApiCalendar>('/blog/calendar', {
        query,
        next: { revalidate: 600, tags: [BLOG_TAGS.calendar] },
      });

  return {
    events: data.events.map(toEvent),
    filters: {
      venues: (data.filters?.venues ?? []).map((venue) => ({
        id: venue.id,
        name: venue.name,
        city: venue.city || 'N/A',
      })),
      cities: present(data.filters?.cities ?? []),
      states: present(data.filters?.states ?? []),
    },
  };
}

// ---------------------------------------------------------------------------
// Cadastro de eventos e locais (administração, navegador)
// ---------------------------------------------------------------------------

/** Campo vazio do formulário vira `null`: a API recusa texto vazio em data e URL. */
const blankToNull = (value: string) => (value.trim() ? value.trim() : null);

export interface EventFormValues {
  title: string;
  subtitle: string;
  description: string;
  type: string;
  status: string;
  venueId: string;
  room: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  duration: string;
  doors: string;
  conductor: string;
  ensemble: string;
  ticketUrl: string;
  isFree: boolean;
  imageUrl: string;
  venueDetails: string;
  ticketInfo: string;
}

/**
 * Cria ou atualiza um evento. O legado chamava `/api/events`, rota que nunca
 * existiu no Next — o cadastro pela tela não funcionava.
 */
export function saveEvent(values: EventFormValues, id?: string) {
  const body = {
    title: values.title.trim(),
    subtitle: blankToNull(values.subtitle),
    description: blankToNull(values.description),
    type: values.type,
    status: values.status,
    venueId: values.venueId,
    room: blankToNull(values.room),
    // A API guarda o início como instante (com fuso) e o horário à parte; a
    // tela tem data e hora separadas, no fuso de quem cadastra. Só a data
    // viraria meia-noite UTC — 21h do dia anterior em Brasília.
    startDate:
      values.startDate && values.startTime
        ? new Date(`${values.startDate}T${values.startTime}`).toISOString()
        : values.startDate,
    endDate: blankToNull(values.endDate),
    startTime: blankToNull(values.startTime),
    endTime: blankToNull(values.endTime),
    duration: values.duration ? parseInt(values.duration) : null,
    doors: blankToNull(values.doors),
    conductor: blankToNull(values.conductor),
    ensemble: blankToNull(values.ensemble),
    ticketUrl: blankToNull(values.ticketUrl),
    isFree: values.isFree,
    imageUrl: blankToNull(values.imageUrl),
    venueDetails: blankToNull(values.venueDetails),
    ticketInfo: blankToNull(values.ticketInfo),
  };

  return id
    ? apiFetch(`/blog/events/${id}`, { method: 'PATCH', body })
    : apiFetch('/blog/events', { method: 'POST', body });
}

export interface VenueFormValues {
  name: string;
  shortName: string;
  city: string;
  state: string;
  country: string;
  address: string;
  zipCode: string;
  website: string;
  email: string;
  phone: string;
  capacity: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  isActive: boolean;
}

/** Cria ou atualiza um local (o legado chamava `/api/venues`, que não existia). */
export function saveVenue(values: VenueFormValues, id?: string) {
  const body = {
    name: values.name.trim(),
    shortName: blankToNull(values.shortName),
    city: values.city.trim(),
    state: values.state.trim(),
    country: values.country.trim() || 'Brasil',
    address: blankToNull(values.address),
    zipCode: blankToNull(values.zipCode),
    website: blankToNull(values.website),
    email: blankToNull(values.email),
    phone: blankToNull(values.phone),
    capacity: values.capacity ? parseInt(values.capacity) : null,
    description: blankToNull(values.description),
    logoUrl: blankToNull(values.logoUrl),
    coverImageUrl: blankToNull(values.coverImageUrl),
    isActive: values.isActive,
  };

  return id
    ? apiFetch(`/blog/venues/${id}`, { method: 'PATCH', body })
    : apiFetch('/blog/venues', { method: 'POST', body });
}
