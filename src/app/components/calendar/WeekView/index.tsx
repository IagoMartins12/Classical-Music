import { Text } from '@/app/components/ui/Text';
// app/blog/calendar/components/WeekView.tsx
('use client');

interface WeekViewProps {
  days: Date[];
  getEventsForDay: (date: Date) => any[];
  onEventClick: (event: any) => void;
  weekdays: string[];
}

export default function WeekView({
  days,
  getEventsForDay,
  onEventClick,
  weekdays,
}: WeekViewProps) {
  const today = new Date();

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
      {/* Header */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 mb-4">
        {days.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();

          return (
            <div
              key={index}
              className={`text-center p-3 rounded-lg ${
                isToday
                  ? 'bg-ouro/10 border border-ouro/30'
                  : 'bg-theme-elevated'
              }`}
            >
              <Text papel="rotulo" tom="fraco" as="div">
                {weekdays[index]}
              </Text>
              <div
                className={`text-lg font-bold ${
                  isToday ? 'text-brand-primary' : 'text-theme-primary'
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Events */}
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, index) => {
          const events = getEventsForDay(day);

          return (
            <div key={index} className="space-y-2 min-h-96">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={`w-full text-left p-3 rounded-lg transition-all hover:scale-105 ${getEventColor(event.type, event.isFree)} text-white`}
                >
                  <div className="font-medium text-sm truncate">
                    {event.title}
                  </div>
                  <div className="text-xs opacity-75">
                    {formatEventTime(event.start, event.end)}
                  </div>
                  <div className="text-xs opacity-75 truncate">
                    {event.venue.name}
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getEventColor(type: string, isFree: boolean): string {
  if (isFree) return 'bg-ok';

  const colors: Record<string, string> = {
    OPERA: 'bg-ouro',
    RECITAL: 'bg-ouro',
    CHAMBER_MUSIC: 'bg-ok',
    CHOIR: 'bg-atencao',
    OPEN_REHEARSAL: 'bg-accent-gray',
    CONCERT: 'bg-aviso',
  };

  return colors[type] || 'bg-aviso';
}
