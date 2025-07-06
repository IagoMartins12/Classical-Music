// app/api/uploads/external-sources/scraper/route.ts - MELHORADO
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapedComposerData {
  name: string;
  fullName: string;
  otherName: string | null;
  alternativeNames: string | null;
  pseudonyms: string | null;
  birthDate: string | null; // Formato YYYY-MM-DD para input date
  deathDate: string | null; // Formato YYYY-MM-DD para input date
  portraitUrl: string | null;
  bio: string | null;
  diverseInfo: string | null;
  externalLinks: string | null;
  imslpId: string | null;
  wikipediaLink: string | null;
  nationality: string | null; // Traduzida para português
  instruments: string | null;
  imslpCategories: string | null;
  primaryRole: string | null;
  roles: string | null;
  pageQuality: string;
  dataCompleteness: number;
  hasValidImage: boolean;
  epochName?: string; // Época determinada automaticamente
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, source } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatório' }, { status: 400 });
    }

    // Determinar o tipo de fonte baseado na URL
    const isIMSLP = url.includes('imslp.org');
    const isWikipedia = url.includes('wikipedia.org');

    // ✅ VALIDAÇÃO MELHORADA - Verificar se URL corresponde à fonte selecionada
    if (source === 'imslp' && !isIMSLP) {
      return NextResponse.json(
        {
          error:
            'Por favor, insira um link válido do IMSLP. Exemplo: https://imslp.org/wiki/Category:Compositor,_Nome',
        },
        { status: 400 }
      );
    }

    if (source === 'wikipedia' && !isWikipedia) {
      return NextResponse.json(
        {
          error:
            'Por favor, insira um link válido da Wikipedia. Exemplo: https://en.wikipedia.org/wiki/Nome_do_Compositor',
        },
        { status: 400 }
      );
    }

    if (!isIMSLP && !isWikipedia) {
      return NextResponse.json(
        { error: 'Apenas URLs do IMSLP ou Wikipedia são suportadas' },
        { status: 400 }
      );
    }

    let scrapedData: ScrapedComposerData;

    if (isIMSLP) {
      scrapedData = await scrapeIMSLP(url);
    } else {
      scrapedData = await scrapeWikipedia(url);
    }

    return NextResponse.json({
      success: true,
      data: scrapedData,
      source: isIMSLP ? 'IMSLP' : 'Wikipedia',
    });
  } catch (error) {
    console.error('Erro no scraping:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer scraping da página' },
      { status: 500 }
    );
  }
}

// Função melhorada para scraping da Wikipedia
async function scrapeWikipedia(url: string): Promise<ScrapedComposerData> {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Extrair nome do título da página
    const fullName = $('#firstHeading').text().trim();
    const name = extractFirstName(fullName);

    // Extrair datas com função melhorada
    const dateInfo = extractWikipediaDates($);

    // Extrair nacionalidade traduzida para português
    const nationality = extractWikipediaNationalityTranslated($);

    // Extrair primeiro parágrafo como bio
    const bio = $('.mw-parser-output > p').first().text().trim();

    // Extrair imagem
    const portraitUrl = extractWikipediaImage($);

    // Determinar época baseada no ano de nascimento
    const epochName = determineEpochByBirthYear(dateInfo.birthDate);

    return {
      name,
      fullName,
      otherName: null,
      alternativeNames: null,
      pseudonyms: null,
      birthDate: dateInfo.birthDate,
      deathDate: dateInfo.deathDate,
      portraitUrl,
      bio: bio || null,
      diverseInfo: null,
      externalLinks: null,
      imslpId: null,
      wikipediaLink: url,
      nationality, // Traduzida para português
      instruments: null,
      imslpCategories: null,
      primaryRole: 'Compositor', // Assumir compositor por padrão
      roles: null,
      pageQuality: bio ? 'high' : 'medium',
      dataCompleteness: calculateWikipediaCompleteness(
        bio,
        dateInfo.birthDate,
        dateInfo.deathDate,
        nationality,
        portraitUrl
      ),
      hasValidImage: !!portraitUrl,
      epochName, // Determinada automaticamente pelo ano de nascimento
    };
  } catch (error) {
    console.error('Erro ao fazer scraping da Wikipedia:', error);
    throw error;
  }
}

// Função para extrair nacionalidade da Wikipedia traduzida para português
function extractWikipediaNationalityTranslated(
  $: cheerio.CheerioAPI
): string | null {
  // Tentar na infobox primeiro
  let nationality: string | null = null;

  $('.infobox tr, .infobox-vcard tr').each((_, row) => {
    const $row = $(row);
    const header = $row.find('th').text().trim().toLowerCase();
    const cellText = $row.find('td').text().trim().toLowerCase();

    if (
      (header.includes('nationality') || header.includes('nacionalidade')) &&
      cellText
    ) {
      // Tentar traduzir a nacionalidade encontrada
      const translatedNationality = translateNationality(cellText);
      if (translatedNationality) {
        nationality = translatedNationality;
        return false; // break
      }
    }
  });

  if (nationality) return nationality;

  // Tentar no primeiro parágrafo
  const firstParagraph = $('.mw-parser-output > p')
    .first()
    .text()
    .toLowerCase();

  // Procurar por padrões de nacionalidade e traduzir
  for (const [englishTerm, portugueseTerm] of Object.entries(
    NATIONALITY_TRANSLATION
  )) {
    if (firstParagraph.includes(englishTerm)) {
      console.log(
        `🌍 Nacionalidade encontrada: ${portugueseTerm} (padrão: "${englishTerm}")`
      );
      return portugueseTerm;
    }
  }

  return null;
}

// Função auxiliar para traduzir nacionalidade
function translateNationality(nationalityText: string): string | null {
  const lowerText = nationalityText.toLowerCase();

  for (const [englishTerm, portugueseTerm] of Object.entries(
    NATIONALITY_TRANSLATION
  )) {
    if (lowerText.includes(englishTerm)) {
      return portugueseTerm;
    }
  }

  return null;
}

