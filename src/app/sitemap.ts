// app/sitemap.ts
import { MetadataRoute } from 'next';
import {
  getWorksForSitemap,
  getComposersForSitemap,
} from './libs/sitemap-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://opusatlas.com.br';

  console.log('🚀 Generating sitemap...');

  // URLs estáticas principais (sempre incluídas)
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/works`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/composers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/instruments`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learning`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/music-history`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/teachers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Tentar buscar dados dinâmicos (com timeout)
  let dynamicUrls: MetadataRoute.Sitemap = [];

  try {
    // Timeout de 30 segundos para evitar build infinito
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 30000)
    );

    const dataPromise = Promise.all([
      getComposersForSitemap(),
      getWorksForSitemap(),
    ]);

    const [composers, works] = (await Promise.race([
      dataPromise,
      timeoutPromise,
    ])) as any;

    const composerUrls = composers.map((composer: any) => ({
      url: `${baseUrl}/composer/${composer.id}`,
      lastModified: composer.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

    const workUrls = works.map((work: any) => ({
      url: `${baseUrl}/work/${work.id}`,
      lastModified: work.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    dynamicUrls = [...composerUrls, ...workUrls];
    console.log(
      `✅ Added ${composerUrls.length} composers + ${workUrls.length} works`
    );
  } catch {
    console.log('📝 Continuing with static URLs only');
    // Continue com apenas URLs estáticas se houver erro
  }

  const totalUrls = [...staticUrls, ...dynamicUrls];
  console.log(`🎯 Total sitemap URLs: ${totalUrls.length}`);

  return totalUrls;
}
