// app/components/Admin/BulkReportActions.tsx - Ações em lote para reports
'use client';

import { useState } from 'react';
import { FiCheck, FiX, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import { useNotifications } from '@/app/hooks/useNotifications';

interface BulkReportActionsProps {
  selectedReports: string[];
  onActionComplete: () => void;
  onClearSelection: () => void;
}

export default function BulkReportActions({
  selectedReports,
  onActionComplete,
  onClearSelection,
}: BulkReportActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { notifySuccess, notifyError } = useNotifications();

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedReports.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/reports/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportIds: selectedReports,
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        notifySuccess('Sucesso', `${data.processedCount} reports processados`);
        onActionComplete();
        onClearSelection();
      } else {
        const error = await response.json();
        notifyError('Erro', error.error || 'Erro ao processar reports');
      }
    } catch (error) {
      console.error('Erro ao processar reports:', error);
      notifyError('Erro', 'Erro ao processar reports');
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedReports.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-theme-elevated border border-theme-primary rounded-2xl p-4 shadow-theme-glow z-50">
      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium text-theme-primary">
          {selectedReports.length} report(s) selecionado(s)
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FiCheck />}
            onClick={() => handleBulkAction('approve')}
            disabled={isProcessing}
          >
            Aprovar
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FiX />}
            onClick={() => handleBulkAction('reject')}
            disabled={isProcessing}
          >
            Rejeitar
          </Button>

          <Button
            variant="delete"
            size="sm"
            leftIcon={<FiTrash2 />}
            onClick={() => handleBulkAction('delete')}
            disabled={isProcessing}
          >
            Deletar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FiMoreHorizontal />}
            onClick={onClearSelection}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
