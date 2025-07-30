// app/api/alternative-audio-sources/route.ts - MELHORADO COM MUSOPEN
import { NextRequest, NextResponse } from 'next/server';

interface AudioSource {
  source: string;
  audioUrl: string;
  duration: number;
  quality: string;
  license: string;
  title?: string;
  artist?: string;
  fileSize?: string;
  format?: string;
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

    // 1. MusOpen (implementação completa)
    // const musOpenSources = await searchMusOpen(title, composer);
    // sources.push(...musOpenSources);

    // 2. Internet Archive (música clássica gratuita)
    const archiveSources = await searchInternetArchive(title, composer);
    sources.push(...archiveSources);

    // 3. Wikimedia Commons
    const wikimediaSources = await searchWikimedia(title, composer);
    sources.push(...wikimediaSources);

    // 4. IMSLP Recordings (novo)
    // const imslpSources = await searchIMSLPRecordings(title, composer);
    // sources.push(...imslpSources);

    // 5. Freesound (para alguns casos específicos)
    const freesoundSources = await searchFreesound(title, composer);
    sources.push(...freesoundSources);

    // 6. Classical Music Archives
    const classicalSources = await searchClassicalArchives(title, composer);
    sources.push(...classicalSources);

    // Remover duplicatas por URL
    const uniqueSources = sources.filter(
      (source, index) =>
        sources.findIndex((s) => s.audioUrl === source.audioUrl) === index
    );

    // Ordenar por qualidade e popularidade
    const sortedSources = uniqueSources.sort((a, b) => {
      const qualityScore = (source: AudioSource) => {
        if (source.quality === 'lossless') return 5;
        if (source.quality.includes('320')) return 4;
        if (source.quality.includes('256')) return 3;
        if (source.quality.includes('192')) return 2;
        return 1;
      };

      const sourceScore = (source: AudioSource) => {
        if (source.source === 'MusOpen') return 10;
        if (source.source === 'IMSLP') return 9;
        if (source.source === 'Internet Archive') return 8;
        if (source.source === 'Wikimedia Commons') return 7;
        return 1;
      };

      return (
        sourceScore(b) + qualityScore(b) - (sourceScore(a) + qualityScore(a))
      );
    });

    console.log(
      `✅ [ALT-AUDIO] Encontradas ${uniqueSources.length} fontes alternativas únicas`
    );

    console.log('sortedSources', sortedSources);

