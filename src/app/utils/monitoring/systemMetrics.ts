// app/utils/monitoring/systemMetrics.ts
import os from 'os';
import { promises as fs } from 'fs';
import si from 'systeminformation';

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    load: number[];
    temperature?: number;
    speed: number;
    manufacturer: string;
    brand: string;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    available: number;
    swapUsed: number;
    swapTotal: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
    available: number;
    readSpeed: number;
    writeSpeed: number;
  };
  network: {
    interfaces: Array<{
      name: string;
      rx: number;
      tx: number;
      speed: number;
    }>;
    totalRx: number;
    totalTx: number;
    connections: number;
  };
  system: {
    uptime: number;
    processes: number;
    platform: string;
    arch: string;
    nodeVersion: string;
    hostname: string;
    loadAverage: number[];
  };
}

class SystemMonitor {
  private static instance: SystemMonitor;
  private cpuUsageCache: number = 0;
  private lastCpuCheck: number = 0;
  private diskStatsCache: any = null;
  private lastDiskCheck: number = 0;
  private networkStatsCache: any = null;
  private lastNetworkCheck: number = 0;

  private constructor() {}

  public static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  // Métricas de CPU
  private async getCPUMetrics(): Promise<SystemMetrics['cpu']> {
    const now = Date.now();

    // Cache CPU usage por 5 segundos
    if (now - this.lastCpuCheck < 5000 && this.cpuUsageCache > 0) {
      const cpuInfo = await si.cpu();
      return {
        usage: this.cpuUsageCache,
        cores: os.cpus().length,
        load: os.loadavg(),
        speed: cpuInfo.speed || 0,
        manufacturer: cpuInfo.manufacturer || 'Unknown',
        brand: cpuInfo.brand || 'Unknown',
      };
    }

    try {
      const [cpuUsage, cpuInfo, cpuTemp] = await Promise.all([
        si.currentLoad(),
        si.cpu(),
        si.cpuTemperature().catch(() => null), // Pode não estar disponível
      ]);

      this.cpuUsageCache = cpuUsage.currentLoad;
      this.lastCpuCheck = now;

      return {
        usage: cpuUsage.currentLoad,
        cores: os.cpus().length,
        load: os.loadavg(),
        temperature: cpuTemp?.main || undefined,
        speed: cpuInfo.speed || 0,
        manufacturer: cpuInfo.manufacturer || 'Unknown',
        brand: cpuInfo.brand || 'Unknown',
      };
    } catch (error) {
      console.error('Erro ao obter métricas de CPU:', error);
      return {
        usage: 0,
        cores: os.cpus().length,
        load: os.loadavg(),
        speed: 0,
        manufacturer: 'Unknown',
        brand: 'Unknown',
      };
    }
  }

  // Métricas de Memória
  private async getMemoryMetrics(): Promise<SystemMetrics['memory']> {
    try {
      const memInfo = await si.mem();

      return {
        used: Math.round((memInfo.used / 1024 / 1024 / 1024) * 100) / 100, // GB
        total: Math.round((memInfo.total / 1024 / 1024 / 1024) * 100) / 100, // GB
        percentage:
          Math.round((memInfo.used / memInfo.total) * 100 * 100) / 100,
        available:
          Math.round((memInfo.available / 1024 / 1024 / 1024) * 100) / 100, // GB
        swapUsed:
          Math.round((memInfo.swapused / 1024 / 1024 / 1024) * 100) / 100, // GB
        swapTotal:
          Math.round((memInfo.swaptotal / 1024 / 1024 / 1024) * 100) / 100, // GB
      };
    } catch (error) {
      console.error('Erro ao obter métricas de memória:', error);
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      return {
        used: Math.round((usedMem / 1024 / 1024 / 1024) * 100) / 100,
        total: Math.round((totalMem / 1024 / 1024 / 1024) * 100) / 100,
        percentage: Math.round((usedMem / totalMem) * 100 * 100) / 100,
        available: Math.round((freeMem / 1024 / 1024 / 1024) * 100) / 100,
        swapUsed: 0,
        swapTotal: 0,
      };
    }
  }