// Função melhorada para extrair datas da Wikipedia
function extractWikipediaDates($: cheerio.CheerioAPI): {
  birthDate: string | null;
  deathDate: string | null;
} {
  let birthDate: string | null = null;
  let deathDate: string | null = null;

  // Estratégia 1: Tentar extrair da infobox
  const infoboxDates = extractFromInfoboxImproved($);
  if (infoboxDates.birthDate) birthDate = infoboxDates.birthDate;
  if (infoboxDates.deathDate) deathDate = infoboxDates.deathDate;

  // Estratégia 2: Se não encontrou na infobox, tentar no primeiro parágrafo
  if (!birthDate || !deathDate) {
    const paragraphDates = extractDatesFromFirstParagraph($);
    if (!birthDate && paragraphDates.birthDate)
      birthDate = paragraphDates.birthDate;
    if (!deathDate && paragraphDates.deathDate)
      deathDate = paragraphDates.deathDate;
  }

  // Estratégia 3: Buscar em todo o texto da página
  if (!birthDate || !deathDate) {
    const textDates = extractDatesFromFullText($);
    if (!birthDate && textDates.birthDate) birthDate = textDates.birthDate;
    if (!deathDate && textDates.deathDate) deathDate = textDates.deathDate;
  }

  return {
    birthDate: birthDate ? formatDateToISO(birthDate) : null,
    deathDate: deathDate ? formatDateToISO(deathDate) : null,
  };
}

// Extração melhorada da infobox
function extractFromInfoboxImproved($: cheerio.CheerioAPI): {
  birthDate: string | null;
  deathDate: string | null;
} {
  let birthDate: string | null = null;
  let deathDate: string | null = null;

  // Procurar na infobox
  $('.infobox tr, .infobox-vcard tr').each((_, row) => {
    const $row = $(row);
    const header = $row.find('th').text().trim().toLowerCase();
    const cellText = $row.find('td').text().trim();

    // Procurar por nascimento
    if (
      (header.includes('born') ||
        header.includes('birth') ||
        header.includes('nascimento')) &&
      cellText
    ) {
      const extractedDate = extractDateFromText(cellText);
      if (extractedDate && !birthDate) {
        birthDate = extractedDate;
      }
    }

    // Procurar por morte
    if (
      (header.includes('died') ||
        header.includes('death') ||
        header.includes('morte') ||
        header.includes('falec')) &&
      cellText
    ) {
      const extractedDate = extractDateFromText(cellText);
      if (extractedDate && !deathDate) {
        deathDate = extractedDate;
      }
    }
  });

  return { birthDate, deathDate };
}

// Extrair datas do primeiro parágrafo
function extractDatesFromFirstParagraph($: cheerio.CheerioAPI): {
  birthDate: string | null;
  deathDate: string | null;
} {
  const firstParagraph = $('.mw-parser-output > p').first().text();

  // Padrões comuns para datas de nascimento e morte
  const dateRangePatterns = [
    // Inglês: (17 May 1866 – 1 July 1925)
    /\(([^)]*?(\d{1,2}\s+\w+\s+\d{4})[^)]*?)[–—-]\s*([^)]*?(\d{1,2}\s+\w+\s+\d{4})[^)]*?)\)/,
    // Português: (Honfleur, 17 de Maio de 1866 — Paris, 1 de Julho de 1925)
    /\(([^)]*?(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})[^)]*?)[–—-]\s*([^)]*?(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})[^)]*?)\)/,
    // Apenas anos: (1866-1925)
    /\((\d{4})[–—-](\d{4})\)/,
  ];

  for (const pattern of dateRangePatterns) {
    const match = firstParagraph.match(pattern);
    if (match) {
      const birthText = match[1];
      const deathText = match[3] || match[2]; // Para o padrão de apenas anos

      return {
        birthDate: extractDateFromText(birthText),
        deathDate: extractDateFromText(deathText),
      };
    }
  }

  return { birthDate: null, deathDate: null };
}

