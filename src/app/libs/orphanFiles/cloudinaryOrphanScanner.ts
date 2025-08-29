// app/libs/orphanFiles/cloudinaryOrphanScanner.ts - VERSÃO CORRIGIDA
import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/app/libs/prismadb';

// 🔧 CONFIGURAÇÃO DO CLOUDINARY
if (!cloudinary.config().cloud_name) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export interface CloudinaryFile {
  publicId: string;
  secureUrl: string;
  format: string;
  resourceType: 'image' | 'video' | 'raw';
  bytes: number;
  createdAt: string;
  folder: string;
  tags: string[];
}

export interface CloudinaryOrphanFile extends CloudinaryFile {
  category: CloudinaryFileCategory;
  isOrphan: boolean;
  formattedSize: string;
  relativeAge: string; // "2 days ago", "1 month ago"
}

export type CloudinaryFileCategory =
  | 'assignments'
  | 'learned'
  | 'scores'
  | 'works-audio'
  | 'works-video'
  | 'advertisements'
  | 'profiles'
  | 'composers'
  | 'unknown';

export interface CloudinaryOrphanScanResult {
  totalFiles: number;
  orphanFiles: CloudinaryOrphanFile[];
  referencedFiles: CloudinaryOrphanFile[];
  totalSize: number;
  formattedTotalSize: string;
  categories: Record<
    CloudinaryFileCategory,
    { count: number; size: number; orphans: number }
  >;
  scanDuration: number;
  scannedFolders: string[];
  errors: string[];
}

/**
 * Scanner para arquivos órfãos no Cloudinary
 */
export class CloudinaryOrphanScanner {
  private allReferencedUrls: Set<string>;
  private allReferencedPublicIds: Set<string>;

  constructor() {
    this.allReferencedUrls = new Set();
    this.allReferencedPublicIds = new Set();

    // 🔧 VERIFICAR E CONFIGURAR CLOUDINARY
    this.ensureCloudinaryConfig();
  }

