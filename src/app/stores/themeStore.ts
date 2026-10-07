// stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import React from 'react';
import { flushSync } from 'react-dom';
import { ThemeMode } from '../thema';

interface ThemeState {
  mode: ThemeMode;
  isTransitioning: boolean;
  hasUserPreference: boolean; // 🆕 Flag para indicar se usuário fez escolha manual
  toggleTheme: (origem?: OrigemDaTroca) => void;
  setTheme: (
    mode: ThemeMode,
    isUserChoice?: boolean,
    origem?: OrigemDaTroca
  ) => void;
  applyTheme: (mode: ThemeMode) => void;
  initializeFromSystem: () => void; // 🆕 Método para inicializar do sistema
}

// Função para detectar tema do sistema
function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Como o círculo da troca de tema se move.
 *
 * - `false`: o tema novo sempre cresce a partir do botão, nos dois sentidos.
 * - `true`: pulsa. Indo para o claro, o círculo cresce a partir do botão;
 *   voltando para o escuro, o claro encolhe de volta para dentro dele, com a
 *   mesma curva espelhada.
 */
export const INVERSE_THEME_CIRCLE = false;

/** Ponto da tela de onde a troca de tema parte: o botão que a pessoa apertou. */
export interface OrigemDaTroca {
  x: number;
  y: number;
}

/**
 * Aplica o tema trocando só o `data-theme`.
 *
 * Até a Etapa 7.8 esta função gravava ~40 variáveis de cor direto no `style`
 * do `<html>`, lidas do `thema.ts`. Estilo inline vence qualquer folha de
 * estilo: depois da hidratação, a paleta antiga cobria os tokens do
 * `globals.css`. Hoje os dois temas vivem inteiros no CSS, sob `:root` e
 * `[data-theme='light']`, e o atributo é tudo que precisa mudar.
 */
function applyThemeImmediate(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode);
}

/**
 * A troca feita pela pessoa: o tema novo se abre num círculo a partir do
 * botão que ela apertou.
 *
 * **Por que View Transition, e não `transition` de cor.** A versão anterior
 * ligava uma transição em todo elemento da página ao mesmo tempo — milhares
 * de cores interpoladas quadro a quadro, que é o que travava. Aqui o
 * navegador fotografa a página no tema antigo, aplica o novo de uma vez e
 * anima só a máscara circular por cima: uma camada, na GPU.
 *
 * Sem suporte (Firefox antigo) ou com `prefers-reduced-motion`, a troca é
 * instantânea — que é o comportamento certo nos dois casos.
 */