// Extrair datas de todo o texto da página
function extractDatesFromFullText($: cheerio.CheerioAPI): {
  birthDate: string | null;
  deathDate: string | null;
} {
  const fullText = $('body').text();

  // Procurar por padrões específicos
  const birthPatterns = [
    /born[^.]*?(\d{1,2}\s+\w+\s+\d{4})/i,
    /nasceu[^.]*?(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i,
    /nascimento[^.]*?(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i,
  ];

  const deathPatterns = [
    /died[^.]*?(\d{1,2}\s+\w+\s+\d{4})/i,
    /morreu[^.]*?(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i,
    /morte[^.]*?(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i,
  ];

  let birthDate: string | null = null;
  let deathDate: string | null = null;

  for (const pattern of birthPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      birthDate = extractDateFromText(match[1]);
      break;
    }
  }

  for (const pattern of deathPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      deathDate = extractDateFromText(match[1]);
      break;
    }
  }

  return { birthDate, deathDate };
}

// Extrair data de um texto específico
function extractDateFromText(text: string): string | null {
  if (!text) return null;

  // Limpar o texto
  let cleanText = text.trim();

  // Remover informações extras como locais e outras informações
  cleanText = cleanText.replace(/\([^)]*\)/g, ''); // Remove parênteses
  cleanText = cleanText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, ''); // Remove datas ISO já presentes
  cleanText = cleanText.replace(/aged \d+/i, ''); // Remove "aged X"

  // Padrões de data para extração
  const datePatterns = [
    // Inglês: 17 May 1866, May 17 1866, 17th May 1866
    /(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i,
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i,

    // Português: 17 de Maio de 1866, 17 de maio de 1866
    /(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/i,

    // Apenas ano
    /\b(\d{4})\b/,
  ];

  for (const pattern of datePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      if (pattern.source.includes('de\\s+')) {
        // Português
        const day = match[1];
        const month = getMonthNumber(match[2], 'pt');
        const year = match[3];
        if (month) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } else if (match.length === 4 && pattern.source.includes('January|')) {
        // Inglês com mês primeiro
        const month = getMonthNumber(match[1], 'en');
        const day = match[2];
        const year = match[3];
        if (month) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } else if (match.length === 4) {
        // Inglês com dia primeiro
        const day = match[1];
        const month = getMonthNumber(match[2], 'en');
        const year = match[3];
        if (month) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } else {
        // Apenas ano
        const year = match[1];
        return `${year}-01-01`;
      }
    }
  }

  return null;
}

// Converter nome do mês para número
function getMonthNumber(
  monthName: string,
  language: 'en' | 'pt'
): string | null {
  const months = {
    en: {
      january: '01',
      february: '02',
      march: '03',
      april: '04',
      may: '05',
      june: '06',
      july: '07',
      august: '08',
      september: '09',
      october: '10',
      november: '11',
      december: '12',
      jan: '01',
      feb: '02',
      mar: '03',
      apr: '04',
      jun: '06',
      jul: '07',
      aug: '08',
      sep: '09',
      oct: '10',
      nov: '11',
      dec: '12',
    },
    pt: {
      janeiro: '01',
      fevereiro: '02',
      março: '03',
      abril: '04',
      maio: '05',
      junho: '06',
      julho: '07',
      agosto: '08',
      setembro: '09',
      outubro: '10',
      novembro: '11',
      dezembro: '12',
      jan: '01',
      fev: '02',
      mar: '03',
      abr: '04',
      mai: '05',
      jun: '06',
      jul: '07',
      ago: '08',
      set: '09',
      out: '10',
      nov: '11',
      dez: '12',
    },
  };

  return months[language][monthName.toLowerCase()] || null;
}

// Formatar data para ISO (YYYY-MM-DD)
function formatDateToISO(dateString: string): string | null {
  if (!dateString) return null;

  // Se já está em formato ISO, retornar como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Tentar extrair data do texto
  return extractDateFromText(dateString);
}

// Mapeamento de nacionalidades para português (baseado no imslp-scraper.ts)
const NATIONALITY_TRANSLATION: Record<string, string> = {
  // Inglês → Português
  german: 'Alemão',
  germany: 'Alemão',
  deutschland: 'Alemão',
  austrian: 'Austríaco',
  austria: 'Austríaco',
  österreich: 'Austríaco',
  french: 'Francês',
  france: 'Francês',
  français: 'Francês',
  italian: 'Italiano',
  italy: 'Italiano',
  italia: 'Italiano',
  russian: 'Russo',
  russia: 'Russo',
  english: 'Inglês',
  england: 'Inglês',
  british: 'Britânico',
  american: 'Americano',
  usa: 'Americano',
  'united states': 'Americano',
  polish: 'Polonês',
  poland: 'Polonês',
  polska: 'Polonês',
  spanish: 'Espanhol',
  spain: 'Espanhol',
  españa: 'Espanhol',
  czech: 'Tcheco',
  bohemian: 'Tcheco',
  czechoslovak: 'Tcheco',
  hungarian: 'Húngaro',
  hungary: 'Húngaro',
  magyar: 'Húngaro',
  dutch: 'Holandês',
  netherlands: 'Holandês',
  nederland: 'Holandês',
  belgian: 'Belga',
  belgium: 'Belga',
  belgique: 'Belga',
  swiss: 'Suíço',
  switzerland: 'Suíço',
  schweiz: 'Suíço',
  brazilian: 'Brasileiro',
  brazil: 'Brasileiro',
  brasil: 'Brasileiro',
  finnish: 'Finlandês',
  finland: 'Finlandês',
  suomi: 'Finlandês',
  norwegian: 'Norueguês',
  norway: 'Norueguês',
  norge: 'Norueguês',
  swedish: 'Sueco',
  sweden: 'Sueco',
  sverige: 'Sueco',
  danish: 'Dinamarquês',
  denmark: 'Dinamarquês',
  danmark: 'Dinamarquês',
  portuguese: 'Português',
  portugal: 'Português',
  canadian: 'Canadense',
  canada: 'Canadense',
  japanese: 'Japonês',
  japan: 'Japonês',
  chinese: 'Chinês',
  china: 'Chinês',
  korean: 'Coreano',
  korea: 'Coreano',
  mexican: 'Mexicano',
  mexico: 'Mexicano',
  argentinian: 'Argentino',
  argentina: 'Argentino',
  chilean: 'Chileno',
  chile: 'Chileno',
  peruvian: 'Peruano',
  peru: 'Peruano',
  venezuelan: 'Venezuelano',
  venezuela: 'Venezuelano',
  colombian: 'Colombiano',
  colombia: 'Colômbia',
  uruguayan: 'Uruguaio',
  uruguay: 'Uruguai',
  indian: 'Indiano',
  india: 'Índia',
  australian: 'Australiano',
  australia: 'Austrália',
  'new zealand': 'Neozelandês',
  'south african': 'Sul-africano',
  egyptian: 'Egípcio',
  turkish: 'Turco',
  greek: 'Grego',
  irish: 'Irlandês',
  scottish: 'Escocês',
  welsh: 'Galês',
};

// Função para extrair nacionalidade melhorada (baseada no imslp-scraper.ts)
function extractNationalityIMSLP($: cheerio.CheerioAPI): string | null {
  try {
    // Buscar na div cp_firsth por indicações de nacionalidade
    const firsthDiv = $('.cp_firsth');
    if (firsthDiv.length === 0) return null;

    const text = firsthDiv.text().toLowerCase();

    // Procurar por padrões de nacionalidade e traduzir para português
    for (const [englishTerm, portugueseTerm] of Object.entries(
      NATIONALITY_TRANSLATION
    )) {
      if (text.includes(englishTerm)) {
        console.log(
          `🌍 Nacionalidade encontrada: ${portugueseTerm} (padrão: "${englishTerm}")`
        );
        return portugueseTerm;
      }
    }

    // Tentar extrair de categorias se não encontrou no texto principal
    const categoriesText = extractCategoriesIMSLP($)?.toLowerCase();
    for (const [englishTerm, portugueseTerm] of Object.entries(
      NATIONALITY_TRANSLATION
    )) {
      if (categoriesText?.includes(englishTerm)) {
        console.log(
          `🌍 Nacionalidade encontrada nas categorias: ${portugueseTerm}`
        );
        return portugueseTerm;
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Erro ao extrair nacionalidade:', error);
    return null;
  }
}

// Função auxiliar para extrair categorias IMSLP
function extractCategoriesIMSLP($: cheerio.CheerioAPI): string | null {
  try {
    const categories: string[] = [];
    const categoryLinks = $('a[href*="Category:"]');

    categoryLinks.each((_, element) => {
      const categoryText = $(element).text().trim();
      if (
        categoryText &&
        !categoryText.includes('IMSLP') &&
        categoryText.length > 2
      ) {
        categories.push(categoryText);
      }
    });

    return categories.length > 0 ? [...new Set(categories)].join(', ') : null;
  } catch (error) {
    console.error('❌ Erro ao extrair categorias:', error);
    return null;
  }
}

// Função para extrair nome e fullName do IMSLP (baseada no padrão Category:Sobrenome,_Nome)
function extractNameAndFullNameIMSLP(
  imslpId: string,
  $: cheerio.CheerioAPI
): {
  name: string;
  fullName: string;
} {
  try {
    // Extrair nome do ID IMSLP - exemplo: "Category:Satie,_Erik" -> name: "Satie", fullName: "Erik Satie"
    let name = '';
    let fullName = '';

    if (imslpId) {
      const idWithoutCategory = imslpId.replace('Category:', '');
      const parts = idWithoutCategory.split(',');

      if (parts.length >= 2) {
        // O primeiro é o sobrenome, o segundo é o nome
        const lastName = parts[0].trim();
        const firstName = parts[1].trim().replace(/_/g, ' ');

        name = lastName;
        fullName = `${firstName} ${lastName}`;
      } else {
        // Se não tem vírgula, usar como está
        name = parts[0].trim().replace(/_/g, ' ');
        fullName = name;
      }
    }

    // Tentar pegar fullName da página se disponível
    const firsthDiv = $('.cp_firsth');
    if (firsthDiv.length > 0) {
      const h2Element = firsthDiv.find('h2 .mw-headline');
      if (h2Element.length > 0) {
        const pageFullName = h2Element.text().trim();
        if (pageFullName && pageFullName.length > fullName.length) {
          fullName = pageFullName;
        }
      }
    }

    console.log(`👤 Nome extraído: "${name}", Nome completo: "${fullName}"`);

    return { name, fullName };
  } catch (error) {
    console.error('❌ Erro ao extrair nome:', error);
    return { name: '', fullName: '' };
  }
}

// Função para determinar época baseada no ano de nascimento (baseada no imslp-scraper.ts)
function determineEpochByBirthYear(birthDate: string | null): string {
  if (!birthDate) {
    return 'Contemporâneo'; // Época padrão
  }

  // Extrair ano da string de data
  const yearMatch = birthDate.match(/(\d{4})/);
  if (!yearMatch) {
    return 'Contemporâneo';
  }

  const year = parseInt(yearMatch[1]);

  // Definir épocas baseadas no imslp-scraper.ts
  if (year >= 476 && year <= 1399) return 'Medieval';
  if (year >= 1400 && year <= 1599) return 'Renascentista';
  if (year >= 1600 && year <= 1749) return 'Barroco';
  if (year >= 1750 && year <= 1819) return 'Clássico';
  if (year >= 1820 && year <= 1910) return 'Romântico';
  if (year >= 1911 && year <= 1949) return 'Modernismo';
  if (year >= 1950) return 'Contemporâneo';

  // Para casos especiais
  if (year < 476) return 'Medieval';
  return 'Contemporâneo';
}

// Funções auxiliares existentes (mantidas iguais)
function extractFirstName(fullName: string): string {
  const parts = fullName.split(' ');
  return parts[parts.length - 1];
}

function extractWikipediaImage($: cheerio.CheerioAPI): string | null {
  const infoboxImage = $('.infobox img, .infobox-vcard img').first();
  if (infoboxImage.length > 0) {
    const src = infoboxImage.attr('src');
    if (src) {
      return src.startsWith('//') ? `https:${src}` : src;
    }
  }
  return null;
}

function calculateWikipediaCompleteness(
  bio: string | null,
  birthDate: string | null,
  deathDate: string | null,
  nationality: string | null,
  portraitUrl: string | null
): number {
  let score = 0;
  if (bio && bio.length > 50) score += 2;
  if (birthDate) score += 1;
  if (deathDate) score += 1;
  if (nationality) score += 1;
  if (portraitUrl) score += 1;

  return Math.round((score / 6) * 100);
}

// Função melhorada para extrair datas do IMSLP (baseada no imslp-scraper.ts)
function extractImprovedDatesIMSLP($: cheerio.CheerioAPI): {
  birthDate: string | null;
  deathDate: string | null;
} {
  try {
    const firsthDiv = $('.cp_firsth');
    let birthDate: string | null = null;
    let deathDate: string | null = null;

    if (firsthDiv.length > 0) {
      const fullText = firsthDiv.text();
      console.log(`🔍 Texto completo das datas: "${fullText}"`);

      // Padrões mais complexos para datas (baseado no imslp-scraper.ts)
      const patterns = [
        // Padrão: (31 January 1797 – 28 November 1828)
        /\(([^)]+)\s*[–—-]\s*([^)]+)\)/,
        // Padrão: (born 1797, died 1828)
        /\(.*?born.*?(\d{4}).*?died.*?(\d{4})\)/i,
        // Padrão: (1797-1828)
        /\((\d{4})\s*[–—-]\s*(\d{4})\)/,
        // Padrão com locais: (Berlin, 31 January 1797 – Vienna, 28 November 1828)
        /\(([^,]*,?\s*[^)]*?)\s*[–—-]\s*([^)]*)\)/,
      ];

      for (const pattern of patterns) {
        const match = fullText.match(pattern);
        if (match) {
          let birth = match[1]?.trim();
          let death = match[2]?.trim();

          if (birth && death) {
            // Remover locais se existirem
            birth = birth.replace(/^[^,]+,\s*/, '');
            death = death.replace(/^[^,]+,\s*/, '');

            birthDate = parseFlexibleDateIMSLP(birth);
            deathDate = parseFlexibleDateIMSLP(death);
            break;
          }
        }
      }

      // Se não encontrou com padrões complexos, tentar padrões simples
      if (!birthDate) {
        const simpleYearMatch = fullText.match(/\(.*?(\d{4})/);
        if (simpleYearMatch) {
          birthDate = `${simpleYearMatch[1]}-01-01`;
        }
      }
    }

    console.log(
      `📅 Datas extraídas - Nascimento: ${birthDate}, Morte: ${deathDate}`
    );

    return { birthDate, deathDate };
  } catch (error) {
    console.error('❌ Erro ao extrair datas:', error);
    return { birthDate: null, deathDate: null };
  }
}

