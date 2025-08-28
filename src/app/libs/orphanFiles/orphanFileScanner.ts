// app/libs/orphanFiles/orphanFileScanner.ts - VERSÃO CORRIGIDA
import fs from 'fs/promises';
import path from 'path';
import prisma from '@/app/libs/prismadb';
import {
  CloudinaryOrphanScanner,
  CloudinaryOrphanFile,
  CloudinaryOrphanScanResult,
} from './cloudinaryOrphanScanner';

export interface OrphanFile {
  path: string;
  name: string;
  size: number;
  lastModified: Date;
  category: OrphanFileCategory;
  subCategory?: string;
  relativePath: string;
  directory: string;
  extension: string;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  isPDF: boolean;
  formattedSize: string;
}

export interface OrphanScanResult {
  totalFiles: number;
  orphanFiles: OrphanFile[];
  totalSize: number;
  formattedTotalSize: string;
  categories: Record<OrphanFileCategory, number>;
  scanDuration: number;
  scannedDirectories: string[];
  errors: string[];

  // Dados do Cloudinary
  cloudinaryData?: CloudinaryOrphanScanResult;
  includesCloudinary: boolean;
}

export type OrphanFileCategory =
  | 'profiles'
  | 'composers'
  | 'scores'
  | 'advertisements'
  | 'works'
  | 'general'
  | 'unknown'
  | 'cloudinary';

// 🔧 INTERFACE CORRIGIDA PARA OPÇÕES
interface ScanOptions {
  categories?: OrphanFileCategory[];
  includeTemp?: boolean;
  minSize?: number;
  maxSize?: number;
  extensions?: string[];
  olderThan?: Date;
  includesCloudinary?: boolean; // 🔧 CORRIGIDO: includesCloudinary em vez de includeCloudinary
}

// Configuração dos diretórios por categoria
const UPLOAD_DIRECTORIES: Record<OrphanFileCategory, string[]> = {
  profiles: ['uploads/profiles'],
  composers: ['uploads/composers'],
  scores: ['uploads/scores'],
  advertisements: ['uploads/ads'],
  works: ['uploads/works'],
  general: ['uploads/image', 'uploads/score'],
  unknown: ['uploads'],
  cloudinary: [], // Cloudinary não tem diretórios físicos
};

// Extensões por tipo
const FILE_TYPES = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  videos: ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.mkv'],
  audio: ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac'],
  documents: ['.pdf', '.doc', '.docx'],
};

/**
 * Scanner principal de arquivos órfãos - VERSÃO HÍBRIDA
 */
export class OrphanFileScanner {
  private uploadsRoot: string;
  private allReferencedFiles: Set<string>;
  private cloudinaryScanner: CloudinaryOrphanScanner;

  constructor() {
    this.uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
    this.allReferencedFiles = new Set();
    this.cloudinaryScanner = new CloudinaryOrphanScanner();
  }

  /**
   * Escaneamento completo híbrido (local + Cloudinary)
   */
  async scanAll(options: ScanOptions = {}): Promise<OrphanScanResult> {
    const startTime = Date.now();
    const includesCloudinary = options.includesCloudinary !== false; // Default true

    console.log(
      `🔍 Iniciando scan ${
        includesCloudinary ? 'híbrido' : 'local'
      } de arquivos órfãos`
    );

    try {
      // 1. Scan local (arquivos físicos)
      const localResult = await this.scanLocalFiles(options);

      // 2. Scan Cloudinary (se habilitado)
      let cloudinaryData: CloudinaryOrphanScanResult | undefined;
      if (includesCloudinary) {
        try {
          console.log('☁️ Iniciando scan do Cloudinary...');
          cloudinaryData = await this.cloudinaryScanner.scanCloudinaryOrphans();
          console.log(
            `☁️ Cloudinary: ${cloudinaryData.orphanFiles.length} órfãos encontrados`
          );
        } catch (cloudinaryError) {
          console.error('❌ Erro no scan do Cloudinary:', cloudinaryError);
          localResult.errors.push(`Erro no Cloudinary: ${cloudinaryError}`);
        }
      }

      // 3. Consolidar resultado
      const result: OrphanScanResult = {
        ...localResult,
        cloudinaryData,
        includesCloudinary,
        scanDuration: Date.now() - startTime,
      };

      const totalOrphans =
        localResult.orphanFiles.length +
        (cloudinaryData?.orphanFiles.length || 0);
      console.log(
        `✅ Scan ${
          includesCloudinary ? 'híbrido' : 'local'
        } concluído: ${totalOrphans} órfãos encontrados`
      );

      return result;
    } catch (error) {
      console.error('❌ Erro durante scan:', error);
      throw error;
    }
  }

