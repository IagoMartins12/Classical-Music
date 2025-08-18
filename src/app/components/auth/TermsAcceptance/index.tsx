// components/auth/TermsAcceptance.tsx
'use client';

import React, { useState } from 'react';
import {
  FiCheckSquare,
  FiSquare,
  FiShield,
  FiFileText,
  FiAlertCircle,
} from 'react-icons/fi';
import Modal from '../../Modal';

interface TermsAcceptanceProps {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  error?: string;
  disabled?: boolean;
}

interface TermsContent {
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
}

const TermsAcceptance: React.FC<TermsAcceptanceProps> = ({
  accepted,
  onChange,
  error,
  disabled = false,
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleCheckboxChange = () => {
    if (!disabled) {
      onChange(!accepted);
    }
  };

  const privacyContent: TermsContent = {
    title: 'Política de Privacidade',
    icon: <FiShield className="w-5 h-5 text-brand-primary" />,
    content: (
      <div className="space-y-6 text-sm text-theme-secondary leading-relaxed">
        <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4">
          <h4 className="font-semibold text-accent-blue mb-2 flex items-center">
            <FiShield className="w-4 h-4 mr-2" />
            Resumo da Nossa Política
          </h4>
          <p className="text-accent-blue/90">
            Protegemos seus dados pessoais conforme a Lei Geral de Proteção de
            Dados (LGPD). Coletamos apenas informações necessárias para oferecer
            nossos serviços educacionais de música clássica.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-theme-primary mb-3">
            📝 Dados que Coletamos
          </h4>
          <ul className="space-y-2 ml-4">
            <li>
              • <strong>Cadastro:</strong> Nome, email, preferências musicais
            </li>
            <li>
              • <strong>Uso:</strong> Favoritos, anotações, progresso de estudos
            </li>
            <li>
              • <strong>Técnicos:</strong> Cookies essenciais, dados de
              navegação
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-theme-primary mb-3">
            🎯 Como Usamos
          </h4>
          <ul className="space-y-2 ml-4">
            <li>• Personalizar sua experiência de aprendizado</li>
            <li>• Manter segurança da plataforma</li>
            <li>• Enviar atualizações importantes (opcional)</li>
            <li>• Gerar estatísticas anônimas para melhorias</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-theme-primary mb-3">
            🛡️ Seus Direitos LGPD
          </h4>
          <div className="bg-accent-green/10 border border-accent-green/30 rounded-lg p-3">
            <ul className="space-y-1 text-accent-green">
              <li>
                ✓ <strong>Acesso:</strong> Ver seus dados
              </li>
              <li>
                ✓ <strong>Correção:</strong> Corrigir informações
              </li>
              <li>
                ✓ <strong>Exclusão:</strong> Deletar sua conta
              </li>
              <li>
                ✓ <strong>Portabilidade:</strong> Exportar dados
              </li>
              <li>
                ✓ <strong>Revogação:</strong> Retirar consentimento
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-theme-primary mb-3">
            🔒 Segurança
          </h4>
          <ul className="space-y-2 ml-4">
            <li>• Criptografia SSL/TLS para proteção</li>
            <li>• Senhas com hash seguro</li>
            <li>• Backups regulares e seguros</li>
            <li>• Monitoramento de segurança 24/7</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-theme-primary mb-3">
            ⏱️ Retenção de Dados
          </h4>
          <ul className="space-y-2 ml-4">
            <li>
              • <strong>Dados de conta:</strong> Até exclusão da conta
            </li>
            <li>
              • <strong>Dados de uso:</strong> Até exclusão da conta
            </li>
            <li>
              • <strong>Cookies técnicos:</strong> 90 dias
            </li>
            <li>
              • <strong>Anotações públicas:</strong> Podem ser mantidas
              anonimizadas
            </li>
          </ul>
        </div>

        <div className="bg-accent-amber/10 border border-accent-amber/30 rounded-lg p-4">
          <h4 className="font-semibold text-accent-amber mb-2">
            📧 Contato DPO
          </h4>
          <p className="text-accent-amber/90">
            Dúvidas sobre privacidade? Entre em contato:
            <br />
            <strong>privacidade@opusatlas.com</strong>
          </p>
        </div>
      </div>
    ),
  };

  const termsContent: TermsContent = {
    title: 'Termos de Uso',
    icon: <FiFileText className="w-5 h-5 text-brand-primary" />,
    content: (
      <div className="space-y-6 text-sm text-theme-secondary leading-relaxed">
        <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-lg p-4">
          <h4 className="font-semibold text-accent-purple mb-2 flex items-center">
            <FiFileText className="w-4 h-4 mr-2" />
            Resumo dos Termos
          </h4>
          <p className="text-accent-purple/90">
            O Opus Atlas é uma plataforma educacional de música clássica. Ao
            usar nosso serviço, você concorda em ser respeitoso com a comunidade
            e usar o conteúdo responsavelmente.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-theme-primary mb-3">
            ✅ Uso Permitido
          </h4>
          <ul className="space-y-2 ml-4">
            <li>• Explorar compositores, obras e partituras</li>
            <li>• Fazer anotações pessoais e de estudo</li>
            <li>• Participar respeitosamente da comunidade</li>
            <li>• Usar ferramentas educacionais disponíveis</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-theme-primary mb-3">
            ❌ Uso Proibido
          </h4>
          <ul className="space-y-2 ml-4">
            <li>• Atividades comerciais não autorizadas</li>
            <li>• Spam ou conteúdo inadequado</li>
            <li>• Violação de direitos autorais</li>
            <li>• Comportamento ofensivo ou discriminatório</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-theme-primary mb-3">📚 Conteúdo</h4>
          <ul className="space-y-2 ml-4">
            <li>
              • Partituras provêm principalmente do IMSLP (domínio público)
            </li>
            <li>• Você mantém direitos sobre suas anotações pessoais</li>
            <li>• Uploads passam por moderação</li>
            <li>• Sistema de pontuação recompensa qualidade</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-theme-primary mb-3">
            ⭐ Sistema de Favoritos
          </h4>
          <ul className="space-y-2 ml-4">
            <li>• Organize compositores, obras e partituras</li>
            <li>• Anotações podem ser privadas ou públicas</li>
            <li>• Anotações públicas devem ser educativas</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-theme-primary mb-3">
            🛡️ Responsabilidades
          </h4>
          <div className="bg-accent-amber/10 border border-accent-amber/30 rounded-lg p-3">
            <ul className="space-y-1 text-accent-amber">
              <li>• Manter segurança da sua conta</li>
              <li>• Ser respeitoso com outros usuários</li>
              <li>• Não burlar sistemas de moderação</li>
              <li>• Colaborar construtivamente</li>
            </ul>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-theme-primary mb-3">
            ⚖️ Suspensão e Encerramento
          </h4>
          <ul className="space-y-2 ml-4">
            <li>• Podemos suspender contas por violação dos termos</li>
            <li>• Você pode encerrar sua conta a qualquer momento</li>
            <li>• Anotações públicas podem permanecer na plataforma</li>
          </ul>
        </div>

        <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4">
          <h4 className="font-semibold text-accent-red mb-2">⚠️ Limitações</h4>
          <p className="text-accent-red/90">
            A plataforma é fornecida &quot;como está&quot;. Não garantimos
            precisão absoluta de todas as informações musicais. Use por sua
            conta e risco.
          </p>
        </div>
      </div>
    ),
  };

  return (
    <>
      <div className="space-y-3">
        <div
          className={`
            flex items-start space-x-3 p-4 rounded-lg  transition-all cursor-pointer
            ${accepted ? 'bg-accent-green/5' : 'bg-theme-secondary/20 '}
            ${error ? 'border-red-500 border' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={handleCheckboxChange}
        >
          <div className="flex items-center">
            {accepted ? (
              <FiCheckSquare className="w-5 h-5 text-accent-green" />
            ) : (
              <FiSquare className="w-5 h-5 text-theme-tertiary" />
            )}
          </div>

          <div className="flex-1 flex-nowrap min-w-0">
            <p className="text-sm text-theme-secondary whitespace-nowrap">
              Li e aceito os{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTermsModal(true);
                }}
                className="text-brand-primary hover:text-brand-secondary font-medium underline inline-flex items-center"
                disabled={disabled}
              >
                Termos de Uso
              </button>{' '}
              e a{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPrivacyModal(true);
                }}
                className="text-brand-primary hover:text-brand-secondary font-medium underline inline-flex items-center"
                disabled={disabled}
              >
                Política de Privacidade
              </button>{' '}
            </p>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="flex items-center space-x-2 text-red-500 text-sm">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Modal da Política de Privacidade */}
      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title={privacyContent.title}
        maxWidth="3xl"
        showCloseButton={true}
      >
        <div className="flex items-center space-x-3 mb-6">
          {privacyContent.icon}
          <div>
            <h3 className="text-lg font-semibold text-theme-primary">
              Política de Privacidade - Opus Atlas
            </h3>
            <p className="text-sm text-theme-tertiary">
              Última atualização: Janeiro de 2025 • Conforme LGPD
            </p>
          </div>
        </div>
        {privacyContent.content}
      </Modal>

      {/* Modal dos Termos de Uso */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title={termsContent.title}
        maxWidth="3xl"
        showCloseButton={true}
      >
        <div className="flex items-center space-x-3 mb-6">
          {termsContent.icon}
          <div>
            <h3 className="text-lg font-semibold text-theme-primary">
              Termos de Uso - Opus Atlas
            </h3>
            <p className="text-sm text-theme-tertiary">
              Última atualização: Janeiro de 2025
            </p>
          </div>
        </div>
        {termsContent.content}
      </Modal>
    </>
  );
};

export default TermsAcceptance;
