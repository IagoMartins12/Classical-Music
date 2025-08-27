// app/components/Admin/Newsletter/SendTestCampaignModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  FiSend,
  FiMail,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit,
  FiSettings,
} from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Modal from '@/app/components/Modal';
import { useNewsletterAdmin } from '@/app/hooks/admin/useNewsletterAdmin';
import LoadingAdminState from '../../../Common/LoadingState';

interface SendTestCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  onSuccess?: (result: any) => void;
}

interface TestFormData {
  selectedListIds: string[];
  customVariables: {
    firstName: string;
    testMessage: string;
    customNote: string;
  };
  sendMode: 'bulk' | 'individual';
}

export default function SendTestCampaignModal({
  isOpen,
  onClose,
  campaign,
  onSuccess,
}: SendTestCampaignModalProps) {
  const { sendTestCampaign, getCampaignTestInfo } = useNewsletterAdmin();

  const [step, setStep] = useState<'form' | 'sending' | 'result'>('form');
  const [loading, setLoading] = useState(false);
  const [testInfo, setTestInfo] = useState<any>(null);
  const [sendResult, setSendResult] = useState<any>(null);

  const [formData, setFormData] = useState<TestFormData>({
    selectedListIds: [],
    customVariables: {
      firstName: 'Usuário de Teste',
      testMessage: 'Este é um email de teste da campanha',
      customNote: 'Enviado para verificação antes do envio oficial',
    },
    sendMode: 'bulk',
  });

  // Carregar informações de teste quando modal abre
  useEffect(() => {
    if (isOpen && campaign?.id) {
      loadTestInfo();
    }
  }, [isOpen, campaign?.id]);

  const loadTestInfo = async () => {
    setLoading(true);
    try {
      const info = await getCampaignTestInfo(campaign.id);
      if (info) {
        setTestInfo(info);
        // Auto-selecionar a lista mais usada se houver apenas uma
        if (info.testLists.length === 1) {
          setFormData((prev) => ({
            ...prev,
            selectedListIds: [info.testLists[0].id],
          }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleListSelection = (listId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedListIds: prev.selectedListIds.includes(listId)
        ? prev.selectedListIds.filter((id) => id !== listId)
        : [...prev.selectedListIds, listId],
    }));
  };

  const handleSelectAll = () => {
    const allListIds = testInfo?.testLists.map((list: any) => list.id) || [];
    setFormData((prev) => ({
      ...prev,
      selectedListIds:
        prev.selectedListIds.length === allListIds.length ? [] : allListIds,
    }));
  };

  const handleSendTest = async () => {
    if (formData.selectedListIds.length === 0) {
      alert('Selecione pelo menos uma lista de teste');
      return;
    }

    setStep('sending');

    try {
      const result = await sendTestCampaign(campaign.id, {
        testListIds: formData.selectedListIds,
        customVariables: formData.customVariables,
        sendMode: formData.sendMode,
      });

      if (result) {
        setSendResult(result);
        setStep('result');
        onSuccess?.(result);
      } else {
        setStep('form');
      }
    } catch (error) {
      console.error('Erro ao enviar teste:', error);
      setStep('form');
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      selectedListIds: [],
      customVariables: {
        firstName: 'Usuário de Teste',
        testMessage: 'Este é um email de teste da campanha',
        customNote: 'Enviado para verificação antes do envio oficial',
      },
      sendMode: 'bulk',
    });
    setSendResult(null);
    onClose();
  };

  const getSelectedListsInfo = () => {
    if (!testInfo) return { lists: [], totalEmails: 0 };

    const selectedLists = testInfo.testLists.filter((list: any) =>
      formData.selectedListIds.includes(list.id)
    );
    const totalEmails = selectedLists.reduce(
      (sum: number, list: any) => sum + list.totalEmails,
      0
    );

    return { lists: selectedLists, totalEmails };
  };

  const renderFormStep = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <LoadingAdminState loadingName="lista de teste" />;
        </div>
      );
    }

    if (!testInfo || testInfo.testLists.length === 0) {
      return (
        <div className="text-center py-12">
          <FiMail className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-theme-primary mb-2">
            Nenhuma Lista de Teste Encontrada
          </h3>
          <p className="text-theme-secondary mb-6">
            Você precisa criar pelo menos uma lista de teste para enviar emails.
          </p>
          <Button
            variant="primary"
            onClick={() =>
              window.open('/admin/newsletter/test-lists', '_blank')
            }
            leftIcon={<FiEdit />}
          >
            Gerenciar Listas de Teste
          </Button>
        </div>
      );
    }

    const { lists: selectedLists, totalEmails } = getSelectedListsInfo();

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-amber to-accent-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-theme-glow">
            <FiSend className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
            Enviar Teste da Campanha
          </h2>
          <p className="text-theme-secondary">
            Teste &quot;{campaign.name}&quot; antes do envio oficial
          </p>
        </div>

        {/* Campaign Info */}
        <div className="bg-theme-secondary rounded-lg p-4">
          <h4 className="font-medium text-theme-primary mb-3 flex items-center">
            <FiMail className="w-4 h-4 mr-2" />
            Informações da Campanha
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-theme-tertiary">Nome:</span>
              <span className="text-theme-primary font-medium">
                {campaign.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-tertiary">Assunto:</span>
              <span className="text-theme-primary">{campaign.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-tertiary">Template:</span>
              <span className="text-theme-primary">
                {testInfo.campaign.templateName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-theme-tertiary">Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  campaign.status === 'DRAFT'
                    ? 'bg-accent-amber/20 text-accent-amber'
                    : 'bg-accent-blue/20 text-accent-blue'
                }`}
              >
                {campaign.status === 'DRAFT' ? 'Rascunho' : campaign.status}
              </span>
            </div>
          </div>
        </div>

        {/* Test Lists Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-theme-primary flex items-center">
              <FiUsers className="w-4 h-4 mr-2" />
              Selecionar Listas de Teste ({testInfo.testLists.length})
            </h4>
            <Button variant="ghost" size="sm" onClick={handleSelectAll}>
              {formData.selectedListIds.length === testInfo.testLists.length
                ? 'Desmarcar Todos'
                : 'Selecionar Todos'}
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto border border-theme-secondary rounded-lg p-3">
            {testInfo.testLists.map((list: any) => (
              <label
                key={list.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  formData.selectedListIds.includes(list.id)
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-theme-secondary hover:border-theme-primary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.selectedListIds.includes(list.id)}
                    onChange={() => handleListSelection(list.id)}
                    className="text-brand-primary"
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: list.color }}
                  />
                  <div>
                    <div className="font-medium text-theme-primary">
                      {list.name}
                    </div>
                    {list.description && (
                      <div className="text-sm text-theme-tertiary">
                        {list.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-theme-primary">
                    {list.totalEmails} emails
                  </div>
                  <div className="text-xs text-theme-tertiary">
                    {list.timesUsed} usos
                  </div>
                </div>
              </label>
            ))}
          </div>

          {selectedLists.length > 0 && (
            <div className="mt-3 p-3 bg-brand-primary/10 border border-brand-primary rounded-lg">
              <div className="text-sm text-brand-primary">
                <strong>Selecionado:</strong> {selectedLists.length} lista(s) •{' '}
                {totalEmails} email(s) únicos
              </div>
            </div>
          )}
        </div>

        {/* Custom Variables */}
        <div>
          <h4 className="font-medium text-theme-primary mb-3 flex items-center">
            <FiSettings className="w-4 h-4 mr-2" />
            Variáveis de Teste
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome de Teste"
              type="text"
              value={formData.customVariables.firstName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customVariables: {
                    ...prev.customVariables,
                    firstName: e.target.value,
                  },
                }))
              }
            />
            <Input
              label="Mensagem de Teste"
              type="text"
              value={formData.customVariables.testMessage}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customVariables: {
                    ...prev.customVariables,
                    testMessage: e.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Nota Personalizada
            </label>
            <textarea
              value={formData.customVariables.customNote}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customVariables: {
                    ...prev.customVariables,
                    customNote: e.target.value,
                  },
                }))
              }
              rows={2}
              className="w-full px-4 py-3 bg-theme-tertiary border border-theme-secondary rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-brand-primary transition-colors resize-none"
              placeholder="Adicione uma nota sobre este teste..."
            />
          </div>
        </div>

        {/* Send Mode */}
        <div>
          <h4 className="font-medium text-theme-primary mb-3">Modo de Envio</h4>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                formData.sendMode === 'bulk'
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-theme-secondary hover:border-theme-primary'
              }`}
            >
              <input
                type="radio"
                name="sendMode"
                value="bulk"
                checked={formData.sendMode === 'bulk'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sendMode: e.target.value as any,
                  }))
                }
                className="sr-only"
              />
              <div className="text-center">
                <FiUsers className="w-6 h-6 mx-auto mb-2 text-theme-primary" />
                <div className="font-medium text-theme-primary">Lote</div>
                <div className="text-sm text-theme-tertiary">
                  Mais rápido • 1s delay
                </div>
              </div>
            </label>

            <label
              className={`cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                formData.sendMode === 'individual'
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-theme-secondary hover:border-theme-primary'
              }`}
            >
              <input
                type="radio"
                name="sendMode"
                value="individual"
                checked={formData.sendMode === 'individual'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sendMode: e.target.value as any,
                  }))
                }
                className="sr-only"
              />
              <div className="text-center">
                <FiMail className="w-6 h-6 mx-auto mb-2 text-theme-primary" />
                <div className="font-medium text-theme-primary">Individual</div>
                <div className="text-sm text-theme-tertiary">
                  Mais controle • 3s delay
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleSendTest}
            disabled={formData.selectedListIds.length === 0}
            leftIcon={<FiSend />}
          >
            Enviar Teste ({totalEmails} emails)
          </Button>
          <Button variant="ghost" size="lg" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

  const renderSendingStep = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gradient-to-br from-accent-amber to-accent-red rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow animate-pulse">
        <FiSend className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-theme-primary classical-title mb-4">
        Enviando Emails de Teste...
      </h2>
      <p className="text-theme-secondary mb-6">
        Processando envio da campanha &quot;{campaign.name}&quot;
      </p>
      <div className="w-32 h-1 bg-theme-secondary rounded-full mx-auto overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent-amber to-accent-red animate-pulse"></div>
      </div>
      <p className="text-theme-tertiary text-sm mt-4">
        Modo: {formData.sendMode === 'bulk' ? 'Lote' : 'Individual'}
      </p>
    </div>
  );

  const renderResultStep = () => {
    const isSuccess =
      sendResult?.results.successful === sendResult?.results.total;

    return (
      <div className="text-center">
        <div
          className={`w-20 h-20 bg-gradient-to-br ${
            isSuccess
              ? 'from-accent-green to-accent-blue'
              : 'from-accent-amber to-accent-red'
          } rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow`}
        >
          {isSuccess ? (
            <FiCheckCircle className="w-10 h-10 text-white" />
          ) : (
            <FiAlertCircle className="w-10 h-10 text-white" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-theme-primary classical-title mb-4">
          {isSuccess ? '✅ Teste Enviado!' : '⚠️ Envio Parcial'}
        </h2>

        <p className="text-theme-secondary mb-6">{sendResult?.message}</p>

        {/* Results Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-accent-green/10 border border-accent-green rounded-lg p-4">
            <div className="text-2xl font-bold text-accent-green">
              {sendResult?.results.successful}
            </div>
            <div className="text-sm text-accent-green">Enviados</div>
          </div>
          <div className="bg-accent-red/10 border border-accent-red rounded-lg p-4">
            <div className="text-2xl font-bold text-accent-red">
              {sendResult?.results.failed}
            </div>
            <div className="text-sm text-accent-red">Falhas</div>
          </div>
          <div className="bg-accent-blue/10 border border-accent-blue rounded-lg p-4">
            <div className="text-2xl font-bold text-accent-blue">
              {sendResult?.results.successRate}%
            </div>
            <div className="text-sm text-accent-blue">Taxa</div>
          </div>
        </div>

        {/* Metadata */}
        {sendResult?.metadata && (
          <div className="bg-theme-secondary rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-theme-primary mb-3">
              Detalhes do Envio
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-theme-tertiary">
                  Tempo de processamento:
                </span>
                <span className="text-theme-primary">
                  {(sendResult.metadata.processingTime / 1000).toFixed(1)}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-tertiary">Modo de envio:</span>
                <span className="text-theme-primary">
                  {sendResult.metadata.sendMode === 'bulk'
                    ? 'Lote'
                    : 'Individual'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-tertiary">Listas utilizadas:</span>
                <span className="text-theme-primary">
                  {sendResult.metadata.listsUsed.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Errors */}
        {sendResult?.results.errors && sendResult.results.errors.length > 0 && (
          <div className="bg-accent-red/10 border border-accent-red rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-accent-red mb-3">
              Erros Encontrados
            </h4>
            <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
              {sendResult.results.errors.map((error: string, index: number) => (
                <div key={index} className="text-accent-red">
                  {error}
                </div>
              ))}
              {sendResult.results.hasMoreErrors && (
                <div className="text-accent-red font-medium">
                  ... e mais erros
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={handleClose}
          className="w-full"
        >
          Fechar
        </Button>
      </div>
    );
  };

  const renderContent = () => {
    switch (step) {
      case 'form':
        return renderFormStep();
      case 'sending':
        return renderSendingStep();
      case 'result':
        return renderResultStep();
      default:
        return renderFormStep();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === 'sending' ? () => {} : handleClose}
      maxWidth="3xl"
      showCloseButton={step !== 'sending'}
      withouVerification
    >
      {renderContent()}
    </Modal>
  );
}
