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

/**
 * Marca que a renovação desta sessão acabou de falhar — e por isso o
 * middleware não deve mandar de novo para `/api/auth/session-refresh`.
 *
 * **Existe por causa de um laço de redirecionamento real.** O middleware
 * desvia para a renovação quem tem a dica de sessão mas está sem token de
 * acesso válido. Quando o refresh token também venceu, a renovação falhava, a
 * rota devolvia a pessoa à página, **a dica continuava lá** e o middleware
 * desviava outra vez: `ERR_TOO_MANY_REDIRECTS`, o site inteiro inacessível.
 * Só aparecia em quem tinha sessão antiga parada — um celular esquecido —, o
 * que faz o defeito parecer "problema do aparelho".
 *
 * A rota apaga a dica, e este marcador é o cinto de segurança: se a dica
 * resistir (foi gravada pela API com um `domain` que o front não adivinhou), o
 * laço mesmo assim não acontece. Dura pouco: passado isso, tenta renovar de
 * novo, que é o certo se a sessão tiver voltado a valer.
 */
export const REFRESH_FAILED_COOKIE = `${AUTH_COOKIE_PREFIX}_refresh_failed`;

/** Por quanto tempo o marcador vale (segundos). */
export const REFRESH_FAILED_MAX_AGE = 120;

/**
 * Os `domain` em que um cookie de sessão pode ter sido gravado, para apagá-lo
 * sem saber qual a API usou.
 *
 * O cookie é da API (`AUTH_COOKIE_DOMAIN=.hml.opusatlas.com.br`), e o
 * navegador só apaga o que casar **nome, domínio e caminho**. Apagar só o
 * host-only deixaria o de domínio de pé — e o laço de volta. Daí a lista: o
 * próprio host e cada domínio-pai até três rótulos, que é onde para um domínio
 * como `opusatlas.com.br` (`.com.br` o navegador recusa, e subir mais seria
 * tentar apagar cookie de terceiros).
 */
export function cookieDomains(hostname: string): (string | undefined)[] {
  const dominios: (string | undefined)[] = [undefined];

  const partes = hostname.split('.');
  if (partes.length < 2 || hostname === 'localhost') return dominios;

  for (let i = 0; partes.length - i >= 3 || i === 0; i += 1) {
    if (partes.length - i < 2) break;
    dominios.push(`.${partes.slice(i).join('.')}`);
  }

  return dominios;
}
