// app/components/Admin/AdminFooter.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  FiDatabase,
  FiServer,
  FiClock,
  FiUsers,
  FiHardDrive,
} from 'react-icons/fi';

interface SystemMetric {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'error';
  icon: React.ComponentType<any>;
}

export default function AdminFooter() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      label: 'API Response',
      value: '45ms',
      status: 'good',
      icon: FiServer,
    },
    {
      label: 'Database',
      value: '12ms',
      status: 'good',
      icon: FiDatabase,
    },
    {
      label: 'Active Users',
      value: '234',
      status: 'good',
      icon: FiUsers,
    },
    {
      label: 'Memory Usage',
      value: '67%',
      status: 'warning',
      icon: FiHardDrive,
    },
  ]);

  // Atualizar horário a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simular atualização de métricas (em produção, vir de API real)
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value:
            metric.label === 'API Response'
              ? `${Math.floor(Math.random() * 50) + 20}ms`
              : metric.label === 'Database'
              ? `${Math.floor(Math.random() * 20) + 5}ms`
              : metric.label === 'Active Users'
              ? `${Math.floor(Math.random() * 100) + 200}`
              : metric.label === 'Memory Usage'
              ? `${Math.floor(Math.random() * 30) + 50}%`
              : metric.value,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-accent-green';
      case 'warning':
        return 'text-accent-amber';
      case 'error':
        return 'text-accent-red';
      default:
        return 'text-theme-tertiary';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-accent-green/20';
      case 'warning':
        return 'bg-accent-amber/20';
      case 'error':
        return 'bg-accent-red/20';
      default:
        return 'bg-theme-secondary';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <footer className="bg-theme-elevated border-t border-theme-primary">
      <div className="section-wrap">
        <div className="py-4">
          {/* Main Footer Content */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* System Metrics */}
            <div className="flex flex-wrap items-center gap-4">
              {systemMetrics.map((metric, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getStatusBg(
                    metric.status
                  )}`}
                >
                  <metric.icon
                    className={`w-4 h-4 ${getStatusColor(metric.status)}`}
                  />
                  <span className="text-sm font-medium text-theme-primary">
                    {metric.label}:
                  </span>
                  <span
                    className={`text-sm font-bold ${getStatusColor(
                      metric.status
                    )}`}
                  >
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Time and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
              {/* Current Time */}
              <div className="flex items-center space-x-2 text-theme-secondary">
                <FiClock className="w-4 h-4" />
                <div className="text-sm">
                  <span className="font-mono font-bold">
                    {formatTime(currentTime)}
                  </span>
                  <span className="ml-2 text-theme-tertiary">
                    {formatDate(currentTime)}
                  </span>
                </div>
              </div>

              {/* System Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                  <span className="text-sm text-theme-secondary">
                    Sistema Operacional
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Footer Info */}
          <div className="mt-4 pt-4 border-t border-theme-secondary flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            {/* Copyright and Version */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
              <div className="text-xs text-theme-tertiary">
                © 2024 Classical Music Platform. Todos os direitos reservados.
              </div>
              <div className="text-xs text-theme-tertiary">
                Versão 2.1.0 • Admin Panel v1.0
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex items-center space-x-4">
              <button className="text-xs text-theme-tertiary hover:text-theme-primary transition-colors">
                Documentação
              </button>
              <button className="text-xs text-theme-tertiary hover:text-theme-primary transition-colors">
                Suporte
              </button>
              <button className="text-xs text-theme-tertiary hover:text-theme-primary transition-colors">
                Changelog
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
