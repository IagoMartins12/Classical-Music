/**
 * Este deploy pode ser indexado por buscadores?
 *
 * Homologação (`hml.opusatlas.com.br`) é um site inteiro duplicado do de
 * produção. Indexada, ela concorre com produção nos resultados — e o Google
 * pode escolher a cópia de homologação como a canônica. A Vercel só marca
 * `noindex` sozinha nos deploys de *preview*; o deploy principal do projeto de
 * homologação sairia indexável.
 *
 * `SITE_NOINDEX=true` na homologação. Em produção, nada.
 */
export const SITE_NOINDEX = process.env.SITE_NOINDEX === 'true';
