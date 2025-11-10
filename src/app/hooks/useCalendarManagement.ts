// ==================== app/hooks/useCalendarManagement.ts ====================
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function useCalendarManagement(onDataChange?: () => void) {
  // Event Management
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [deletingEvent, setDeletingEvent] = useState<any>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Venue Management
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [deletingVenue, setDeletingVenue] = useState<any>(null);
  const [isDeletingVenue, setIsDeletingVenue] = useState(false);

  // Event Actions
  const openCreateEventModal = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (event: any) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventSuccess = () => {
    closeEventModal();
    onDataChange?.();
  };

  const openDeleteEventModal = (event: any) => {
    setDeletingEvent(event);
  };

  const closeDeleteEventModal = () => {
    setDeletingEvent(null);
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;

    setIsDeletingEvent(true);

    try {
      const response = await fetch(`/api/events/${deletingEvent.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Evento deletado com sucesso!', { icon: '🗑️' });
        closeDeleteEventModal();
        onDataChange?.();
      } else {
        toast.error(data.error || 'Erro ao deletar evento');
      }
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      toast.error('Erro ao deletar evento');
    } finally {
      setIsDeletingEvent(false);
    }
  };

  // Venue Actions
  const openCreateVenueModal = () => {
    setEditingVenue(null);
    setIsVenueModalOpen(true);
  };

  const openEditVenueModal = (venue: any) => {
    setEditingVenue(venue);
    setIsVenueModalOpen(true);
  };

  const closeVenueModal = () => {
    setIsVenueModalOpen(false);
    setEditingVenue(null);
  };

  const handleVenueSuccess = () => {
    closeVenueModal();
    onDataChange?.();
  };

  const openDeleteVenueModal = (venue: any) => {
    setDeletingVenue(venue);
  };

  const closeDeleteVenueModal = () => {
    setDeletingVenue(null);
  };

  const handleDeleteVenue = async () => {
    if (!deletingVenue) return;

    setIsDeletingVenue(true);

    try {
      const response = await fetch(`/api/venues/${deletingVenue.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Local deletado com sucesso!', { icon: '🗑️' });
        closeDeleteVenueModal();
        onDataChange?.();
      } else {
        toast.error(data.error || 'Erro ao deletar local');
      }
    } catch (error) {
      console.error('Erro ao deletar local:', error);
      toast.error('Erro ao deletar local');
    } finally {
      setIsDeletingVenue(false);
    }
  };

  return {
    // Event state
    isEventModalOpen,
    editingEvent,
    deletingEvent,
    isDeletingEvent,

    // Event actions
    openCreateEventModal,
    openEditEventModal,
    closeEventModal,
    handleEventSuccess,
    openDeleteEventModal,
    closeDeleteEventModal,
    handleDeleteEvent,

    // Venue state
    isVenueModalOpen,
    editingVenue,
    deletingVenue,
    isDeletingVenue,

    // Venue actions
    openCreateVenueModal,
    openEditVenueModal,
    closeVenueModal,
    handleVenueSuccess,
    openDeleteVenueModal,
    closeDeleteVenueModal,
    handleDeleteVenue,
  };
}