  // Métricas de Disco
  private async getDiskMetrics(): Promise<SystemMetrics['disk']> {
    const now = Date.now();

    // Cache disk stats por 30 segundos
    if (now - this.lastDiskCheck < 30000 && this.diskStatsCache) {
      return this.diskStatsCache;
    }

    try {
      const [diskLayout, diskSpace, diskIO] = await Promise.all([
        si.diskLayout(),
        si.fsSize(),
        si.disksIO().catch(() => null),
      ]);

      // Pegar o disco principal (geralmente o primeiro ou o maior)
      const mainDisk =
        diskSpace.find((disk) => disk.mount === '/' || disk.mount === 'C:') ||
        diskSpace[0];

      if (!mainDisk) {
        throw new Error('Disco principal não encontrado');
      }

      const metrics = {
        used: Math.round((mainDisk.used / 1024 / 1024 / 1024) * 100) / 100,
        total: Math.round((mainDisk.size / 1024 / 1024 / 1024) * 100) / 100,
        percentage:
          Math.round((mainDisk.used / mainDisk.size) * 100 * 100) / 100,
        available:
          Math.round(
            ((mainDisk.size - mainDisk.used) / 1024 / 1024 / 1024) * 100
          ) / 100,
        readSpeed: diskIO?.rIO || 0,
        writeSpeed: diskIO?.wIO || 0,
      };

      this.diskStatsCache = metrics;
      this.lastDiskCheck = now;

      return metrics;
    } catch (error) {
      console.error('Erro ao obter métricas de disco:', error);
      return {
        used: 0,
        total: 0,
        percentage: 0,
        available: 0,
        readSpeed: 0,
        writeSpeed: 0,
      };
    }
  }

  // Métricas de Rede
  private async getNetworkMetrics(): Promise<SystemMetrics['network']> {
    const now = Date.now();

    // Cache network stats por 10 segundos
    if (now - this.lastNetworkCheck < 10000 && this.networkStatsCache) {
      return this.networkStatsCache;
    }

    try {
      const [networkStats, networkConnections] = await Promise.all([
        si.networkStats(),
        si.networkConnections().catch(() => []),
      ]);

      const interfaces = networkStats.map((stat) => ({
        name: stat.iface,
        rx: stat.rx_bytes || 0,
        tx: stat.tx_bytes || 0,
        speed: stat.speed || 0,
      }));

      const totalRx = interfaces.reduce((sum, iface) => sum + iface.rx, 0);
      const totalTx = interfaces.reduce((sum, iface) => sum + iface.tx, 0);

      const metrics = {
        interfaces,
        totalRx,
        totalTx,
        connections: networkConnections.length,
      };

      this.networkStatsCache = metrics;
      this.lastNetworkCheck = now;

      return metrics;
    } catch (error) {
      console.error('Erro ao obter métricas de rede:', error);
      return {
        interfaces: [],
        totalRx: 0,
        totalTx: 0,
        connections: 0,
      };
    }
  }

  // Métricas do Sistema
  private async getSystemInfo(): Promise<SystemMetrics['system']> {
    try {
      const processes = await si.processes();

      return {
        uptime: os.uptime(),
        processes: processes.all || 0,
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        hostname: os.hostname(),
        loadAverage: os.loadavg(),
      };
    } catch (error) {
      console.error('Erro ao obter informações do sistema:', error);
      return {
        uptime: os.uptime(),
        processes: 0,
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        hostname: os.hostname(),
        loadAverage: os.loadavg(),
      };
    }
  }

  // Método principal para obter todas as métricas
  public async getMetrics(): Promise<SystemMetrics> {
    try {
      const [cpu, memory, disk, network, system] = await Promise.all([
        this.getCPUMetrics(),
        this.getMemoryMetrics(),
        this.getDiskMetrics(),
        this.getNetworkMetrics(),
        this.getSystemInfo(),
      ]);

      return {
        cpu,
        memory,
        disk,
        network,
        system,
      };
    } catch (error) {
      console.error('Erro ao obter métricas do sistema:', error);
      throw error;
    }
  }
}

export const systemMonitor = SystemMonitor.getInstance();
