// hooks/userStore.ts - Interface User atualizada
import type { StudentInviteStatus } from '@/app/types/portal';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// 🆕 Interface User atualizada com novos campos
export interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null;
  bio?: string | null;
  gender?: string | null;
  birthday?: Date | null;
  role: number;
  userType?:
    | 'MUSIC_STUDENT'
    | 'CASUAL_USER'
    | 'PROFESSIONAL'
    | 'TEACHER'
    | null;
  onboardingCompleted: boolean;

  // 🆕 Campos de localização atualizados
  city?: string | null;
  state?: string | null;
  country?: string | null;

  // 🆕 Campos de telefone
  phone?: string | null; // Telefone completo em formato E.164 (+5511999999999)
  phoneCountryCode?: string | null; // Código do país (BR, US, etc.)
  phoneNumber?: string | null; // Apenas o número sem código do país

  favoriteComposerId?: string | null;
  favoriteEpochId?: string | null;
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
  practiceTimePerWeek?: number | null;
  profilePublic: boolean;
  showLocation: boolean;
  isTeacher?: boolean | null;
  isStudent?: boolean | null;
  studentInviteStatus?: null | StudentInviteStatus;

  // Lidos pela tela de conta. Existiam só no tipo que o NextAuth aumentava
  // (`types/next-auth.d.ts`), e o store nunca os guardou — a tela os lia como
  // `undefined`. Agora vêm da sessão da API, que os traz de verdade.
  name?: string | null;
  emailVerified?: string | null;
}

interface UserState {
  // User state
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
}

// hooks/userStore.ts
export const useUserStore = create<UserState>()(
  subscribeWithSelector((set) => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isHydrated: false,

    setUser: (user) =>
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      }),

    updateUser: (data) =>
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      })),

    setLoading: (loading) => set({ isLoading: loading }),

    setHydrated: (hydrated) => set({ isHydrated: hydrated }),

    logout: () =>
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }),
  }))
);

// ✅ Use seletores otimizados
export const useUser = () => useUserStore((state) => state.user);
export const useIsAuthenticated = () =>
  useUserStore((state) => state.isAuthenticated);
