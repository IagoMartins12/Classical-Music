import { apiFetch } from './client';

type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

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
  practiceTimePerWeek: number | null;
  profilePublic: boolean;
  showLocation: boolean;
  currentPlan: string;
  planExpiresAt: string | null;
  isTrialActive: boolean;
  totalXP: number;
  teacherVerified: boolean | null;
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
    profilePublic: boolean;
    showLocation: boolean;
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

  completeOnboarding: (body: ProfileWriteBody) =>
    apiFetch<{ account: ProfileAccount }>('/profile/onboarding', {
      method: 'POST',
      body,
    }),
};
