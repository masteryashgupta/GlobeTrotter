import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { City, Trip } from '../../../../shared/types';
import { api } from '../../lib/api';
import { Modal, Button, Select, Input, useToast, Skeleton } from '../ui';

interface AddToTripModalProps {
  city: City | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddToTripModal: React.FC<AddToTripModalProps> = ({ city, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [arrivalDate, setArrivalDate] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');

  // Fetch user's trips
  const {
    data: trips = [],
    isLoading: isTripsLoading,
    refetch,
  } = useQuery({
    queryKey: ['user-trips'],
    queryFn: () => api.getUserTrips(),
    enabled: isOpen,
  });

  // When trips load or modal opens, select first trip by default and preset dates
  useEffect(() => {
    if (isOpen && trips.length > 0) {
      const defaultTrip = trips.find((t) => t.id === selectedTripId) || trips[0];
      setSelectedTripId(defaultTrip.id);
      setArrivalDate(defaultTrip.start_date || new Date().toISOString().split('T')[0]);
      setDepartureDate(defaultTrip.end_date || new Date().toISOString().split('T')[0]);
      setDateError('');
    }
  }, [isOpen, trips]);

  // When selected trip changes, adjust default dates
  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      setArrivalDate(trip.start_date);
      setDepartureDate(trip.end_date);
    }
  };

  // Add stop mutation
  const addStopMutation = useMutation({
    mutationFn: async () => {
      if (!city || !selectedTripId) throw new Error('Missing city or trip');
      if (new Date(arrivalDate) > new Date(departureDate)) {
        throw new Error('Departure date must be on or after arrival date');
      }

      return api.addStop({
        trip_id: selectedTripId,
        city_id: city.id,
        order_index: 0,
        arrival_date: arrivalDate,
        departure_date: departureDate,
      });
    },
    onSuccess: () => {
      const selectedTrip = trips.find((t) => t.id === selectedTripId);
      addToast(
        'success',
        'Stop Added to Itinerary!',
        `${city?.name} was successfully added to "${selectedTrip?.name || 'your trip'}".`
      );
      queryClient.invalidateQueries({ queryKey: ['trip-stops', selectedTripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', selectedTripId] });
      onClose();
    },
    onError: (err: any) => {
      addToast('error', 'Failed to Add Stop', err.message || 'An error occurred while adding stop.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arrivalDate || !departureDate) {
      setDateError('Please select both arrival and departure dates.');
      return;
    }
    if (new Date(arrivalDate) > new Date(departureDate)) {
      setDateError('Departure date cannot be before arrival date.');
      return;
    }
    setDateError('');
    addStopMutation.mutate();
  };

  if (!city) return null;

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add ${city.name} to Trip`}
      size="md"
    >
      {isTripsLoading ? (
        <div className="space-y-4 py-2">
          <Skeleton variant="rectangular" height={42} />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton variant="rectangular" height={42} />
            <Skeleton variant="rectangular" height={42} />
          </div>
        </div>
      ) : trips.length === 0 ? (
        <div className="py-4 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 mx-auto flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-bold text-white">No Trips Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              You don't have any trips created yet. Create a trip first to start adding destinations to your itinerary!
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                navigate('/trips/new');
              }}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Create New Trip
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destination Summary Banner */}
          <div className="flex items-center gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <img
              src={city.image_url || ''}
              alt={city.name}
              className="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0"
            />
            <div>
              <h4 className="text-sm font-bold text-white">{city.name}</h4>
              <p className="text-xs text-slate-400">
                {city.country} • {city.region} • Popularity: {city.popularity}%
              </p>
            </div>
          </div>

          {/* Trip Selector */}
          <Select
            label="Select Destination Trip"
            value={selectedTripId}
            onChange={(e) => handleTripChange(e.target.value)}
            options={trips.map((t: Trip) => ({
              label: `${t.name} (${t.start_date} to ${t.end_date})`,
              value: t.id,
            }))}
          />

          {selectedTrip && (
            <div className="text-[11px] text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/20">
              Trip window: {selectedTrip.start_date} → {selectedTrip.end_date}
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {dateError && <p className="text-xs text-rose-400 font-medium">{dateError}</p>}

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={addStopMutation.isPending}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              Add Stop to Itinerary
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
