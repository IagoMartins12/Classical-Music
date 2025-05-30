// pages/api/composers.ts

import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

interface Composer {
  id: string;
  name: string;
  permlink: string;
  type: string;
  parent: string;
  intvals: any[];
}

interface ComposerWithDetails {
  imslpId: string;
  name: string;
  permLinkImslp: string;
  imageUrl: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  if (!start) return NextResponse.json([]);

  try {
    // Passo 1: Buscar a lista de compositores
    const apiUrl = `https://imslp.org/imslpscripts/API.ISCR.php?account=worklist/disclaimer=accepted/sort=id/type=1/start=${start}/retformat=json`;

    console.log('Fazendo requisição para:', apiUrl);
    const response = await axios.get(apiUrl, {
      timeout: 30000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response data type:', typeof response.data);
    console.log(
      'Response data sample:',
      JSON.stringify(response.data).substring(0, 500)
    );

    // Verificar se response.data é um array ou objeto
    let composers: Composer[] = [];
    if (Array.isArray(response.data)) {
      composers = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // A API retorna um objeto com chaves numéricas, vamos converter para array
      const keys = Object.keys(response.data);
      console.log('Response data keys length:', keys.length);

      // Converter objeto para array usando os valores
      composers = Object.values(response.data) as Composer[];
      console.log('Convertido para array, length:', composers.length);
    }

    console.log('Número de compositores encontrados:', composers.length);

    if (composers.length === 0) {
      console.log('Nenhum compositor encontrado na resposta');
      return NextResponse.json([]);
    }

    // Passo 2: Verificar imagem e extrair dados para cada compositor
    const composersWithDetails: ComposerWithDetails[] = [];

    // Filtrar compositores que parecem ser nomes reais (contém vírgula)
    const validComposers = composers.filter(
      (composer) =>
        composer.id &&
        composer.id.includes(',') &&
        !composer.id.includes('"') && // Remover nomes com aspas
        composer.id.length > 20 && // Nome mínimo razoável
        composer.permlink
    );

    console.log(`Compositores válidos encontrados: ${validComposers.length}`);

    // Processar apenas os primeiros 10 compositores válidos para teste
    const composersToProcess = validComposers.slice(0, 10);
    console.log('Processando compositores:', composersToProcess.length);

    // Processar sequencialmente para evitar sobrecarga
    for (const composer of composersToProcess) {
      try {
        console.log(`Processando compositor: ${composer.id}`);

        const pageResponse = await axios.get(composer.permlink, {
          timeout: 15000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        const $ = cheerio.load(pageResponse.data);

        // Verificar se há uma imagem na div com classe 'cp_img'
        const imageElement = $('.cp_img img');

        if (imageElement.length > 0) {
          const imageUrl = imageElement.attr('src');
          console.log(`Imagem encontrada para ${composer.id}: ${imageUrl}`);

          // Filtrar imagem padrão "sem foto disponível"
          if (imageUrl && !imageUrl.includes('Nocomposerphotoavailable')) {
            // Extrair dados da div cp_firsth
            const firsthDiv = $('.cp_firsth');

            let fullName = '';
            let birthDate: string | null = null;
            let deathDate: string | null = null;

            if (firsthDiv.length > 0) {
              // Extrair o nome completo do h2
              const h2Element = firsthDiv.find('h2 .mw-headline');
              if (h2Element.length > 0) {
                fullName = h2Element.text().trim();
              }

              // Extrair as datas do texto após o h2
              const dateText = firsthDiv.text();
              console.log(
                `Texto completo da div para ${composer.id}:`,
                dateText
              );

              // Regex para capturar datas em diferentes formatos
              // Exemplos: (10 de Setembro de 1866 — Abril 1930)
              // (1866-1930), (nascido em 1866), etc.
              const dateRegex = /\(([^)]+)\)/;
              const dateMatch = dateText.match(dateRegex);

              if (dateMatch) {
                const dateString = dateMatch[1];
                console.log(`String de datas encontrada: ${dateString}`);

                // Tentar extrair data de nascimento e morte
                if (dateString.includes('—') || dateString.includes('-')) {
                  // Formato: data nascimento — data morte
                  const parts = dateString.split(/[—-]/);
                  if (parts.length >= 2) {
                    birthDate = parts[0].trim();
                    deathDate = parts[1].trim();
                  }
                } else if (dateString.includes('nascido')) {
                  // Formato: nascido em XXXX
                  const birthMatch = dateString.match(/nascido.*?(\d{4})/i);
                  if (birthMatch) {
                    birthDate = birthMatch[1];
                  }
                } else {
                  // Tentar extrair pelo menos o ano de nascimento
                  const yearMatch = dateString.match(/(\d{4})/);
                  if (yearMatch) {
                    birthDate = yearMatch[1];
                  }
                }
              }
            }

            // Se não conseguiu extrair o nome completo, usar o nome do ID como fallback
            if (!fullName) {
              fullName = composer.id
                ? composer.id.replace('Category:', '').replace(',', ', ')
                : 'Nome não disponível';
            }

            // Extrair apenas o primeiro nome (último nome no ID)
            let firstName = '';
            if (composer.id) {
              // "Category:Aakjær, Jeppe" -> extrair "Jeppe"
              const idWithoutCategory = composer.id.replace('Category:', '');
              const parts = idWithoutCategory.split(',');
              if (parts.length >= 2) {
                firstName = parts[1].trim(); // Pega a parte após a vírgula
              } else {
                firstName = parts[0].trim(); // Fallback se não houver vírgula
              }
            }

            composersWithDetails.push({
              imslpId: composer.id,
              name: firstName,
              permLinkImslp: composer.permlink,
              fullName: fullName,
              birthDate: birthDate,
              deathDate: deathDate,
              imageUrl: imageUrl.startsWith('/')
                ? `https://imslp.org${imageUrl}`
                : imageUrl,
            } as ComposerWithDetails);

            console.log(`✓ Compositor adicionado: ${fullName}`);
            console.log(`  Nome: ${firstName}`);
            console.log(`  Nascimento: ${birthDate || 'N/A'}`);
            console.log(`  Morte: ${deathDate || 'N/A'}`);
          } else {
            console.log(`✗ Imagem padrão ignorada para ${composer.id}`);
          }
        } else {
          console.log(`✗ Nenhuma imagem encontrada para ${composer.id}`);
        }

        // Pequeno delay entre requisições para não sobrecarregar o servidor
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `Erro ao processar compositor ${composer.id}:`,
          error instanceof Error ? error.message : 'Erro desconhecido'
        );
        continue;
      }
    }

    // Passo 3: Retornar apenas os compositores que têm imagem e dados
    console.log(
      `Retornando ${composersWithDetails.length} compositores com dados completos`
    );
    return NextResponse.json(composersWithDetails);
  } catch (error) {
    console.error('Erro na API de compositores:', error);

    // Log mais detalhado do erro
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
