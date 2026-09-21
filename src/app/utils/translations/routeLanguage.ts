import { notFound } from 'next/navigation';
import type { Language } from './serverTranslations';

/**
 * O idioma como segmento de rota — e por que ele existe.
 *
 * O idioma era decidido lendo o cookie dentro da página
 * (`getServerLanguageStatic`). Ler cookie é uma API dinâmica: a página inteira
 * deixa de ser estática, e o `export const revalidate` que ela declara não
 * tem efeito nenhum. Era por isso que 371 das 373 rotas do site renderizavam do
 * zero a cada visita anônima.
 *
 * Uma URL não pode ter duas variantes no cache do Next — a chave é o caminho.
 * Então o idioma virou parte do caminho: as páginas públicas vivem sob
 * `app/[lang]/(main)/`, o Next gera e guarda `/pt/...` e `/en/...`
 * separadamente, e o `middleware.ts` reescreve `/composers` para a variante
 * certa **sem mudar a URL que o visitante vê**. Quem chega recebe HTML pronto,
 * no idioma dele, sem render.
 */
export const SUPPORTED_LANGUAGES = ['pt', 'en'] as const;

/** Idioma do build e de quem não declara preferência. */
export const DEFAULT_LANGUAGE: Language = 'pt';

/** O cookie onde o `useLanguageStore` grava a preferência do visitante. */
export const LANGUAGE_COOKIE = 'opus-atlas-language';

export interface LangRouteParams {
  lang: string;
}

/**
 * Os `params` de uma página sob `[lang]`: o idioma mais os parâmetros próprios
 * dela, quando tiver. Ex.: `LangParams<{ workId: string }>`.
 */
export type LangParams<T = Record<never, never>> = Promise<LangRouteParams & T>;

export function isSupportedLanguage(value: string): value is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/**
 * As variantes que o Next pré-gera de cada página sob `[lang]`.
 *
 * Duas por rota: uma em português, uma em inglês. É o que transforma "uma
 * página dinâmica que serve dois idiomas" em "duas páginas estáticas".
 */
export function languageStaticParams(): Array<{ lang: Language }> {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }));
}

/**
 * O idioma da rota atual.
 *
 * `[lang]` casa qualquer segmento, então `/qualquer-coisa` entraria aqui como
 * se fosse um idioma e renderizaria a home. Segmento desconhecido vira 404,
 * que é o que o visitante deve receber.
 */
export async function routeLanguage(
  params: Promise<LangRouteParams>
): Promise<Language> {
  const { lang } = await params;

  if (!isSupportedLanguage(lang)) {
    notFound();
  }

  return lang;
}
