// app/blog/calendar/components/CalendarFilters.tsx

'use client';

import Button from '../../Common/Button';
import Select from '../../Common/Select';

interface CalendarFiltersProps {
  cities: string[];
  states: string[];
  venues: Array<{ id: string; name: string; city: string }>;
  selectedCity: string;
  selectedState: string;
  selectedVenue: string;
  selectedType: string;
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
  onVenueChange: (venueId: string) => void;
  onTypeChange: (type: string) => void;
}

const EVENT_TYPES = [
  { value: '', label: 'Todos os tipos' },
  { value: 'CONCERT', label: 'Concerto' },
  { value: 'RECITAL', label: 'Recital' },
  { value: 'OPERA', label: 'Ópera' },
  { value: 'CHAMBER_MUSIC', label: 'Música de Câmara' },
  { value: 'CHOIR', label: 'Coral' },
  { value: 'OPEN_REHEARSAL', label: 'Ensaio Aberto' },
  { value: 'MATINEE', label: 'Matinal' },
];

export default function CalendarFilters({
  cities,
  states,
  venues,
  selectedCity,
  selectedState,
  selectedVenue,
  selectedType,
  onCityChange,
  onStateChange,
  onVenueChange,
  onTypeChange,
}: CalendarFiltersProps) {
  const handleClearFilters = () => {
    onCityChange('');
    onStateChange('');
    onVenueChange('');
    onTypeChange('');
  };

  const hasActiveFilters =
    selectedCity || selectedState || selectedVenue || selectedType;

  // Filtrar venues por estado/cidade selecionados
  const filteredVenues = venues.filter((venue) => {
    if (selectedState && venue.city && !cities.includes(venue.city)) {
      return false;
    }
    if (selectedCity && venue.city !== selectedCity) {
      return false;
    }
    return true;
  });

  return (
    <div className="rounded-lg classical-card-2 shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold ">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-sm"
          >
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro de Estado */}
        <Select
          label="Estado"
          id="state-filter"
          value={selectedState}
          options={[
            { value: '', label: 'Todos os estados' },
            ...states.map((state) => ({ value: state, label: state })),
          ]}
          onChange={(e) => {
            onStateChange(e.target.value);
            onCityChange('');
            onVenueChange('');
          }}
        />

        {/* Filtro de Cidade */}
        <Select
          label="Cidade"
          id="city-filter"
          value={selectedCity}
          disabled={!selectedState && cities.length > 20}
          options={[
            { value: '', label: 'Todas as cidades' },
            ...cities.map((city) => ({ value: city, label: city })),
          ]}
          onChange={(e) => {
            onCityChange(e.target.value);
            onVenueChange('');
          }}
        />

        {/* Filtro de Local */}
        <Select
          label="Local"
          id="venue-filter"
          value={selectedVenue}
          onChange={(e) => onVenueChange(e.target.value)}
          options={[
            { value: '', label: 'Todos os locais' },
            ...filteredVenues.map((venue) => ({
              value: venue.id,
              label: `${venue.name} (${venue.city})`,
            })),
          ]}
        />

        {/* Filtro de Tipo */}
        <Select
          label="Tipo de Evento"
          id="type-filter"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          options={EVENT_TYPES.map((type) => ({
            value: type.value,
            label: type.label,
          }))}
        />
      </div>

      {/* Resumo de filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedState && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Estado: {selectedState}
            </span>
          )}
          {selectedCity && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Cidade: {selectedCity}
            </span>
          )}
          {selectedVenue && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Local: {venues.find((v) => v.id === selectedVenue)?.name || 'N/A'}
            </span>
          )}
          {selectedType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
              Tipo:{' '}
              {EVENT_TYPES.find((t) => t.value === selectedType)?.label ||
                'N/A'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