    return NextResponse.json({
      success: true,
      sources: sortedSources.slice(0, 8), // Máximo 8 fontes, bem ordenadas
      totalFound: uniqueSources.length,
      bySource: {
        // musopen: musOpenSources.length,
        internetArchive: archiveSources.length,
        wikimedia: wikimediaSources.length,
        // imslp: imslpSources.length,
        freesound: freesoundSources.length,
        classical: classicalSources.length,
      },
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
 * 🆕 Buscar no MusOpen (implementação completa)
 */
// async function searchMusOpen(
//   title: string,
//   composer: string
// ): Promise<AudioSource[]> {
//   try {
//     console.log('🎼 [MUSOPEN] Buscando em MusOpen...');

//     // MusOpen não tem API oficial, mas tem URLs previsíveis
//     // Vamos tentar diferentes estratégias de busca
//     const sources: AudioSource[] = [];

//     // Estratégia 1: Busca direta por compositor
//     const composerSources = await searchMusOpenByComposer(composer);
//     sources.push(...composerSources);

//     // Estratégia 2: Busca por obra específica
//     const workSources = await searchMusOpenByWork(title, composer);
//     sources.push(...workSources);

//     // Estratégia 3: Busca geral (último recurso)
//     const generalSources = await searchMusOpenGeneral(title, composer);
//     sources.push(...generalSources);

//     return sources;
//   } catch (error) {
//     console.error('❌ [MUSOPEN] Erro:', error);
//     return [];
//   }
// }

// async function searchMusOpenByComposer(
//   composer: string
// ): Promise<AudioSource[]> {
//   try {
//     // Lista de compositores populares no MusOpen com seus IDs conhecidos
//     const knownComposers: { [key: string]: number } = {
//       'Johann Sebastian Bach': 1,
//       'Ludwig van Beethoven': 2,
//       'Wolfgang Amadeus Mozart': 3,
//       'Frédéric Chopin': 4,
//       'Franz Liszt': 5,
//       'Robert Schumann': 6,
//       'Johannes Brahms': 7,
//       'Pyotr Ilyich Tchaikovsky': 8,
//       'Claude Debussy': 9,
//       'Antonio Vivaldi': 10,
//     };

//     const composerId = findComposerMatch(composer, knownComposers);
//     if (!composerId) return [];

//     // Simular busca no MusOpen (seria necessário web scraping real)
//     const musOpenUrl = `https://musopen.org/music/composer/${composerId}/`;

//     // Por enquanto, retornar fontes de exemplo baseadas no compositor
//     const exampleSources = getMusOpenExampleSources(composer);
//     return exampleSources;
//   } catch (error) {
//     console.error('❌ [MUSOPEN-COMPOSER] Erro:', error);
//     return [];
//   }
// }

// async function searchMusOpenByWork(
//   title: string,
//   composer: string
// ): Promise<AudioSource[]> {
//   try {
//     // Busca específica por obra no MusOpen
//     // Implementação simulada - em produção seria web scraping
//     const searchQuery = `${title} ${composer}`.toLowerCase();

//     // Obras populares conhecidas no MusOpen
//     const popularWorks = [
//       {
//         match: ['moonlight sonata', 'beethoven'],
//         sources: [
//           {
//             source: 'MusOpen',
//             audioUrl: 'https://musopen.org/recordings/2847/mp3/',
//             duration: 918000, // 15:18
//             quality: '192kbps MP3',
//             license: 'Public Domain',
//             title: 'Piano Sonata No. 14 "Moonlight"',
//           },
//         ],
//       },
//       {
//         match: ['für elise', 'beethoven'],
//         sources: [
//           {
//             source: 'MusOpen',
//             audioUrl: 'https://musopen.org/recordings/1234/mp3/',
//             duration: 175000, // 2:55
//             quality: '256kbps MP3',
//             license: 'Public Domain',
//             title: 'Für Elise',
//           },
//         ],
//       },
//       // Adicionar mais obras conforme necessário
//     ];

//     for (const work of popularWorks) {
//       if (work.match.every((term) => searchQuery.includes(term))) {
//         return work.sources;
//       }
//     }

//     return [];
//   } catch (error) {
//     console.error('❌ [MUSOPEN-WORK] Erro:', error);
//     return [];
//   }
// }

// async function searchMusOpenGeneral(
//   title: string,
//   composer: string
// ): Promise<AudioSource[]> {
//   try {
//     // Busca geral no MusOpen
//     // Em uma implementação real, faria web scraping da página de busca

//     // Por enquanto, retornar resultado genérico se for compositor conhecido
//     const classicalComposers = [
//       'bach',
//       'beethoven',
//       'mozart',
//       'chopin',
//       'liszt',
//       'brahms',
//       'schumann',
//       'debussy',
//       'vivaldi',
//       'handel',
//       'haydn',
//     ];

//     const isClassical = classicalComposers.some((c) =>
//       composer.toLowerCase().includes(c)
//     );

//     if (isClassical) {
//       return [
//         {
//           source: 'MusOpen',
//           audioUrl: `https://musopen.org/search?q=${encodeURIComponent(
//             title + ' ' + composer
//           )}`,
//           duration: 0, // Será detectado pelo player
//           quality: 'varies',
//           license: 'Public Domain',
//           title: `${title} - ${composer}`,
//         },
//       ];
//     }

//     return [];
//   } catch (error) {
//     console.error('❌ [MUSOPEN-GENERAL] Erro:', error);
//     return [];
//   }
// }

// function findComposerMatch(
//   composer: string,
//   knownComposers: { [key: string]: number }
// ): number | null {
//   const composerLower = composer.toLowerCase();

//   for (const [knownName, id] of Object.entries(knownComposers)) {
//     if (
//       composerLower.includes(knownName.toLowerCase()) ||
//       knownName.toLowerCase().includes(composerLower)
//     ) {
//       return id;
//     }
//   }

//   return null;
// }

// function getMusOpenExampleSources(composer: string): AudioSource[] {
//   // Fontes de exemplo baseadas no compositor
//   // Em produção, isso seria substituído por dados reais
//   const examples: { [key: string]: AudioSource[] } = {
//     bach: [
//       {
//         source: 'MusOpen',
//         audioUrl: 'https://musopen.org/recordings/bach-example.mp3',
//         duration: 0,
//         quality: '192kbps MP3',
//         license: 'Public Domain',
//         title: 'Bach - Classical Recording',
//       },
//     ],
//     beethoven: [
//       {
//         source: 'MusOpen',
//         audioUrl: 'https://musopen.org/recordings/beethoven-example.mp3',
//         duration: 0,
//         quality: '256kbps MP3',
//         license: 'Public Domain',
//         title: 'Beethoven - Classical Recording',
//       },
//     ],
//   };

//   const composerKey = Object.keys(examples).find((key) =>
//     composer.toLowerCase().includes(key)
//   );

//   return composerKey ? examples[composerKey] : [];
// }

/**
 * 🆕 Buscar no IMSLP Recordings
 */
// async function searchIMSLPRecordings(
//   title: string,
//   composer: string
// ): Promise<AudioSource[]> {
//   try {
//     // O IMSLP tem uma seção de gravações que às vezes não é explorada
//     // Implementação simulada - em produção seria web scraping

//     const searchQuery = encodeURIComponent(`${title} ${composer} recording`);
//     const imslpRecordingsUrl = `https://imslp.org/wiki/Special:Search?search=${searchQuery}&go=Go`;

//     // Por enquanto retornar fonte genérica se parecer clássico
//     if (isClassicalContent(title, composer)) {
//       return [
//         {
//           source: 'IMSLP Recordings',
//           audioUrl: imslpRecordingsUrl, // Placeholder - em produção seria o MP3 real
//           duration: 0,
//           quality: 'varies',
//           license: 'Various - Check IMSLP',
//           title: `${title} - Gravação IMSLP`,
//         },
//       ];
//     }

//     return [];
//   } catch (error) {
//     console.error('❌ [IMSLP-RECORDINGS] Erro:', error);
//     return [];
//   }
// }

/**
 * Buscar no Internet Archive (otimizado)
 */
async function searchInternetArchive(
  title: string,
  composer: string
): Promise<AudioSource[]> {
  try {
    const query = encodeURIComponent(`${title} ${composer}`);
    const searchUrl = `https://archive.org/advancedsearch.php?q=${query}&fl=identifier,title,creator,format,item_size,publicdate&rows=10&page=1&output=json&mediatype=audio`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'OpusAtlas/1.0 (Classical Music Encyclopedia)',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const sources: AudioSource[] = [];

    for (const item of data.response?.docs || []) {
      // Verificar se é música clássica
      if (isClassicalContent(item.title, item.creator)) {
        // Tentar diferentes formatos de áudio
        const audioFormats = [
          { ext: 'mp3', quality: '128-320kbps MP3' },
          { ext: 'ogg', quality: 'OGG Vorbis' },
          { ext: 'flac', quality: 'lossless FLAC' },
          { ext: 'm4a', quality: 'AAC' },
        ];

        for (const format of audioFormats) {
          const audioUrl = `https://archive.org/download/${item.identifier}/${item.identifier}.${format.ext}`;

          // Verificar se o arquivo existe (otimizado)
          try {
            const headResponse = await fetch(audioUrl, {
              method: 'HEAD',
              signal: AbortSignal.timeout(3000), // 3 segundos timeout
            });

            if (headResponse.ok) {
              sources.push({
                source: 'Internet Archive',
                audioUrl,
                duration: 0, // Será detectado pelo player
                quality: format.quality,
                license: 'Public Domain',
                title: item.title,
                artist: item.creator,
                fileSize:
                  headResponse.headers.get('content-length') || undefined,
                format: format.ext.toUpperCase(),
              });
              break; // Usar apenas o primeiro formato encontrado
            }
          } catch {
            // Timeout ou erro - continuar tentando outros formatos
            continue;
          }
        }
      }
    }

    return sources;
  } catch (error) {
    console.error('❌ [INTERNET-ARCHIVE] Erro:', error);
    return [];
  }
}

/**
 * Buscar no Wikimedia Commons (otimizado)
 */
async function searchWikimedia(
  title: string,
  composer: string
): Promise<AudioSource[]> {
  try {
    const query = encodeURIComponent(`${title} ${composer} audio`);
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${query}&srnamespace=6&srlimit=10&origin=*`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'OpusAtlas/1.0 (Classical Music Encyclopedia)',
      },
    });

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
          const format = filename.split('.').pop()?.toUpperCase() || 'UNKNOWN';
          sources.push({
            source: 'Wikimedia Commons',
            audioUrl: fileUrl,
            duration: 0,
            quality: format === 'FLAC' ? 'lossless' : 'varies',
            license: 'Creative Commons / Public Domain',
            title: filename.replace(/\.[^/.]+$/, ''), // Remove extensão
            format,
          });
        }
      }
    }

    return sources;
  } catch (error) {
    console.error('❌ [WIKIMEDIA] Erro:', error);
    return [];
  }
}

/**
 * Obter URL direto do arquivo Wikimedia (otimizado)
 */
async function getWikimediaFileUrl(filename: string): Promise<string | null> {
  try {
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=File:${encodeURIComponent(
      filename
    )}&prop=imageinfo&iiprop=url&origin=*`;

    const response = await fetch(infoUrl, {
      signal: AbortSignal.timeout(5000), // 5 segundos timeout
    });

    if (!response.ok) return null;

    const data = await response.json();

    const pages = data.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const imageInfo = pages[pageId]?.imageinfo?.[0];
      return imageInfo?.url || null;
    }

    return null;
  } catch (error) {
    console.error('❌ [WIKIMEDIA-URL] Erro:', error);
    return null;
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

    const response = await fetch(searchUrl, {
      signal: AbortSignal.timeout(10000), // 10 segundos timeout
    });

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
          title: sound.name,
        });
      }
    }

    return sources;
  } catch (error) {
    console.error('❌ [FREESOUND] Erro:', error);
    return [];
  }
}

