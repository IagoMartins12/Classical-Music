import { BLOG } from '@/app/conteudo/blog';
import { listarArtigos } from '@/app/requests/blog/leitura';
import { absoluto, rotasDoBlog } from '@/app/utils/blog/rotas';

/**
 * O feed RSS do blog (`/blog/rss.xml`): os 30 artigos mais recentes, para
 * leitores de feed, agregadores e quem prefere receber sem e-mail. As
 * páginas do blog o anunciam no `<head>` (`alternates.types`).
 *
 * Gerado e guardado como as páginas: a API revalida a tag dos artigos
 * quando algo muda; a hora é a rede de segurança.
 */

export const revalidate = 3600;

const escapar = (texto: string) =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export async function GET() {
  const t = BLOG.pt;
  let artigos: Awaited<ReturnType<typeof listarArtigos>>['artigos'] = [];
  try {
    artigos = (await listarArtigos({ porPagina: 30 }, { revalidate })).artigos;
  } catch {
    // Sem a API, o feed sai vazio, válido — melhor que um 500 para o leitor.
  }

  const itens = artigos
    .map((a) => {
      const url = absoluto(rotasDoBlog.artigo(a.slug));
      return `    <item>
      <title>${escapar(a.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${a.publicadoEm ? `<pubDate>${new Date(a.publicadoEm).toUTCString()}</pubDate>` : ''}
      <dc:creator>${escapar(a.autor.nome)}</dc:creator>
      ${a.categorias.map((c) => `<category>${escapar(c.nome)}</category>`).join('')}
      ${a.resumo ? `<description>${escapar(a.resumo)}</description>` : ''}
      ${a.capa ? `<media:content url="${escapar(absoluto(a.capa))}" medium="image" />` : ''}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapar(t.nome)}</title>
    <link>${absoluto(rotasDoBlog.inicio())}</link>
    <description>${escapar(t.meta.descricao)}</description>
    <language>pt-BR</language>
    <atom:link href="${absoluto(rotasDoBlog.rss())}" rel="self" type="application/rss+xml" />
    ${artigos[0]?.publicadoEm ? `<lastBuildDate>${new Date(artigos[0].publicadoEm).toUTCString()}</lastBuildDate>` : ''}
${itens}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control':
        'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
