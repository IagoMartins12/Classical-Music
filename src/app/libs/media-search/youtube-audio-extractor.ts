// app/libs/media-search/youtube-audio-extractor.ts

interface YouTubeAudioInfo {
  audioUrl: string;
  duration: number;
  quality: string;
  title: string;
}

/**
 * Extrai URL de áudio do YouTube usando yt-dlp-like approach
 * IMPORTANTE: Use apenas para música clássica em domínio público
 */
export async function extractYouTubeAudio(
  videoId: string
): Promise<YouTubeAudioInfo | null> {
  try {
    // Opção 1: Usar serviço de proxy (recomendado para produção)
    const audioInfo = await extractViaProxy(videoId);
    if (audioInfo) return audioInfo;

    // Opção 2: Usar API interna do YouTube (pode quebrar)
    return await extractViaYouTubeAPI(videoId);
  } catch (error) {
    console.error('Erro ao extrair áudio do YouTube:', error);
    return null;
  }
}

/**
 * Extrai áudio usando serviço de proxy
 */
async function extractViaProxy(
  videoId: string
): Promise<YouTubeAudioInfo | null> {
  try {
    const response = await fetch('/api/youtube-audio-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.audioInfo;
  } catch (error) {
    console.error('Erro no proxy de áudio:', error);
    return null;
  }
}

/**
 * Extrai áudio usando métodos diretos (para desenvolvimento)
 */
async function extractViaYouTubeAPI(
  videoId: string
): Promise<YouTubeAudioInfo | null> {
  try {
    // Esta é uma abordagem simplificada - em produção use um serviço adequado
    const playerUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Para desenvolvimento local, retornar URL de exemplo
    if (process.env.NODE_ENV === 'development') {
      return {
        audioUrl: `https://rr3---sn-p5qlsn7e.googlevideo.com/videoplayback?expire=1234567890&ei=example&ip=127.0.0.1&id=o-example&itag=140&source=youtube&requiressl=yes&mime=audio%2Fmp4&gir=yes&clen=3000000&dur=180.000&lmt=1234567890&fvip=3&c=WEB&txp=1234567&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cmime%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Clsig&lsig=example`,
        duration: 180000,
        quality: '128kbps',
        title: 'Audio stream',
      };
    }

    return null;
  } catch (error) {
    console.error('Erro na extração direta:', error);
    return null;
  }
}

/**
 * Verifica se o vídeo é elegível para extração de áudio
 * (apenas música clássica em domínio público)
 */
export function isEligibleForAudioExtraction(
  title: string,
  channel: string,
  description?: string
): boolean {
  const content = `${title} ${channel} ${description || ''}`.toLowerCase();

  // Palavras que indicam música clássica em domínio público
  const publicDomainKeywords = [
    'bach',
    'mozart',
    'beethoven',
    'chopin',
    'classical',
    'symphony',
    'sonata',
    'concerto',
    'public domain',
    'royalty free',
    'creative commons',
    'classical music',
    'piano',
    'violin',
    'orchestra',
  ];

  // Palavras que indicam conteúdo protegido por direitos autorais
  const copyrightedKeywords = [
    'official',
    'record label',
    'warner',
    'sony',
    'universal',
    'decca',
    'deutsche grammophon',
    '©',
    'copyright',
    'all rights reserved',
  ];

  // Verificar se contém palavras de domínio público
  const hasPublicDomainContent = publicDomainKeywords.some((keyword) =>
    content.includes(keyword)
  );

  // Verificar se contém indicações de direitos autorais
  const hasCopyrightedContent = copyrightedKeywords.some((keyword) =>
    content.includes(keyword)
  );

  return hasPublicDomainContent && !hasCopyrightedContent;
}

/**
 * Busca fontes alternativas de áudio para música clássica
 */
export async function searchAlternativeAudioSources(
  title: string,
  composer: string
): Promise<{ source: string; audioUrl: string; duration: number }[]> {
  const sources = [];

  try {
    // 1. Internet Archive (música clássica gratuita)
    const archiveResult = await searchInternetArchive(title, composer);
    if (archiveResult) sources.push(archiveResult);

    // 2. Freesound (para alguns efeitos e música clássica)
    const freesoundResult = await searchFreesound(title, composer);
    if (freesoundResult) sources.push(freesoundResult);

    // 3. Wikimedia Commons
    const wikimediaResult = await searchWikimedia(title, composer);
    if (wikimediaResult) sources.push(wikimediaResult);
  } catch (error) {
    console.error('Erro ao buscar fontes alternativas:', error);
  }

  return sources;
}

async function searchInternetArchive(title: string, composer: string) {
  try {
    const query = `${title} ${composer}`.replace(/\s+/g, '+');
    const response = await fetch(
      `https://archive.org/advancedsearch.php?q=${query}&fl=identifier,title,creator,format&rows=5&page=1&output=json&mediatype=audio`
    );

    const data = await response.json();

    if (data.response?.docs?.length > 0) {
      const item = data.response.docs[0];
      return {
        source: 'Internet Archive',
        audioUrl: `https://archive.org/download/${item.identifier}/${item.identifier}.mp3`,
        duration: 0, // Será preenchido quando carregar
      };
    }
  } catch (error) {
    console.error('Erro no Internet Archive:', error);
  }
  return null;
}

async function searchFreesound(title: string, composer: string) {
  try {
    // Freesound requer API key
    const apiKey = process.env.FREESOUND_API_KEY;
    if (!apiKey) return null;

    const query = `${title} ${composer}`.replace(/\s+/g, '+');
    const response = await fetch(
      `https://freesound.org/apiv2/search/text/?query=${query}&format=json&fields=id,name,url,download,duration&token=${apiKey}`
    );

    const data = await response.json();

    if (data.results?.length > 0) {
      const sound = data.results[0];
      return {
        source: 'Freesound',
        audioUrl: sound.download,
        duration: sound.duration * 1000, // converter para ms
      };
    }
  } catch (error) {
    console.error('Erro no Freesound:', error);
  }
  return null;
}

async function searchWikimedia(title: string, composer: string) {
  try {
    const query = `${title} ${composer}`.replace(/\s+/g, '+');
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${query}&srnamespace=6&origin=*`
    );

    const data = await response.json();

    if (data.query?.search?.length > 0) {
      const file = data.query.search[0];
      // Wikimedia files podem ser acessados diretamente
      return {
        source: 'Wikimedia Commons',
        audioUrl: `https://commons.wikimedia.org/wiki/File:${file.title.replace(
          'File:',
          ''
        )}`,
        duration: 0,
      };
    }
  } catch (error) {
    console.error('Erro no Wikimedia:', error);
  }
  return null;
}
