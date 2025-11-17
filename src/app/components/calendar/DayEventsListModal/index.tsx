'use client';

import Modal from '@/app/components/Modal';
import { FiClock, FiMapPin, FiMusic } from 'react-icons/fi';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';

interface DayEventsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: any[];
  onEventClick: (event: any) => void;
}

export default function DayEventsListModal({
  isOpen,
  onClose,
  date,
  events,
  onEventClick,
}: DayEventsListModalProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const formatEventTime = (start: Date | string) => {
    return new Date(start).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEventClick = (event: any) => {
    onEventClick(event); // Abrir modal do evento
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={true}
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl mb-4">
            <FiMusic className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
            Eventos do Dia
          </h2>
          <p className="text-theme-secondary">
            {date.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <div className="mt-2 text-sm text-theme-tertiary">
            {sortedEvents.length} evento{sortedEvents.length !== 1 ? 's' : ''}{' '}
            encontrado{sortedEvents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Lista de Eventos */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {sortedEvents.map((event, index) => (
            <AnimatedItem
              key={event.id}
              direction="left"
              springType="smooth"
              delay={index * 0.05}
            >
              <button
                onClick={() => handleEventClick(event)}
                className={`w-full text-left p-4 rounded-lg transition-all hover:scale-101 border-l-4 bg-theme-elevated hover:bg-interactive-hover ${getEventBorderColor(event.type, event.isFree)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Horário */}
                    <div className="flex items-center space-x-2 mb-2">
                      <FiClock className="w-4 h-4 text-theme-tertiary flex-shrink-0" />
                      <span className="text-sm font-medium text-theme-secondary">
                        {formatEventTime(event.start)}
                      </span>
                      {event.isFree && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 border border-accent-green/30 text-accent-green">
                          Gratuito
                        </span>
                      )}
                    </div>

                    {/* Título */}
                    <h3 className="font-bold text-theme-primary mb-2">
                      {event.title}
                    </h3>

                    {/* Local */}
                    <div className="flex items-center space-x-2 text-sm text-theme-tertiary mb-2">
                      <FiMapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        {event.venue.name}
                        {event.venueDetails && ` - ${event.venueDetails}`}
                      </span>
                    </div>

                    {/* Compositores */}
                    {event.composers && event.composers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.composers
                          .slice(0, 3)
                          .map((composer: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-theme-secondary rounded text-xs text-theme-tertiary"
                            >
                              {composer.name}
                            </span>
                          ))}
                        {event.composers.length > 3 && (
                          <span className="text-xs text-theme-tertiary">
                            +{event.composers.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Badge do Tipo */}
                  <div
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${getEventBadgeColor(event.type, event.isFree)}`}
                  >
                    {getEventTypeLabel(event.type)}
                  </div>
                </div>
              </button>
            </AnimatedItem>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-classical-secondary">
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}

function getEventBorderColor(type: string, isFree: boolean): string {
  if (isFree) return 'border-accent-green';

  const colors: Record<string, string> = {
    OPERA: 'border-accent-purple',
    RECITAL: 'border-accent-pink',
    CHAMBER_MUSIC: 'border-accent-green',
    CHOIR: 'border-accent-orange',
    OPEN_REHEARSAL: 'border-accent-gray',
    CONCERT: 'border-accent-blue',
  };

  return colors[type] || 'border-accent-blue';
}

function getEventBadgeColor(type: string, isFree: boolean): string {
  if (isFree) return 'bg-accent-green/10 text-accent-green';

  const colors: Record<string, string> = {
    OPERA: 'bg-accent-purple/10 text-accent-purple',
    RECITAL: 'bg-accent-pink/10 text-accent-pink',
    CHAMBER_MUSIC: 'bg-accent-green/10 text-accent-green',
    CHOIR: 'bg-accent-orange/10 text-accent-orange',
    OPEN_REHEARSAL: 'bg-accent-gray/10 text-accent-gray',
    CONCERT: 'bg-accent-blue/10 text-accent-blue',
  };

  return colors[type] || 'bg-accent-blue/10 text-accent-blue';
}

function getEventTypeLabel(type: string): string {
  const types: Record<string, string> = {
    CONCERT: 'Concerto',
    RECITAL: 'Recital',
    OPERA: 'Ópera',
    CHAMBER_MUSIC: 'Câmara',
    CHOIR: 'Coral',
    OPEN_REHEARSAL: 'Ensaio',
    MATINEE: 'Matinal',
  };
  return types[type] || type;
}
