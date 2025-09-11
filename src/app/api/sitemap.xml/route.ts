// app/api/sitemap.xml/route.ts - API dinâmica para sitemap
import { NextRequest, NextResponse } from 'next/server';
import { getCompleteSitemapData } from '@/app/libs/sitemap-fetcher';

// Configurar headers para XML
const XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800', // Cache 10min, stale 30min
} as const;

/**
 * Gerar sitemap XML dinâmico
 * GET /api/sitemap.xml
 */
export async function GET(): Promise<NextResponse> {
  try {
    const startTime = Date.now();
    console.log('🌍 Generating dynamic sitemap...');

    // Buscar dados do banco/cache
    const sitemapData = await getCompleteSitemapData();

    // Base URL dinâmica (para development/production)
    const baseUrl = process.env.NEXTAUTH_URL || 'https://opusatlas.com.br';

    // URLs estáticas (sempre incluídas)
    const staticUrls = [
      {
        url: baseUrl,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/works`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/composers`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/instruments`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/genres`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/learning`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/music-history`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/teachers`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/about-us`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/contact`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/help`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/faq`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.5,
      },
    ];

    // URLs dinâmicas de compositores
    const composerUrls = sitemapData.composers.map((composer) => ({
      url: `${baseUrl}/composer/${composer.id}`,
      lastmod: composer.updatedAt.toISOString(),
      changefreq: 'monthly',
      priority: 0.8,
    }));

    // URLs dinâmicas de obras
    const workUrls = sitemapData.works.map((work) => ({
      url: `${baseUrl}/work/${work.id}`,
      lastmod: work.updatedAt.toISOString(),
      changefreq: 'monthly',
      priority: 0.7,
    }));

    // Combinar todas as URLs
    const allUrls = [...staticUrls, ...composerUrls, ...workUrls];

    // Gerar XML do sitemap
    const xml = generateSitemapXML(allUrls, sitemapData.lastUpdated);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Dynamic sitemap generated:`);
    console.log(`   📊 Total URLs: ${allUrls.length}`);
    console.log(`   📂 Static: ${staticUrls.length}`);
    console.log(`   👨‍🎼 Composers: ${composerUrls.length}`);
    console.log(`   🎵 Works: ${workUrls.length}`);
    console.log(`   ⏱️  Duration: ${duration}ms`);

    // Retornar XML com headers corretos
    return new NextResponse(xml, {
      status: 200,
      headers: {
        ...XML_HEADERS,
        'X-Generated-At': new Date().toISOString(),
        'X-Total-URLs': allUrls.length.toString(),
        'X-Generation-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    console.error('❌ Error generating dynamic sitemap:', error);

    // Fallback para sitemap básico em caso de erro
    const baseUrl = process.env.NEXTAUTH_URL || 'https://opusatlas.com.br';
    const fallbackXml = generateFallbackSitemap(baseUrl);

    return new NextResponse(fallbackXml, {
      status: 200, // Sempre retornar 200 para não quebrar SEO
      headers: {
        ...XML_HEADERS,
        'X-Fallback': 'true',
        'X-Error': 'Dynamic generation failed',
      },
    });
  }
}

/**
 * Gerar XML do sitemap com formatação correta
 */
function generateSitemapXML(
  urls: Array<{
    url: string;
    lastmod: string;
    changefreq: string;
    priority: number;
  }>,
  lastUpdated: Date
): string {
  const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';

  const urlsetOpen = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const urlEntries = urls
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  const urlsetClose = '</urlset>';

  // XML comment com metadados
  const comment = `<!--
  Opus Atlas - Dynamic Sitemap
  Generated: ${lastUpdated.toISOString()}
  Total URLs: ${urls.length}
  Generator: Next.js API Route with Redis Cache
-->`;

  return [xmlDeclaration, comment, urlsetOpen, urlEntries, urlsetClose].join(
    '\n'
  );
}

/**
 * Sitemap de fallback em caso de erro
 */
function generateFallbackSitemap(baseUrl: string): string {
  const fallbackUrls = [
    {
      url: baseUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/works`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/composers`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/instruments`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about-us`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.6,
    },
  ];

  return generateSitemapXML(fallbackUrls, new Date());
}

/**
 * Escapar caracteres especiais para XML
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Health check para a API de sitemap
 * GET /api/sitemap.xml?health=true
 */
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    // Quick health check sem gerar XML completo
    const url = new URL(request.url);
    const isHealthCheck = url.searchParams.get('health') === 'true';

    if (isHealthCheck) {
      const startTime = Date.now();
      const sitemapData = await getCompleteSitemapData();
      const endTime = Date.now();

      return new NextResponse(null, {
        status: 200,
        headers: {
          'X-Health': 'OK',
          'X-Total-URLs': sitemapData.totalCount.toString(),
          'X-Response-Time': `${endTime - startTime}ms`,
          'X-Last-Updated': sitemapData.lastUpdated.toISOString(),
        },
      });
    }

    // HEAD request normal - retornar headers sem body
    return new NextResponse(null, {
      status: 200,
      headers: XML_HEADERS,
    });
  } catch (error) {
    console.error('❌ Sitemap health check failed:', error);
    return new NextResponse(null, {
      status: 500,
      headers: {
        'X-Health': 'ERROR',
        'X-Error': 'Health check failed',
      },
    });
  }
}
