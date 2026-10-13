// contexts/TranslationContext.tsx - Context provider for server translations
'use client';

import { useLanguageWithRefresh } from '@/app/stores/useLanguageStore';
import { Language } from '@/app/utils/translations/serverTranslations';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type TranslationData = Record<string, string>;
export type TranslationsMap = Record<string, TranslationData>;

interface TranslationContextValue {
  language: Language;
  translations: TranslationsMap;
  t: (key: string, params?: Record<string, string | number>) => string;
  tSection: (
    section: string,
    key: string,
    params?: Record<string, string | number>
  ) => string;
  /** Pede ao provider as seções que a página não trouxe. */
  ensureSections: (sections: string[]) => void;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

interface TranslationProviderProps {
  language: Language;
  translations: TranslationsMap;
  children: React.ReactNode;
}

/**
 * Provider que injeta traduções do servidor nos componentes client.
 *
 * **O que mudou e por quê.** Ele recebia do servidor todas as seções, comuns
 * e da página — inclusive o texto dos modais de login e de onboarding, 22,9 kB
 * que nenhuma página mostra na primeira pintura e que iam no payload de toda
 * visita, duas vezes (no HTML e no RSC).
 *
 * Agora o servidor manda só o que a página desenha. O que faltar, o navegador
 * busca em `/translations/*.json` — arquivo estático, que ele guarda e
 * reaproveita entre páginas. Quem precisa de uma seção já diz qual
 * (`useTranslation({ sections: [...] })`), então o carregamento é dirigido
 * pelo próprio componente, e não por uma lista que envelhece sozinha.
 */
export function TranslationProvider({
  language,
  translations,
  children,
}: TranslationProviderProps) {
  const [loaded, setLoaded] = useState<TranslationsMap>({});
  const requested = useRef(new Set<string>());

  const ensureSections = useCallback(
    (sections: string[]) => {
      const faltando = sections.filter(
        (section) =>
          !translations[section] &&
          !requested.current.has(`${language}:${section}`)
      );

      if (faltando.length === 0) return;

      faltando.forEach((section) =>
        requested.current.add(`${language}:${section}`)
      );

      void Promise.all(
        faltando.map(async (section) => {
          const data = await fetchSection(section, language);
          return [section, data] as const;
        })
      ).then((entradas) => {
        setLoaded((anterior) => {
          const proximo = { ...anterior };
          entradas.forEach(([section, data]) => {
            proximo[section] = data;
          });
          return proximo;
        });
      });
    },
    [language, translations]
  );

  const contextValue = useMemo(() => {
    const todas: TranslationsMap = { ...loaded, ...translations };

    // Função t() para seção específica
    const tSection = (
      section: string,
      key: string,
      params?: Record<string, string | number>
    ): string => {
      const sectionData = todas[section];

      if (sectionData && sectionData[key]) {
        return interpolateTranslation(sectionData[key], params);
      }

      return missing(key);
    };

    // Função t() principal
    const t = (
      key: string,
      params?: Record<string, string | number>
    ): string => {
      // Detectar namespace (ex: "works:work_title")
      if (key.includes(':')) {
        const [section, actualKey] = key.split(':', 2);
        return tSection(section, actualKey, params);
      }

      // Buscar em todas as seções carregadas
      for (const sectionData of Object.values(todas)) {
        if (sectionData[key]) {
          return interpolateTranslation(sectionData[key], params);
        }
      }

      return missing(key);
    };

    return {
      language,
      translations: todas,
      t,
      tSection,
      ensureSections,
    };
  }, [language, translations, loaded, ensureSections]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

/** Uma seção lida do arquivo estático, já na língua pedida. */
const fetchedSections = new Map<string, TranslationData>();

async function fetchSection(
  section: string,
  language: Language
): Promise<TranslationData> {
  const chave = `${language}:${section}`;
  const guardada = fetchedSections.get(chave);
  if (guardada) return guardada;

  try {
    const response = await fetch(`/translations/${section}.json`);
    if (!response.ok) throw new Error(String(response.status));

    const data = (await response.json()) as {
      ptBr?: TranslationData;
      en?: TranslationData;
    };
    const escolhida =
      (language === 'pt' ? data.ptBr : data.en) ?? data.ptBr ?? {};

    fetchedSections.set(chave, escolhida);
    return escolhida;
  } catch {
    // Sem a seção, `t()` devolve a chave formatada — como já fazia antes.
    fetchedSections.set(chave, {});
    return {};
  }
}

/**
 * Hook que usa Context primeiro, fallback para fetch (backward compatibility)
 */
export function useTranslation(
  options: {
    sections?: string[];
    defaultSection?: string;
  } = {}
) {
  const context = useContext(TranslationContext);

  // Always called (rules of hooks); with a provider it has nothing to fetch.
  const original = useOriginalTranslation(context ? {} : options);

  // Quem declara as seções que usa passa a ser quem dispara o carregamento
  // delas — o provider não precisa adivinhar. `join` porque o array costuma
  // ser um literal novo a cada render.
  const pedidas = (options.sections ?? []).join('|');
  const ensureSections = context?.ensureSections;

  useEffect(() => {
    if (!ensureSections || !pedidas) return;
    ensureSections(pedidas.split('|'));
  }, [ensureSections, pedidas]);

  // Se existir contexto (server translations), sobrescreve o retorno
  if (context) {
    const ready = (options.sections ?? []).every(
      (section) => section in context.translations
    );
    return {
      t: context.t,
      tSection: context.tSection,
      language: context.language,
      ready,
    };
  }

  // Caso contrário, usa o fallback do hook original
  return original;
}

// Função utilitária para interpolação
function interpolateTranslation(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) return text;

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * A key with no text. Never shown: an empty string while the section loads
 * (the component shows a skeleton when `ready` is false) or when the key is
 * missing from the file, which development reports.
 */
function missing(key: string): string {
  if (process.env.NODE_ENV === 'development')
    console.warn(`[i18n] texto ausente: ${key}`);
  return '';
}

/** Sections fetched outside a provider, both languages, by section. */
const sectionCache = new Map<
  string,
  { ptBr: TranslationData; en: TranslationData }
>();
const pending = new Map<string, Promise<void>>();

function loadSection(section: string): Promise<void> {
  const inFlight = pending.get(section);
  if (inFlight) return inFlight;
  const load = fetch(`/translations/${section}.json`)
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json() as Promise<{
        ptBr?: TranslationData;
        en?: TranslationData;
      }>;
    })
    .then((data) => {
      sectionCache.set(section, { ptBr: data.ptBr ?? {}, en: data.en ?? {} });
    })
    .catch(() => {
      // Without the file `t()` gives empty strings, never the keys.
      sectionCache.set(section, { ptBr: {}, en: {} });
    });
  pending.set(section, load);
  return load;
}

/**
 * Outside a provider (modals, the study sheet): the sections are fetched
 * here. `ready` is false until every one has arrived, decided on the first
 * render, so a component never paints a key before the fetch starts.
 */
function useOriginalTranslation(options: {
  sections?: string[];
  defaultSection?: string;
}) {
  const { defaultSection } = options;
  const sections = useMemo(
    () => options.sections ?? [],

    [(options.sections ?? []).join('|')]
  );
  const { language } = useLanguageWithRefresh();
  const [, setLoaded] = useState(0);
  const ready = sections.every((section) => sectionCache.has(section));

  useEffect(() => {
    if (ready) return;
    let alive = true;
    void Promise.all(sections.map(loadSection)).then(
      () => alive && setLoaded((n) => n + 1)
    );
    return () => {
      alive = false;
    };
  }, [ready, sections]);

  const lookup = useCallback(
    (section: string, key: string) => {
      const data = sectionCache.get(section);
      return (
        (language === 'pt' ? data?.ptBr[key] : data?.en[key]) ?? data?.ptBr[key]
      );
    },
    [language]
  );

  const tSection = useCallback(
    (
      section: string,
      key: string,
      params?: Record<string, string | number>
    ) => {
      const text = lookup(section, key);
      return text ? interpolateTranslation(text, params) : missing(key);
    },
    [lookup]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      if (!ready) return '';
      if (key.includes(':')) {
        const [section, actualKey] = key.split(':', 2);
        return tSection(section, actualKey, params);
      }
      const order = defaultSection
        ? [defaultSection, ...sections.filter((s) => s !== defaultSection)]
        : sections;
      for (const section of order) {
        const text = lookup(section, key);
        if (text) return interpolateTranslation(text, params);
      }
      return missing(key);
    },
    [ready, defaultSection, sections, lookup, tSection]
  );

  return { t, tSection, language, ready };
}
