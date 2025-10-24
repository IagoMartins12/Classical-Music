// app/api/blog/tts/google/route.ts - COM SUPORTE A TEXTOS LONGOS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import prisma from '@/app/libs/prismadb';
import { uploadTTSAudio, deleteTTSAudio } from '@/app/libs/cloudinary';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';

export const maxDuration = 300; // 5 minutos

// ✅ DIVIDIR TEXTO EM CHUNKS INTELIGENTES (por sentença)
function splitTextIntoChunks(
  text: string,
  maxChunkSize: number = 4000
): string[] {
  // Dividir por sentenças (mantém pontuação)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    // Se a sentença sozinha é maior que o limite
    if (trimmedSentence.length > maxChunkSize) {
      // Adicionar chunk atual (se existir)
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      // Dividir sentença grande em partes menores
      const words = trimmedSentence.split(' ');
      let subChunk = '';

      for (const word of words) {
        if ((subChunk + ' ' + word).length <= maxChunkSize) {
          subChunk += (subChunk ? ' ' : '') + word;
        } else {
          if (subChunk) chunks.push(subChunk.trim());
          subChunk = word;
        }
      }

      if (subChunk) chunks.push(subChunk.trim());
      continue;
    }

    // Verificar se adicionar a sentença excede o limite
    if ((currentChunk + ' ' + trimmedSentence).length > maxChunkSize) {
      // Salvar chunk atual e começar novo
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = trimmedSentence;
    } else {
      // Adicionar sentença ao chunk atual
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    }
  }

  // Adicionar último chunk
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// ✅ GERAR ÁUDIO PARA UM CHUNK
async function generateAudioChunk(
  client: any,
  text: string,
  voiceName: string,
  speakingRate: number
): Promise<Buffer> {
  const request = {
    input: { text },
    voice: {
      languageCode: 'pt-BR',
      name: voiceName,
      ssmlGender: 'MALE' as const,
    },
    audioConfig: {
      audioEncoding: 'MP3' as const,
      speakingRate: speakingRate,
      pitch: 0,
      volumeGainDb: 0,
      sampleRateHertz: 24000,
    },
  };

  const [response] = await client.synthesizeSpeech(request);

  if (!response.audioContent) {
    throw new Error('Google TTS não retornou conteúdo de áudio');
  }

  return Buffer.from(response.audioContent);
}

