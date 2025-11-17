// ==================== app/blog/calendar/pageClient.tsx (ATUALIZADO) ====================
'use client';

import { useState, useCallback } from 'react';
import { CalendarPageData } from './pageServer';
import CustomCalendar from '@/app/components/calendar/CustomCalendar';
import EventModal from '@/app/components/calendar/EventModal';
import CalendarFilters from '@/app/components/calendar/CalendarFilters';
import CreateEventModal from '@/app/components/calendar/CreateEventModal';
import CreateVenueModal from '@/app/components/calendar/CreateVenueModal';
import ConfirmDeleteEventModal from '@/app/components/calendar/ConfirmDeleteEventModal';
import ConfirmDeleteVenueModal from '@/app/components/calendar/ConfirmDeleteVenueModal';
import { FiCalendar, FiPlus, FiMapPin, FiSearch } from 'react-icons/fi';
import { PageContainer } from '@/app/components/animation/AnimatedComponents';
import { useCalendarManagement } from '@/app/hooks/useCalendarManagement';
import { useAuth } from '@/app/hooks/useAuth';
import EventScraperModal from '@/app/components/blog/EventScraperModal';
import DayEventsListModal from '@/app/components/calendar/DayEventsListModal';

interface CalendarPageClientProps {
  initialData: CalendarPageData;
}

