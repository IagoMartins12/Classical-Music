// app/api/admin/blog/media/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { readdir, stat, unlink } from 'fs/promises';
import path from 'path';
import { MediaType } from '@prisma/client';

type MediaCategory = 'all' | 'cover' | 'content' | 'audio' | 'temp' | 'gallery';

interface BlogMediaFile {
  id: string;
  articleId?: string;
  articleTitle?: string;
  type: MediaType;
  url: string;
  source: 'local' | 'cloudinary';
  category: MediaCategory;
  title?: string;
  alt?: string;
  size: number;
  formattedSize: string;
  width?: number;
  height?: number;
  createdAt: string;
  folder: string;
  isTemporary: boolean;
  inGallery: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getCategoryFromPath(filePath: string): MediaCategory {
  if (filePath.includes('/_temp/')) return 'temp';
  if (filePath.includes('/thumbnail/')) return 'cover';
  if (filePath.includes('/audio/')) return 'audio';
  if (filePath.includes('/content/')) return 'content';
  if (filePath.includes('/gallery/')) return 'gallery';
  return 'content';
}

async function scanLocalFiles(
  includeTemp: boolean = true
): Promise<BlogMediaFile[]> {
  const files: BlogMediaFile[] = [];
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'blog');

  async function scanDirectory(
    dir: string,
    articleId?: string,
    articleTitle?: string
  ) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Se é pasta de artigo (ObjectId)
          if (entry.name.match(/^[a-f\d]{24}$/i)) {
            // Buscar título do artigo
            const article = await prisma.blogArticle.findUnique({
              where: { id: entry.name },
              select: { id: true, title: true },
            });

            await scanDirectory(
              fullPath,
              entry.name,
              article?.title || 'Artigo Deletado'
            );
          } else if (entry.name === '_temp' && includeTemp) {
            // Scan temporários
            await scanDirectory(fullPath);
          } else {
            // Outras pastas
            await scanDirectory(fullPath, articleId, articleTitle);
          }
        } else if (entry.isFile()) {
          const stats = await stat(fullPath);
          const relativePath = fullPath.replace(process.cwd() + '/public', '');
          const category = getCategoryFromPath(relativePath);
          const isTemp = relativePath.includes('/_temp/');

          // Determinar tipo
          let type: MediaType = 'IMAGE';
          const ext = path.extname(entry.name).toLowerCase();
          if (['.mp4', '.webm', '.mov'].includes(ext)) type = 'VIDEO';
          if (['.mp3', '.wav', '.ogg'].includes(ext)) type = 'AUDIO';

          files.push({
            id: relativePath,
            articleId: !isTemp ? articleId : undefined,
            articleTitle: !isTemp ? articleTitle : undefined,
            type,
            url: relativePath,
            source: 'local',
            category,
            size: stats.size,
            formattedSize: formatFileSize(stats.size),
            createdAt: stats.birthtime.toISOString(),
            folder: path.dirname(relativePath).split('/').pop() || '',
            isTemporary: isTemp,
            inGallery: true,
          });
        }
      }
    } catch (error) {
      console.error(`Erro ao escanear ${dir}:`, error);
    }
  }

  await scanDirectory(uploadsDir);
  return files;
}