  /**
   * Scan por categoria específica
   */
  async scanByCategory(
    category: OrphanFileCategory,
    options: ScanOptions = {}
  ): Promise<OrphanScanResult> {
    if (category === 'cloudinary') {
      // Scan apenas do Cloudinary
      const startTime = Date.now();

      try {
        const cloudinaryData =
          await this.cloudinaryScanner.scanCloudinaryOrphans();

        return {
          totalFiles: cloudinaryData.totalFiles,
          orphanFiles: [], // Arquivos locais vazios
          totalSize: 0, // Tamanho local zero
          formattedTotalSize: '0 B',
          categories: {
            profiles: 0,
            composers: 0,
            scores: 0,
            advertisements: 0,
            works: 0,
            general: 0,
            unknown: 0,
            cloudinary: cloudinaryData.orphanFiles.length,
          },
          scanDuration: Date.now() - startTime,
          scannedDirectories: ['Cloudinary'],
          errors: [],
          cloudinaryData,
          includesCloudinary: true,
        };
      } catch (error) {
        throw new Error(`Erro ao escanear Cloudinary: ${error}`);
      }
    }

    // Scan local normal
    return this.scanLocalByCategory(category, options);
  }

  /**
   * Scan local de arquivos (método original adaptado)
   */
  private async scanLocalFiles(
    options: ScanOptions
  ): Promise<Omit<OrphanScanResult, 'cloudinaryData' | 'includesCloudinary'>> {
    // Carregar todas as referências do banco de dados
    await this.loadAllDatabaseReferences();

    // Escanear todos os diretórios locais
    const allFiles: OrphanFile[] = [];
    const scannedDirectories: string[] = [];
    const errors: string[] = [];

    // Escanear cada categoria (exceto cloudinary)
    for (const [category, directories] of Object.entries(UPLOAD_DIRECTORIES)) {
      if (category === 'cloudinary') continue;

      if (
        options.categories &&
        !options.categories.includes(category as OrphanFileCategory)
      ) {
        continue;
      }

      for (const dir of directories) {
        const fullPath = path.join(
          this.uploadsRoot,
          dir.replace('uploads/', '')
        );

        try {
          await fs.access(fullPath);
          const files = await this.scanDirectory(
            fullPath,
            category as OrphanFileCategory,
            options
          );
          allFiles.push(...files);
          scannedDirectories.push(dir);
        } catch (error) {
          errors.push(`Erro ao escanear ${dir}: ${error}`);
        }
      }
    }

    // Filtrar órfãos
    const orphanFiles = this.filterOrphanFiles(allFiles);

    // Calcular estatísticas
    const totalSize = orphanFiles.reduce((sum, file) => sum + file.size, 0);
    const categories = this.categorizeFiles(orphanFiles);

    return {
      totalFiles: allFiles.length,
      orphanFiles,
      totalSize,
      formattedTotalSize: this.formatBytes(totalSize),
      categories,
      scanDuration: 0, // Será calculado no método pai
      scannedDirectories,
      errors,
    };
  }

