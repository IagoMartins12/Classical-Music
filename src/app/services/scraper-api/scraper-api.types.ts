// app/services/scraper-api/scraper-api.types.ts

export interface ScraperInfo {
  id: string;
  name: string;
  slug: string;
}

export interface ScrapedEvent {
  title: string;
  slug: string;
  description: string;
  type: EventType;
  startDate: Date | string;
  startTime: string | null;
  endDate?: Date | string | null;
  endTime?: string | null;
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
  events?: ScrapedEvent[];
  errors: string[];
  duration: number;
}

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface ScraperJob {
  id: string;
  scraperId: string;
  status: JobStatus;
  progress: {
    current: number;
    total: number;
    percentage: number;
    message: string;
  };
  startTime: number;
  endTime?: number;
  duration?: number;
  result?: ScraperResponse;
  error?: string;
}

export interface JobResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface JobStatusResponse {
  success: boolean;
  job: ScraperJob;
  message?: string;
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
