'use client';

import { Text } from '@/app/components/ui/Text';
interface MonthViewProps {
  days: Date[];
  currentDate: Date;
  getEventsForDay: (date: Date) => any[];
  onEventClick: (event: any) => void;
  onDayClick: (date: Date, events: any[]) => void; // ✅ NOVO
  weekdays: string[];
}

export default function MonthView({
  days,
  currentDate,
  getEventsForDay,
  onEventClick,
  onDayClick, // ✅ NOVO
  weekdays,
}: MonthViewProps) {
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day) => (
          <Text
            papel="rotulo"
            tom="fraco"
            as="div"
            key={day}
            className="p-3 text-center font-semibold"
          >
            {day}
          </Text>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          const isCurrentMonth = day.getMonth() === currentMonth;
          const events = getEventsForDay(day);
          const hasMoreThan2Events = events.length > 2; // ✅ VERIFICAR

          return (
            <div
              key={index}
              className={`min-h-24 p-2 border rounded-lg transition-all ${
                isToday ? '' : isCurrentMonth ? '' : 'opacity-60'
              }`}
            >
              {/* Day number */}
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday
                    ? 'text-ouro-texto'
                    : isCurrentMonth
                      ? 'text-theme-primary'
                      : 'text-theme-tertiary'
                }`}
              >
                {day.getDate()}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {events.slice(0, 2).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`w-full text-left p-1 rounded text-xs font-medium transition-all hover:scale-105 ${getEventColor(event.type, event.isFree)}`}
                  >
                    <div className="truncate text-white">
                      {new Date(event.start).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      {event.title}
                    </div>
                  </button>
                ))}

                {/* ✅ MOSTRAR INDICADOR SE TIVER MAIS DE 2 EVENTOS */}
                {hasMoreThan2Events && (
                  <button
                    onClick={() => onDayClick(day, events)} // ✅ ABRIR MODAL
                    className="w-full text-left p-1 rounded text-xs font-medium transition-all text-ouro-texto"
                  >
                    +{events.length - 2} mais evento
                    {events.length - 2 !== 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getEventColor(type: string, isFree: boolean): string {
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