export default function CalendarPageClient({
  initialData,
}: CalendarPageClientProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 2;

  const [events, setEvents] = useState(initialData.events);
  const [venues, setVenues] = useState(initialData.filters.venues);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Filtros
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const [isDayEventsModalOpen, setIsDayEventsModalOpen] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([]);

  // Calendar Management Hook
  const calendarManagement = useCalendarManagement(fetchEvents);

  // ✅ NOVO: Handler para clicar no dia
  const handleDayClick = (date: Date, events: any[]) => {
    setSelectedDayDate(date);
    setSelectedDayEvents(events);
    setIsDayEventsModalOpen(true);
  };

  // Carregar eventos quando mudar período ou filtros
  async function fetchEvents(start?: Date, end?: Date) {
    setIsLoading(true);
    try {
      const now = new Date();
      const startDate =
        start || new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = end || new Date(now.getFullYear(), now.getMonth() + 2, 0);

      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });

      if (selectedCity) params.append('city', selectedCity);
      if (selectedState) params.append('state', selectedState);
      if (selectedVenue) params.append('venueId', selectedVenue);
      if (selectedType) params.append('type', selectedType);

      const response = await fetch(`/api/blog/calendar?${params}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);

        // Atualizar venues também se necessário
        if (data.filters?.venues) {
          setVenues(data.filters.venues);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchEventsCallback = useCallback(
    (start: Date, end: Date) => {
      fetchEvents(start, end);
    },
    [selectedCity, selectedState, selectedVenue, selectedType]
  );

  // Abrir modal ao clicar no evento
  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Ações do EventModal
  const handleEventEdit = () => {
    setIsModalOpen(false);
    calendarManagement.openEditEventModal(selectedEvent);
  };

  const handleEventDelete = () => {
    setIsModalOpen(false);
    calendarManagement.openDeleteEventModal(selectedEvent);
  };

  return (
    <PageContainer showBackground={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 py-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
              <FiCalendar className="w-8 h-8 text-theme-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
            Calendário de Eventos
          </h1>
          <p className="text-xl text-theme-secondary classical-subtitle">
            Descubra eventos de música clássica em todo o Brasil
          </p>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="mb-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={calendarManagement.openCreateEventModal}
              className="btn-classical-primary flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Novo Evento</span>
            </button>
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="btn-classical-secondary flex items-center space-x-2"
            >
              <FiSearch className="w-4 h-4" />
              <span>Buscar Eventos (Scraper)</span>
            </button>

            <button
              onClick={calendarManagement.openCreateVenueModal}
              className="btn-classical-secondary flex items-center space-x-2"
            >
              <FiMapPin className="w-4 h-4" />
              <span>Novo Local</span>
            </button>
          </div>
        )}

        {/* Filtros */}
        <CalendarFilters
          cities={initialData.filters.cities}
          states={initialData.filters.states}
          venues={venues}
          selectedCity={selectedCity}
          selectedState={selectedState}
          selectedVenue={selectedVenue}
          selectedType={selectedType}
          onCityChange={setSelectedCity}
          onStateChange={setSelectedState}
          onVenueChange={setSelectedVenue}
          onTypeChange={setSelectedType}
        />

        {/* Calendário */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          <CustomCalendar
            events={events}
            onEventClick={handleEventClick}
            onDateChange={fetchEventsCallback}
            onDayClick={handleDayClick} // ✅ PASSAR HANDLER
          />
        </div>

        {/* Legenda */}
        <EventLegend />
        {selectedDayDate && (
          <DayEventsListModal
            isOpen={isDayEventsModalOpen}
            onClose={() => {
              setIsDayEventsModalOpen(false);
              setSelectedDayDate(null);
              setSelectedDayEvents([]);
            }}
            date={selectedDayDate}
            events={selectedDayEvents}
            onEventClick={handleEventClick} // ✅ Abrir EventModal
          />
        )}
        {/* Event Modal */}
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onEdit={isAdmin ? handleEventEdit : undefined}
          onDelete={isAdmin ? handleEventDelete : undefined}
        />

        {/* Create/Edit Event Modal */}
        <CreateEventModal
          isOpen={calendarManagement.isEventModalOpen}
          onClose={calendarManagement.closeEventModal}
          onSuccess={calendarManagement.handleEventSuccess}
          venues={venues}
          editingEvent={calendarManagement.editingEvent}
        />
        <EventScraperModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSuccess={fetchEvents}
        />
        {/* Create/Edit Venue Modal */}
        <CreateVenueModal
          isOpen={calendarManagement.isVenueModalOpen}
          onClose={calendarManagement.closeVenueModal}
          onSuccess={calendarManagement.handleVenueSuccess}
          editingVenue={calendarManagement.editingVenue}
        />

        {/* Delete Event Modal */}
        <ConfirmDeleteEventModal
          isOpen={!!calendarManagement.deletingEvent}
          onClose={calendarManagement.closeDeleteEventModal}
          onConfirm={calendarManagement.handleDeleteEvent}
          isLoading={calendarManagement.isDeletingEvent}
          eventTitle={calendarManagement.deletingEvent?.title || ''}
        />

        {/* Delete Venue Modal */}
        <ConfirmDeleteVenueModal
          isOpen={!!calendarManagement.deletingVenue}
          onClose={calendarManagement.closeDeleteVenueModal}
          onConfirm={calendarManagement.handleDeleteVenue}
          isLoading={calendarManagement.isDeletingVenue}
          venueName={calendarManagement.deletingVenue?.name || ''}
          eventCount={calendarManagement.deletingVenue?._count?.events}
        />
      </div>
    </PageContainer>
  );
}

// Componente: Legenda de Cores
function EventLegend() {
  const legendItems = [
    { color: 'bg-green-500', label: 'Gratuito', icon: '🎁' },
    { color: 'bg-blue-500', label: 'Concerto', icon: '🎼' },
    { color: 'bg-purple-500', label: 'Ópera', icon: '🎭' },
    { color: 'bg-pink-500', label: 'Recital', icon: '🎹' },
    { color: 'bg-emerald-500', label: 'Câmara', icon: '🎻' },
    { color: 'bg-amber-500', label: 'Coral', icon: '🎤' },
    { color: 'bg-gray-500', label: 'Ensaio', icon: '📝' },
  ];

  return (
    <div className="mt-6 classical-card-simple rounded-lg shadow-md p-6">
      <h4 className="text-sm font-semibold mb-4 flex items-center">
        <span className="mr-2">🎨</span>
        Legenda de Cores
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
        {legendItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center space-x-2 p-2 rounded-lg transition-colors"
          >
            <div className={`w-4 h-4 rounded ${item.color} flex-shrink-0`} />
            <span className="text-sm truncate">
              {item.icon} {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