// Função auxiliar para parsing flexível de datas (baseada no imslp-scraper.ts)
function parseFlexibleDateIMSLP(dateString: string | null): string | null {
  if (!dateString) return null;

  try {
    // Se tem apenas o ano, retornar como YYYY-01-01
    const yearOnlyMatch = dateString.match(/^(\d{4})$/);
    if (yearOnlyMatch) {
      return `${yearOnlyMatch[1]}-01-01`;
    }

    // Tentar parsear datas mais complexas
    const yearMatch = dateString.match(/(\d{4})/);
    if (yearMatch) {
      const year = yearMatch[1];

      // Buscar mês (em inglês, português ou números)
      const monthPatterns = {
        // Português
        janeiro: '01',
        jan: '01',
        fevereiro: '02',
        fev: '02',
        março: '03',
        mar: '03',
        abril: '04',
        abr: '04',
        maio: '05',
        mai: '05',
        junho: '06',
        jun: '06',
        julho: '07',
        jul: '07',
        agosto: '08',
        ago: '08',
        setembro: '09',
        set: '09',
        outubro: '10',
        out: '10',
        novembro: '11',
        nov: '11',
        dezembro: '12',
        dez: '12',
        // Inglês
        january: '01',
        february: '02',
        march: '03',
        april: '04',
        may: '05',
        june: '06',
        july: '07',
        august: '08',
        september: '09',
        october: '10',
        november: '11',
        december: '12',
      };

      let month = '01';
      let day = '01';

      // Buscar nome do mês
      for (const [monthName, monthNum] of Object.entries(monthPatterns)) {
        if (dateString.toLowerCase().includes(monthName)) {
          month = monthNum;
          break;
        }
      }

      // Buscar dia (1-31) - procurar número antes do mês
      const dayMatch = dateString.match(
        /(\d{1,2})\s+(?:de\s+)?(?:janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|january|february|march|april|may|june|july|august|september|october|november|december)/i
      );
      if (dayMatch) {
        const dayNum = parseInt(dayMatch[1]);
        if (dayNum >= 1 && dayNum <= 31) {
          day = dayNum.toString().padStart(2, '0');
        }
      }

      return `${year}-${month}-${day}`;
    }

    return null;
  } catch (error) {
    console.error(`❌ Erro ao converter data "${dateString}":`, error);
    return null;
  }
}

