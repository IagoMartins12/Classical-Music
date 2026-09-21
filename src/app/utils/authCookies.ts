/**
 * Nomes dos cookies da sessão — os mesmos que a API grava
 * (`auth-cookie.service.ts`). Fonte única para o middleware e o servidor.
 *
 * **Por que o prefixo é configurável.** Homologação vive sob o mesmo domínio
 * de produção (`hml.opusatlas.com.br`), e o navegador manda os cookies de
 * `.opusatlas.com.br` também para os subdomínios. Com os mesmos nomes, quem
 * está logado em produção chega à homologação com **dois** `opus_access_token`
 * — e qual deles a API lê depende da ordem do navegador. O sintoma seria
 * login que funciona às vezes, só para quem usa os dois ambientes: você.
 *
 * Em homologação, `NEXT_PUBLIC_AUTH_COOKIE_PREFIX=opus_hml` (e
 * `AUTH_COOKIE_PREFIX` igual na API). Em produção, nada: o padrão é `opus`.
 *
 * Entra no build (`NEXT_PUBLIC_`), não em tempo de execução: o middleware roda
 * no edge, e o `next.config.ts` recusa buildar com um prefixo inválido.
 */
export const AUTH_COOKIE_PREFIX =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_PREFIX || 'opus';

/** O mesmo formato que a API aceita — letras minúsculas, dígitos e `_`. */
export const AUTH_COOKIE_PREFIX_PATTERN = /^[a-z][a-z0-9_]{0,30}$/;

export const ACCESS_TOKEN_COOKIE = `${AUTH_COOKIE_PREFIX}_access_token`;
export const SESSION_HINT_COOKIE = `${AUTH_COOKIE_PREFIX}_session`;
