// hooks/userStore.ts - Interface User atualizada
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
  isTeacher?: boolean;
  isStudent?: boolean;
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

export const useUserStore = create<UserState>()(
  subscribeWithSelector((set) => ({
    // Initial state
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isHydrated: false,

    // Actions
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

// Hooks com proteção SSR
export const useUser = () => {
  const store = useUserStore();
  return typeof window !== 'undefined' ? store.user : null;
};

export const useIsAuthenticated = () => {
  const store = useUserStore();
  return typeof window !== 'undefined' ? store.isAuthenticated : false;
};

export const useUserLoading = () => {
  const store = useUserStore();
  return typeof window !== 'undefined' ? store.isLoading : false;
};

export const useUpdateUser = () => {
  const store = useUserStore();
  return typeof window !== 'undefined' ? store.updateUser : () => {};
};