// Função melhorada para scraping do IMSLP (usando referências do imslp-scraper.ts)
async function scrapeIMSLP(url: string): Promise<ScrapedComposerData> {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Extrair ID IMSLP do URL
    const imslpId = url.split('/wiki/')[1] || '';

    // Extrair nome e fullName corretamente (baseado no padrão Category:Sobrenome,_Nome)
    const nameInfo = extractNameAndFullNameIMSLP(imslpId, $);

    // Extrair nome alternativo (contentSub)
    const otherName = extractOtherNameIMSLP($);

    // Extrair nomes alternativos
    const alternativeNamesInfo = extractAlternativeNamesIMSLP($);

    // Extrair datas melhoradas (com mês e dia corretos)
    const dateInfo = extractImprovedDatesIMSLP($);

    // Extrair imagem
    const portraitUrl = extractPortraitUrlIMSLP($);

    // Extrair informações detalhadas
    const diverseInfo = extractDiverseInfoIMSLP($);
    const externalLinks = extractExternalLinksIMSLP($);
    const nationality = extractNationalityIMSLP($); // Traduzida para português
    const instruments = extractInstrumentsIMSLP($);
    const imslpCategories = extractCategoriesIMSLP($);
    const wikipediaLink = extractWikipediaLinkIMSLP($);

    // Determinar papel/cargo
    const roleInfo = determineRoleIMSLP($);

    // Avaliar qualidade da página
    const qualityInfo = evaluatePageQualityIMSLP($);

    // Determinar época baseada no ano de nascimento
    const epochName = determineEpochByBirthYear(dateInfo.birthDate);

    return {
      name: nameInfo.name,
      fullName: nameInfo.fullName,
      otherName,
      alternativeNames: alternativeNamesInfo.alternativeNames,
      pseudonyms: alternativeNamesInfo.pseudonyms,
      birthDate: dateInfo.birthDate, // Formato ISO com mês e dia corretos
      deathDate: dateInfo.deathDate, // Formato ISO com mês e dia corretos
      portraitUrl,
      bio: null,
      diverseInfo,
      externalLinks,
      imslpId,
      wikipediaLink,
      nationality, // Traduzida para português
      instruments,
      imslpCategories,
      primaryRole: roleInfo.primaryRole,
      roles: roleInfo.roles,
      pageQuality: qualityInfo.pageQuality,
      dataCompleteness: qualityInfo.dataCompleteness,
      hasValidImage: qualityInfo.hasValidImage,
      epochName, // Determinada automaticamente pelo ano de nascimento
    };
  } catch (error) {
    console.error('Erro ao fazer scraping do IMSLP:', error);
    throw error;
  }
}

// Função para extrair nome alternativo do IMSLP (contentSub)
function extractOtherNameIMSLP($: cheerio.CheerioAPI): string | null {
  try {
    const contentSubDiv = $('#contentSub');
    if (contentSubDiv.length === 0) return null;

    const otherName = contentSubDiv.text().trim();
    if (otherName && otherName.length > 0) {
      console.log(`👤 Nome alternativo encontrado: "${otherName}"`);
      return otherName;
    }
    return null;
  } catch (error) {
    console.error('❌ Erro ao extrair nome alternativo:', error);
    return null;
  }
}

