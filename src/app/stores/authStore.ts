// stores/authStore.ts (versão com proteção SSR)
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

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
  city?: string | null;
  state?: string | null;
  country?: string | null;
  favoriteComposerId?: string | null;
  favoriteEpochId?: string | null;
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
  practiceTimePerWeek?: number | null;
  profilePublic: boolean;
  showLocation: boolean;
}

export interface OnboardingData {
  userType?: 'MUSIC_STUDENT' | 'CASUAL_USER' | 'PROFESSIONAL' | 'TEACHER';
  instruments?: Array<{
    id: string;
    name: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    isPrimary: boolean;
    isLearning: boolean;
  }>;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  favoriteComposerId?: string;
  favoriteEpochId?: string;
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  practiceTimePerWeek?: number;
  image?: string;
  bio?: string;
}

interface AuthState {
  // User state
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean; // Nova flag para controlar hidratação

  // Modal state
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  isOnboardingModalOpen: boolean;

  // Onboarding state
  onboardingStep: number;
  onboardingData: OnboardingData;
  isOnboardingLoading: boolean;

  // Login/Register form state
  loginForm: {
    email: string;
    password: string;
    isLoading: boolean;
    error?: string;
  };

  registerForm: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    isLoading: boolean;
    error?: string;
  };

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;

  // Modal actions
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  switchToRegister: () => void;
  switchToLogin: () => void;

  // Onboarding actions
  openOnboardingModal: () => void;
  closeOnboardingModal: () => void;
  setOnboardingStep: (step: number) => void;
  nextOnboardingStep: () => void;
  prevOnboardingStep: () => void;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  resetOnboardingData: () => void;
  setOnboardingLoading: (loading: boolean) => void;

  // Form actions
  updateLoginForm: (data: Partial<AuthState['loginForm']>) => void;
  updateRegisterForm: (data: Partial<AuthState['registerForm']>) => void;
  resetLoginForm: () => void;
  resetRegisterForm: () => void;

  // Auth actions
  logout: () => void;
  completeOnboarding: () => void;
}

const initialLoginForm = {
  email: '',
  password: '',
  isLoading: false,
  error: undefined,
};

const initialRegisterForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  isLoading: false,
  error: undefined,
};

const initialOnboardingData: OnboardingData = {
  userType: undefined,
  instruments: [],
  location: {},
  favoriteComposerId: undefined,
  favoriteEpochId: undefined,
  experienceLevel: undefined,
  practiceTimePerWeek: undefined,
  image: undefined,
  bio: undefined,
};

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isHydrated: false,

    // Modal state
    isLoginModalOpen: false,
    isRegisterModalOpen: false,
    isOnboardingModalOpen: false,

    // Onboarding state
    onboardingStep: 1,
    onboardingData: initialOnboardingData,
    isOnboardingLoading: false,

    // Form state
    loginForm: initialLoginForm,
    registerForm: initialRegisterForm,

    // Actions
    setUser: (user) =>
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      }),

    setLoading: (loading) => set({ isLoading: loading }),

    setHydrated: (hydrated) => set({ isHydrated: hydrated }),

    // Modal actions
    openLoginModal: () =>
      set({
        isLoginModalOpen: true,
        isRegisterModalOpen: false,
        isOnboardingModalOpen: false,
      }),

    closeLoginModal: () =>
      set({
        isLoginModalOpen: false,
        loginForm: initialLoginForm,
      }),

    openRegisterModal: () =>
      set({
        isRegisterModalOpen: true,
        isLoginModalOpen: false,
        isOnboardingModalOpen: false,
      }),

    closeRegisterModal: () =>
      set({
        isRegisterModalOpen: false,
        registerForm: initialRegisterForm,
      }),

    switchToRegister: () =>
      set({
        isLoginModalOpen: false,
        isRegisterModalOpen: true,
        loginForm: initialLoginForm,
      }),

    switchToLogin: () =>
      set({
        isRegisterModalOpen: false,
        isLoginModalOpen: true,
        registerForm: initialRegisterForm,
      }),

    // Onboarding actions
    openOnboardingModal: () =>
      set({
        isOnboardingModalOpen: true,
        isLoginModalOpen: false,
        isRegisterModalOpen: false,
        onboardingStep: 1,
      }),

    closeOnboardingModal: () =>
      set({
        isOnboardingModalOpen: false,
        onboardingStep: 1,
        onboardingData: initialOnboardingData,
      }),

    setOnboardingStep: (step) => set({ onboardingStep: step }),

    nextOnboardingStep: () => {
      const { onboardingStep } = get();
      if (onboardingStep < 6) {
        set({ onboardingStep: onboardingStep + 1 });
      }
    },

    prevOnboardingStep: () => {
      const { onboardingStep } = get();
      if (onboardingStep > 1) {
        set({ onboardingStep: onboardingStep - 1 });
      }
    },

    updateOnboardingData: (data) =>
      set((state) => ({
        onboardingData: { ...state.onboardingData, ...data },
      })),

    resetOnboardingData: () => set({ onboardingData: initialOnboardingData }),

    setOnboardingLoading: (loading) => set({ isOnboardingLoading: loading }),

    // Form actions
    updateLoginForm: (data) =>
      set((state) => ({
        loginForm: { ...state.loginForm, ...data },
      })),

    updateRegisterForm: (data) =>
      set((state) => ({
        registerForm: { ...state.registerForm, ...data },
      })),

    resetLoginForm: () => set({ loginForm: initialLoginForm }),

    resetRegisterForm: () => set({ registerForm: initialRegisterForm }),

    // Auth actions
    logout: () =>
      set({
        user: null,
        isAuthenticated: false,
        isLoginModalOpen: false,
        isRegisterModalOpen: false,
        isOnboardingModalOpen: false,
        loginForm: initialLoginForm,
        registerForm: initialRegisterForm,
        onboardingData: initialOnboardingData,
        onboardingStep: 1,
      }),

    completeOnboarding: () =>
      set((state) => ({
        user: state.user ? { ...state.user, onboardingCompleted: true } : null,
        isOnboardingModalOpen: false,
        onboardingStep: 1,
        onboardingData: initialOnboardingData,
      })),
  }))
);