  /**
   * Scan local por categoria específica
   */
  private async scanLocalByCategory(
    category: OrphanFileCategory,
    options: ScanOptions
  ): Promise<OrphanScanResult> {
    const startTime = Date.now();

    console.log(`🔍 Iniciando scan local de arquivos órfãos: ${category}`);

    try {
      // Carregar todas as referências do banco
      await this.loadDatabaseReferences(category);

      // Escanear arquivos físicos
      const directories = UPLOAD_DIRECTORIES[category];
      const allFiles: OrphanFile[] = [];
      const scannedDirectories: string[] = [];
      const errors: string[] = [];

      for (const dir of directories) {
        const fullPath = path.join(
          this.uploadsRoot,
          dir.replace('uploads/', '')
        );

        try {
          await fs.access(fullPath);
          const files = await this.scanDirectory(fullPath, category, options);
          allFiles.push(...files);
          scannedDirectories.push(dir);
        } catch {
          console.warn(`⚠️ Diretório não encontrado: ${dir}`);
          scannedDirectories.push(`${dir} (não encontrado)`);
        }
      }

      // Filtrar órfãos
      const orphanFiles = this.filterOrphanFiles(allFiles);

      // Calcular estatísticas
      const totalSize = orphanFiles.reduce((sum, file) => sum + file.size, 0);
      const categories = this.categorizeFiles(orphanFiles);

      // 🔧 SCAN DO CLOUDINARY SE HABILITADO
      let cloudinaryData: CloudinaryOrphanScanResult | undefined;
      if (options.includesCloudinary) {
        try {
          console.log('☁️ Incluindo scan do Cloudinary...');
          cloudinaryData = await this.cloudinaryScanner.scanCloudinaryOrphans();
        } catch (cloudinaryError) {
          console.error('❌ Erro no scan do Cloudinary:', cloudinaryError);
          errors.push(`Erro no Cloudinary: ${cloudinaryError}`);
        }
      }

      const result: OrphanScanResult = {
        totalFiles: allFiles.length,
        orphanFiles,
        totalSize,
        formattedTotalSize: this.formatBytes(totalSize),
        categories,
        scanDuration: Date.now() - startTime,
        scannedDirectories,
        errors,
        cloudinaryData,
        includesCloudinary: options.includesCloudinary || false,
      };

      const totalOrphans =
        orphanFiles.length + (cloudinaryData?.orphanFiles.length || 0);
      console.log(
        `✅ Scan local concluído: ${totalOrphans} órfãos encontrados em ${result.scanDuration}ms`
      );
      return result;
    } catch (error) {
      console.error('❌ Erro durante scan local:', error);
      throw error;
    }
  }

  /**
   * Método para remover arquivos híbridos
   */
  async removeOrphanFiles(
    filePaths: string[],
    cloudinaryPublicIds?: string[]
  ): Promise<{
    localResult?: {
      removed: string[];
      failed: Array<{ path: string; error: string }>;
      totalSizeFreed: number;
    };
    cloudinaryResult?: {
      removed: string[];
      failed: Array<{ publicId: string; error: string }>;
      totalSizeFreed: number;
    };
    totalSizeFreed: number;
  }> {
    const results: any = {};
    let totalSizeFreed = 0;

    // Remover arquivos locais
    if (filePaths && filePaths.length > 0) {
      results.localResult = await this.removeLocalOrphanFiles(filePaths);
      totalSizeFreed += results.localResult.totalSizeFreed;
    }

    // Remover arquivos do Cloudinary
    if (cloudinaryPublicIds && cloudinaryPublicIds.length > 0) {
      results.cloudinaryResult =
        await this.cloudinaryScanner.removeCloudinaryOrphans(
          cloudinaryPublicIds
        );
      totalSizeFreed += results.cloudinaryResult.totalSizeFreed;
    }

    return {
      ...results,
      totalSizeFreed,
    };
  }

