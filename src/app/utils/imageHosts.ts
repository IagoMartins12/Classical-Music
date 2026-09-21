/**
 * Os hosts cujas imagens passam pelo otimizador do Next.
 *
 * **Por que a lista é fechada.** Com a otimização ligada, um `remotePatterns`
 * aberto (`https://**`) transforma `/_next/image` num redimensionador público:
 * qualquer pessoa pode mandar o servidor baixar e reprocessar imagem de
 * qualquer lugar da internet, às custas da nossa banda e CPU.
 *
 * **Por que nada quebra fora dela.** Host desconhecido não é recusado — é
 * servido direto ao navegador, sem passar pelo servidor. Quem decide isso por
 * imagem é o `SmartImage`, e é por isso que a lista pode ser fechada sem medo
 * de apagar a capa de uma matéria colada de um site qualquer.
 *
 * A lista saiu do banco, não de palpite: os hosts que de fato aparecem em
 * retrato de compositor, miniatura de partitura, capa de matéria e foto de
 * perfil.
 */
export const OPTIMIZED_IMAGE_HOSTS = [
  'opusatlas.com.br',
  'res.cloudinary.com', // uploads da comunidade e do painel
  'imslp.org', // retratos e miniaturas
  'cdn.imslp.org',
  'ks15.imslp.org',
  'i.scdn.co', // capas do Spotify
  'i.ytimg.com', // miniaturas do YouTube
  'img.youtube.com',
  'upload.wikimedia.org',
  'lh3.googleusercontent.com', // foto de quem entra com Google
];

/** Imagem local, embutida ou de host conhecido pode ser otimizada. */
export function isOptimizableImageSrc(src: unknown): boolean {
  if (typeof src !== 'string') return true; // import estático: sempre otimizável
  if (src.startsWith('data:') || src.startsWith('blob:')) return false;
  if (!src.startsWith('http')) return true; // caminho local

  try {
    const { hostname } = new URL(src);

    return OPTIMIZED_IMAGE_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}
