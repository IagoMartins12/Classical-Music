'use client';

import Modal from '@/app/components/Modal';
import { PiClock, PiMapPin, PiMusicNotes } from 'react-icons/pi';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Button } from '@/app/components/ui/Button';

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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4">
            <PiMusicNotes className="w-8 h-8 text-white" />
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
          <Text papel="rotulo" tom="fraco" as="div" className="mt-2">
            {sortedEvents.length} evento{sortedEvents.length !== 1 ? 's' : ''}{' '}
            encontrado{sortedEvents.length !== 1 ? 's' : ''}
          </Text>
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
                className={`w-full text-left p-4 rounded-lg transition-all hover:scale-101 border-l-4 bg-theme-elevated ${getEventBorderColor(event.type, event.isFree)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Horário */}
                    <Inline gap={2} className="mb-2">
                      <PiClock className="w-4 h-4 text-theme-tertiary flex-shrink-0" />
                      <Text papel="rotulo" tom="suave" className="font-medium">
                        {formatEventTime(event.start)}
                      </Text>
                      {event.isFree && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border">
                          Gratuito
                        </span>
                      )}
                    </Inline>

                    {/* Título */}
                    <h3 className="font-bold text-theme-primary mb-2">
                      {event.title}
                    </h3>

                    {/* Local */}
                    <Inline
                      gap={2}
                      className="text-sm text-theme-tertiary mb-2"
                    >
                      <PiMapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        {event.venue.name}
                        {event.venueDetails && ` - ${event.venueDetails}`}
                      </span>
                    </Inline>

                    {/* Compositores */}
                    {event.composers && event.composers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.composers
                          .slice(0, 3)
                          .map((composer: any, idx: number) => (
                            <Text
                              papel="legenda"
                              tom="fraco"
                              key={idx}
                              className="px-2 py-0.5 bg-theme-secondary rounded"
                            >
                              {composer.name}
                            </Text>
                          ))}
                        {event.composers.length > 3 && (
                          <Text papel="legenda" tom="fraco">
                            +{event.composers.length - 3}
                          </Text>
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
          <Button variante="secundario" type="submit" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function getEventBorderColor(type: string, isFree: boolean): string {
  if (isFree) return '';

  const colors: Record<string, string> = {
    OPERA: '',
    RECITAL: '',
    CHAMBER_MUSIC: '',
    CHOIR: '',
    OPEN_REHEARSAL: '',
    CONCERT: '',
  };

  return colors[type] || '';
}

function getEventBadgeColor(type: string, isFree: boolean): string {
  if (isFree) return '';

  const colors: Record<string, string> = {
    OPERA: '',
    RECITAL: '',
    CHAMBER_MUSIC: '',
    CHOIR: '',
    OPEN_REHEARSAL: '',
    CONCERT: '',
  };

  return colors[type] || '';
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
