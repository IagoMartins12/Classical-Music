// app/sitemap.ts
import { MetadataRoute } from 'next';
import {
  getComposersForSitemap,
  getWorksForSitemap,
} from './libs/sitemap-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://opusatlas.com.br';

  console.log('🚀 Generating sitemap...');

  // URLs estáticas principais (prioridade máxima)
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/works`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/composers`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/instruments`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/music-history`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learning`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/teachers`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    // Páginas institucionais
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // URLs dinâmicas - Compositores famosos (prioridade alta)
  let composerUrls: MetadataRoute.Sitemap = [];
  try {
    const composers = await getComposersForSitemap();
    composerUrls = composers.map((composer) => ({
      url: `${baseUrl}/composer/${composer.id}`,
      lastModified: composer.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
    console.log(`✅ Added ${composers.length} composers to sitemap`);
  } catch (error) {
    console.error('❌ Error generating composer URLs:', error);
  }

  // URLs dinâmicas - Obras populares e de compositores famosos
  let workUrls: MetadataRoute.Sitemap = [];
  try {
    const works = await getWorksForSitemap();
    workUrls = works.map((work, index) => ({
      url: `${baseUrl}/work/${work.id}`,
      lastModified: work.updatedAt,
      changeFrequency: 'monthly' as const,
      // Prioridade baseada na popularidade (mais favoritos = maior prioridade)
      priority: Math.max(
        0.5,
        Math.min(0.8, 0.5 + ((works.length - index) / works.length) * 0.3)
      ),
    }));
    console.log(`✅ Added ${works.length} works to sitemap`);
  } catch (error) {
    console.error('❌ Error generating work URLs:', error);
  }

  // URLs dinâmicas - Professores públicos

  const totalUrls = staticUrls.length + composerUrls.length + workUrls.length;
  console.log(`🎯 Total sitemap URLs: ${totalUrls} (ideal: < 2500)`);

  return [
    ...staticUrls, // Páginas estáticas primeiro
    ...composerUrls, // Compositores famosos
    ...workUrls, // Obras populares
  ];
}
