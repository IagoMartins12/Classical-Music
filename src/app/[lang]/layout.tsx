import type { ReactNode } from 'react';
import {
  languageStaticParams,
  routeLanguage,
  type LangRouteParams,
} from '../utils/translations/routeLanguage';

/**
 * A camada que torna o site público cacheável.
 *
 * Este layout não desenha nada: ele existe para que o idioma faça parte do
 * caminho e, com isso, da chave de cache do Next. O visitante continua vendo
 * `/composers` — o `middleware.ts` reescreve para `/pt/composers` ou
 * `/en/composers` conforme a preferência dele, e cada variante é gerada e
 * guardada uma vez.
 *
 * Ver `utils/translations/routeLanguage.ts` para o porquê completo.
 *
 * **Sem `dynamicParams: false`.** Ele faria o Next devolver 404 a qualquer
 * segmento fora da lista — inclusive quando o cache compartilhado ainda não
 * tivesse a página, porque com um `cacheHandler` próprio o Next não consulta
 * mais o cache de arquivos do build por conta própria. Quem barra segmento
 * desconhecido é o `routeLanguage` abaixo, que chama `notFound()`.
 */
export async function generateStaticParams() {
  return languageStaticParams();
}

export default async function LanguageLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LangRouteParams>;
}) {
  // Valida o segmento (404 quando não é idioma conhecido) antes de renderizar.
  await routeLanguage(params);

  return children;
}
