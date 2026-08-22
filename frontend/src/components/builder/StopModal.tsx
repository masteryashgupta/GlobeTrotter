import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stop, City } from '../../../../shared/types';
import { api } from '../../lib/api';
import { Modal, Button, Input, Select, useToast } from '../ui';
import { useDebounce } from '../../hooks/useDebounce';

interface StopModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  editingStop: (Stop & { cities?: City }) | null;
  tripStartDate?: string;
  tripEndDate?: string;
  onSuccess?: () => void;
}

export const StopModal: React.FC<StopModalProps> = ({
  isOpen,
  onClose,
  tripId,
  editingStop,
  tripStartDate,
  tripEndDate,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [citySearch, setCitySearch] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [arrivalDate, setArrivalDate] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const debouncedCitySearch = useDebounce(citySearch, 250);

  // Fetch cities for autocomplete / dropdown
  const { data: cities = [] } = useQuery({
    queryKey: ['cities-autocomplete', debouncedCitySearch],
    queryFn: () => api.searchCities({ q: debouncedCitySearch || undefined, limit: 30 }),
    enabled: isOpen,
    staleTime: 1000 * 60 * 10,
  });

  // Pre-fill form when editing or opening
  useEffect(() => {
    if (isOpen) {
      if (editingStop) {
        setSelectedCityId(editingStop.city_id || '');
        setCitySearch(editingStop.cities?.name || '');
        setArrivalDate(editingStop.arrival_date);
        setDepartureDate(editingStop.departure_date);
      } else {
        setSelectedCityId('');
        setCitySearch('');
        setArrivalDate(tripStartDate || new Date().toISOString().split('T')[0]);
        setDepartureDate(tripEndDate || new Date().toISOString().split('T')[0]);
      }
      setFormError('');
    }
  }, [isOpen, editingStop, tripStartDate, tripEndDate]);

  // Mutation for adding or editing a stop
  const stopMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCityId) {
        throw new Error('Please select a destination city.');
      }
      if (!arrivalDate || !departureDate) {
        throw new Error('Please enter both arrival and departure dates.');
      }
      if (arrivalDate > departureDate) {
        throw new Error('Departure date must be on or after arrival date.');
      }

      if (editingStop) {
        // Edit existing stop
        return api.updateStop(editingStop.id, {
          city_id: selectedCityId,
          arrival_date: arrivalDate,
          departure_date: departureDate,
        });
      } else {
        // Create new stop
        return api.addTripStop(tripId, {
          city_id: selectedCityId,
          arrival_date: arrivalDate,
          departure_date: departureDate,
        });
      }
    },
    onSuccess: (savedStop) => {
      const isEdit = Boolean(editingStop);
      addToast(
        'success',
        isEdit ? 'Stop Updated' : 'Stop Added to Itinerary',
        isEdit
          ? 'The stop dates and details were updated successfully.'
          : `${savedStop.cities?.name || 'City'} has been added to your itinerary.`
      );

      queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      // Surface backend's exact business rule error (e.g. overlap details)
      setFormError(err.message || 'Failed to save stop.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    stopMutation.mutate();
  };

  const isEditMode = Boolean(editingStop);
  const selectedCityObj = cities.find((c) => c.id === selectedCityId) || editingStop?.cities;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Itinerary Stop' : 'Add Destination Stop'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {/* Error Alert Box (Surfaces Overlap & Business Rule Rejections) */}
        {formError && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-start gap-2.5 animate-fadeIn">
            <svg className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <span className="font-bold block mb-0.5">Scheduling Conflict</span>
              <span>{formError}</span>
            </div>
          </div>
        )}

        {/* City Autocomplete & Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1A1523] tracking-wide uppercase">
            Destination City
          </label>
          <div className="relative">
            <input
              type="text"
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setSelectedCityId('');
              }}
              placeholder="Search city (e.g. Tokyo, Rome, Paris)..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#E9E4F5] rounded-lg text-sm text-[#1A1523] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] shadow-sm transition-all"
            />
          </div>

          {/* City Selection Pills / Dropdown Options */}
          {cities.length > 0 && !selectedCityId && citySearch && (
            <div className="max-h-40 overflow-y-auto bg-white border border-[#E9E4F5] rounded-xl p-1.5 space-y-1 shadow-lg z-20">
              {cities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => {
                    setSelectedCityId(city.id);
                    setCitySearch(`${city.name}, ${city.country}`);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-xs text-[#6B7280] hover:text-[#1A1523] hover:bg-[#F7F5FC] text-left transition-colors"
                >
                  <span className="font-bold text-[#1A1523]">{city.name}</span>
                  <span className="text-[#6B7280]">{city.country} • {city.region}</span>
                </button>
              ))}
            </div>
          )}

          {selectedCityObj && (
            <div className="flex items-center gap-2.5 p-2 bg-[#7C3AED]/10 border border-[#C4B5FD]/40 rounded-lg text-xs text-[#5B21B6]">
              <span className="font-bold">{selectedCityObj.name}</span>
              <span className="text-[#6B7280]">({selectedCityObj.country})</span>
              <span className="ml-auto text-[11px] text-[#7C3AED] font-semibold">✓ Selected</span>
            </div>
          )}
        </div>

        {/* Stay Date Range Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Input
            type="date"
            label="Arrival Date"
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
            required
          />
          <Input
            type="date"
            label="Departure Date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            required
          />
        </div>

        {tripStartDate && tripEndDate && (
          <p className="text-[11px] text-[#6B7280]">
            Trip duration: {tripStartDate} to {tripEndDate}
          </p>
        )}

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-[#E9E4F5] flex justify-end gap-2.5">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={stopMutation.isPending}
            disabled={!selectedCityId || !arrivalDate || !departureDate}
          >
            {isEditMode ? 'Save Changes' : 'Add Stop'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