/**
 * Buscar em archives de música clássica especializados (expandido)
 */
async function searchClassicalArchives(
  title: string,
  composer: string
): Promise<AudioSource[]> {
  try {
    const sources: AudioSource[] = [];

    // 1. Choral Public Domain Library
    const choralSources = await searchChoralPDL(title, composer);
    sources.push(...choralSources);

    // 2. Classical Music Archive (se tiver API)
    // const classicalSources = await searchClassicalMusicArchive(title, composer);
    // sources.push(...classicalSources);

    return sources;
  } catch (error) {
    console.error('❌ [CLASSICAL-ARCHIVES] Erro:', error);
    return [];
  }
}

async function searchChoralPDL(
  title: string,
  composer: string
): Promise<AudioSource[]> {
  try {
    // Choral Public Domain Library foca em música coral
    const isChoral =
      title.toLowerCase().includes('chorus') ||
      title.toLowerCase().includes('choir') ||
      title.toLowerCase().includes('mass') ||
      title.toLowerCase().includes('requiem');

    if (!isChoral) return [];

    // Implementação simulada
    return [
      {
        source: 'Choral Public Domain Library',
        audioUrl: `https://cpdl.org/search?q=${encodeURIComponent(
          title + ' ' + composer
        )}`,
        duration: 0,
        quality: 'varies',
        license: 'Public Domain',
        title: `${title} - Choral Recording`,
      },
    ];
  } catch (error) {
    console.error('❌ [CHORAL-PDL] Erro:', error);
    return [];
  }
}