// Hooks com proteção SSR
export const useUser = () => {
  const store = useAuthStore();
  return typeof window !== 'undefined' ? store.user : null;
};

export const useIsAuthenticated = () => {
  const store = useAuthStore();
  return typeof window !== 'undefined' ? store.isAuthenticated : false;
};

export const useAuthLoading = () => {
  const store = useAuthStore();
  return typeof window !== 'undefined' ? store.isLoading : false;
};

// Hooks para modais com proteção SSR e cache
export const useLoginModal = () => {
  const store = useAuthStore();

  if (typeof window === 'undefined') {
    return {
      isOpen: false,
      open: () => {},
      close: () => {},
      switchToRegister: () => {},
    };
  }

  return {
    isOpen: store.isLoginModalOpen,
    open: store.openLoginModal,
    close: store.closeLoginModal,
    switchToRegister: store.switchToRegister,
  };
};

export const useRegisterModal = () => {
  const store = useAuthStore();

  if (typeof window === 'undefined') {
    return {
      isOpen: false,
      open: () => {},
      close: () => {},
      switchToLogin: () => {},
    };
  }

  return {
    isOpen: store.isRegisterModalOpen,
    open: store.openRegisterModal,
    close: store.closeRegisterModal,
    switchToLogin: store.switchToLogin,
  };
};

export const useOnboardingModal = () => {
  const store = useAuthStore();

  if (typeof window === 'undefined') {
    return {
      isOpen: false,
      open: () => {},
      close: () => {},
      step: 1,
      data: initialOnboardingData,
      isLoading: false,
      setStep: () => {},
      nextStep: () => {},
      prevStep: () => {},
      updateData: () => {},
      resetData: () => {},
      setLoading: () => {},
      complete: () => {},
    };
  }

  return {
    isOpen: store.isOnboardingModalOpen,
    open: store.openOnboardingModal,
    close: store.closeOnboardingModal,
    step: store.onboardingStep,
    data: store.onboardingData,
    isLoading: store.isOnboardingLoading,
    setStep: store.setOnboardingStep,
    nextStep: store.nextOnboardingStep,
    prevStep: store.prevOnboardingStep,
    updateData: store.updateOnboardingData,
    resetData: store.resetOnboardingData,
    setLoading: store.setOnboardingLoading,
    complete: store.completeOnboarding,
  };
};

export const useLoginForm = () => {
  const store = useAuthStore();

  if (typeof window === 'undefined') {
    return {
      form: initialLoginForm,
      update: () => {},
      reset: () => {},
    };
  }

  return {
    form: store.loginForm,
    update: store.updateLoginForm,
    reset: store.resetLoginForm,
  };
};

export const useRegisterForm = () => {
  const store = useAuthStore();

  if (typeof window === 'undefined') {
    return {
      form: initialRegisterForm,
      update: () => {},
      reset: () => {},
    };
  }

  return {
    form: store.registerForm,
    update: store.updateRegisterForm,
    reset: store.resetRegisterForm,
  };
};
