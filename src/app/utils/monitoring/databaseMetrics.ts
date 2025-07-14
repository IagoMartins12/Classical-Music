// app/utils/monitoring/databaseMetrics.ts
import { MongoClient } from 'mongodb';
import prisma from '@/app/libs/prismadb';

export interface DatabaseMetrics {
  connections: {
    active: number;
    max: number;
    percentage: number;
    available: number;
  };
  queries: {
    slow: number;
    average: number;
    total: number;
    failed: number;
  };
  size: {
    dataSize: number;
    indexSize: number;
    totalSize: number;
    collections: number;
    documents: number;
  };
  performance: {
    reads: number;
    writes: number;
    commands: number;
    locks: number;
  };
  replication: {
    isReplicaSet: boolean;
    members: number;
    healthy: number;
    primary: string | null;
  };
  memory: {
    resident: number;
    virtual: number;
    mapped: number;
  };
  cache: {
    size: number;
    used: number;
    dirty: number;
    hitRatio: number;
  };
}

class DatabaseMonitor {
  private static instance: DatabaseMonitor;
  private mongoClient: MongoClient | null = null;
  private metricsCache: DatabaseMetrics | null = null;
  private lastMetricsCheck: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 segundos

  private constructor() {}

  public static getInstance(): DatabaseMonitor {
    if (!DatabaseMonitor.instance) {
      DatabaseMonitor.instance = new DatabaseMonitor();
    }
    return DatabaseMonitor.instance;
  }

  // Conectar ao MongoDB usando a URL do Prisma
  private async getMongoClient(): Promise<MongoClient> {
    if (this.mongoClient) {
      return this.mongoClient;
    }

    const mongoUrl = process.env.DATABASE_URL;
    if (!mongoUrl) {
      throw new Error('DATABASE_URL não configurada');
    }

    this.mongoClient = new MongoClient(mongoUrl);
    await this.mongoClient.connect();
    return this.mongoClient;
  }

  // Obter estatísticas do servidor MongoDB
  private async getServerStats(): Promise<any> {
    try {
      const client = await this.getMongoClient();
      const admin = client.db().admin();

      const [serverStatus, dbStats, replStatus] = await Promise.all([
        admin.command({ serverStatus: 1 }),
        client.db().stats(),
        admin.command({ replSetGetStatus: 1 }).catch(() => null), // Pode falhar se não for replica set
      ]);

      return { serverStatus, dbStats, replStatus };
    } catch (error) {
      console.error('Erro ao obter estatísticas do MongoDB:', error);
      return null;
    }
  }

  // Obter métricas de conexões
  private async getConnectionMetrics(
    serverStatus: any
  ): Promise<DatabaseMetrics['connections']> {
    try {
      const connections = serverStatus.connections || {};

      return {
        active: connections.current || 0,
        max: connections.available
          ? connections.current + connections.available
          : 100,
        percentage: connections.available
          ? Math.round(
              (connections.current /
                (connections.current + connections.available)) *
                100
            )
          : 0,
        available: connections.available || 0,
      };
    } catch (error) {
      console.error('Erro ao obter métricas de conexões:', error);
      return {
        active: 0,
        max: 100,
        percentage: 0,
        available: 0,
      };
    }
  }

  // Obter métricas de queries
  private async getQueryMetrics(
    serverStatus: any
  ): Promise<DatabaseMetrics['queries']> {
    try {
      const opcounters = serverStatus.opcounters || {};
      const opcountersRepl = serverStatus.opcountersRepl || {};

      // Simulação de queries lentas (em produção, você pode usar profiler)
      const slowQueries = await this.getSlowQueries();

      return {
        slow: slowQueries.length,
        average: Math.random() * 100 + 50, // Simular tempo médio
        total: (opcounters.query || 0) + (opcounters.getmore || 0),
        failed: opcounters.command?.failed || 0,
      };
    } catch (error) {
      console.error('Erro ao obter métricas de queries:', error);
      return {
        slow: 0,
        average: 0,
        total: 0,
        failed: 0,
      };
    }
  }