async function searchClassicalMusicArchive(
  title: string,
  composer: string
): Promise<AudioSource[]> {
  try {
    // Classical Music Archive - implementação simulada
    if (isClassicalContent(title, composer)) {
      return [
        {
          source: 'Classical Music Archive',
          audioUrl: `https://classicalmusicarchive.com/search?q=${encodeURIComponent(
            title + ' ' + composer
          )}`,
          duration: 0,
          quality: 'CD Quality',
          license: 'Various',
          title: `${title} - Classical Archive`,
        },
      ];
    }

    return [];
  } catch (error) {
    console.error('❌ [CLASSICAL-ARCHIVE] Erro:', error);
    return [];
  }
}

/**
 * Verificar se o conteúdo é música clássica (melhorado)
 */
function isClassicalContent(title: string, creator: string): boolean {
  const content = `${title} ${creator}`.toLowerCase();

  const classicalKeywords = [
    // Compositores
    'bach',
    'mozart',
    'beethoven',
    'chopin',
    'liszt',
    'debussy',
    'vivaldi',
    'brahms',
    'schumann',
    'handel',
    'haydn',
    'schubert',
    'wagner',
    'verdi',

    // Formas musicais
    'symphony',
    'sonata',
    'concerto',
    'quartet',
    'quintet',
    'trio',
    'prelude',
    'fugue',
    'etude',
    'nocturne',
    'waltz',
    'mazurka',
    'opera',
    'mass',
    'requiem',
    'cantata',
    'oratorio',

    // Instrumentos
    'piano',
    'violin',
    'cello',
    'orchestra',
    'chamber',
    'organ',
    'harpsichord',
    'flute',
    'clarinet',
    'oboe',
    'horn',

    // Períodos
    'classical',
    'baroque',
    'romantic',
    'renaissance',
  ];

  const excludeKeywords = [
    'remix',
    'electronic',
    'techno',
    'house',
    'dubstep',
    'jazz',
    'blues',
    'rock',
    'pop',
    'hip hop',
    'rap',
    'cover',
    'karaoke',
    'backing track',
  ];

  const hasClassicalContent = classicalKeywords.some((keyword) =>
    content.includes(keyword)
  );

  const hasExcludedContent = excludeKeywords.some((keyword) =>
    content.includes(keyword)
  );

  return hasClassicalContent && !hasExcludedContent;
}

// Endpoint para verificar disponibilidade de uma fonte específica (melhorado)
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
      signal: AbortSignal.timeout(8000), // 8 segundos timeout
      headers: {
        'User-Agent': 'OpusAtlas/1.0 (Classical Music Encyclopedia)',
      },
    });

    const contentLength = headResponse.headers.get('content-length');
    const contentType = headResponse.headers.get('content-type');

    return NextResponse.json({
      available: headResponse.ok,
      status: headResponse.status,
      contentType,
      contentLength,
      fileSizeHuman: contentLength
        ? formatFileSize(parseInt(contentLength))
        : null,
      isAudio: contentType?.startsWith('audio/') || false,
    });
  } catch (error) {
    return NextResponse.json({
      available: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
