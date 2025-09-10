// app/test-sitemap/page.tsx

import {
  getComposersForSitemap,
  getWorksForSitemap,
} from '@/app/libs/sitemap-data';

export default async function TestSitemap() {
  try {
    console.log('Testing sitemap functions...');
    const composers = await getComposersForSitemap();
    const works = await getWorksForSitemap();

    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Sitemap Test</h1>
        <p>Composers found: {composers.length}</p>
        <p>Works found: {works.length}</p>
        <h2>Sample Composers (first 5):</h2>
        <pre>{JSON.stringify(composers.slice(0, 5), null, 2)}</pre>
        <h2>Sample Works (first 5):</h2>
        <pre>{JSON.stringify(works.slice(0, 5), null, 2)}</pre>
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Sitemap Test Error</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
}