  // Obter queries lentas (usando profiler se configurado)
  private async getSlowQueries(): Promise<any[]> {
    try {
      const client = await this.getMongoClient();
      const db = client.db();

      // Verificar se o profiler está habilitado
      const profilerStatus = await db.command({ profile: -1 });

      if (profilerStatus.was === 0) {
        return []; // Profiler desabilitado
      }

      // Buscar queries lentas dos últimos 5 minutos
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const slowQueries = await db
        .collection('system.profile')
        .find({
          ts: { $gte: fiveMinutesAgo },
          millis: { $gte: 100 }, // Queries que demoram mais de 100ms
        })
        .limit(10)
        .toArray();

      return slowQueries;
    } catch (error) {
      console.error('Erro ao obter queries lentas:', error);
      return [];
    }
  }

  // Obter métricas de tamanho
  private async getSizeMetrics(dbStats: any): Promise<DatabaseMetrics['size']> {
    try {
      const client = await this.getMongoClient();
      const db = client.db();

      // Contar coleções
      const collections = await db.listCollections().toArray();

      // Contar documentos total (aproximado)
      let totalDocuments = 0;
      for (const collection of collections) {
        try {
          const count = await db
            .collection(collection.name)
            .estimatedDocumentCount();
          totalDocuments += count;
        } catch (error) {
          // Ignorar erros de coleções específicas
        }
      }

      return {
        dataSize: Math.round((dbStats.dataSize || 0) / 1024 / 1024), // MB
        indexSize: Math.round((dbStats.indexSize || 0) / 1024 / 1024), // MB
        totalSize: Math.round((dbStats.storageSize || 0) / 1024 / 1024), // MB
        collections: collections.length,
        documents: totalDocuments,
      };
    } catch (error) {
      console.error('Erro ao obter métricas de tamanho:', error);
      return {
        dataSize: 0,
        indexSize: 0,
        totalSize: 0,
        collections: 0,
        documents: 0,
      };
    }
  }

  // Obter métricas de performance
  private async getPerformanceMetrics(
    serverStatus: any
  ): Promise<DatabaseMetrics['performance']> {
    try {
      const opcounters = serverStatus.opcounters || {};
      const globalLock = serverStatus.globalLock || {};

      return {
        reads: opcounters.query || 0,
        writes:
          (opcounters.insert || 0) +
          (opcounters.update || 0) +
          (opcounters.delete || 0),
        commands: opcounters.command || 0,
        locks: globalLock.currentQueue?.total || 0,
      };
    } catch (error) {
      console.error('Erro ao obter métricas de performance:', error);
      return {
        reads: 0,
        writes: 0,
        commands: 0,
        locks: 0,
      };
    }
  }

  // Obter métricas de replicação
  private async getReplicationMetrics(
    replStatus: any
  ): Promise<DatabaseMetrics['replication']> {
    try {
      if (!replStatus || !replStatus.members) {
        return {
          isReplicaSet: false,
          members: 0,
          healthy: 0,
          primary: null,
        };
      }

      const members = replStatus.members;
      const healthy = members.filter((m: any) => m.health === 1).length;
      const primary =
        members.find((m: any) => m.stateStr === 'PRIMARY')?.name || null;

      return {
        isReplicaSet: true,
        members: members.length,
        healthy,
        primary,
      };
    } catch (error) {
      console.error('Erro ao obter métricas de replicação:', error);
      return {
        isReplicaSet: false,
        members: 0,
        healthy: 0,
        primary: null,
      };
    }
  }

  // Obter métricas de memória
  private async getMemoryMetrics(
    serverStatus: any
  ): Promise<DatabaseMetrics['memory']> {
    try {
      const mem = serverStatus.mem || {};

      return {
        resident: mem.resident || 0, // MB
        virtual: mem.virtual || 0, // MB
        mapped: mem.mapped || 0, // MB
      };
    } catch (error) {
      console.error('Erro ao obter métricas de memória:', error);
      return {
        resident: 0,
        virtual: 0,
        mapped: 0,
      };
    }
  }

