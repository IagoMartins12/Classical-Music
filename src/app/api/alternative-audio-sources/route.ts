// app/api/alternative-audio-sources/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface AudioSource {
  source: string;
  audioUrl: string;
  duration: number;
  quality: string;
  license: string;
}

export async function POST(request: NextRequest) {
  try {
    const { title, composer } = await request.json();

    if (!title || !composer) {
      return NextResponse.json(
        { error: 'título e compositor são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(
      `🎵 [ALT-AUDIO] Buscando fontes alternativas para: ${title} - ${composer}`
    );

    const sources: AudioSource[] = [];

    // 1. Internet Archive (música clássica gratuita)
    const archiveSources = await searchInternetArchive(title, composer);
    sources.push(...archiveSources);

    // 2. Wikimedia Commons
    const wikimediaSources = await searchWikimedia(title, composer);
    sources.push(...wikimediaSources);

    // 3. IMSLP (se tiver áudios)
    const imslpSources = await searchIMSLP(title, composer);
    sources.push(...imslpSources);

    // 4. Freesound (para alguns casos específicos)
    const freesoundSources = await searchFreesound(title, composer);
    sources.push(...freesoundSources);

    // 5. Classical Music Archives
    const classicalSources = await searchClassicalArchives(title, composer);
    sources.push(...classicalSources);

    console.log(
      `✅ [ALT-AUDIO] Encontradas ${sources.length} fontes alternativas`
    );

    return NextResponse.json({
      success: true,
      sources: sources.slice(0, 5), // Máximo 5 fontes
      totalFound: sources.length,
    });
  } catch (error) {
    console.error('❌ [ALT-AUDIO] Erro:', error);

    return NextResponse.json(
      {
        error: 'Erro ao buscar fontes alternativas',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * Buscar no Internet Archive
 */
async function searchInternetArchive(
  title: string,
  composer: string
): Promise<AudioSource[]> {
  try {
    const query = encodeURIComponent(`${title} ${composer}`);
    const searchUrl = `https://archive.org/advancedsearch.php?q=${query}&fl=identifier,title,creator,format,item_size,publicdate&rows=10&page=1&output=json&mediatype=audio`;

    const response = await fetch(searchUrl);
    if (!response.ok) return [];

    const data = await response.json();
    const sources: AudioSource[] = [];

    for (const item of data.response?.docs || []) {
      // Verificar se é música clássica
      if (isClassicalContent(item.title, item.creator)) {
        // Tentar diferentes formatos de áudio
        const audioFormats = ['mp3', 'ogg', 'flac', 'm4a'];

        for (const format of audioFormats) {
          const audioUrl = `https://archive.org/download/${item.identifier}/${item.identifier}.${format}`;

          // Verificar se o arquivo existe (HEAD request)
          try {
            const headResponse = await fetch(audioUrl, { method: 'HEAD' });
            if (headResponse.ok) {
              sources.push({
                source: 'Internet Archive',
                audioUrl,
                duration: 0, // Será detectado pelo player
                quality:
                  format === 'flac'
                    ? 'lossless'
                    : format === 'mp3'
                    ? '128-320kbps'
                    : 'varies',
                license: 'Public Domain',
              });
              break; // Usar apenas o primeiro formato encontrado
            }
          } catch (e) {
            // Continuar para próximo formato
          }
        }
      }
    }

    return sources;
  } catch (error) {
    console.error('Erro no Internet Archive:', error);
    return [];
  }
}

/**
 * Buscar no Wikimedia Commons
 */
async function searchWikimedia(
  title: string,
  composer: string
): Promise<AudioSource[]> {
  try {
    const query = encodeURIComponent(`${title} ${composer} audio`);
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${query}&srnamespace=6&srlimit=10&origin=*`;

    const response = await fetch(searchUrl);
    if (!response.ok) return [];

    const data = await response.json();
    const sources: AudioSource[] = [];

    for (const item of data.query?.search || []) {
      const filename = item.title.replace('File:', '');

      // Verificar se é arquivo de áudio
      if (filename.match(/\.(mp3|ogg|wav|flac|m4a)$/i)) {
        // Obter URL direto do arquivo
        const fileUrl = await getWikimediaFileUrl(filename);
        if (fileUrl) {
          sources.push({
            source: 'Wikimedia Commons',
            audioUrl: fileUrl,
            duration: 0,
            quality: 'varies',
            license: 'Creative Commons / Public Domain',
          });
        }
      }
    }

    return sources;
  } catch (error) {
    console.error('Erro no Wikimedia:', error);
    return [];
  }
}

/**
 * Obter URL direto do arquivo Wikimedia
 */
async function getWikimediaFileUrl(filename: string): Promise<string | null> {
  try {
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=File:${encodeURIComponent(
      filename
    )}&prop=imageinfo&iiprop=url&origin=*`;

    const response = await fetch(infoUrl);
    const data = await response.json();

    const pages = data.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const imageInfo = pages[pageId]?.imageinfo?.[0];
      return imageInfo?.url || null;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Buscar no IMSLP (se tiver arquivos de áudio)
 */
async function searchIMSLP(
  title: string,
  composer: string
): Promise<AudioSource[]> {
  try {
    // IMSLP tem alguns arquivos de áudio, mas é principalmente partituras
    // Esta é uma busca básica - você pode expandir conforme a API do IMSLP

    const query = encodeURIComponent(`${title} ${composer}`);
    // IMSLP não tem API oficial, então seria necessário scraping cuidadoso
    // Por enquanto, retornar array vazio

    return [];
  } catch (error) {
    console.error('Erro no IMSLP:', error);
    return [];
  }
}

/**
 * Buscar no Freesound (limitado, mas pode ter alguns clássicos)
 */
async function searchFreesound(
  title: string,
  composer: string
): Promise<AudioSource[]> {
  try {
    const apiKey = process.env.FREESOUND_API_KEY;
    if (!apiKey) return [];

    const query = encodeURIComponent(`${title} ${composer} classical`);
    const searchUrl = `https://freesound.org/apiv2/search/text/?query=${query}&format=json&fields=id,name,url,download,duration,license&token=${apiKey}&page_size=5`;

    const response = await fetch(searchUrl);
    if (!response.ok) return [];

    const data = await response.json();
    const sources: AudioSource[] = [];

    for (const sound of data.results || []) {
      // Verificar se é realmente música clássica
      if (isClassicalContent(sound.name, '')) {
        sources.push({
          source: 'Freesound',
          audioUrl: sound.download,
          duration: sound.duration * 1000, // converter para ms
          quality: 'varies',
          license: sound.license,
        });
      }
    }

    return sources;
  } catch (error) {
    console.error('Erro no Freesound:', error);
    return [];
  }
}

/**
 * Buscar em archives de música clássica especializados
 */
async function searchClassicalArchives(
  title: string,
  composer: string
): Promise<AudioSource[]> {
  try {
    // Aqui você pode adicionar outros archives especializados em música clássica:
    // - Classical Music Archive
    // - MusOpen
    // - Open Music Library
    // - Choral Public Domain Library

    const sources: AudioSource[] = [];

    // Exemplo: buscar em MusOpen (se tiver API)
    const musOpenSources = await searchMusOpen(title, composer);
    sources.push(...musOpenSources);

    return sources;
  } catch (error) {
    console.error('Erro nos archives clássicos:', error);
    return [];
  }
}

/**
 * Buscar no MusOpen (exemplo)
 */
async function searchMusOpen(
  title: string,
  composer: string
): Promise<AudioSource[]> {
  try {
    // MusOpen não tem API pública oficial
    // Esta seria uma implementação de exemplo

    // Se houvesse uma API, seria algo como:
    // const response = await fetch(`https://musopen.org/api/search?q=${title}+${composer}`);

    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Verificar se o conteúdo é música clássica
 */
function isClassicalContent(title: string, creator: string): boolean {
  const content = `${title} ${creator}`.toLowerCase();

  const classicalKeywords = [
    'bach',
    'mozart',
    'beethoven',
    'chopin',
    'liszt',
    'debussy',
    'vivaldi',
    'classical',
    'symphony',
    'sonata',
    'concerto',
    'quartet',
    'piano',
    'violin',
    'orchestra',
    'chamber',
    'baroque',
    'romantic',
    'opera',
  ];

  const excludeKeywords = [
    'remix',
    'electronic',
    'jazz',
    'rock',
    'pop',
    'hip hop',
    'cover',
  ];

  const hasClassicalContent = classicalKeywords.some((keyword) =>
    content.includes(keyword)
  );

  const hasExcludedContent = excludeKeywords.some((keyword) =>
    content.includes(keyword)
  );

  return hasClassicalContent && !hasExcludedContent;
}

// Endpoint para verificar disponibilidade de uma fonte específica
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const audioUrl = url.searchParams.get('url');

    if (!audioUrl) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    // Verificar se a URL está acessível
    const headResponse = await fetch(audioUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 segundos timeout
    });

    return NextResponse.json({
      available: headResponse.ok,
      status: headResponse.status,
      contentType: headResponse.headers.get('content-type'),
      contentLength: headResponse.headers.get('content-length'),
    });
  } catch (error) {
    return NextResponse.json({
      available: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