  /**
   * 🔧 Garantir que o Cloudinary está configurado
   */
  private ensureCloudinaryConfig(): void {
    const config = cloudinary.config();

    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.log('🔧 Configurando Cloudinary...');

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const newConfig = cloudinary.config();

      if (!newConfig.cloud_name) {
        throw new Error(
          'Configuração do Cloudinary incompleta. Verifique as variáveis de ambiente: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
        );
      }

      console.log(`✅ Cloudinary configurado: ${newConfig.cloud_name}`);
    }
  }

  /**
   * Escanear arquivos órfãos no Cloudinary
   */
  async scanCloudinaryOrphans(): Promise<CloudinaryOrphanScanResult> {
    const startTime = Date.now();
    console.log(
      '🔍 [CLOUDINARY-SCAN] Iniciando scan de arquivos órfãos no Cloudinary...'
    );

    try {
      // 🔧 Verificar configuração antes de iniciar
      this.ensureCloudinaryConfig();

      // 1. Carregar todas as referências do banco de dados
      await this.loadAllDatabaseReferences();

      // 2. Buscar todos os arquivos no Cloudinary
      const allCloudinaryFiles = await this.getAllCloudinaryFiles();

      // 3. Classificar arquivos como órfãos ou referenciados
      const { orphanFiles, referencedFiles } =
        this.classifyFiles(allCloudinaryFiles);

      // 4. Calcular estatísticas
      const totalSize = allCloudinaryFiles.reduce(
        (sum, file) => sum + file.bytes,
        0
      );
      const categories = this.categorizeFiles(allCloudinaryFiles, orphanFiles);

      const result: CloudinaryOrphanScanResult = {
        totalFiles: allCloudinaryFiles.length,
        orphanFiles,
        referencedFiles,
        totalSize,
        formattedTotalSize: this.formatBytes(totalSize),
        categories,
        scanDuration: Date.now() - startTime,
        scannedFolders: this.getScannedFolders(allCloudinaryFiles),
        errors: [],
      };

      console.log(
        `✅ [CLOUDINARY-SCAN] Concluído: ${orphanFiles.length} órfãos de ${allCloudinaryFiles.length} arquivos`
      );
      return result;
    } catch (error) {
      console.error('❌ [CLOUDINARY-SCAN] Erro:', error);
      throw error;
    }
  }

  /**
   * Buscar todos os arquivos no Cloudinary
   */
  private async getAllCloudinaryFiles(): Promise<CloudinaryFile[]> {
    const files: CloudinaryFile[] = [];

    console.log('📂 [CLOUDINARY-SCAN] Buscando arquivos no Cloudinary...');

    try {
      // 🔧 Verificar configuração novamente
      this.ensureCloudinaryConfig();

      // Buscar todos os tipos de recursos
      const resourceTypes: Array<'image' | 'video' | 'raw'> = [
        'image',
        'video',
        'raw',
      ];

      for (const resourceType of resourceTypes) {
        let nextCursor: string | undefined;

        do {
          try {
            const result = await cloudinary.api.resources({
              resource_type: resourceType,
              type: 'upload',
              max_results: 500,
              next_cursor: nextCursor,
            });

            for (const resource of result.resources) {
              files.push({
                publicId: resource.public_id,
                secureUrl: resource.secure_url,
                format: resource.format,
                resourceType,
                bytes: resource.bytes || 0,
                createdAt: resource.created_at,
                folder: resource.folder || '',
                tags: resource.tags || [],
              });
            }

            nextCursor = result.next_cursor;
            console.log(
              `📄 [CLOUDINARY-SCAN] ${resourceType}: ${
                files.filter((f) => f.resourceType === resourceType).length
              } arquivos encontrados`
            );
          } catch (apiError) {
            console.error(
              `❌ [CLOUDINARY-SCAN] Erro na API do Cloudinary (${resourceType}):`,
              apiError
            );

            // Se for erro de configuração, relançar
            if (
              apiError instanceof Error &&
              apiError.message.includes('cloud_name')
            ) {
              throw new Error(
                `Configuração do Cloudinary inválida: ${apiError.message}. Verifique as variáveis de ambiente.`
              );
            }

            // Para outros erros da API, continuar com o próximo tipo
            break;
          }
        } while (nextCursor);
      }
    } catch (error) {
      console.error('❌ [CLOUDINARY-SCAN] Erro ao buscar arquivos:', error);
      throw error;
    }

    console.log(
      `📊 [CLOUDINARY-SCAN] Total: ${files.length} arquivos encontrados no Cloudinary`
    );
    return files;
  }

  /**
   * Carregar todas as referências do banco de dados
   */
  private async loadAllDatabaseReferences(): Promise<void> {
    console.log('📚 [CLOUDINARY-SCAN] Carregando referências do banco...');

    try {
      // 1. Users (fotos de perfil)
      const users = await prisma.user.findMany({
        select: { image: true },
      });
      users.forEach((user) => {
        if (user.image) this.addCloudinaryReference(user.image);
      });

      // 2. Composers (retratos)
      const composers = await prisma.composer.findMany({
        select: { portraitUrl: true },
      });
      composers.forEach((composer) => {
        if (composer.portraitUrl)
          this.addCloudinaryReference(composer.portraitUrl);
      });

      // 3. WorkScores (partituras e thumbnails)
      const workScores = await prisma.workScore.findMany({
        select: { downloadUrl: true, thumbnailUrl: true },
      });
      workScores.forEach((score) => {
        if (score.downloadUrl) this.addCloudinaryReference(score.downloadUrl);
        if (score.thumbnailUrl) this.addCloudinaryReference(score.thumbnailUrl);
      });

      // 4. Works (áudios e vídeos customizados)
      const works = await prisma.work.findMany({
        select: {
          spotifyThumbnail: true,
          customAudioUrl: true,
          customAudioFile: true,
          videoAulaUrl: true,
          videoAulaFile: true,
        },
      });
      works.forEach((work) => {
        if (work.spotifyThumbnail)
          this.addCloudinaryReference(work.spotifyThumbnail);
        if (work.customAudioUrl)
          this.addCloudinaryReference(work.customAudioUrl);
        if (work.customAudioFile)
          this.addCloudinaryReference(work.customAudioFile);
        if (work.videoAulaUrl) this.addCloudinaryReference(work.videoAulaUrl);
        if (work.videoAulaFile) this.addCloudinaryReference(work.videoAulaFile);
      });

      // 5. Learned (vídeos de performance)
      const learned = await prisma.learned.findMany({
        select: { videoUrl: true },
      });
      learned.forEach((item) => {
        if (item.videoUrl) this.addCloudinaryReference(item.videoUrl);
      });

      // 6. Assignments (submissions com vídeos)
      const assignments = await prisma.assignment.findMany({
        select: { submissions: true },
      });
      assignments.forEach((assignment) => {
        if (
          assignment.submissions &&
          typeof assignment.submissions === 'object'
        ) {
          const submissions = assignment.submissions as any;

          // Verificar videoSubmission
          if (submissions.videoSubmission?.cloudinaryUrl) {
            this.addCloudinaryReference(
              submissions.videoSubmission.cloudinaryUrl
            );
          }
          if (submissions.videoSubmission?.filePath) {
            this.addCloudinaryReference(submissions.videoSubmission.filePath);
          }
        }
      });

      // 7. Advertisements
      const ads = await prisma.advertisement.findMany({
        select: {
          imageUrl: true,
          videoUrl: true,
          thumbnailUrl: true,
          imageVersions: true,
          videoVersions: true,
        },
      });
      ads.forEach((ad) => {
        if (ad.imageUrl) this.addCloudinaryReference(ad.imageUrl);
        if (ad.videoUrl) this.addCloudinaryReference(ad.videoUrl);
        if (ad.thumbnailUrl) this.addCloudinaryReference(ad.thumbnailUrl);

        // Versões responsivas
        if (ad.imageVersions && typeof ad.imageVersions === 'object') {
          Object.values(ad.imageVersions).forEach((url) => {
            if (url && typeof url === 'string')
              this.addCloudinaryReference(url);
          });
        }

        if (ad.videoVersions && typeof ad.videoVersions === 'object') {
          Object.values(ad.videoVersions).forEach((url) => {
            if (url && typeof url === 'string')
              this.addCloudinaryReference(url);
          });
        }
      });

      console.log(
        `📚 [CLOUDINARY-SCAN] ${this.allReferencedUrls.size} URLs e ${this.allReferencedPublicIds.size} publicIds referenciados no banco`
      );
    } catch (error) {
      console.error(
        '❌ [CLOUDINARY-SCAN] Erro ao carregar referências:',
        error
      );
      throw error;
    }
  }

  /**
   * Adicionar referência do Cloudinary (URL ou publicId)
   */
  private addCloudinaryReference(urlOrPublicId: string): void {
    if (!urlOrPublicId) return;

    // Se é uma URL do Cloudinary, extrair publicId e adicionar ambos
    if (urlOrPublicId.includes('cloudinary.com')) {
      this.allReferencedUrls.add(urlOrPublicId);

      // Extrair publicId da URL
      try {
        const publicId = this.extractPublicIdFromUrl(urlOrPublicId);
        if (publicId) {
          this.allReferencedPublicIds.add(publicId);
        }
      } catch {
        console.warn(
          `⚠️ [CLOUDINARY-SCAN] Erro ao extrair publicId de: ${urlOrPublicId}`
        );
      }
    } else {
      // Assumir que é um publicId
      this.allReferencedPublicIds.add(urlOrPublicId);
    }
  }

  /**
   * Extrair publicId de uma URL do Cloudinary
   */
  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');

      // Estrutura típica: /image/upload/v1234567890/folder/filename.ext
      const uploadIndex = pathParts.indexOf('upload');
      if (uploadIndex === -1) return null;

      // Pegar tudo depois de upload, ignorando versão se houver
      const afterUpload = pathParts.slice(uploadIndex + 1);
      if (afterUpload.length === 0) return null;

      // Se primeiro item começa com 'v' seguido de números, é versão - ignorar
      let publicIdParts = afterUpload;
      if (afterUpload[0] && /^v\d+$/.test(afterUpload[0])) {
        publicIdParts = afterUpload.slice(1);
      }

      // Juntar partes e remover extensão
      const publicIdWithExt = publicIdParts.join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); // Remove extensão

      return publicId;
    } catch (error) {
      console.warn(`⚠️ [CLOUDINARY-SCAN] Erro ao processar URL: ${url}`, error);
      return null;
    }
  }

  /**
   * Classificar arquivos como órfãos ou referenciados
   */
  private classifyFiles(files: CloudinaryFile[]): {
    orphanFiles: CloudinaryOrphanFile[];
    referencedFiles: CloudinaryOrphanFile[];
  } {
    const orphanFiles: CloudinaryOrphanFile[] = [];
    const referencedFiles: CloudinaryOrphanFile[] = [];

    files.forEach((file) => {
      const isReferenced =
        this.allReferencedUrls.has(file.secureUrl) ||
        this.allReferencedPublicIds.has(file.publicId);

      const orphanFile: CloudinaryOrphanFile = {
        ...file,
        category: this.categorizeFile(file),
        isOrphan: !isReferenced,
        formattedSize: this.formatBytes(file.bytes),
        relativeAge: this.getRelativeAge(file.createdAt),
      };

      if (isReferenced) {
        referencedFiles.push(orphanFile);
      } else {
        orphanFiles.push(orphanFile);
        console.log(
          `🗑️ [ORPHAN] ${file.publicId} (${orphanFile.formattedSize})`
        );
      }
    });

    return { orphanFiles, referencedFiles };
  }

  /**
   * Categorizar arquivo baseado no folder/publicId
   */
  private categorizeFile(file: CloudinaryFile): CloudinaryFileCategory {
    const { publicId, folder } = file;

    if (publicId.includes('/assignments/') || folder.includes('assignments'))
      return 'assignments';
    if (publicId.includes('/learned/') || folder.includes('learned'))
      return 'learned';
    if (publicId.includes('/partituras/') || folder.includes('partituras'))
      return 'scores';
    if (publicId.includes('/videos/aulas/') || folder.includes('aulas'))
      return 'works-video';
    if (publicId.includes('/audio/custom/') || folder.includes('audio'))
      return 'works-audio';
    if (publicId.includes('/ads/') || folder.includes('ads'))
      return 'advertisements';
    if (publicId.includes('/profiles/') || folder.includes('profiles'))
      return 'profiles';
    if (publicId.includes('/composers/') || folder.includes('composers'))
      return 'composers';

    return 'unknown';
  }

  /**
   * Calcular estatísticas por categoria
   */
  private categorizeFiles(
    allFiles: CloudinaryFile[],
    orphanFiles: CloudinaryOrphanFile[]
  ): Record<
    CloudinaryFileCategory,
    { count: number; size: number; orphans: number }
  > {
    const categories: Record<
      CloudinaryFileCategory,
      { count: number; size: number; orphans: number }
    > = {
      assignments: { count: 0, size: 0, orphans: 0 },
      learned: { count: 0, size: 0, orphans: 0 },
      scores: { count: 0, size: 0, orphans: 0 },
      'works-audio': { count: 0, size: 0, orphans: 0 },
      'works-video': { count: 0, size: 0, orphans: 0 },
      advertisements: { count: 0, size: 0, orphans: 0 },
      profiles: { count: 0, size: 0, orphans: 0 },
      composers: { count: 0, size: 0, orphans: 0 },
      unknown: { count: 0, size: 0, orphans: 0 },
    };

    // Contar todos os arquivos
    allFiles.forEach((file) => {
      const category = this.categorizeFile(file);
      categories[category].count++;
      categories[category].size += file.bytes;
    });

    // Contar órfãos
    orphanFiles.forEach((file) => {
      categories[file.category].orphans++;
    });

    return categories;
  }

  /**
   * Remover arquivos órfãos do Cloudinary
   */
  async removeCloudinaryOrphans(publicIds: string[]): Promise<{
    removed: string[];
    failed: Array<{ publicId: string; error: string }>;
    totalSizeFreed: number;
  }> {
    const removed: string[] = [];
    const failed: Array<{ publicId: string; error: string }> = [];
    let totalSizeFreed = 0;

    console.log(
      `🗑️ [CLOUDINARY-DELETE] Removendo ${publicIds.length} arquivos órfãos...`
    );

    // 🔧 Verificar configuração antes de deletar
    this.ensureCloudinaryConfig();

    for (const publicId of publicIds) {
      try {
        // Determinar tipo de recurso baseado no publicId
        let resourceType: 'image' | 'video' | 'raw' = 'image';
        if (
          publicId.includes('video/') ||
          publicId.includes('aula_') ||
          publicId.includes('learned_')
        ) {
          resourceType = 'video';
        } else if (publicId.includes('audio/')) {
          resourceType = 'video'; // Cloudinary trata áudio como video
        } else if (
          publicId.includes('partituras/') &&
          publicId.includes('score_')
        ) {
          resourceType = 'image'; // PDFs são tratados como image
        }

        // Tentar obter informações do arquivo antes de deletar (para calcular espaço)
        let fileSize = 0;
        try {
          const resourceInfo = await cloudinary.api.resource(publicId, {
            resource_type: resourceType,
          });
          fileSize = resourceInfo.bytes;
        } catch  {
          console.warn(
            `⚠️ [CLOUDINARY-DELETE] Não conseguiu obter info de ${publicId}`
          );
        }

        // Deletar arquivo
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
        });

        if (result.result === 'ok') {
          removed.push(publicId);
          totalSizeFreed += fileSize;
          console.log(`✅ [CLOUDINARY-DELETE] ${publicId} removido`);
        } else {
          failed.push({
            publicId,
            error: `Resultado inesperado: ${result.result}`,
          });
          console.warn(
            `⚠️ [CLOUDINARY-DELETE] Falha ao remover ${publicId}: ${result.result}`
          );
        }
      } catch (error) {
        failed.push({
          publicId,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
        console.error(
          `❌ [CLOUDINARY-DELETE] Erro ao remover ${publicId}:`,
          error
        );
      }
    }

    console.log(
      `✅ [CLOUDINARY-DELETE] Concluído: ${removed.length} removidos, ${failed.length} falharam`
    );
    return { removed, failed, totalSizeFreed };
  }

  /**
   * Utilitários
   */
  private getScannedFolders(files: CloudinaryFile[]): string[] {
    const folders = new Set<string>();
    files.forEach((file) => {
      if (file.folder) folders.add(file.folder);
    });
    return Array.from(folders).sort();
  }

  private getRelativeAge(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'hoje';
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return `${Math.floor(diffDays / 365)} anos atrás`;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
