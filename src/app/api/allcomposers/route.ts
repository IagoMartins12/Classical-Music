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

interface ComposerWithImage extends Composer {
  imageUrl: string;
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

    // Passo 2: Verificar imagem para cada compositor (limitando para poucos por vez)
    const composersWithImages: ComposerWithImage[] = [];

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
            // Extrair o nome do compositor do ID
            const composerName = composer.id
              ? composer.id.replace('Category:', '').replace(',', ', ')
              : 'Nome não disponível';

            composersWithImages.push({
              ...composer,
              name: composerName,
              imageUrl: imageUrl.startsWith('/')
                ? `https://imslp.org${imageUrl}`
                : imageUrl,
            } as ComposerWithImage);

            console.log(`✓ Compositor adicionado: ${composerName}`);
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

    // Passo 3: Retornar apenas os compositores que têm imagem
    console.log(
      `Retornando ${composersWithImages.length} compositores com imagem`
    );
    return NextResponse.json(composersWithImages);
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
