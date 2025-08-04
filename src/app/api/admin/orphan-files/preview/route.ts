// app/api/admin/orphan-files/preview/route.ts
// Versão alternativa que tenta vários caminhos possíveis
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import fs from 'fs';
import path from 'path';

// Mapeamento de extensões para tipos MIME
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.aac': 'audio/aac',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function findFile(requestedPath: string): string | null {
  const basePath = process.cwd();

  // Lista de possibilidades de caminho para tentar
  const pathsToTry = [
    // Caminho direto como veio da requisição
    path.join(
      basePath,
      'public',
      requestedPath.startsWith('/') ? requestedPath.substring(1) : requestedPath
    ),

    // Remove /uploads se existir e adiciona public/uploads
    path.join(
      basePath,
      'public',
      'uploads',
      requestedPath.startsWith('/uploads/')
        ? requestedPath.substring('/uploads/'.length)
        : requestedPath
    ),

    // Adiciona public/ direto
    path.join(basePath, 'public', requestedPath),

    // Remove barra inicial e adiciona public/
    path.join(
      basePath,
      'public',
      requestedPath.startsWith('/') ? requestedPath.substring(1) : requestedPath
    ),

    // Caminho absoluto direto (sem public)
    path.join(
      basePath,
      requestedPath.startsWith('/') ? requestedPath.substring(1) : requestedPath
    ),
  ];

  console.log(`🔍 [FIND-FILE] Procurando arquivo: ${requestedPath}`);

  for (let i = 0; i < pathsToTry.length; i++) {
    const testPath = pathsToTry[i];
    console.log(`🔍 [FIND-FILE] Tentativa ${i + 1}: ${testPath}`);

    try {
      if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
        console.log(`✅ [FIND-FILE] Arquivo encontrado: ${testPath}`);
        return testPath;
      }
    } catch (error) {
      console.log(`❌ [FIND-FILE] Erro ao verificar: ${testPath} - ${error}`);
    }
  }

  console.log(
    `❌ [FIND-FILE] Arquivo não encontrado em nenhum caminho testado`
  );
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'Caminho do arquivo é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`📥 [ORPHAN-PREVIEW] Requisição recebida para: ${filePath}`);

    // Encontrar o arquivo usando múltiplas tentativas
    const absolutePath = findFile(filePath);

    if (!absolutePath) {
      return NextResponse.json(
        {
          error: 'Arquivo não encontrado',
          details: `Não foi possível encontrar o arquivo: ${filePath}`,
          searchedPath: filePath,
        },
        { status: 404 }
      );
    }

    // Verificação de segurança básica
    const normalizedPath = path.normalize(absolutePath);
    const projectRoot = path.normalize(process.cwd());

    if (!normalizedPath.startsWith(projectRoot)) {
      console.warn(
        `🚨 [ORPHAN-PREVIEW] Tentativa de acesso fora do projeto: ${filePath}`
      );
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar tamanho e tipo do arquivo
    const stats = fs.statSync(absolutePath);

    // Limite de 50MB para preview
    const MAX_PREVIEW_SIZE = 50 * 1024 * 1024;
    if (stats.size > MAX_PREVIEW_SIZE) {
      return NextResponse.json(
        {
          error: `Arquivo muito grande para preview (${(
            stats.size /
            1024 /
            1024
          ).toFixed(1)}MB > 50MB)`,
        },
        { status: 413 }
      );
    }

    const mimeType = getMimeType(absolutePath);

    console.log(
      `👁️ [ORPHAN-PREVIEW] Servindo: ${path.basename(
        absolutePath
      )} (${mimeType}, ${(stats.size / 1024).toFixed(1)}KB)`
    );

    // Configurar headers
    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Length', stats.size.toString());
    headers.set('Cache-Control', 'public, max-age=3600');
    headers.set('Last-Modified', stats.mtime.toUTCString());

    // Headers específicos por tipo
    if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
      headers.set('Content-Disposition', 'inline');
    }

    if (mimeType === 'application/pdf') {
      headers.set('X-Frame-Options', 'SAMEORIGIN');
    }

    // Suporte a range requests para arquivos de mídia grandes
    const isMediaFile =
      mimeType.startsWith('video/') || mimeType.startsWith('audio/');
    if (isMediaFile && stats.size > 1024 * 1024) {
      const range = request.headers.get('range');

      if (range) {
        console.log(`📹 [ORPHAN-PREVIEW] Range request: ${range}`);

        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = end - start + 1;

        if (start >= stats.size) {
          headers.set('Content-Range', `bytes */${stats.size}`);
          return new NextResponse(null, { status: 416, headers });
        }

        const fullBuffer = fs.readFileSync(absolutePath);
        const fileBuffer = fullBuffer.slice(start, end + 1);

        const rangeHeaders = new Headers();
        rangeHeaders.set(
          'Content-Range',
          `bytes ${start}-${end}/${stats.size}`
        );
        rangeHeaders.set('Accept-Ranges', 'bytes');
        rangeHeaders.set('Content-Length', chunksize.toString());
        rangeHeaders.set('Content-Type', mimeType);
        rangeHeaders.set('Cache-Control', 'public, max-age=3600');

        return new NextResponse(fileBuffer, {
          status: 206,
          headers: rangeHeaders,
        });
      } else {
        headers.set('Accept-Ranges', 'bytes');
      }
    }

    // Ler e retornar arquivo
    const fileBuffer = fs.readFileSync(absolutePath);
    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (error) {
    console.error('❌ [ORPHAN-PREVIEW] Erro:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Erro desconhecido'
            : 'Erro interno',
      },
      { status: 500 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role < 2) {
      return new NextResponse(null, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    if (!filePath) return new NextResponse(null, { status: 400 });

    const absolutePath = findFile(filePath);
    if (!absolutePath) return new NextResponse(null, { status: 404 });

    const stats = fs.statSync(absolutePath);
    const mimeType = getMimeType(absolutePath);

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Length', stats.size.toString());
    headers.set('Last-Modified', stats.mtime.toUTCString());
    headers.set('Cache-Control', 'public, max-age=3600');

    if (
      (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) &&
      stats.size > 1024 * 1024
    ) {
      headers.set('Accept-Ranges', 'bytes');
    }

    return new NextResponse(null, { status: 200, headers });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