// Função para extrair nomes alternativos do IMSLP
function extractAlternativeNamesIMSLP($: cheerio.CheerioAPI): {
  alternativeNames: string | null;
  pseudonyms: string | null;
} {
  try {
    const mainLinksDiv = $('.cp_mainlinks');
    let alternativeNames: string | null = null;
    let pseudonyms: string | null = null;

    if (mainLinksDiv.length === 0) {
      return { alternativeNames, pseudonyms };
    }

    mainLinksDiv.find('span[style="font-weight:normal"]').each((_, element) => {
      const spanText = $(element).text().trim();

      const alternativeNamesLabels = [
        'Nomes alternativos/Transliterações:',
        'Alternative Names/Transliterations:',
      ];

      const pseudonymsLabels = ['Pseudônimos:', 'Pseudonyms:'];

      if (alternativeNamesLabels.some((label) => spanText.includes(label))) {
        alternativeNames = spanText;
        alternativeNamesLabels.forEach((label) => {
          alternativeNames = (alternativeNames || '').replace(label, '');
        });
        alternativeNames = alternativeNames.trim();
        console.log(`📝 Nomes alternativos encontrados: "${alternativeNames}"`);
      }

      if (pseudonymsLabels.some((label) => spanText.includes(label))) {
        pseudonyms = spanText;
        pseudonymsLabels.forEach((label) => {
          pseudonyms = (pseudonyms || '').replace(label, '');
        });
        pseudonyms = pseudonyms.trim();
        console.log(`🎭 Pseudônimos encontrados: "${pseudonyms}"`);
      }
    });

    return { alternativeNames, pseudonyms };
  } catch (error) {
    console.error('❌ Erro ao extrair nomes alternativos:', error);
    return { alternativeNames: null, pseudonyms: null };
  }
}

// Função para extrair URL do retrato do IMSLP
function extractPortraitUrlIMSLP($: cheerio.CheerioAPI): string | null {
  const imageElement = $('.cp_img img');
  if (imageElement.length > 0) {
    const imgSrc = imageElement.attr('src');
    if (imgSrc && !imgSrc.includes('Nocomposerphotoavailable')) {
      return imgSrc.startsWith('/') ? `https://imslp.org${imgSrc}` : imgSrc;
    }
  }
  return null;
}

// Função para extrair informações diversas do IMSLP
function extractDiverseInfoIMSLP($: cheerio.CheerioAPI): string | null {
  try {
    const diverseHeader = $('h2')
      .find('span[id*="Informa"], span[id*="diversa"]')
      .first();

    if (diverseHeader.length === 0) return null;

    const diverseSection = diverseHeader.closest('h2').next('.cp_links');
    if (diverseSection.length === 0) return null;

    const diverseText = diverseSection
      .find('li')
      .map((_, el) => $(el).text().trim())
      .get()
      .join(' ');

    return diverseText && diverseText.length > 10 ? diverseText : null;
  } catch (error) {
    console.error('❌ Erro ao extrair informação diversa:', error);
    return null;
  }
}

// Função para extrair links externos do IMSLP
function extractExternalLinksIMSLP($: cheerio.CheerioAPI): string | null {
  try {
    const linksHeader = $('h2').find('span[id*="Links_externos"]').first();
    if (linksHeader.length === 0) return null;

    const linksSection = linksHeader.closest('h2').next('.cp_links');
    if (linksSection.length === 0) return null;

    const links: string[] = [];
    linksSection.find('li').each((_, el) => {
      const linkElement = $(el);
      const linkText = linkElement.text().trim();
      const linkUrl = linkElement.find('a').attr('href');

      if (linkText && linkUrl) {
        links.push(`${linkText} (${linkUrl})`);
      } else if (linkText) {
        links.push(linkText);
      }
    });

    const externalLinks = links.join('; ');
    return externalLinks && externalLinks.length > 5 ? externalLinks : null;
  } catch (error) {
    console.error('❌ Erro ao extrair links externos:', error);
    return null;
  }
}

// Função para extrair instrumentos do IMSLP
function extractInstrumentsIMSLP($: cheerio.CheerioAPI): string | null {
  try {
    const instruments: string[] = [];
    const commonInstruments = [
      'Piano',
      'Violino',
      'Viola',
      'Violoncelo',
      'Contrabaixo',
      'Flauta',
      'Oboé',
      'Clarinete',
      'Fagote',
      'Trompa',
      'Trompete',
      'Trombone',
      'Tuba',
      'Harpa',
      'Violão',
      'Órgão',
      'Cravo',
      'Voz',
      'Soprano',
      'Alto',
      'Tenor',
      'Baixo',
      'Coro',
      'Orquestra',
    ];

    const pageText = $('body').text().toLowerCase();

    for (const instrument of commonInstruments) {
      const instrumentLower = instrument.toLowerCase();
      if (
        pageText.includes(instrumentLower + ' works') ||
        pageText.includes('for ' + instrumentLower) ||
        pageText.includes(instrumentLower + ' compositions')
      ) {
        instruments.push(instrument);
      }
    }

    return instruments.length > 0
      ? [...new Set(instruments)].slice(0, 10).join(', ')
      : null;
  } catch (error) {
    console.error('❌ Erro ao extrair instrumentos:', error);
    return null;
  }
}

// Função para extrair link da Wikipedia do IMSLP
function extractWikipediaLinkIMSLP($: cheerio.CheerioAPI): string | null {
  try {
    const linksDiv = $('.cp_links');
    if (linksDiv.length === 0) return null;

    const wikipediaLinks = linksDiv.find('a').filter((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().toLowerCase();
      return !!(
        href &&
        (href.includes('wikipedia.org') ||
          href.includes('wiki/') ||
          text.includes('wikipedia'))
      );
    });

    if (wikipediaLinks.length === 0) return null;

    let wikipediaUrl = wikipediaLinks.first().attr('href');
    if (!wikipediaUrl) return null;

    if (wikipediaUrl.startsWith('http://')) {
      wikipediaUrl = wikipediaUrl.replace('http://', 'https://');
    }

    return wikipediaUrl;
  } catch (error) {
    console.error('❌ Erro ao extrair link da Wikipedia:', error);
    return null;
  }
}

