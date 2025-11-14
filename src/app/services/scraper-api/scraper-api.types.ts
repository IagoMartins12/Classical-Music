// ==================== TIPOS COMPARTILHADOS ====================

export interface ScrapedEvent {
  title: string;
  slug: string;
  description: string;
  type: EventType;
  startDate: Date | string;
  startTime: string | null;
  endDate: Date | string | null;
  endTime: string | null;
  venueDetails: string | null;
  ticketUrl: string;
  externalUrl: string;
  ticketInfo: string | null;
  externalId: string;
  imageUrl: string | null;
  composerNames: string[];
  performers: string[];
  program: string | null;
  isDuplicate?: boolean;
}

export type EventType =
  | 'CONCERT'
  | 'OPERA'
  | 'RECITAL'
  | 'CHAMBER_MUSIC'
  | 'BALLET'
  | 'CHORAL'
  | 'FESTIVAL'
  | 'WORKSHOP'
  | 'MASTERCLASS'
  | 'OPEN_REHEARSAL'
  | 'MATINEE';

export interface ScraperResponse {
  success: boolean;
  eventsFound: number;
  eventsScraped: number;
  newEvents: number;
  duplicates: number;
  events: ScrapedEvent[];
  errors: string[];
  executionTime: number;
}

export interface ScraperConfig {
  id: string;
  name: string;
  description: string;
  venue: string;
  icon: string;
  color: string;
  endpoint: string;
  enabled: boolean;
  supportsDateRange?: boolean;
  defaultDateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: number;
  details: ImportDetail[];
}

export interface ImportDetail {
  eventId: string;
  title: string;
  status: 'success' | 'error' | 'duplicate';
  message: string;
}
