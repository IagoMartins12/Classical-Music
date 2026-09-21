// app/composer/[composerId]/ComposerDetailsServer.tsx - Versão otimizada
import { notFound } from 'next/navigation';
import {
  getComposerById,
  getComposerWorksWithFilters,
  getComposerFilterOptions,
} from '@/app/requests/composer-details';
import ComposerDetailsClient from './pageClient';
import {
  loadPageTranslationsWithCommon,
  type Language,
} from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';
import { getComposerArticles } from '@/app/requests/blog/composer-articles';

interface ComposerDetailsServerProps {
  composerId: string;
  /** Vem do segmento `[lang]` — ver `routeLanguage`. */
  language: Language;
}

export default async function ComposerDetailsServer({
  composerId,
  language,
}: ComposerDetailsServerProps) {
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/composerId',
  ]);

  // A sessão não é lida aqui de propósito: quem pode editar se decide no
  // navegador (`useSession` no componente cliente). Ler sessão no servidor
  // tornaria esta página dinâmica e desligaria o cache — ver o comentário em
  // `pageClient.tsx`.
  /**
   * **Sem `catch` que vira `notFound()`, de propósito.**
   *
   * "Não existe" já é tratado: `getComposerById`/`getWorkById` devolvem `null`
   * quando a API responde 404, e o `if` abaixo transforma isso no 404 correto
   * — que o Next pode guardar, porque é verdade.
   *
   * O que havia aqui transformava **qualquer** falha em 404: API fora do ar,
   * tempo esgotado, erro de rede. E 404 o Next guarda. Uma instabilidade de
   * trinta segundos durante uma varredura do Google faria a página de um
   * compositor ser indexada como inexistente. Deixando o erro subir, o Next
   * devolve 500 e não guarda nada.
   */
  // OTIMIZAÇÃO: Carregar dados do compositor, obras iniciais e opções de filtro em paralelo
  /**
   * O compositor vem primeiro, sozinho, e é ele quem decide se a página
   * existe.
   *
   * Buscar os quatro em paralelo parece mais rápido, mas para um id que não
   * existe as outras três respondem 404 e o `Promise.all` rejeita **antes** de
   * chegar no `if` abaixo — a página inteira virava erro 500 onde a resposta
   * certa é "não encontrado". Uma ida a mais só acontece no render frio, e a
   * resposta dela já está no cache do `fetch`.
   */
  const composer = await getComposerById(composerId);

  if (!composer) {
    notFound();
  }

  const [initialWorksData, filterOptions, composerArticles] = await Promise.all(
    [
      getComposerWorksWithFilters(composerId, 1, 50), // Primeira página com 50 obras
      getComposerFilterOptions(composerId),
      getComposerArticles(composerId, 5), // 🆕 Buscar últimos 5 artigos
    ]
  );
  return (
    <TranslationProvider language={language} translations={translations}>
      <ComposerDetailsClient
        composer={composer}
        initialWorksData={initialWorksData}
        filterOptions={filterOptions}
        composerArticles={composerArticles} // 🆕
      />
    </TranslationProvider>
  );
}
