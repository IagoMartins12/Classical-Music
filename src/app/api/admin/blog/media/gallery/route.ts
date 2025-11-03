// app/api/blog/media/gallery/route.ts
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
  // 🆕 CAMPOS DE USO
  isUsed: boolean;
  usedIn: Array<{
    articleId: string;
    articleTitle: string;
    usageType: 'cover' | 'content' | 'background-music' | 'gallery';
  }>;
  usageCount: number;
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
            // 🆕 INICIALIZAR CAMPOS DE USO
            isUsed: false,
            usedIn: [],
            usageCount: 0,
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
    // 🆕 INICIALIZAR CAMPOS DE USO
    isUsed: true, // Sempre usado pois está no banco
    usedIn: [
      {
        articleId: media.articleId,
        articleTitle: media.article.title,
        usageType: 'gallery' as const,
      },
    ],
    usageCount: 1,
  }));
}

// 🆕 FUNÇÃO OTIMIZADA PARA VERIFICAR USO DE IMAGENS
async function checkImageUsage(
  files: BlogMediaFile[]
): Promise<BlogMediaFile[]> {
  console.log('🔍 [USAGE-CHECK] Verificando uso de imagens...');

  // Buscar APENAS os campos necessários dos artigos
  const articles = await prisma.blogArticle.findMany({
    select: {
      id: true,
      title: true,
      coverImage: true,
      backgroundMusicUrl: true,
      slug: true,
      // ✅ NÃO buscar content completo aqui
    },
  });

  // Criar mapa de uso para cada arquivo
  const usageMap = new Map<
    string,
    Array<{
      articleId: string;
      articleTitle: string;
      usageType: 'cover' | 'content' | 'background-music' | 'gallery';
      slug: string;
    }>
  >();

  // 1️⃣ VERIFICAR COVERS (rápido - apenas string comparison)
  console.log('📸 [USAGE-CHECK] Verificando covers...');
  for (const article of articles) {
    if (article.coverImage) {
      const usage = usageMap.get(article.coverImage) || [];
      usage.push({
        articleId: article.id,
        articleTitle: article.title,
        usageType: 'cover',
        slug: article.slug,
      });
      usageMap.set(article.coverImage, usage);
    }
  }

  // 2️⃣ VERIFICAR BACKGROUND MUSIC (rápido - apenas string comparison)
  console.log('🎵 [USAGE-CHECK] Verificando áudios de fundo...');
  for (const article of articles) {
    if (article.backgroundMusicUrl) {
      const usage = usageMap.get(article.backgroundMusicUrl) || [];
      usage.push({
        articleId: article.id,
        articleTitle: article.title,
        usageType: 'background-music',
        slug: article.slug,
      });
      usageMap.set(article.backgroundMusicUrl, usage);
    }
  }

  // 3️⃣ VERIFICAR CONTENT (otimizado - busca por URL específica)
  console.log('📝 [USAGE-CHECK] Verificando conteúdo dos artigos...');

  // Buscar apenas artigos que podem ter as URLs
  const urlsToCheck = files.map((f) => f.url);

  // Buscar todos os artigos ativos (sem o content completo ainda)
  const allArticles = await prisma.blogArticle.findMany({
    where: {
      status: { not: 'DRAFT' },
    },
    select: {
      id: true,
      title: true,
      content: true, // Agora vamos buscar, mas otimizado
      slug: true,
    },
  });

  // Para cada URL, verificar se está no content de algum artigo
  for (const url of urlsToCheck) {
    try {
      // Buscar artigos que contém essa URL
      const articlesWithUrl = allArticles.filter((article) => {
        // Converter content para string e buscar URL
        const contentStr = JSON.stringify(article.content);
        return contentStr.includes(url);
      });

      if (articlesWithUrl.length > 0) {
        const usage = usageMap.get(url) || [];
        for (const article of articlesWithUrl) {
          // Verificar se já não foi adicionado como cover/background
          const alreadyAdded = usage.some(
            (u) => u.articleId === article.id && u.usageType === 'content'
          );

          if (!alreadyAdded) {
            usage.push({
              articleId: article.id,
              slug: article.slug,
              articleTitle: article.title,
              usageType: 'content',
            });
          }
        }
        usageMap.set(url, usage);
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar URL ${url}:`, error);
    }
  }

  // 4️⃣ APLICAR DADOS DE USO AOS ARQUIVOS
  console.log('✅ [USAGE-CHECK] Aplicando dados de uso...');
  return files.map((file) => {
    const usedIn = usageMap.get(file.url) || [];

    // Remover duplicatas por articleId
    const uniqueUsage = Array.from(
      new Map(usedIn.map((u) => [u.articleId, u])).values()
    );

    return {
      ...file,
      isUsed: uniqueUsage.length > 0,
      usedIn: uniqueUsage,
      usageCount: uniqueUsage.length,
    };
  });
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

    // 🆕 VERIFICAR USO DAS IMAGENS (otimizado)
    console.log('🔍 [BLOG-MEDIA-GALLERY] Verificando uso das imagens...');
    const filesWithUsage = await checkImageUsage(uniqueFiles);

    // Filtros
    let filteredFiles = filesWithUsage;

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
      // 🆕 STATS DE USO
      usedFiles: filteredFiles.filter((f) => f.isUsed).length,
      unusedFiles: filteredFiles.filter((f) => !f.isUsed).length,
      multiUseFiles: filteredFiles.filter((f) => f.usageCount > 1).length,
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
