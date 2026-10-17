import { apiFetch } from './client';

type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ListView = 'cards' | 'list';
/** Students: how long they mean to study. */
export type StudyHorizon = 'MONTHS' | 'YEAR' | 'YEARS' | 'LIFE';

/**
 * A conta, como `GET /profile?include=account` a devolve — os mesmos campos da
 * sessão do NextAuth, mais forma de login e plano.
 */
export interface ProfileAccount {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string;
  image: string | null;
  bio: string | null;
  role: number;
  isTeacher: boolean;
  isStudent: boolean;
  userType: 'MUSIC_STUDENT' | 'CASUAL_USER' | 'PROFESSIONAL' | 'TEACHER' | null;
  onboardingCompleted: boolean;
  emailVerified: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  favoriteComposerId: string | null;
  favoriteEpochId: string | null;
  experienceLevel: Level;
  /** Minutes per week. */
  practiceTimePerWeek: number | null;
  studyHorizon: StudyHorizon | null;
  profilePublic: boolean;
  showLocation: boolean;
  /** How lists render on the site; `null` until the person picks one. */
  listView: ListView | null;
  /** The site language the person chose; `null` until the first choice. */
  language: 'pt' | 'en' | null;
  currentPlan: string;
  planExpiresAt: string | null;
  isTrialActive: boolean;
  totalXP: number;
  /** The team's approval of the credentials (badge, catalog editing). */
  teacherVerified: boolean | null;
  /** The teacher portal is open: an active teacher profile (a Mentor or
   * Maestro subscriber at once, an invited teacher after accepting). */
  teacherPortal: boolean | null;
  studentInviteStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | null;
  login: { hasPassword: boolean; providers: string[] };
}

/** Corpo de `POST /profile/onboarding` (e de `PATCH /profile`). */
export interface ProfileWriteBody {
  account?: Partial<{
    firstName: string;
    lastName: string;
    bio: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    userType: ProfileAccount['userType'];
    experienceLevel: Level;
    favoriteComposerId: string | null;
    favoriteEpochId: string | null;
    practiceTimePerWeek: number | null;
    studyHorizon: StudyHorizon | null;
    profilePublic: boolean;
    showLocation: boolean;
    listView: ListView;
  }>;
  instruments?: Array<{
    instrumentId: string;
    level: Level;
    isPrimary: boolean;
    isLearning: boolean;
  }>;
}

export const profileApi = {
  /** O "quem sou eu": só a conta, para cada navegação. */
  me: () =>
    apiFetch<{ account: ProfileAccount }>('/profile', {
      query: { include: 'account' },
    }),

  update: (body: ProfileWriteBody) =>
    apiFetch<{ account: ProfileAccount }>('/profile', {
      method: 'PATCH',
      body,
    }),

  /** Guarda o idioma escolhido no site: os e-mails seguem ele. */
  setLanguage: (language: 'pt' | 'en') =>
    apiFetch<void>('/profile/language', {
      method: 'PATCH',
      body: { language },
    }),

  completeOnboarding: (body: ProfileWriteBody) =>
    apiFetch<{ account: ProfileAccount }>('/profile/onboarding', {
      method: 'POST',
      body,
    }),
  /**
   * Portabilidade (LGPD, RN-2): tudo o que é da pessoa, num documento. A API
   * limita a 3 pedidos por hora e declara no próprio arquivo o que fica de
   * fora (credenciais, trilha administrativa, notas privadas do professor).
   */
  exportarDados: () =>
    apiFetch<unknown>('/profile/export', { cache: 'no-store' }),
};