  /**
   * Remover arquivos locais
   */
  private async removeLocalOrphanFiles(filePaths: string[]): Promise<{
    removed: string[];
    failed: Array<{ path: string; error: string }>;
    totalSizeFreed: number;
  }> {
    const removed: string[] = [];
    const failed: Array<{ path: string; error: string }> = [];
    let totalSizeFreed = 0;

    for (const filePath of filePaths) {
      try {
        const fullPath = path.join(process.cwd(), 'public', filePath);

        // Verificar se arquivo existe e obter tamanho
        const stats = await fs.stat(fullPath);

        // Remover arquivo
        await fs.unlink(fullPath);

        removed.push(filePath);
        totalSizeFreed += stats.size;

        console.log(`🗑️ Arquivo local removido: ${filePath}`);
      } catch (error) {
        failed.push({
          path: filePath,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
        console.error(`❌ Erro ao remover ${filePath}:`, error);
      }
    }

    return { removed, failed, totalSizeFreed };
  }

  /**
   * Carregar todas as referências do banco de dados
   */
  private async loadAllDatabaseReferences(): Promise<void> {
    console.log('📚 Carregando referências locais do banco de dados...');

    try {
      // Users
      const users = await prisma.user.findMany({
        select: { image: true },
      });
      users.forEach((user) => {
        if (user.image) this.addReference(user.image);
      });

      // Composers
      const composers = await prisma.composer.findMany({
        select: { portraitUrl: true },
      });
      composers.forEach((composer) => {
        if (composer.portraitUrl) this.addReference(composer.portraitUrl);
      });

      // WorkScores
      const workScores = await prisma.workScore.findMany({
        select: { downloadUrl: true, thumbnailUrl: true },
      });
      workScores.forEach((score) => {
        if (score.downloadUrl) this.addReference(score.downloadUrl);
        if (score.thumbnailUrl) this.addReference(score.thumbnailUrl);
      });

      // Works
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
        if (work.spotifyThumbnail) this.addReference(work.spotifyThumbnail);
        if (work.customAudioUrl) this.addReference(work.customAudioUrl);
        if (work.customAudioFile) this.addReference(work.customAudioFile);
        if (work.videoAulaUrl) this.addReference(work.videoAulaUrl);
        if (work.videoAulaFile) this.addReference(work.videoAulaFile);
      });

      // Advertisements
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
        if (ad.imageUrl) this.addReference(ad.imageUrl);
        if (ad.videoUrl) this.addReference(ad.videoUrl);
        if (ad.thumbnailUrl) this.addReference(ad.thumbnailUrl);

        // Versões responsivas (JSON)
        if (ad.imageVersions && typeof ad.imageVersions === 'object') {
          Object.values(ad.imageVersions).forEach((url) => {
            if (url && typeof url === 'string') this.addReference(url);
          });
        }

        if (ad.videoVersions && typeof ad.videoVersions === 'object') {
          Object.values(ad.videoVersions).forEach((url) => {
            if (url && typeof url === 'string') this.addReference(url);
          });
        }
      });

