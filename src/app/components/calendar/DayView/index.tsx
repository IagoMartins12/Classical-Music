// app/blog/calendar/components/DayView.tsx
'use client';

import { PiCalendarBlank, PiClock, PiMapPin } from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface DayViewProps {
  date: Date;
  events: any[];
  onEventClick: (event: any) => void;
}

export default function DayView({ date, events, onEventClick }: DayViewProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const formatEventTime = (start: Date | string, end: Date | string) => {
    const startTime = new Date(start).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = new Date(end).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${startTime} - ${endTime}`;
  };

  return (
    <Stack gap={6}>
      <div className="text-center">
        <div className="text-2xl font-bold text-theme-primary">
          {date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      <div className="space-y-4">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <PiCalendarBlank className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-theme-primary mb-2">
              Nenhum evento neste dia
            </h3>
            <p className="text-theme-tertiary">
              Não há concertos ou eventos programados para esta data.
            </p>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`border w-full text-left p-6 rounded-lg transition-all hover:scale-105 bg-theme-elevated hover:bg-ouro/10 ${getEventBorderColor(event.type, event.isFree)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 text-theme-primary">
                    {event.title}
                  </h3>

                  <Text
                    papel="rotulo"
                    tom="suave"
                    as="div"
                    className="space-y-2"
                  >
                    <Inline gap={2}>
                      <PiClock className="w-4 h-4" />
                      <span>{formatEventTime(event.start, event.end)}</span>
                    </Inline>

                    <Inline gap={2}>
                      <PiMapPin className="w-4 h-4" />
                      <span>
                        {event.venue.name} - {event.venue.city},{' '}
                        {event.venue.state}
                      </span>
                    </Inline>

                    {event.composers && event.composers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.composers
                          .slice(0, 3)
                          .map((composer: any, index: number) => (
                            <Text
                              papel="legenda"
                              tom="suave"
                              key={index}
                              className="px-2 py-1 bg-theme-elevated rounded"
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
                  </Text>

                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        event.isFree
                          ? 'bg-ok/10 border border-ok/30 text-ok'
                          : 'bg-aviso/10 border border-aviso/30 text-aviso'
                      }`}
                    >
                      {event.isFree ? '🎫 Gratuito' : '🎫 Ingresso'}
                    </span>
                    <Text papel="legenda" tom="fraco">
                      {getEventTypeLabel(event.type)}
                    </Text>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </Stack>
  );
}

function getEventBorderColor(type: string, isFree: boolean): string {
  if (isFree) return 'border-ok';

  const colors: Record<string, string> = {
    OPERA: 'border-ouro',
    RECITAL: 'border-ouro',
    CHAMBER_MUSIC: 'border-ok',
    CHOIR: 'border-atencao',
    OPEN_REHEARSAL: 'border-accent-gray',
    CONCERT: 'border-aviso',
  };

  return colors[type] || 'border-aviso';
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
