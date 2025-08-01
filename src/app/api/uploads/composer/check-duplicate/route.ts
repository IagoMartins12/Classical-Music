// app/api/uploads/composer/check-duplicate/route.ts - ATUALIZADO COM VERIFICAÇÃO DE FULLNAME
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { url, source, excludeId, fullName } = body;

    console.log('🔍 Verificação de duplicata:', { url, source, fullName });

    if (!url || !source) {
      return NextResponse.json(
        { error: 'URL e fonte são obrigatórios' },
        { status: 400 }
      );
    }

    const whereConditions: any[] = [];

    // 1. Verificação por URL baseada na fonte
    if (source === 'imslp') {
      const imslpId = extractImslpId(url);
      console.log('📊 IMSLP ID extraído:', imslpId);

      whereConditions.push(
        { imslpId: url },
        { permLinkImslp: url },
        { imslpId: { contains: url.split('/').pop() } }
      );

      if (imslpId) {
        whereConditions.push(
          { imslpId: imslpId },
          { permLinkImslp: { contains: imslpId } }
        );
      }
    } else if (source === 'wikipedia') {
      whereConditions.push({ wikipediaLink: url });
    }

    // 2. NOVA VERIFICAÇÃO POR FULLNAME - Busca mais inteligente
    if (fullName && fullName.trim()) {
      const cleanFullName = cleanNameForComparison(fullName.trim());
      console.log('👤 FullName limpo para comparação:', cleanFullName);

      // Adicionar várias formas de verificação de nome
      whereConditions.push(
        // Nome completo exato
        { fullName: fullName.trim() },
        { fullName: cleanFullName },

        // Nome completo case-insensitive
        {
          fullName: {
            mode: 'insensitive' as any,
            equals: fullName.trim(),
          },
        },
        {
          fullName: {
            mode: 'insensitive' as any,
            equals: cleanFullName,
          },
        }
      );

      // Verificar variações do nome (com e sem middle names)
      const nameVariations = generateNameVariations(cleanFullName);
      nameVariations.forEach((variation) => {
        whereConditions.push(
          { fullName: variation },
          {
            fullName: {
              mode: 'insensitive' as any,
              equals: variation,
            },
          }
        );
      });
    }

    // Excluir o compositor que está sendo editado
    const finalWhereClause: any = {
      OR: whereConditions,
    };

    if (excludeId) {
      finalWhereClause.id = { not: excludeId };
    }

    console.log(
      '🔍 Condições de busca:',
      JSON.stringify(finalWhereClause, null, 2)
    );

    const existingComposer = await prisma.composer.findFirst({
      where: finalWhereClause,
      select: {
        id: true,
        name: true,
        fullName: true,
        otherName: true,
        alternativeNames: true,
        portraitUrl: true,
        permLinkImslp: true,
        imslpId: true,
        wikipediaLink: true,
        epochName: true,
        nationality: true,
        birthDate: true,
        deathDate: true,
        epoch: {
          select: {
            name: true,
          },
        },
      },
    });

    if (existingComposer) {
      // Determinar qual foi o motivo da duplicata
      let duplicateReason = '';
      let matchDetails = '';

      // Verificar URL matches
      if (
        source === 'imslp' &&
        (existingComposer.imslpId === url ||
          existingComposer.permLinkImslp === url ||
          existingComposer.imslpId?.includes(url.split('/').pop() || ''))
      ) {
        duplicateReason = 'link do IMSLP';
        matchDetails = existingComposer.imslpId || '';
      } else if (
        source === 'wikipedia' &&
        existingComposer.wikipediaLink === url
      ) {
        duplicateReason = 'link da Wikipedia';
        matchDetails = existingComposer.wikipediaLink || '';
      }
      // Verificar nome matches
      else if (
        fullName &&
        (isSimilarName(existingComposer.fullName, fullName) ||
          isSimilarName(existingComposer.otherName, fullName) ||
          existingComposer.alternativeNames
            ?.toLowerCase()
            .includes(fullName.toLowerCase()))
      ) {
        duplicateReason = 'nome';
        matchDetails = existingComposer.fullName;
      }

      console.log('❌ Duplicata encontrada:', {
        reason: duplicateReason,
        composer: existingComposer.fullName,
        details: matchDetails,
      });

      return NextResponse.json({
        found: true,
        composer: existingComposer,
        reason: duplicateReason,
        matchDetails: matchDetails,
      });
    }

    console.log('✅ Nenhuma duplicata encontrada');

    return NextResponse.json({
      found: false,
    });
  } catch (error) {
    console.error('❌ Erro ao verificar duplicata:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para extrair ID do IMSLP da URL
function extractImslpId(url: string): string | null {
  try {
    // Extrair de URLs como: https://imslp.org/wiki/Category:Mozart,_Wolfgang_Amadeus
    const match = url.match(/\/wiki\/(.+)$/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    return null;
  } catch (error) {
    console.log('Erro ao extrair imslp id', error);
    return null;
  }
}

// Função para limpar nome para comparação
function cleanNameForComparison(name: string): string {
  return name
    .replace(/[(),]/g, '') // Remove parênteses e vírgulas
    .replace(/_/g, ' ') // Substitui underscores por espaços
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim();
}

// Função para verificar se dois nomes são similares
function isSimilarName(name1: string | null, name2: string | null): boolean {
  if (!name1 || !name2) return false;

  const clean1 = cleanNameForComparison(name1.toLowerCase());
  const clean2 = cleanNameForComparison(name2.toLowerCase());

  // Verificação exata
  if (clean1 === clean2) return true;

  // Verificação de palavras (para casos como "Wolfgang Amadeus Mozart" vs "Mozart, Wolfgang Amadeus")
  const words1 = clean1
    .split(' ')
    .filter((w) => w.length > 2)
    .sort();
  const words2 = clean2
    .split(' ')
    .filter((w) => w.length > 2)
    .sort();

  // Se têm 80% ou mais das palavras em comum
  const intersection = words1.filter((w) => words2.includes(w));
  const minWords = Math.min(words1.length, words2.length);

  return minWords > 0 && intersection.length / minWords >= 0.8;
}

// Função para gerar variações do nome
function generateNameVariations(fullName: string): string[] {
  const variations: string[] = [];
  const parts = fullName.split(' ').filter((part) => part.length > 0);

  if (parts.length < 2) return variations;

  // Variação 1: Sobrenome, Nome (Mozart, Wolfgang Amadeus)
  const lastName = parts[parts.length - 1];
  const firstNames = parts.slice(0, -1).join(' ');
  variations.push(`${lastName}, ${firstNames}`);

  // Variação 2: Apenas primeiro e último nome (Wolfgang Mozart)
  if (parts.length > 2) {
    variations.push(`${parts[0]} ${lastName}`);
  }

  // Variação 3: Com iniciais (W. A. Mozart)
  if (parts.length > 2) {
    const initials = parts
      .slice(0, -1)
      .map((name) => name.charAt(0) + '.')
      .join(' ');
    variations.push(`${initials} ${lastName}`);
  }

  // Variação 4: Sem vírgulas e caracteres especiais
  variations.push(fullName.replace(/[,]/g, ''));

  return [...new Set(variations)]; // Remove duplicatas
}