// Função para determinar papel do IMSLP
function determineRoleIMSLP($: cheerio.CheerioAPI): {
  primaryRole: string | null;
  roles: string | null;
} {
  try {
    const mwPagesDiv = $('#mw-pages');
    if (mwPagesDiv.length === 0) {
      return { primaryRole: null, roles: null };
    }

    const validRolesMap: Record<string, string> = {
      'performances by': 'Cantor',
      'compositions by': 'Compositor',
      'works with text by': 'Libretista',
      'arrangements by': 'Arranjador',
      'works edited by': 'Editor',
      'books by': 'Escritor',
      'works translated by': 'Tradutor',
    };

    const foundRoles: string[] = [];

    mwPagesDiv.find('h2').each((_, element) => {
      const text = $(element).text().trim().toLowerCase();
      const matchingKey = Object.keys(validRolesMap).find((key) =>
        text.includes(key)
      );

      if (matchingKey) {
        const role = validRolesMap[matchingKey];
        foundRoles.push(role);
      }
    });

    const primaryRole = foundRoles.length > 0 ? foundRoles[0] : null;
    const additionalRoles = foundRoles.slice(1);

    return {
      primaryRole,
      roles: additionalRoles.length > 0 ? additionalRoles.join(', ') : null,
    };
  } catch (error) {
    console.error('❌ Erro ao extrair papel:', error);
    return { primaryRole: null, roles: null };
  }
}

// Função para avaliar qualidade da página do IMSLP
function evaluatePageQualityIMSLP($: cheerio.CheerioAPI): {
  pageQuality: string;
  dataCompleteness: number;
  hasValidImage: boolean;
} {
  try {
    let completenessScore = 0;
    let maxScore = 8;

    if ($('.cp_firsth h2').length > 0) completenessScore += 1;
    if (
      $('.cp_firsth').text().includes('(') &&
      $('.cp_firsth').text().includes(')')
    )
      completenessScore += 1;

    const hasValidImage =
      $('.cp_img img').length > 0 &&
      !$('.cp_img img').attr('src')?.includes('Nocomposerphotoavailable');
    if (hasValidImage) completenessScore += 1;

    if ($('.cp_links a').length > 0) completenessScore += 1;
    if ($('#mw-pages').length > 0) completenessScore += 1;
    if ($('.cp_firsth').text().length > 100) completenessScore += 1;
    if ($('a[href*="wikipedia"]').length > 0) completenessScore += 1;
    if ($('.cp_mainlinks').length > 0) completenessScore += 1;

    const completenessPercentage = (completenessScore / maxScore) * 100;

    let pageQuality = 'low';
    if (completenessPercentage >= 80) pageQuality = 'high';
    else if (completenessPercentage >= 60) pageQuality = 'medium';

    return {
      pageQuality,
      dataCompleteness: Math.round(completenessPercentage),
      hasValidImage,
    };
  } catch (error) {
    console.error('❌ Erro ao avaliar qualidade da página:', error);
    return {
      pageQuality: 'low',
      dataCompleteness: 0,
      hasValidImage: false,
    };
  }
}

function extractFullName($: cheerio.CheerioAPI): string {
  const firsthDiv = $('.cp_firsth');
  if (firsthDiv.length > 0) {
    const h2Element = firsthDiv.find('h2 .mw-headline');
    if (h2Element.length > 0) {
      return h2Element.text().trim();
    }
  }
  return '';
}

function extractOtherName($: cheerio.CheerioAPI): string | null {
  const contentSubDiv = $('#contentSub');
  if (contentSubDiv.length === 0) return null;

  const otherName = contentSubDiv.text().trim();
  if (otherName && otherName.length > 0) {
    return otherName;
  }
  return null;
}

function extractAlternativeNames($: cheerio.CheerioAPI): {
  alternativeNames: string | null;
  pseudonyms: string | null;
} {
  const mainLinksDiv = $('.cp_mainlinks');
  let alternativeNames: string | null = null;
  let pseudonyms: string | null = null;

  if (mainLinksDiv.length === 0) {
    return { alternativeNames, pseudonyms };
  }

  mainLinksDiv.find('span[style="font-weight:normal"]').each((_, element) => {
    const spanText = $(element).text().trim();

    const alternativeNamesLabels = [
      'Nomes alternativos/Transliterações:',
      'Alternative Names/Transliterations:',
    ];

    const pseudonymsLabels = ['Pseudônimos:', 'Pseudonyms:'];

    if (alternativeNamesLabels.some((label) => spanText.includes(label))) {
      alternativeNames = spanText;
      alternativeNamesLabels.forEach((label) => {
        alternativeNames = (alternativeNames || '').replace(label, '');
      });
      alternativeNames = alternativeNames.trim();
    }

    if (pseudonymsLabels.some((label) => spanText.includes(label))) {
      pseudonyms = spanText;
      pseudonymsLabels.forEach((label) => {
        pseudonyms = (pseudonyms || '').replace(label, '');
      });
      pseudonyms = pseudonyms.trim();
    }
  });

  return { alternativeNames, pseudonyms };
}

function extractPortraitUrl($: cheerio.CheerioAPI): string | null {
  const imageElement = $('.cp_img img');
  if (imageElement.length > 0) {
    const imgSrc = imageElement.attr('src');
    if (imgSrc && !imgSrc.includes('Nocomposerphotoavailable')) {
      return imgSrc.startsWith('/') ? `https://imslp.org${imgSrc}` : imgSrc;
    }
  }
  return null;
}

function extractDiverseInfo($: cheerio.CheerioAPI): string | null {
  const diverseHeader = $('h2')
    .find('span[id*="Informa"], span[id*="diversa"]')
    .first();
  if (diverseHeader.length === 0) return null;

  const diverseSection = diverseHeader.closest('h2').next('.cp_links');
  if (diverseSection.length === 0) return null;

  const diverseText = diverseSection
    .find('li')
    .map((_, el) => $(el).text().trim())
    .get()
    .join(' ');
  return diverseText && diverseText.length > 10 ? diverseText : null;
}

function extractExternalLinks($: cheerio.CheerioAPI): string | null {
  const linksHeader = $('h2').find('span[id*="Links_externos"]').first();
  if (linksHeader.length === 0) return null;

  const linksSection = linksHeader.closest('h2').next('.cp_links');
  if (linksSection.length === 0) return null;

  const links: string[] = [];
  linksSection.find('li').each((_, el) => {
    const linkElement = $(el);
    const linkText = linkElement.text().trim();
    const linkUrl = linkElement.find('a').attr('href');

    if (linkText && linkUrl) {
      links.push(`${linkText} (${linkUrl})`);
    } else if (linkText) {
      links.push(linkText);
    }
  });

  const externalLinks = links.join('; ');
  return externalLinks && externalLinks.length > 5 ? externalLinks : null;
}

