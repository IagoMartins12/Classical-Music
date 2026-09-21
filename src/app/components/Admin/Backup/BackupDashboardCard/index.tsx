'use client';

import Link from 'next/link';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiHardDrive,
  FiX,
} from 'react-icons/fi';
import { useBackup } from '@/app/hooks/admin/useBackup';

/**
 * O estado do backup no painel inicial.
 *
 * Mostra **quando foi o último backup verificado**, não quando foi o último
 * que rodou: backup que subiu e não foi lido de volta não é backup, é arquivo.
 */
export default function BackupDashboardCard() {
  const backup = useBackup();

  const impedimento = backup.data?.settings.storageIssue;
  const ultimo = backup.ultimoBom;
  const ultimaFalha = backup.data?.execucoes.find(
    (execucao) => execucao.status === 'failed'
  );

  const desdeUltimo = ultimo?.verifiedAt
    ? Math.floor(
        (Date.now() - new Date(ultimo.verifiedAt).getTime()) / (1000 * 60 * 60)
      )
    : null;

  return (
    <div className="classical-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-theme-primary font-semibold flex items-center gap-2">
          <FiHardDrive className="w-4 h-4" />
          Backup
        </h3>

        <Link
          href="/admin/backup"
          className="text-brand-primary text-sm hover:underline"
        >
          Gerenciar
        </Link>
      </div>

      {impedimento ? (
        <p className="text-theme-secondary text-sm flex gap-2">
          <FiAlertTriangle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
          {impedimento}
        </p>
      ) : ultimo ? (
        <div className="space-y-1">
          <p className="text-theme-primary flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 text-accent-green" />
            <span className="font-medium">
              {desdeUltimo !== null && desdeUltimo < 24
                ? `há ${desdeUltimo}h`
                : new Date(ultimo.verifiedAt as string).toLocaleDateString(
                    'pt-BR'
                  )}
            </span>
            <span className="text-theme-tertiary text-sm">verificado</span>
          </p>
          <p className="text-theme-secondary text-sm">
            {ultimo.documentCount?.toLocaleString('pt-BR')} documentos ·{' '}
            {backup.data?.arquivos.length ?? 0} arquivo(s) guardado(s)
          </p>
        </div>
      ) : (
        <p className="text-theme-secondary text-sm flex gap-2">
          <FiAlertTriangle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
          Nenhum backup verificado ainda.
        </p>
      )}

      {ultimaFalha && (
        <p className="text-accent-red text-xs mt-3 flex gap-1.5">
          <FiX className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Última falha em{' '}
          {new Date(ultimaFalha.startedAt).toLocaleDateString('pt-BR')}
        </p>
      )}
    </div>
  );
}
