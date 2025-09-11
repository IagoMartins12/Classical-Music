// app/api/sitemap.xml/route.ts - API dinâmica para sitemap (URLs corrigidas)
import { NextRequest, NextResponse } from 'next/server';
import { getCompleteSitemapData } from '@/app/libs/sitemap-fetcher';

// Detectar baseURL correto baseado no environment/headers
function getBaseUrl(request: NextRequest): string {
  // Em produção, usar sempre o domínio oficial
  if (process.env.NODE_ENV === 'production') {
    return 'https://opusatlas.com.br';
  }

  // Em desenvolvimento, tentar detectar da requisição
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';

  if (host) {
    return `${protocol}://${host}`;
  }

  // Fallback para desenvolvimento local
  return 'http://localhost:3000';
}

// Configurar headers para XML
const XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800', // Cache 10 min
};

export async function GET(request: NextRequest) {
  const start = Date.now();

  try {
    // Detectar baseURL correto
    const baseUrl = getBaseUrl(request);
    console.log(`🔗 Using baseURL: ${baseUrl}`);

    // Health check para debug
    const isHealthCheck = request.nextUrl.searchParams.get('health') === 'true';
    if (isHealthCheck) {
      return NextResponse.json(
        {
          status: 'ok',
          baseUrl,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          redis_configured: !!process.env.REDIS_HOST,
        },
        {
          headers: { 'Cache-Control': 'no-cache' },
        }
      );
    }

    // Buscar dados do sitemap
    console.log('📊 Fetching sitemap data...');
    const sitemapData = await getCompleteSitemapData();

    console.log(`📈 Sitemap stats:`, {
      staticUrls: sitemapData.staticUrls.length,
      composers: sitemapData.composers.length,
      works: sitemapData.works.length,
      total:
        sitemapData.staticUrls.length +
        sitemapData.composers.length +
        sitemapData.works.length,
    });

    // Gerar XML do sitemap
    const currentDate = new Date().toISOString();
    const totalUrls =
      sitemapData.staticUrls.length +
      sitemapData.composers.length +
      sitemapData.works.length;

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Opus Atlas - Dynamic Sitemap
  Generated: ${currentDate}
  Total URLs: ${totalUrls}
  Base URL: ${baseUrl}
  Generator: Next.js API Route with Redis Cache
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapData.staticUrls
  .map(
    (url) => `  <url>
    <loc>${baseUrl}${url.path}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
${sitemapData.composers
  .map(
    (composer) => `  <url>
    <loc>${baseUrl}/composer/${composer.id}</loc>
    <lastmod>${composer.updatedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
${sitemapData.works
  .map(
    (work) => `  <url>
    <loc>${baseUrl}/work/${work.id}</loc>
    <lastmod>${work.updatedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    const duration = Date.now() - start;
    console.log(`✅ Sitemap generated in ${duration}ms with ${totalUrls} URLs`);

    return new NextResponse(xmlContent, {
      status: 200,
      headers: XML_HEADERS,
    });
  } catch (error) {
    console.error('❌ Sitemap generation error:', error);

    // Fallback: sitemap mínimo com URLs estáticas
    const baseUrl = getBaseUrl(request);
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1</priority>
  </url>
  <url>
    <loc>${baseUrl}/works</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/composers</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: XML_HEADERS,
    });
  }
}