function extractNationality($: cheerio.CheerioAPI): string | null {
  const firsthDiv = $('.cp_firsth');
  if (firsthDiv.length === 0) return null;

  const text = firsthDiv.text().toLowerCase();

  const nationalityPatterns: Record<string, string[]> = {
    Alemão: ['german', 'deutschland', 'germany'],
    Austríaco: ['austrian', 'österreich', 'austria'],
    Francês: ['french', 'france', 'français'],
    Italiano: ['italian', 'italy', 'italia'],
    Russo: ['russian', 'russia', 'русский'],
    Inglês: ['english', 'england', 'british'],
    Americano: ['american', 'usa', 'united states'],
    Polonês: ['polish', 'poland', 'polska'],
    Espanhol: ['spanish', 'spain', 'españa'],
    Tcheco: ['czech', 'bohemian', 'czechoslovak'],
    Húngaro: ['hungarian', 'hungary', 'magyar'],
    Holandês: ['dutch', 'netherlands', 'nederland'],
    Belga: ['belgian', 'belgium', 'belgique'],
    Suíço: ['swiss', 'switzerland', 'schweiz'],
    Brasileiro: ['brazilian', 'brazil', 'brasil'],
  };

  for (const [nationality, patterns] of Object.entries(nationalityPatterns)) {
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        return nationality;
      }
    }
  }

  return null;
}

function extractInstruments($: cheerio.CheerioAPI): string | null {
  const instruments: string[] = [];
  const commonInstruments = [
    'Piano',
    'Violino',
    'Viola',
    'Violoncelo',
    'Contrabaixo',
    'Flauta',
    'Oboé',
    'Clarinete',
    'Fagote',
    'Trompa',
    'Trompete',
    'Trombone',
    'Tuba',
    'Harpa',
    'Violão',
    'Órgão',
    'Cravo',
    'Voz',
    'Soprano',
    'Alto',
    'Tenor',
    'Baixo',
    'Coro',
    'Orquestra',
  ];

  const pageText = $('body').text().toLowerCase();

  for (const instrument of commonInstruments) {
    const instrumentLower = instrument.toLowerCase();
    if (
      pageText.includes(instrumentLower + ' works') ||
      pageText.includes('for ' + instrumentLower) ||
      pageText.includes(instrumentLower + ' compositions')
    ) {
      instruments.push(instrument);
    }
  }

  return instruments.length > 0
    ? [...new Set(instruments)].slice(0, 10).join(', ')
    : null;
}

function extractCategories($: cheerio.CheerioAPI): string | null {
  const categories: string[] = [];
  const categoryLinks = $('a[href*="Category:"]');

  categoryLinks.each((_, element) => {
    const categoryText = $(element).text().trim();
    if (
      categoryText &&
      !categoryText.includes('IMSLP') &&
      categoryText.length > 2
    ) {
      categories.push(categoryText);
    }
  });

  return categories.length > 0 ? [...new Set(categories)].join(', ') : null;
}

function extractWikipediaLink($: cheerio.CheerioAPI): string | null {
  const linksDiv = $('.cp_links');
  if (linksDiv.length === 0) return null;

  const wikipediaLinks = linksDiv.find('a').filter((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().toLowerCase();
    return !!(
      href &&
      (href.includes('wikipedia.org') ||
        href.includes('wiki/') ||
        text.includes('wikipedia'))
    );
  });

  if (wikipediaLinks.length === 0) return null;

  let wikipediaUrl = wikipediaLinks.first().attr('href');
  if (!wikipediaUrl) return null;

  if (wikipediaUrl.startsWith('http://')) {
    wikipediaUrl = wikipediaUrl.replace('http://', 'https://');
  }

  return wikipediaUrl;
}

function determineRole($: cheerio.CheerioAPI): {
  primaryRole: string | null;
  roles: string | null;
} {
  const mwPagesDiv = $('#mw-pages');
  if (mwPagesDiv.length === 0) {
    return { primaryRole: null, roles: null };
  }

  const validRolesMap: Record<string, string> = {
    'performances by': 'Cantor',
    'compositions by': 'Compositor',
    'works with text by': 'Libretista',
    'arrangements by': 'Arranjador',
    'works edited by': 'Editor',
    'books by': 'Escritor',
    'works translated by': 'Tradutor',
  };

  const foundRoles: string[] = [];

  mwPagesDiv.find('h2').each((_, element) => {
    const text = $(element).text().trim().toLowerCase();
    const matchingKey = Object.keys(validRolesMap).find((key) =>
      text.includes(key)
    );

    if (matchingKey) {
      const role = validRolesMap[matchingKey];
      foundRoles.push(role);
    }
  });

  const primaryRole = foundRoles.length > 0 ? foundRoles[0] : null;
  const additionalRoles = foundRoles.slice(1);

  return {
    primaryRole,
    roles: additionalRoles.length > 0 ? additionalRoles.join(', ') : null,
  };
}

function evaluatePageQuality($: cheerio.CheerioAPI): {
  pageQuality: string;
  dataCompleteness: number;
  hasValidImage: boolean;
} {
  let completenessScore = 0;
  let maxScore = 8;

  if ($('.cp_firsth h2').length > 0) completenessScore += 1;
  if (
    $('.cp_firsth').text().includes('(') &&
    $('.cp_firsth').text().includes(')')
  )
    completenessScore += 1;

  const hasValidImage =
    $('.cp_img img').length > 0 &&
    !$('.cp_img img').attr('src')?.includes('Nocomposerphotoavailable');
  if (hasValidImage) completenessScore += 1;

  if ($('.cp_links a').length > 0) completenessScore += 1;
  if ($('#mw-pages').length > 0) completenessScore += 1;
  if ($('.cp_firsth').text().length > 100) completenessScore += 1;
  if ($('a[href*="wikipedia"]').length > 0) completenessScore += 1;
  if ($('.cp_mainlinks').length > 0) completenessScore += 1;

  const completenessPercentage = (completenessScore / maxScore) * 100;

  let pageQuality = 'low';
  if (completenessPercentage >= 80) pageQuality = 'high';
  else if (completenessPercentage >= 60) pageQuality = 'medium';

  return {
    pageQuality,
    dataCompleteness: Math.round(completenessPercentage),
    hasValidImage,
  };
}