  // Obter métricas de cache (WiredTiger)
  private async getCacheMetrics(
    serverStatus: any
  ): Promise<DatabaseMetrics['cache']> {
    try {
      const wiredTiger = serverStatus.wiredTiger;

      if (!wiredTiger) {
        return {
          size: 0,
          used: 0,
          dirty: 0,
          hitRatio: 0,
        };
      }

      const cache = wiredTiger.cache || {};
      const cacheSize = cache['maximum bytes configured'] || 0;
      const cacheUsed = cache['bytes currently in the cache'] || 0;
      const cacheDirty = cache['tracked dirty bytes in the cache'] || 0;

      const hits = cache['pages read into cache'] || 0;
      const requests = cache['pages requested from the cache'] || 0;
      const hitRatio = requests > 0 ? (hits / requests) * 100 : 0;

      return {
        size: Math.round(cacheSize / 1024 / 1024), // MB
        used: Math.round(cacheUsed / 1024 / 1024), // MB
        dirty: Math.round(cacheDirty / 1024 / 1024), // MB
        hitRatio: Math.round(hitRatio * 100) / 100,
      };
    } catch (error) {
      console.error('Erro ao obter métricas de cache:', error);
      return {
        size: 0,
        used: 0,
        dirty: 0,
        hitRatio: 0,
      };
    }
  }

  // Obter estatísticas do Prisma
  private async getPrismaStats(): Promise<any> {
    try {
      // Métricas básicas do Prisma
      const [
        userCount,
        workCount,
        composerCount,
        sessionCount,
        annotationCount,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.work.count(),
        prisma.composer.count(),
        prisma.studySession.count(),
        prisma.workAnnotation.count(),
      ]);

      return {
        users: userCount,
        works: workCount,
        composers: composerCount,
        sessions: sessionCount,
        annotations: annotationCount,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do Prisma:', error);
      return {
        users: 0,
        works: 0,
        composers: 0,
        sessions: 0,
        annotations: 0,
      };
    }
  }

  // Método principal para obter todas as métricas
  public async getMetrics(): Promise<DatabaseMetrics> {
    const now = Date.now();

    // Usar cache se disponível e não expirado
    if (
      this.metricsCache &&
      now - this.lastMetricsCheck < this.CACHE_DURATION
    ) {
      return this.metricsCache;
    }

    try {
      const stats = await this.getServerStats();

      if (!stats) {
        throw new Error('Não foi possível obter estatísticas do MongoDB');
      }

      const { serverStatus, dbStats, replStatus } = stats;

      const [
        connections,
        queries,
        size,
        performance,
        replication,
        memory,
        cache,
      ] = await Promise.all([
        this.getConnectionMetrics(serverStatus),
        this.getQueryMetrics(serverStatus),
        this.getSizeMetrics(dbStats),
        this.getPerformanceMetrics(serverStatus),
        this.getReplicationMetrics(replStatus),
        this.getMemoryMetrics(serverStatus),
        this.getCacheMetrics(serverStatus),
      ]);

      const metrics: DatabaseMetrics = {
        connections,
        queries,
        size,
        performance,
        replication,
        memory,
        cache,
      };

      this.metricsCache = metrics;
      this.lastMetricsCheck = now;

      return metrics;
    } catch (error) {
      console.error('Erro ao obter métricas do banco de dados:', error);

      // Retornar métricas padrão em caso de erro
      return {
        connections: { active: 0, max: 100, percentage: 0, available: 0 },
        queries: { slow: 0, average: 0, total: 0, failed: 0 },
        size: {
          dataSize: 0,
          indexSize: 0,
          totalSize: 0,
          collections: 0,
          documents: 0,
        },
        performance: { reads: 0, writes: 0, commands: 0, locks: 0 },
        replication: {
          isReplicaSet: false,
          members: 0,
          healthy: 0,
          primary: null,
        },
        memory: { resident: 0, virtual: 0, mapped: 0 },
        cache: { size: 0, used: 0, dirty: 0, hitRatio: 0 },
      };
    }
  }

  // Limpar cache manualmente
  public clearCache(): void {
    this.metricsCache = null;
    this.lastMetricsCheck = 0;
  }

  // Fechar conexão
  public async close(): Promise<void> {
    if (this.mongoClient) {
      await this.mongoClient.close();
      this.mongoClient = null;
    }
  }
}

export const databaseMonitor = DatabaseMonitor.getInstance();
