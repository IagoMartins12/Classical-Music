// app/libs/orphanFiles/orphanFileScanner.ts
import fs from 'fs/promises';
import path from 'path';
import prisma from '@/app/libs/prismadb';

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
}

export type OrphanFileCategory =
  | 'profiles'
  | 'composers'
  | 'scores'
  | 'advertisements'
  | 'works'
  | 'general'
  | 'unknown';

interface ScanOptions {
  categories?: OrphanFileCategory[];
  includeTemp?: boolean;
  minSize?: number;
  maxSize?: number;
  extensions?: string[];
  olderThan?: Date;
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
};

// Extensões por tipo
const FILE_TYPES = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  videos: ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.mkv'],
  audio: ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac'],
  documents: ['.pdf', '.doc', '.docx'],
};

/**
 * Scanner principal de arquivos órfãos
 */
export class OrphanFileScanner {
  private uploadsRoot: string;
  private allReferencedFiles: Set<string>;

  constructor() {
    this.uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
    this.allReferencedFiles = new Set();
  }

  /**
   * Escaneamento completo por categoria
   */
  async scanByCategory(
    category: OrphanFileCategory,
    options: ScanOptions = {}
  ): Promise<OrphanScanResult> {
    const startTime = Date.now();

    console.log(`🔍 Iniciando scan de arquivos órfãos: ${category}`);

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

      const result: OrphanScanResult = {
        totalFiles: allFiles.length,
        orphanFiles,
        totalSize,
        formattedTotalSize: this.formatBytes(totalSize),
        categories,
        scanDuration: Date.now() - startTime,
        scannedDirectories,
        errors,
      };

      console.log(
        `✅ Scan concluído: ${orphanFiles.length} órfãos encontrados em ${result.scanDuration}ms`
      );

      return result;
    } catch (error) {
      console.error('❌ Erro durante scan:', error);
      throw error;
    }
  }

  /**
   * Escaneamento geral de todos os tipos
   */
  async scanAll(options: ScanOptions = {}): Promise<OrphanScanResult> {
    const startTime = Date.now();

    console.log('🔍 Iniciando scan completo de arquivos órfãos');

    try {
      // Carregar todas as referências do banco
      await this.loadAllDatabaseReferences();

      // Escanear todos os diretórios
      const allFiles: OrphanFile[] = [];
      const scannedDirectories: string[] = [];
      const errors: string[] = [];

      // Escanear cada categoria
      for (const [category, directories] of Object.entries(
        UPLOAD_DIRECTORIES
      )) {
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

      const result: OrphanScanResult = {
        totalFiles: allFiles.length,
        orphanFiles,
        totalSize,
        formattedTotalSize: this.formatBytes(totalSize),
        categories,
        scanDuration: Date.now() - startTime,
        scannedDirectories,
        errors,
      };

      console.log(
        `✅ Scan completo concluído: ${orphanFiles.length} órfãos de ${allFiles.length} arquivos`
      );

      return result;
    } catch (error) {
      console.error('❌ Erro durante scan completo:', error);
      throw error;
    }
  }

  /**
   * Remover arquivos órfãos selecionados
   */
  async removeOrphanFiles(filePaths: string[]): Promise<{
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

        console.log(`🗑️ Arquivo removido: ${filePath}`);
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
    console.log('📚 Carregando referências do banco de dados...');

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
        `📚 Carregadas ${this.allReferencedFiles.size} referências do banco`
      );
    } catch (error) {
      console.error('❌ Erro ao carregar referências:', error);
      throw error;
    }
  }

  /**
   * Carregar referências específicas por categoria
   */
  private async loadDatabaseReferences(
    category: OrphanFileCategory
  ): Promise<void> {
    console.log(`📚 Carregando referências para categoria: ${category}`);

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

  /**
   * Escanear diretório recursivamente
   */
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
          // Recursivo para subdiretórios
          const subFiles = await this.scanDirectory(
            fullPath,
            category,
            options
          );
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const file = await this.createOrphanFile(fullPath, category);

          // Aplicar filtros
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

  /**
   * Criar objeto OrphanFile a partir de um arquivo
   */
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

  /**
   * Verificar se arquivo atende aos filtros
   */
  private matchesFilters(file: OrphanFile, options: ScanOptions): boolean {
    if (options.minSize && file.size < options.minSize) return false;
    if (options.maxSize && file.size > options.maxSize) return false;
    if (options.extensions && !options.extensions.includes(file.extension))
      return false;
    if (options.olderThan && file.lastModified > options.olderThan)
      return false;

    return true;
  }

  /**
   * Filtrar arquivos órfãos
   */
  private filterOrphanFiles(allFiles: OrphanFile[]): OrphanFile[] {
    return allFiles.filter((file) => {
      const isReferenced = this.allReferencedFiles.has(file.relativePath);

      if (!isReferenced) {
        console.log(`🔍 Órfão encontrado: ${file.relativePath}`);
      }

      return !isReferenced;
    });
  }

  /**
   * Categorizar arquivos por tipo
   */
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
    };

    files.forEach((file) => {
      categories[file.category]++;
    });

    return categories;
  }

  /**
   * Adicionar referência normalizada
   */
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

  /**
   * Formatar bytes em formato legível
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Função utilitária para uso direto
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

// Função para remover arquivos
export async function removeOrphanFiles(filePaths: string[]) {
  const scanner = new OrphanFileScanner();
  return scanner.removeOrphanFiles(filePaths);
}
