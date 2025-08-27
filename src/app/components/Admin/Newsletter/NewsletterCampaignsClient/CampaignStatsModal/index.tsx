import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import { useState } from 'react';
import { FiBarChart2, FiClock, FiUsers, FiX } from 'react-icons/fi';

// app/admin/newsletter/components/CampaignStatsModal.tsx
interface CampaignStatsModalProps {
  campaign: any;
  onClose: () => void;
}

export function CampaignStatsModal({
  campaign,
  onClose,
}: CampaignStatsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: FiBarChart2 },
    { id: 'engagement', label: 'Engajamento', icon: FiUsers },
    { id: 'timeline', label: 'Timeline', icon: FiClock },
  ];

  const stats = {
    sent: campaign.emailsSent || 0,
    delivered: campaign.emailsDelivered || 0,
    opened: campaign.emailsOpened || 0,
    clicked: campaign.emailsClicked || 0,
    bounced: campaign.emailsBounced || 0,
    unsubscribed: campaign.emailsUnsubscribed || 0,
  };

  const rates = {
    deliveryRate: stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0,
    openRate: stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0,
    clickRate: stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0,
    bounceRate: stats.sent > 0 ? (stats.bounced / stats.sent) * 100 : 0,
    unsubscribeRate:
      stats.delivered > 0 ? (stats.unsubscribed / stats.delivered) * 100 : 0,
  };

  return (
    <Modal onClose={onClose} isOpen maxWidth="4xl">
      <div className="bg-theme-elevated">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
          <div>
            <h2 className="text-xl font-bold text-theme-primary">
              {campaign.name}
            </h2>
            <p className="text-theme-secondary">{campaign.subject}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-theme-secondary">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-white'
                    : 'text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Main Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-theme-secondary p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-theme-primary">
                    {stats.sent.toLocaleString()}
                  </div>
                  <div className="text-sm text-theme-tertiary">Enviados</div>
                </div>
                <div className="bg-theme-secondary p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-accent-green">
                    {stats.delivered.toLocaleString()}
                  </div>
                  <div className="text-sm text-theme-tertiary">Entregues</div>
                  <div className="text-xs text-accent-green">
                    {rates.deliveryRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-theme-secondary p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-accent-blue">
                    {stats.opened.toLocaleString()}
                  </div>
                  <div className="text-sm text-theme-tertiary">Abertos</div>
                  <div className="text-xs text-accent-blue">
                    {rates.openRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-theme-secondary p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-accent-purple">
                    {stats.clicked.toLocaleString()}
                  </div>
                  <div className="text-sm text-theme-tertiary">Cliques</div>
                  <div className="text-xs text-accent-purple">
                    {rates.clickRate.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Performance Comparison */}
              <div className="bg-theme-secondary p-6 rounded-lg">
                <h3 className="font-bold text-theme-primary mb-4">
                  Performance vs Média
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-theme-secondary">
                      Taxa de Abertura
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-theme-primary rounded-full h-2">
                        <div
                          className="bg-accent-blue h-2 rounded-full"
                          style={{ width: `${Math.min(rates.openRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {rates.openRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme-secondary">
                      Taxa de Cliques
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-theme-primary rounded-full h-2">
                        <div
                          className="bg-accent-purple h-2 rounded-full"
                          style={{
                            width: `${Math.min(rates.clickRate, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {rates.clickRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-theme-secondary p-6 rounded-lg">
                  <h3 className="font-bold text-theme-primary mb-4">
                    Problemas de Entrega
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Bounces</span>
                      <span className="text-accent-red">
                        {stats.bounced} ({rates.bounceRate.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Descadastros</span>
                      <span className="text-accent-amber">
                        {stats.unsubscribed} ({rates.unsubscribeRate.toFixed(1)}
                        %)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-theme-secondary p-6 rounded-lg">
                  <h3 className="font-bold text-theme-primary mb-4">
                    Informações da Campanha
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Status</span>
                      <span className="text-theme-primary">
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Criada em</span>
                      <span className="text-theme-primary">
                        {new Date(campaign.createdAt).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                    </div>
                    {campaign.sentAt && (
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Enviada em</span>
                        <span className="text-theme-primary">
                          {new Date(campaign.sentAt).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'engagement' && (
            <div className="space-y-6">
              <div className="bg-theme-secondary p-6 rounded-lg">
                <h3 className="font-bold text-theme-primary mb-4">
                  Engajamento por Tempo
                </h3>
                <p className="text-theme-tertiary">
                  Gráfico de engajamento ao longo do tempo seria implementado
                  aqui
                </p>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="bg-theme-secondary p-6 rounded-lg">
                <h3 className="font-bold text-theme-primary mb-4">
                  Timeline da Campanha
                </h3>
                <div className="space-y-4">
                  {campaign.events
                    ?.slice(0, 10)
                    .map((event: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 text-sm"
                      >
                        <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                        <span className="text-theme-tertiary">
                          {new Date(event.timestamp).toLocaleString('pt-BR')}
                        </span>
                        <span className="text-theme-primary">
                          {event.eventType}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-theme-secondary">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