async function scanDatabaseMedia(): Promise<BlogMediaFile[]> {
  const dbMedia = await prisma.blogMedia.findMany({
    include: {
      article: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return dbMedia.map((media) => ({
    id: media.id,
    articleId: media.articleId,
    articleTitle: media.article.title,
    type: media.type,
    url: media.url,
    source: media.url.includes('cloudinary.com')
      ? ('cloudinary' as const)
      : ('local' as const),
    category: 'gallery' as MediaCategory,
    title: media.title || undefined,
    alt: media.alt || undefined,
    size: media.fileSize || 0,
    formattedSize: formatFileSize(media.fileSize || 0),
    width: media.width || undefined,
    height: media.height || undefined,
    createdAt: media.createdAt.toISOString(),
    folder: 'gallery',
    isTemporary: false,
    inGallery: media.inGallery,
  }));
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as MediaCategory;
    const source = searchParams.get('source') as 'local' | 'cloudinary';
    const includeTemp = searchParams.get('includeTemp') !== 'false';

    console.log(`🔍 [BLOG-MEDIA-GALLERY] Iniciando scan...`);

    // Scan arquivos locais e banco
    const [localFiles, dbFiles] = await Promise.all([
      scanLocalFiles(includeTemp),
      scanDatabaseMedia(),
    ]);

    // Combinar e remover duplicatas
    const allFiles = [...localFiles, ...dbFiles];
    const uniqueFiles = Array.from(
      new Map(allFiles.map((f) => [f.url, f])).values()
    );

    // Filtros
    let filteredFiles = uniqueFiles;

    if (category && category !== 'all') {
      filteredFiles = filteredFiles.filter((f) => f.category === category);
    }

    if (source) {
      filteredFiles = filteredFiles.filter((f) => f.source === source);
    }

    // Stats
    const stats = {
      totalFiles: filteredFiles.length,
      totalSize: filteredFiles.reduce((sum, f) => sum + f.size, 0),
      formattedTotalSize: formatFileSize(
        filteredFiles.reduce((sum, f) => sum + f.size, 0)
      ),
      byCategory: {} as Record<MediaCategory, { count: number; size: number }>,
      byType: {} as Record<string, { count: number; size: number }>,
      temporaryFiles: filteredFiles.filter((f) => f.isTemporary).length,
      temporarySize: filteredFiles
        .filter((f) => f.isTemporary)
        .reduce((sum, f) => sum + f.size, 0),
    };

    // Stats por categoria
    ['all', 'cover', 'content', 'audio', 'temp', 'gallery'].forEach((cat) => {
      const categoryFiles = filteredFiles.filter(
        (f) => f.category === cat || cat === 'all'
      );
      stats.byCategory[cat as MediaCategory] = {
        count: categoryFiles.length,
        size: categoryFiles.reduce((sum, f) => sum + f.size, 0),
      };
    });

    // Stats por tipo
    ['IMAGE', 'VIDEO', 'AUDIO'].forEach((type) => {
      const typeFiles = filteredFiles.filter((f) => f.type === type);
      stats.byType[type] = {
        count: typeFiles.length,
        size: typeFiles.reduce((sum, f) => sum + f.size, 0),
      };
    });

    const scanDuration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;

    console.log(
      `✅ [BLOG-MEDIA-GALLERY] Scan concluído: ${filteredFiles.length} arquivos`
    );

    return NextResponse.json({
      success: true,
      data: {
        files: filteredFiles,
        stats,
        scanDuration,
      },
    });
  } catch (error) {
    console.error('❌ [BLOG-MEDIA-GALLERY] Erro:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { fileUrls } = body;

    if (!fileUrls || fileUrls.length === 0) {
      return NextResponse.json(
        { error: 'Lista de arquivos é obrigatória' },
        { status: 400 }
      );
    }

    console.log(
      `🗑️ [BLOG-MEDIA-GALLERY] Removendo ${fileUrls.length} arquivos...`
    );

    const removed: string[] = [];
    const failed: Array<{ url: string; error: string }> = [];

    for (const url of fileUrls) {
      try {
        // Se for local, deletar do sistema de arquivos
        if (!url.includes('cloudinary.com')) {
          const filePath = path.join(process.cwd(), 'public', url);
          await unlink(filePath);
        }

        // Deletar do banco se existir
        await prisma.blogMedia.deleteMany({
          where: { url },
        });

        removed.push(url);
      } catch (error) {
        failed.push({
          url,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    console.log(
      `✅ [BLOG-MEDIA-GALLERY] ${removed.length} removidos, ${failed.length} falharam`
    );

    return NextResponse.json({
      success: true,
      data: {
        removed,
        failed,
        summary: {
          totalRemoved: removed.length,
          totalFailed: failed.length,
        },
      },
      message: `${removed.length} arquivo(s) removido(s) com sucesso`,
    });
  } catch (error) {
    console.error('❌ [BLOG-MEDIA-GALLERY] Erro ao deletar:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
