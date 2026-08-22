import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stop, City, Activity } from '../../../../shared/types';
import { api } from '../../lib/api';
import { Modal, Button, Input, Select, Badge, useToast, Skeleton } from '../ui';
import { useDebounce } from '../../hooks/useDebounce';
import { ALL_CATEGORIES } from '../activities/ActivityFilterPanel';
import { formatCost, formatDuration, getCategoryBadgeVariant } from '../activities/ActivityCard';

interface AddActivityToStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  stop: (Stop & { cities?: City }) | null;
  tripId: string;
}

export const AddActivityToStopModal: React.FC<AddActivityToStopModalProps> = ({
  isOpen,
  onClose,
  stop,
  tripId,
}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>(stop?.arrival_date || '');
  const [scheduledTime, setScheduledTime] = useState<string>('10:00');
  const [customCost, setCustomCost] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');

  const debouncedSearch = useDebounce(searchTerm, 250);

  // Sync scheduled date when stop changes
  React.useEffect(() => {
    if (stop && isOpen) {
      setScheduledDate(stop.arrival_date);
      setSelectedActivity(null);
      setDateError('');
      setNotes('');
      setCustomCost('');
    }
  }, [stop, isOpen]);

  // Fetch activities filtered to this stop's city
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['stop-city-activities', stop?.city_id, debouncedSearch, selectedCategory],
    queryFn: () =>
      api.searchActivities({
        cityId: stop?.city_id || undefined,
        q: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        limit: 40,
      }),
    enabled: isOpen && Boolean(stop?.city_id),
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!stop) throw new Error('Missing stop');
      if (!selectedActivity) throw new Error('Please select an activity');

      if (scheduledDate) {
        if (scheduledDate < stop.arrival_date || scheduledDate > stop.departure_date) {
          throw new Error(
            `Scheduled date (${scheduledDate}) must be within stay dates (${stop.arrival_date} to ${stop.departure_date})`
          );
        }
      }

      return api.assignActivityToStop({
        stop_id: stop.id,
        activity_id: selectedActivity.id,
        scheduled_date: scheduledDate || undefined,
        scheduled_time: scheduledTime || undefined,
        custom_cost: customCost ? parseFloat(customCost) : undefined,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      addToast(
        'success',
        'Activity Added!',
        `"${selectedActivity?.name}" was added to ${stop?.cities?.name || 'this stop'}.`
      );
      queryClient.invalidateQueries({ queryKey: ['stop-activities', stop?.id] });
      queryClient.invalidateQueries({ queryKey: ['trip-stops', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      onClose();
    },
    onError: (err: any) => {
      setDateError(err.message || 'Failed to add activity.');
    },
  });

  const handleDateChange = (newDate: string) => {
    setScheduledDate(newDate);
    if (stop && newDate) {
      if (newDate < stop.arrival_date || newDate > stop.departure_date) {
        setDateError(
          `Date must be between ${stop.arrival_date} and ${stop.departure_date}`
        );
      } else {
        setDateError('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) {
      setDateError('Please select an activity from the list.');
      return;
    }
    if (stop && scheduledDate) {
      if (scheduledDate < stop.arrival_date || scheduledDate > stop.departure_date) {
        setDateError(
          `Scheduled date must fall within ${stop.arrival_date} to ${stop.departure_date}`
        );
        return;
      }
    }
    assignMutation.mutate();
  };

  if (!stop) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Activity in ${stop.cities?.name || 'Destination'}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Destination Header Banner */}
        <div className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-bold text-white">📍 {stop.cities?.name}</span>
            <span>({stop.cities?.country})</span>
          </div>
          <div className="text-teal-400 font-semibold">
            Stay window: {stop.arrival_date} → {stop.departure_date}
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activities in city..."
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Activity Selection List */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Select Activity {selectedActivity && <span className="text-teal-400 font-bold">• 1 Selected</span>}
          </label>

          <div className="max-h-48 overflow-y-auto border border-slate-800 bg-slate-950/80 rounded-xl p-2 space-y-2">
            {isLoading ? (
              <div className="space-y-2 p-2">
                <Skeleton variant="rectangular" height={36} />
                <Skeleton variant="rectangular" height={36} />
                <Skeleton variant="rectangular" height={36} />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No activities found matching your search.
              </div>
            ) : (
              activities.map((act) => {
                const isSelected = selectedActivity?.id === act.id;
                return (
                  <div
                    key={act.id}
                    onClick={() => {
                      setSelectedActivity(act);
                      if (!customCost) setCustomCost(act.cost ? String(act.cost) : '0');
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-500/20 border-teal-500/60 ring-1 ring-teal-500/40'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={act.image_url || ''}
                        alt={act.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white truncate">{act.name}</h5>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="capitalize">{act.category}</span>
                          <span>•</span>
                          <span>{formatDuration(act.duration_minutes)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-emerald-400">{formatCost(act.cost)}</span>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isSelected ? '✓' : '+'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Scheduling Details (Date bounded to stop window) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <div>
            <Input
              type="date"
              label="Scheduled Date"
              value={scheduledDate}
              min={stop.arrival_date}
              max={stop.departure_date}
              onChange={(e) => handleDateChange(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              type="time"
              label="Scheduled Time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          <div>
            <Input
              type="number"
              label="Cost ($ USD)"
              placeholder="e.g. 25"
              value={customCost}
              onChange={(e) => setCustomCost(e.target.value)}
            />
          </div>
        </div>

        {dateError && (
          <div className="p-2.5 bg-rose-500/15 border border-rose-500/40 rounded-lg text-xs text-rose-300 font-medium">
            ⚠️ {dateError}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide block mb-1">
            Notes / Booking info (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Reservation under John, meet at North Gate"
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={assignMutation.isPending}
            disabled={!selectedActivity || Boolean(dateError)}
          >
            Add to Itinerary Stop
          </Button>
        </div>
      </form>
    </Modal>
  );
};
