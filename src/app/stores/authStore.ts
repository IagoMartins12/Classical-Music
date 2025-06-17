// stores/authStore.ts - Versão com persistência completa
import { create } from 'zustand';
import {
  subscribeWithSelector,
  persist,
  createJSONStorage,
} from 'zustand/middleware';
import { debounce } from 'lodash';

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

interface OnboardingState {
  // Persistência do onboarding
  currentStep: number;
  data: OnboardingData;
  isStarted: boolean;
  lastSavedAt?: number;

  // Estado temporário (não persistido)
  isModalOpen: boolean;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
}

interface AuthState {
  // Modal state
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  isPromptModalOpen: boolean;

  // Onboarding persistido
  onboarding: OnboardingState;

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

  // Modal actions
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  openPromptModal: () => void;
  closePromptModal: () => void;
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
  restoreOnboardingProgress: () => void;
  saveOnboardingProgress: () => void;
  hasOnboardingProgress: () => boolean;
  markOnboardingComplete: () => void;

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

const initialOnboardingState: OnboardingState = {
  currentStep: 1,
  data: initialOnboardingData,
  isStarted: false,
  lastSavedAt: undefined,
  isModalOpen: false,
  isLoading: false,
  hasUnsavedChanges: false,
};

// Função debounced para auto-save
const createDebouncedSave = (saveFunction: () => void) =>
  debounce(saveFunction, 1000, { leading: false, trailing: true });

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set, get) => {
        // Auto-save debounced function
        const debouncedSave = createDebouncedSave(() => {
          const state = get();
          if (state.onboarding.hasUnsavedChanges) {
            set((state) => ({
              onboarding: {
                ...state.onboarding,
                hasUnsavedChanges: false,
                lastSavedAt: Date.now(),
              },
            }));

            if (process.env.NODE_ENV === 'development') {
              console.log('💾 Onboarding auto-saved:', get().onboarding);
            }
          }
        });

        return {
          // Modal state
          isLoginModalOpen: false,
          isRegisterModalOpen: false,
          isPromptModalOpen: false,

          // Onboarding state
          onboarding: initialOnboardingState,

          // Form state
          loginForm: initialLoginForm,
          registerForm: initialRegisterForm,

          // Modal actions
          openLoginModal: () =>
            set({
              isLoginModalOpen: true,
              isRegisterModalOpen: false,
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
            }),

          closeRegisterModal: () =>
            set({
              isRegisterModalOpen: false,
              registerForm: initialRegisterForm,
            }),

          openPromptModal: () =>
            set({
              isPromptModalOpen: true,
            }),

          closePromptModal: () =>
            set({
              isPromptModalOpen: false,
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
          openOnboardingModal: () => {
            const currentOnboarding = get().onboarding;

            set((state) => ({
              isLoginModalOpen: false,
              isRegisterModalOpen: false,
              onboarding: {
                ...state.onboarding,
                isModalOpen: true,
                isStarted: true,
              },
            }));

            // Restaurar progresso se existir
            if (currentOnboarding.isStarted && currentOnboarding.lastSavedAt) {
              console.log('🔄 Restaurando progresso do onboarding...');
              get().restoreOnboardingProgress();
            }
          },

          closeOnboardingModal: () => {
            // Salvar progresso antes de fechar
            get().saveOnboardingProgress();

            set((state) => ({
              onboarding: {
                ...state.onboarding,
                isModalOpen: false,
              },
            }));
          },

          setOnboardingStep: (step) => {
            set((state) => ({
              onboarding: {
                ...state.onboarding,
                currentStep: step,
                hasUnsavedChanges: true,
              },
            }));
            debouncedSave();
          },

          nextOnboardingStep: () => {
            const currentStep = get().onboarding.currentStep;
            if (currentStep < 6) {
              set((state) => ({
                onboarding: {
                  ...state.onboarding,
                  currentStep: currentStep + 1,
                  hasUnsavedChanges: true,
                },
              }));
              debouncedSave();
            }
          },

          prevOnboardingStep: () => {
            const currentStep = get().onboarding.currentStep;
            if (currentStep > 1) {
              set((state) => ({
                onboarding: {
                  ...state.onboarding,
                  currentStep: currentStep - 1,
                  hasUnsavedChanges: true,
                },
              }));
              debouncedSave();
            }
          },

          updateOnboardingData: (data) => {
            set((state) => ({
              onboarding: {
                ...state.onboarding,
                data: { ...state.onboarding.data, ...data },
                hasUnsavedChanges: true,
              },
            }));
            debouncedSave();
          },

          resetOnboardingData: () => {
            set({
              onboarding: initialOnboardingState,
            });

            // Limpar localStorage também
            if (typeof window !== 'undefined') {
              localStorage.removeItem('classical-hub-onboarding');
            }
          },

          setOnboardingLoading: (loading) =>
            set((state) => ({
              onboarding: {
                ...state.onboarding,
                isLoading: loading,
              },
            })),

          restoreOnboardingProgress: () => {
            const state = get();
            if (state.onboarding.isStarted && state.onboarding.lastSavedAt) {
              console.log(
                '✅ Progresso restaurado - Etapa:',
                state.onboarding.currentStep
              );
            }
          },

          saveOnboardingProgress: () => {
            set((state) => ({
              onboarding: {
                ...state.onboarding,
                hasUnsavedChanges: false,
                lastSavedAt: Date.now(),
              },
            }));
          },

          hasOnboardingProgress: () => {
            const state = get();
            return (
              state.onboarding.isStarted &&
              (state.onboarding.currentStep > 1 ||
                Object.keys(state.onboarding.data).some(
                  (key) =>
                    state.onboarding.data[key as keyof OnboardingData] !==
                    undefined
                ))
            );
          },

          markOnboardingComplete: () => {
            // Salvar dados finais e limpar estado temporário
            get().resetOnboardingData();
          },

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
              isLoginModalOpen: false,
              isRegisterModalOpen: false,
              loginForm: initialLoginForm,
              registerForm: initialRegisterForm,
              onboarding: initialOnboardingState,
            }),

          completeOnboarding: () => {
            get().markOnboardingComplete();
            set((state) => ({
              onboarding: {
                ...initialOnboardingState,
                isModalOpen: false,
              },
            }));
          },
        };
      },
      {
        name: 'classical-hub-auth',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Apenas persistir dados do onboarding, não modais
          onboarding: {
            currentStep: state.onboarding.currentStep,
            data: state.onboarding.data,
            isStarted: state.onboarding.isStarted,
            lastSavedAt: state.onboarding.lastSavedAt,
          },
        }),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // Migração de versões futuras se necessário
          return persistedState;
        },
      }
    )
  )
);

// Hooks com proteção SSR e persistência
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

export const usePromptModal = () => {
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
    isOpen: store.isPromptModalOpen,
    open: store.openPromptModal,
    close: store.closePromptModal,
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
      hasProgress: false,
      lastSaved: undefined,
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
    isOpen: store.onboarding.isModalOpen,
    open: store.openOnboardingModal,
    close: store.closeOnboardingModal,
    step: store.onboarding.currentStep,
    data: store.onboarding.data,
    isLoading: store.onboarding.isLoading,
    hasProgress: store.hasOnboardingProgress(),
    lastSaved: store.onboarding.lastSavedAt,
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
