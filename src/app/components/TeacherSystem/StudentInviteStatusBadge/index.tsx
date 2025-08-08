// app/components/teacher/StudentInviteStatusBadge.tsx
import { StudentInviteStatus } from '@prisma/client';
import React from 'react';
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiMail,
} from 'react-icons/fi';

interface StudentInviteStatusBadgeProps {
  status?: StudentInviteStatus | null;
  acceptedAt?: Date | string | null;
  declinedAt?: Date | string | null;
  studentEmail?: string | null;
  onResendInvite?: () => void;
  isResending?: boolean;
  compact?: boolean;
}

const StudentInviteStatusBadge: React.FC<StudentInviteStatusBadgeProps> = ({
  status,
  acceptedAt,
  declinedAt,
  studentEmail,
  onResendInvite,
  isResending = false,
  compact = false,
}) => {
  const getStatusConfig = (status: string | null | undefined) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          bgColor: 'bg-amber-50',
          icon: FiClock,
          iconColor: 'text-amber-500',
          text: 'Convite Pendente',
          shortText: 'Pendente',
          description: 'Aguardando resposta do aluno',
          actionable: true,
        };
      case 'ACCEPTED':
        return {
          color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          bgColor: 'bg-emerald-50',
          icon: FiCheckCircle,
          iconColor: 'text-emerald-500',
          text: 'Convite Aceito',
          shortText: 'Aceito',
          description: acceptedAt
            ? `Aceito em ${new Date(acceptedAt).toLocaleDateString('pt-BR')}`
            : 'Aluno confirmado',
          actionable: false,
        };
      case 'DECLINED':
        return {
          color: 'bg-red-500/10 text-red-600 border-red-500/20',
          bgColor: 'bg-red-50',
          icon: FiXCircle,
          iconColor: 'text-red-500',
          text: 'Convite Recusado',
          shortText: 'Recusado',
          description: declinedAt
            ? `Recusado em ${new Date(declinedAt).toLocaleDateString('pt-BR')}`
            : 'Aluno recusou o convite',
          actionable: true,
        };
      case 'EXPIRED':
        return {
          color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
          bgColor: 'bg-gray-50',
          icon: FiAlertCircle,
          iconColor: 'text-gray-500',
          text: 'Convite Expirado',
          shortText: 'Expirado',
          description: 'O convite expirou sem resposta',
          actionable: true,
        };
      default:
        return {
          color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
          bgColor: 'bg-gray-50',
          icon: FiAlertCircle,
          iconColor: 'text-gray-500',
          text: 'Status Desconhecido',
          shortText: 'Desconhecido',
          description: 'Status não identificado',
          actionable: false,
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
        >
          <IconComponent className="w-3 h-3" />
          <span>{config.shortText}</span>
        </div>

        {config.actionable && onResendInvite && (
          <button
            onClick={onResendInvite}
            disabled={isResending}
            className="p-1.5 hover:bg-theme-secondary rounded-lg transition-colors text-theme-tertiary hover:text-brand-primary"
            title="Reenviar convite"
          >
            {isResending ? (
              <FiRefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <FiMail className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${config.color} ${config.bgColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${config.iconColor}`}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-sm">{config.text}</div>
            <div className="text-xs opacity-75 mt-1">{config.description}</div>
            {studentEmail && status === 'PENDING' && (
              <div className="text-xs opacity-60 mt-1 font-mono">
                Enviado para: {studentEmail}
              </div>
            )}
          </div>
        </div>

        {config.actionable && onResendInvite && (
          <button
            onClick={onResendInvite}
            disabled={isResending}
            className={`px-3 py-1.5 bg-white/80 hover:bg-white rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              isResending ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'
            }`}
          >
            {isResending ? (
              <>
                <FiRefreshCw className="w-3 h-3 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <FiMail className="w-3 h-3" />
                <span>
                  {status === 'PENDING'
                    ? 'Reenviar'
                    : status === 'DECLINED'
                    ? 'Novo Convite'
                    : 'Reenviar'}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Informações adicionais baseadas no status */}
      {status === 'PENDING' && (
        <div className="mt-3 pt-3 border-t border-amber-200/50">
          <div className="text-xs text-amber-700/80">
            💡 <strong>Dica:</strong> O aluno receberá um email com instruções
            para aceitar ou recusar o convite.
          </div>
        </div>
      )}

      {status === 'DECLINED' && (
        <div className="mt-3 pt-3 border-t border-red-200/50">
          <div className="text-xs text-red-700/80">
            💡 <strong>O que fazer:</strong> Você pode enviar um novo convite ou
            entrar em contato diretamente com o aluno.
          </div>
        </div>
      )}

      {status === 'EXPIRED' && (
        <div className="mt-3 pt-3 border-t border-gray-200/50">
          <div className="text-xs text-gray-700/80">
            ⏰ <strong>Convite expirado:</strong> Envie um novo convite para que
            o aluno possa aceitar.
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInviteStatusBadge;