function trocarComRevelacao(
  aplicar: () => void,
  origem?: OrigemDaTroca,
  encolher = false
) {
  const html = document.documentElement;
  const doc = document as Document & {
    startViewTransition?: (atualizar: () => void) => {
      finished: Promise<void>;
    };
  };
  const semMovimento = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Cerca de 800 elementos têm `transition-all` próprio: sem esta trava, cada
  // cor que muda com o tema vira uma animação, e foram elas — não a revelação —
  // que travaram a troca (sete tarefas longas, ~850ms, medido em /works).
  html.classList.add('trocando-tema');
  const destravar = () =>
    html.classList.remove('trocando-tema', 'tema-encolhe');

  if (!doc.startViewTransition || semMovimento) {
    aplicar();
    // Dois quadros: o primeiro pinta o tema novo já sem transição.
    requestAnimationFrame(() => requestAnimationFrame(destravar));
    return;
  }

  const x = origem?.x ?? window.innerWidth / 2;
  const y = origem?.y ?? 0;
  // O raio que alcança o canto mais distante: o círculo termina cobrindo tudo.
  const raio = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  html.style.setProperty('--tema-x', `${x}px`);
  html.style.setProperty('--tema-y', `${y}px`);
  html.style.setProperty('--tema-raio', `${raio}px`);

  // `flushSync`: o React precisa pintar o estado novo (o ícone do botão)
  // antes de o navegador fotografar o tema novo.
  // Encolher: a foto do tema antigo fica por cima e se fecha no botão, em
  // vez de o tema novo se abrir por cima dela (ver `globals.css`).
  html.classList.toggle('tema-encolhe', encolher);

  const transicao = doc.startViewTransition(() => flushSync(aplicar));
  transicao.finished.finally(destravar);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark', // Padrão temporário
      isTransitioning: false,
      hasUserPreference: false,

      toggleTheme: (origem) => {
        const currentMode = get().mode;
        const newMode: ThemeMode = currentMode === 'dark' ? 'light' : 'dark';
        get().setTheme(newMode, true, origem); // 🆕 Sempre marca como escolha do usuário
      },

      setTheme: (mode: ThemeMode, isUserChoice = true, origem) => {
        const currentMode = get().mode;
        const currentHasUserPreference = get().hasUserPreference;

        if (currentMode === mode && currentHasUserPreference === isUserChoice) {
          return;
        }

        const aplicar = () => {
          get().applyTheme(mode);
          set({ mode, hasUserPreference: isUserChoice });
        };

        // Só a escolha da pessoa é animada. Seguir o sistema ou restaurar a
        // preferência salva acontece sem ninguém olhando para o botão.
        if (isUserChoice && currentMode !== mode) {
          trocarComRevelacao(
            aplicar,
            origem,
            INVERSE_THEME_CIRCLE && mode === 'dark'
          );
        } else {
          aplicar();
        }
      },

      applyTheme: applyThemeImmediate,

      // 🆕 Método para inicializar do sistema
      initializeFromSystem: () => {
        const { hasUserPreference } = get();

        // Se usuário já fez uma escolha manual, não alterar
        if (hasUserPreference) return;

        const systemTheme = getSystemTheme();
        const currentTheme = get().mode;

        // Se o tema do sistema é diferente do atual, atualizar
        if (systemTheme !== currentTheme) {
          get().setTheme(systemTheme, false);
        }
      },
    }),
    {
      name: 'classical-music-theme',
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          // Verificar se há uma preferência salva do usuário
          const savedData = localStorage.getItem('classical-music-theme');

          if (savedData) {
            try {
              const parsed = JSON.parse(savedData);
              const savedHasUserPreference = parsed.state?.hasUserPreference;

              if (savedHasUserPreference) {
                // Se usuário fez escolha manual, usar ela
                if (state.applyTheme && state.mode) {
                  state.applyTheme(state.mode);
                }
              } else {
                // Se não há preferência do usuário, usar tema do sistema
                const systemTheme = getSystemTheme();
                state.setTheme(systemTheme, false);
              }
            } catch {
              // Se erro ao parsear, usar tema do sistema
              const systemTheme = getSystemTheme();
              state.setTheme(systemTheme, false);
            }
          } else {
            // Se não há dados salvos, usar tema do sistema
            const systemTheme = getSystemTheme();
            state.setTheme(systemTheme, false);
          }
        }
      },
    }
  )
);

// Hook for theme initialization
export const useThemeInitializer = () => {
  const { mode, applyTheme, initializeFromSystem } = useThemeStore();

  // Apply theme on mount
  React.useEffect(() => {
    applyTheme(mode);
    initializeFromSystem(); // 🆕 Inicializar do sistema se necessário
  }, []);

  // 🆕 Handle system theme preference changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const { hasUserPreference } = useThemeStore.getState();

      // Apenas seguir mudanças do sistema se usuário não fez escolha manual
      if (!hasUserPreference) {
        const newTheme = e.matches ? 'dark' : 'light';
        useThemeStore.getState().setTheme(newTheme, false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
};

// 🆕 Hook para facilitar o uso com informações extras
export const useTheme = () => {
  const { mode, toggleTheme, setTheme, isTransitioning, hasUserPreference } =
    useThemeStore();

  return {
    mode,
    toggleTheme,
    setTheme: (mode: ThemeMode) => setTheme(mode, true), // Sempre marca como escolha do usuário
    isTransitioning,
    hasUserPreference, // 🆕 Exposar flag
    isDark: mode === 'dark',
    isLight: mode === 'light',
    isSystemControlled: !hasUserPreference, // 🆕 Indica se está seguindo o sistema
  };
};