      console.log(
        `📚 Carregadas ${this.allReferencedFiles.size} referências locais do banco`
      );
    } catch (error) {
      console.error('❌ Erro ao carregar referências locais:', error);
      throw error;
    }
  }

  /**
   * Carregar referências específicas por categoria
   */
  private async loadDatabaseReferences(
    category: OrphanFileCategory
  ): Promise<void> {
    console.log(`📚 Carregando referências locais para categoria: ${category}`);

    try {
      switch (category) {
        case 'profiles':
          const users = await prisma.user.findMany({
            select: { image: true },
          });
          users.forEach((user) => {
            if (user.image) this.addReference(user.image);
          });
          break;

        case 'composers':
          const composers = await prisma.composer.findMany({
            select: { portraitUrl: true },
          });
          composers.forEach((composer) => {
            if (composer.portraitUrl) this.addReference(composer.portraitUrl);
          });
          break;

        case 'scores':
          const workScores = await prisma.workScore.findMany({
            select: { downloadUrl: true, thumbnailUrl: true },
          });
          workScores.forEach((score) => {
            if (score.downloadUrl) this.addReference(score.downloadUrl);
            if (score.thumbnailUrl) this.addReference(score.thumbnailUrl);
          });
          break;

        case 'advertisements':
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
            if (ad.imageUrl) this.addReference(ad.imageUrl);
            if (ad.videoUrl) this.addReference(ad.videoUrl);
            if (ad.thumbnailUrl) this.addReference(ad.thumbnailUrl);

            if (ad.imageVersions && typeof ad.imageVersions === 'object') {
              Object.values(ad.imageVersions).forEach((url) => {
                if (url && typeof url === 'string') this.addReference(url);
              });
            }

            if (ad.videoVersions && typeof ad.videoVersions === 'object') {
              Object.values(ad.videoVersions).forEach((url) => {
                if (url && typeof url === 'string') this.addReference(url);
              });
            }
          });
          break;

        case 'works':
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
            if (work.spotifyThumbnail) this.addReference(work.spotifyThumbnail);
            if (work.customAudioUrl) this.addReference(work.customAudioUrl);
            if (work.customAudioFile) this.addReference(work.customAudioFile);
            if (work.videoAulaUrl) this.addReference(work.videoAulaUrl);
            if (work.videoAulaFile) this.addReference(work.videoAulaFile);
          });
          break;

        default:
          // Para 'general' e 'unknown', carregamos tudo
          await this.loadAllDatabaseReferences();
          break;
      }

      console.log(
        `📚 Carregadas ${this.allReferencedFiles.size} referências para ${category}`
      );
    } catch (error) {
      console.error('❌ Erro ao carregar referências:', error);
      throw error;
    }
  }

  // Métodos auxiliares originais mantidos...
  private async scanDirectory(
    dirPath: string,
    category: OrphanFileCategory,
    options: ScanOptions
  ): Promise<OrphanFile[]> {
    const files: OrphanFile[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.scanDirectory(
            fullPath,
            category,
            options
          );
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const file = await this.createOrphanFile(fullPath, category);

          if (this.matchesFilters(file, options)) {
            files.push(file);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao escanear diretório ${dirPath}:`, error);
    }

    return files;
  }

  private async createOrphanFile(
    filePath: string,
    category: OrphanFileCategory
  ): Promise<OrphanFile> {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const name = path.basename(filePath);
    const relativePath = filePath.replace(
      path.join(process.cwd(), 'public'),
      ''
    );
    const directory = path.dirname(relativePath);

    return {
      path: filePath,
      name,
      size: stats.size,
      lastModified: stats.mtime,
      category,
      relativePath,
      directory,
      extension: ext,
      isImage: FILE_TYPES.images.includes(ext),
      isVideo: FILE_TYPES.videos.includes(ext),
      isAudio: FILE_TYPES.audio.includes(ext),
      isPDF: ext === '.pdf',
      formattedSize: this.formatBytes(stats.size),
    };
  }

  private matchesFilters(file: OrphanFile, options: ScanOptions): boolean {
    if (options.minSize && file.size < options.minSize) return false;
    if (options.maxSize && file.size > options.maxSize) return false;
    if (options.extensions && !options.extensions.includes(file.extension))
      return false;
    if (options.olderThan && file.lastModified > options.olderThan)
      return false;
    return true;
  }

  private filterOrphanFiles(allFiles: OrphanFile[]): OrphanFile[] {
    return allFiles.filter((file) => {
      const isReferenced = this.allReferencedFiles.has(file.relativePath);

      if (!isReferenced) {
        console.log(`🔍 Órfão local encontrado: ${file.relativePath}`);
      }

      return !isReferenced;
    });
  }

  private categorizeFiles(
    files: OrphanFile[]
  ): Record<OrphanFileCategory, number> {
    const categories: Record<OrphanFileCategory, number> = {
      profiles: 0,
      composers: 0,
      scores: 0,
      advertisements: 0,
      works: 0,
      general: 0,
      unknown: 0,
      cloudinary: 0,
    };

    files.forEach((file) => {
      categories[file.category]++;
    });

    return categories;
  }

  private addReference(url: string): void {
    if (!url) return;

    // Normalizar URL - remover domínio se houver
    let cleanUrl = url;
    if (url.startsWith('http')) {
      try {
        cleanUrl = new URL(url).pathname;
      } catch {
        return; // URL inválida
      }
    }

    // Garantir que começa com /
    if (!cleanUrl.startsWith('/')) {
      cleanUrl = '/' + cleanUrl;
    }

    this.allReferencedFiles.add(cleanUrl);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Funções utilitárias atualizadas
export async function scanOrphanFiles(
  category?: OrphanFileCategory,
  options?: ScanOptions
): Promise<OrphanScanResult> {
  const scanner = new OrphanFileScanner();

  if (category) {
    return scanner.scanByCategory(category, options);
  } else {
    return scanner.scanAll(options);
  }
}

export async function removeOrphanFiles(
  filePaths: string[],
  cloudinaryPublicIds?: string[]
) {
  const scanner = new OrphanFileScanner();
  return scanner.removeOrphanFiles(filePaths, cloudinaryPublicIds);
}
