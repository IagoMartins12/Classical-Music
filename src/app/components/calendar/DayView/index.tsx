// app/blog/calendar/components/DayView.tsx
'use client';

import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';

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
    <div>
      <div className="text-center mb-6">
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
            <FiCalendar className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
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
              className={`w-full text-left p-6 rounded-lg transition-all hover:scale-105 border-l-4 bg-theme-elevated hover:bg-interactive-hover ${getEventBorderColor(event.type, event.isFree)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 text-theme-primary">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-sm text-theme-secondary">
                    <div className="flex items-center space-x-2">
                      <FiClock className="w-4 h-4" />
                      <span>{formatEventTime(event.start, event.end)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FiMapPin className="w-4 h-4" />
                      <span>
                        {event.venue.name} - {event.venue.city},{' '}
                        {event.venue.state}
                      </span>
                    </div>

                    {event.composers && event.composers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.composers
                          .slice(0, 3)
                          .map((composer: any, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-theme-elevated rounded text-xs text-theme-secondary"
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

                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        event.isFree
                          ? 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
                          : 'bg-accent-blue/10 border border-accent-blue/30 text-accent-blue'
                      }`}
                    >
                      {event.isFree ? '🎫 Gratuito' : '🎫 Ingresso'}
                    </span>
                    <span className="text-xs text-theme-tertiary">
                      {getEventTypeLabel(event.type)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
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
