// test-apis.js - Teste rápido das APIs
async function testSpotify() {
  const response = await fetch('/api/media-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workId: 'test',
      testOnly: true,
    }),
  });

  const result = await response.json();
  console.log('Spotify test:', result.spotify ? '✅' : '❌');
}

async function testYouTube() {
  const response = await fetch(
    'https://www.googleapis.com/youtube/v3/search?part=snippet&q=Chopin%20Ballade&type=video&key=' +
      process.env.YOUTUBE_API_KEY
  );
  console.log('YouTube test:', response.ok ? '✅' : '❌');
}
