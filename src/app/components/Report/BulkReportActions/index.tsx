// app/components/Admin/BulkReportActions.tsx - Ações em lote para reports
'use client';

import { useState } from 'react';
import { PiCheck, PiDotsThree, PiTrash, PiX } from 'react-icons/pi';
import Button from '@/app/components/Common/Button';
import { useToast } from '@/app/hooks/useToast';
import { resolveModerations } from '@/app/requests/moderation';
import { Inline } from '@/app/components/ui/Layout';

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

  const toast = useToast();
  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedReports.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await resolveModerations(selectedReports, action);

      if (response.ok) {
        const data = response.data;
        toast.success('Sucesso', `${data.processedCount} reports processados`);
        onActionComplete();
        onClearSelection();
      } else {
        toast.error('Erro', response.error || 'Erro ao processar reports');
      }
    } catch (error) {
      console.error('Erro ao processar reports:', error);
      toast.error('Erro', 'Erro ao processar reports');
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedReports.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-theme-elevated border border-theme-primary rounded-2xl p-4 shadow-theme-glow z-50">
      <Inline gap={4}>
        <div className="text-sm font-medium text-theme-primary">
          {selectedReports.length} report(s) selecionado(s)
        </div>

        <Inline gap={2}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<PiCheck />}
            onClick={() => handleBulkAction('approve')}
            disabled={isProcessing}
          >
            Aprovar
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<PiX />}
            onClick={() => handleBulkAction('reject')}
            disabled={isProcessing}
          >
            Rejeitar
          </Button>

          <Button
            variant="delete"
            size="sm"
            leftIcon={<PiTrash />}
            onClick={() => handleBulkAction('delete')}
            disabled={isProcessing}
          >
            Deletar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<PiDotsThree />}
            onClick={onClearSelection}
          >
            Cancelar
          </Button>
        </Inline>
      </Inline>
    </div>
  );
}
