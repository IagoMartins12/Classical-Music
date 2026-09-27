// app/blog/calendar/components/EventModal.tsx

'use client';

import Image from '@/app/components/SmartImage';
import Link from 'next/link';

import Button from '../../Common/Button';
import Modal from '../../Modal';
import {
  PiCalendarBlank,
  PiClock,
  PiMapPin,
  PiMusicNotes,
  PiNotePencil,
  PiTicket,
  PiTrash,
  PiUsersThree,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';

interface EventModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void; // 🆕 Adicionar
  onDelete?: () => void; // 🆕 Adicionar
}

export default function EventModal({
  event,
  isOpen,
  onClose,
  onDelete,
  onEdit,
}: EventModalProps) {
  if (!event) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      CONCERT: 'Concerto',
      RECITAL: 'Recital',
      OPERA: 'Ópera',
      CHAMBER_MUSIC: 'Música de Câmara',
      CHOIR: 'Coral',
      OPEN_REHEARSAL: 'Ensaio Aberto',
      MATINEE: 'Matinal',
    };
    return types[type] || type;
  };

  // Função reutilizável
  function formatEventText(text: string) {
    return (
      text
        // Quebra antes de nomes de compositores/obras escritos em MAIÚSCULAS
        .replace(
          /([A-ZÁÉÍÓÚÃÕÇ][A-ZÁÉÍÓÚÃÕÇ\s'\-]+(?:\s+[A-ZÁÉÍÓÚÃÕÇ][a-záéíóúãõç'\-]+)*)(?=\s+[A-ZÁÉÍÓÚÃÕÇ])/g,
          '\n\n$1'
        )
        // Quebra quando duas obras estão grudadas sem espaço
        .replace(/([a-z,\]])([A-ZÁÉÍÓÚÃÕÇ])/g, '$1\n\n$2')
        .trim()
    );
  }
  console.log('EVENTO', event);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.title} maxWidth="lg">
      <div className="space-y-6">
        {/* Imagem do Evento */}
        {event.imageUrl && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Informações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data e Hora */}
          <div className="flex items-start space-x-3">
            <PiCalendarBlank className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium ">Data</p>
              <p className="text-base capitalize">{formatDate(event.start)}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <PiClock className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium ">Horário</p>
              <p className="text-base ">
                {formatTime(event.start)}
                {event.end && ` - ${formatTime(event.end)}`}
              </p>
            </div>
          </div>

          {/* Local */}
          <div className="flex items-start space-x-3">
            <PiMapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold ">Local</p>
              <p className="text-base ">{event.venue.name}</p>
              <p className="text-sm ">
                {event.venue.city}, {event.venue.state}
              </p>
            </div>
          </div>

          {/* Tipo de Evento */}
          <div className="flex items-start space-x-3">
            <PiMusicNotes className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium ">Tipo</p>
              <p className="text-base ">{getEventTypeLabel(event.type)}</p>
            </div>
          </div>
        </div>

        {/* Badge de Gratuito */}
        {event.isFree && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <PiTicket className="w-4 h-4 mr-1" />
            Entrada Gratuita
          </div>
        )}

        {/* Compositores */}
        {event.composers && event.composers.length > 0 && (
          <Stack gap={3}>
            <Inline gap={2}>
              <PiUsersThree className="w-5 h-5 " />
              <h4 className="text-sm font-semibold ">Compositores</h4>
            </Inline>
            <div className="flex flex-wrap gap-3">
              {event.composers.map((composer: any) => (
                <Link
                  key={composer.id}
                  href={`/composer/${composer.id}`}
                  className="flex items-center space-x-2 px-3 py-2 classical-card-simple rounded-lg  transition-colors"
                >
                  {composer.portraitUrl ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={composer.portraitUrl}
                        alt={composer.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <PiMusicNotes className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <span className="text-sm font-medium ">{composer.name}</span>
                </Link>
              ))}
            </div>
          </Stack>
        )}

        {/* Descrição */}
        {event.description && (
          <Stack gap={2}>
            <h4 className="text-sm font-semibold">Sobre o Evento</h4>
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {formatEventText(event.description)}
            </p>
          </Stack>
        )}
        {/* Programa */}
        {event.program && (
          <Stack gap={2}>
            <h4 className="text-sm font-semibold">Programa</h4>
            <div className="bg-theme-tertiary rounded-lg p-4">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {formatEventText(
                  typeof event.program === 'string'
                    ? event.program
                    : JSON.stringify(event.program, null, 2)
                )}
              </p>
            </div>
          </Stack>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-linha">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            leftIcon={<PiTicket className="w-5 h-5 mr-2" />}
            onClick={() => window.open(event.externalUrl, '_blank')}
          >
            Ver evento no site
          </Button>

          {event.ticketUrl ? (
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              leftIcon={<PiTicket className="w-5 h-5 mr-2" />}
              onClick={() => window.open(event.ticketUrl, '_blank')}
            >
              {event.isFree ? 'Retirar Ingresso' : 'Comprar Ingresso'}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              leftIcon={<PiTicket className="w-5 h-5 mr-2" />}
              disabled
            >
              Ingressos em breve
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="sm:w-auto"
          >
            Fechar
          </Button>
        </div>

        {(onEdit || onDelete) && (
          <div className="px-6 py-4 gap-4 border-t border-theme-secondary flex items-center justify-between">
            <Button
              onClick={onDelete}
              className="w-full"
              variant="delete"
              leftIcon={<PiTrash className="w-4 h-4" />}
            >
              <span>Deletar</span>
            </Button>
            <Button
              className="w-full"
              onClick={onEdit}
              leftIcon={<PiNotePencil className="w-4 h-4" />}
            >
              <span>Editar</span>
            </Button>
          </div>
        )}

        {/* Adicionar ao Calendário */}
        <div className="text-center">
          <button
            className="text-sm text-blue-400 hover:text-blue-700 hover:underline"
            onClick={() => {
              // TODO: Implementar adição ao Google Calendar
              const title = encodeURIComponent(event.title);
              const startDate = new Date(event.start)
                .toISOString()
                .replace(/-|:|\.\d\d\d/g, '');
              const endDate = new Date(event.end)
                .toISOString()
                .replace(/-|:|\.\d\d\d/g, '');
              const details = encodeURIComponent(event.description || '');
              const location = encodeURIComponent(
                `${event.venue.name}, ${event.venue.city}`
              );

              const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
              window.open(url, '_blank');
            }}
          >
            <PiCalendarBlank className="w-4 h-4 inline-block mr-1" />
            Adicionar ao Google Calendar
          </button>
        </div>
      </div>
    </Modal>
  );
}