// ✅ CONCATENAR ÁUDIOS MP3
async function concatenateAudioFiles(audioBuffers: Buffer[]): Promise<Buffer> {
  const tempDir = tmpdir();
  const tempFiles: string[] = [];
  const outputFile = path.join(tempDir, `concatenated_${Date.now()}.mp3`);

  try {
    // Salvar cada buffer como arquivo temporário
    for (let i = 0; i < audioBuffers.length; i++) {
      const tempFile = path.join(tempDir, `chunk_${i}_${Date.now()}.mp3`);
      await fs.writeFile(tempFile, audioBuffers[i]);
      tempFiles.push(tempFile);
    }

    // Concatenar usando ffmpeg
    await new Promise<void>((resolve, reject) => {
      let command = ffmpeg();

      // Adicionar todos os inputs
      tempFiles.forEach((file) => {
        command = command.input(file);
      });

      // Concatenar
      command
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .mergeToFile(outputFile, tempDir);
    });

    // Ler arquivo concatenado
    const finalBuffer = await fs.readFile(outputFile);

    // Limpar arquivos temporários
    await Promise.all([
      ...tempFiles.map((file) => fs.unlink(file).catch(() => {})),
      fs.unlink(outputFile).catch(() => {}),
    ]);

    return finalBuffer;
  } catch (error) {
    // Limpar em caso de erro
    await Promise.all([
      ...tempFiles.map((file) => fs.unlink(file).catch(() => {})),
      fs.unlink(outputFile).catch(() => {}),
    ]);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ VALIDAR AUTENTICAÇÃO
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // ✅ OBTER DADOS
    const { text, articleId, voiceName, speakingRate, regenerate } =
      await request.json();

    if (!text || !articleId) {
      return NextResponse.json(
        { success: false, error: 'Texto e articleId são obrigatórios' },
        { status: 400 }
      );
    }

    // ✅ VERIFICAR CACHE
    if (!regenerate) {
      const article = await prisma.blogArticle.findUnique({
        where: { id: articleId },
        select: { ttsAudioUrl: true },
      });

      if (article?.ttsAudioUrl) {
        console.log('✅ Áudio já existe (cache):', article.ttsAudioUrl);
        return NextResponse.json({
          success: true,
          audioUrl: article.ttsAudioUrl,
          cached: true,
          message: 'Áudio já existe',
        });
      }
    }

    const selectedVoice = voiceName || 'pt-BR-Neural2-A';
    const selectedRate = speakingRate || 1.0;

    console.log('🎤 Iniciando geração de áudio...');
    console.log(`📝 Tamanho do texto: ${text.length} caracteres`);

    // ✅ DIVIDIR EM CHUNKS SE NECESSÁRIO
    const chunks = splitTextIntoChunks(text, 4000);
    console.log(`📦 Texto dividido em ${chunks.length} chunk(s)`);

    // ✅ INICIALIZAR CLIENTE GOOGLE TTS
    const client = new TextToSpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    // ✅ GERAR ÁUDIO PARA CADA CHUNK
    console.log('🔊 Gerando áudio para cada chunk...');
    const audioBuffers: Buffer[] = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(
        `   Chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`
      );

      const audioBuffer = await generateAudioChunk(
        client,
        chunks[i],
        selectedVoice,
        selectedRate
      );

      audioBuffers.push(audioBuffer);
    }

    console.log('✅ Todos os chunks foram gerados');

    // ✅ CONCATENAR SE HOUVER MÚLTIPLOS CHUNKS
    let finalAudioBuffer: Buffer;

    if (audioBuffers.length === 1) {
      console.log('📦 Apenas 1 chunk, sem necessidade de concatenar');
      finalAudioBuffer = audioBuffers[0];
    } else {
      console.log('🔗 Concatenando chunks de áudio...');
      finalAudioBuffer = await concatenateAudioFiles(audioBuffers);
      console.log('✅ Áudio concatenado com sucesso');
    }

    const finalSizeKB = (finalAudioBuffer.length / 1024).toFixed(2);
    console.log(`📦 Tamanho final do áudio: ${finalSizeKB} KB`);

    // ✅ UPLOAD PARA CLOUDINARY
    console.log('☁️ Fazendo upload para Cloudinary...');

    const uploadResult = await uploadTTSAudio(finalAudioBuffer, articleId);

    if (!uploadResult.success || !uploadResult.secureUrl) {
      throw new Error(
        uploadResult.error || 'Erro ao fazer upload para Cloudinary'
      );
    }

    console.log('✅ Upload concluído:', uploadResult.secureUrl);

    // ✅ DELETAR ÁUDIO ANTIGO (se regenerando)
    if (regenerate) {
      const article = await prisma.blogArticle.findUnique({
        where: { id: articleId },
        select: { ttsAudioUrl: true },
      });

      if (article?.ttsAudioUrl) {
        const oldPublicId = article.ttsAudioUrl
          .split('/')
          .slice(-2)
          .join('/')
          .split('.')[0];
        await deleteTTSAudio(oldPublicId);
        console.log('🗑️ Áudio antigo deletado');
      }
    }

    // ✅ SALVAR NO BANCO
    await prisma.blogArticle.update({
      where: { id: articleId },
      data: { ttsAudioUrl: uploadResult.secureUrl },
    });

    console.log('✅ URL salva no banco de dados');

    // ✅ RETORNAR SUCESSO
    return NextResponse.json({
      success: true,
      audioUrl: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      cached: false,
      fileSize: uploadResult.fileSize,
      chunks: chunks.length,
      message: `Áudio gerado com sucesso (${chunks.length} chunk${chunks.length > 1 ? 's' : ''})`,
    });
  } catch (error: any) {
    console.error('❌ Erro ao gerar áudio:', error);

    let errorMessage = 'Erro ao gerar áudio';
    let statusCode = 500;

    if (error.message?.includes('credentials')) {
      errorMessage = 'Credenciais do Google Cloud inválidas';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'Limite de uso do Google TTS excedido';
      statusCode = 429;
    } else if (error.message?.includes('INVALID_ARGUMENT')) {
      errorMessage = 'Parâmetros inválidos enviados ao Google TTS';
      statusCode = 400;
    } else if (error.message?.includes('Cloudinary')) {
      errorMessage = 'Erro ao fazer upload para Cloudinary';
    } else if (error.message?.includes('ffmpeg')) {
      errorMessage =
        'Erro ao concatenar áudios. Verifique se ffmpeg está instalado.';
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: statusCode }
    );
  }
}

// ✅ DELETE ENDPOINT (mantido igual)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'articleId é obrigatório' },
        { status: 400 }
      );
    }

    const article = await prisma.blogArticle.findUnique({
      where: { id: articleId },
      select: { ttsAudioUrl: true },
    });

    if (article?.ttsAudioUrl) {
      const publicId = article.ttsAudioUrl
        .split('/')
        .slice(-2)
        .join('/')
        .split('.')[0];
      await deleteTTSAudio(publicId);
    }

    await prisma.blogArticle.update({
      where: { id: articleId },
      data: { ttsAudioUrl: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Áudio deletado com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao deletar áudio:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar áudio' },
      { status: 500 }
    );
  }
}
