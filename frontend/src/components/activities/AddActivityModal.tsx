import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Activity, City, Trip } from '../../../../shared/types';
import { api } from '../../lib/api';
import { Modal, Button, Select, Input, useToast, Skeleton } from '../ui';
import { formatCost } from './ActivityCard';

interface AddActivityModalProps {
  activity: (Activity & { cities?: City }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  activity,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Fetch user's trips
  const { data: trips = [], isLoading: isTripsLoading } = useQuery({
    queryKey: ['user-trips'],
    queryFn: () => api.getUserTrips(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen && trips.length > 0) {
      const defaultTrip = trips.find((t) => t.id === selectedTripId) || trips[0];
      setSelectedTripId(defaultTrip.id);
      setScheduledDate(defaultTrip.start_date || new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, trips]);

  const addActivityMutation = useMutation({
    mutationFn: async () => {
      if (!activity || !selectedTripId) {
        throw new Error('Missing activity or trip selection');
      }

      // First check if trip has a stop for this city or any stop
      const selectedTrip = trips.find((t) => t.id === selectedTripId);
      if (!selectedTrip) throw new Error('Trip not found');

      // Create a stop if none exists or assign directly
      let stopId = `stop-${selectedTripId}-${activity.city_id || 'general'}`;
      if (activity.city_id) {
        try {
          const newStop = await api.addStop({
            trip_id: selectedTripId,
            city_id: activity.city_id,
            order_index: 0,
            arrival_date: scheduledDate || selectedTrip.start_date,
            departure_date: scheduledDate || selectedTrip.end_date,
          });
          stopId = newStop.id;
        } catch {
          // Continue with stop ID if stop exists
        }
      }

      return api.assignActivityToStop({
        stop_id: stopId,
        activity_id: activity.id,
        scheduled_date: scheduledDate,
        custom_cost: activity.cost ? Number(activity.cost) : undefined,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      const selectedTrip = trips.find((t) => t.id === selectedTripId);
      addToast(
        'success',
        'Activity Added to Trip!',
        `"${activity?.name}" was added to "${selectedTrip?.name || 'your itinerary'}".`
      );
      queryClient.invalidateQueries({ queryKey: ['trip-activities'] });
      queryClient.invalidateQueries({ queryKey: ['trip', selectedTripId] });
      onClose();
    },
    onError: (err: any) => {
      addToast('error', 'Failed to Add Activity', err.message || 'Error assigning activity.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addActivityMutation.mutate();
  };

  if (!activity) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add "${activity.name}" to Itinerary`}
      size="md"
    >
      {isTripsLoading ? (
        <div className="space-y-4 py-2">
          <Skeleton variant="rectangular" height={42} />
          <Skeleton variant="rectangular" height={42} />
        </div>
      ) : trips.length === 0 ? (
        <div className="py-4 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 mx-auto flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-bold text-white">No Trips Available</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              You need to create a trip first before scheduling activities.
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
            >
              Create Trip
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Summary Box */}
          <div className="flex items-center gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <img
              src={activity.image_url || ''}
              alt={activity.name}
              className="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0"
            />
            <div>
              <h4 className="text-sm font-bold text-white">{activity.name}</h4>
              <p className="text-xs text-slate-400">
                {activity.cities?.name} • Cost: {formatCost(activity.cost)} • Category: {activity.category}
              </p>
            </div>
          </div>

          {/* Trip Selector */}
          <Select
            label="Select Destination Trip"
            value={selectedTripId}
            onChange={(e) => {
              setSelectedTripId(e.target.value);
              const trip = trips.find((t) => t.id === e.target.value);
              if (trip) setScheduledDate(trip.start_date);
            }}
            options={trips.map((t: Trip) => ({
              label: `${t.name} (${t.start_date} to ${t.end_date})`,
              value: t.id,
            }))}
          />

          {/* Scheduled Date */}
          <Input
            type="date"
            label="Scheduled Date (Optional)"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase block mb-1.5">
              Personal Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring camera, booked ticket #1234..."
              rows={2}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={addActivityMutation.isPending}
            >
              Add Activity to Itinerary
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
