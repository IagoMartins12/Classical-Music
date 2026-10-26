import type { MetadataRoute } from 'next';

/**
 * The installable app: one for the main site, the blog and the portal.
 * Colors are the dark theme's (the icon's background); shortcuts open the
 * three places people come back to.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Opus Atlas',
    short_name: 'Opus Atlas',
    description:
      'Compositores, obras e partituras de música clássica, o seu estudo e o portal do professor.',
    lang: 'pt-BR',
    // The opening first (`public/abertura.html`, saved on the device): it
    // shows at once and asks for the home, instead of a black screen while
    // the home is made.
    start_url: '/abertura.html?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0c0d12',
    theme_color: '#0c0d12',
    categories: ['education', 'music', 'books'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Estudos',
        short_name: 'Estudos',
        description: 'O que você está estudando',
        url: '/learning?source=pwa',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Portal',
        short_name: 'Portal',
        description: 'Aulas, tarefas e agenda',
        url: '/portal?source=pwa',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Blog',
        short_name: 'Blog',
        description: 'Artigos e agenda de concertos',
        url: '/blog?source=pwa',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
