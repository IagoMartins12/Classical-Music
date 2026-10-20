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
  /** Endereço legível do evento, quando a API manda. */
  slug?: string;
  /** Evento sem horário (exposição, festival de vários dias). */
  allDay?: boolean;
  /** O fuso da casa (`America/Sao_Paulo`, `America/Manaus`…). */
  timeZone?: string;
  subtitle?: string;
  room?: string;
  conductor?: string;
  ensemble?: string;
  ticketInfo?: string;
  /** Destaque do mês: posição (1 a 3) e tamanho no mosaico da agenda. */
  isFeatured?: boolean;
  featuredOrder?: number;
  featuredSize?: 'large' | 'normal';
  /** Picked by an admin for the main site's home. */
  showOnMainHome?: boolean;
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
  slug?: string | null;
  allDay?: boolean;
  timeZone?: string | null;
  subtitle?: string | null;
  room?: string | null;
  conductor?: string | null;
  ensemble?: string | null;
  ticketInfo?: string | null;
  isFeatured?: boolean;
  featuredOrder?: number | null;
  featuredSize?: string | null;
  showOnMainHome?: boolean;
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
    slug: event.slug || undefined,
    allDay: !!event.allDay,
    timeZone: event.timeZone || undefined,
    subtitle: event.subtitle || undefined,
    room: event.room || undefined,
    conductor: event.conductor || undefined,
    ensemble: event.ensemble || undefined,
    ticketInfo: event.ticketInfo || undefined,
    isFeatured: !!event.isFeatured,
    featuredOrder: event.featuredOrder ?? undefined,
    featuredSize:
      event.featuredSize === 'large'
        ? 'large'
        : event.isFeatured
          ? 'normal'
          : undefined,
    showOnMainHome: !!event.showOnMainHome,
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
  isFeatured: boolean;
  featuredOrder: string;
  featuredSize: 'large' | 'normal';
  showOnMainHome: boolean;
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
    isFeatured: values.isFeatured,
    showOnMainHome: values.showOnMainHome,
    ...(values.isFeatured
      ? {
          featuredOrder: values.featuredOrder
            ? parseInt(values.featuredOrder)
            : undefined,
          featuredSize: values.featuredSize,
        }
      : {}),
  };

  return id
    ? apiFetch(`/blog/events/${id}`, { method: 'PATCH', body })
    : apiFetch('/blog/events', { method: 'POST', body });
}

/** O dia (`AAAA-MM-DD`) de um instante no fuso de Brasília, para `<input type="date">`. */
function diaDoInstante(valor: string | null | undefined) {
  if (!valor) return '';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(data);
}

/**
 * O evento inteiro, para editar. O calendário só traz o resumo (título,
 * início, local); editar a partir dele abria o formulário com data e local
 * vazios e, ao salvar, gravava `null` no que o resumo não tinha (regente,
 * sala, subtítulo). Lê com a sessão: evento fora do ar só aparece para
 * administrador.
 */
export async function loadEventForEdit(id: string): Promise<EventFormValues> {
  const { event: e } = await apiFetch<{ event: Record<string, unknown> }>(
    `/blog/events/${id}`,
    { cache: 'no-store' }
  );
  const texto = (v: unknown) => (typeof v === 'string' ? v : '');
  return {
    title: texto(e.title),
    subtitle: texto(e.subtitle),
    description: texto(e.description),
    type: texto(e.type) || 'CONCERT',
    status: texto(e.status) || 'PUBLISHED',
    venueId: texto(e.venueId),
    room: texto(e.room),
    startDate: diaDoInstante(texto(e.startDate)),
    endDate: diaDoInstante(texto(e.endDate)),
    startTime: texto(e.startTime),
    endTime: texto(e.endTime),
    duration: typeof e.duration === 'number' ? String(e.duration) : '',
    doors: texto(e.doors),
    conductor: texto(e.conductor),
    ensemble: texto(e.ensemble),
    ticketUrl: texto(e.ticketUrl),
    isFree: e.isFree === true,
    imageUrl: texto(e.imageUrl),
    venueDetails: texto(e.venueDetails),
    ticketInfo: texto(e.ticketInfo),
    isFeatured: e.isFeatured === true,
    featuredOrder:
      typeof e.featuredOrder === 'number' ? String(e.featuredOrder) : '',
    featuredSize: e.featuredSize === 'large' ? 'large' : 'normal',
    showOnMainHome: e.showOnMainHome === true,
  };
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
