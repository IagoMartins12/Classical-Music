// app/components/teacher/StudentInviteStatusBadge.tsx
import type { StudentInviteStatus } from '@/app/types/portal';
import React from 'react';
import {
  PiArrowsClockwise,
  PiCheckCircle,
  PiClock,
  PiEnvelopeSimple,
  PiWarningCircle,
  PiXCircle,
} from 'react-icons/pi';

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
          color: 'bg-atencao/10 text-atencao border-atencao/20',
          bgColor: 'bg-atencao/10',
          icon: PiClock,
          iconColor: 'text-atencao',
          text: 'Convite Pendente',
          shortText: 'Pendente',
          description: 'Aguardando resposta do aluno',
          actionable: true,
        };
      case 'ACCEPTED':
        return {
          color: 'bg-ok/10 text-ok border-ok/20',
          bgColor: 'bg-ok/10',
          icon: PiCheckCircle,
          iconColor: 'text-ok',
          text: 'Convite Aceito',
          shortText: 'Aceito',
          description: acceptedAt
            ? `Aceito em ${new Date(acceptedAt).toLocaleDateString('pt-BR')}`
            : 'Aluno confirmado',
          actionable: false,
        };
      case 'DECLINED':
        return {
          color: 'bg-erro/10 text-erro border-erro/20',
          bgColor: 'bg-erro/10',
          icon: PiXCircle,
          iconColor: 'text-erro',
          text: 'Convite Recusado',
          shortText: 'Recusado',
          description: declinedAt
            ? `Recusado em ${new Date(declinedAt).toLocaleDateString('pt-BR')}`
            : 'Aluno recusou o convite',
          actionable: true,
        };
      case 'EXPIRED':
        return {
          color: 'bg-linha-forte/10 text-texto-suave border-linha-forte/20',
          bgColor: 'bg-sup-2',
          icon: PiWarningCircle,
          iconColor: 'text-texto-fraco',
          text: 'Convite Expirado',
          shortText: 'Expirado',
          description: 'O convite expirou sem resposta',
          actionable: true,
        };
      default:
        return {
          color: 'bg-linha-forte/10 text-texto-suave border-linha-forte/20',
          bgColor: 'bg-sup-2',
          icon: PiWarningCircle,
          iconColor: 'text-texto-fraco',
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
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${config?.color}`}
        >
          <IconComponent className="w-3 h-3" />
          <span>{config?.shortText}</span>
        </div>

        {config?.actionable && onResendInvite && (
          <button
            onClick={onResendInvite}
            disabled={isResending}
            className="p-1.5 hover:bg-sup-1 rounded-lg transition-colors text-theme-tertiary hover:text-ouro-texto"
            title="Reenviar convite"
          >
            {isResending ? (
              <PiArrowsClockwise className="w-3 h-3 animate-spin" />
            ) : (
              <PiEnvelopeSimple className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-4 ${config?.color} ${config?.bgColor}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${config?.iconColor}`}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-sm">{config?.text}</div>
            <div className="text-xs opacity-75 mt-1">{config?.description}</div>
            {studentEmail && status === 'PENDING' && (
              <div className="text-xs opacity-60 mt-1 font-mono">
                Enviado para: {studentEmail}
              </div>
            )}
          </div>
        </div>

        {config?.actionable && onResendInvite && (
          <button
            onClick={onResendInvite}
            disabled={isResending}
            className={`px-3 py-1.5 bg-white/80 hover:bg-white rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              isResending ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'
            }`}
          >
            {isResending ? (
              <>
                <PiArrowsClockwise className="w-3 h-3 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <PiEnvelopeSimple className="w-3 h-3" />
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
        <div className="mt-3 pt-3 border-t border-atencao/50">
          <div className="text-xs text-atencao/80">
            💡 <strong>Dica:</strong> O aluno receberá um email com instruções
            para aceitar ou recusar o convite.
          </div>
        </div>
      )}

      {status === 'DECLINED' && (
        <div className="mt-3 pt-3 border-t border-erro/50">
          <div className="text-xs text-erro/80">
            💡 <strong>O que fazer:</strong> Você pode enviar um novo convite ou
            entrar em contato diretamente com o aluno.
          </div>
        </div>
      )}

      {status === 'EXPIRED' && (
        <div className="mt-3 pt-3 border-t border-linha/50">
          <div className="text-xs text-texto-suave/80">
            ⏰ <strong>Convite expirado:</strong> Envie um novo convite para que
            o aluno possa aceitar.
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInviteStatusBadge;
